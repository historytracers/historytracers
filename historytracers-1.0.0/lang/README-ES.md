## Lenguas

Este directorio contiene archivos JSON que se cargan cuando se acceden a determinadas páginas.

### Añadir un nuevo idioma

El primer paso para añadir una nueva lengua es ejecutar el script `scripts/bash/create_language.sh`. Este script creará un nuevo directorio para el idioma y también generará archivos vacíos para los textos ya publicados que serán traducidos.

Sugerimos que antes de publicar los archivos traducidos, modifiques los archivos `main.json` en cada directorio de lenguas, indicando la etapa actual de la traducción.

### Directorios

Los siguientes subdirectorios están presentes en este directorio:

-  `aa-BB`: Estos son los directorios de lenguas, donde `aa` representa el código del idioma y `BB` la sigla del país.
-  `aa-BB/smGame`: Contiene los archivos para el Juego del *Método Científico*.
-  `lang_list.json`: Al instalar History Tracers mediante paquetes, no es necesario instalar todos los idiomas disponibles. Este archivo se utiliza para informar al panel de control sobre los idiomas disponibles.
-  `source`: Este directorio contiene los archivos que tienen las fuentes mencionadas en los archivos de lenguaje.

