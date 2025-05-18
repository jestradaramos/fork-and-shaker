package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"fork-and-shaker/internal/infrastructure/mongodb"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	// MongoClient is the global MongoDB client
	MongoClient *mongo.Client
	// MongoDB is the global database instance
	MongoDB *mongo.Database
)

// ConnectDB establishes a connection to MongoDB and initializes the database
func ConnectDB() error {
	// Get MongoDB URI from environment variable or use default
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "fafadb"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Set client options
	clientOptions := options.Client().ApplyURI(mongoURI)

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	// Ping the database
	err = client.Ping(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	MongoClient = client
	MongoDB = client.Database(dbName)

	// Initialize database collections and indexes
	if err := mongodb.InitializeDatabase(MongoDB); err != nil {
		return fmt.Errorf("failed to initialize database: %v", err)
	}

	log.Printf("Connected to MongoDB and initialized database: %s\n", dbName)
	return nil
}

// DisconnectDB closes the MongoDB connection
func DisconnectDB() {
	if MongoClient != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		
		if err := MongoClient.Disconnect(ctx); err != nil {
			log.Printf("Error disconnecting from MongoDB: %v\n", err)
		}
	}
} 