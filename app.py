from flask import Flask, request, jsonify, send_from_directory, render_template, redirect, url_for, abort
from flask_cors import CORS
import pandas as pd
import os
import traceback
from datetime import datetime
from werkzeug.utils import secure_filename
import requests
import time
import json
from database import db, Department, Incident
from config import config

def create_app(config_name='default'):
    """Application factory function"""
    app = Flask(__name__, static_folder="static", static_url_path="/static")
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Initialize extensions
    db.init_app(app)
    
    # Enhanced CORS settings
    CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})
    
    # Upload Folder Configuration
    UPLOAD_FOLDER = "uploads"
    ALLOWED_EXTENSIONS = {"csv", "xls", "xlsx"}
    
    # Create upload folder if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # Limit uploads to 16MB
    
    # Register routes and other components
    register_routes(app)
    
    return app

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in {"csv", "xls", "xlsx"}

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
            'User-Agent': 'FireEMS.ai Data Formatter Application'
        }
        
        # Make the request
        response = requests.get(url, params=params, headers=headers)
        
        # Check if the request was successful
        if response.status_code == 200:
            data = response.json()
            
            # Check if we got any results
            if data and len(data) > 0:
                return float(data[0]['lat']), float(data[0]['lon'])
            else:
                print(f"No geocoding results for address: {address}")
        else:
            print(f"Geocoding request failed: {response.status_code}")
    
    except Exception as e:
        print(f"Error geocoding address: {str(e)}")
    
    return None, None

def register_routes(app):
    """Register all routes with the application"""
    
    # Home page route for the tool collection
    @app.route("/")
    def home():
        """Serve the home page with the tool collection."""
        return render_template("index.html")
    
    # Department routing
    @app.route('/dept/<dept_code>')
    def dept_home(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        return render_template('index.html', department=department)
    
    # Department-specific Incident Logger
    @app.route('/dept/<dept_code>/incident-logger')
    def dept_incident_logger(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        return render_template('incident-logger.html', department=department)
    
    # API to save an incident 
    @app.route('/api/dept/<dept_code>/incidents', methods=['POST'])
    def save_incident(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        try:
            form_data = request.json
            if not form_data:
                return jsonify({"error": "No data provided"}), 400
                
            incident = Incident.from_form_data(form_data, department.id)
            db.session.add(incident)
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Incident saved successfully",
                "incident_id": incident.id
            })
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error saving incident: {str(e)}")
            app.logger.error(traceback.format_exc())
            return jsonify({"error": str(e)}), 500
    
    # API to get all incidents for a department
    @app.route('/api/dept/<dept_code>/incidents', methods=['GET'])
    def get_incidents(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        try:
            incidents = Incident.query.filter_by(department_id=department.id).all()
            return jsonify({
                "success": True,
                "incidents": [incident.to_dict() for incident in incidents]
            })
        except Exception as e:
            app.logger.error(f"Error retrieving incidents: {str(e)}")
            app.logger.error(traceback.format_exc())
            return jsonify({"error": str(e)}), 500
    
    # API to get a specific incident
    @app.route('/api/dept/<dept_code>/incidents/<int:incident_id>', methods=['GET'])
    def get_incident(dept_code, incident_id):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        try:
            incident = Incident.query.filter_by(id=incident_id, department_id=department.id).first_or_404()
            return jsonify({
                "success": True,
                "incident": incident.to_dict()
            })
        except Exception as e:
            app.logger.error(f"Error retrieving incident: {str(e)}")
            app.logger.error(traceback.format_exc())
            return jsonify({"error": str(e)}), 500
    
    # Original routes below - these will still work alongside the new department-scoped routes
    
    # Dashboard route for the Fire/EMS tool
    @app.route("/fire-ems-dashboard")
    def fire_ems_dashboard():
        """Serve the Fire/EMS Dashboard tool."""
        return render_template("fire-ems-dashboard.html")
    
    @app.route("/isochrone-map")
    def isochrone_map():
        """Serve the Isochrone Map Generator tool"""
        return render_template("isochrone-map.html")
    
    # Add route for the Call Density Heatmap page
    @app.route('/call-density-heatmap')
    def call_density_heatmap():
        """Serve the Call Density Heatmap tool"""
        return render_template('call-density-heatmap.html')
    
    # Incident Logger routes
    @app.route('/incident-logger')
    def incident_logger():
        """Serve the Incident Logger tool"""
        return render_template('incident-logger.html')
    
    # Test routes
    @app.route('/medical-test')
    def medical_test():
        """Serve the medical fields test page"""
        return render_template('medical-test.html')
    
    @app.route('/simple-test')
    def simple_test():
        """Serve a simple test page"""
        return send_from_directory('static', 'simple-test.html')
    
    @app.route('/diagnostic')
    def diagnostic():
        """Serve the diagnostic tool"""
        return send_from_directory('static', 'diagnostic.html')
    
    # Include the rest of your original routes here

# Create app instance for running directly
app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == "__main__":
    import sys
    
    # Check if a port is specified in the command line arguments
    custom_port = None
    for arg in sys.argv[1:]:
        if arg.startswith("port="):
            try:
                custom_port = int(arg.split('=')[1])
                print(f"Using custom port: {custom_port}")
            except ValueError:
                print(f"Invalid port specified: {arg}")
                sys.exit(1)
    
    if custom_port:
        # Use the specified port
        try:
            print(f"Starting server on port {custom_port}...")
            app.run(host="0.0.0.0", port=custom_port, debug=True)
        except OSError as e:
            print(f"Port {custom_port} unavailable: {e}")
            print("Please specify a different port with port=XXXX")
            sys.exit(1)
    else:
        # Try multiple ports in case some are blocked
        ports_to_try = [8080, 3000, 4000, 5000, 7000, 9000]
        
        for port in ports_to_try:
            try:
                print(f"Trying to run on port {port}...")
                app.run(host="0.0.0.0", port=port, debug=True)
                break  # If successful, exit the loop
            except OSError as e:
                print(f"Port {port} unavailable: {e}")
                if port == ports_to_try[-1]:
                    print("All ports failed. Please check your network configuration.")
                else:
                    continue
else:
    # When run via flask command
    app.config['ENV'] = 'development'
    app.config['DEBUG'] = True