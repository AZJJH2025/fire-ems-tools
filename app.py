from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import os
from werkzeug.utils import secure_filename

# Flask Setup
app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

# Upload Folder
UPLOAD_FOLDER = "upload"
ALLOWED_EXTENSIONS = {"csv", "xls", "xlsx"}

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

@app.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        try:
            if file.filename.endswith(".csv"):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)

            num_rows = len(df)
            columns = df.columns.tolist()
            data = df.to_dict(orient="records")  # Fix: Ensure it's a list of dictionaries

            first_reported_date = None
            if "Reported" in df.columns:
                first_reported_date = pd.to_datetime(df["Reported"], errors='coerce').dropna().min().strftime('%Y-%m-%d')

            return jsonify({
                "message": "File uploaded successfully",
                "filename": file.filename,
                "data": data,  # Fix: Send `data` instead of `rows`
                "columns": columns,
                "first_reported_date": first_reported_date
            })

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "File type not allowed"}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
