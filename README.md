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
$ bash create_language.sh --path "es-ES" --msg "Aguardando tradução"
```

Lastly, you can incorporate content in another language. It's advisable to commence by handling files whose names do not follow the [Universal Unique Identifier](https://developer.mozilla.org/en-US/docs/Glossary/UUID) format.

## Sources

The `lang/sources/` directory contains JSON files with the sources referenced in each content file. Each content file references a corresponding sources file in the `lang/sources/` directory, where source citations are categorized into:

- **primary_sources**: Primary historical or academic sources
- **reference_sources**: Reference materials and secondary sources
- **religious_sources**: Religious texts and documents
- **social_media_sources**: Social media references

## How to Compile *History Tracers*

*History Tracers* uses **GNU Make** as its build system.

### Initial Setup (first time only)

If this is a fresh clone, you need to generate the build system files:

```sh
./bootstrap
```

This runs `autoreconf` to generate the configure script and other required files.

### Configuration

After running bootstrap (or if you have an existing configure script), run `./configure` to set up the build environment. This script allows you to customize installation paths and compiler options:

```sh
$ ./configure [OPTIONS]
```

Available options:

- `--prefix=PREFIX` - Installation prefix directory [/usr]
- `--with-go-compiler=COMPILER` - Specify Go compiler (go, gccgo, or full path) [auto]
- `--with-conf-path=PATH` - Configuration file path [/etc/historytracers/historytracers.conf]
- `--with-src-path=PATH` - Source directory path [/var/www/htdocs/historytracers/]
- `--with-content-path=PATH` - Content directory path [/usr/share/historytracers/www/]
- `--with-log-path=PATH` - Log directory path [/var/log/historytracers/]
- `--help` - Display all available options

For a complete list of options, run:
```sh
$ ./configure --help
```

### Build Commands

```sh
$ make                    # Build both webserver and editor binaries
$ make all                # Alias for make
$ make webserver          # Build only web server
$ make editor             # Build only the editor
$ make dev                # Development build (no optimization flags)
$ make prod               # Production build (with optimization)
```

### Compiling on Windows

The project can be compiled on Windows using either the GNU Autotools (like on Linux) or directly with Go.

#### Option 1: Using Go directly

```powershell
cd src\webserver
go build -o historytracers.exe .

cd ..\editor
```

**Note:** The editor requires CGO to be enabled (Fyne GUI framework needs OpenGL).

On Windows, run:
```powershell
$env:CGO_ENABLED = "1"
go build -o historytracers-editor.exe .
```

Or permanently enable CGO:
```powershell
[System.Environment]::SetEnvironmentVariable("CGO_ENABLED", "1", "User")
go build -o historytracers-editor.exe .
```

Make sure gcc is in PATH (install with MSYS2: `pacman -S mingw-w64-x86_64-toolchain`)

#### Option 2: Using Autotools (requires MSYS2 or similar)

```sh
./configure
make
```

On Windows, the configure script automatically sets appropriate default paths:
- Configuration: `C:\ProgramData\historytracers\historytracers.conf`
- Content: `C:\inetpub\wwwroot\historytracers\`
- Logs: `C:\ProgramData\historytracers\log\`

### Windows Service Management

The webserver can run as a Windows Service. This provides automatic startup and proper background operation.

#### Installing the Service

Run as Administrator:

```powershell
.\historytracers.exe install
```

This will register the service with Windows. By default, the service is set to start automatically.

#### Starting the Service

```powershell
sc start historytracers
```

Or simply restart your computer - the service will start automatically.

#### Stopping the Service

```powershell
sc stop historytracers
```

#### Uninstalling the Service

```powershell
.\historytracers.exe uninstall
```

#### Running in Console Mode

For debugging or testing, you can run the server in console mode:

```powershell
.\historytracers.exe         # Normal console mode
.\historytracers.exe debug   # Debug mode (shows additional output)
```

#### Service Configuration

The Windows service uses the same configuration file as console mode. Default paths on Windows:
- Config: `C:\ProgramData\historytracers\historytracers.conf`
- Logs: `C:\ProgramData\historytracers\log\`

You can modify these paths in the configuration file or rebuild with custom paths using `./configure --with-conf-path=PATH`.

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

