# Initialize Autoconf
AC_INIT([historytracers], [1.0.0], [historytracers@gmail.com])

# Set package name and version
AC_CONFIG_SRCDIR([src/webserver/main.go])
AC_CONFIG_HEADERS([config.h])
AC_CONFIG_AUX_DIR([build-aux])

# Initialize Automake
AM_INIT_AUTOMAKE([foreign subdir-objects])

# Check for required programs
AC_PROG_CC
AC_PROG_INSTALL
AC_PROG_MKDIR_P

# Enable dependency tracking
AM_PROG_CC_C_O
AC_PROG_MAKE_SET

# Check for Go compiler
# Go compiler selection options
AC_ARG_WITH([go-compiler],
    [AS_HELP_STRING([--with-go-compiler=COMPILER],
        [Specify Go compiler to use (go, gccgo, or full path) @<:@auto@:>@])],
    [go_compiler="$withval"],
    [go_compiler="auto"])

AC_ARG_WITH([go-path],
    [AS_HELP_STRING([--with-go-path=PATH],
        [Specify directory containing Go compiler])],
    [go_path="$withval"],
    [go_path=""])

# Set up PATH if custom Go path specified
if test "x$go_path" != "x"; then
    save_PATH="$PATH"
    PATH="$go_path:$PATH"
    export PATH
fi

# Check for Go compiler
AC_MSG_CHECKING([for Go compiler])
if test "x$go_compiler" != "xauto" -a "x$go_compiler" != "x"; then
    # User specified a compiler
    if test -x "$go_compiler"; then
        # Full path provided and exists
        GO_COMPILER="$go_compiler"
        AC_MSG_RESULT([$GO_COMPILER (user specified)])
    else
        # Check in PATH
        AC_CHECK_PROG([HAVE_USER_GO], [$go_compiler], [yes], [no])
        if test "x$HAVE_USER_GO" = "xyes"; then
            GO_COMPILER="$go_compiler"
            AC_MSG_RESULT([$GO_COMPILER (user specified)])
        else
            AC_MSG_ERROR([User-specified Go compiler '$go_compiler' not found])
        fi
    fi
else
    # Auto-detection - try standard 'go' first
    AC_CHECK_PROG([HAVE_GO], [go], [yes], [no])
    if test "x$HAVE_GO" = "xyes"; then
        GO_COMPILER="go"
        AC_MSG_RESULT([$GO_COMPILER (auto-detected)])
    else
        AC_CHECK_PROG([HAVE_GCCGO], [gccgo], [yes], [no])
        if test "x$HAVE_GCCGO" = "xyes"; then
            GO_COMPILER="gccgo"
            AC_MSG_RESULT([$GO_COMPILER (auto-detected)])
        else
            AC_MSG_ERROR([No Go compiler found. Please install go or gccgo, or specify with --with-go-compiler])
        fi
    fi
fi

# Restore PATH if we modified it
if test "x$go_path" != "x"; then
    PATH="$save_PATH"
fi

# Continue with your existing compiler type detection
AC_MSG_CHECKING([for Go compiler type])
GO_VERSION_OUTPUT=`$GO_COMPILER version 2>/dev/null`
GO_COMPILER_TYPE=unknown

 case "$GO_VERSION_OUTPUT" in
    *gccgo*)
        GO_COMPILER_TYPE=gccgo
        AC_DEFINE([HAVE_GCCGO], [1], [Define to 1 if using gccgo])
        ;;
    go*version*1.*)
        GO_COMPILER_TYPE=go
        AC_DEFINE([HAVE_GOOGLE_GO], [1], [Define to 1 if using Google Go])
        ;;
    *)
        GO_COMPILER_TYPE=unknown
        AC_MSG_WARN([Cannot determine Go compiler type from: $GO_VERSION_OUTPUT])
        ;;
esac

AC_MSG_RESULT([$GO_COMPILER_TYPE])

AC_SUBST([GO_COMPILER])

 # Set default installation paths
AC_PREFIX_DEFAULT(/usr)

# Custom installation paths with defaults
AC_ARG_WITH([conf-path],
    [AS_HELP_STRING([--with-conf-path=PATH],
        [Configuration file path @<:@default=/etc/historytracers/historytracers.conf@:>@])],
    [CONF_PATH=$withval],
    [CONF_PATH=/etc/historytracers/historytracers.conf])

AC_ARG_WITH([src-path],
    [AS_HELP_STRING([--with-src-path=PATH],
        [Source directory path @<:@default=/var/www/htdocs/historytracers/@:>@])],
    [SRC_PATH=$withval],
    [SRC_PATH=/var/www/htdocs/historytracers/])

AC_ARG_WITH([content-path],
    [AS_HELP_STRING([--with-content-path=PATH],
        [Content directory path @<:@default=/usr/share/historytracers/www/@:>@])],
    [CONTENT_PATH=$withval],
    [CONTENT_PATH=/var/www/htdocs/historytracers/www/])

AC_ARG_WITH([log-path],
    [AS_HELP_STRING([--with-log-path=PATH],
        [Log directory path @<:@default=/var/log/historytracers/@:>@])],
    [LOG_PATH=$withval],
    [LOG_PATH=/var/log/historytracers/])

 # Set build flags based on compiler type
 case "$GO_COMPILER_TYPE" in
    gccgo)
        GO_BUILD_FLAGS=""
        AC_MSG_NOTICE([Using gccgo-specific build flags])
        ;;
    go)
        GO_BUILD_FLAGS="-ldflags \"-X main.confPath=$CONF_PATH -X main.srcPath=$SRC_PATH -X main.contentPath=$CONTENT_PATH -X main.logPath=$LOG_PATH\""
        AC_MSG_NOTICE([Using standard Go build flags])
        ;;
    *)
        GO_BUILD_FLAGS=""
        AC_MSG_WARN([Using default build flags for unknown compiler])
        ;;
esac

  # Substitute the variables in Makefile
AC_SUBST([CONF_PATH])
AC_SUBST([SRC_PATH])
AC_SUBST([CONTENT_PATH])
AC_SUBST([LOG_PATH])
AC_SUBST([GO_BUILD_FLAGS])

# Generate output files
AC_CONFIG_FILES([Makefile])
AC_OUTPUT

# Summary
echo
echo "Build configuration summary:"
echo "  Package:        $PACKAGE_NAME $PACKAGE_VERSION"
echo "  Prefix:         $prefix"
echo "  Config path:    $CONF_PATH"
echo "  Source path:    $SRC_PATH"
echo "  Content path:   $CONTENT_PATH"
echo "  Log path:       $LOG_PATH"
echo
