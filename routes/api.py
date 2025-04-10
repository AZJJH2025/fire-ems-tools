"""
API routes for FireEMS.ai application.

This module defines the API endpoints for the application, including:
- Data upload endpoints
- Data retrieval endpoints
- Data processing endpoints
"""

from flask import Blueprint, request, jsonify, current_app
import logging
import pandas as pd
import numpy as np
import json
import os
import uuid
import tempfile
from datetime import datetime
from werkzeug.utils import secure_filename

from database import db, Department, Incident, User, Station
import fix_deployment

logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('api', __name__, url_prefix='/api')

# Import the safe_limit decorator if available
try:
    from app import safe_limit
except ImportError:
    # Create a dummy decorator if not available
    def safe_limit(*args, **kwargs):
        def decorator(f):
            return f
        return decorator

# Import the require_api_key decorator if available
try:
    from app import require_api_key
except ImportError:
    # Use the one from fix_deployment
    require_api_key = fix_deployment.require_api_key_safe

# Common helper function for file uploads
def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def get_upload_path():
    """Get the upload directory path, creating it if it doesn't exist"""
    upload_path = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(upload_path, exist_ok=True)
    return upload_path

def get_files_path():
    """Get the data files path, creating it if it doesn't exist"""
    data_path = os.path.join(current_app.root_path, 'data', 'uploads')
    os.makedirs(data_path, exist_ok=True)
    return data_path

# API endpoints for incidents
@bp.route('/incidents', methods=['GET'])
@safe_limit("30 per minute")
@require_api_key
def api_get_incidents(department):
    """Get all incidents for a department"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 100, type=int), 1000)  # Limit to 1000 per page
        
        # Get incidents for department with pagination
        incidents = Incident.query.filter_by(department_id=department.id).paginate(
            page=page, per_page=per_page, error_out=False)
        
        # Convert to dict
        result = {
            'incidents': [incident.to_dict() for incident in incidents.items],
            'total': incidents.total,
            'pages': incidents.pages,
            'page': page
        }
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in api_get_incidents: {str(e)}")
        return jsonify({"error": str(e)}), 500

@bp.route('/incidents/<int:incident_id>', methods=['GET'])
@safe_limit("60 per minute")
@require_api_key
def api_get_incident(department, incident_id):
    """Get a specific incident"""
    try:
        # Find incident and verify it belongs to the department
        incident = Incident.query.filter_by(id=incident_id, department_id=department.id).first()
        
        if not incident:
            return jsonify({"error": "Incident not found"}), 404
            
        return jsonify(incident.to_dict())
    except Exception as e:
        logger.error(f"Error in api_get_incident: {str(e)}")
        return jsonify({"error": str(e)}), 500

@bp.route('/incidents', methods=['POST'])
@safe_limit("30 per minute")
@require_api_key
def api_create_incident(department):
    """Create a new incident"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['incident_number', 'incident_type', 'incident_date']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Create new incident
        new_incident = Incident(
            department_id=department.id,
            incident_number=data['incident_number'],
            incident_type=data['incident_type'],
            incident_date=datetime.fromisoformat(data['incident_date']) if isinstance(data['incident_date'], str) else data['incident_date'],
            location=data.get('location'),
            status=data.get('status', 'active')
        )
        
        # Add additional fields if provided
        for key, value in data.items():
            if hasattr(new_incident, key) and key not in ['id', 'department_id']:
                setattr(new_incident, key, value)
        
        # Save to database
        db.session.add(new_incident)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "incident_id": new_incident.id,
            "incident": new_incident.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in api_create_incident: {str(e)}")
        return jsonify({"error": str(e)}), 500

# API endpoints for stations
@bp.route('/stations', methods=['GET'])
@safe_limit("30 per minute")
@require_api_key
def api_get_stations(department):
    """Get all stations for a department"""
    try:
        # Get stations for department
        stations = Station.query.filter_by(department_id=department.id).all()
        
        # Convert to dict
        result = {
            'stations': [station.to_dict() for station in stations],
            'total': len(stations)
        }
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in api_get_stations: {str(e)}")
        return jsonify({"error": str(e)}), 500

