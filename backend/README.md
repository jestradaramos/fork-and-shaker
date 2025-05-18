# Go Backend Server

A simple Go backend server using Gorilla Mux router with basic endpoints and middleware.

## Features

- RESTful API structure
- Environment variable support
- Request logging middleware
- Health check endpoint
- JSON responses

## Prerequisites

- Go 1.21 or higher
- Make sure you have Go installed and your GOPATH is set up correctly

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd fafa
```

2. Install dependencies:
```bash
go mod download
```

3. Create a .env file in the root directory (optional):
```
PORT=8080
ENV=development
```

## Running the Server

Start the server:
```bash
go run main.go
```

The server will start on port 8080 (default) or the port specified in your .env file.

## API Endpoints

- `GET /` - Home endpoint, returns welcome message
- `GET /api/health` - Health check endpoint

## Testing the API

You can test the endpoints using curl:

```bash
# Test home endpoint
curl http://localhost:8080/

# Test health check endpoint
curl http://localhost:8080/api/health
``` 