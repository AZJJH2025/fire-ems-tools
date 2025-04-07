import http.server
import socketserver
import os
import sys

# Set the directory to serve files from
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static'))

# Default port
PORT = 9999

# Check for port argument
if len(sys.argv) > 1 and sys.argv[1].startswith('port='):
    try:
        PORT = int(sys.argv[1].split('=')[1])
    except:
        print(f"Invalid port specified, using default {PORT}")

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"{self.client_address[0]} - {format % args}")

    def end_headers(self):
        # Set CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

# Start the server
print(f"Starting simple HTTP server on http://localhost:{PORT}")
print(f"Serving files from: {os.getcwd()}")
print("Press Ctrl+C to stop")

try:
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running on port {PORT}")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
except OSError as e:
    if 'Address already in use' in str(e):
        print(f"Port {PORT} is already in use. Please try a different port.")
    else:
        print(f"Error: {e}")
except Exception as e:
    print(f"An error occurred: {e}")