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
import traceback
from datetime import datetime
from werkzeug.utils import secure_filename
from flask_wtf.csrf import CSRFProtect

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
        for field_id, mapping in mappings.items():
            # Skip if no source field is specified
            if not mapping.get('sourceId'):
                continue
                
            # Copy the original mapping
            enhanced_mapping = mapping.copy()
            
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
            
            # Apply the transformation function with the enhanced mappings
            transformed_df = apply_transformations(source_df, enhanced_mappings, schema, current_app.root_path)
            
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
            
        # Generate the preview (first 10 rows)
        preview_data = transformed_df.head(10).fillna('').to_dict('records')
        
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