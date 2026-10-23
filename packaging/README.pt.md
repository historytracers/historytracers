<!--
SPDX-License-Identifier: GPL-3.0-or-later
History Tracers packaging guide (Portuguese)
-->

# Empacotamento

Este diretório contém tudo o que é necessário para empacotar e
distribuir o History Tracers: Debian, RPM, Slackware, Windows (MSI via
WiX), instalador estático auto-extrator, a unidade systemd de serviço,
os arquivos de configuração e a definição do contêiner Docker.

Todos os formatos são gerados por um único script a partir da raiz do
repositório: `historytracers2pkg.sh`.

## Requisitos

O script compila todo o projeto primeiro (autotools, Go, Node), então é
necessária uma cadeia de ferramentas completa de compilação. Para
instalar as dependências de empacotamento/compilação do seu sistema:

```bash
sudo ./packaging/historytracers-install-requirements.sh
```

Consulte o `README.md` da raiz para a lista completa de ferramentas.

## Geração dos pacotes

Execute os comandos **a partir da raiz do repositório**. Toda execução
primeiro formata e publica o conteúdo (`autoreconf`, `./configure`,
`make` e o publisher) e depois produz o formato selecionado em
`artifacts/`.

| Opção | Gera |
| --- | --- |
| `--deb`, `-d` | Pacotes Debian |
| `--rpm`, `-r` | Pacotes RPM |
| `--slackbuild`, `-s` | SlackBuild do Slackware + tarballs |
| `--msi`, `-m` | MSI do Windows (apenas Windows/MSYS) |
| `--static`, `-t` | Instalador auto-extrator + tar.gz |
| `--docker`, `-c` | Imagem de contêiner Docker |
| `--validate`, `-v` | Roda `shellcheck` no próprio script |
| `--help`, `-h` | Ajuda |

```bash
./historytracers2pkg.sh -d        # Debian
./historytracers2pkg.sh -r        # RPM
./historytracers2pkg.sh -s        # Slackware
./historytracers2pkg.sh -t        # Instalador estático
./historytracers2pkg.sh -c        # Contêiner Docker
./historytracers2pkg.sh -m        # MSI (apenas Windows/MSYS)
```

Se nenhuma opção for informada, o formato é escolhido
automaticamente a partir do ambiente atual (Slackware, MSYS/Windows,
Debian ou Fedora/RHEL).

> Observação: a etapa de compilação do conteúdo é longa. Toda a saída
> fica no diretório `artifacts/` da raiz do repositório.

## Instalação dos pacotes

Os exemplos abaixo usam a versão `1.0.0`; substitua pela versão
gerada.

### Debian

```bash
sudo apt install ./artifacts/historytracers_1.0.0-*.deb
```

Isso instala o pacote principal (`historytracers`: binário, serviço
systemd e configuração). Os subpacotes `-www` (conteúdo web),
`-images` (imagens) e `-devel` (código-fonte) produzidos pela mesma
compilação são usados como dependências; instale-os no mesmo comando
quando seus repositórios não estiverem disponíveis:

```bash
sudo apt install \
    ./artifacts/historytracers_1.0.0-*.deb \
    ./artifacts/historytracers-www_*.deb \
    ./artifacts/historytracers-images_*.deb \
    ./artifacts/historytracers-devel_*.deb
```

Depois, ative o serviço systemd:

```bash
sudo systemctl enable --now historytracers
```

O serviço roda o servidor local do History Tracers para o conteúdo
instalado em `/var/www/htdocs/historytracers/` com a configuração em
`/etc/historytracers/historytracers.conf`. Consulte o journal para
detalhes:

```bash
journalctl -u historytracers
```

### RPM

```bash
sudo dnf install ./artifacts/historytracers-1.0.0-*.rpm
```

Depois, ative o serviço da mesma forma
(`sudo systemctl enable --now historytracers`).

### Slackware

```bash
# Extraia os arquivos do SlackBuild, compile e instale
tar xzf artifacts/historytracers.tar.gz
cd historytracers
./historytracers.SlackBuild
sudo installpkg /tmp/historytracers-1.0.0-*.txz

# Observação: o glob acima também instala o pacote -www (conteúdo web
# para qualquer servidor). Um tarball separado com imagens está
# disponível em artifacts/historytracers-images-1.0.0.tar.gz, se
# necessário.
```

O tarball `artifacts/historytracers-1.0.0.tar.xz` contém a árvore
genérica de código-fonte usada pelo SlackBuild.

### Windows (MSI)

