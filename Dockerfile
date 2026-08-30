FROM fedora:44 AS base

RUN dnf install -y rpmdevtools rpm-build make gcc golang nodejs autoconf automake which tar gzip findutils coreutils sed gawk && dnf clean all

RUN useradd rpmbuild -u 5002 -m && \
    rpmdev-setuptree

WORKDIR /workspace
COPY . .

# RPM release image (default for backwards compatibility when built with --target rpm)
FROM base AS rpm
ENTRYPOINT ["bash", "./historytracers2pkg.sh"]
CMD ["-r"]

# Static release image – used during release to generate the static binary
# Build:  docker build --target static -t historytracers:static .
#   or:   docker build -f Dockerfile.static -t historytracers:static .
# Run:    docker run --rm -v $(pwd)/artifacts:/workspace/artifacts historytracers:static
FROM base AS static
ENTRYPOINT ["bash", "./historytracers2static.sh"]
