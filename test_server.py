"""
Test server for the Fire-EMS Tools application
This is a lightweight Flask server to serve the test pages and static files
"""
from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

# Enable better template error handling
app.config['TEMPLATES_AUTO_RELOAD'] = True

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tests/test_medical_sections')
def test_medical_sections():
    return send_from_directory('tests', 'test_medical_sections.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/test-medical')
def test_medical():
    with open('tests/test_medical_sections.html', 'r') as file:
        content = file.read()
    return content, 200, {'Content-Type': 'text/html'}

if __name__ == "__main__":
    # Run the application on port 8000 to avoid conflicts
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port, debug=True)