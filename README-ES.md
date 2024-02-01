[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## ¿Por qué hay la necesidad de más un proyecto de genealogía?

Hay distintos proyectos de genealogía para ayudar las personas a hacer su árbol genealógica, algunos de ellos son colaborativos y personas pueden trabajar juntos para encontrar sus ancestros. Este proyecto no tiene por objetivo ser más uno programa de computadora o sitio para hacer árbol genealógico y hacer competencia con los otros, el principal objetivo del proyecto es ayudar a las personas a trabajar con el método científico y entender como el conocimiento sobre las familias cambió en el tiempo. También se muestra la participación de las familias en los momentos históricos.

Además de las relaciones familiares, el proyecto trabaja la lógica, enseñado distintas ciencias juntas, para entender no solamente las familias, pero también el universo.

## ¿Por qué no puedo acceder el contenido en mío computador?

Este proyecto tiene una estructura, no forzar la carga del sitio siempre, y él no tiene un archivo con todo el código-fuente. Cuando intentas abrir el archivo `index.html` en su computadora, él necesita cargar otros archivos `javascript`, y su navegador entiende la requisición como un [CORS request](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default), negándolo.

Uno de los objetivos es traer un servidor web que vas a dejar acceder los datos en su computadora, mientras esto no se pasa, puedes acceder el contenido com [Simple Web Server](https://simplewebserver.org/) o [python web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server). Después de la instalación, podrás extraer el contenido del proyecto en un servidor y accédelo por tu navegador.

## ¿Cómo añadir un nuevo idioma?

Para añadir un nuevo idioma al proyecto, primero es necesario crear un directorio, con esto, ruede un script que crea todos los archivos para tú:

```sh
$ mkdir lang/es-ES
$ cd lang
$ bash create_language.sh --path "es-ES" --msg "Aguardando traducción"
```

Finalmiente, podrás cambiar el contenido con otra lenguaje. Hacemos una sugerencia, empiece con los archivos cuyos nombres no están en el formato [Universal Unique Identifier](https://developer.mozilla.org/en-US/docs/Glossary/UUID).
