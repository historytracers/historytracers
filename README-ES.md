[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## ¿Qué es History Tracers?

Este proyecto es software libre distribuido bajo la licencia `GPL 3 o posterior`. Todo el contenido del proyecto está licenciado bajo [CC BY-NC 4.0 DEED](https://creativecommons.org/licenses/by-nc/4.0/), a menos que se indique lo contrario.

## ¿Por qué otro proyecto de educación?

La enseñanza suele ser un desafío diario tanto para estudiantes como para docentes, cada uno por distintas razones. Nuestro objetivo es apoyar a ambos lados del proceso de aprendizaje proporcionando diversas herramientas.

### La Herramienta Principal

No es de sorprender que la principal herramienta de enseñanza en *History Tracers* seas **TÚ**. A través de nuestro propio cuerpo y experiencias, exploramos diferentes ciencias.

### Textos con Audio

Con la excepción de dos secciones que pronto recibirán audio (*Historia General* y *Acontecimientos Históricos*), todos los textos del proyecto ya incluyen narración. De esta manera, además de leer y practicar, también puedes escuchar el contenido cuando lo desees.

### Imágenes

Los textos puramente escritos pueden resultar difíciles para algunos estudiantes. Por esta razón, ofrecemos contenido ilustrado siempre que sea necesario.

### Genealogía

Las relaciones familiares desempeñan un papel importante en la educación, ya que hacen que el conocimiento se convierta literalmente en parte de nuestras vidas. Por esta razón, incorporamos la genealogía en diferentes tipos de contenido.

### Prácticas

La enseñanza teórica es importante, pero la ciencia sin práctica no es ciencia. Por ello, la mayoría de los textos incluyen al final preguntas con respuestas para que puedas comprobar tu comprensión. Además, algunos textos presentan prácticas que pueden realizarse en casa.

### Multidisciplinariedad

La palabra que da nombre a esta sección es larga y significativa. Resalta la importancia de presentar juntos contenidos de diferentes disciplinas. Por esta razón, un mismo texto de *History Tracers* puede aparecer en varias secciones.

### Videos

En algunos textos, también ofrecemos videos para ilustrar aún más el contenido.


## ¿Por qué la necesidad de más proyectos de genealogía?

Existen diversos proyectos de genealogía destinados a ayudar a las personas a trazar su árbol genealógico. Algunos de ellos fomentan la colaboración, permitiendo que las personas trabajen juntas para descubrir a sus ancestros. Nuestro proyecto no busca competir con otros programas o sitios web para la creación de árboles genealógicos; su principal objetivo es ayudar a las personas a aplicar el método científico y comprender cómo ha evolucionado el conocimiento sobre las familias a lo largo del tiempo. Además, se destaca la participación de las familias en momentos históricos.

Además de explorar las relaciones familiares, nuestro proyecto aborda la lógica al enseñar diversas disciplinas científicas de manera integrada, lo que nos permite comprender no solo las dinámicas familiares, sino también el universo en su conjunto.

## ¿Por qué no puedo acceder al contenido en mi computadora?

Nuestro proyecto ha sido diseñado para evitar recargas constantes de la página y no alberga todo su código en un único archivo. Al intentar abrir el archivo `index.html` en tu computadora, este necesita cargar otros archivos `javascript`, lo que tu navegador interpreta como una solicitud [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default) y la bloquea.

Para que las personas puedan acceder al contenido localmente, hemos desarrollado un servidor web sencillo utilizando[GO](https://go.dev/). Una vez que hayas instalado GO en tu computadora, puedes ejecutar el siguiente comando:

```sh
$ go run src/history_tracers.go
Listening Port 12345 without devmode content /
```

Después de eso, podrás acceder al contenido a través de `http://localhost:12345`.

## ¿Cómo añadir un nuevo idioma?

Para incorporar un nuevo idioma al proyecto, primero debes crear un directorio. Luego, ejecuta un script que genere todos los archivos necesarios:

```sh
$ mkdir lang/es-ES
$ cd scripts
$ bash create_language.sh --path "es-ES" --msg "Aguardando traducción"
```

Finalmente, podrás modificar el contenido en otro idioma. Te recomendamos comenzar con los archivos cuyos nombres no siguen el formato [Universal Unique Identifier](https://developer.mozilla.org/en-US/docs/Glossary/UUID).

## Fuentes

El directorio `lang/sources/` contiene archivos JSON con las fuentes referenciadas en cada archivo de contenido. Cada archivo de contenido hace referencia a un archivo de fuentes correspondiente en el directorio `lang/sources/`, donde las citas de fuentes se clasifican en:

- **primary_sources**: Fuentes históricas o académicas primarias
- **reference_sources**: Materiales de referencia y fuentes secundarias
- **religious_sources**: Textos y documentos religiosos
- **social_media_sources**: Referencias de redes sociales

## Cómo compilar *History Tracers*

*History Tracers* utiliza **GNU Make** como sistema de compilación.

### Configuración inicial (primera vez)

Si es un clon fresco, necesita generar los archivos del sistema de compilación:

```sh
./bootstrap
```

Esto ejecuta `autoreconf` para generar el script configure y otros archivos requeridos.

### Configuración

Después de ejecutar bootstrap (o si tiene un script configure existente), ejecute `./configure` para configurar el entorno de compilación. Este script le permite personalizar las rutas de instalación y las opciones del compilador:

```sh
$ ./configure [OPCIONES]
```

Opciones disponibles:

- `--prefix=PREFIJO` - Directorio de prefijo de instalación [/usr]
- `--with-go-compiler=COMPILADOR` - Especificar el compilador Go (go, gccgo o ruta completa) [auto]
- `--with-conf-path=RUTA` - Ruta del archivo de configuración [/etc/historytracers/historytracers.conf]
- `--with-src-path=RUTA` - Ruta del directorio de origen [/var/www/htdocs/historytracers/]
- `--with-content-path=RUTA` - Ruta del directorio de contenido [/usr/share/historytracers/www/]
- `--with-log-path=RUTA` - Ruta del directorio de registros [/var/log/historytracers/]
- `--help` - Mostrar todas las opciones disponibles

Para ver una lista completa de opciones, ejecute:
```sh
$ ./configure --help
```

### Comandos de Compilación

```sh
$ make                    # Compilar ambos binarios (webserver y editor)
$ make all                # Alias para make
$ make webserver          # Compilar solo el servidor web
$ make editor             # Compilar solo el editor
$ make dev                # Compilación de desarrollo (sin flags de optimización)
$ make prod               # Compilación de producción (con optimización)
```

### Compilación en Windows

El proyecto puede compilarse en Windows usando tanto GNU Autotools (como en Linux) como directamente con Go.

#### Opción 1: Usando Go directamente

```powershell
cd src\webserver
go build -o historytracers.exe .

cd ..\editor
```

**Nota:** El editor requiere que CGO esté habilitado (el framework GUI Fyne necesita OpenGL).

En Windows, ejecute:
```powershell
$env:CGO_ENABLED = "1"
go build -o historytracers-editor.exe .
```

O habilite CGO permanentemente:
```powershell
[System.Environment]::SetEnvironmentVariable("CGO_ENABLED", "1", "User")
go build -o historytracers-editor.exe .
```

Asegúrese de que gcc esté en PATH (instale con MSYS2: `pacman -S mingw-w64-x86_64-toolchain`)

#### Opción 2: Usando Autotools (requiere MSYS2 o similar)

```sh
./configure
make
```

En Windows, el script configure establece automáticamente las rutas predeterminadas:
- Configuración: `C:\ProgramData\historytracers\historytracers.conf`
- Contenido: `C:\inetpub\wwwroot\historytracers\`
- Registros: `C:\ProgramData\historytracers\log\`

### Gestión del Servicio de Windows

El servidor web puede ejecutarse como un Servicio de Windows. Esto proporciona inicio automático y operación adecuada en segundo plano.

#### Instalación del Servicio

Ejecutar como Administrador:

```powershell
.\historytracers.exe install
```

Esto registrará el servicio con Windows. De forma predeterminada, el servicio está configurado para iniciar automáticamente.

#### Iniciar el Servicio

```powershell
sc start historytracers
```

O simplemente reinicie su computadora - el servicio se iniciará automáticamente.

#### Detener el Servicio

```powershell
sc stop historytracers
```

#### Desinstalar el Servicio

```powershell
.\historytracers.exe uninstall
```

#### Ejecutar en Modo Consola

Para depurar o probar, puede ejecutar el servidor en modo consola:

```powershell
.\historytracers.exe         # Modo consola normal
.\historytracers.exe debug   # Modo depuración (muestra salida adicional)
```

#### Configuración del Servicio

El servicio de Windows usa el mismo archivo de configuración que el modo consola. Rutas predeterminadas en Windows:
- Config: `C:\ProgramData\historytracers\historytracers.conf`
- Registros: `C:\ProgramData\historytracers\log\`

Puede modificar estas rutas en el archivo de configuración o reconstruir con rutas personalizadas usando `./configure --with-conf-path=RUTA`.

### Pruebas

```sh
$ make test               # Ejecutar todas las pruebas en src/webserver y src/editor
```

Para ejecutar una prueba específica:

```sh
$ cd src/webserver && go test -run TestFunctionName ./...
$ cd src/editor && go test -run TestFunctionName ./...
```

### Calidad de Código

```sh
$ make fmt                # Formatear todo el código Go (go fmt)
```

Formateo manual:

```sh
$ cd src/webserver && go fmt ./...
$ cd src/editor && go fmt ./...
```

### Gestión de Dependencias

```sh
$ make deps               # Instalar dependencias
$ make update-deps        # Actualizar todas las dependencias
```

### Instalación y Limpieza

```sh
$ make install            # Instalar binarios en el sistema
$ make clean              # Eliminar artefactos de compilación
```

