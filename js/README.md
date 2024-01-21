## Update file rule

Every time that `common_vXX.js` is updated, the file must be renamed according to the following rule:

- Filename must be `common_vXX.js` where `XX` is a number.
- If a file is named with number `XX`, next file name will be `common_v(XX +1).js`.

## Update index

After to rename the `common` JS file, it will be necessary to update its reference in `index.html`.

