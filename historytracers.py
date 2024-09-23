# SPDX-License-Identifier: GPL-3.0-or-later

import http.server
import json
import socketserver

PORT = 12345
htOptions = None

class htHandler(http.server.SimpleHTTPRequestHandler):
    def _htJsonHeaders(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def _htErrorHeaders(self):
        self.send_response(404)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def _htScience(self):
        self._htJson_headers(self)
        self.wfile.write(json.dumps({'msg': 'Science content'}))

    def _htHistorical(self):
        self._htJsonHeaders(self)
        self.wfile.write(json.dumps({'msg': 'Historical content'}))

    def _htFirstSteps(self):
        self._htJsonHeaders(self)
        self.wfile.write(json.dumps({'msg': 'Historical content'}))
        print("First Steps content")

    def _htSMGame(self):
        self._htJsonHeaders(self)
        self.wfile.write(json.dumps({'msg': 'Scientific Game content'}))

    def do_GET(self):
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
