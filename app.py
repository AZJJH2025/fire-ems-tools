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
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"csv", "xls", "xlsx"}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # Limit uploads to 16MB

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def serve_index():
    # Using render_template to serve index.html from the templates folder
    return render_template("index.html")

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
            
            # Get first reported date if column exists - with safer date handling
            first_reported_date = None
            if "Reported" in df.columns:
                # Convert to datetime with coercion for invalid dates
                df["Reported"] = pd.to_datetime(df["Reported"], errors='coerce')
                
                # Only process if we have valid dates (not all NaT)
                valid_dates = df["Reported"].dropna()
                if not valid_dates.empty:
                    # Get the minimum date and convert to string
                    first_date = valid_dates.min()
                    if pd.notna(first_date):  # Extra check to ensure it's not NaT
                        first_reported_date = first_date.strftime('%Y-%m-%d')
            
            # Convert DataFrame to records format (list of dictionaries)
            # Handle NaN/NaT values before conversion to avoid JSON serialization issues
            df = df.fillna('')  # Replace NaN with empty string
            
            # For datetime columns, convert to string
            for col in df.select_dtypes(include=['datetime64']).columns:
                df[col] = df[col].astype(str).replace('NaT', '')
                
            data = df.to_dict(orient="records")
            
            # Return JSON response
            return jsonify({
                "message": "File uploaded successfully",
                "filename": file.filename,
                "rows": num_rows,
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
    app.run(host="0.0.0.0", port=8000, debug=True)
