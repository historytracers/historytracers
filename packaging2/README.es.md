<!--
SPDX-License-Identifier: GPL-3.0-or-later
History Tracers packaging guide (Spanish)
-->

# Empaquetado

Este directorio contiene todo lo necesario para empaquetar y distribuir
History Tracers: Debian, RPM, Slackware, Windows (MSI mediante WiX),
instalador estático auto-extractor, la unidad systemd del servicio, los
archivos de configuración y la definición del contenedor Docker.

Todos los formatos se generan con un único script desde la raíz del
repositorio: `historytracers2pkg.sh`.

## Requisitos

El script compila primero todo el proyecto (autotools, Go, Node), por
lo que se necesita una cadena de herramientas completa de
compilación. Para instalar las dependencias de
empaquetado/compilación de tu sistema:

```bash
sudo ./packaging/historytracers-install-requirements.sh
```

Consulta el `README.md` de la raíz para la lista completa de
herramientas.

## Generación de los paquetes

Ejecuta los comandos **desde la raíz del repositorio**. Cada ejecución
primero formatea y publica el contenido (`autoreconf`, `./configure`,
`make` y el publisher) y después produce el formato seleccionado en
`artifacts/`.

| Opción | Genera |
| --- | --- |
| `--deb`, `-d` | Paquetes Debian |
| `--rpm`, `-r` | Paquetes RPM |
| `--slackbuild`, `-s` | SlackBuild de Slackware + tarballs |
| `--msi`, `-m` | MSI de Windows (solo Windows/MSYS) |
| `--static`, `-t` | Instalador auto-extractor + tar.gz |
| `--docker`, `-c` | Imagen de contenedor Docker |
| `--validate`, `-v` | Ejecuta `shellcheck` en el propio script |
| `--help`, `-h` | Ayuda |

```bash
./historytracers2pkg.sh -d        # Debian
./historytracers2pkg.sh -r        # RPM
./historytracers2pkg.sh -s        # Slackware
./historytracers2pkg.sh -t        # Instalador estático
./historytracers2pkg.sh -c        # Contenedor Docker
./historytracers2pkg.sh -m        # MSI (solo Windows/MSYS)
```

Si no se indica ninguna opción, el formato se elige automáticamente
según el entorno actual (Slackware, MSYS/Windows, Debian o
Fedora/RHEL).

> Nota: la etapa de compilación del contenido es larga. Toda la salida
> queda en el directorio `artifacts/` de la raíz del repositorio.

## Instalación de los paquetes

Los ejemplos siguientes usan la versión `1.0.0`; sustitúyela por la
versión generada.

### Debian

```bash
sudo apt install ./artifacts/historytracers_1.0.0-*.deb
```

Esto instala el paquete principal (`historytracers`: binario, servicio
systemd y configuración). Los subpaquetes `-www` (contenido web),
`-images` (imágenes) y `-devel` (código fuente) producidos por la
misma compilación se usan como dependencias; instálalos en el mismo
comando cuando sus repositorios no estén disponibles:

```bash
sudo apt install \
    ./artifacts/historytracers_1.0.0-*.deb \
    ./artifacts/historytracers-www_*.deb \
    ./artifacts/historytracers-images_*.deb \
    ./artifacts/historytracers-devel_*.deb
```

Después, habilita el servicio systemd:

```bash
sudo systemctl enable --now historytracers
```

El servicio ejecuta el servidor local de History Tracers para el
contenido instalado en `/var/www/htdocs/historytracers/` con la
configuración en `/etc/historytracers/historytracers.conf`. Consulta
el journal para detalles:

```bash
journalctl -u historytracers
```

### RPM

```bash
sudo dnf install ./artifacts/historytracers-1.0.0-*.rpm
```

Después, habilita el servicio de la misma forma
(`sudo systemctl enable --now historytracers`).

### Slackware

```bash
# Extrae los archivos del SlackBuild, compila e instala
tar xzf artifacts/historytracers.tar.gz
cd historytracers
./historytracers.SlackBuild
sudo installpkg /tmp/historytracers-1.0.0-*.txz

# Nota: el glob de arriba también instala el paquete -www (contenido
# web para cualquier servidor). Un tarball separado con imágenes está
# disponible en artifacts/historytracers-images-1.0.0.tar.gz, si es
# necesario.
```

El tarball `artifacts/historytracers-1.0.0.tar.xz` contiene el árbol
genérico de código fuente usado por el SlackBuild.

### Windows (MSI)

Haz doble clic en `artifacts/HistoryTracers-1.0.0.msi` (o ejecuta
`msiexec /i HistoryTracers-1.0.0.msi`). Se construye solo en
Windows/MSYS con el WiX Toolset.

### Estático (instalador auto-extractor)

```bash
bash artifacts/historytracers-1.0.0-static-installer.sh          # instalar
sudo bash artifacts/historytracers-1.0.0-static-installer.sh     # instalación de sistema
```

Opciones útiles del instalador:

```bash
bash ... --check          # verifica las dependencias del sistema
bash ... --list           # lista los archivos que se instalarían
sudo bash ... --prefix /usr/local
sudo bash ... --uninstall # elimina la instalación
```

Un tarball simple `artifacts/historytracers-static-1.0.0.tar.gz`
también se genera para extracción manual, junto con un tarball web
`artifacts/historytracers-www-1.0.0.tar.gz` para cualquier servidor
web externo (Apache, IIS, ...).

## Ejecución del contenedor Docker

```bash
./historytracers2pkg.sh --docker
```

Esto compila y etiqueta `historytracers:<versión>` (además de
`historytracers:latest`) y exporta un tarball portátil de la imagen a
`artifacts/historytracers-<versión>-docker.tar.gz`.

Ejecuta el contenedor tras la compilación:

```bash
docker run --rm -p 8080:80 historytracers:latest
```

A continuación, abre el sitio en <http://localhost:8080/>.

En otra máquina (o para distribuirlo como artefacto de CI), carga
primero la imagen exportada:

```bash
docker load < artifacts/historytracers-1.0.0-docker.tar.gz
docker run --rm -p 8080:80 historytracers:1.0.0
```

La imagen es autocontenida: incluye el contenido web estático (`www/`,
incluyendo `images/`) y un servidor web nginx. No requiere
configuración para servir el sitio por defecto. Consulta
`Docker/README.md` para los detalles del contenedor.

## Diagnóstico de problemas

- `--docker` informa por separado del estado del CLI y del daemon: si
  el socket del daemon no está accesible (por ejemplo,
  `permission denied`), indica añadir el usuario al grupo docker
  (`sudo usermod -aG docker $(whoami) && newgrp docker`) o ejecutar el
  script con sudo.
- Herramientas ausentes en las compilaciones RPM/DEB: ejecuta
  `sudo ./packaging/historytracers-install-requirements.sh`.
- Validación del script: `./historytracers2pkg.sh --validate`.
