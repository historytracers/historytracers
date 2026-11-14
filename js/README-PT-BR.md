## Update file rule

Para atualizar os arquivos com prefixo `ht_`, primeiro é necessário modificar os arquivos dentro de `src/js/`. Em seguida, rode `historytracers -minify`. Alterações manuais podem causar problemas aos usuários que acessam as páginas do History Tracers

## Verificação de confiabilidade do código

Antes de enviar qualquer alteração aos arquivos JavaScript, execute o [Semgrep](https://semgrep.dev/) neste diretório para verificar problemas de segurança e confiabilidade:

```sh
semgrep --config auto .
```

Corrija todos os achados bloqueantes antes de abrir um pull request. Não construa expressões regulares a partir de variáveis: `new RegExp(...)` com um padrão dinâmico é reportado como `detect-non-literal-regexp`; use `split()`/`join()` ou uma expressão regular literal. As bibliotecas minificadas de terceiros são excluídas pelo arquivo `.semgrepignore` na raiz do repositório.

