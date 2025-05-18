.PHONY: all setup tools lint format run clean help docker-up docker-down

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GORUN=$(GOCMD) run
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
GOVET=$(GOCMD) vet
GOFMT=gofmt

# Project parameters
BINARY_NAME=fafa
BACKEND_DIR=backend
MAIN_PATH=main.go

# Tools
STATICCHECK=staticcheck
GOLINT=golint

all: setup tools lint format build

docker-up: ## Start MongoDB and Mongo Express containers
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "MongoDB running on localhost:27017"
	@echo "Mongo Express UI available at http://localhost:8081"

docker-down: ## Stop MongoDB and Mongo Express containers
	@echo "Stopping Docker containers..."
	docker-compose down

setup: ## Setup the project
	@echo "Setting up project..."
	cd $(BACKEND_DIR) && $(GOMOD) download
	cd $(BACKEND_DIR) && $(GOMOD) tidy

tools: ## Install development tools
	@echo "Installing development tools..."
	$(GOGET) -u golang.org/x/lint/golint
	$(GOGET) honnef.co/go/tools/cmd/staticcheck@latest

lint: ## Run linters
	@echo "Running linters..."
	cd $(BACKEND_DIR) && $(GOVET) ./...
	cd $(BACKEND_DIR) && $(GOLINT) ./...
	cd $(BACKEND_DIR) && $(STATICCHECK) ./...

format: ## Format code
	@echo "Formatting code..."
	cd $(BACKEND_DIR) && $(GOFMT) -w -s .

build: ## Build the application
	@echo "Building..."
	cd $(BACKEND_DIR) && $(GOBUILD) -o $(BINARY_NAME) $(MAIN_PATH)

run: ## Run the application
	@echo "Running application..."
	cd $(BACKEND_DIR) && $(GORUN) $(MAIN_PATH)

clean: ## Clean build files
	@echo "Cleaning..."
	cd $(BACKEND_DIR) && $(GOCLEAN)
	rm -f $(BACKEND_DIR)/$(BINARY_NAME)

test: ## Run tests
	@echo "Running tests..."
	cd $(BACKEND_DIR) && $(GOTEST) -v ./...

help: ## Display this help screen
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help 