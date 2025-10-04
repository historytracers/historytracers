[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## O que é History Tracers?


Este projeto é um software livre distribuído sob a licença `GPL 3 ou posterior`. Todo o conteúdo do projeto está licenciado sob [CC BY-NC 4.0 DEED](https://creativecommons.org/licenses/by-nc/4.0/), a menos que seja indicado o contrário.

## Por que Outro Projeto Educacional?

Ensinar costuma ser um desafio diário tanto para estudantes quanto para professores, cada um por razões diferentes. Nosso objetivo é apoiar ambos os lados do processo de aprendizagem, oferecendo diversas ferramentas.

### A Principal Ferramenta

Não é surpresa que a principal ferramenta de ensino em *History Tracers* seja **VOCÊ**. Através do nosso próprio corpo e experiências, exploramos diferentes ciências.

### Textos com Áudio

Com exceção de duas seções que em breve receberão áudio (*História Geral* e *Acontecimentos Históricos*), todos os textos do projeto já contam com narração. Assim, além de ler e praticar, você também pode ouvir o conteúdo sempre que quiser.

### Imagens

Textos puramente escritos podem ser desafiadores para alguns aprendizes. Por isso, oferecemos conteúdo ilustrado sempre que necessário.

### Genealogia

As relações familiares desempenham um papel importante na educação, pois fazem com que o conhecimento se torne, literalmente, parte de nossas vidas. Por essa razão, incorporamos a genealogia em diferentes tipos de conteúdo.

### Práticas

O ensino teórico é importante, mas ciência sem prática não é ciência. Por isso, a maioria dos textos inclui, ao final, perguntas com respostas para que você possa verificar sua compreensão. Além disso, alguns textos apresentam práticas que podem ser realizadas em casa.

### Multidisciplinaridade

A palavra que dá nome a esta seção é longa e significativa. Ela ressalta a importância de apresentar conteúdos de diferentes disciplinas em conjunto. Por isso, um mesmo texto do *History Tracers* pode aparecer em várias seções.

### Vídeos

Em alguns textos, também oferecemos vídeos para ilustrar ainda mais o conteúdo.

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

## Como compilar o *History Tracers*

O *History Tracers* utiliza o **GNU Autoconf** como sistema de compilação.

Para simplificar o processo, adicionamos o script `ht2pkg.sh`, que executa automaticamente todas as etapas necessárias para gerar os pacotes:

```sh
$ ./ht2pkg.sh
```

