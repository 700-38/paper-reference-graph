


api-install:
	@echo "Installing API dependencies..."
	@bun i

generator-install:
	@echo "Installing generator dependencies..."
	@cd services/graph-generator && poetry install

query-install:
	@echo "Installing query dependencies..."
	@bun i

web-install:
	@echo "Installing web dependencies..."
	@cd services/web && poetry install

api-dev:
	@echo "Starting API..."
	@cd ./services/api && bun run dev

generator-dev:
	@echo "Starting generator..."
	@cd services/graph-generator && poetry run python main.py

query-dev:
	@echo "Starting query..."
	@cd services/paper-query && bun dev

web-dev:
	@echo "Starting web..."
	@cd services/web && poetry run python main.py

install:
	@echo "Installing all dependencies..."
	@make api-install
	@make generator-install
	@make query-install
	@make web-install

dev:
	@echo "Starting all services..."
	@make api-dev
	@make generator-dev
	@make query-dev
	@make web-dev

.PHONY: api-install generator-install query-install web-install api-dev generator-dev query-dev web-dev install dev