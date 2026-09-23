# Build configuration
PUBLISHERBINARY_NAME = historytracers-publisher$(GO_EXEEXT)
VIEWERBINARY_NAME = historytracers$(GO_EXEEXT)
EDITORBINARY_NAME = historytracers-editor$(GO_EXEEXT)
BUILD_DIR = build
PUBLISHERSRC_DIR = src/publisher
VIEWERSRC_DIR = src/viewer
EDITORSRC_DIR = src/editor

# Go compiler wrapper that ensures its bin dir is in PATH and GOROOT is set
GO_RUN = PATH="$(GO_BIN_DIR):$(PATH)" GOROOT="$(GO_GOROOT)" "$(GO_COMPILER)"

# CGo environment for MinGW cross-compilation (Windows)
if NEED_MINGW
EDITOR_BUILD_ENV = CC="$(MINGW_CC)" CXX="$(MINGW_CC:-gcc=-g++)"
endif

# We're not building C programs, so tell Automake this is foreign
AUTOMAKE_OPTIONS = foreign

# What to distribute
EXTRA_DIST = $(PUBLISHERSRC_DIR)/main.go $(VIEWERSRC_DIR) $(EDITORSRC_DIR)

# Custom targets for Go building
if BUILD_EDITOR
EDITOR_TARGET = editor
endif

all-local: publisher viewer $(EDITOR_TARGET)

publisher:
	@echo "Building $(PUBLISHERBINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) mod download && $(GO_RUN) mod tidy && $(GO_RUN) fmt ./...
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) build $(GO_BUILD_FLAGS) -o ../../$(BUILD_DIR)/$(PUBLISHERBINARY_NAME) .

viewer:
	@echo "Building $(VIEWERBINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(VIEWERSRC_DIR) && $(GO_RUN) mod download && $(GO_RUN) mod tidy && $(GO_RUN) fmt ./...
	cd $(VIEWERSRC_DIR) && $(GO_RUN) build $(GO_BUILD_FLAGS) -o ../../$(BUILD_DIR)/$(VIEWERBINARY_NAME) .

editor:
	@echo "Building $(EDITORBINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	cd $(EDITORSRC_DIR) && $(GO_RUN) mod download && $(GO_RUN) mod tidy && $(GO_RUN) fmt ./...
	cd $(EDITORSRC_DIR) && $(EDITOR_BUILD_ENV) $(GO_RUN) build $(GO_BUILD_FLAGS) -o ../../$(BUILD_DIR)/$(EDITORBINARY_NAME) .

install-exec-local:
	@echo "Installing binaries to $(DESTDIR)$(bindir)..."
	$(MKDIR_P) $(DESTDIR)$(bindir)
	$(INSTALL_PROGRAM) $(BUILD_DIR)/$(PUBLISHERBINARY_NAME) $(DESTDIR)$(bindir)/$(PUBLISHERBINARY_NAME)
	$(INSTALL_PROGRAM) $(BUILD_DIR)/$(VIEWERBINARY_NAME) $(DESTDIR)$(bindir)/$(VIEWERBINARY_NAME)
if BUILD_EDITOR
	$(INSTALL_PROGRAM) $(BUILD_DIR)/$(EDITORBINARY_NAME) $(DESTDIR)$(bindir)/$(EDITORBINARY_NAME)
endif

clean-local:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)

# Phony targets for additional functionality
.PHONY: deps update-deps test fmt dev prod

deps:
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) get github.com/google/uuid
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) get -u github.com/tdewolff/minify/v2
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) get github.com/BurntSushi/toml@latest

update-deps:
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) get all && $(GO_RUN) mod tidy
	cd $(VIEWERSRC_DIR) && $(GO_RUN) get all && $(GO_RUN) mod tidy
if BUILD_EDITOR
	cd $(EDITORSRC_DIR) && $(GO_RUN) get all && $(GO_RUN) mod tidy
endif

# Node.js is required to run the JavaScript unit tests (src/js/test_ht_math.js).
# The built-in test runner (`node --test`) is stable since Node.js 20.
NODE ?= node
NODE_MIN_MAJOR = 20

test:
	@if ! command -v $(NODE) >/dev/null 2>&1; then \
		echo "ERROR: Node.js >= $(NODE_MIN_MAJOR) is required to run the JavaScript unit tests." >&2; \
		echo "       Install Node.js (see README.md, 'Testing') and rerun 'make test'." >&2; \
		exit 1; \
	fi; \
	ver=$$($(NODE) --version | sed 's/^v//; s/\..*//'); \
	if [ "$$ver" -lt $(NODE_MIN_MAJOR) ]; then \
		echo "ERROR: Node.js >= $(NODE_MIN_MAJOR) is required to run the JavaScript unit tests (found $$($(NODE) --version))." >&2; \
		exit 1; \
	fi
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) test ./...
	cd $(VIEWERSRC_DIR) && $(GO_RUN) test ./...
if BUILD_EDITOR
	cd $(EDITORSRC_DIR) && $(GO_RUN) test ./...
endif
	$(NODE) --test src/js/test_ht_math.js

fmt:
	cd $(PUBLISHERSRC_DIR) && $(GO_RUN) fmt ./...
	cd $(VIEWERSRC_DIR) && $(GO_RUN) fmt ./...
if BUILD_EDITOR
	cd $(EDITORSRC_DIR) && $(GO_RUN) fmt ./...
endif

dev: 
	$(MAKE) GO_BUILD_FLAGS="" all

prod: all
