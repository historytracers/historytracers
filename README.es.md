[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/historytracers/historytracers?utm_source=oss&utm_medium=github&utm_campaign=historytracers%2Fhistorytracers&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## ¿Qué es History Tracers?

Este proyecto es software libre distribuido bajo la licencia `GPL 3 o posterior`. Todo el contenido del proyecto está licenciado bajo [CC BY-NC 4.0 DEED](https://creativecommons.org/licenses/by-nc/4.0/), a menos que se indique lo contrario.

**History Tracers** es más que un sitio educativo — es un ecosistema de aprendizaje construido para todos. Ya seas un estudiante ansioso por comprender, un docente que busca nuevas formas de explicar, o simplemente una mente curiosa, este proyecto fue hecho para ti. Todo el contenido es gratuito, disponible en varios idiomas, y está pensado para que **cuando entiendes *por qué* algo funciona, nunca olvidas *cómo* funciona.**

<p align="center">
  <img src="images/HistoryTracers/EditorViewer.jpg" alt="Visor y Editor de History Tracers" width="700" />
  <br />
  <em>El Visor y el Editor de History Tracers — herramientas de software libre creadas para que todos puedan aprender y enseñar.</em>
</p>

La imagen anterior muestra las dos aplicaciones de software en el corazón de este proyecto: el **Visor** y el **Editor**. El Visor es tu puerta de entrada al conocimiento — permite navegar por las lecciones, ver imágenes, escuchar narraciones de audio y explorar contenido interactivo. El Editor es tu puerta de entrada a la contribución — ofrece una interfaz sencilla para escribir nuevos textos, agregar fuentes y publicar contenido educativo en varios idiomas. Juntos, forman un ecosistema de aprendizaje completo: **un lado enseña, el otro aprende, y ambos son gratuitos para todos.**

## ¿Por qué otro proyecto de educación?

La enseñanza suele ser un desafío diario tanto para estudiantes como para docentes, cada uno por distintas razones. Nuestro objetivo es apoyar a ambos lados del proceso de aprendizaje proporcionando diversas herramientas que hagan el conocimiento accesible, atractivo y personal.

### La Herramienta Principal

No es de sorprender que la principal herramienta de enseñanza en *History Tracers* seas **TÚ**. A través de nuestro propio cuerpo y experiencias, exploramos diferentes ciencias. Tus manos, tus dedos, tus pasos — todo son instrumentos de aprendizaje.

### Textos con Audio

Todos los textos del proyecto ya cuentan con narración. De esta manera, además de leer y practicar, también puedes escuchar el contenido cuando lo desees — en el autobús, durante un paseo o antes de dormir.

### Imágenes

Los textos puramente escritos pueden resultar difíciles para algunas personas. Por esta razón, presentamos contenido ilustrado siempre que sea necesario. Una sola imagen puede reemplazar mil palabras de explicación.

### Genealogía

Las relaciones familiares desempeñan un papel importante en la educación, ya que hacen que el conocimiento se convierta literalmente en parte de nuestras vidas. Cuando ves tu propio árbol genealógico conectado a la historia de los números, las matemáticas dejan de ser abstractas — se vuelven personales.

### Prácticas

La enseñanza teórica es importante, pero la ciencia sin práctica no es ciencia. Por ello, la mayoría de los textos incluyen al final preguntas con respuestas para que puedas comprobar tu comprensión. Además, algunos textos presentan prácticas que pueden realizarse en casa. **Pruébalo ahora — aprender haciendo es el tipo más profundo de aprendizaje.**

### Multidisciplinariedad

La palabra que da nombre a esta sección es larga y profunda. Resalta la importancia de presentar juntos contenidos de diferentes disciplinas. Por esta razón, un mismo texto de *History Tracers* puede aparecer en varias secciones. **El conocimiento no vive en cajas aisladas — se conecta, como las ramas de un árbol.**

### Videos

En algunos textos, también presentamos videos para ilustrar aún más el contenido, trayendo la historia y la ciencia a la vida a través de la imagen y el sonido.


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

Si es un clon fresco, primero inicialice el submódulo del proyecto:

```sh
git submodule update --init
```

Luego genere los archivos del sistema de compilación:

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
$ make                    # Compilar publisher, editor y viewer
$ make all                # Alias para make
$ make publisher          # Compilar solo el publisher
$ make editor             # Compilar solo el editor
$ make dev                # Compilación de desarrollo (sin flags de optimización)
$ make prod               # Compilación de producción (con optimización)
```

### Compilación en Windows

El proyecto puede compilarse en Windows usando tanto GNU Autotools (como en Linux) como directamente con Go.

#### Opción 1: Usando Go directamente

```powershell
cd src\publisher
go build -o historytracers-publisher.exe .

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

### Procesamiento por Lotes

La herramienta de línea de comandos del publisher procesa tareas de generación de contenido (minify, audio, GEDCOM, etc.). Ejecútelo con `--help` para ver las opciones disponibles.

### Pruebas

```sh
make test                 # Ejecutar todas las pruebas en src/publisher, src/viewer y las pruebas unitarias de JavaScript; las pruebas de src/editor se ejecutan solo cuando BUILD_EDITOR está habilitado
```

El objetivo `test` también ejecuta las pruebas unitarias de JavaScript (`src/js/test_ht_math.js`) con el ejecutor de pruebas integrado de Node.js (`node --test`). Se requiere Node.js >= 20; instálelo antes de ejecutar `make test` (por ejemplo, `dnf install nodejs` en Fedora, `apt install nodejs` en Debian/Ubuntu, o consulte `packaging/historytracers-install-requirements.sh`).

Para ejecutar una prueba específica:

```sh
$ cd src/publisher && go test -run TestFunctionName ./...
$ cd src/editor && go test -run TestFunctionName ./...
```

### Calidad de Código

```sh
$ make fmt                # Formatear todo el código Go (go fmt)
```

Formateo manual:

```sh
$ cd src/publisher && go fmt ./...
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

> **Estado del Editor:** El History Tracers Editor se encuentra actualmente en desarrollo y **no está incluido** en los paquetes generados por defecto. Para compilar y usar el editor, ejecute `./historytracers-installer.sh`.

