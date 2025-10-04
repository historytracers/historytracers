[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## ¿Qué es History Tracers?

Este proyecto es software libre distribuido bajo la licencia `GPL 3 o posterior`. Todo el contenido del proyecto está licenciado bajo [CC BY-NC 4.0 DEED](https://creativecommons.org/licenses/by-nc/4.0/), a menos que se indique lo contrario.

## ¿Por qué otro proyecto de educación?

La enseñanza suele ser un desafío diario tanto para estudiantes como para docentes, cada uno por distintas razones. Nuestro objetivo es apoyar a ambos lados del proceso de aprendizaje proporcionando diversas herramientas.

### La Herramienta Principal

No es de sorprender que la principal herramienta de enseñanza en *History Tracers* seas **TÚ**. A través de nuestro propio cuerpo y experiencias, exploramos diferentes ciencias.

### Textos con Audio

Con la excepción de dos secciones que pronto recibirán audio (*Historia General* y *Acontecimientos Históricos*), todos los textos del proyecto ya incluyen narración. De esta manera, además de leer y practicar, también puedes escuchar el contenido cuando lo desees.

### Imágenes

Los textos puramente escritos pueden resultar difíciles para algunos estudiantes. Por esta razón, ofrecemos contenido ilustrado siempre que sea necesario.

### Genealogía

Las relaciones familiares desempeñan un papel importante en la educación, ya que hacen que el conocimiento se convierta literalmente en parte de nuestras vidas. Por esta razón, incorporamos la genealogía en diferentes tipos de contenido.

### Prácticas

La enseñanza teórica es importante, pero la ciencia sin práctica no es ciencia. Por ello, la mayoría de los textos incluyen al final preguntas con respuestas para que puedas comprobar tu comprensión. Además, algunos textos presentan prácticas que pueden realizarse en casa.

### Multidisciplinariedad

La palabra que da nombre a esta sección es larga y significativa. Resalta la importancia de presentar juntos contenidos de diferentes disciplinas. Por esta razón, un mismo texto de *History Tracers* puede aparecer en varias secciones.

### Videos

En algunos textos, también ofrecemos videos para ilustrar aún más el contenido.


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

## Cómo compilar *History Tracers*

*History Tracers* utiliza **GNU Autoconf** como sistema de compilación.

Para simplificar el proceso, hemos añadido el script `ht2pkg.sh`, que ejecuta automáticamente todos los pasos necesarios para generar los paquetes:

```sh
$ ./ht2pkg.sh
```

