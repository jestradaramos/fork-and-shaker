package entity

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RecipeType represents the type of recipe (cocktail, food, etc.)
type RecipeType string

const (
	RecipeTypeCocktail RecipeType = "cocktail"
	RecipeTypeFood     RecipeType = "food"
)

// Ingredient represents a single ingredient in a recipe
type Ingredient struct {
	Name        string  `json:"name" bson:"name"`
	Amount      float64 `json:"amount" bson:"amount"`
	Unit        string  `json:"unit" bson:"unit"`
	Notes       string  `json:"notes,omitempty" bson:"notes,omitempty"`
	IsOptional  bool    `json:"is_optional" bson:"is_optional"`
}

// Recipe represents a recipe entity in our domain
type Recipe struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name        string            `json:"name" bson:"name"`
	Type        RecipeType        `json:"type" bson:"type"`
	Description string            `json:"description" bson:"description"`
	Ingredients []Ingredient      `json:"ingredients" bson:"ingredients"`
	Instructions []string         `json:"instructions" bson:"instructions"`
	Glass        string           `json:"glass,omitempty" bson:"glass,omitempty"`
	Garnish      string           `json:"garnish,omitempty" bson:"garnish,omitempty"`
	CreatedAt    time.Time         `json:"created_at" bson:"created_at"`
	UpdatedAt    time.Time         `json:"updated_at" bson:"updated_at"`
}

// NewRecipe creates a new Recipe entity
func NewRecipe(name string, recipeType RecipeType, description string, ingredients []Ingredient, 
	instructions []string, glass, garnish string) *Recipe {
	now := time.Now()
	return &Recipe{
		Name:         name,
		Type:         recipeType,
		Description:  description,
		Ingredients:  ingredients,
		Instructions: instructions,
		Glass:        glass,
		Garnish:      garnish,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
}

// Update updates the recipe's information
func (r *Recipe) Update(name, description string, ingredients []Ingredient, 
	instructions []string, glass, garnish string) {
	r.Name = name
	r.Description = description
	r.Ingredients = ingredients
	r.Instructions = instructions
	r.Glass = glass
	r.Garnish = garnish
	r.UpdatedAt = time.Now()
}

// Validate validates the recipe data
func (r *Recipe) Validate() bool {
	if r.Name == "" || len(r.Ingredients) == 0 || len(r.Instructions) == 0 {
		return false
	}
	
	// For cocktails, ensure we have at least one ingredient with an amount
	if r.Type == RecipeTypeCocktail {
		hasValidIngredient := false
		for _, ing := range r.Ingredients {
			if ing.Name != "" && ing.Amount > 0 && ing.Unit != "" {
				hasValidIngredient = true
				break
			}
		}
		if !hasValidIngredient {
			return false
		}
	}
	
	return true
} 