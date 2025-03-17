from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

# Initialize Flask and explicitly set static folder
app = Flask(__name__, static_folder="static", static_url_path="")

# Enable CORS
CORS(app)

# Ensure upload directory exists
UPLOAD_FOLDER = "upload"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# ✅ Serve index.html properly at root
@app.route("/")
def serve_index():
    return send_from_directory("static", "index.html")

# ✅ Serve all static files (CSS, JS, etc.)
@app.route("/<path:path>")
def serve_static_files(path):
    return send_from_directory("static", path)

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

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)

    return jsonify({"message": "File uploaded successfully", "filename": file.filename})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
