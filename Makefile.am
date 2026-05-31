# Build configuration
PUBLISHERBINARY_NAME = historytracers-publisher
EDITORBINARY_NAME = historytracers-editor
VIEWERBINARY_NAME = historytracers-viewer
BUILD_DIR = build
PUBLISHERSRC_DIR = src/publisher
EDITORSRC_DIR = src/editor
VIEWERSRC_DIR = src/viewer

# We're not building C programs, so tell Automake this is foreign
AUTOMAKE_OPTIONS = foreign

# What to distribute
EXTRA_DIST = $(PUBLISHERSRC_DIR)/main.go $(EDITORSRC_DIR)/main.go $(VIEWERSRC_DIR)/main.go

# Custom targets for Go building
all-local: publisher editor viewer

publisher:
	@echo "Building $(PUBLISHERBINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(PUBLISHERSRC_DIR) && $(GO_COMPILER) mod download && $(GO_COMPILER) mod tidy && $(GO_COMPILER) fmt ./...
	cd $(PUBLISHERSRC_DIR) && $(GO_COMPILER) build $(GO_BUILD_FLAGS) -o ../../$(BUILD_DIR)/$(PUBLISHERBINARY_NAME) .

editor:
	@echo "Building $(EDITORBINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) mod download && $(GO_COMPILER) mod tidy && $(GO_COMPILER) fmt ./...
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) build $(GO_BUILD_FLAGS) -o ../../$(BUILD_DIR)/$(EDITORBINARY_NAME) .

viewer:
	@echo "Building $(VIEWERBINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(VIEWERSRC_DIR) && $(GO_COMPILER) mod download && $(GO_COMPILER) mod tidy && $(GO_COMPILER) fmt ./...
	cd $(VIEWERSRC_DIR) && $(GO_COMPILER) build -o ../../$(BUILD_DIR)/$(VIEWERBINARY_NAME) .

install-exec-local:
	@echo "Installing binaries to $(DESTDIR)$(bindir)..."
	$(MKDIR_P) $(DESTDIR)$(bindir)
	$(INSTALL_PROGRAM) $(BUILD_DIR)/$(PUBLISHERBINARY_NAME) $(DESTDIR)$(bindir)/$(PUBLISHERBINARY_NAME)
	$(INSTALL_PROGRAM) $(BUILD_DIR)/$(EDITORBINARY_NAME) $(DESTDIR)$(bindir)/$(EDITORBINARY_NAME)
	$(INSTALL_PROGRAM) $(BUILD_DIR)/$(VIEWERBINARY_NAME) $(DESTDIR)$(bindir)/$(VIEWERBINARY_NAME)

clean-local:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)

# Phony targets for additional functionality
.PHONY: deps update-deps test fmt dev prod

deps:
	cd $(PUBLISHERSRC_DIR) && $(GO_COMPILER) get github.com/google/uuid
	cd $(PUBLISHERSRC_DIR) && $(GO_COMPILER) get -u github.com/tdewolff/minify/v2
	cd $(PUBLISHERSRC_DIR) && $(GO_COMPILER) get github.com/BurntSushi/toml@latest
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) get fyne.io/fyne/v2@latest

update-deps:
	cd $(PUBLISHERSRC_DIR) && $(GO_COMPILER) get all && $(GO_COMPILER) mod tidy
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) get all && $(GO_COMPILER) mod tidy
	cd $(VIEWERSRC_DIR) && $(GO_COMPILER) get all && $(GO_COMPILER) mod tidy

test:
	cd $(PUBLISHERSRC_DIR) && $(GO_COMPILER) test ./...
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) test ./...
	cd $(VIEWERSRC_DIR) && $(GO_COMPILER) test ./...

fmt:
	cd $(PUBLISHERSRC_DIR) && $(GO_COMPILER) fmt ./...
	cd $(EDITORSRC_DIR) && $(GO_COMPILER) fmt ./...
	cd $(VIEWERSRC_DIR) && $(GO_COMPILER) fmt ./...

dev: 
	$(MAKE) GO_BUILD_FLAGS="" all

prod: all
