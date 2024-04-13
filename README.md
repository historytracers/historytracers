[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## Why do we need another genealogical project?

Various genealogical projects exist to assist individuals in constructing their family trees. Some of these projects encourage collaboration, enabling people to work together to trace their ancestors. The primary objective of our project is not to compete with existing websites or software for family tree creation, but rather to facilitate the application of the scientific method, aiding individuals in comprehending the growth of their family knowledge over centuries. Additionally, we highlight familial participation in significant historical events.

Beyond delineating family connections, our project integrates logical reasoning by teaching various sciences in tandem. This approach seeks to foster understanding not only of ourselves and our familial lineage but also of the broader universe.

## Why Can't I Access the Site Locally?

Our project is designed to minimize page reloads and does not consolidate all its code into a single file. Consequently, attempting to open the `index.html` file locally triggers the need to load additional JavaScript files, resulting in your browser interpreting it as a [CORS request](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default), and blocking access.

To enable local access to the content, we have developed a simple web server using [Python](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server). After installing Python `3.x` or later on your host machine, you can execute the following command:

```sh
$ python3 historytracers.py
Access http://localhost:12345
```

Once you've completed these steps, you can open your web browser and navigate to `http://localhost:12345`.

## Adding a New Language

To incorporate a new language into the project, begin by creating a directory. Subsequently, execute a script that automatically generates all necessary files for the new language:

```sh
$ mkdir lang/es-ES
$ cd scripts
$ bash create_language.sh --path "es-ES" --msg "Aguardando traducción"
```

Lastly, you can incorporate content in another language. It's advisable to commence by handling files whose names do not follow the [Universal Unique Identifier](https://developer.mozilla.org/en-US/docs/Glossary/UUID) format.

