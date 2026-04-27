"""
Simple static file server with .html extension fallback for clean URLs.
Serves the frontend directory at http://localhost:3000
"""
import http.server
import os
import sys

PORT = 3000
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")

class HTMLFallbackHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Strip query string for file lookup
        path = self.path.split('?')[0]
        
        # Determine full filesystem path
        fs_path = os.path.join(DIRECTORY, path.lstrip('/'))

        # If exact file exists, serve it
        if os.path.isfile(fs_path):
            return super().do_GET()

        # Try appending .html
        html_path = fs_path + '.html'
        if os.path.isfile(html_path):
            # Rewrite internal path so parent serves the .html file
            query = self.path[len(path):]  # preserve ?query
            self.path = '/' + os.path.relpath(html_path, DIRECTORY).replace('\\', '/') + query
            return super().do_GET()

        # If directory with index.html
        index_path = os.path.join(fs_path, 'index.html')
        if os.path.isfile(index_path):
            self.path = '/' + os.path.relpath(index_path, DIRECTORY).replace('\\', '/') + (self.path.split('?')[1:] or [''])[0]
            return super().do_GET()

        # Fall through to default (will 404)
        return super().do_GET()

    def log_message(self, format, *args):
        print(f"[Frontend] {self.address_string()} - {format % args}")

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    with http.server.HTTPServer(('', PORT), HTMLFallbackHandler) as httpd:
        print(f"Frontend server running at http://localhost:{PORT}")
        print(f"Serving files from: {DIRECTORY}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)
