# Plantillas

Este directorio contiene plantillas para crear contenido en **History Tracers**.

## Archivos

Los siguientes archivos de plantilla están disponibles:

- `atlas_template.json`: Plantilla para páginas de atlas.
- `class_template.json`: Plantilla para secciones: **Primeros Pasos**, **Comprensión de Textos**, **Historia General** e **Indígenas (¿Quién...?)**.
- `family_template.json`: Plantilla para la sección **Árboles Genealógicos**.
- `scientific_method_game_template.json`: Plantilla para niveles del **Juego del Método Científico**.
- `source_template.json`: Plantilla base para todas las secciones.

### Estructura de la Plantilla Class

Esta plantilla contiene cinco secciones principales:

#### Sección de Encabezado

Incluye los siguientes campos:

- `title`: Mostrado en la barra de título de la aplicación/página.
- `header`: Mostrado en la parte superior de la página/sección.
- `sources`: Array de archivos fuentes referenciados.
- `scripts`: Array de archivos JavaScript asociados.
- `audio`: Enlaces a archivos de audio externos.
- `index`: Array de archivos de sección relacionados.
- `license`: Licencias del proyecto:
  - `SPDX-License-Identifier: GPL-3.0-or-later`
  - `CC BY-NC 4.0 DEED`
- `last_update`: Marca de tiempo Unix Epoch de última modificación.
- `authors`: Array de nombres de colaboradores.
- `reviewers`: Array de nombres de revisores.
- `version`: Versión del formato (actualmente 1 ó 2).
- `type`: Tipo de contenido (siempre `class` para esta plantilla).
- `editing`: Estado actual del archivo para el panel.

#### Sección de Contenido

Array de contenido visual con estos campos:

- `id`: Para crear elementos `div`
- `text`: Array que contiene:
  - `text`: Contenido en formato HTML/Markdown
  - `source`: Array de objetos fuente con:
    - `type`: Clasificación:
      - 0: Primaria
      - 1: Referencia
      - 2: Religiosa
      - 3: Red Social
    - `uuid`: Identificador único que coincide con entradas del archivo fuente.
    - `text`: Texto de cita.
    - `date_time`: Fecha de publicación en formato epoch.
- `date_time`: Array de fechas referenciadas.
- `is_table`: Bandera booleana para procesamiento Markdown.
- `img_desc`: Descripción de audio para imágenes.
- `format`: Formato del contenido (`html` o `markdown`).
- `PostMention`: Carácter/texto final (para listas o cierres).

#### Sección Exercise V2 (Opcional)

Ejercicios cargados en tiempo de ejecución con:

- `question`: Pregunta Sí/No.
- `yesNoAnswer`: Respuesta correcta (Sí/No).
- `additionalInfo`: Información complementaria tras validación.

#### Sección Game V2

Array con descripciones de imágenes y fechas de captura.

#### Sección Date Time

Array de fechas usadas en contenido HTML.
