package application

import (
	"context"
	"errors"

	"fork-and-shaker/internal/domain/entity"
	"fork-and-shaker/internal/domain/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var (
	ErrRecipeNotFound = errors.New("recipe not found")
	ErrInvalidRecipe  = errors.New("invalid recipe data")
	ErrUnauthorized   = errors.New("unauthorized")
)

// RecipeService handles the business logic for recipes
type RecipeService struct {
	recipeRepo repository.RecipeRepository
}

// NewRecipeService creates a new RecipeService
func NewRecipeService(recipeRepo repository.RecipeRepository) *RecipeService {
	return &RecipeService{
		recipeRepo: recipeRepo,
	}
}

// CreateRecipe creates a new recipe
func (s *RecipeService) CreateRecipe(ctx context.Context, name, description string, 
	ingredients []entity.Ingredient, instructions []string, glass, garnish string) (*entity.Recipe, error) {
	
	recipe := entity.NewRecipe(name, entity.RecipeTypeCocktail, description, 
		ingredients, instructions, glass, garnish)

	if !recipe.Validate() {
		return nil, ErrInvalidRecipe
	}

	err := s.recipeRepo.Create(ctx, recipe)
	if err != nil {
		return nil, err
	}

	return recipe, nil
}

// GetRecipeByID retrieves a recipe by ID
func (s *RecipeService) GetRecipeByID(ctx context.Context, id primitive.ObjectID) (*entity.Recipe, error) {
	recipe, err := s.recipeRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if recipe == nil {
		return nil, ErrRecipeNotFound
	}
	return recipe, nil
}

// GetCocktailRecipes retrieves all cocktail recipes
func (s *RecipeService) GetCocktailRecipes(ctx context.Context) ([]*entity.Recipe, error) {
	return s.recipeRepo.FindByType(ctx, entity.RecipeTypeCocktail)
}

// UpdateRecipe updates a recipe
func (s *RecipeService) UpdateRecipe(ctx context.Context, id primitive.ObjectID, 
	name, description string, ingredients []entity.Ingredient, 
	instructions []string, glass, garnish string) (*entity.Recipe, error) {
	
	recipe, err := s.GetRecipeByID(ctx, id)
	if err != nil {
		return nil, err
	}

	recipe.Update(name, description, ingredients, instructions, glass, garnish)
	
	if !recipe.Validate() {
		return nil, ErrInvalidRecipe
	}

	err = s.recipeRepo.Update(ctx, recipe)
	if err != nil {
		return nil, err
	}

	return recipe, nil
}

// DeleteRecipe deletes a recipe
func (s *RecipeService) DeleteRecipe(ctx context.Context, id primitive.ObjectID) error {
	_, err := s.GetRecipeByID(ctx, id)
	if err != nil {
		return err
	}

	return s.recipeRepo.Delete(ctx, id)
}

// SearchRecipes searches for recipes
func (s *RecipeService) SearchRecipes(ctx context.Context, query string, cocktailsOnly bool) ([]*entity.Recipe, error) {
	var recipeType *entity.RecipeType
	if cocktailsOnly {
		t := entity.RecipeTypeCocktail
		recipeType = &t
	}
	return s.recipeRepo.Search(ctx, query, recipeType)
}

// FindByIngredient searches for recipes containing a specific ingredient
func (s *RecipeService) FindByIngredient(ctx context.Context, ingredient string) ([]*entity.Recipe, error) {
	if ingredient == "" {
		return nil, ErrInvalidRecipe
	}
	return s.recipeRepo.FindByIngredient(ctx, ingredient)
} 