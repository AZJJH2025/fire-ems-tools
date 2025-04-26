from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
import csv
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')
    
@app.route('/test')
def test_page():
    # Simply read and return the test.html file
    with open('test.html', 'r') as f:
        html_content = f.read()
    return html_content

@app.route('/test-file-upload')
def test_file_upload():
    # Serve the test-file-upload.html file
    with open('static/test-file-upload.html', 'r') as f:
        html_content = f.read()
    return html_content

@app.route('/data-formatter')
def data_formatter():
    return render_template('data-formatter.html')

# Simple endpoint to test file upload functionality
@app.route('/test-upload', methods=['POST'])
def test_upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Check file extension
    allowed_extensions = ['.csv', '.xlsx', '.json', '.xml', '.kml', '.kmz']
    extension = os.path.splitext(file.filename)[1].lower()
    
    if extension not in allowed_extensions:
        return jsonify({"error": f"File type {extension} not supported. Use: {', '.join(allowed_extensions)}"}), 400
    
    # For CSV files, do a quick validation
    if extension == '.csv':
        try:
            content = file.read().decode('utf-8')
            reader = csv.reader(content.splitlines())
            headers = next(reader)
            record_count = sum(1 for _ in reader)
            
            return jsonify({
                "success": True,
                "filename": file.filename,
                "size": len(content),
                "headers": headers,
                "record_count": record_count
            })
        except Exception as e:
            return jsonify({"error": f"Error parsing CSV: {str(e)}"}), 400
    
    # For other file types, just return basic info
    return jsonify({
        "success": True,
        "filename": file.filename,
        "type": extension[1:],  # Remove the dot
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)