from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import pandas as pd
import os
import traceback
from datetime import datetime
from werkzeug.utils import secure_filename
import requests
import time
import json  # Add JSON import for Incident Logger

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
            
            # Print all columns for debugging
            app.logger.info(f"Available columns in file: {list(data.columns)}")

            # Create a case-insensitive mapping of column names
            column_map = {col.lower(): col for col in data.columns}
            app.logger.info(f"Case-insensitive column map: {column_map}")
            
            # Check for coordinates columns (case-insensitive)
            coordinate_fields = {
                'latitude': ['latitude', 'lat', 'y', 'Latitude', 'LAT', 'Y'],
                'longitude': ['longitude', 'long', 'lon', 'lng', 'x', 'Longitude', 'LONGITUDE', 'LONG', 'LON', 'LNG', 'X']
            }
            
            found_lat_col = None
            found_lng_col = None
            
            # Check for coordinate fields with exact match
            for lat_name in coordinate_fields['latitude']:
                if lat_name in data.columns:
                    found_lat_col = lat_name
                    break
            
            for lng_name in coordinate_fields['longitude']:
                if lng_name in data.columns:
                    found_lng_col = lng_name
                    break
            
            # If not found with exact match, try case-insensitive match
            if not found_lat_col:
                for lat_name in coordinate_fields['latitude']:
                    if lat_name.lower() in column_map:
                        found_lat_col = column_map[lat_name.lower()]
                        break
            
            if not found_lng_col:
                for lng_name in coordinate_fields['longitude']:
                    if lng_name.lower() in column_map:
                        found_lng_col = column_map[lng_name.lower()]
                        break
            
            app.logger.info(f"Found latitude column: {found_lat_col}")
            app.logger.info(f"Found longitude column: {found_lng_col}")
            
            # If we found coordinate columns, rename them to expected names
            if found_lat_col and found_lng_col:
                data['latitude'] = data[found_lat_col]
                data['longitude'] = data[found_lng_col]
                app.logger.info("Mapped coordinate columns to latitude/longitude")
                
                # Check for required columns (should be present now after mapping)
                required_columns = ['latitude', 'longitude']
                missing_columns = [col for col in required_columns if col not in data.columns]
            else:
                # Define possible address column names (add any others that might be in your files)
                address_column_names = ['address', 'location', 'site_address', 'full_address', 'street_address', 
                                      'location_address', 'site', 'incident_address', 'incident_location',
                                      'full address', 'Address', 'Location', 'LOCATION', 'ADDRESS', 'Incident Address', 
                                      'Street', 'Street Address', 'Addr', 'FullAddress', 'Full_Address', 'Full Address']
                
                # Try to find address column (case-insensitive)
                found_address_column = None
                for addr_col in address_column_names:
                    if addr_col in data.columns:
                        found_address_column = addr_col
                        break
                
                # If not found with exact match, try case-insensitive match
                if not found_address_column:
                    for addr_col in address_column_names:
                        if addr_col.lower() in column_map:
                            found_address_column = column_map[addr_col.lower()]
                            break
                
                app.logger.info(f"Found address column: {found_address_column}")
                
                # Check for required columns 
                required_columns = ['latitude', 'longitude']
                missing_columns = [col for col in required_columns if col not in data.columns]
                
                # If we found an address column but no coordinates, try geocoding
                if found_address_column and missing_columns:
                    # Log sample address
                    sample_addresses = data[found_address_column].dropna().head(1).tolist()
                    if sample_addresses:
                        app.logger.info(f"Sample address from column '{found_address_column}': {sample_addresses[0]}")
                    
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
                
                # Add optional fields if they exist (case-insensitive)
                optional_fields = {
                    'type': ['call_type', 'incident_type', 'type', 'call type', 'incident type', 'Type', 'CALL_TYPE'],
                    'hour': ['hour', 'hour_of_day', 'Hour'],
                    'dayOfWeek': ['day_of_week', 'weekday', 'day', 'Day', 'DayOfWeek'],
                    'month': ['month', 'Month'],
                    'intensity': ['intensity', 'weight', 'count', 'Intensity', 'Weight', 'Count']
                }
                
                for dest_key, source_keys in optional_fields.items():
                    # Check for exact match
                    found_field = False
                    for source_key in source_keys:
                        if source_key in data.columns and not pd.isna(row[source_key]):
                            point[dest_key] = row[source_key]
                            found_field = True
                            break
                    
                    # If not found, try case-insensitive match
                    if not found_field:
                        for source_key in source_keys:
                            if source_key.lower() in column_map and not pd.isna(row[column_map[source_key.lower()]]):
                                point[dest_key] = row[column_map[source_key.lower()]]
                                break
                
                # If timestamp or datetime column exists, extract time components
                datetime_columns = ['timestamp', 'datetime', 'date_time', 'call_time', 'incident_time', 'Reported', 'reported', 'date', 'time']
                
                for col in datetime_columns:
                    found_col = None
                    # Check for exact match
                    if col in data.columns:
                        found_col = col
                    # If not found, try case-insensitive match
                    elif col.lower() in column_map:
                        found_col = column_map[col.lower()]
                    
                    if found_col and not pd.isna(row[found_col]):
                        try:
                            dt = pd.to_datetime(row[found_col])
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

