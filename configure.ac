# Initialize Autoconf
AC_INIT([historytracers], [1.0.0], [historytracers@gmail.com])

# Set package name and version
AC_CONFIG_SRCDIR([src/webserver/main.go])
AC_CONFIG_HEADERS([config.h])
AC_CONFIG_AUX_DIR([build-aux])

# Initialize Automake
AM_INIT_AUTOMAKE([foreign subdir-objects])

# Check for required programs
AC_PROG_INSTALL
AC_PROG_MKDIR_P

# Check for Go compiler
AC_CHECK_PROG([HAVE_GO], [go], [yes], [no])
if test "x$HAVE_GO" = "xno"; then
    AC_MSG_ERROR([Go compiler (go) is required but not found])
fi

# Set default installation paths
AC_PREFIX_DEFAULT(/usr)

# Custom installation paths with defaults
AC_ARG_WITH([conf-path],
    [AS_HELP_STRING([--with-conf-path=PATH],
        [Configuration directory path @<:@default=/etc/historytracers/@:>@])],
    [CONF_PATH=$withval],
    [CONF_PATH=/etc/historytracers/])

AC_ARG_WITH([src-path],
    [AS_HELP_STRING([--with-src-path=PATH],
        [Source directory path @<:@default=/var/www/htdocs/historytracers/@:>@])],
    [SRC_PATH=$withval],
    [SRC_PATH=/var/www/htdocs/historytracers/])

AC_ARG_WITH([content-path],
    [AS_HELP_STRING([--with-content-path=PATH],
        [Content directory path @<:@default=/var/www/htdocs/historytracers/www/@:>@])],
    [CONTENT_PATH=$withval],
    [CONTENT_PATH=/var/www/htdocs/historytracers/www/])

AC_ARG_WITH([log-path],
    [AS_HELP_STRING([--with-log-path=PATH],
        [Log directory path @<:@default=/var/log/historytracers/@:>@])],
    [LOG_PATH=$withval],
    [LOG_PATH=/var/log/historytracers/])

# Substitute the variables in Makefile
AC_SUBST([CONF_PATH])
AC_SUBST([SRC_PATH])
AC_SUBST([CONTENT_PATH])
AC_SUBST([LOG_PATH])

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