@bp.route('/stations/<int:station_id>', methods=['GET'])
@safe_limit("60 per minute")
@require_api_key
def api_get_station(department, station_id):
    """Get a specific station"""
    try:
        # Find station and verify it belongs to the department
        station = Station.query.filter_by(id=station_id, department_id=department.id).first()
        
        if not station:
            return jsonify({"error": "Station not found"}), 404
            
        return jsonify(station.to_dict())
    except Exception as e:
        logger.error(f"Error in api_get_station: {str(e)}")
        return jsonify({"error": str(e)}), 500

@bp.route('/stations', methods=['POST'])
@safe_limit("30 per minute")
@require_api_key
def api_create_station(department):
    """Create a new station"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'station_number']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Create new station
        new_station = Station(
            department_id=department.id,
            name=data['name'],
            station_number=data['station_number'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            address=data.get('address'),
            status=data.get('status', 'active')
        )
        
        # Add additional fields if provided
        for key, value in data.items():
            if hasattr(new_station, key) and key not in ['id', 'department_id']:
                setattr(new_station, key, value)
        
        # Save to database
        db.session.add(new_station)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "station_id": new_station.id,
            "station": new_station.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in api_create_station: {str(e)}")
        return jsonify({"error": str(e)}), 500

# File upload endpoint for the data formatter
@bp.route('/data-formatter/upload', methods=['POST'])
@safe_limit("10 per minute")
def upload_data_file():
    """Upload a data file for processing in the data formatter"""
    try:
        # Check if file was included in request
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
            
        file = request.files['file']
        
        # Check if a file was selected
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        # Check file type
        allowed_extensions = {'csv', 'xlsx', 'xls', 'json', 'xml'}
        if not allowed_file(file.filename, allowed_extensions):
            return jsonify({"error": f"File type not allowed. Must be one of: {', '.join(allowed_extensions)}"}), 400
            
        # Create a unique filename
        filename = secure_filename(file.filename)
        file_id = str(uuid.uuid4())
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{file_id}.{file_extension}"
        
        # Save the file
        file_path = os.path.join(get_files_path(), unique_filename)
        file.save(file_path)
        
        # Return the file ID for later reference
        return jsonify({
            "success": True,
            "fileId": file_id,
            "originalName": filename,
            "fileType": file_extension
        })
        
    except Exception as e:
        logger.error(f"Error in upload_data_file: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Data formatter transform endpoint
@bp.route('/data-formatter/transform', methods=['POST'])
@safe_limit("5 per minute")
def transform_data():
    """Transform data based on field mappings"""
    try:
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        if 'fileId' not in data:
            return jsonify({"error": "Missing required field: fileId"}), 400
            
        if 'mappings' not in data:
            return jsonify({"error": "Missing required field: mappings"}), 400
            
        file_id = data['fileId']
        mappings = data['mappings']
        
        # Find the file
        files_path = get_files_path()
        file_found = False
        file_path = None
        file_extension = None
        
        for ext in ['csv', 'xlsx', 'xls', 'json', 'xml']:
            temp_path = os.path.join(files_path, f"{file_id}.{ext}")
            if os.path.exists(temp_path):
                file_path = temp_path
                file_extension = ext
                file_found = True
                break
                
        if not file_found:
            return jsonify({"error": f"File not found with ID: {file_id}"}), 404
            
        # Load source data based on file type
        source_df = None
        try:
            if file_extension == 'csv':
                source_df = pd.read_csv(file_path)
            elif file_extension in ['xlsx', 'xls']:
                source_df = pd.read_excel(file_path)
            elif file_extension == 'json':
                source_df = pd.read_json(file_path)
            elif file_extension == 'xml':
                source_df = pd.read_xml(file_path)
            else:
                return jsonify({"error": f"Unsupported file type: {file_extension}"}), 400
        except Exception as e:
            logger.error(f"Error reading file: {str(e)}")
            return jsonify({"error": f"Error reading file: {str(e)}"}), 500
            
        # Create a new DataFrame for transformed data
        transformed_df = pd.DataFrame()
        transformation_log = []
        errors = []
        
        # Process each mapping
        for mapping in mappings:
            try:
                # Extract mapping details
                source_field = mapping.get('sourceField')
                target_field = mapping.get('targetField')
                transform_config = mapping.get('transformConfig')
                
                if not source_field or not target_field:
                    errors.append(f"Invalid mapping missing source or target field")
                    continue
                    
                # Check if source field exists
                if source_field not in source_df.columns:
                    errors.append(f"Source field '{source_field}' not found in data")
                    continue
                    
                # Get the source data
                source_data = source_df[source_field].copy()
                
                # Apply transformations based on config
                if transform_config:
                    transform_type = transform_config.get('type')
                    
                    if transform_type == 'date':
                        # Date transformation
                        source_format = transform_config.get('sourceFormat')
                        target_format = transform_config.get('targetFormat', 'ISO8601')
                        
                        try:
                            # Handle 'auto' format detection
                            if source_format == 'auto':
                                # Try to infer date format
                                source_data = pd.to_datetime(source_data, errors='coerce')
                            elif source_format == 'custom':
                                # Use custom format
                                custom_format = transform_config.get('customFormat', '')
                                # Convert pandas date format to Python date format
                                python_format = custom_format.replace('YYYY', '%Y').replace('MM', '%m').replace('DD', '%d').replace('hh', '%H').replace('mm', '%M').replace('ss', '%S')
                                source_data = pd.to_datetime(source_data, format=python_format, errors='coerce')
                            else:
                                # Use predefined format
                                format_mapping = {
                                    'MM/DD/YYYY': '%m/%d/%Y',
                                    'DD/MM/YYYY': '%d/%m/%Y',
                                    'YYYY-MM-DD': '%Y-%m-%d',
                                    'MM-DD-YYYY': '%m-%d-%Y',
                                    'DD-MM-YYYY': '%d-%m-%Y'
                                }
                                python_format = format_mapping.get(source_format)
                                if python_format:
                                    source_data = pd.to_datetime(source_data, format=python_format, errors='coerce')
                                else:
                                    source_data = pd.to_datetime(source_data, errors='coerce')
                            
                            # Format for output
                            if target_format == 'ISO8601':
                                source_data = source_data.dt.strftime('%Y-%m-%d')
                            elif target_format in format_mapping:
                                source_data = source_data.dt.strftime(format_mapping[target_format])
                            
                            transformation_log.append(f"Transformed '{source_field}' to '{target_field}' with date format '{target_format}'")
                        except Exception as e:
                            errors.append(f"Error transforming date field '{source_field}': {str(e)}")
                            # Fallback to original data
                            transformation_log.append(f"Date transform failed for '{source_field}', using original values")
                    
                    elif transform_type == 'coordinates':
                        # Coordinate transformation
                        format_type = transform_config.get('format', 'decimal')
                        
                        try:
                            # For now, just ensure coordinates are numeric and valid
                            source_data = pd.to_numeric(source_data, errors='coerce')
                            
                            # Validate coordinates based on field name
                            if "latitude" in target_field.lower():
                                # Latitude should be between -90 and 90
                                source_data = source_data.where((source_data >= -90) & (source_data <= 90), np.nan)
                            elif "longitude" in target_field.lower():
                                # Longitude should be between -180 and 180
                                source_data = source_data.where((source_data >= -180) & (source_data <= 180), np.nan)
                                
                            transformation_log.append(f"Validated coordinate field '{source_field}' to '{target_field}'")
                        except Exception as e:
                            errors.append(f"Error transforming coordinate field '{source_field}': {str(e)}")
                            transformation_log.append(f"Coordinate transform failed for '{source_field}', using original values")
                    
                    elif transform_type == 'text':
                        # Text transformation
                        text_transform = transform_config.get('textTransform', 'none')
                        
                        if text_transform == 'uppercase':
                            source_data = source_data.str.upper()
                        elif text_transform == 'lowercase':
                            source_data = source_data.str.lower()
                        elif text_transform == 'capitalize':
                            source_data = source_data.str.capitalize()
                            
                        transformation_log.append(f"Applied text transform '{text_transform}' to '{source_field}'")
                
                # Add the transformed data to the result DataFrame
                transformed_df[target_field] = source_data
                
            except Exception as e:
                errors.append(f"Error processing mapping for '{source_field}' to '{target_field}': {str(e)}")
        
        # Check if we have any successful transformations
        if transformed_df.empty:
            return jsonify({
                "error": "No valid mappings could be processed",
                "details": errors
            }), 400
            
        # Generate the preview (first 10 rows)
        preview_data = transformed_df.head(10).fillna('').to_dict('records')
        
        # Detect any missing required fields
        schema_path = os.path.join(current_app.root_path, 'public', 'standardized_incident_record_schema.json')
        required_fields = []
        
        try:
            if os.path.exists(schema_path):
                with open(schema_path, 'r') as f:
                    schema = json.load(f)
                    if 'requiredFields' in schema:
                        required_fields = [field['name'] for field in schema['requiredFields']]
        except Exception as e:
            logger.error(f"Error loading schema: {str(e)}")
        
        missing_fields = []
        if required_fields:
            for field in required_fields:
                if field not in transformed_df.columns:
                    missing_fields.append(field)
        
        # Generate a unique ID for the transformed data
        transform_id = str(uuid.uuid4())
        
        # Save the transformed data for later retrieval
        try:
            transform_path = os.path.join(files_path, f"transformed_{transform_id}.csv")
            transformed_df.to_csv(transform_path, index=False)
        except Exception as e:
            logger.error(f"Error saving transformed data: {str(e)}")
            # Continue even if saving fails
        
        # Return the response
        return jsonify({
            "success": True,
            "transformId": transform_id,
            "preview": preview_data,
            "transformationLog": transformation_log,
            "errors": errors,
            "missingRequiredFields": missing_fields,
            "rowCount": len(transformed_df),
            "columnCount": len(transformed_df.columns)
        })
        
    except Exception as e:
        logger.error(f"Error in transform_data: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Data formatter download endpoint
@bp.route('/data-formatter/download/<transform_id>', methods=['GET'])
def download_transformed_data(transform_id):
    """Download the transformed data file"""
    try:
        files_path = get_files_path()
        file_path = os.path.join(files_path, f"transformed_{transform_id}.csv")
        
        if not os.path.exists(file_path):
            return jsonify({"error": "Transformed file not found"}), 404
            
        # Read the CSV file
        df = pd.read_csv(file_path)
        
        # Determine the output format
        output_format = request.args.get('format', 'csv').lower()
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{output_format}') as temp_file:
            if output_format == 'json':
                df.to_json(temp_file.name, orient='records')
                mimetype = 'application/json'
            elif output_format == 'excel':
                df.to_excel(temp_file.name, index=False)
                mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                output_format = 'xlsx'  # Use xlsx for Excel files
            else:  # Default to CSV
                df.to_csv(temp_file.name, index=False)
                mimetype = 'text/csv'
                output_format = 'csv'
                
        # Return the file as a response
        from flask import send_file
        response = send_file(
            temp_file.name, 
            mimetype=mimetype,
            as_attachment=True,
            download_name=f"transformed_data.{output_format}"
        )
        
        # Set a callback to remove the temporary file after the response is sent
        @response.call_on_close
        def remove_temp_file():
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)
                
        return response
        
    except Exception as e:
        logger.error(f"Error in download_transformed_data: {str(e)}")
        return jsonify({"error": str(e)}), 500