# SPDX-License-Identifier: GPL-3.0-or-later
# History Tracers web content container
#
# Self-contained runtime image: a webserver (nginx) serving the static
# www/ content. No build steps are performed - www/ must already be
# generated (e.g. by build/historytracers-publisher -minify).
#
# Build from the repository root (build context is the project root):
#   docker build -t historytracers:www -f packaging/Docker/Dockerfile .
#
# Run:
#   docker run --rm -p 8080:80 historytracers:www
#
# The site is then available at http://localhost:8080/

FROM nginx:alpine

COPY www/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
    CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
