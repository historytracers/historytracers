#!/bin/sh
# Post-installation script for historytracers

config() {
  NEW="$1"
  OLD="$(dirname "$NEW")/$(basename "$NEW" .new)"
  # If there's no config file by that name, move it over
  if [ ! -r "$OLD" ]; then
    mv "$NEW" "$OLD"
  elif [ "$(md5sum "$OLD" | cut -d' ' -f1)" = "$(md5sum "$NEW" | cut -d' ' -f1)" ]; then
    # toss the redundant copy
    rm "$NEW"
  fi
  # Otherwise, we leave the .new copy for the admin to consider
}

# Handle configuration files
config etc/historytracers/historytracers.conf.new 2>/dev/null || true

# Create user and group if they don't exist
if ! getent group historytracers >/dev/null 2>&1; then
  echo "Creating historytracers group..."
  groupadd -r historytracers 2>/dev/null || true
fi

if ! getent passwd historytracers >/dev/null 2>&1; then
  echo "Creating historytracers user..."
  useradd -r -g historytracers -s /bin/false -d /usr/share/historytracers -c "History Tracers" historytracers 2>/dev/null || true
fi

# Set ownership on data/config/state (binaries and devel sources stay root-owned).
# The web tree belongs to the historytracers-www package but is chowned here
# as well so co-installed content ends up owned by the service user.
chown -R historytracers:historytracers /var/www/htdocs/historytracers 2>/dev/null || true
chown -R historytracers:historytracers /etc/historytracers 2>/dev/null || true
mkdir -p /var/lib/historytracers /var/log/historytracers 2>/dev/null || true
chown historytracers:historytracers /var/lib/historytracers 2>/dev/null || true
chown historytracers:historytracers /var/log/historytracers 2>/dev/null || true

echo ""
echo "History Tracers has been installed."
echo ""
