import http.server
import socketserver

PORT = 12345

class htHandler(http.server.SimpleHTTPRequestHandler):
    def _science(data):
        print("Science content")

    def _historical(data):
        print("Historical content")

    def _firstSteps(data):
        print("First Steps content")

    def _firstSteps(data):
        print("Scientific Game content")

    def do_GET(self):
        http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        cLength = int(self.headers['Content-Length'])
        wData = self.rfile.read(cLength)

        dataSTR = post_data_bytes.decode("UTF-8")
        listData = dataStr.split('&')

        if self.path == '/science':
            _science(data)
        elif self.path == '/history':
            _historical(data)
        elif self.path == '/first_steps':
            _firstSteps(data)
        elif self.path == '/smGame':
            _smGame(data)

        http.server.SimpleHTTPRequestHandler.do_GET(self)

with socketserver.TCPServer(("", PORT), htHandler) as httpd:
    string = "Access http://localhost:" + str(PORT)
    print(string)
    httpd.serve_forever()

