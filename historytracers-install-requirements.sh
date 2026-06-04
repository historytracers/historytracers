#!/bin/bash
#
# historytracers-install-requirements.sh
# Detects the Linux distribution and installs all dependencies
# needed to compile the HistoryTracers project.
#

set -e

DISTRO=""
DISTRO_ID=""
DISTRO_VERSION=""

detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO_ID="$ID"
        DISTRO_VERSION="$VERSION_ID"
        case "$ID" in
            debian|ubuntu|linuxmint|pop|elementary|zorin|kali)
                DISTRO="debian"
                ;;
            fedora|rhel|centos|rocky|almalinux|nobara)
                DISTRO="fedora"
                ;;
            opensuse*|suse|sles)
                DISTRO="opensuse"
                ;;
            arch|manjaro|endeavouros|artix|garuda|arcolinux|cachyos)
                DISTRO="arch"
                ;;
            alpine)
                DISTRO="alpine"
                ;;
            void)
                DISTRO="void"
                ;;
            gentoo|calculate)
                DISTRO="gentoo"
                ;;
            slackware)
                DISTRO="slackware"
                ;;
            solus)
                DISTRO="solus"
                ;;
            *)
                echo "Unsupported distribution: $ID"
                exit 1
                ;;
        esac
    elif [ -f /etc/debian_version ]; then
        DISTRO="debian"
        DISTRO_ID="debian"
    elif [ -f /etc/redhat-release ]; then
        DISTRO="fedora"
        DISTRO_ID="rhel"
    elif [ -f /etc/arch-release ]; then
        DISTRO="arch"
        DISTRO_ID="arch"
    elif [ -f /etc/alpine-release ]; then
        DISTRO="alpine"
        DISTRO_ID="alpine"
    elif [ -f /etc/SuSE-release ]; then
        DISTRO="opensuse"
        DISTRO_ID="opensuse"
    else
        echo "Cannot detect distribution."
        exit 1
    fi
}

install_debian() {
    echo "Detected Debian/Ubuntu family ($DISTRO_ID $DISTRO_VERSION)"
    apt-get update
    apt-get install -y \
        autoconf \
        automake \
        make \
        gcc \
        g++ \
        golang-go \
        pkg-config \
        libgtk-3-dev \
        libwebkit2gtk-4.1-dev \
        libgl1-mesa-dev \
        xorg-dev \
        libcairo2-dev \
        libpango1.0-dev \
        libgdk-pixbuf-2.0-dev
    echo "Dependencies installed successfully."
}

install_fedora() {
    echo "Detected Fedora/RHEL family ($DISTRO_ID $DISTRO_VERSION)"
    if command -v dnf >/dev/null 2>&1; then
        PKG_MGR="dnf"
    elif command -v yum >/dev/null 2>&1; then
        PKG_MGR="yum"
    else
        echo "No package manager found (dnf/yum)."
        exit 1
    fi
    $PKG_MGR install -y \
        autoconf \
        automake \
        make \
        gcc \
        gcc-c++ \
        golang \
        pkgconfig \
        gtk3-devel \
        webkit2gtk4.1-devel \
        mesa-libGL-devel \
        libX11-devel \
        libXrandr-devel \
        libXinerama-devel \
        libXcursor-devel \
        libXi-devel \
        libXxf86vm-devel \
        cairo-devel \
        pango-devel \
        gdk-pixbuf2-devel
    echo "Dependencies installed successfully."
}

install_opensuse() {
    echo "Detected openSUSE/SLES family ($DISTRO_ID $DISTRO_VERSION)"
    zypper --non-interactive install \
        autoconf \
        automake \
        make \
        gcc \
        gcc-c++ \
        go \
        pkg-config \
        gtk3-devel \
        webkit2gtk-4_1-devel \
        Mesa-libGL-devel \
        libX11-devel \
        libXrandr-devel \
        libXinerama-devel \
        libXcursor-devel \
        libXi-devel \
        libXxf86vm-devel \
        cairo-devel \
        pango-devel \
        gdk-pixbuf-devel
    echo "Dependencies installed successfully."
}

install_arch() {
    echo "Detected Arch Linux family ($DISTRO_ID $DISTRO_VERSION)"
    pacman -S --noconfirm \
        autoconf \
        automake \
        make \
        gcc \
        go \
        pkg-config \
        gtk3 \
        webkit2gtk-4.1 \
        mesa \
        libx11 \
        libxrandr \
        libxinerama \
        libxcursor \
        libxi \
        libxxf86vm \
        cairo \
        pango \
        gdk-pixbuf2
    echo "Dependencies installed successfully."
}

install_alpine() {
    echo "Detected Alpine Linux ($DISTRO_ID $DISTRO_VERSION)"
    apk add \
        autoconf \
        automake \
        make \
        gcc \
        g++ \
        go \
        pkgconfig \
        gtk+3.0-dev \
        webkit2gtk-4.1-dev \
        mesa-dev \
        xrandr-dev \
        libxinerama-dev \
        libxcursor-dev \
        libxi-dev \
        libxxf86vm-dev \
        cairo-dev \
        pango-dev \
        gdk-pixbuf-dev
    echo "Dependencies installed successfully."
}

install_void() {
    echo "Detected Void Linux ($DISTRO_ID $DISTRO_VERSION)"
    xbps-install -y \
        autoconf \
        automake \
        make \
        gcc \
        g++ \
        go \
        pkg-config \
        gtk+3-devel \
        webkit2gtk-4.1-devel \
        mesa-devel \
        libX11-devel \
        libXrandr-devel \
        libXinerama-devel \
        libXcursor-devel \
        libXi-devel \
        libXxf86vm-devel \
        cairo-devel \
        pango-devel \
        gdk-pixbuf-devel
    echo "Dependencies installed successfully."
}

