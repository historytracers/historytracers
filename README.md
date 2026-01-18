[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## What is History Tracers?

This project is free software distributed under the `GPL 3 or later` license. All content on the project is licensed under [CC BY-NC 4.0 DEED](https://creativecommons.org/licenses/by-nc/4.0/), unless otherwise indicated.

## Why Another Educational Project?

Teaching is often a daily challenge for both students and teachers, each for different reasons. Our goal is to support both sides of the learning process by providing diverse tools.

### The Main Tool

Unsurprisingly, the main teaching tool in *History Tracers* is **YOU**. Through our own body, we study different sciences.

### Texts with Audio

With the exception of two sections that will soon receive audio (*General History* and *Historical Events*), all project texts already include narration. This way, in addition to reading and practicing, you can also listen to the content whenever you like.

### Images

Purely written texts may be challenging for some people. For this reason, we present illustrated content whenever necessary.

### Genealogy

Family relationships play an important role in education, as they make knowledge literally become part of our lives. For this reason, we use genealogy in different types of content.

### Practices

Theoretical teaching is important, but science without practice is not science. For this reason, most texts include, at the end, questions with answers so you can check whether you understood the content. In addition, some texts include practices that can be carried out at home.

### Multidisciplinarity

The word that names this section is long and equally deep. It highlights the need for content from different disciplines to be presented together. For this reason, the same text from *History Tracers* may appear in different sections.

### Videos

In some texts, we also present videos to further illustrate the content.

## Why Can't I Access the Site Locally?

Our project is designed to minimize page reloads and does not consolidate all its code into a single file. Consequently, attempting to open the `index.html` file locally triggers the need to load additional JavaScript files, resulting in your browser interpreting it as a [CORS request](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default), and blocking access.

To enable local access to the content, we have developed a simple web server using [GO](https://go.dev/). After installing GO on your host machine, you can execute the following command:

```sh
$ go run src/history_tracers.go
Listening Port 12345 without devmode content /
```

Once you've completed these steps, you can open your web browser and navigate to `http://localhost:12345`.

## Adding a New Language

To incorporate a new language into the project, begin by creating a directory. Subsequently, execute a script that automatically generates all necessary files for the new language:

```sh
$ mkdir lang/es-ES
$ cd scripts
$ bash create_language.sh --path "es-ES" --msg "Aguardando traducción"
```

Lastly, you can incorporate content in another language. It's advisable to commence by handling files whose names do not follow the [Universal Unique Identifier](https://developer.mozilla.org/en-US/docs/Glossary/UUID) format.

## How to Compile *History Tracers*

*History Tracers* uses **GNU Make** as its build system.

### Build Commands

```sh
$ make                    # Build both webserver and editor binaries
$ make all                # Alias for make
$ make webserver          # Build only web server
$ make editor             # Build only the editor
$ make dev                # Development build (no optimization flags)
$ make prod               # Production build (with optimization)
```

### Testing

```sh
$ make test               # Run all tests in src/webserver and src/editor
```

To run a single test:

```sh
$ cd src/webserver && go test -run TestFunctionName ./...
$ cd src/editor && go test -run TestFunctionName ./...
```

### Code Quality

```sh
$ make fmt                # Format all Go code (go fmt)
```

Manual formatting:

```sh
$ cd src/webserver && go fmt ./...
$ cd src/editor && go fmt ./...
```

### Dependency Management

```sh
$ make deps               # Install dependencies
$ make update-deps        # Update all dependencies
```

### Installation & Cleanup

```sh
$ make install            # Install binaries to system
$ make clean              # Remove build artifacts
```


To simplify the process, we’ve added the script `ht2pkg.sh`, which automatically runs all the steps required to generate the packages:

```sh
$ ./ht2pkg.sh
```

