## Scripts

Este directorio contiene varios scripts utilizados para generar contenidos para el proyecto History Tracers.

### Subdirectorios

Los siguientes subdirectorios están presentes en este directorio:

-  `bash`: Contiene scripts Bash usados para crear archivos para History Tracers.
-  `python`: Contiene scripts Python usados para generar imágenes utilizadas en History Tracers.

### Subdirectorio bash

Los scripts Bash están diseñados para ejecutarse en el directorio donde se encuentran. Cuando sea necesario, los scripts cambiarán de directorio para realizar sus tareas.

Los siguientes scripts están disponibles:

-  `create_class.sh`: Crea archivos para una nueva clase según el argumento proporcionado (`science`, `history`, and `first_steps`). 
-  `create_game.sh`: Crea archivos utilizados en el juego `Método Científico`. Los juegos futuros deben modificar este script para crear sus propios archivos.
-  `create_language.sh`: Crea un directorio para un nuevo idioma y copia los archivos necesarios en él.
-  `ht_tts.sh`: Realiza la conversión de un texto presente en uno de los archivos de entrada (`PT_TEXT`, `ES_TEXT` or `EN_TEXT`) a un archivo WAV.
-  `update_js_css.sh`: Cada vez que se modifican archivos dentro del directorio `src`, es necesario ejecutar este script para actualizar el índice.

### Subdirectorio python

Estos scripts no tienen restricciones de directorio para su ejecución, pero será necesario mover la imagen generada al directorio correspondiente.

Actualmente, todos los scripts disponibles en este subdirectorio generan imágenes utilizadas en la sección `Nosotros y el universo`.

Los siguientes scripts están disponibles:

-  `2daxis.py`: Genera un gráfico 2D.
-  `line.py`: Genera un gráfico 1D.
-  `parallelepiped.py`: Genera una imagen de un paralelepípedo.

