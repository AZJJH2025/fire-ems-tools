from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

# Initialize Flask with explicit static settings
app = Flask(__name__, static_folder="static", static_url_path="/static")

# Enable CORS for frontend access
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Ensure upload directory exists
UPLOAD_FOLDER = 'upload'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/")
def home():
    return send_from_directory("static", "index.html")

# **Explicit route to serve static files**
@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory("static", path)

@app.route('/static/data-formatter-bundle.js')
def df_bundle():
    # Always return the real bundle regardless of query-string
    return send_from_directory('static/js',
                               'data-formatter-bundle.js',
                               mimetype='text/javascript')

@app.route("/api/status")
def status():
    return jsonify({"status": "🚀 Fire EMS API is Live!"})

@app.route("/api/upload", methods=["POST", "OPTIONS"])
def upload_file():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight successful"})

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    return jsonify({"message": "File uploaded successfully", "filename": file.filename})

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8080, debug=True)
