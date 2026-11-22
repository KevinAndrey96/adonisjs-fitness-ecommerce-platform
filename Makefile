.PHONY: help setup dev migrate seed test docker-up docker-down docker-logs lint clean

help:
	@echo "Fitness E-Commerce Platform - Developer Commands"
	@echo "================================================"
	@echo "make setup        - Install dependencies and create .env"
	@echo "make dev          - Run development server with hot-reload"
	@echo "make migrate      - Run database migrations"
	@echo "make seed         - Seed realistic fitness catalog & admin user"
	@echo "make test         - Run syntax check across controllers & models"
	@echo "make docker-up    - Build and start full stack in Docker (App + MySQL + Mailpit)"
	@echo "make docker-down  - Stop Docker stack"
	@echo "make docker-logs  - View container logs"
	@echo "make clean        - Remove temporary files and SQLite databases"

setup:
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	npm install --legacy-peer-deps

dev:
	node server.js

migrate:
	node ace migration:run --force

seed:
	node ace seed --force

test:
	node --check app/Models/*.js
	node --check app/Controllers/Http/*.js
	node --check app/Controllers/Http/Admin/*.js
	node --check start/routes.js
	@echo "All JavaScript files passed syntax verification."

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

clean:
	rm -f database/*.sqlite
	rm -rf tmp/*
