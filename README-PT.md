[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## Por que necessitamos mais um projeto sobre genealogia?

Existem distintos projetos de genealogia para auxiliar as pessoas a montarem sua árvore genealógica, alguns deles são colaborativos e pessoas podem trabalhar juntas para encontrar seus ancestrais. Este projeto não tem por objetivo ser mais um software ou site de árvores genealógicas para competir com os demais, o principal objetivo do projeto é ajudar as pessoas a usar o método científico e entender como o conhecimento sobre as famílias desenvolve no tempo. Também mostramos participação das famílias em momentos históricos.

Além das relações familiares, o projeto trabalha a parte de lógica, através do ensinando de distintas ciências juntas, a fim de entendermos não somente nós e nossa família, mas o universo na totalidade.

## Por que não consigo acessar o conteúdo no meu computador?

Este projeto tem uma estrutura para evitar recarregamento de página, e ele não tem um único arquivo com todo seu código-fonte. Quando tentas abrir o arquivo `index.html` localmente, ele precisa carregar outros arquivos `javascript`, e seu navegador entende a requisição como um [CORS request](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default), bloqueando-o.

Para permitir acesso do conteúdo do projeto localmente, escrevemos um servidor web usando [python web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server). Após instalar o Python `3.x` ou superior no seu computador, poderás acessar o conteúdo rodando:

```sh
$ python3 historytracers.py
Access http://localhost:12345
```

e após isto, abrindo um navegador e acessando `http://localhost:12345`.

## Como adicionar um novo idioma?

Para adicionar um novo idioma ao projeto, primeiro é necessário criar um diretório, após isto, rode o script que cria todas os arquivos para você:

```sh
$ mkdir lang/es-ES
$ cd scripts
$ bash create_language.sh --path "es-ES" --msg "Aguardando traducción"
```

Finalmente, você poderá adicionar conteúdo de outra linguagem. Sugere-se iniciar trabalhando com os arquivos cujos nomes não estão no formato [Universal Unique Identifier](https://developer.mozilla.org/en-US/docs/Glossary/UUID).
