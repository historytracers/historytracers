# Build configuration
PUBLISHERBINARY_NAME = historytracers-publisher$(GO_EXEEXT)
EDITORBINARY_NAME = historytracers-editor$(GO_EXEEXT)
VIEWERBINARY_NAME = historytracers-viewer$(GO_EXEEXT)
BUILD_DIR = build
PUBLISHERSRC_DIR = src/publisher
EDITORSRC_DIR = src/editor
VIEWERSRC_DIR = src/viewer

# Go compiler wrapper that ensures its bin dir is in PATH and GOROOT is set
GO_RUN = PATH="$(GO_BIN_DIR):$(PATH)" GOROOT="$(GO_GOROOT)" $(GO_COMPILER)

# We're not building C programs, so tell Automake this is foreign
AUTOMAKE_OPTIONS = foreign

# What to distribute
EXTRA_DIST = $(PUBLISHERSRC_DIR)/main.go $(EDITORSRC_DIR)/main.go $(VIEWERSRC_DIR)/main.go

# Custom targets for Go building
all-local: publisher editor viewer

publisher:
	@echo "Building $(PUBLISHERBINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) mod download && $(GO_RUN) mod tidy && $(GO_RUN) fmt ./...
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) build $(GO_BUILD_FLAGS) -o ../../$(BUILD_DIR)/$(PUBLISHERBINARY_NAME) .

if NEED_MINGW
editor_cc_env = CC="$(MINGW_CC)" CXX="$(MINGW_CC:gcc=g++)"
else
editor_cc_env =
endif

editor:
	@echo "Building $(EDITORBINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(EDITORSRC_DIR) && $(editor_cc_env) CGO_ENABLED=1 $(GO_RUN) mod download && $(GO_RUN) mod tidy && $(GO_RUN) fmt ./...
	cd $(EDITORSRC_DIR) && $(editor_cc_env) CGO_ENABLED=1 $(GO_RUN) build $(GO_BUILD_FLAGS) -o ../../$(BUILD_DIR)/$(EDITORBINARY_NAME) .

ifeq ($(GO_EXEEXT),.exe)
viewer:
	@echo "Building $(VIEWERBINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(VIEWERSRC_DIR) && $(GO_RUN) mod download && $(GO_RUN) mod tidy && $(GO_RUN) fmt ./...
	cd $(VIEWERSRC_DIR) && $(GO_RUN) build -o ../../$(BUILD_DIR)/$(VIEWERBINARY_NAME) .
else
viewer:
	@echo "Skipping viewer build (Windows-only component)"
endif

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
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) get github.com/google/uuid
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) get -u github.com/tdewolff/minify/v2
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) get github.com/BurntSushi/toml@latest
	cd $(EDITORSRC_DIR) && $(GO_RUN) get fyne.io/fyne/v2@latest

update-deps:
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) get all && $(GO_RUN) mod tidy
	cd $(EDITORSRC_DIR) && $(GO_RUN) get all && $(GO_RUN) mod tidy
	cd $(VIEWERSRC_DIR) && $(GO_RUN) get all && $(GO_RUN) mod tidy

test:
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) test ./...
	cd $(EDITORSRC_DIR) && $(GO_RUN) test ./...
	cd $(VIEWERSRC_DIR) && $(GO_RUN) test ./...

fmt:
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) fmt ./...
	cd $(EDITORSRC_DIR) && $(GO_RUN) fmt ./...
	cd $(VIEWERSRC_DIR) && $(GO_RUN) fmt ./...

dev: 
	$(MAKE) GO_BUILD_FLAGS="" all

prod: all
