package mongodb

import (
	"context"

	"fafa/internal/domain/entity"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// RecipeRepository implements the domain.RecipeRepository interface
type RecipeRepository struct {
	collection *mongo.Collection
}

// NewRecipeRepository creates a new RecipeRepository
func NewRecipeRepository(db *mongo.Database) *RecipeRepository {
	collection := db.Collection("recipes")
	
	// Create indexes
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "name", Value: "text"},
				{Key: "description", Value: "text"},
			},
			Options: options.Index().SetName("recipe_text_search"),
		},
		{
			Keys: bson.D{{Key: "type", Value: 1}},
			Options: options.Index().SetName("recipe_type"),
		},
		{
			Keys: bson.D{{Key: "creator_id", Value: 1}},
			Options: options.Index().SetName("recipe_creator"),
		},
	}

	_, err := collection.Indexes().CreateMany(context.Background(), indexes)
	if err != nil {
		// Log the error but don't fail - indexes are for performance
		// The application can still work without them
		// In production, you might want to handle this differently
		// log.Printf("Error creating indexes: %v", err)
	}

	return &RecipeRepository{
		collection: collection,
	}
}

// Create implements RecipeRepository.Create
func (r *RecipeRepository) Create(ctx context.Context, recipe *entity.Recipe) error {
	result, err := r.collection.InsertOne(ctx, recipe)
	if err != nil {
		return err
	}
	recipe.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

// FindByID implements RecipeRepository.FindByID
func (r *RecipeRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*entity.Recipe, error) {
	var recipe entity.Recipe
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&recipe)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &recipe, nil
}

// FindByCreator implements RecipeRepository.FindByCreator
func (r *RecipeRepository) FindByCreator(ctx context.Context, creatorID primitive.ObjectID) ([]*entity.Recipe, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"creator_id": creatorID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var recipes []*entity.Recipe
	if err = cursor.All(ctx, &recipes); err != nil {
		return nil, err
	}
	return recipes, nil
}

// FindByType implements RecipeRepository.FindByType
func (r *RecipeRepository) FindByType(ctx context.Context, recipeType entity.RecipeType) ([]*entity.Recipe, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"type": recipeType})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var recipes []*entity.Recipe
	if err = cursor.All(ctx, &recipes); err != nil {
		return nil, err
	}
	return recipes, nil
}

// Update implements RecipeRepository.Update
func (r *RecipeRepository) Update(ctx context.Context, recipe *entity.Recipe) error {
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": recipe.ID}, recipe)
	return err
}

// Delete implements RecipeRepository.Delete
func (r *RecipeRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

// FindByIngredient implements RecipeRepository.FindByIngredient
func (r *RecipeRepository) FindByIngredient(ctx context.Context, ingredient string) ([]*entity.Recipe, error) {
	filter := bson.M{"ingredients.name": bson.M{"$regex": primitive.Regex{Pattern: ingredient, Options: "i"}}}
	
	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var recipes []*entity.Recipe
	if err = cursor.All(ctx, &recipes); err != nil {
		return nil, err
	}
	return recipes, nil
}

// Search implements RecipeRepository.Search
func (r *RecipeRepository) Search(ctx context.Context, query string, recipeType *entity.RecipeType) ([]*entity.Recipe, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"$text": bson.M{"$search": query}},
			{"ingredients.name": bson.M{"$regex": primitive.Regex{Pattern: query, Options: "i"}}},
		},
	}

	if recipeType != nil {
		filter["type"] = *recipeType
	}

	opts := options.Find().
		SetSort(bson.D{{Key: "score", Value: bson.M{"$meta": "textScore"}}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var recipes []*entity.Recipe
	if err = cursor.All(ctx, &recipes); err != nil {
		return nil, err
	}
	return recipes, nil
} 