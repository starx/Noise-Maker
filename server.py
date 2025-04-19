from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os

class SPARequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        
        print("Requested:", self.path)
        path = self.translate_path(self.path)
        if os.path.exists(path) and not os.path.isdir(path):
            return super().do_GET()

        self.path = '/index.html'
        return super().do_GET()

PORT = 8000
with ThreadingHTTPServer(("", PORT), SPARequestHandler) as httpd:
    print(f"Serving on http://localhost:{PORT}")
    httpd.serve_forever()
