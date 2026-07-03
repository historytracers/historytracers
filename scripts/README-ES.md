## Python

Este directorio contiene scripts para generar contenido del proyecto History Tracers.

### Subdirectorios

- **`bash/`**  
  Contiene scripts Bash para creación de archivos y configuración del proyecto
- **`python/`**  
  Contiene scripts Python para generación de imágenes

### Scripts Bash

Todos los scripts Bash están diseñados para ejecutarse dentro de sus respectivos directorios y manejarán automáticamente los cambios de directorio cuando sea necesario.

#### Scripts disponibles:
- **`create_game.sh`**  
  Genera archivos para el juego *Método Científico* (modificable para otros juegos)
- **`create_language.sh`**  
  Configura nuevos directorios de idioma con archivos plantilla
- **`ht_tts.sh`**  
  Convierte texto a audio WAV usando archivos de entrada:
  - `PT_TEXT`
  - `ES_TEXT`
  - `EN_TEXT`

#### Directorio auxiliar:
- **`models/`**  
  Contiene modelos usados por `ht_tts.sh` para conversión de texto a voz

### Scripts Python

Estos scripts pueden ejecutarse desde cualquier ubicación, aunque las imágenes generadas requieren colocación manual en sus directorios finales.

Todos los scripts actuales producen imágenes para la sección *Primeros Pasos*.

#### Scripts de generación de imágenes:
- **Formas básicas**
  - `sphere.py` - Visualización de esfera
  - `pyramid.py` - Visualización de pirámide
  - `pentagonal_pyramid.py` - Pirámide pentagonal
  - `parallelepiped.py` - Paralelepípedo

- **Gráficos y diagramas**
  - `2daxis.py` - Gráfico de coordenadas 2D
  - `line.py` - Gráfico lineal 1D
  - `trigonometry.py` - Gráficas de ondas seno/coseno

- **Utilidades**
  - `geographical2mathcoord.py` - Conversión de sistemas de coordenadas
  - `csv_to_gedcom.py` - Conversión de History Tracers CSV a GEDCOM
