from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

# Initialize Flask app with proper static folder
app = Flask(__name__, static_folder="static")

# Enable CORS with specific options
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Ensure upload directory exists
UPLOAD_FOLDER = 'upload'  # Using your folder name
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/")
def home():
    return send_from_directory("static", "index.html")

@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory("static", path)

@app.route("/api/status")
def status():
    return "🚀 Fire EMS API is Live!"

@app.route("/api/upload", methods=["POST", "OPTIONS"])
def upload_file():
    # Handle OPTIONS request for CORS preflight
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight request successful"})
        return response
        
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    # Save the file
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)
    
    return jsonify({
        "message": "File uploaded successfully", 
        "filename": file.filename
    })

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8080, help='Port to run the server on')
    args = parser.parse_args()
    
    print(f"Server running at http://127.0.0.1:{args.port}")
    app.run(host='127.0.0.1', port=args.port, debug=True)
