## src/

Este diretório contém arquivos de código fonte que servem como modelos para geração de conteúdo no projeto History Tracers.

### Subdiretórios

A estrutura de diretórios está organizada da seguinte forma:

- **`css/`**  
  Folhas de estilo para formatação de conteúdo
- **`images/`**  
  Os arquivos fonte das imagens estão localizados em `images/HistoryTracers`
- **`js/`**  
  Scripts JavaScript usados em jogos e conteúdo textual
- **`json/`**  
  Contém todos os modelos de conteúdo do site
- **`webserver/`**  
  Código fonte do servidor web

### Arquivos CSS

A formatação de estilo está dividida em dois arquivos principais:

- **`ht_common.css`**  
  Estilos globais utilizados em todo o projeto
- **`ht_math.css`**  
  Formatação especializada para:
  - Numerais Yupana
  - Numeração mesoamericana
  - Outros elementos matemáticos

### Arquivos JavaScript

Estes scripts funcionam como modelos para geração de conteúdo:

#### Scripts principais:
- **`ht_classes.js`**  
  Contém funções de carregamento de conteúdo e lógica para correção de exercícios
- **`ht_common.js`**  
  Script principal do projeto com funcionalidades compartilhadas

#### Scripts especializados:
- **`ht_charts.js`**  
  Integra com [Chart.js](https://www.chartjs.org/) para visualização de dados
- **`ht_math.js`**  
  Operações e cálculos matemáticos

### Modelos JSON

Os modelos de geração de conteúdo incluem:

#### Tipos de conteúdo:
- **`atlas_template.json`**  
  Estrutura de conteúdo para atlas geográficos
- **`class_template.json`**  
  Estrutura para conteúdo de aulas/lições

#### Modelos especializados:
- **`family_template.json`**  
  Mapeamento de relações genealógicas
- **`scientific_method_game_template.json`**  
  Estrutura para o jogo *Método Científico*
- **`sources_template.json`**  
  Formato de citações e referências para outros modelos
