## src/

Este directorio contiene archivos de código fuente que sirven como plantillas para la generación de contenido en el proyecto History Tracers.

### Subdirectorios

La estructura de directorios está organizada de la siguiente manera:

- **`css/`**  
  Hojas de estilo para el formato de contenido
- **`images/`**  
  Los archivos fuente de las imágenes se encuentran en `images/HistoryTracers`
- **`js/`**  
  Scripts JavaScript utilizados en juegos y contenido textual
- **`json/`**  
  Contiene todas las plantillas de contenido del sitio
- **`webserver/`**  
  Código fuente del servidor web

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
- **`ht_charts.js`**  
  Se integra con [Chart.js](https://www.chartjs.org/) para visualización de datos
- **`ht_math.js`**  
  Operaciones y cálculos matemáticos

### Plantillas JSON

Las plantillas de generación de contenido incluyen:

#### Tipos de contenido:
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
