## Update file rule

To update files with the prefix `ht_`, you must first modify the files inside `src/js/`, and then run `historytracers -minify`. Any manual updates may cause issues for users accessing the History Tracers page

## Code reliability check

Before submitting any change to the JavaScript files, run [Semgrep](https://semgrep.dev/) from this directory to check for security and reliability issues:

```sh
semgrep --config auto .
```

Fix every blocking finding before opening a pull request. Do not build regular expressions from variables: `new RegExp(...)` with a dynamic pattern is reported as `detect-non-literal-regexp`; use `split()`/`join()` or a literal regular expression instead. Vendored minified libraries are excluded through the `.semgrepignore` file in the repository root.
