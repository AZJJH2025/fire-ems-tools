from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import pandas as pd
from werkzeug.utils import secure_filename

# Flask Setup
app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

# Upload config
UPLOAD_FOLDER = "upload"
ALLOWED_EXTENSIONS = {"csv", "xls", "xlsx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Helper: check file extension
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
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        try:
            filename = secure_filename(file.filename)

            # Read into DataFrame
            if filename.endswith(".csv"):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)

            # Extract column names
            columns = df.columns.tolist()

            # Convert rows to list of dicts
            data_rows = df.to_dict(orient="records")

            # First Reported Date (if exists)
            first_date = None
            if 'Reported' in df.columns:
                try:
                    df['Reported'] = pd.to_datetime(df['Reported'], errors='coerce')
                    first_date = df['Reported'].dropna().min()
                    first_date = first_date.strftime('%Y-%m-%d') if pd.notnull(first_date) else None
                except Exception:
                    first_date = None

            return jsonify({
                "filename": filename,
                "columns": columns,
                "data": data_rows,
                "first_reported_date": first_date,
                "row_count": len(df),
                "column_count": len(columns)
            })

        except Exception as e:
            return jsonify({"error": f"Server error: {str(e)}"}), 500

    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
