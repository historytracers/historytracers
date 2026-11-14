## Update file rule

Para atualizar os arquivos com prefixo `ht_`, primeiro é necessário modificar os arquivos dentro de `src/js/`. Em seguida, rode `historytracers -minify`. Alterações manuais podem causar problemas aos usuários que acessam as páginas do History Tracers

## Verificação de confiabilidade do código

Antes de enviar qualquer alteração aos arquivos JavaScript, execute o [Semgrep](https://semgrep.dev/) neste diretório para verificar problemas de segurança e confiabilidade:

```sh
semgrep --config auto .
```

Corrija todos os achados bloqueantes antes de abrir um pull request. Não construa expressões regulares a partir de variáveis: `new RegExp(...)` com um padrão dinâmico é reportado como `detect-non-literal-regexp`; use `split()`/`join()` ou uma expressão regular literal. As bibliotecas minificadas de terceiros são excluídas pelo arquivo `.semgrepignore` na raiz do repositório.

## Análise de segurança com o JSHunter

Instale o [JSHunter](https://github.com/cc1a2b/JShunter) com Go:

```sh
go install -v github.com/cc1a2b/jshunter/cmd/jshunter@latest
```

Na raiz do repositório, crie a lista de arquivos a serem analisados:

```sh
for i in `ls js/*.js`; do echo $i >> list.txt; done
```

Em seguida, execute a análise e salve o relatório em `out`:

```sh
~/go/bin/jshunter -d -m -e -s -x -P -g -F -B -L -l list.txt > out
```

Revise o relatório e corrija qualquer achado antes de abrir um pull request.

