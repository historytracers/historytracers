# History Tracers web content container

A simple Docker container that packages the static `www/` content with a
built-in webserver (nginx). It contains no build logic - the `www/` tree
must already be generated before building the image.

## Build

Run from the repository root (the build context is the whole project, but
only `www/` is copied into the image):

```
docker build -t historytracers:www -f packaging/Docker/Dockerfile .
```

## Run

```
docker run --rm -p 8080:80 historytracers:www
```

The site is then available at `http://localhost:8080/`.

## Contents

```
packaging/Docker/Dockerfile
packaging/Docker/README.md
```

The image serves the full `www/` tree (including `images/`) from
`/usr/share/nginx/html/`, replicating the standalone
`historytracers-www` + `historytracers-images` packages in a single
container.
