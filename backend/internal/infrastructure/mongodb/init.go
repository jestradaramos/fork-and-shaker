package mongodb

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// InitializeDatabase sets up the database collections and indexes
func InitializeDatabase(db *mongo.Database) error {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	// Initialize Recipes collection
	if err := initializeRecipesCollection(ctx, db); err != nil {
		return err
	}

	log.Println("Database initialization completed successfully")
	return nil
}

func initializeRecipesCollection(ctx context.Context, db *mongo.Database) error {
	// Create indexes for recipes
	recipeIndexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "name", Value: "text"},
				{Key: "description", Value: "text"},
				{Key: "ingredients.name", Value: "text"},
			},
			Options: options.Index().SetName("recipe_text_search"),
		},
		{
			Keys:    bson.D{{Key: "type", Value: 1}},
			Options: options.Index().SetName("recipe_type"),
		},
		{
			Keys:    bson.D{{Key: "ingredients.name", Value: 1}},
			Options: options.Index().SetName("recipe_ingredients"),
		},
	}

	_, err := db.Collection("recipes").Indexes().CreateMany(ctx, recipeIndexes)
	if err != nil {
		return err
	}

	log.Println("Recipes collection initialized with indexes")
	return nil
} 