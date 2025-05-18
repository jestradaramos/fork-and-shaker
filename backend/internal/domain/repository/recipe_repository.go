package repository

import (
	"context"

	"fafa/internal/domain/entity"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RecipeRepository defines the interface for recipe data access
type RecipeRepository interface {
	Create(ctx context.Context, recipe *entity.Recipe) error
	FindByID(ctx context.Context, id primitive.ObjectID) (*entity.Recipe, error)
	FindByType(ctx context.Context, recipeType entity.RecipeType) ([]*entity.Recipe, error)
	FindByIngredient(ctx context.Context, ingredient string) ([]*entity.Recipe, error)
	Update(ctx context.Context, recipe *entity.Recipe) error
	Delete(ctx context.Context, id primitive.ObjectID) error
	Search(ctx context.Context, query string, recipeType *entity.RecipeType) ([]*entity.Recipe, error)
} 