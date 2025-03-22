from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import pandas as pd
import os
import traceback
from datetime import datetime
from werkzeug.utils import secure_filename

# Flask Setup
app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

# Upload Folder Configuration
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"csv", "xls", "xlsx"}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # Limit uploads to 16MB

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Home page route for the tool collection
@app.route("/")
def home():
    """Serve the home page with the tool collection."""
    return render_template("index.html")

# Dashboard route for the Fire/EMS tool
@app.route("/fire-ems-dashboard")
def fire_ems_dashboard():
    """Serve the Fire/EMS Dashboard tool."""
    return render_template("fire-ems-dashboard.html")

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
            # Process based on file type: CSV, XLSX, or XLS
            if file.filename.lower().endswith(".csv"):
                df = pd.read_csv(file)
            elif file.filename.lower().endswith(".xlsx"):
                df = pd.read_excel(file, engine="openpyxl")
            elif file.filename.lower().endswith(".xls"):
                df = pd.read_excel(file, engine="xlrd")
            else:
                return jsonify({"error": "Unsupported file extension"}), 400

            # Get basic info
            num_rows = len(df)
            columns = df.columns.tolist()

            # Process date/time columns
            date_columns = ['Reported', 'Unit Dispatched', 'Unit Enroute', 'Unit Onscene']
            for col in date_columns:
                if col in df.columns:
                    df[col] = pd.to_datetime(df[col], errors='coerce')

            # Determine first reported date if available
            first_reported_date = None
            if "Reported" in df.columns:
                valid_dates = df["Reported"].dropna()
                if not valid_dates.empty:
                    first_date = valid_dates.min()
                    if pd.notna(first_date):
                        first_reported_date = first_date.strftime('%Y-%m-%d')

            # Calculate response times if necessary columns exist
            if "Unit Dispatched" in df.columns and "Unit Onscene" in df.columns:
                df['Response Time'] = (df['Unit Onscene'] - df['Unit Dispatched']).dt.total_seconds() / 60
                avg_response_time = df['Response Time'].dropna().mean()
                median_response_time = df['Response Time'].dropna().median()
                percentile_90_response_time = df['Response Time'].dropna().quantile(0.9)
            else:
                avg_response_time = None
                median_response_time = None
                percentile_90_response_time = None

            # Calculate incidents by hour of day from "Reported" column
            incidents_by_hour = {}
            if "Reported" in df.columns:
                df['Hour'] = df['Reported'].dt.hour
                hour_counts = df['Hour'].dropna().value_counts().sort_index()
                incidents_by_hour = hour_counts.to_dict()

            # Calculate incidents by day of week from "Reported" column
            incidents_by_day = {}
            if "Reported" in df.columns:
                df['DayOfWeek'] = df['Reported'].dt.dayofweek
                day_counts = df['DayOfWeek'].dropna().value_counts().sort_index()
                day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                incidents_by_day = {day_names[i]: count for i, count in day_counts.items()}

            # Convert datetime columns to string format
            for col in df.select_dtypes(include=['datetime64']).columns:
                df[col] = df[col].dt.strftime('%Y-%m-%d %H:%M:%S').fillna('')

            # Replace NaN values with empty strings
            df = df.fillna('')

            # Convert DataFrame to list of dictionaries (records)
            data = df.to_dict(orient="records")

            # Create response with analytics and basic info
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

@app.route("/isochrone-map")
def isochrone_map():
    """Serve the Isochrone Map Generator tool"""
    return render_template("isochrone-map.html")

if __name__ == "__main__":
    # For production on Render, consider setting debug to False
    app.run(host="0.0.0.0", port=8000, debug=True)
