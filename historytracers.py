import http.server
import socketserver

PORT = 12345

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    string = "Access http://localhost:" + str(PORT)
    print(string)
    httpd.serve_forever()

