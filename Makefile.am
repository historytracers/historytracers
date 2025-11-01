# Build configuration
BINARY_NAME = historytracers
BUILD_DIR = build
SRC_DIR = src/webserver

# Go build flags - these will be set by configure
LDFLAGS = -s -w

# Default target
bin_PROGRAMS = $(BINARY_NAME)

# Source files (assuming main.go is the entry point)
historytracers_SOURCES = $(SRC_DIR)/main.go

# We need to specify that this is a Go project
GO_BUILD = cd $(SRC_DIR) && go build

# Installation paths from configure
install_bin_dir = $(bindir)

# Custom variables that will be set by configure
CONF_PATH = @CONF_PATH@
SRC_PATH = @SRC_PATH@
CONTENT_PATH = @CONTENT_PATH@
LOG_PATH = @LOG_PATH@

# Build rule for the binary
$(BINARY_NAME): $(historytracers_SOURCES)
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(SRC_DIR) && $(GO_COMPILER) fmt ./...
	cd $(SRC_DIR) && $(GO_COMPILER) build $(GO_BUILD_FLAGS) -o ../../$(BUILD_DIR)/$(BINARY_NAME) .

# Install hook
install-exec-local:
	@echo "Installing $(BINARY_NAME) to $(DESTDIR)$(bindir)..."
	$(MKDIR_P) $(DESTDIR)$(bindir)
	$(INSTALL_PROGRAM) $(BUILD_DIR)/$(BINARY_NAME) $(DESTDIR)$(bindir)/$(BINARY_NAME)

# Create package
#.PHONY: pkg
#pkg: all
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
	cd $(SRC_DIR) && go get -u all && go mod tidy

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
clean-local:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)

# Development build (with debug information)
.PHONY: dev
dev: 
dev: all

# Production build (stripped and optimized)
.PHONY: prod
prod: GO_LDFLAGS += -s -w
prod: all

# Show help
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  all          - Build the application (default)"
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
.DEFAULT_GOAL = help
