## Python

Este diretório contém scripts para gerar conteúdo do projeto History Tracers.

### Subdiretórios

- **`bash/`**  
  Contém scripts Bash para criação de arquivos e configuração do projeto
- **`python/`**  
  Contém scripts Python para geração de imagens

### Scripts Bash

Todos os scripts Bash são projetados para serem executados em seus respectivos diretórios e farão automaticamente as mudanças de diretório quando necessário.

#### Scripts disponíveis:
- **`create_game.sh`**  
  Gera arquivos para o jogo *Método Científico* (modificável para outros jogos)
- **`create_language.sh`**  
  Configura novos diretórios de idioma com arquivos modelo
- **`ht_tts.sh`**  
  Converte texto para áudio WAV usando arquivos de entrada:
  - `PT_TEXT`
  - `ES_TEXT`
  - `EN_TEXT`

#### Diretório auxiliar:
- **`models/`**  
  Contém modelos usados pelo `ht_tts.sh` para conversão de texto em voz

### Scripts Python

Estes scripts podem ser executados de qualquer local, embora as imagens geradas precisem ser colocadas manualmente em seus diretórios finais.

Todos os scripts atuais produzem imagens para a seção *Primeiros Passos*.

#### Scripts de geração de imagens:
- **Formas básicas**
  - `sphere.py` - Visualização de esfera
  - `pyramid.py` - Visualização de pirâmide
  - `pentagonal_pyramid.py` - Pirâmide pentagonal
  - `parallelepiped.py` - Paralelepípedo

- **Gráficos e diagramas**
  - `2daxis.py` - Gráfico de coordenadas 2D
  - `line.py` - Gráfico linear 1D
  - `trigonometry.py` - Gráficos de ondas seno/cosseno

- **Utilitários**
  - `geographical2mathcoord.py` - Conversão de sistemas de coordenadas
  - `csv_to_gedcom.py` - Conversão de History Tracers CSV para GEDCOM
