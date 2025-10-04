# Build configuration
BINARY_NAME := historytracers
BUILD_DIR := build
SRC_DIR := src/webserver
CONF_PATH := /etc/historytracers/
SRC_PATH := /var/www/htdocs/historytracers/
CONTENT_PATH := /var/www/htdocs/historytracers/www/
LOG_PATH := /var/log/historytracers/

# Go build flags
LDFLAGS := -X 'main.confPath=$(CONF_PATH)' \
           -X 'main.srcPath=$(SRC_PATH)' \
           -X 'main.contentPath=$(CONTENT_PATH)' \
           -X 'main.logPath=$(LOG_PATH)' \
           -s -w

# Installation paths
INSTALL_BIN_DIR := /usr/bin

# Default target
.PHONY: all
all: build

# Build the application
.PHONY: build
build: $(BUILD_DIR)/$(BINARY_NAME)

$(BUILD_DIR)/$(BINARY_NAME):
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(SRC_DIR) && go fmt ./...
	cd $(SRC_DIR) && go build -ldflags="$(LDFLAGS)" -o ../../$(BUILD_DIR)/$(BINARY_NAME) .

# Install the binary
.PHONY: install
install: build
	@echo "Installing $(BINARY_NAME) to $(INSTALL_BIN_DIR)..."
	@sudo install -D -m 755 $(BUILD_DIR)/$(BINARY_NAME) $(INSTALL_BIN_DIR)/$(BINARY_NAME)

# Create package
#.PHONY: pkg
#pkg: build
#	@echo "Creating package..."
#	@bash ./ht2pkg.sh

# Install dependencies
.PHONY: deps
deps:
	@echo "Installing dependencies..."
	cd $(SRC_DIR) && \
	go get github.com/google/uuid && \
	go get -u github.com/tdewolff/minify/v2 && \
	go get github.com/BurntSushi/toml@latest

# Update dependencies
.PHONY: update-deps
update-deps:
	@echo "Updating dependencies..."
	cd $(SRC_DIR) && go get -u all
	cd $(SRC_DIR) && go mod tidy

# Run tests
.PHONY: test
test:
	@echo "Running tests..."
	cd $(SRC_DIR) && go test ./...

# Format code
.PHONY: fmt
fmt:
	@echo "Formatting code..."
	cd $(SRC_DIR) && go fmt ./...

# Clean build artifacts
.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)
	rm -f $(BINARY_NAME)

# Development build (with debug information)
.PHONY: dev
dev: LDFLAGS := -X 'main.confPath=$(CONF_PATH)' \
                -X 'main.srcPath=$(SRC_PATH)' \
                -X 'main.contentPath=$(CONTENT_PATH)' \
                -X 'main.logPath=$(LOG_PATH)'
dev:
	@echo "Building development version..."
	@mkdir -p $(BUILD_DIR)
	cd $(SRC_DIR) && go build -ldflags="$(LDFLAGS)" -o ../../$(BUILD_DIR)/$(BINARY_NAME) .

# Production build (stripped and optimized)
.PHONY: prod
prod: LDFLAGS += -s -w
prod: build

# Show help
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  all/build    - Build the application (default)"
	@echo "  install      - Install the binary to system"
#	@echo "  pkg          - Create package using ht2pkg.sh"
	@echo "  deps         - Install dependencies"
	@echo "  update-deps  - Update all dependencies"
	@echo "  test         - Run tests"
	@echo "  fmt          - Format source code"
	@echo "  clean        - Remove build artifacts"
	@echo "  dev          - Build development version"
	@echo "  prod         - Build production version (stripped)"
	@echo "  help         - Show this help message"

# Default target
.DEFAULT_GOAL := help
