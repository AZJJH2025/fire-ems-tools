from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import pandas as pd  # ✅ Import pandas for file analysis
from werkzeug.utils import secure_filename

# Flask Setup
app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

# Upload Folder
UPLOAD_FOLDER = "upload"
ALLOWED_EXTENSIONS = {"csv", "xls", "xlsx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB limit

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/api/status")
def status():
    return jsonify({"status": "🚀 Fire EMS API is Live!"})

@app.route("/api/upload", methods=["POST", "OPTIONS"])
def upload_file():
    try:
        if request.method == "OPTIONS":
            return jsonify({"message": "CORS preflight successful"}), 200

        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed. Please upload CSV or Excel."}), 400

        # ✅ Secure the filename
        filename = secure_filename(file.filename)

        # ✅ Check file size before saving
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0, 0)

        if file_length > MAX_FILE_SIZE:
            return jsonify({"error": "File size exceeds 5MB limit."}), 400

        # ✅ Save file
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # ✅ Analyze File (Read CSV or Excel)
        if filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        # ✅ Return a preview of the data (first 5 rows)
        preview = df.head().to_dict(orient="records")

        return jsonify({
            "message": "File uploaded & analyzed successfully",
            "filename": filename,
            "preview": preview
        }), 200

    except Exception as e:
        app.logger.error(f"Processing error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
