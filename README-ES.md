[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## ¿Por qué la necesidad de más proyectos de genealogía?

Existen diversos proyectos de genealogía destinados a ayudar a las personas a trazar su árbol genealógico. Algunos de ellos fomentan la colaboración, permitiendo que las personas trabajen juntas para descubrir a sus ancestros. Nuestro proyecto no busca competir con otros programas o sitios web para la creación de árboles genealógicos; su principal objetivo es ayudar a las personas a aplicar el método científico y comprender cómo ha evolucionado el conocimiento sobre las familias a lo largo del tiempo. Además, se destaca la participación de las familias en momentos históricos.

Además de explorar las relaciones familiares, nuestro proyecto aborda la lógica al enseñar diversas disciplinas científicas de manera integrada, lo que nos permite comprender no solo las dinámicas familiares, sino también el universo en su conjunto.

## ¿Por qué no puedo acceder al contenido en mi computadora?

Nuestro proyecto ha sido diseñado para evitar recargas constantes de la página y no alberga todo su código en un único archivo. Al intentar abrir el archivo `index.html` en tu computadora, este necesita cargar otros archivos `javascript`, lo que tu navegador interpreta como una solicitud [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default) y la bloquea.

Para que las personas puedan acceder al contenido localmente, hemos desarrollado un servidor web sencillo utilizando [Python web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server).  Una vez que hayas instalado Python `3.x` o una versión posterior en tu computadora, puedes ejecutar el siguiente comando:

```sh
$ python3 historytracers.py
Access http://localhost:12345
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

