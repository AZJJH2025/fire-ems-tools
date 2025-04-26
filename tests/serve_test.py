#!/usr/bin/env python3
"""
Simple HTTP server to serve the test medical sections page
"""
import http.server
import socketserver
import os

PORT = 9000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    print(f"Test page: http://localhost:{PORT}/test_medical_sections.html")
    httpd.serve_forever()