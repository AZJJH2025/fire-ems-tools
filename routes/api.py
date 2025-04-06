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
import json
import os
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