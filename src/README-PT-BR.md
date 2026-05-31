## src/

Este diretório contém arquivos de código fonte que servem como modelos para geração de conteúdo no projeto History Tracers.

### Subdiretórios

A estrutura de diretórios está organizada da seguinte forma:

- **`bodies/`**  
  Arquivos de modelo HTML para renderização de conteúdo
- **`common/`**  
  Código fonte Go compartilhado utilizado no publisher e no editor
- **`css/`**  
  Folhas de estilo para formatação de conteúdo
- **`editor/`**  
  Código fonte do editor de área de trabalho (aplicação Go baseada em Fyne)
- **`images/`**  
  Os arquivos fonte das imagens estão localizados em `images/HistoryTracers`
- **`js/`**  
  Scripts JavaScript usados em jogos e conteúdo textual
- **`json/`**  
  Contém todos os modelos de conteúdo do site
- **`publisher/`**  
  Código fonte do publisher (aplicação Go)

### Código Fonte Go

#### Módulo Comum (`common/`)
Utilitários compartilhados e estruturas de dados usados tanto pelo publisher quanto pelo editor:

- **`config.go`**  
  Gerenciamento de configuração
- **`data-type.go`**  
  Definições de tipos de dados para genealogia e conteúdo
- **`timestamp.go`**  
  Utilitários de carimbo de tempo
- **`go.mod`**  
  Definição do módulo Go

#### Módulo Publisher (`publisher/`)
Ferramentas de processamento em lote para gerar e manter conteúdo:

- **`main.go`**  
  Ponto de entrada do publisher
- **`common.go`**  
  Utilitários e funções auxiliares compartilhadas
- **`config.go`**  
  Gerenciamento de configuração
- **`audio.go`**  
  Geração de arquivos de áudio
- **`class.go`**  
  Criação de conteúdo de aulas/lições
- **`csv_gedcom.go`**  
  Processamento de arquivos CSV e GEDCOM
- **`minify.go`**  
  Utilitários de minificação
- **`hash.go`**  
  Geração e verificação de hash
- **`git.go`**  
  Integração com Git para controle de versões
- **`smgame.go`**  
  Criação de conteúdo do Scientific Method Game
- **`go.mod`**  
  Definição do módulo Go

#### Módulo Editor (`editor/`)
Aplicação de editor de genealogia de área de trabalho:

- **`main.go`**  
  Ponto de entrada do editor
- **`common.go`**  
  Utilitários compartilhados
- **`config.go`**  
  Gerenciamento de configuração
- **`files.go`**  
  Operações e gerenciamento de arquivos
- **`tabs.go`**  
  Gerenciamento de abas na interface do editor
- **`settings.go`**  
  Configurações do editor
- **`go.mod`**  
  Definição do módulo Go

### Modelos HTML

- **`bodies/main.html`**  
  Modelo HTML principal para renderização de conteúdo

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
- **`ht_chart.js`**  
  Integra com [Chart.js](https://www.chartjs.org/) para visualização de dados
- **`ht_math.js`**  
  Operações e cálculos matemáticos

### Modelos JSON

Os modelos de geração de conteúdo incluem:

#### Tipos de conteúdo:
- **`index_template.json`**  
  Estrutura de conteúdo da página de índice
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
