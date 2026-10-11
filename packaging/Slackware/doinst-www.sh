#!/bin/sh
# Post-installation script for historytracers-www (standalone web content).
# No service user or ownership changes: any web server (Apache, IIS)
# can serve /usr/share/historytracers/www directly.

# Set proper permissions on web directories (dirs 755, files 644)
if [ -d /usr/share/historytracers/www ]; then
  find /usr/share/historytracers/www -type d -exec chmod 755 {} \; 2>/dev/null || true
  find /usr/share/historytracers/www -type f -exec chmod 644 {} \; 2>/dev/null || true
fi

echo ""
echo "History Tracers web content has been installed to"
echo "/usr/share/historytracers/www."
echo "Point your web server (e.g. Apache, IIS) at that directory."
echo ""
