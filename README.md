[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## Why do we need another genealogical project?

There are different genealogical projects that that help people to make their family tree, some of them are collaborative and people can work together to find their ancestors. This project does not have the goal to be more one website or software to make family trees and compete with them, the main goal is to help the people to use the scientific method and understand how their family knowledge grew during the centuries. We also show family participation in historical moments.

In addition to family relationships, the project works on logic, through teaching different sciences together, in order to understand not only ourselves and our family, but the universe as a whole.

## Why cannot access the site locally?

This project has a design to avoid page reload, and it does not have a unique file with all the code. When you try to open file `index.html` locally, it needs to load other `javascript` files, and your browser understands this as a [CORS request](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default), blocking it.

To allow users to access content, we wrote a simple web server using  [python web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server). After to install Python `3.x` or later on your host, you can run the following command:

```sh
$ python3 historytracers.py
Access http://localhost:12345
```

and after this, you can open your browser and access `http://localhost:12345`.

## How to add a new language?

To add a new language for the project, firstly you need to create a directory, and after this, run a script that creates all files for you:

```sh
$ mkdir lang/es-ES
$ cd lang
$ bash create_language.sh --path "es-ES" --msg "Aguardando traducción"
```

Finally, you can add content in another language. It is suggested to start working with files that name does not have [Universal Unique Identifier](https://developer.mozilla.org/en-US/docs/Glossary/UUID) format.