# Incident Logger routes
@app.route('/incident-logger')
def incident_logger():
    """Serve the Incident Logger tool"""
    return render_template('incident-logger.html')

# API endpoints for Incident Logger
@app.route('/api/incident/create', methods=['POST'])
def create_incident():
    """Create a new incident"""
    try:
        data = request.get_json()
        
        # Validate the required fields
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Create a unique ID if not provided
        if not data.get('id'):
            now = datetime.now()
            date_str = now.strftime('%Y%m%d')
            random_id = str(int(time.time() * 1000) % 10000).zfill(4)
            data['id'] = f"INC-{date_str}-{random_id}"
        
        # Add metadata
        data['created_at'] = datetime.now().isoformat()
        data['last_modified'] = datetime.now().isoformat()
        
        # Create data directory if it doesn't exist
        incidents_dir = os.path.join('data', 'incidents')
        os.makedirs(incidents_dir, exist_ok=True)
        
        # Save to file
        file_path = os.path.join(incidents_dir, f"{data['id']}.json")
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return jsonify({"success": True, "id": data['id']}), 201
    
    except Exception as e:
        app.logger.error(f"Error creating incident: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/incident/update/<id>', methods=['PUT'])
def update_incident(id):
    """Update an existing incident"""
    try:
        data = request.get_json()
        
        # Validate the required fields
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Check if incident exists
        incidents_dir = os.path.join('data', 'incidents')
        file_path = os.path.join(incidents_dir, f"{id}.json")
        
        if not os.path.exists(file_path):
            return jsonify({"error": f"Incident {id} not found"}), 404
        
        # Update metadata
        data['last_modified'] = datetime.now().isoformat()
        
        # Save to file
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return jsonify({"success": True, "id": id}), 200
    
    except Exception as e:
        app.logger.error(f"Error updating incident: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/incident/get/<id>', methods=['GET'])
def get_incident(id):
    """Get a specific incident by ID"""
    try:
        # Check if incident exists
        incidents_dir = os.path.join('data', 'incidents')
        file_path = os.path.join(incidents_dir, f"{id}.json")
        
        if not os.path.exists(file_path):
            return jsonify({"error": f"Incident {id} not found"}), 404
        
        # Read from file
        with open(file_path, 'r') as f:
            incident = json.load(f)
        
        return jsonify(incident), 200
    
    except Exception as e:
        app.logger.error(f"Error getting incident: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/incident/list', methods=['GET'])
def list_incidents():
    """List all incidents with optional filtering"""
    try:
        # Get query parameters for filtering
        status = request.args.get('status')
        type = request.args.get('type')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # Read all incident files
        incidents_dir = os.path.join('data', 'incidents')
        if not os.path.exists(incidents_dir):
            os.makedirs(incidents_dir, exist_ok=True)
            return jsonify({"incidents": []}), 200
        
        incidents = []
        for filename in os.listdir(incidents_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(incidents_dir, filename)
                with open(file_path, 'r') as f:
                    incident = json.load(f)
                
                # Apply filters
                include = True
                
                if status and incident.get('status') != status:
                    include = False
                
                if type and incident.get('incident_type', {}).get('primary') != type:
                    include = False
                
                if date_from or date_to:
                    incident_date = incident.get('timestamp')
                    if incident_date:
                        if date_from and incident_date < date_from:
                            include = False
                        if date_to and incident_date > date_to:
                            include = False
                
                if include:
                    incidents.append(incident)
        
        # Sort by timestamp (newest first)
        incidents.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return jsonify({"incidents": incidents}), 200
    
    except Exception as e:
        app.logger.error(f"Error listing incidents: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/incident/export', methods=['GET'])
def export_incidents():
    """Export incidents in various formats"""
    try:
        # Get query parameters
        format = request.args.get('format', 'csv')
        ids = request.args.getlist('ids')  # List of incident IDs to export
        hipaa_compliant = request.args.get('hipaa_compliant', 'false').lower() == 'true'
        
        # Read incident files
        incidents_dir = os.path.join('data', 'incidents')
        incidents = []
        
        # If specific IDs are requested, only load those
        if ids:
            for id in ids:
                file_path = os.path.join(incidents_dir, f"{id}.json")
                if os.path.exists(file_path):
                    with open(file_path, 'r') as f:
                        incidents.append(json.load(f))
        else:
            # Otherwise load all incidents
            for filename in os.listdir(incidents_dir):
                if filename.endswith('.json'):
                    file_path = os.path.join(incidents_dir, filename)
                    with open(file_path, 'r') as f:
                        incidents.append(json.load(f))
        
        # Apply HIPAA de-identification if requested
        if hipaa_compliant:
            # Import de-identification functionality
            # Note: This would be implemented in a separate module
            # For now, we'll just add a placeholder
            for incident in incidents:
                # De-identify PHI fields
                if 'patient_info' in incident:
                    if 'details' in incident['patient_info']:
                        for patient in incident['patient_info']['details']:
                            if 'name' in patient:
                                patient['name'] = {'first': '[REDACTED]', 'last': '[REDACTED]'}
                            if 'dob' in patient:
                                patient['dob'] = '[REDACTED]'
                            if 'address' in patient:
                                patient['address'] = '[REDACTED]'
                            if 'phone' in patient:
                                patient['phone'] = '[REDACTED]'
                # Add de-identification metadata
                incident['deidentified'] = True
                incident['deidentification_date'] = datetime.now().isoformat()
        
        # Return appropriate format
        if format == 'json':
            return jsonify({"incidents": incidents}), 200
        
        elif format == 'csv':
            # Convert to DataFrame for CSV export
            flat_incidents = []
            for incident in incidents:
                flat_incident = {
                    'id': incident.get('id'),
                    'timestamp': incident.get('timestamp'),
                    'status': incident.get('status'),
                    'address': incident.get('location', {}).get('address'),
                    'latitude': incident.get('location', {}).get('latitude'),
                    'longitude': incident.get('location', {}).get('longitude'),
                    'primary_type': incident.get('incident_type', {}).get('primary'),
                    'secondary_type': incident.get('incident_type', {}).get('secondary'),
                    'specific_type': incident.get('incident_type', {}).get('specific'),
                    'caller_name': None if hipaa_compliant else incident.get('caller_info', {}).get('name'),
                    'time_received': incident.get('dispatch', {}).get('time_received'),
                    'time_arrived': incident.get('dispatch', {}).get('time_arrived'),
                    'patient_count': incident.get('patient_info', {}).get('count'),
                    'transported': incident.get('disposition', {}).get('transported'),
                    'destination': None if hipaa_compliant else incident.get('disposition', {}).get('destination'),
                    'created_by': incident.get('audit', {}).get('created_by'),
                    'created_at': incident.get('audit', {}).get('created_at'),
                    'last_modified': incident.get('audit', {}).get('last_modified')
                }
                flat_incidents.append(flat_incident)
            
            # Convert to CSV
            df = pd.DataFrame(flat_incidents)
            csv_data = df.to_csv(index=False)
            
            filename = "incidents-deidentified.csv" if hipaa_compliant else "incidents.csv"
            
            return csv_data, 200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': f'attachment; filename={filename}'
            }
        
        else:
            return jsonify({"error": f"Unsupported format: {format}"}), 400
    
    except Exception as e:
        app.logger.error(f"Error exporting incidents: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # For production on Render, consider setting debug to False
    app.run(host="0.0.0.0", port=8000, debug=True)
