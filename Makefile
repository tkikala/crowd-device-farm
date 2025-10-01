.PHONY: help install build test lint dev clean setup-db migrate docker-up docker-down

# Default target
help:
	@echo "Crowd Device Farm - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make install     - Install all dependencies"
	@echo "  make build       - Build all packages"
	@echo "  make test        - Run all tests"
	@echo "  make lint        - Run linting"
	@echo "  make dev         - Start development servers"
	@echo "  make clean       - Clean build artifacts"
	@echo ""
	@echo "Database:"
	@echo "  make setup-db    - Start PostgreSQL with Docker"
	@echo "  make migrate     - Run database migrations"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up   - Start all services with Docker"
	@echo "  make docker-down - Stop all Docker services"
	@echo ""
	@echo "Setup:"
	@echo "  make setup       - Complete development setup"

# Install dependencies
install:
	npm install

# Build all packages
build:
	npm run build

# Run tests
test:
	npm test

# Run linting
lint:
	npm run lint

# Start development servers
dev:
	npm run dev

# Clean build artifacts
clean:
	rm -rf packages/*/dist
	rm -rf node_modules
	rm -rf packages/*/node_modules

# Database setup
setup-db:
	docker-compose up postgres -d
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5

# Run database migrations
migrate:
	npm run db:migrate

# Docker commands
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

# Complete setup
setup: install build setup-db migrate
	@echo "✅ Setup complete! Run 'make dev' to start development servers."