Dê um duplo clique em `artifacts/HistoryTracers.msi` (ou execute
`msiexec /i HistoryTracers.msi`). Construído apenas em Windows/MSYS
com o WiX Toolset. O nome do arquivo não leva versão; a versão fica
nos metadados do MSI (`ProductVersion`).

O instalador é publicado nos três idiomas do projeto, com um MSI por
idioma:

- `artifacts/HistoryTracers.msi` - inglês (padrão)
- `artifacts/HistoryTracers-es-ES.msi` - espanhol (es-ES)
- `artifacts/HistoryTracers-pt-BR.msi` - português do Brasil (pt-BR)

Cada variante localiza as telas do assistente (boas-vindas, contrato
de licença, seleção de funcionalidades, caminho de instalação) e o
aviso de licença; as propriedades do msiexec mostradas abaixo
funcionam da mesma forma em todos os idiomas.

Por padrão é feita uma **instalação completa**: o binário do
visualizador, os atalhos do menu Iniciar e o conteúdo web em
`Program Files\HistoryTracers\`.

Duas opções de instalação são controladas por propriedades do msiexec
(automatizáveis; a árvore de funcionalidades do assistente é o
equivalente interativo):

- `INSTALLTYPE=ContentOnly`: não instala binário nem atalhos; todo o
  conteúdo `www/` é copiado para um diretório `historytracers/`
  criado dentro da pasta indicada em `CONTENTROOT` (caminho absoluto,
  com ou sem barra invertida final). A instalação completa é o padrão
  quando a propriedade não é definida.
- `INSTALLIMAGES=0`: o pacote de imagens de museus é instalado por
  padrão em ambos os tipos de instalação; use esta propriedade para
  omiti-lo.

 Exemplos de uso:

```bat
:: Instalação completa (padrão)
msiexec /i HistoryTracers.msi

:: Apenas conteúdo web: D:\Sites\historytracers\ recebe todos os arquivos www/
msiexec /i HistoryTracers.msi INSTALLTYPE=ContentOnly CONTENTROOT="D:\Sites"

:: Apenas conteúdo, sem as imagens
msiexec /i HistoryTracers.msi INSTALLTYPE=ContentOnly CONTENTROOT="D:\Sites" INSTALLIMAGES=0
```

Um `CONTENTROOT` inválido ou ausente no modo de apenas conteúdo aborta
a instalação com uma mensagem explicativa.

### Estático (instalador auto-extrator)

```bash
bash artifacts/historytracers-1.0.0-static-installer.sh          # instalar
sudo bash artifacts/historytracers-1.0.0-static-installer.sh     # instalação no sistema
```

Opções úteis do instalador:

```bash
bash ... --check          # verifica dependências do sistema
bash ... --list           # lista os arquivos que seriam instalados
sudo bash ... --prefix /usr/local
sudo bash ... --uninstall # remove a instalação
```

Um tarball simples `artifacts/historytracers-static-1.0.0.tar.gz`
também é gerado para extração manual, além de um tarball web
`artifacts/historytracers-www-1.0.0.tar.gz` para qualquer servidor web
externo (Apache, IIS, ...).

## Executando o contêiner Docker

```bash
./historytracers2pkg.sh --docker
```

Isso compila e etiqueta `historytracers:<versão>` (e também
`historytracers:latest`) e exporta um tarball portátil da imagem para
`artifacts/historytracers-<versão>-docker.tar.gz`.

Execute o contêiner após a compilação:

```bash
docker run --rm -p 8080:80 historytracers:latest
```

Em seguida, abra o site em <http://localhost:8080/>.

Em outra máquina (ou para distribuir via artefato de CI), carregue
antes a imagem exportada:

```bash
docker load < artifacts/historytracers-1.0.0-docker.tar.gz
docker run --rm -p 8080:80 historytracers:1.0.0
```

A imagem é autocontida: ela entrega o conteúdo web estático (`www/`,
incluindo `images/`) e um servidor web nginx. Não requer configuração
para servir o site padrão. Veja `Docker/README.md` para os detalhes do
contêiner.

## Diagnóstico de problemas

- `--docker` relata o CLI e o daemon separadamente: se o socket do
  daemon não estiver acessível (por exemplo, `permission denied`), ele
  indica adicionar o usuário ao grupo docker (`sudo usermod -aG docker
  $(whoami) && newgrp docker`) ou rodar o script com sudo.
- Ferramentas ausentes nos builds RPM/DEB: execute
  `sudo ./packaging/historytracers-install-requirements.sh`.
- Validação do script: `./historytracers2pkg.sh --validate`.
