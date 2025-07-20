"""
API routes for FireEMS.ai application.

This module defines the API endpoints for the application, including:
- Data upload endpoints
- Data retrieval endpoints
- Data processing endpoints
- System health endpoints
"""

from flask import Blueprint, request, jsonify, current_app
import logging
import pandas as pd
import numpy as np
import json
import os
import uuid
import tempfile
import traceback
from datetime import datetime
from werkzeug.utils import secure_filename
from flask_wtf.csrf import CSRFProtect

from database import db, Department, Incident, User, Station
import fix_deployment

logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('api', __name__, url_prefix='/api')

# Health check endpoint for resilience framework
@bp.route('/health-check')
def health_check():
    """API health check endpoint for resilience monitoring"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": current_app.config.get('ENV', 'development'),
        "database": "unknown"
    }
    
    # Safe database connectivity check (additive only, no risk)
    try:
        # Simple database ping to verify connectivity
        db.session.execute(db.text('SELECT 1'))
        health_status["database"] = "connected"
    except Exception as e:
        # Log database issue but don't fail health check
        logger.warning(f"Database connectivity check failed: {str(e)}")
        health_status["database"] = "disconnected"
        # Keep status as "healthy" because app can still serve static content
    
    return jsonify(health_status)

# Import utility functions from app_utils module
from app_utils import safe_limit, require_api_key

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

# Create a CSRFProtect instance just for exemption
# This is only for development and testing purposes
csrf = CSRFProtect()

# Test endpoint to verify data transformation functionality
@bp.route('/test/data-transformer', methods=['GET'])
def test_data_transformer():
    """Test endpoint for data transformer functionality"""
    from routes.helpers.data_transformer import transform_datetime, apply_transformations, load_schema
    
    # Create a test DataFrame
    data = {
        "Incident_No": ["TEST-001", "TEST-002", "TEST-003"],
        "Date": ["2023-01-15", "2023-01-16", "2023-01-17"],
        "Time": ["14:30:00", "15:45:00", "16:20:00"],
        "Lat": [33.4484, 33.4584, 33.4684],
        "Lon": [-112.0740, -112.0840, -112.0940],
        "Type": ["Fire", "EMS", "Rescue"]
    }
    
    df = pd.DataFrame(data)
    
    # Load the schema
    schema = load_schema(current_app.root_path)
    if not schema:
        return jsonify({"error": "Failed to load schema"}), 500
    
    # Create field mappings
    mappings = {
        "Incident ID": {"sourceId": "Incident_No"},
        "Incident Date": {"sourceId": "Date"},
        "Incident Time": {"sourceId": "Time"},
        "Latitude": {"sourceId": "Lat"},
        "Longitude": {"sourceId": "Lon"},
        "Incident Type": {"sourceId": "Type"}
    }
    
    # Apply transformations
    try:
        result_df = apply_transformations(df, mappings, schema, current_app.root_path)
        
        # Convert to dict for response
        result = result_df.to_dict(orient='records')
        
        # Check for datetime formatting
        validation = {
            "success": True,
            "has_incident_datetime": "incident_datetime" in result_df.columns,
            "sample_incident_datetime": result_df["incident_datetime"].iloc[0] if "incident_datetime" in result_df.columns and not result_df.empty else None,
            "formatted_correctly": False
        }
        
        # Validate datetime format
        if validation["sample_incident_datetime"]:
            sample = validation["sample_incident_datetime"]
            validation["formatted_correctly"] = isinstance(sample, str) and 'T' in sample and sample.endswith('Z')
        
        return jsonify({
            "success": True,
            "result": result[:3],  # Just return the first 3 records
            "validation": validation,
            "column_count": len(result_df.columns),
            "row_count": len(result_df)
        })
    except Exception as e:
        logger.error(f"Error in test_data_transformer: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# File upload endpoint for the data formatter
@bp.route('/data-formatter/upload', methods=['POST'])
@safe_limit("10 per minute")
@csrf.exempt
def upload_data_file():
    """Upload a data file for processing in the data formatter"""
    try:
        # Debug logging
        logger.info(f"=== Upload request received ===")
        logger.info(f"Content-Type: {request.content_type}")
        logger.info(f"Files in request: {list(request.files.keys()) if request.files else 'None'}")
        logger.info(f"Form data: {list(request.form.keys()) if request.form else 'None'}")
        
        # Debug the request itself
        logger.info(f"Request methods: {request.method}")
        logger.info(f"Request content type header: {request.headers.get('Content-Type', 'Not provided')}")
        
        # Check if file was included in request
        if 'file' not in request.files:
            logger.error("No file part in the request")
            logger.error(f"Available files: {list(request.files.keys())}")
            logger.error(f"Available form fields: {list(request.form.keys())}")
            return jsonify({
                "error": "No file part in the request", 
                "files": list(request.files.keys()),
                "form_fields": list(request.form.keys())
            }), 400
            
        file = request.files['file']
        logger.info(f"File received: {file.filename}")
        
        # Check if a file was selected
        if file.filename == '':
            logger.error("No file selected (empty filename)")
            return jsonify({"error": "No file selected"}), 400
            
        # Check file type
        allowed_extensions = {'csv', 'xlsx', 'xls', 'json', 'xml'}
        if not allowed_file(file.filename, allowed_extensions):
            logger.error(f"File type not allowed: {file.filename}")
            return jsonify({"error": f"File type not allowed. Must be one of: {', '.join(allowed_extensions)}"}), 400
            
        # Create a unique filename
        filename = secure_filename(file.filename)
        file_id = str(uuid.uuid4())
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{file_id}.{file_extension}"
        
        # Create upload directory if it doesn't exist
        upload_dir = get_files_path()
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        logger.info(f"File saved to: {file_path}")
        
        # Process file to get columns and sample data
        try:
            # Load source data based on file type
            source_df = None
            if file_extension == 'csv':
                source_df = pd.read_csv(file_path)
                logger.info(f"CSV file loaded, shape: {source_df.shape}")
            elif file_extension in ['xlsx', 'xls']:
                source_df = pd.read_excel(file_path)
                logger.info(f"Excel file loaded, shape: {source_df.shape}")
            elif file_extension == 'json':
                source_df = pd.read_json(file_path)
                logger.info(f"JSON file loaded, shape: {source_df.shape}")
            elif file_extension == 'xml':
                source_df = pd.read_xml(file_path)
                logger.info(f"XML file loaded, shape: {source_df.shape}")
                
            # Get columns and sample data
            columns = list(source_df.columns)
            sample_data = source_df.head(5).to_dict('records')
            
            # Log success
            logger.info(f"File processed successfully. Columns: {columns}")
            
            # Return the file information with column data
            return jsonify({
                "success": True,
                "fileId": file_id,
                "originalName": filename,
                "fileType": file_extension,
                "columns": columns,
                "sampleData": sample_data,
                "originalData": True  # Indicates data is ready
            })
            
        except Exception as e:
            logger.error(f"Error processing file: {str(e)}")
            logger.error(traceback.format_exc())
            # Still return the file ID even if processing failed
            return jsonify({
                "success": True,
                "fileId": file_id,
                "originalName": filename,
                "fileType": file_extension,
                "error": f"File uploaded but could not be processed: {str(e)}"
            })
        
    except Exception as e:
        logger.error(f"Error in upload_data_file: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# Test endpoint to check API connectivity
@bp.route('/data-formatter/test', methods=['GET'])
def test_data_formatter_api():
    """Simple test endpoint to verify API connectivity"""
    return jsonify({
        "status": "ok",
        "message": "Data formatter API is working correctly",
        "timestamp": datetime.now().isoformat()
    })

# File upload endpoint for the Response Time Analyzer
@bp.route('/upload', methods=['POST'])
@safe_limit("10 per minute")
@csrf.exempt
def upload_analyzer_file():
    """Upload a data file for processing in the Response Time Analyzer"""
    try:
        # Debug logging
        logger.info(f"=== Response Time Analyzer Upload request received ===")
        logger.info(f"Content-Type: {request.content_type}")
        logger.info(f"Files in request: {list(request.files.keys()) if request.files else 'None'}")
        logger.info(f"Form data: {list(request.form.keys()) if request.form else 'None'}")
        
        # Check if file was included in request
        if 'file' not in request.files:
            logger.error("No file part in the request")
            logger.error(f"Available files: {list(request.files.keys())}")
            logger.error(f"Available form fields: {list(request.form.keys())}")
            return jsonify({
                "error": "No file part in the request", 
                "files": list(request.files.keys()),
                "form_fields": list(request.form.keys())
            }), 400
            
        file = request.files['file']
        logger.info(f"File received: {file.filename}")
        
        # Check if a file was selected
        if file.filename == '':
            logger.error("No file selected (empty filename)")
            return jsonify({"error": "No file selected"}), 400
            
        # Check file type
        allowed_extensions = {'csv', 'xlsx', 'xls', 'json', 'xml'}
        if not allowed_file(file.filename, allowed_extensions):
            logger.error(f"File type not allowed: {file.filename}")
            return jsonify({"error": f"File type not allowed. Must be one of: {', '.join(allowed_extensions)}"}), 400
            
        # Create a unique filename
        filename = secure_filename(file.filename)
        file_id = str(uuid.uuid4())
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{file_id}.{file_extension}"
        
        # Create upload directory if it doesn't exist
        upload_dir = get_files_path()
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        logger.info(f"File saved to: {file_path}")
        
        # Process file to get data for Response Time Analyzer
        try:
            # Load source data based on file type
            source_df = None
            if file_extension == 'csv':
                source_df = pd.read_csv(file_path)
                logger.info(f"CSV file loaded, shape: {source_df.shape}")
            elif file_extension in ['xlsx', 'xls']:
                source_df = pd.read_excel(file_path)
                logger.info(f"Excel file loaded, shape: {source_df.shape}")
            elif file_extension == 'json':
                source_df = pd.read_json(file_path)
                logger.info(f"JSON file loaded, shape: {source_df.shape}")
            elif file_extension == 'xml':
                source_df = pd.read_xml(file_path)
                logger.info(f"XML file loaded, shape: {source_df.shape}")
                
            # Get columns and sample data
            columns = list(source_df.columns)
            rows = len(source_df)
            # Convert DataFrame to list of dicts for response
            data = source_df.head(50).to_dict('records')
            
            # Try to detect first reported date for display
            first_reported_date = None
            date_fields = ['Reported', 'Incident Date', 'Date', 'incident_date', 'datetime']
            for field in date_fields:
                if field in source_df.columns:
                    try:
                        date_values = source_df[field].dropna()
                        if len(date_values) > 0:
                            # Try to parse as date
                            first_date = pd.to_datetime(date_values.iloc[0])
                            if pd.notna(first_date):
                                first_reported_date = first_date.strftime('%Y-%m-%d')
                                break
                    except Exception as e:
                        logger.warning(f"Error parsing date field {field}: {str(e)}")
            
            # Log success
            logger.info(f"File processed successfully. Columns: {columns}")
            
            # Return the file information with data
            return jsonify({
                "success": True,
                "fileId": file_id,
                "filename": filename,
                "fileType": file_extension,
                "columns": columns,
                "rows": rows,
                "data": data,
                "first_reported_date": first_reported_date
            })
            
        except Exception as e:
            logger.error(f"Error processing file: {str(e)}")
            logger.error(traceback.format_exc())
            # Return error with file info
            return jsonify({
                "error": f"File uploaded but could not be processed: {str(e)}",
                "fileId": file_id,
                "filename": filename,
                "fileType": file_extension
            }), 500
        
    except Exception as e:
        logger.error(f"Error in upload_analyzer_file: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# Data formatter transform endpoint
@bp.route('/data-formatter/transform', methods=['POST'])
@safe_limit("5 per minute")
@csrf.exempt
def transform_data():
    """Transform data based on field mappings"""
    try:
        # CRITICAL DEBUG - Log that we've entered the transform endpoint
        logger.debug("======= DATA FORMATTER TRANSFORM ENDPOINT CALLED =======")
        logger.debug(f"Request method: {request.method}, content type: {request.content_type}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        logger.debug(f"Request data: {request.get_data().decode('utf-8', errors='replace')}")
        
        from routes.helpers.data_transformer import transform_datetime, load_schema, apply_transformations
        
        # Get request data
        data = request.get_json()
        logger.debug(f"Parsed JSON data: {json.dumps(data)}")
        
        # Validate required fields
        if 'fileId' not in data:
            logger.error("Missing required field: fileId")
            return jsonify({"error": "Missing required field: fileId"}), 400
            
        if 'mappings' not in data:
            logger.error("Missing required field: mappings")
            return jsonify({"error": "Missing required field: mappings"}), 400
            
        file_id = data['fileId']
        mappings = data['mappings']
        logger.debug(f"CRITICAL DEBUG - Raw mappings object: {mappings}")
        
        # Check for processing metadata in the request
        processing_metadata = data.get('processingMetadata', {})
        
        # Get split rules from processing metadata if available
        split_rules = {}
        if processing_metadata and isinstance(processing_metadata, dict):
            split_rules = processing_metadata.get('_splitRules', {})
            logger.info(f"Split rules found in processing metadata: {json.dumps(split_rules)}")
        elif 'metadata' in data and isinstance(data['metadata'], dict):
            # Alternative source for metadata from the request
            alt_metadata = data['metadata']
            if '_splitRules' in alt_metadata:
                split_rules = alt_metadata['_splitRules']
                logger.info(f"Split rules found in alternative metadata field: {json.dumps(split_rules)}")
        
        logger.info(f"Final split rules for transformation: {json.dumps(split_rules)}")
        
        # Get the target tool if provided
        target_tool = data.get('targetTool', 'response-time')
        
        # Log the request data for debugging
        logger.info(f"Transform request for file: {file_id}, target tool: {target_tool}")
        logger.info(f"Mappings received from frontend: {json.dumps(mappings)}")
        
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
                logger.info(f"Loaded CSV file with columns: {list(source_df.columns)}")
                logger.info(f"Source dataframe sample:\n{source_df.head(3).to_string()}")
            elif file_extension in ['xlsx', 'xls']:
                source_df = pd.read_excel(file_path)
                logger.info(f"Loaded Excel file with columns: {list(source_df.columns)}")
                logger.info(f"Source dataframe sample:\n{source_df.head(3).to_string()}")
            elif file_extension == 'json':
                source_df = pd.read_json(file_path)
                logger.info(f"Loaded JSON file with columns: {list(source_df.columns)}")
                logger.info(f"Source dataframe sample:\n{source_df.head(3).to_string()}")
            elif file_extension == 'xml':
                source_df = pd.read_xml(file_path)
                logger.info(f"Loaded XML file with columns: {list(source_df.columns)}")
                logger.info(f"Source dataframe sample:\n{source_df.head(3).to_string()}")
            else:
                return jsonify({"error": f"Unsupported file type: {file_extension}"}), 400
        except Exception as e:
            logger.error(f"Error reading file: {str(e)}")
            return jsonify({"error": f"Error reading file: {str(e)}"}), 500
            
        # Load the schema
        schema = load_schema(current_app.root_path)
        if not schema:
            return jsonify({"error": "Failed to load schema definition"}), 500
        
        # Log schema info
        logger.info(f"Loaded schema with version: {schema.get('schemaVersion')}")
        logger.info(f"Required fields in schema: {[field.get('fieldName') for field in schema.get('requiredFields', [])]}")
        
        # Process mappings to add transformation hints from schema
        enhanced_mappings = {}
        logger.debug(f"Processing mappings with {len(mappings)} fields")
        
        for field_id, mapping in mappings.items():
            # Backward compatibility: Handle both string values and dictionary mappings
            if isinstance(mapping, str):
                # Convert simple string mapping to proper format
                logger.debug(f"Converting string mapping '{mapping}' to dict format for field '{field_id}'")
                # Store the source column name in the sourceId field
                source_field = mapping
                mapping = {'sourceId': source_field}
            
            # Validate mapping structure
            if not isinstance(mapping, dict):
                logger.warning(f"Skipping invalid mapping for field {field_id}: {mapping} (type: {type(mapping).__name__})")
                continue
                
            # Skip if no source field is specified
            source_id = mapping.get('sourceId')
            if not source_id:
                logger.debug(f"Skipping mapping without sourceId for field {field_id}")
                continue
                
            # Copy the original mapping
            enhanced_mapping = mapping.copy()
            logger.debug(f"Processing mapping for {field_id}: {enhanced_mapping}")
            
            # Look up field type from schema
            field_type = None
            for field in schema.get('requiredFields', []) + schema.get('optionalFields', []):
                if field.get('name') == field_id:
                    field_type = field.get('type')
                    break
            
            # If we found a field type, add transformation hint
            if field_type:
                # Only add transformation if one isn't already specified
                if 'transformations' not in enhanced_mapping:
                    enhanced_mapping['transformations'] = []
                    
                # Add type-specific transformation
                if field_type in ['datetime', 'date', 'time']:
                    enhanced_mapping['transformations'].append({
                        'type': 'datetime',
                        'timezone': 'America/Phoenix'  # Default timezone
                    })
                elif field_type == 'number':
                    enhanced_mapping['transformations'].append({
                        'type': 'number'
                    })
            
            # Store the enhanced mapping
            enhanced_mappings[field_id] = enhanced_mapping
        
        # Log the enhanced mappings
        logger.info(f"Enhanced mappings with schema-based transformation hints: {json.dumps(enhanced_mappings)}")
        
        # Apply transformations
        transformation_log = []
        errors = []
        missing_fields = []

        try:
            # CRITICAL DEBUG - Log right before transformation
            logger.debug("======= STARTING TRANSFORMATION PROCESS =======")
            logger.debug(f"Source DataFrame columns: {list(source_df.columns)}")
            logger.debug(f"Source DataFrame shape: {source_df.shape}")
            logger.debug(f"Enhanced mappings being used: {json.dumps(enhanced_mappings)}")
            
            # Apply the transformation function with the enhanced mappings and split rules
            transformed_df = apply_transformations(source_df, enhanced_mappings, schema, current_app.root_path, split_rules)
            
            # CRITICAL DEBUG - Log right after transformation
            logger.debug("======= TRANSFORMATION PROCESS COMPLETED =======")
            logger.debug(f"Transformed DataFrame columns: {list(transformed_df.columns) if not transformed_df.empty else 'EMPTY DATAFRAME'}")
            logger.debug(f"Transformed DataFrame shape: {transformed_df.shape if not transformed_df.empty else '(0, 0)'}")
            if not transformed_df.empty:
                logger.debug(f"Sample transformed data:\n{transformed_df.head(3).to_string()}")
            
            logger.info(f"Transformation complete with {len(transformed_df)} rows")
            transformation_log.append(f"Successfully transformed data using schema-based mapping")
            
            # Extract required fields from toolRequirements
            required_fields = schema.get('toolRequirements', {}).get(target_tool, [])
            
            # Log the required fields for this tool
            logger.info(f"Required fields for {target_tool}: {required_fields}")
            
            # Transform the field names from the tool requirements to standardized field names
            standardized_required_fields = []
            for field_path in required_fields:
                standardized_field_name = None
                
                # First check if it's a direct match to a field in the schema
                for field in schema.get('requiredFields', []) + schema.get('optionalFields', []):
                    if field['name'] == field_path:
                        standardized_field_name = field.get('fieldName')
                        break
                
                # If not found, handle the case where it's in dot notation
                if not standardized_field_name and '.' in field_path:
                    category, field = field_path.split('.')
                    standardized_field_name = f"{category}_{field}"
                
                # If still not found, just use the original converted to snake_case
                if not standardized_field_name:
                    standardized_field_name = field_path.lower().replace(' ', '_')
                
                standardized_required_fields.append(standardized_field_name)
            
            logger.info(f"Standardized required fields: {standardized_required_fields}")
            
            # Check for missing required fields
            if standardized_required_fields:
                for field in standardized_required_fields:
                    if field not in transformed_df.columns or transformed_df[field].isna().all():
                        missing_fields.append(field)
                        
            if missing_fields:
                transformation_log.append(f"Warning: Missing {len(missing_fields)} required fields: {', '.join(missing_fields)}")
                logger.warning(f"Missing required fields: {missing_fields}")
                
        except Exception as e:
            logger.error(f"Error applying transformations: {str(e)}")
            logger.error(f"Exception traceback: {traceback.format_exc()}")
            errors.append(f"Error applying transformations: {str(e)}")
            
            # Create an empty DataFrame if transformation failed
            if 'transformed_df' not in locals() or transformed_df is None or transformed_df.empty:
                transformed_df = pd.DataFrame()
                
        # Check if we have any successful transformations
        if transformed_df.empty:
            return jsonify({
                "error": "No valid mappings could be processed",
                "details": errors
            }), 400
            
        # Log column names and sample data to verify standardized field names
        logger.info(f"Transformed DataFrame columns: {list(transformed_df.columns)}")
        if not transformed_df.empty:
            logger.info(f"Sample transformed data:\n{transformed_df.head(3).to_string()}")
            
        # Generate the preview - use more rows for large files
        # Check if this might be Data1G.csv (from the original filename stored in the request)
        original_filename = data.get('originalFilename', '')
        is_large_file = 'data1g' in original_filename.lower() or len(transformed_df) > 1000
        
        # Use 100 rows for Data1G.csv or other large files
        preview_rows = 100 if is_large_file else 10
        logger.info(f"Generating preview with {preview_rows} rows (large file: {is_large_file})")
        
        preview_data = transformed_df.head(preview_rows).fillna('').to_dict('records')
        
        # Generate a unique ID for the transformed data
        transform_id = str(uuid.uuid4())
        
        # Save the transformed data for later retrieval
        try:
            transform_path = os.path.join(files_path, f"transformed_{transform_id}.csv")
            transformed_df.to_csv(transform_path, index=False)
            logger.info(f"Transformed data saved to {transform_path}")
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
        logger.error(f"Exception traceback: {traceback.format_exc()}")
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