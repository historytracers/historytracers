# Build configuration
BINARY_NAME = historytracers
EDITORBINARY_NAME = historytracers-editor
BUILD_DIR = build
WEBSERVERSRC_DIR = src/webserver
EDITORSRC_DIR = src/editor

# We're not building C programs, so tell Automake this is foreign
AUTOMAKE_OPTIONS = foreign

# What to distribute
EXTRA_DIST = $(WEBSERVERSRC_DIR)/main.go $(EDITORSRC_DIR)/main.go

# Custom targets for Go building
all-local: webserver editor

webserver:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(WEBSERVERSRC_DIR) && $(GO_COMPILER) mod download && $(GO_COMPILER) mod tidy && $(GO_COMPILER) fmt ./...
	cd $(WEBSERVERSRC_DIR) && $(GO_COMPILER) build $(GO_BUILD_FLAGS) -o ../../$(BUILD_DIR)/$(BINARY_NAME) .

editor:
	@echo "Building $(EDITORBINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) mod download && $(GO_COMPILER) mod tidy && $(GO_COMPILER) fmt ./...
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) build $(GO_BUILD_FLAGS) -o ../../$(BUILD_DIR)/$(EDITORBINARY_NAME) .

install-exec-local:
	@echo "Installing binaries to $(DESTDIR)$(bindir)..."
	$(MKDIR_P) $(DESTDIR)$(bindir)
	$(INSTALL_PROGRAM) $(BUILD_DIR)/$(BINARY_NAME) $(DESTDIR)$(bindir)/$(BINARY_NAME)
	$(INSTALL_PROGRAM) $(BUILD_DIR)/$(EDITORBINARY_NAME) $(DESTDIR)$(bindir)/$(EDITORBINARY_NAME)

clean-local:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)

# Phony targets for additional functionality
.PHONY: deps update-deps test fmt dev prod

deps:
	cd $(WEBSERVERSRC_DIR) && $(GO_COMPILER) get github.com/google/uuid
	cd $(WEBSERVERSRC_DIR) && $(GO_COMPILER) get -u github.com/tdewolff/minify/v2
	cd $(WEBSERVERSRC_DIR) && $(GO_COMPILER) get github.com/BurntSushi/toml@latest
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) get fyne.io/fyne/v2@latest

update-deps:
	cd $(WEBSERVERSRC_DIR) && $(GO_COMPILER) get all && $(GO_COMPILER) mod tidy
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) get all && $(GO_COMPILER) mod tidy

test:
	cd $(WEBSERVERSRC_DIR) && $(GO_COMPILER) test ./...
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) test ./...

fmt:
	cd $(WEBSERVERSRC_DIR) && $(GO_COMPILER) fmt ./...
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) fmt ./...

dev: 
	$(MAKE) GO_BUILD_FLAGS="" all

prod: all
