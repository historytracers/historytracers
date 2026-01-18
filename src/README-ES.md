## src/

Este directorio contiene archivos de código fuente que sirven como plantillas para la generación de contenido en el proyecto History Tracers.

### Subdirectorios

La estructura de directorios está organizada de la siguiente manera:

- **`bodies/`**  
  Archivos de plantilla HTML para el renderizado de contenido
- **`common/`**  
  Código fuente Go compartido utilizado en el servidor web y el editor
- **`css/`**  
  Hojas de estilo para el formato de contenido
- **`editor/`**  
  Código fuente del editor de escritorio (aplicación Go basada en Fyne)
- **`images/`**  
  Los archivos fuente de las imágenes se encuentran en `images/HistoryTracers`
- **`js/`**  
  Scripts JavaScript utilizados en juegos y contenido textual
- **`json/`**  
  Contiene todas las plantillas de contenido del sitio
- **`webserver/`**  
  Código fuente del servidor web (aplicación Go)

### Código Fuente Go

#### Módulo Común (`common/`)
Utilidades compartidas y estructuras de datos utilizadas tanto por el servidor web como por el editor:

- **`config.go`**  
  Gestión de configuración
- **`data-type.go`**  
  Definiciones de tipos de datos para genealogía y contenido
- **`timestamp.go`**  
  Utilidades de marcas de tiempo
- **`go.mod`**  
  Definición del módulo Go

#### Módulo Webserver (`webserver/`)
Servidor HTTP para servir contenido de History Tracers:

- **`main.go`**  
  Punto de entrada del servidor web
- **`server.go`**  
  Configuración y enrutamiento del servidor HTTP
- **`common.go`**  
  Utilidades y funciones auxiliares compartidas
- **`config.go`**  
  Gestión de configuración
- **`audio.go`**  
  Servido y procesamiento de archivos de audio
- **`atlas.go`**  
  Gestión de contenido de atlas geográficos
- **`class.go`**  
  Servido de contenido de clases/lecciones
- **`csv_gedcom.go`**  
  Procesamiento de archivos CSV y GEDCOM
- **`minify.go`**  
  Utilidades de minificación
- **`hash.go`**  
  Generación y verificación de hash
- **`git.go`**  
  Integración con Git para seguimiento de versiones
- **`go.mod`**  
  Definición del módulo Go

#### Módulo Editor (`editor/`)
Aplicación de editor de genealogía de escritorio:

- **`main.go`**  
  Punto de entrada del editor
- **`common.go`**  
  Utilidades compartidas
- **`config.go`**  
  Gestión de configuración
- **`files.go`**  
  Operaciones y gestión de archivos
- **`tabs.go`**  
  Gestión de pestañas en la interfaz del editor
- **`settings.go`**  
  Configuración del editor
- **`go.mod`**  
  Definición del módulo Go

### Plantillas HTML

- **`bodies/main.html`**  
  Plantilla HTML principal para el renderizado de contenido

### Archivos CSS

El formato de estilos está dividido en dos archivos principales:

- **`ht_common.css`**  
  Estilos globales utilizados en todo el proyecto
- **`ht_math.css`**  
  Formato especializado para:
  - Números Yupana
  - Numeración mesoamericana
  - Otros elementos matemáticos

### Archivos JavaScript

Estos scripts funcionan como plantillas para generación de contenido:

#### Scripts principales:
- **`ht_classes.js`**  
  Contiene funciones de carga de contenido y lógica para corrección de ejercicios
- **`ht_common.js`**  
  Script principal del proyecto con funcionalidades compartidas

#### Scripts especializados:
- **`ht_chart.js`**  
  Se integra con [Chart.js](https://www.chartjs.org/) para visualización de datos
- **`ht_math.js`**  
  Operaciones y cálculos matemáticos

### Plantillas JSON

Las plantillas de generación de contenido incluyen:

#### Tipos de contenido:
- **`index_template.json`**  
  Estructura de contenido de la página de índice
- **`atlas_template.json`**  
  Estructura de contenido para atlas geográficos
- **`class_template.json`**  
  Marco para contenido de clases/lecciones

#### Plantillas especializadas:
- **`family_template.json`**  
  Mapeo de relaciones genealógicas
- **`scientific_method_game_template.json`**  
  Estructura para el juego *Método Científico*
- **`sources_template.json`**  
  Formato de citas y referencias para otras plantillas
