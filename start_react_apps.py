#!/usr/bin/env python
"""
Simple script to start the Flask server for React applications
"""
import os
from flask import Flask, send_file
from werkzeug.middleware.shared_data import SharedDataMiddleware

app = Flask(__name__, static_folder='static')

# Serve React Data Formatter
@app.route('/data-formatter-react')
@app.route('/data-formatter')  # Alternative route
def data_formatter_react():
    """Serve the React version of the Data Formatter tool"""
    return send_file('static/react-data-formatter/index.html')

# Serve React Response Time Analyzer
@app.route('/response-time-analyzer')
def response_time_analyzer():
    """Serve the React version of the Response Time Analyzer tool"""
    return send_file('static/react-response-time-analyzer/index.html')

# Test route
@app.route('/')
def index():
    return """
    <html>
        <head>
            <title>FireEMS React Tools</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                h1 { color: #2c3e50; }
                .tool-link { display: block; margin: 15px 0; padding: 10px; background: #f8f9fa; 
                           border-left: 4px solid #007bff; text-decoration: none; color: #333; }
                .tool-link:hover { background: #e9ecef; }
            </style>
        </head>
        <body>
            <h1>FireEMS React Tools</h1>
            <p>Select one of the tools below:</p>
            <a class="tool-link" href="/data-formatter-react">Data Formatter</a>
            <a class="tool-link" href="/response-time-analyzer">Response Time Analyzer</a>
        </body>
    </html>
    """

# Configure static file middleware to correctly serve JavaScript files with proper MIME type
app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
    '/static': app.static_folder
})

# Add additional static route to handle direct asset references
@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files with proper MIME types"""
    if filename.endswith('.js'):
        return send_file(os.path.join(app.static_folder, filename), mimetype='application/javascript')
    return send_file(os.path.join(app.static_folder, filename))

if __name__ == '__main__':
    # Run the application
    port = 5006
    print(f"\n\n--------------------------------------")
    print(f"Server is starting at http://localhost:{port}")
    print(f"Data Formatter: http://localhost:{port}/data-formatter-react")
    print(f"Response Time Analyzer: http://localhost:{port}/response-time-analyzer")
    print(f"--------------------------------------\n\n")
    app.run(host='0.0.0.0', port=port, debug=True, threaded=True)