from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import pandas as pd
import os

app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

UPLOAD_FOLDER = "upload"
ALLOWED_EXTENSIONS = {"csv", "xls", "xlsx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")





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
            return jsonify({"error": "File type not allowed. Upload CSV/Excel only."}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        # ✅ Load Excel and parse safely
        df = pd.read_excel(filepath, engine="openpyxl")

        # ✅ Basic Analysis (Modify as needed)
        num_rows = len(df)
        num_columns = len(df.columns)
        column_names = df.columns.tolist()

        # ✅ Check first valid "Reported" date
        if "Reported" in df.columns:
            reported_valid = df["Reported"].dropna()
            first_reported = str(reported_valid.iloc[0].date()) if not reported_valid.empty else "No valid reported date found"
        else:
            first_reported = "Reported column not found"

        return jsonify({
            "message": "File uploaded and analyzed successfully.",
            "filename": filename,
            "num_rows": num_rows,
            "num_columns": num_columns,
            "column_names": column_names,
            "first_reported_date": first_reported
        })

    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route("/api/status")
def status():
    return jsonify({"status": "🚀 Fire EMS API is Live!"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
