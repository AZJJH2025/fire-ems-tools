from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import pandas as pd
import re
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
    """Check if the uploaded file has an allowed extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def serve_index():
    """Serve the index.html file from the static folder."""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/status")
def status():
    """Check if the API is live."""
    return jsonify({"status": "🚀 Fire EMS API is Live!"})


@app.route("/api/upload", methods=["POST", "OPTIONS"])
def upload_file():
    """Handle file uploads and analyze data."""
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

        # Check file size
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0, 0)

        if file_length > MAX_FILE_SIZE:
            return jsonify({"error": "File size exceeds 5MB limit."}), 400

        # Save the uploaded file
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # ✅ Load and process file
        data_analysis = analyze_file(file_path)

        return jsonify({"message": "File uploaded successfully", "filename": filename, "analysis": data_analysis}), 200

    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


def analyze_file(file_path):
    """Analyze the uploaded Fire/EMS data."""
    try:
        # Load the file (detect CSV or Excel)
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path, engine="openpyxl")

        # ✅ Convert date columns safely
        date_columns = ["date", "incident_date", "response_time"]  # Adjust based on actual file structure
        for col in date_columns:
            if col in df.columns:
                df[col] = df[col].astype(str)  # Ensure all values are string before conversion
                df[col] = df[col].apply(clean_date_format)  # Apply date cleaning function
                df[col] = pd.to_datetime(df[col], errors="coerce")  # Convert, replacing invalids with NaT
                df[col].fillna(pd.Timestamp("2000-01-01"), inplace=True)  # Replace NaT with a default date

        # ✅ Perform basic analysis
        analysis = {
            "total_rows": len(df),
            "columns": list(df.columns),
            "summary": df.describe().to_dict()
        }

        return analysis

    except Exception as e:
        return {"error": f"Analysis error: {str(e)}"}


def clean_date_format(value):
    """
    Cleans and standardizes date formats in the dataset.
    - Removes any non-numeric characters except `/`, `-`, or `:`
    - Returns empty string for completely invalid values.
    """
    if pd.isna(value) or not isinstance(value, str) or value.strip() == "":
        return ""

    # Remove unexpected characters but keep standard date separators
    value = re.sub(r"[^0-9/\-: ]", "", value).strip()

    # If value is still empty after cleaning, return a placeholder
    return value if value else "2000-01-01"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
