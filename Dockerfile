FROM fedora:41

RUN dnf install -y rpmdevtools rpm-build make gcc golang autoconf automake which && dnf clean all

RUN useradd rpmbuild -u 5002 -m && \
    rpmdev-setuptree

WORKDIR /workspace
COPY . .

# Run build script directly
ENTRYPOINT ["/workspace/ht2pkg.sh"]
CMD ["-r"]
