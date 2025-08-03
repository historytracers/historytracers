## Scripts

Este diretório contém diversos scripts utilizados para gerar conteúdos para o projeto History Tracers.

### Subdiretórios

Os seguintes subdiretórios estão presentes neste diretório:

-  `bash`: Scripts Bash usados para criar arquivos para o History Tracers.
-  `python`: Scripts Python usados para gerar algumas das imagens utilizadas no projeto.

### Subdiretório bash

Os scripts Bash foram escritos para serem executados no próprio diretório onde estão localizados. Quando necessário, os scripts alteram o diretório para realizar as operações necessárias.

Os seguintes scripts estão disponíveis:

-  `create_class.sh`: Cria arquivos de classe de acordo com o argumento fornecido (`science`, `history`, ou `first_steps`). 
-  `create_game.sh`: Cria arquivos para serem usados no jogo `Método Científico`.  Jogos futuros devem modificar este script para criar seus próprios arquivos.
-  `create_language.sh`: Cria um diretório para um novo idioma e gera os arquivos a serem preenchidos.
-  `ht_tts.sh`: Realiza a conversão de um texto presente em um dos arquivos de entrada  (`PT_TEXT`, `ES_TEXT` or `EN_TEXT`) para um arquivo WAV.
-  `update_js_css.sh`: Sempre que modificamos arquivos dentro do diretório `src`, precisamos executar este script para atualizar o índice.

### Subirectório python

Os scripts Python podem ser executados em qualquer diretório, mas você precisará mover a imagem gerada para o diretório correto.

Atualmente, todos os scripts disponíveis neste diretório geram imagens utilizadas na seção `Nós e o universo`.

Os seguintes scripts estão disponíveis:

-  `2daxis.py`: Gera uma imagem de gráfico 2D.
-  `line.py`: Gera uma imagem de gráfico 1D.
-  `parallelepiped.py`: Gera uma imagem de um paralelepípedo.

