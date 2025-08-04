## Idiomas

Este diretório contém arquivos JSON que são carregados quando determinados links são acessados.

### Adicionar novo idioma

O primeiro passo para adicionar um novo idioma é executar o script `scripts/bash/create_language.sh`. Esse script criará um novo diretório para o idioma e também gerará arquivos vazios para os textos já publicados que serão traduzidos.

Sugere-se que, antes de publicar os arquivos traduzidos, você altere os arquivos `main.json` em cada diretório de idiomas, indicando o estágio atual da tradução.

### Diretórios

Os seguintes subdiretórios estão presentes neste diretório:

-  `aa-BB`: São os diretórios de idiomas, onde `aa` representa o código do idioma e `BB` a sigla do país.
-  `aa-BB/smGame`: Contém arquivos do jogo *Scientific Method*.
-  `source`: Este diretório contém os arquivos que possuem as fontes mencionadas nos arquivos de idiomas.

