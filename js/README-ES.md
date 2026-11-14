## Update file rule

Para actualizar los archivos con el prefijo `ht_`, primero debes modificar los archivos dentro de `src/js/`. Luego, ejecuta `historytracers -minify`. Las actualizaciones manuales pueden ocasionar problemas a los usuarios que acceden a las páginas de History Tracers.

## Verificación de confiabilidad del código

Antes de enviar cualquier cambio a los archivos JavaScript, ejecuta [Semgrep](https://semgrep.dev/) desde este directorio para comprobar problemas de seguridad y confiabilidad:

```sh
semgrep --config auto .
```

Corrige todos los hallazgos bloqueantes antes de abrir un pull request. No construyas expresiones regulares a partir de variables: `new RegExp(...)` con un patrón dinámico se reporta como `detect-non-literal-regexp`; usa `split()`/`join()` o una expresión regular literal. Las bibliotecas minificadas de terceros están excluidas mediante el archivo `.semgrepignore` de la raíz del repositorio.

## Análisis de seguridad con JSHunter

Instala [JSHunter](https://github.com/cc1a2b/JShunter) con Go:

```sh
go install -v github.com/cc1a2b/jshunter/cmd/jshunter@latest
```

Desde la raíz del repositorio, crea la lista de archivos que se van a analizar:

```sh
for i in `ls js/*.js`; do echo $i >> list.txt; done
```

Luego ejecuta el análisis y guarda el informe en `out`:

```sh
~/go/bin/jshunter -d -m -e -s -x -P -g -F -B -L -l list.txt > out
```

Revisa el informe y corrige cualquier hallazgo antes de abrir un pull request.
