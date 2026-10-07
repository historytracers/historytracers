#!/bin/sh
# Post-installation script for historytracers

config() {
  NEW="$1"
  OLD="$(dirname $NEW)/$(basename $NEW .new)"
  # If there's no config file by that name, move it over
  if [ ! -r $OLD ]; then
    mv $NEW $OLD
  elif [ "$(cat $OLD | md5sum)" = "$(cat $NEW | md5sum)" ]; then
    # toss the redundant copy
    rm $NEW
  fi
  # Otherwise, we leave the .new copy for the admin to consider
}

# Handle configuration files
config etc/historytracers/historytracers.conf.new

# Set proper permissions on web directories
if [ -d /usr/share/historytracers/www ]; then
  find /usr/share/historytracers/www -type d -exec chmod 755 {} \;
  find /usr/share/historytracers/www -type f -exec chmod 644 {} \;
fi

# Ensure log directory exists with correct permissions
if [ ! -d /var/log/historytracers ]; then
  mkdir -p /var/log/historytracers
  chmod 755 /var/log/historytracers
fi

echo ""
echo "History Tracers has been installed."
echo "Edit /etc/historytracers/historytracers.conf to customize paths."
echo ""
