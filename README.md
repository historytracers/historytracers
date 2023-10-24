[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## Why do we need another genealogical project?

There are different genealogical projects that that help people to make their family tree, some of them are collaborative and people can work together to find their ancestors. This project does not have the goal to be more one website or software to make family trees and compete with them, the main goal is to help the people to use the scientific method and understand how their family knowledge grew during the centuries. This project does not treat only the people relationship, but we also work with different issues that make equal people to be different.

## Why cannot access the site locally?

This project has a design to avoid page reload, and it does not have a unique file with all the code. When you try to open file `index.html` locally, it needs to load other `javascript` files, and your browser understands this as a [CORS request](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default), blocking it.

We have on our horizon the goal to bring a simple web server that will allow you to access the data locally, while this does not happen, you have different options available like [Simple Web Server](https://simplewebserver.org/) or a [python web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server). After to install one of them, you can extract the project content inside the selected web server and access it through your browser.

