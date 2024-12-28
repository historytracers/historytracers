[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## Por que precisamos de mais um projeto de genealogia?

Existem diversos projetos de genealogia disponíveis para ajudar as pessoas a construir sua árvore genealógica. Alguns desses projetos são colaborativos, permitindo que as pessoas trabalhem em conjunto para descobrir seus ancestrais. Nosso projeto não tem a intenção de ser apenas mais um software ou site de árvores genealógicas para competir com os outros. O principal objetivo do projeto é auxiliar as pessoas a utilizar o método científico e compreender como o conhecimento sobre as famílias se desenvolve ao longo do tempo. Além disso, destacamos a participação das famílias em momentos históricos significativos.

Além das relações familiares, o projeto aborda a lógica através do ensino de diversas ciências em conjunto, visando compreender não apenas nós mesmos e nossas famílias, mas também o universo como um todo.

## Por que não consigo acessar o conteúdo no meu computador?

Este projeto possui uma estrutura para evitar recarregamentos de página e não possui um único arquivo contendo todo o seu código-fonte. Ao tentar abrir o arquivo `index.html` localmente, é necessário carregar outros arquivos `javascript`, o que faz com que o navegador interprete a solicitação como uma requisição [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default), bloqueando o acesso.

Para permitir o acesso ao conteúdo do projeto localmente, desenvolvemos um servidor web utilizando [GO](https://go.dev/). Após instalar o GO em seu computador, você poderá acessar o conteúdo executando o seguinte comando:

```sh
$ go run src/history_tracers.go
Listening Port 12345 without devmode content /
```

E depois disso, abra um navegador e acesse `http://localhost:12345`.

## Como adicionar um novo idioma?

Para incluir um novo idioma no projeto, primeiro é necessário criar um diretório. Em seguida, execute o script que gera todos os arquivos para você::

```sh
$ mkdir lang/es-ES
$ cd scripts
$ bash create_language.sh --path "es-ES" --msg "Aguardando traducción"
```

Por fim, você poderá adicionar conteúdo em outro idioma. Recomenda-se começar trabalhando com os arquivos cujos nomes não seguem o formato [Universal Unique Identifier](https://developer.mozilla.org/en-US/docs/Glossary/UUID).

