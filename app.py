from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import pandas as pd
import os
import traceback
from werkzeug.utils import secure_filename

# Flask Setup
app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

# Upload Folder
UPLOAD_FOLDER = "uploads"  # Changed to plural for convention
ALLOWED_EXTENSIONS = {"csv", "xls", "xlsx"}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # Limit uploads to 16MB

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def serve_index():
    # Assuming index.html is in the root directory, not in static
    # If index.html is moved to static folder, use:
    # return send_from_directory(app.static_folder, "index.html")
    return render_template("index.html")  # This assumes index.html is in a templates folder

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
            # Process based on file type
            if file.filename.endswith(".csv"):
                df = pd.read_csv(file)
            else:  # Excel file
                df = pd.read_excel(file, engine="openpyxl")
            
            # Get basic info
            num_rows = len(df)
            columns = df.columns.tolist()
            
            # Convert to records format (list of dictionaries)
            data = df.to_dict(orient="records")
            
            # Get first reported date if column exists
            first_reported_date = None
            if "Reported" in df.columns:
                reported_dates = pd.to_datetime(df["Reported"], errors='coerce')
                if not reported_dates.isna().all():  # Check if there are any valid dates
                    first_reported_date = reported_dates.min().strftime('%Y-%m-%d')
            
            # Return JSON response
            return jsonify({
                "message": "File uploaded successfully",
                "filename": file.filename,
                "rows": num_rows,  # Added for clarity
                "data": data,
                "columns": columns,
                "first_reported_date": first_reported_date
            })
            
        except Exception as e:
            app.logger.error(f"Error processing file: {str(e)}")
            app.logger.error(traceback.format_exc())
            return jsonify({
                "error": str(e),
                "message": "Error processing file. Please check the file format."
            }), 500
    
    return jsonify({"error": "File type not allowed. Only CSV and Excel files are supported."}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