install_gentoo() {
    echo "Detected Gentoo family ($DISTRO_ID $DISTRO_VERSION)"
    emerge --ask=n \
        autoconf \
        automake \
        make \
        gcc \
        dev-lang/go \
        pkg-config \
        x11-libs/gtk+:3 \
        net-libs/webkit-gtk:4.1 \
        media-libs/mesa \
        x11-libs/libX11 \
        x11-libs/libXrandr \
        x11-libs/libXinerama \
        x11-libs/libXcursor \
        x11-libs/libXi \
        x11-libs/libXxf86vm \
        x11-libs/cairo \
        x11-libs/pango \
        x11-libs/gdk-pixbuf
    echo "Dependencies installed successfully."
}

install_slackware() {
    echo "Detected Slackware ($DISTRO_ID $DISTRO_VERSION)"
    if ! command -v slackpkg >/dev/null 2>&1; then
        echo "slackpkg not found. Please install required packages manually:"
        echo "  autoconf automake make gcc gcc-g++ go pkg-config gtk+3"
        echo "  mesa libX11 libXrandr libXinerama libXcursor libXi libXxf86vm"
        echo "  cairo pango gdk-pixbuf2"
        echo ""
        echo "For webkit2gtk-4.1, build from SlackBuilds.org:"
        echo "  wget https://slackbuilds.org/slackbuilds/15.0/libraries/webkit2gtk.tar.gz"
        echo "  tar xzf webkit2gtk.tar.gz"
        echo "  cd webkit2gtk"
        echo "  wget \$(grep -i download .info | head -1 | cut -d'\"' -f4)"
        echo "  ./webkit2gtk.SlackBuild"
        echo "  installpkg /tmp/webkit2gtk-*.t?z"
        exit 1
    fi

    slackpkg install \
        autoconf \
        automake \
        make \
        gcc \
        gcc-g++ \
        go \
        pkg-config \
        gtk+3 \
        mesa \
        libX11 \
        libXrandr \
        libXinerama \
        libXcursor \
        libXi \
        libXxf86vm \
        cairo \
        pango \
        gdk-pixbuf2 \
        cmake \
        ninja \
        git \
        python3 \
        perl \
        ruby

    # Check if webkit2gtk was installed (slackpkg may not find it via mirror)
    if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
        echo "webkit2gtk-4.1 is already available."
        return
    fi
    if pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
        echo "webkit2gtk-4.0 found; providing a compatibility symlink..."
        # Create a .pc symlink so pkg-config finds 4.0 as 4.1 (best-effort)
        for pc in /usr/lib*/pkgconfig/webkit2gtk-4.0.pc /usr/lib64/pkgconfig/webkit2gtk-4.0.pc; do
            if [ -f "$pc" ]; then
                ln -sf "$pc" "$(dirname "$pc")/webkit2gtk-4.1.pc"
                echo "Symlinked $(basename "$pc") -> webkit2gtk-4.1.pc"
            fi
        done
        if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
            echo "webkit2gtk-4.1 compatibility symlink works."
            return
        fi
    fi

    echo ""
    echo "webkit2gtk-4.1 not found in Slackware packages."
    echo "You must download and compile it from SlackBuilds.org:"
    echo ""
    echo "  cd /tmp"
    echo "  wget https://slackbuilds.org/slackbuilds/15.0/libraries/webkit2gtk.tar.gz"
    echo "  tar xzf webkit2gtk.tar.gz"
    echo "  cd webkit2gtk"
    echo "  # Download source from the URL in webkit2gtk.info"
    echo "  wget \$(grep -i "^DOWNLOAD=" webkit2gtk.info | head -1 | cut -d'\"' -f2)"
    echo "  # Review the .info file for any additional dependencies"
    echo "  su -c './webkit2gtk.SlackBuild'"
    echo "  su -c 'installpkg /tmp/webkit2gtk-*.t?z'"
    echo ""
    echo "Note: webkit2gtk requires additional build dependencies such as"
    echo "cmake, ninja, git, python3, perl, and ruby. These were already"
    echo "installed above if available."
}

install_solus() {
    echo "Detected Solus ($DISTRO_ID $DISTRO_VERSION)"
    eopkg install -y \
        autoconf \
        automake \
        make \
        gcc \
        g++ \
        go \
        pkg-config \
        libgtk-3-devel \
        webkit2gtk-4.1-devel \
        libgl-devel \
        libx11-devel \
        libxrandr-devel \
        libxinerama-devel \
        libxcursor-devel \
        libxi-devel \
        libxxf86vm-devel \
        cairo-devel \
        pango-devel \
        gdk-pixbuf-devel
    echo "Dependencies installed successfully."
}

main() {
    if [ "$(id -u)" -ne 0 ]; then
        echo "This script must be run as root (use sudo)."
        exit 1
    fi

    detect_distro
    echo "Distribution: $DISTRO_ID $DISTRO_VERSION"

    case "$DISTRO" in
        debian)   install_debian ;;
        fedora)   install_fedora ;;
        opensuse) install_opensuse ;;
        arch)     install_arch ;;
        alpine)   install_alpine ;;
        void)     install_void ;;
        gentoo)   install_gentoo ;;
        slackware) install_slackware ;;
        solus)    install_solus ;;
        *)
            echo "Unsupported distribution: $DISTRO_ID"
            exit 1
            ;;
    esac
}

main
