## Update file rule

To update files with the prefix `ht_`, you must first modify the files inside `src/js/`, and then run `historytracers -minify`. Any manual updates may cause issues for users accessing the History Tracers page

## Code reliability check

Before submitting any change to the JavaScript files, run [Semgrep](https://semgrep.dev/) from this directory to check for security and reliability issues:

```sh
semgrep --config auto .
```

Fix every blocking finding before opening a pull request. Do not build regular expressions from variables: `new RegExp(...)` with a dynamic pattern is reported as `detect-non-literal-regexp`; use `split()`/`join()` or a literal regular expression instead. Vendored minified libraries are excluded through the `.semgrepignore` file in the repository root.

## Security analysis with JSHunter

Install [JSHunter](https://github.com/cc1a2b/JShunter) with Go:

```sh
go install -v github.com/cc1a2b/jshunter/cmd/jshunter@latest
```

From the repository root, create the list of files to analyze:

```sh
for i in `ls js/*.js`; do echo $i >> list.txt; done
```

Then run the analysis and save the report to `out`:

```sh
~/go/bin/jshunter -d -m -e -s -x -P -g -F -B -L -l list.txt > out
```

Review the report and fix any finding before opening a pull request.
