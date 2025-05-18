package http

import (
	"encoding/json"
	"log"
	"net/http"

	"fork-and-shaker/internal/application"
	"fork-and-shaker/internal/domain/entity"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RecipeHandler handles HTTP requests for recipes
type RecipeHandler struct {
	recipeService *application.RecipeService
}

// NewRecipeHandler creates a new RecipeHandler
func NewRecipeHandler(recipeService *application.RecipeService) *RecipeHandler {
	return &RecipeHandler{
		recipeService: recipeService,
	}
}

// RegisterRoutes registers the recipe routes
func (h *RecipeHandler) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/api/recipes", h.CreateRecipe).Methods("POST")
	r.HandleFunc("/api/recipes", h.GetCocktailRecipes).Methods("GET")
	r.HandleFunc("/api/recipes/search", h.SearchRecipes).Methods("GET")
	r.HandleFunc("/api/recipes/by-ingredient", h.FindByIngredient).Methods("GET")
	r.HandleFunc("/api/recipes/{id}", h.GetRecipe).Methods("GET")
	r.HandleFunc("/api/recipes/{id}", h.UpdateRecipe).Methods("PUT")
	r.HandleFunc("/api/recipes/{id}", h.DeleteRecipe).Methods("DELETE")
}

type createRecipeRequest struct {
	Name         string              `json:"name"`
	Description  string              `json:"description"`
	Ingredients  []entity.Ingredient `json:"ingredients"`
	Instructions []string            `json:"instructions"`
	Glass        string              `json:"glass"`
	Garnish      string              `json:"garnish"`
}

type updateRecipeRequest struct {
	Name         string              `json:"name"`
	Description  string              `json:"description"`
	Ingredients  []entity.Ingredient `json:"ingredients"`
	Instructions []string            `json:"instructions"`
	Glass        string              `json:"glass"`
	Garnish      string              `json:"garnish"`
}

// CreateRecipe handles recipe creation
func (h *RecipeHandler) CreateRecipe(w http.ResponseWriter, r *http.Request) {
	var req createRecipeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Debug log the received request
	requestData, _ := json.Marshal(req)
	log.Printf("Received recipe creation request: %s", string(requestData))

	recipe, err := h.recipeService.CreateRecipe(r.Context(), req.Name, req.Description,
		req.Ingredients, req.Instructions, req.Glass, req.Garnish)
	if err != nil {
		switch err {
		case application.ErrInvalidRecipe:
			http.Error(w, err.Error(), http.StatusBadRequest)
		default:
			log.Printf("Error creating recipe: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	// Debug log the created recipe
	responseData, _ := json.Marshal(recipe)
	log.Printf("Created recipe: %s", string(responseData))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(recipe); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}

// GetRecipe handles getting a recipe by ID
func (h *RecipeHandler) GetRecipe(w http.ResponseWriter, r *http.Request) {
	id, err := primitive.ObjectIDFromHex(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	recipe, err := h.recipeService.GetRecipeByID(r.Context(), id)
	if err != nil {
		switch err {
		case application.ErrRecipeNotFound:
			http.Error(w, err.Error(), http.StatusNotFound)
		default:
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recipe)
}

// GetCocktailRecipes handles getting all cocktail recipes
func (h *RecipeHandler) GetCocktailRecipes(w http.ResponseWriter, r *http.Request) {
	recipes, err := h.recipeService.GetCocktailRecipes(r.Context())
	if err != nil {
		log.Printf("Error getting cocktail recipes: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Debug log the recipes being sent
	responseData, _ := json.Marshal(recipes)
	log.Printf("Sending recipes: %s", string(responseData))

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(recipes); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}

// UpdateRecipe handles updating a recipe
func (h *RecipeHandler) UpdateRecipe(w http.ResponseWriter, r *http.Request) {
	id, err := primitive.ObjectIDFromHex(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var req updateRecipeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	recipe, err := h.recipeService.UpdateRecipe(r.Context(), id, req.Name, req.Description,
		req.Ingredients, req.Instructions, req.Glass, req.Garnish)
	if err != nil {
		switch err {
		case application.ErrRecipeNotFound:
			http.Error(w, err.Error(), http.StatusNotFound)
		case application.ErrInvalidRecipe:
			http.Error(w, err.Error(), http.StatusBadRequest)
		default:
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recipe)
}

// DeleteRecipe handles deleting a recipe
func (h *RecipeHandler) DeleteRecipe(w http.ResponseWriter, r *http.Request) {
	id, err := primitive.ObjectIDFromHex(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	err = h.recipeService.DeleteRecipe(r.Context(), id)
	if err != nil {
		switch err {
		case application.ErrRecipeNotFound:
			http.Error(w, err.Error(), http.StatusNotFound)
		default:
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// SearchRecipes handles searching for recipes
func (h *RecipeHandler) SearchRecipes(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Search query is required", http.StatusBadRequest)
		return
	}

	cocktailsOnly := r.URL.Query().Get("cocktails_only") == "true"

	recipes, err := h.recipeService.SearchRecipes(r.Context(), query, cocktailsOnly)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recipes)
}

// FindByIngredient handles searching for recipes by ingredient
func (h *RecipeHandler) FindByIngredient(w http.ResponseWriter, r *http.Request) {
	ingredient := r.URL.Query().Get("q")
	if ingredient == "" {
		http.Error(w, "Ingredient query is required", http.StatusBadRequest)
		return
	}

	recipes, err := h.recipeService.FindByIngredient(r.Context(), ingredient)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recipes)
}
