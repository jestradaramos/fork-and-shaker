package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"fork-and-shaker/config"
	"fork-and-shaker/internal/application"
	"fork-and-shaker/internal/infrastructure/mongodb"
	handlers "fork-and-shaker/internal/interfaces/http"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to MongoDB
	if err := config.ConnectDB(); err != nil {
		log.Fatal("Could not connect to MongoDB:", err)
	}
	defer config.DisconnectDB()

	// Initialize repositories
	recipeRepo := mongodb.NewRecipeRepository(config.MongoDB)

	// Initialize services
	recipeService := application.NewRecipeService(recipeRepo)

	// Initialize handlers
	recipeHandler := handlers.NewRecipeHandler(recipeService)

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize router
	r := mux.NewRouter()

	// Register routes
	recipeHandler.RegisterRoutes(r)
	r.HandleFunc("/api/health", healthCheckHandler).Methods("GET")

	// Add middleware
	r.Use(loggingMiddleware)

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:5173",
			"http://127.0.0.1:5173",
		},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"}, // Allow all headers
		Debug:          true,          // Enable debugging for troubleshooting
	})

	// Create a handler with CORS middleware
	handler := c.Handler(r)

	// Create a channel to listen for interrupt signals
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Start server in a goroutine
	go func() {
		fmt.Printf("Server starting on port %s...\n", port)
		if err := http.ListenAndServe(":"+port, handler); err != nil {
			log.Fatal(err)
		}
	}()

	// Wait for interrupt signal
	<-stop
	fmt.Println("\nShutting down gracefully...")
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "healthy", "database": "connected"}`))
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s %s\n", r.RemoteAddr, r.Method, r.URL)
		next.ServeHTTP(w, r)
	})
}
