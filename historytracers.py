# SPDX-License-Identifier: GPL-3.0-or-later

import http.server
import json
import socketserver

htOptions = None

class htHandler(http.server.SimpleHTTPRequestHandler):
    def _htHeaders(self, code, contentType, contentLength):
        #
        #  code: The response code (200, 404)
        #  contentyType: The document type delivered ('application/json', 'text/html')
        #  contentLength: The content length
        #
        self.send_response(code)
        self.send_header('Content-type', contentType)
        self.send_header('Content-length', contentLength)
        self.end_headers()

    def _htUnauthorizedResponse(self):
        errorText = '<html><body>You do not have permissions to access it.</body></html>'
        self._htHeaders(401, 'text/html', len(errorText))
        self.wfile.write(errorText)

    def _htScience(self):
        dumpText = json.dumps({'msg': 'Science content'})
        self._htHeaders(200, 'application/json', len(dumpText))
        self.wfile.write(dumpText)

    def _htHistorical(self):
        dumpText = json.dumps({'msg': 'Historical content'})
        self._htHeaders(200, 'application/json', len(dumpText))
        self.wfile.write()

    def _htFirstSteps(self):
        dumpText = json.dumps({'msg': 'Historical content'})
        self._htHeaders(200, 'application/json', len(dumpText))
        self.wfile.write()

    def _htSMGame(self):
        dumpText = json.dumps({'msg': 'Scientific Game content'})
        self._htHeaders(200, 'application/json', len(dumpText))
        self.wfile.write(dumpText)

    def do_GET(self):
        devString = self.path.find("src")
        if htOptions["devmode"] == False and devString != -1:
            self._htUnauthorizedResponse()
            return

        # TODO: Should we avoid directory listening?

        http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        cLength = int(self.headers['Content-Length'])
        wData = self.rfile.read(cLength)

        dataSTR = post_data_bytes.decode("UTF-8")
        listData = dataStr.split('&')

        if self.path == '/science':
            self._htScience()
        elif self.path == '/history':
            self._htHistorical()
        elif self.path == '/first_steps':
            self._htFirstSteps()
        elif self.path == '/smGame':
            self._smGame()

        http.server.SimpleHTTPRequestHandler.do_GET(self)

def parseArg():
    options = None
    try:
        with open('.options.json', 'r') as file:
            options = json.load(file)
    except:
        print("File '.options.json' not found. Server is going to run with defaults.")
        options = {'devmode': False, 'port': 12345 }

    print("Running with options: ")
    print(options)
    return options

def runServer():
    with socketserver.TCPServer(("", htOptions['port']), htHandler) as httpd:
        string = "Access http://localhost:" + str(htOptions['port'])
        print(string)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass

        httpd.server_close()


if __name__ == "__main__":
    htOptions = parseArg()

    runServer()
