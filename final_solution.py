#!/usr/bin/env python3
"""
Final solution for serving both the Data Formatter and Response Time Analyzer
"""
from flask import Flask, send_file, redirect, request, send_from_directory

app = Flask(__name__)

@app.route('/')
def index():
    """Serve the updated home page with matching styles"""
    return send_file('static/updated-homepage.html')

# Data Formatter routes
@app.route('/data-formatter')
@app.route('/data-formatter-react')
def data_formatter():
    return send_file('static/react-data-formatter/index.html')

# Response Analyzer routes (completely separate)
@app.route('/response-analyzer')
@app.route('/response-time-analyzer')
def response_analyzer():
    return send_file('static/alt-response-analyzer/index.html')

# Handle assets for Data Formatter
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('static/react-data-formatter/assets', filename)

# Handle static files
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    print("\n\n--------------------------------------")
    print("Final solution server running on port 5006")
    print("Home page: http://127.0.0.1:5006/")
    print("Data Formatter: http://127.0.0.1:5006/data-formatter")
    print("Response Analyzer: http://127.0.0.1:5006/response-time-analyzer")
    print("--------------------------------------\n\n")
    app.run(host='0.0.0.0', port=5006, debug=True)