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
config etc/historytracers/historytracers.conf.new 2>/dev/null || true

# Set proper permissions on web directories
if [ -d /usr/share/historytracers/www ]; then
  chmod -R 755 /usr/share/historytracers/www
fi

# Create user and group if they don't exist
if ! grep -q "^historytracers:" /etc/group 2>/dev/null; then
  echo "Creating historytracers group..."
  groupadd -r historytracers 2>/dev/null || true
fi

if ! grep -q "^historytracers:" /etc/passwd 2>/dev/null; then
  echo "Creating historytracers user..."
  useradd -r -g historytracers -s /bin/false -d /usr/share/historytracers -c "History Tracers" historytracers 2>/dev/null || true
fi

# Set ownership on web directories
chown -R historytracers:historytracers /usr/share/historytracers/ 2>/dev/null || true

echo ""
echo "History Tracers has been installed."
echo ""
echo "To start History Tracers:"
echo "bash /etc/rc.d/rc.historytracers start"
echo ""
echo "To enable at boot, make /etc/rc.d/rc.historytracers executable:"
echo "  chmod +x /etc/rc.d/rc.historytracers"
echo ""
echo "And add start command to /etc/rc.d/rc.local"
echo ""
