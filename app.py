from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import pandas as pd
import os
import traceback
from datetime import datetime
from werkzeug.utils import secure_filename
import requests
import time

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

def geocode_address(address):
    """
    Convert address to latitude and longitude using Nominatim API.
    """
    try:
        # Add a slight delay to respect Nominatim usage policy
        time.sleep(1)
        
        # Create the request URL with parameters
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            'q': address,
            'format': 'json',
            'limit': 1,
            'countrycodes': 'us',  # Focus on US addresses
            'addressdetails': 1
        }
        
        # Add a user-agent as required by Nominatim
        headers = {
            'User-Agent': 'FireEMS.ai Call Density Heatmap Tool'
        }
        
        # Make the request
        response = requests.get(url, params=params, headers=headers)
        data = response.json()
        
        # Check if we got a result
        if data and len(data) > 0:
            lat = float(data[0]['lat'])
            lon = float(data[0]['lon'])
            return lat, lon
        
        return None, None
    
    except Exception as e:
        app.logger.error(f"Geocoding error: {str(e)}")
        return None, None

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

# Add route for the Call Density Heatmap page
@app.route('/call-density-heatmap')
def call_density_heatmap():
    """Serve the Call Density Heatmap tool"""
    return render_template('call-density-heatmap.html')

# Add route to handle the call data file upload
@app.route('/upload-call-data', methods=['POST'])
def upload_call_data():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'})
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # Process the file based on its type
            if filename.endswith('.csv'):
                data = pd.read_csv(file_path)
            elif filename.endswith(('.xlsx', '.xls')):
                if filename.endswith('.xlsx'):
                    data = pd.read_excel(file_path, engine="openpyxl")
                else:
                    data = pd.read_excel(file_path, engine="xlrd")
            else:
                return jsonify({'success': False, 'error': 'Unsupported file format. Please upload CSV or Excel file.'})
            
            # Check for required columns
            required_columns = ['latitude', 'longitude']
            missing_columns = [col for col in required_columns if col not in data.columns]
            
            # Define possible address column names (add any others that might be in your files)
            address_column_names = ['address', 'location', 'site_address', 'full_address', 'street_address', 
                                   'location_address', 'site', 'incident_address', 'incident_location',
                                   'Address', 'Location', 'LOCATION', 'ADDRESS', 'Incident Address', 
                                   'Street', 'Street Address', 'Addr', 'FullAddress', 'Full_Address']

            # Check if any of these columns exist in the data
            found_address_column = None
            for addr_col in address_column_names:
                if addr_col in data.columns:
                    found_address_column = addr_col
                    break

            # If latitude and longitude are missing but some form of address column is present, try geocoding
            if missing_columns and found_address_column:
                app.logger.info(f"Attempting to geocode addresses from column '{found_address_column}' since lat/lng columns are missing")
                
                # Create new latitude and longitude columns
                data['latitude'] = None
                data['longitude'] = None
                
                # Number of addresses to geocode
                total_addresses = data[found_address_column].count()
                geocoded_count = 0
                
                # Loop through addresses and geocode them
                for index, row in data.iterrows():
                    if not pd.isna(row[found_address_column]):
                        lat, lng = geocode_address(row[found_address_column])
                        if lat and lng:
                            data.at[index, 'latitude'] = lat
                            data.at[index, 'longitude'] = lng
                            geocoded_count += 1
                
                # If we successfully geocoded at least some addresses, we can proceed
                if geocoded_count > 0:
                    app.logger.info(f"Successfully geocoded {geocoded_count} out of {total_addresses} addresses")
                    missing_columns = []  # Clear missing columns since we now have lat/lng
                else:
                    return jsonify({
                        'success': False,
                        'error': f"Unable to geocode any addresses. Please provide a file with latitude and longitude columns."
                    })
            
            if missing_columns:
                return jsonify({
                    'success': False, 
                    'error': f'Missing required columns: {", ".join(missing_columns)}. Please make sure your file includes latitude and longitude, or an address column that can be geocoded.'
                })
            
            # Extract the necessary data
            points = []
            
            for index, row in data.iterrows():
                # Skip rows with missing lat/lng
                if pd.isna(row['latitude']) or pd.isna(row['longitude']):
                    continue
                
                point = {
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude'])
                }
                
                # Add optional fields if they exist
                optional_fields = {
                    'type': 'call_type',
                    'hour': 'hour',
                    'dayOfWeek': 'day_of_week',
                    'month': 'month',
                    'intensity': 'intensity'
                }
                
                for dest_key, source_key in optional_fields.items():
                    if source_key in data.columns and not pd.isna(row[source_key]):
                        point[dest_key] = row[source_key]
                
                # If timestamp or datetime column exists, extract time components
                datetime_columns = ['timestamp', 'datetime', 'date_time', 'call_time', 'incident_time', 'Reported']
                
                for col in datetime_columns:
                    if col in data.columns and not pd.isna(row[col]):
                        try:
                            dt = pd.to_datetime(row[col])
                            if 'hour' not in point:
                                point['hour'] = dt.hour
                            if 'dayOfWeek' not in point:
                                point['dayOfWeek'] = dt.dayofweek
                            if 'month' not in point:
                                point['month'] = dt.month
                            break
                        except:
                            # If datetime conversion fails, continue without these fields
                            pass
                
                points.append(point)
            
            # Clean up the uploaded file
            os.remove(file_path)
            
            return jsonify({
                'success': True,
                'points': points
            })
            
        except Exception as e:
            # Clean up the uploaded file if it exists
            if os.path.exists(file_path):
                os.remove(file_path)
            
            app.logger.error(f"Error processing call data file: {str(e)}")
            app.logger.error(traceback.format_exc())
            
            return jsonify({
                'success': False,
                'error': f'Error processing file: {str(e)}'
            })
    
    return jsonify({'success': False, 'error': 'File type not allowed. Only CSV and Excel files are supported.'})

if __name__ == "__main__":
    # For production on Render, consider setting debug to False
    app.run(host="0.0.0.0", port=8000, debug=True)
