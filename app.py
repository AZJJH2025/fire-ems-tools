from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import pandas as pd
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

        # Secure filename
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # Load data
        df = pd.read_excel(file_path) if filename.endswith(".xlsx") else pd.read_csv(file_path)

        # Clean column names
        df.columns = df.columns.str.strip()  # Remove extra spaces

        # Convert DataFrame to JSON-friendly format
        table_data = {
            "filename": filename,
            "rows": df.fillna("").values.tolist(),  # Convert to list
            "columns": df.columns.tolist(),  # Column names
            "first_reported_date": df.iloc[0, 1] if "Reported" in df.columns else "N/A",
        }

        return jsonify(table_data), 200

    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
