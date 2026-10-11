#!/bin/sh
# Post-installation script for historytracers-www (standalone web content).
# No service user or ownership changes: any web server (Apache, IIS)
# can serve /var/www/htdocs/historytracers directly.

# Set proper permissions on web directories (dirs 755, files 644)
if [ -d /var/www/htdocs/historytracers ]; then
  find /var/www/htdocs/historytracers -type d -exec chmod 755 {} \; 2>/dev/null || true
  find /var/www/htdocs/historytracers -type f -exec chmod 644 {} \; 2>/dev/null || true
fi

echo ""
echo "History Tracers web content has been installed to"
echo "/var/www/htdocs/historytracers."
echo "Point your web server (e.g. Apache, IIS) at that directory."
echo ""
