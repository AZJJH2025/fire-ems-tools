from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import traceback
from datetime import datetime
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
            
            # Process date/time columns
            date_columns = ['Reported', 'Unit Dispatched', 'Unit Enroute', 'Unit Onscene']
            
            for col in date_columns:
                if col in df.columns:
                    # Convert to datetime with coercion for invalid dates
                    df[col] = pd.to_datetime(df[col], errors='coerce')
            
            # Get first reported date
            first_reported_date = None
            if "Reported" in df.columns:
                # Only process if we have valid dates (not all NaT)
                valid_dates = df["Reported"].dropna()
                if not valid_dates.empty:
                    # Get the minimum date and convert to string
                    first_date = valid_dates.min()
                    if pd.notna(first_date):  # Extra check to ensure it's not NaT
                        first_reported_date = first_date.strftime('%Y-%m-%d')
            
            # Calculate response times if we have the necessary columns
            if "Unit Dispatched" in df.columns and "Unit Onscene" in df.columns:
                # Calculate response time in minutes
                df['Response Time'] = (df['Unit Onscene'] - df['Unit Dispatched']).dt.total_seconds() / 60
                
                # Calculate average response time
                avg_response_time = df['Response Time'].dropna().mean()
                
                # Calculate median response time
                median_response_time = df['Response Time'].dropna().median()
                
                # Calculate 90th percentile response time
                percentile_90_response_time = df['Response Time'].dropna().quantile(0.9)
            else:
                avg_response_time = None
                median_response_time = None
                percentile_90_response_time = None
            
            # Calculate incidents by hour of day if we have timestamps
            incidents_by_hour = {}
            if "Reported" in df.columns:
                # Extract hour from timestamp
                df['Hour'] = df['Reported'].dt.hour
                
                # Count incidents by hour
                hour_counts = df['Hour'].dropna().value_counts().sort_index()
                
                # Convert to dictionary with hour keys
                incidents_by_hour = hour_counts.to_dict()
            
            # Calculate incidents by day of week
            incidents_by_day = {}
            if "Reported" in df.columns:
                # Extract day of week from timestamp (0=Monday, 6=Sunday)
                df['DayOfWeek'] = df['Reported'].dt.dayofweek
                
                # Count incidents by day of week
                day_counts = df['DayOfWeek'].dropna().value_counts().sort_index()
                
                # Convert to dictionary with day names
                day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                incidents_by_day = {day_names[i]: count for i, count in day_counts.items()}
            
            # For datetime columns, convert to string after all calculations
            for col in df.select_dtypes(include=['datetime64']).columns:
                df[col] = df[col].astype(str).replace('NaT', '')
            
            # Convert NaN values to empty strings
            df = df.fillna('')
            
            # Convert DataFrame to records format (list of dictionaries)
            data = df.to_dict(orient="records")
            
            # Create response with additional analytics
            response = {
                "message": "File uploaded successfully",
                "filename": file.filename,
                "rows": num_rows,
                "data": data,
                "columns": columns,
                "first_reported_date": first_reported_date,
                "analytics": {
                    "avg_response_time": float(avg_response_time) if avg_response_time is not None else None,
                    "median_response_time": float(median_response_time) if median_response_time is not None else None,
                    "percentile_90_response_time": float(percentile_90_response_time) if percentile_90_response_time is not None else None,
                    "incidents_by_hour": incidents_by_hour,
                    "incidents_by_day": incidents_by_day
                }
            }
            
            return jsonify(response)
            
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
