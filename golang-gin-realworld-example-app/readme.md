# RealWorld Backend Example App

> ### Golang/Gin codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

This codebase was created to demonstrate a fully fledged fullstack application built with **Golang/Gin** including CRUD operations, authentication, routing, pagination, and more.

## Testing Module Assignment

This backend API is designed to work in conjunction with the **react-redux-realworld-example-app** frontend as part of your testing module assignment. The backend provides the API endpoints that the React/Redux frontend consumes.

# Directory structure

```
.
├── gorm.db
├── hello.go
├── common
│   ├── utils.go        //small tools function
│   └── database.go     //DB connect manager
├── users
|   ├── models.go       //data models define & DB operation
|   ├── serializers.go  //response computing & format
|   ├── routers.go      //business logic & router binding
|   ├── middlewares.go  //put the before & after logic of handle request
|   └── validators.go   //form/json checker
├── ...
...
```

# Getting started

## Prerequisites

Make sure you have Go 1.13 or higher installed.

https://golang.org/doc/install

Set up the standard Go environment variables according to the latest guidance (see https://golang.org/doc/install#install).

## Installation

From the project root directory, run the following commands in sequence:

```bash
# Download dependencies
go mod download

# Tidy up dependencies (ensures go.sum is up to date)
go mod tidy

# Build all packages to verify everything compiles
go build ./...
```

## Running the Server

To start the API server:

```bash
# Option 1: Run directly
go run hello.go

# Option 2: Build and run the binary
go build -o realworld-server hello.go
./realworld-server
```

The server will start on `http://localhost:8080` by default.

### API Endpoints

- **Base URL**: `http://localhost:8080/api`
- **Test endpoint**: `http://localhost:8080/api/ping` (returns `{"message": "pong"}`)

### CORS Configuration

If you're running the react-redux frontend on a different port (e.g., `http://localhost:4100`), you may need to configure CORS to allow cross-origin requests.

## Testing

To run the available unit tests:

```bash
# Run all tests
go test ./...

# Run tests with coverage report
go test ./... -cover

# Run tests with verbose output and coverage
go test -v ./... -cover
```

**Note**: The test suite is currently incomplete. Some tests may fail due to validator version compatibility issues. The `common` and `users` packages have partial test coverage, while the `articles` package has no test files. This is expected for the testing module assignment.

## Database

The application uses SQLite with GORM as the ORM. The database file (`gorm.db`) will be created automatically in the parent directory when you first run the application.

### Database Location

By default, the database is created at `./../gorm.db` relative to the application directory. Ensure you have write permissions in the parent directory.

## Project Structure

Each domain module follows a consistent pattern:

- **models.go** - Data models and database operations
- **serializers.go** - Response formatting and JSON transformation
- **routers.go** - HTTP route handlers and business logic
- **validators.go** - Request validation and data binding
- **middlewares.go** - Request/response middleware (where applicable)
