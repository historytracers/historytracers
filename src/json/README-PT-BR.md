# Modelos

Este diretório contém modelos para criação de conteúdo no **History Tracers**.

## Arquivos

Os seguintes arquivos de modelo estão disponíveis:

- `atlas_template.json`: Modelo para páginas de atlas.
- `class_template.json`: Modelo para as seções: **Primeiros Passos**, **Compreensão de Textos**, **História Geral** e **Povos Indígenas (Quem...?)**.
- `family_template.json`: Modelo para a seção **Árvores Genealógicas**.
- `scientific_method_game_template.json`: Modelo para níveis do **Jogo do Método Científico**.
- `source_template.json`: Modelo base para todas as seções.

### Estrutura do Modelo Class

Este modelo contém quatro seções principais:

#### Seção de Cabeçalho

Inclui os seguintes campos:

- `title`: Exibido na barra de título do aplicativo/página.
- `header`: Mostrado no topo da página/seção.
- `sources`: Array de arquivos de fontes referenciadas.
- `scripts`: Array de arquivos JavaScript associados.
- `audio`: Links para arquivos de áudio externos.
- `index`: Array de arquivos de seção relacionados.
- `license`: Licenças do projeto:
  - `SPDX-License-Identifier: GPL-3.0-or-later`
  - `CC BY-NC 4.0 DEED`
- `last_update`: Timestamp Unix Epoch da última modificação.
- `authors`: Array de nomes dos colaboradores.
- `reviewers`: Array de nomes dos revisores.
- `version`: Versão do formato (atualmente 1 ou 2).
- `type`: Tipo de conteúdo (sempre `class` para este modelo).
- `editing`: Status atual do arquivo para o painel.

#### Seção de Conteúdo

Array de conteúdo visual com estes campos:

- `id`: Para criar elementos `div`.
- `text`: Array contendo:
  - `text`: Conteúdo em formato HTML/Markdown.
  - `source`: Array de objetos de fonte com:
    - `type`: Classificação:
      - 0: Primária
      - 1: Referência
      - 2: Religiosa
      - 3: Rede Social
    - `uuid`: Identificador único que corresponde a entradas no arquivo de fonte.
    - `text`: Texto de citação.
    - `date_time`: Data de publicação em formato epoch.
- `date_time`: Array de datas referenciadas.
- `is_table`: Flag booleana para processamento Markdown.
- `img_desc`: Descrição de áudio para imagens.
- `format`: Formato do conteúdo (`html` ou `markdown`).
- `PostMention`: Caractere/texto final (para listas ou encerramentos).

#### Seção Exercise V2 (Opcional)

Exercícios carregados em tempo de execução com:

- `question`: Pergunta Sim/Não.
- `yesNoAnswer`: Resposta correta (Sim/Não).
- `additionalInfo`: Informação complementar após validação.

#### Seção Game V2

Array com descrições de imagens e datas de captura.

#### Seção Date Time

Array de datas usadas em conteúdo HTML.
