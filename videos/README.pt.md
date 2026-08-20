# Videos — pt-BR

Este diretório contém arquivos de roteiros de vídeo para o idioma português.

## Estrutura do Diretório

Cada idioma suportado tem seu próprio subdiretório seguindo o padrão:

```text
videos/<locale>/<uuid>.txt
```

Por exemplo:

```text
videos/pt-BR/bbf4bee1-3436-4368-b669-9b9fc89455a3.txt
```

## Formato do Arquivo

Cada arquivo `.txt` é um roteiro de vídeo (texto de narração) identificado por um UUID. O nome do arquivo (sem extensão) é o UUID do vídeo — o mesmo UUID é compartilhado entre os três diretórios de idiomas (`en-US`, `es-ES`, `pt-BR`) para o mesmo vídeo.

### Conteúdo do Roteiro

Um arquivo de roteiro contém:

1. **Linha de título** — o título do vídeo e o idioma entre parênteses, ex. `History Tracers — O que é? (Português)`
2. **Linha em branco**
3. **Parágrafos de narração** — o texto falado do vídeo, escrito como parágrafos curtos separados por linhas em branco

A narração é texto simples. Sem markdown, sem HTML, sem marcadores de tempo. É destinada a ser lida em voz alta por um locutor ou convertida em voz.

### Restrições

- Duração máxima: **50 segundos** de conteúdo falado (~120–150 palavras dependendo do idioma e do ritmo).
- O texto deve ser autônomo — deve fazer sentido sem exigir visuais, embora visuais possam acompanhá-lo.
- Cada versão no idioma deve transmitir o mesmo significado, não uma tradução palavra por palavra. A redação natural em cada idioma é preferida.

## Vídeos Atuais

| UUID | Título | Descrição |
|------|--------|-------------|
| `bbf4bee1-3436-4368-b669-9b9fc89455a3` | History Tracers — O que é? | Uma visão geral do History Tracers: conhecimento interdisciplinar, como diferentes culturas desenvolveram independentemente ferramentas de contagem (Soroban, Suanpan, Schyoty, Yupana), e um convite para aprender na plataforma de código aberto. |

## Adicionar um Novo Vídeo

1. Gerar um UUID: `cat /proc/sys/kernel/random/uuid`
2. Criar o arquivo de roteiro `videos/pt-BR/<uuid>.txt` com o texto de narração
3. Criar o mesmo arquivo em `videos/en-US/<uuid>.txt` e `videos/es-ES/<uuid>.txt` com conteúdo traduzido
4. Manter os três arquivos estruturalmente idênticos (mesmo número de parágrafos, mesmo significado)
5. Verificar que a contagem de palavras se mantenha dentro do limite de 50 segundos
