from flask import Flask, send_from_directory, render_template, request, jsonify
from flask_cors import CORS
import os
import sys

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our test dashboard routes
import test_dashboard_routes

# Flask Setup
app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

# Home page route
@app.route("/")
def home():
    return "Simple Flask App - Home Page"

# Simple test routes
@app.route('/simple-test')
def simple_test():
    return send_from_directory('static', 'simple-test.html')

@app.route('/simple-incident-logger')
def simple_incident_logger():
    return send_from_directory('static', 'simple-incident-logger.html')

# Incident Logger route
@app.route('/incident-logger')
def incident_logger():
    try:
        return render_template('incident-logger.html')
    except Exception as e:
        return f"Error: {str(e)}", 500

# Initialize test dashboard routes
test_dashboard_routes.init_app(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)