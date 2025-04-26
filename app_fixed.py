from flask import Flask, request, jsonify, send_from_directory, render_template, redirect, url_for, abort, flash, session, make_response
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import jinja2
import pandas as pd
import numpy as np
import os
import math
import random
import traceback
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import requests
import time
import json
import csv
import io
from collections import Counter
from functools import wraps
import logging


# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Apply deployment fixes before importing models
import fix_deployment
fix_deployment.apply_fixes()

# Now import models after fixes have been applied
from database import db, Department, Incident, User, Station
from config import config

login_manager = LoginManager()

# Create a safer version of limiter that won't fail in production
try:
    limiter = Limiter(key_func=get_remote_address, default_limits=["200 per hour", "50 per minute"])

except Exception as e:
    logger.error(f"Error initializing limiter: {str(e)}")
    # Create a dummy limiter that does nothing
    class DummyLimiter:
        def __init__(self, *args, **kwargs):
            pass
            
        def init_app(self, app):
            logger.info("Using dummy rate limiter")
            
        def limit(self, *args, **kwargs):
            def decorator(f):
                return f
            return decorator
            
        def exempt(self, *args, **kwargs):
            def decorator(f):
                return f
            return decorator
    
    limiter = DummyLimiter()

def get_api_key_identity():
    """
    Custom key function for rate limiting based on API key
    This allows each department to have their own rate limit
    instead of being limited by IP address
    """

def safe_limit(limit_string, **kwargs):
    """A safer version of limiter.limit that won't fail if limiter is not working"""

def require_api_key(f):
    """Decorator to require API key authentication for API endpoints
    
    This uses the safer version from fix_deployment when available,
    falling back to the original implementation if that fails.
    """

def create_app(config_name='default'):
    """Application factory function"""
"""Application factory function"""
    # Enable better template error handling
    import os
    
    # Ensure template directories exist
    template_dirs = ['templates', 'templates/auth', 'templates/errors', 'templates/admin', 'templates/dept']
    for dir_path in template_dirs:
        os.makedirs(dir_path, exist_ok=True)
    
    # Create Flask app with absolute paths
    template_folder = os.path.join(os.getcwd(), 'templates')
    static_folder = os.path.join(os.getcwd(), 'static')
    
    app = Flask(__name__, 
                template_folder=template_folder,
                static_folder=static_folder, 
                static_url_path="/static")
    
    # Set up template auto-reloading in development
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    
    # Apply configuration
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    
    # Configure and initialize rate limiter safely
    try:
        # Configure Flask-Limiter
        app.config['RATELIMIT_DEFAULT'] = "200 per hour;50 per minute"
        app.config['RATELIMIT_KEY_FUNC'] = get_api_key_identity
        app.config['RATELIMIT_STORAGE_URI'] = "memory://"
        
        # Initialize rate limiter
        limiter.init_app(app)
        logger.info("Rate limiter configured successfully")
    except Exception as e:
        logger.warning(f"Rate limiter initialization failed, continuing without rate limiting: {str(e)}")
    
    # Configure login manager
    login_manager.login_view = 'login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'warning'
    
    # User loader function for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        try:
            return User.query.get(int(user_id))
        except Exception as e:
            logger.error(f"Error loading user: {str(e)}")
            return None
    
    # Enhanced CORS settings
    CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})
    
    # Upload Folder Configuration
    UPLOAD_FOLDER = "uploads"
    ALLOWED_EXTENSIONS = {"csv", "xls", "xlsx"}
    
    # Create upload folder if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # Limit uploads to 16MB
    
    # Apply database fixes when app is created with context
    with app.app_context():
        try:
            # Fix database tables
            fix_deployment.fix_database_tables(app, db)
            
            # Initialize database tables
            try:
                import init_tables
                init_tables.init_tables(app, db)
            except Exception as e:
                logger.error(f"Error initializing database tables: {str(e)}")
                logger.error(traceback.format_exc())
            
            # Patch API routes with safer versions
            fix_deployment.patch_app_routes(app)
            
            logger.info("Successfully applied all deployment fixes")
        except Exception as e:
            logger.error(f"Error applying deployment fixes: {str(e)}")
            logger.error(traceback.format_exc())
    
    # Register error handlers with fallbacks
    @app.errorhandler(403)
    def forbidden_error(error):
        try:
            return render_template('errors/403.html'), 403
        except Exception as e:
            logger.error(f"Error rendering 403 template: {str(e)}")
            return "<h1>403 - Forbidden</h1><p>You don't have permission to access this resource.</p>", 403
        
    @app.errorhandler(404)
    def not_found_error(error):
        try:
            return render_template('errors/404.html'), 404
        except Exception as e:
            logger.error(f"Error rendering 404 template: {str(e)}")
            return "<h1>404 - Not Found</h1><p>The requested resource could not be found.</p>", 404
        
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()  # Roll back any failed database sessions
        try:
            return render_template('errors/500.html'), 500
        except Exception as e:
            logger.error(f"Error rendering 500 template: {str(e)}")
            return "<h1>500 - Server Error</h1><p>An unexpected error occurred.</p>", 500
            
    @app.errorhandler(jinja2.exceptions.TemplateNotFound)
    def template_not_found(error):
        logger.error(f"Template not found: {error.name}")
        if 'auth/login' in error.name:
            return redirect('/')
        return "<h1>Template Error</h1><p>The requested template could not be found.</p>", 500
    
    # Register routes and other components
    register_routes(app)
    
    return app

    # Register routes
    @app.route('/login', methods=['GET', 'POST'])
    def login():
            """User login page"""
            if current_user.is_authenticated:
                # If already logged in, redirect based on role
                if current_user.role == 'super_admin':
                    return redirect(url_for('admin_dashboard'))
                else:
                    return redirect(url_for('dept_home', dept_code=Department.query.get(current_user.department_id).code))

            if request.method == 'POST':
                email = request.form.get('email')
                password = request.form.get('password')
                remember = 'remember' in request.form

                user = User.query.filter_by(email=email).first()

                if user and user.check_password(password) and user.is_active:
                    login_user(user, remember=remember)
                    user.update_last_login()
                    db.session.commit()

                    # Determine where to redirect based on user role
                    next_page = request.args.get('next')
                    if next_page:
                        return redirect(next_page)
                    elif user.role == 'super_admin':
                        return redirect(url_for('admin_dashboard'))
                    else:
                        # Redirect to department portal
                        department = Department.query.get(user.department_id)
                        return redirect(url_for('dept_home', dept_code=department.code))
                else:
                    flash('Invalid email or password', 'danger')

            try:
                return render_template('auth/login.html')
            except jinja2.exceptions.TemplateNotFound:
                logger.error("Login template not found, using fallback")
                # Inline login form as fallback
                return '''
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Login - Fire-EMS Tools</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background-color: #f5f8fa;
                        }
                        .login-container {
                            width: 350px;
                            padding: 20px;
                            background-color: white;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        h1 {
                            text-align: center;
                            color: #2c3e50;
                        }
                        input {
                            width: 100%;
                            padding: 10px;
                            margin: 10px 0;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            box-sizing: border-box;
                        }
                        button {
                            width: 100%;
                            padding: 10px;
                            background-color: #3498db;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        }
                        button:hover {
                            background-color: #2980b9;
                        }
                        .alert {
                            padding: 10px;
                            background-color: #f8d7da;
                            color: #721c24;
                            border-radius: 4px;
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="login-container">
                        <h1>Fire-EMS Tools Login</h1>
                        <form method="POST" action="/login">
                            <input type="email" name="email" placeholder="Email" required>
                            <input type="password" name="password" placeholder="Password" required>
                            <div style="margin: 10px 0; display: flex; align-items: center;">
                                <input type="checkbox" name="remember" style="width: auto; margin-right: 10px;">
                                <label for="remember">Remember me</label>
                            </div>
                            <button type="submit">Login</button>
                        </form>
                        <p style="text-align: center; margin-top: 20px;">
                            <small>Default: admin@fireems.ai / FireEMS2025!</small>
                        </p>
                    </div>
                </body>
                </html>
                '''

    @app.route('/logout')
    def logout():
            """User logout"""
            logout_user()
            flash('You have been logged out', 'success')
            return redirect(url_for('login'))

        # Home page route for the tool collection

    @app.route('/admin')
    def admin_index():
            """Admin index - redirects to dashboard"""
            # Check if user is a super admin
            if not current_user.is_super_admin():
                abort(403)  # Forbidden

            return redirect(url_for('admin_dashboard'))

    @app.route('/api/v1/incidents', methods=['GET'])
    def api_get_incidents(department):
            """Get all incidents for a department using API key authentication"""
            try:
                # Optional filtering by date range
                start_date = request.args.get('start_date')
                end_date = request.args.get('end_date')

                query = Incident.query.filter_by(department_id=department.id)

                # Apply date filters if provided
                if start_date:
                    try:
                        start_datetime = datetime.fromisoformat(start_date)
                        query = query.filter(Incident.incident_date >= start_datetime)
                    except ValueError:
                        return jsonify({"error": "Invalid start_date format. Use ISO format (YYYY-MM-DD)."}), 400

                if end_date:
                    try:
                        end_datetime = datetime.fromisoformat(end_date)
                        query = query.filter(Incident.incident_date <= end_datetime)
                    except ValueError:
                        return jsonify({"error": "Invalid end_date format. Use ISO format (YYYY-MM-DD)."}), 400

                # Get all matching incidents
                incidents = query.all()

                return jsonify({
                    "success": True,
                    "department_id": department.id,
                    "department_name": department.name,
                    "incident_count": len(incidents),
                    "incidents": [incident.to_dict() for incident in incidents]
                })
            except Exception as e:
                app.logger.error(f"Error retrieving incidents via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

        # API endpoint to get a specific incident by ID

    @app.route('/api/v1/incidents/<int:incident_id>', methods=['GET'])
    def api_get_incident(department, incident_id):
            """Get a specific incident by ID using API key authentication"""
            try:
                # Make sure the incident belongs to this department
                incident = Incident.query.filter_by(id=incident_id, department_id=department.id).first()

                if not incident:
                    return jsonify({"error": "Incident not found or not authorized to access this incident"}), 404

                return jsonify({
                    "success": True,
                    "incident": incident.to_dict()
                })
            except Exception as e:
                app.logger.error(f"Error retrieving incident via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

        # API endpoint to create a new incident

    @app.route('/api/v1/incidents', methods=['POST'])
    def api_create_incident(department):
            """Create a new incident using API key authentication"""
            try:
                form_data = request.json
                if not form_data:
                    return jsonify({"error": "No data provided"}), 400

                # Validate required fields
                required_fields = ['incident_title', 'incident_number', 'incident_date', 'incident_type']
                missing_fields = [field for field in required_fields if field not in form_data or not form_data[field]]

                if missing_fields:
                    return jsonify({
                        "error": f"Missing required fields: {', '.join(missing_fields)}",
                        "required_fields": required_fields
                    }), 400

                # Validate date format
                try:
                    if 'incident_date' in form_data:
                        datetime.fromisoformat(form_data['incident_date'].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({
                        "error": "Invalid incident_date format. Use ISO format (YYYY-MM-DDThh:mm:ss)."
                    }), 400

                # Validate numeric fields
                if 'latitude' in form_data and form_data['latitude'] is not None:
                    try:
                        form_data['latitude'] = float(form_data['latitude'])
                        if form_data['latitude'] < -90 or form_data['latitude'] > 90:
                            return jsonify({"error": "Latitude must be between -90 and 90"}), 400
                    except ValueError:
                        return jsonify({"error": "Latitude must be a valid number"}), 400

                if 'longitude' in form_data and form_data['longitude'] is not None:
                    try:
                        form_data['longitude'] = float(form_data['longitude'])
                        if form_data['longitude'] < -180 or form_data['longitude'] > 180:
                            return jsonify({"error": "Longitude must be between -180 and 180"}), 400
                    except ValueError:
                        return jsonify({"error": "Longitude must be a valid number"}), 400

                # Add API source info
                form_data['source'] = 'api'
                form_data['user_id'] = None
                form_data['user_name'] = 'API Import'

                incident = Incident.from_form_data(form_data, department.id)
                db.session.add(incident)
                db.session.commit()

                # Trigger webhook for incident creation if webhooks are enabled
                if department.webhooks_enabled and department.webhook_url:
                    try:
                        # Use import here to avoid potential circular imports
                        from utils.webhook_sender import deliver_webhook_async
                        # Make a copy of the department object to pass to the webhook thread
                        dept_id = department.id
                        webhook_url = department.webhook_url
                        webhook_secret = department.webhook_secret
                        webhook_events = department.webhook_events.copy() if department.webhook_events else {}

                        # Only trigger if this event type is enabled
                        if webhook_events.get('incident.created', False):
                            deliver_webhook_async(
                                department=department,
                                event_type="created",
                                resource_type="incident",
                                resource_id=incident.id,
                                data=incident.to_dict()
                            )
                    except Exception as webhook_error:
                        # Log webhook error but don't fail the API request
                        app.logger.error(f"Webhook delivery error: {str(webhook_error)}")

                return jsonify({
                    "success": True,
                    "message": "Incident created successfully via API",
                    "incident_id": incident.id
                })
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error creating incident via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

        # API endpoint to get all stations

    @app.route('/api/v1/stations', methods=['GET'])
    def api_get_stations(department):
            """Get all stations for a department using API key authentication"""
            try:
                # Get all stations for this department
                stations = Station.query.filter_by(department_id=department.id).all()

                # Convert to dictionary format for JSON response
                station_data = []
                for station in stations:
                    station_info = {
                        "id": station.id,
                        "name": station.name,
                        "station_number": station.station_number,
                        "address": station.address,
                        "city": station.city,
                        "state": station.state,
                        "zip_code": station.zip_code,
                        "latitude": station.latitude,
                        "longitude": station.longitude,
                        "personnel_count": station.personnel_count,
                        "apparatus": station.apparatus,
                        "created_at": station.created_at.isoformat() if station.created_at else None
                    }
                    station_data.append(station_info)

                return jsonify({
                    "success": True,
                    "department_id": department.id,
                    "department_name": department.name,
                    "station_count": len(stations),
                    "stations": station_data
                })
            except Exception as e:
                app.logger.error(f"Error retrieving stations via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

        # API endpoint to get a specific station by ID

    @app.route('/api/v1/stations/<int:station_id>', methods=['GET'])
    def api_get_station(department, station_id):
            """Get a specific station by ID using API key authentication"""
            try:
                # Make sure the station belongs to this department
                station = Station.query.filter_by(id=station_id, department_id=department.id).first()

                if not station:
                    return jsonify({"error": "Station not found or not authorized to access this station"}), 404

                # Convert to dictionary format for JSON response
                station_info = {
                    "id": station.id,
                    "name": station.name,
                    "station_number": station.station_number,
                    "address": station.address,
                    "city": station.city,
                    "state": station.state,
                    "zip_code": station.zip_code,
                    "latitude": station.latitude,
                    "longitude": station.longitude,
                    "personnel_count": station.personnel_count,
                    "apparatus": station.apparatus,
                    "created_at": station.created_at.isoformat() if station.created_at else None
                }

                return jsonify({
                    "success": True,
                    "station": station_info
                })
            except Exception as e:
                app.logger.error(f"Error retrieving station via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

        # API endpoint to create a new station

    @app.route('/api/v1/stations', methods=['POST'])
    def api_create_station(department):
            """Create a new station using API key authentication"""
            try:
                # Get station data from request
                data = request.json
                if not data:
                    return jsonify({"error": "No data provided"}), 400

                # Validate required fields
                required_fields = ['name', 'station_number']
                missing_fields = [field for field in required_fields if field not in data or not data[field]]

                if missing_fields:
                    return jsonify({
                        "error": f"Missing required fields: {', '.join(missing_fields)}",
                        "required_fields": required_fields
                    }), 400

                # Check if station number already exists for this department
                existing_station = Station.query.filter_by(
                    department_id=department.id, 
                    station_number=data.get('station_number')
                ).first()

                if existing_station:
                    return jsonify({
                        "error": f"Station number {data.get('station_number')} already exists for this department"
                    }), 400

                # Validate numeric fields
                if 'latitude' in data and data['latitude'] is not None:
                    try:
                        data['latitude'] = float(data['latitude'])
                        if data['latitude'] < -90 or data['latitude'] > 90:
                            return jsonify({"error": "Latitude must be between -90 and 90"}), 400
                    except ValueError:
                        return jsonify({"error": "Latitude must be a valid number"}), 400

                if 'longitude' in data and data['longitude'] is not None:
                    try:
                        data['longitude'] = float(data['longitude'])
                        if data['longitude'] < -180 or data['longitude'] > 180:
                            return jsonify({"error": "Longitude must be between -180 and 180"}), 400
                    except ValueError:
                        return jsonify({"error": "Longitude must be a valid number"}), 400

                if 'personnel_count' in data and data['personnel_count'] is not None:
                    try:
                        data['personnel_count'] = int(data['personnel_count'])
                        if data['personnel_count'] < 0:
                            return jsonify({"error": "Personnel count must be a non-negative integer"}), 400
                    except ValueError:
                        return jsonify({"error": "Personnel count must be a valid integer"}), 400

                # Validate apparatus data if provided
                if 'apparatus' in data and data['apparatus'] is not None:
                    if not isinstance(data['apparatus'], dict):
                        return jsonify({"error": "Apparatus must be a dictionary with apparatus types as keys and counts as values"}), 400

                    for apparatus_type, count in data['apparatus'].items():
                        try:
                            data['apparatus'][apparatus_type] = int(count)
                            if data['apparatus'][apparatus_type] < 0:
                                return jsonify({"error": f"Apparatus count for {apparatus_type} must be a non-negative integer"}), 400
                        except ValueError:
                            return jsonify({"error": f"Apparatus count for {apparatus_type} must be a valid integer"}), 400

                # Create new station
                new_station = Station(
                    department_id=department.id,
                    name=data.get('name'),
                    station_number=data.get('station_number'),
                    address=data.get('address'),
                    city=data.get('city'),
                    state=data.get('state'),
                    zip_code=data.get('zip_code'),
                    latitude=data.get('latitude'),
                    longitude=data.get('longitude'),
                    personnel_count=data.get('personnel_count', 0),
                    apparatus=data.get('apparatus', {})
                )

                # Geocode address if latitude/longitude not provided but address is
                if not (data.get('latitude') and data.get('longitude')) and all([
                    data.get('address'), data.get('city'), data.get('state')
                ]):
                    full_address = f"{data.get('address')}, {data.get('city')}, {data.get('state')} {data.get('zip_code')}"
                    new_station.latitude, new_station.longitude = geocode_address(full_address)

                # Save to database
                db.session.add(new_station)
                db.session.commit()

                return jsonify({
                    "success": True,
                    "message": "Station created successfully via API",
                    "station_id": new_station.id
                })

            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error creating station via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

        # =====================
        # User API Endpoints
        # =====================

    @app.route('/api/v1/users', methods=['GET'])
    def api_get_users(department):
            """Get all users for a department using API key authentication"""
            try:
                # Retrieve all users for this department
                users = User.query.filter_by(department_id=department.id).all()

                return jsonify({
                    "success": True,
                    "department_id": department.id,
                    "department_name": department.name,
                    "user_count": len(users),
                    "users": [user.to_dict() for user in users]
                })
            except Exception as e:
                app.logger.error(f"Error retrieving users via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

    @app.route('/api/v1/users/<int:user_id>', methods=['GET'])
    def api_get_user(department, user_id):
            """Get a specific user by ID using API key authentication"""
            try:
                # Make sure the user belongs to this department
                user = User.query.filter_by(id=user_id, department_id=department.id).first()

                if not user:
                    return jsonify({"error": "User not found or not authorized to access this user"}), 404

                return jsonify({
                    "success": True,
                    "user": user.to_dict()
                })
            except Exception as e:
                app.logger.error(f"Error retrieving user via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

    @app.route('/api/v1/users', methods=['POST'])
    def api_create_user(department):
            """Create a new user using API key authentication"""
            try:
                data = request.json
                if not data:
                    return jsonify({"error": "No data provided"}), 400

                # Validate required fields
                required_fields = ['email', 'name', 'password', 'role']
                missing_fields = [field for field in required_fields if field not in data or not data[field]]

                if missing_fields:
                    return jsonify({
                        "error": f"Missing required fields: {', '.join(missing_fields)}",
                        "required_fields": required_fields
                    }), 400

                # Validate email format
                from email_validator import validate_email, EmailNotValidError
                try:
                    validate_email(data['email'])
                except EmailNotValidError as e:
                    return jsonify({"error": f"Invalid email address: {str(e)}"}), 400

                # Check for duplicate email
                existing_user = User.query.filter_by(email=data['email']).first()
                if existing_user:
                    return jsonify({
                        "error": f"User with email '{data['email']}' already exists",
                        "user_id": existing_user.id
                    }), 400

                # Validate role
                valid_roles = ['user', 'manager', 'admin']
                if data['role'] not in valid_roles:
                    return jsonify({
                        "error": f"Invalid role: {data['role']}. Must be one of: {', '.join(valid_roles)}"
                    }), 400

                # Create new user
                user = User(
                    department_id=department.id,
                    email=data['email'],
                    name=data['name'],
                    role=data['role'],
                    is_active=data.get('is_active', True)
                )

                # Handle preferences if the field exists in the User model
                if hasattr(User, 'preferences'):
                    user.preferences = data.get('preferences', {})

                user.set_password(data['password'])

                db.session.add(user)
                db.session.commit()

                return jsonify({
                    "success": True,
                    "message": "User created successfully",
                    "user_id": user.id
                })
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error creating user via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

    @app.route('/api/v1/users/<int:user_id>', methods=['PUT'])
    def api_update_user(department, user_id):
            """Update an existing user using API key authentication"""
            try:
                data = request.json
                if not data:
                    return jsonify({"error": "No data provided"}), 400

                # Make sure the user belongs to this department
                user = User.query.filter_by(id=user_id, department_id=department.id).first()

                if not user:
                    return jsonify({"error": "User not found or not authorized to update this user"}), 404

                # Validate email if provided
                if 'email' in data and data['email'] != user.email:
                    from email_validator import validate_email, EmailNotValidError
                    try:
                        validate_email(data['email'])
                    except EmailNotValidError as e:
                        return jsonify({"error": f"Invalid email address: {str(e)}"}), 400

                    # Check for duplicate email
                    existing_user = User.query.filter(User.email == data['email'], User.id != user_id).first()
                    if existing_user:
                        return jsonify({
                            "error": f"User with email '{data['email']}' already exists",
                            "user_id": existing_user.id
                        }), 400

                    user.email = data['email']

                # Validate role if provided
                if 'role' in data:
                    valid_roles = ['user', 'manager', 'admin']
                    if data['role'] not in valid_roles:
                        return jsonify({
                            "error": f"Invalid role: {data['role']}. Must be one of: {', '.join(valid_roles)}"
                        }), 400

                    user.role = data['role']

                # Update other fields if provided
                if 'name' in data:
                    user.name = data['name']

                if 'is_active' in data:
                    user.is_active = bool(data['is_active'])

                # Update preferences if the field exists and data is provided
                if 'preferences' in data and hasattr(User, 'preferences'):
                    user.preferences = data['preferences']

                # Update password if provided
                if 'password' in data and data['password']:
                    user.set_password(data['password'])

                db.session.commit()

                return jsonify({
                    "success": True,
                    "message": "User updated successfully",
                    "user_id": user.id
                })
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error updating user via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

        # =====================
        # Webhook API Endpoints
        # =====================

    @app.route('/api/v1/webhooks', methods=['GET'])
    def api_get_webhook_config(department):
            """Get webhook configuration for a department"""
            try:
                # Only return webhook configuration (without the secret) for security
                result = {
                    "webhooks_enabled": department.webhooks_enabled,
                    "webhook_url": department.webhook_url,
                    "webhook_events": department.webhook_events,
                    "webhook_last_success": department.webhook_last_success.isoformat() if department.webhook_last_success else None
                }

                return jsonify({
                    "success": True,
                    "webhook_config": result
                })
            except Exception as e:
                app.logger.error(f"Error retrieving webhook config via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

    @app.route('/api/v1/webhooks', methods=['PUT'])
    def api_update_webhook_config(department):
            """Update webhook configuration for a department"""
            try:
                data = request.json
                if not data:
                    return jsonify({"error": "No data provided"}), 400

                # Update webhook URL if provided
                if 'webhook_url' in data:
                    # Validate URL format
                    if data['webhook_url']:
                        try:
                            from urllib.parse import urlparse
                            result = urlparse(data['webhook_url'])
                            if not all([result.scheme, result.netloc]):
                                return jsonify({"error": "Invalid webhook URL format"}), 400
                        except Exception:
                            return jsonify({"error": "Invalid webhook URL format"}), 400

                    department.webhook_url = data['webhook_url']

                # Update webhook events if provided
                if 'webhook_events' in data:
                    if not isinstance(data['webhook_events'], dict):
                        return jsonify({"error": "webhook_events must be a dictionary"}), 400

                    # Validate event keys
                    valid_event_keys = [
                        "incident.created", "incident.updated", 
                        "station.created", "user.created"
                    ]

                    # Start with existing events
                    updated_events = department.webhook_events.copy() if department.webhook_events else {}

                    # Update only provided events
                    for key, value in data['webhook_events'].items():
                        if key not in valid_event_keys:
                            return jsonify({
                                "error": f"Invalid event type: {key}. Must be one of: {', '.join(valid_event_keys)}"
                            }), 400

                        updated_events[key] = bool(value)

                    department.webhook_events = updated_events

                # Enable/disable webhooks
                if 'webhooks_enabled' in data:
                    webhooks_enabled = bool(data['webhooks_enabled'])

                    # Check if we have the required config to enable webhooks
                    if webhooks_enabled and not department.webhook_url:
                        return jsonify({
                            "error": "Cannot enable webhooks without a webhook URL"
                        }), 400

                    # Enable/disable and generate secret if needed
                    if webhooks_enabled:
                        department.enable_webhooks()
                    else:
                        department.disable_webhooks()

                # Generate a new webhook secret if requested
                if data.get('regenerate_secret', False):
                    department.generate_webhook_secret()

                db.session.commit()

                # Return the updated config
                return jsonify({
                    "success": True,
                    "message": "Webhook configuration updated successfully",
                    "webhook_config": {
                        "webhooks_enabled": department.webhooks_enabled,
                        "webhook_url": department.webhook_url,
                        "webhook_events": department.webhook_events,
                        "webhook_secret": department.webhook_secret if data.get('show_secret', False) else None
                    }
                })

            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error updating webhook config via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

    @app.route('/api/v1/webhooks/test', methods=['POST'])
    def api_test_webhook(department):
            """Send a test webhook to verify configuration"""
            try:
                # Check if webhooks are enabled
                if not department.webhooks_enabled:
                    return jsonify({
                        "error": "Webhooks are not enabled for this department"
                    }), 400

                # Check if webhook URL is configured
                if not department.webhook_url:
                    return jsonify({
                        "error": "Webhook URL is not configured"
                    }), 400

                # Create test payload
                test_data = {
                    "department_id": department.id,
                    "department_name": department.name,
                    "test": True,
                    "timestamp": datetime.utcnow().isoformat()
                }

                # Send test webhook synchronously
                from utils.webhook_sender import send_webhook, create_webhook_payload

                payload = create_webhook_payload(
                    event_type="test",
                    resource_type="webhook",
                    resource_id=None,
                    data=test_data,
                    department_id=department.id
                )

                try:
                    result = send_webhook(
                        url=department.webhook_url,
                        payload=payload,
                        secret=department.webhook_secret,
                        max_retries=1  # Only try once for a test
                    )

                    # Update last success
                    department.update_webhook_success()
                    db.session.commit()

                    return jsonify({
                        "success": True,
                        "message": "Test webhook sent successfully"
                    })

                except Exception as webhook_error:
                    # Update last error
                    department.update_webhook_error(str(webhook_error))
                    db.session.commit()

                    return jsonify({
                        "success": False,
                        "error": f"Webhook test failed: {str(webhook_error)}"
                    }), 400

            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error testing webhook via API: {str(e)}")
                app.logger.error(traceback.format_exc())
                return jsonify({"error": str(e)}), 500

        # Department Incidents List

    @app.route('/dept/<dept_code>/incidents')
    def dept_incidents(dept_code):
            """List all incidents for a department"""
            department = Department.query.filter_by(code=dept_code).first_or_404()

            # Check if user belongs to this department unless they are super_admin
            if not current_user.is_super_admin() and current_user.department_id != department.id:
                abort(403)  # Forbidden

            # Get incidents with pagination
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 20, type=int)

            # Get filter parameters
            incident_type = request.args.get('type')
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')

            # Build query
            query = Incident.query.filter_by(department_id=department.id)

            # Apply filters if provided
            if incident_type:
                query = query.filter_by(incident_type=incident_type)

            if start_date:
                try:
                    start_datetime = datetime.fromisoformat(start_date)
                    query = query.filter(Incident.incident_date >= start_datetime)
                except ValueError:
                    flash('Invalid start date format', 'warning')

            if end_date:
                try:
                    end_datetime = datetime.fromisoformat(end_date)
                    query = query.filter(Incident.incident_date <= end_datetime)
                except ValueError:
                    flash('Invalid end date format', 'warning')

            # Order by date descending
            query = query.order_by(Incident.incident_date.desc())

            # Paginate results
            incidents = query.paginate(page=page, per_page=per_page)

            # Get incident types for filter dropdown
            incident_types = db.session.query(Incident.incident_type).filter_by(
                department_id=department.id
            ).distinct().all()
            incident_types = [t[0] for t in incident_types if t[0]] # Filter out None values

            try:
                return render_template('dept/incidents.html', 
                                      department=department, 
                                      user=current_user,
                                      incidents=incidents,
                                      incident_types=incident_types)
            except jinja2.exceptions.TemplateNotFound:
                app.logger.error("Template not found: dept/incidents.html")
                # Generate a fallback template
                incidents_list = ""
                for incident in incidents.items:
                    date_str = incident.incident_date.strftime('%m/%d/%Y') if incident.incident_date else 'Unknown'
                    incidents_list += f"""
                    <tr>
                        <td>{incident.incident_number or 'N/A'}</td>
                        <td>{date_str}</td>
                        <td>{incident.incident_title or 'Untitled'}</td>
                        <td>{incident.incident_type or 'Unknown'}</td>
                        <td>
                            <a href="/dept/{department.code}/incidents/{incident.id}" class="btn btn-sm btn-primary">View</a>
                        </td>
                    </tr>
                    """

                # Pagination controls
                pagination = ""
                if incidents.pages > 1:
                    pagination = "<div class='pagination'>"
                    if incidents.has_prev:
                        pagination += f"<a href='?page={incidents.prev_num}' class='btn btn-sm'>&laquo; Previous</a>"
                    else:
                        pagination += "<span class='btn btn-sm disabled'>&laquo; Previous</span>"

                    for page_num in range(max(1, incidents.page - 2), min(incidents.pages + 1, incidents.page + 3)):
                        if page_num == incidents.page:
                            pagination += f"<span class='btn btn-sm active'>{page_num}</span>"
                        else:
                            pagination += f"<a href='?page={page_num}' class='btn btn-sm'>{page_num}</a>"

                    if incidents.has_next:
                        pagination += f"<a href='?page={incidents.next_num}' class='btn btn-sm'>Next &raquo;</a>"
                    else:
                        pagination += "<span class='btn btn-sm disabled'>Next &raquo;</span>"
                    pagination += "</div>"

                return f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Incidents - {department.name}</title>
                    <link rel="stylesheet" href="/static/styles.css">
                    <style>
                        .table-container {{
                            background-color: white;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            padding: 20px;
                            margin-bottom: 20px;
                            overflow-x: auto;
                        }}
                        table {{
                            width: 100%;
                            border-collapse: collapse;
                        }}
                        th, td {{
                            padding: 10px;
                            text-align: left;
                            border-bottom: 1px solid #ddd;
                        }}
                        th {{
                            background-color: #f5f8fa;
                            font-weight: bold;
                        }}
                        tr:hover {{
                            background-color: #f5f8fa;
                        }}
                        .pagination {{
                            display: flex;
                            justify-content: center;
                            margin-top: 20px;
                        }}
                        .pagination .btn {{
                            margin: 0 5px;
                        }}
                        .pagination .active {{
                            background-color: #3498db;
                            color: white;
                        }}
                        .pagination .disabled {{
                            color: #95a5a6;
                            cursor: not-allowed;
                        }}
                        .filters {{
                            background-color: white;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            padding: 20px;
                            margin-bottom: 20px;
                        }}
                        .filter-row {{
                            display: flex;
                            flex-wrap: wrap;
                            gap: 15px;
                            align-items: center;
                        }}
                        .filter-group {{
                            flex: 1;
                            min-width: 200px;
                        }}
                    </style>
                </head>
                <body>
                    <header>
                        <div class="container">
                            <div class="header-content">
                                <div class="logo">
                                    <i class="fas fa-fire-extinguisher"></i> {department.name}
                                </div>
                            </div>
                        </div>
                    </header>

                    <nav>
                        <div class="container">
                            <ul class="nav-list">
                                <li class="nav-item">
                                    <a href="/dept/{department.code}" class="nav-link">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a href="/dept/{department.code}/dashboard" class="nav-link">Dashboard</a>
                                </li>
                                <li class="nav-item">
                                    <a href="/dept/{department.code}/incidents" class="nav-link active">Incidents</a>
                                </li>
                                <li class="nav-item">
                                    <a href="/dept/{department.code}/help" class="nav-link">Help</a>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    <main class="container">
                        <div class="content-header">
                            <h1 class="content-title">Incident Reports</h1>
                            <a href="/dept/{department.code}/incident-logger" class="btn btn-primary">
                                <i class="fas fa-plus"></i> New Incident
                            </a>
                        </div>

                        <div class="filters">
                            <h3>Filters</h3>
                            <form method="GET" action="/dept/{department.code}/incidents">
                                <div class="filter-row">
                                    <div class="filter-group">
                                        <label for="type">Incident Type:</label>
                                        <select name="type" id="type" class="form-control">
                                            <option value="">All Types</option>
                                            {''.join([f'<option value="{t}">{t}</option>' for t in incident_types])}
                                        </select>
                                    </div>
                                    <div class="filter-group">
                                        <label for="start_date">Start Date:</label>
                                        <input type="date" name="start_date" id="start_date" class="form-control">
                                    </div>
                                    <div class="filter-group">
                                        <label for="end_date">End Date:</label>
                                        <input type="date" name="end_date" id="end_date" class="form-control">
                                    </div>
                                    <div class="filter-group" style="display: flex; align-items: flex-end;">
                                        <button type="submit" class="btn btn-primary">Apply Filters</button>
                                        <a href="/dept/{department.code}/incidents" class="btn btn-secondary" style="margin-left: 10px;">Reset</a>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Incident #</th>
                                        <th>Date</th>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidents_list}
                                </tbody>
                            </table>

                            {pagination}
                        </div>
                    </main>
                </body>
                </html>
                """

        # Department Incident View

    @app.route("/isochrone-map")
    def isochrone_map():
            """Serve the Isochrone Map Generator tool"""
            return render_template("isochrone-map.html")

        # Add route for the Call Density Heatmap page

    @app.route('/call-density-heatmap')
    def call_density_heatmap():
            """Serve the Call Density Heatmap tool"""
            return render_template('call-density-heatmap.html')

        # Coverage Gap Finder route defined in the section below

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

    @app.route('/test-route')
    def test_route():
            """A simple test route to verify deployment"""
            return """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test Route</title>
                <link rel="stylesheet" href="/static/styles.css">
            </head>
            <body>
                <h1>Test Route Working</h1>
                <p>This is a test route to verify that new routes are working properly.</p>
                <p>Current time: """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</p>
            </body>
            </html>
            """

    @app.route('/simple-test')
    def simple_test():
            """Serve a simple test page"""
            return send_from_directory('static', 'simple-test.html')

    @app.route('/diagnostic')
    def diagnostic():
            """Serve the diagnostic tool"""
            return send_from_directory('static', 'diagnostic.html')

        # Ultra-minimal routes for navigation links

    @app.route('/coverage-gap-finder')
    def coverage_gap_finder():
            """Serve the Coverage Gap Finder tool"""
            return render_template('coverage-gap-finder.html')

    @app.route('/fire-map-pro')
    def fire_map_pro():
            """Serve the FireMapPro tool"""
            return render_template('fire-map-pro.html')

    @app.route('/data-formatter')
    def data_formatter():
            """Serve the Data Formatter tool"""
            return render_template('data-formatter.html')

    @app.route('/station-overview')
    def station_overview():
            """Serve the Station Overview tool"""
            return render_template('station-overview.html')

        # Station Overview helper functions

    @app.route('/api/coverage-gap/upload-stations', methods=['POST'])
    def coverage_gap_upload_stations():
            """Handle station data upload for coverage gap analysis"""
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400

            uploaded_file = request.files['file']
            if uploaded_file.filename == '':
                return jsonify({'error': 'No file selected'}), 400

            if uploaded_file and '.' in uploaded_file.filename:
                file_ext = uploaded_file.filename.rsplit('.', 1)[1].lower()

                if file_ext == 'csv':
                    # Process CSV file
                    try:
                        data = []
                        csv_content = uploaded_file.read().decode('utf-8')
                        csv_reader = csv.DictReader(io.StringIO(csv_content))
                        for row in csv_reader:
                            data.append(row)

                        # Store in session
                        session['station_data'] = data

                        return jsonify({
                            'success': True,
                            'message': f'Successfully uploaded and processed {len(data)} station records',
                            'stations': data
                        })
                    except Exception as e:
                        return jsonify({'error': f'Error processing CSV file: {str(e)}'}), 400

                elif file_ext in ['xls', 'xlsx']:
                    # Process Excel file
                    try:
                        data = []
                        df = pd.read_excel(uploaded_file)
                        data = df.to_dict('records')

                        # Store in session
                        session['station_data'] = data

                        return jsonify({
                            'success': True,
                            'message': f'Successfully uploaded and processed {len(data)} station records',
                            'stations': data
                        })
                    except Exception as e:
                        return jsonify({'error': f'Error processing Excel file: {str(e)}'}), 400

                else:
                    return jsonify({'error': 'Unsupported file format. Please upload CSV or Excel files.'}), 400

            return jsonify({'error': 'Invalid file'}), 400

    @app.route('/api/coverage-gap/upload-incidents', methods=['POST'])
    def coverage_gap_upload_incidents():
            """Handle incident data upload for coverage gap analysis"""
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400

            uploaded_file = request.files['file']
            if uploaded_file.filename == '':
                return jsonify({'error': 'No file selected'}), 400

            if uploaded_file and '.' in uploaded_file.filename:
                file_ext = uploaded_file.filename.rsplit('.', 1)[1].lower()

                if file_ext == 'csv':
                    # Process CSV file
                    try:
                        data = []
                        csv_content = uploaded_file.read().decode('utf-8')
                        csv_reader = csv.DictReader(io.StringIO(csv_content))
                        for row in csv_reader:
                            data.append(row)

                        # Store in session
                        session['incident_data'] = data

                        return jsonify({
                            'success': True,
                            'message': f'Successfully uploaded and processed {len(data)} incident records',
                            'incidents': data
                        })
                    except Exception as e:
                        return jsonify({'error': f'Error processing CSV file: {str(e)}'}), 400

                elif file_ext in ['xls', 'xlsx']:
                    # Process Excel file
                    try:
                        data = []
                        df = pd.read_excel(uploaded_file)
                        data = df.to_dict('records')

                        # Store in session
                        session['incident_data'] = data

                        return jsonify({
                            'success': True,
                            'message': f'Successfully uploaded and processed {len(data)} incident records',
                            'incidents': data
                        })
                    except Exception as e:
                        return jsonify({'error': f'Error processing Excel file: {str(e)}'}), 400

                else:
                    return jsonify({'error': 'Unsupported file format. Please upload CSV or Excel files.'}), 400

            return jsonify({'error': 'Invalid file'}), 400

    @app.route('/api/coverage-gap/upload-boundary', methods=['POST'])
    def coverage_gap_upload_boundary():
            """Handle jurisdiction boundary upload for coverage gap analysis"""
            # Check if data was provided
            if not request.json:
                return jsonify({'error': 'No boundary data provided'}), 400

            boundary_data = request.json

            # Validate GeoJSON format
            if 'type' not in boundary_data or 'coordinates' not in boundary_data:
                return jsonify({'error': 'Invalid GeoJSON format for boundary'}), 400

            # Store in session
            session['boundary_data'] = boundary_data

            return jsonify({
                'success': True,
                'message': 'Boundary data uploaded successfully',
                'boundary': boundary_data
            })

    @app.route('/api/coverage-gap/calculate', methods=['POST'])
    def coverage_gap_calculate():
            """Calculate coverage gaps based on stations and parameters"""
            # Get parameters
            params = request.json or {}

            response_time = float(params.get('response_time', 4))
            travel_speed = float(params.get('travel_speed', 25))
            turnout_time = float(params.get('turnout_time', 1.0))

            # Get data from session or use provided data
            stations = params.get('stations', session.get('station_data', []))
            boundary = params.get('boundary', session.get('boundary_data'))

            # Calculate coverage
            coverage_analysis = calculate_coverage_gaps(
                stations=stations,
                boundary=boundary,
                response_time=response_time,
                travel_speed=travel_speed,
                turnout_time=turnout_time
            )

            # Store the analysis and parameters
            session['coverage_analysis'] = coverage_analysis
            session['coverage_parameters'] = {
                'response_time': response_time,
                'travel_speed': travel_speed,
                'turnout_time': turnout_time
            }

            return jsonify({
                'success': True,
                'coverage': coverage_analysis
            })

    @app.route('/api/coverage-gap/suggest-stations', methods=['POST'])
    def coverage_gap_suggest_stations():
            """Suggest new station locations to fill coverage gaps"""
            # Get parameters
            params = request.json or {}

            num_stations = int(params.get('num_stations', 1))

            # Get data from session or use provided data
            stations = params.get('stations', session.get('station_data', []))
            incidents = params.get('incidents', session.get('incident_data', []))

            # Get coverage gaps from session
            gaps = params.get('gaps', session.get('coverage_analysis', {}))

            # Generate suggestions
            suggested_stations = suggest_station_locations(
                stations=stations,
                incidents=incidents,
                gaps=gaps,
                num_stations=num_stations
            )

            # Store suggested stations
            session['suggested_stations'] = suggested_stations

            return jsonify({
                'success': True,
                'suggested_stations': suggested_stations
            })

    @app.route('/api/coverage-gap/export', methods=['GET'])
    def coverage_gap_export_data():
            """Export coverage analysis and suggested stations"""
            # Get export format
            export_format = request.args.get('format', 'json')

            # Gather data to export
            export_data = {
                'stations': session.get('station_data', []),
                'suggested_stations': session.get('suggested_stations', []),
                'coverage_analysis': session.get('coverage_analysis', {}),
                'parameters': session.get('coverage_parameters', {})
            }

            if export_format == 'json':
                response = make_response(json.dumps(export_data, indent=2))
                response.headers["Content-Disposition"] = "attachment; filename=coverage_analysis.json"
                response.headers["Content-Type"] = "application/json"
                return response

            elif export_format == 'csv':
                # Create CSV for stations and suggested stations
                stations = export_data.get('stations', []) + export_data.get('suggested_stations', [])

                if not stations:
                    return jsonify({'error': 'No station data to export'}), 404

                csvfile = io.StringIO()
                fieldnames = stations[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                for station in stations:
                    writer.writerow(station)

                response = make_response(csvfile.getvalue())
                response.headers["Content-Disposition"] = "attachment; filename=stations_with_suggestions.csv"
                response.headers["Content-Type"] = "text/csv"
                return response

            else:
                return jsonify({'error': f'Unsupported export format: {export_format}'}), 400

        # Station Overview API endpoints

    @app.route('/api/station-overview/upload', methods=['POST'])
    def station_overview_upload():
            """Handle file upload for station data"""
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400

            uploaded_file = request.files['file']
            if uploaded_file.filename == '':
                return jsonify({'error': 'No file selected'}), 400

            if uploaded_file and '.' in uploaded_file.filename:
                file_ext = uploaded_file.filename.rsplit('.', 1)[1].lower()

                if file_ext == 'csv':
                    # Process CSV file
                    try:
                        data = []
                        csv_content = uploaded_file.read().decode('utf-8')
                        csv_reader = csv.DictReader(io.StringIO(csv_content))
                        for row in csv_reader:
                            # Handle units list which is comma-separated in CSV
                            if 'units' in row and isinstance(row['units'], str):
                                row['units'] = [unit.strip() for unit in row['units'].split(',')]
                            data.append(row)

                        return jsonify({
                            'success': True,
                            'message': f'Successfully uploaded and processed {len(data)} station records',
                            'stations': data
                        })
                    except Exception as e:
                        return jsonify({'error': f'Error processing CSV file: {str(e)}'}), 400

                elif file_ext in ['xls', 'xlsx']:
                    # Process Excel file
                    try:
                        data = []
                        df = pd.read_excel(uploaded_file)
                        data = df.to_dict('records')

                        # Ensure units are properly formatted as lists
                        for row in data:
                            if 'units' in row and isinstance(row['units'], str):
                                row['units'] = [unit.strip() for unit in row['units'].split(',')]

                        return jsonify({
                            'success': True,
                            'message': f'Successfully uploaded and processed {len(data)} station records',
                            'stations': data
                        })
                    except Exception as e:
                        return jsonify({'error': f'Error processing Excel file: {str(e)}'}), 400

                else:
                    return jsonify({'error': 'Unsupported file format. Please upload CSV or Excel files.'}), 400

            return jsonify({'error': 'Invalid file'}), 400

    @app.route('/api/station-overview/data', methods=['POST'])
    def station_overview_submit_data():
            """Submit station and incident data"""
            data = request.json

            if not data:
                return jsonify({'error': 'No data provided'}), 400

            # Validate data structure
            if 'stations' not in data or not isinstance(data['stations'], list):
                return jsonify({'error': 'Missing or invalid stations data'}), 400

            if 'incidents' not in data or not isinstance(data['incidents'], list):
                return jsonify({'error': 'Missing or invalid incidents data'}), 400

            # Store data in session for now (in a real app, this would go to a database)
            session['station_data'] = data['stations']
            session['incident_data'] = data['incidents']

            return jsonify({
                'success': True,
                'message': 'Data successfully uploaded',
                'station_count': len(data['stations']),
                'incident_count': len(data['incidents'])
            })

    @app.route('/api/station-overview/stations', methods=['GET'])
    def station_overview_get_stations():
            """Get all stations"""
            # Check if we have data in session
            if 'station_data' not in session or not session['station_data']:
                # Return sample data if no actual data exists
                return jsonify({
                    'stations': [
                        {
                            "station_id": "STA-001",
                            "name": "Main Street Fire Station",
                            "address": "123 Main Street",
                            "city": "Phoenix",
                            "state": "AZ",
                            "latitude": 33.4484,
                            "longitude": -112.0740,
                            "units": ["E1", "L1", "BC1"],
                            "personnel": 12
                        },
                        {
                            "station_id": "STA-002",
                            "name": "Westside Fire Station",
                            "address": "456 West Avenue",
                            "city": "Phoenix",
                            "state": "AZ",
                            "latitude": 33.4584,
                            "longitude": -112.0840,
                            "units": ["E2", "A2"],
                            "personnel": 8
                        },
                        {
                            "station_id": "STA-003",
                            "name": "Eastside Fire Station",
                            "address": "789 East Boulevard",
                            "city": "Phoenix",
                            "state": "AZ",
                            "latitude": 33.4684,
                            "longitude": -112.0640,
                            "units": ["E3", "A3", "HM3"],
                            "personnel": 10
                        }
                    ]
                })

            return jsonify({'stations': session['station_data']})

    @app.route('/api/station-overview/stations/<station_id>', methods=['GET'])
    def station_overview_get_station(station_id):
            """Get a specific station by ID"""
            # Check if we have data in session
            if 'station_data' not in session or not session['station_data']:
                return jsonify({'error': 'No station data available'}), 404

            # Find the requested station
            station = next((s for s in session['station_data'] if s.get('station_id') == station_id), None)

            if not station:
                return jsonify({'error': f'Station with ID {station_id} not found'}), 404

            return jsonify({'station': station})

    @app.route('/api/station-overview/metrics', methods=['GET'])
    def station_overview_get_metrics():
            """Get metrics for all stations"""
            # Check if we have data in session
            if 'station_data' not in session or not session['station_data'] or 'incident_data' not in session or not session['incident_data']:
                # Return sample metrics if no data
                return jsonify({
                    'metrics': {
                        'response_times': {
                            'average': 325.5,
                            'percentile_90': 450.2
                        },
                        'call_volume': {
                            'total': 187,
                            'by_type': {
                                'FIRE': 35,
                                'EMS': 120,
                                'HAZMAT': 12,
                                'RESCUE': 15,
                                'SERVICE': 5
                            }
                        },
                        'unit_utilization': {
                            'average': 14.2,
                            'max': 24.8,
                            'min': 3.6
                        }
                    }
                })

            # Calculate actual metrics
            metrics = calculate_station_metrics(session['station_data'], session['incident_data'])

            return jsonify({'metrics': metrics})

    @app.route('/api/station-overview/metrics/<station_id>', methods=['GET'])
    def station_overview_get_station_metrics(station_id):
            """Get metrics for a specific station"""
            # Check if we have data in session
            if 'station_data' not in session or not session['station_data'] or 'incident_data' not in session or not session['incident_data']:
                return jsonify({'error': 'No data available'}), 404

            # Find the requested station
            station = next((s for s in session['station_data'] if s.get('station_id') == station_id), None)

            if not station:
                return jsonify({'error': f'Station with ID {station_id} not found'}), 404

            # Get incidents for this station
            station_incidents = [inc for inc in session['incident_data'] if inc.get('station_id') == station_id]

            # Calculate station-specific metrics
            station_metrics = calculate_single_station_metrics(station, station_incidents)

            return jsonify({
                'station_id': station_id,
                'metrics': station_metrics
            })

    @app.route('/api/station-overview/filter', methods=['POST'])
    def station_overview_filter_data():
            """Filter station data by various criteria"""
            # Get filter parameters
            filters = request.json

            if not filters:
                return jsonify({'error': 'No filter parameters provided'}), 400

            # Check if we have data in session
            if 'incident_data' not in session or not session['incident_data']:
                return jsonify({'error': 'No data available to filter'}), 404

            # Extract filter parameters
            date_from = filters.get('dateFrom')
            date_to = filters.get('dateTo')
            station_id = filters.get('station')
            call_type = filters.get('callType')

            # Apply filters
            filtered_incidents = session['incident_data']

            # Filter by date range
            if date_from and date_to:
                try:
                    date_from_dt = datetime.fromisoformat(date_from)
                    date_to_dt = datetime.fromisoformat(date_to)

                    # Add one day to make the end date inclusive
                    date_to_dt = date_to_dt + timedelta(days=1)

                    filtered_incidents = [
                        inc for inc in filtered_incidents
                        if inc.get('dispatch_time') and datetime.fromisoformat(inc['dispatch_time']) >= date_from_dt
                        and datetime.fromisoformat(inc['dispatch_time']) <= date_to_dt
                    ]
                except ValueError:
                    return jsonify({'error': 'Invalid date format'}), 400

            # Filter by station
            if station_id and station_id != 'all':
                filtered_incidents = [inc for inc in filtered_incidents if inc.get('station_id') == station_id]

            # Filter by call type
            if call_type and call_type != 'all':
                filtered_incidents = [inc for inc in filtered_incidents if inc.get('incident_type') == call_type]

            return jsonify({
                'success': True,
                'filter_params': filters,
                'incidents': filtered_incidents,
                'total_count': len(filtered_incidents)
            })

    @app.route('/api/station-overview/utilization', methods=['GET'])
    def station_overview_unit_utilization():
            """Get unit utilization data"""
            # Check if we have data in session
            if 'station_data' not in session or not session['station_data'] or 'incident_data' not in session or not session['incident_data']:
                # Return sample unit utilization data
                return jsonify({
                    'units': [
                        {
                            'unit_id': 'E1',
                            'station_id': 'STA-001',
                            'utilization_percentage': 18.7,
                            'total_time': 45.5,
                            'total_incidents': 65
                        },
                        {
                            'unit_id': 'L1',
                            'station_id': 'STA-001',
                            'utilization_percentage': 12.3,
                            'total_time': 30.2,
                            'total_incidents': 42
                        },
                        {
                            'unit_id': 'BC1',
                            'station_id': 'STA-001',
                            'utilization_percentage': 8.1,
                            'total_time': 19.8,
                            'total_incidents': 28
                        },
                        {
                            'unit_id': 'E2',
                            'station_id': 'STA-002',
                            'utilization_percentage': 21.5,
                            'total_time': 52.4,
                            'total_incidents': 72
                        },
                        {
                            'unit_id': 'A2',
                            'station_id': 'STA-002',
                            'utilization_percentage': 24.8,
                            'total_time': 60.6,
                            'total_incidents': 98
                        }
                    ]
                })

            # Calculate actual unit utilization
            unit_utilization = calculate_unit_utilization(session['station_data'], session['incident_data'])

            return jsonify({'units': unit_utilization})

    @app.route('/api/station-overview/response-times', methods=['GET'])
    def station_overview_response_times():
            """Get response time analysis data"""
            # Check if we have data in session
            if 'station_data' not in session or not session['station_data'] or 'incident_data' not in session or not session['incident_data']:
                # Return sample response time data
                return jsonify({
                    'response_times': {
                        'average': 325.5,
                        'by_station': [
                            {
                                'station_id': 'STA-001',
                                'turnout_time': 95.2,
                                'travel_time': 230.3,
                                'total_response_time': 325.5
                            },
                            {
                                'station_id': 'STA-002',
                                'turnout_time': 78.5,
                                'travel_time': 245.8,
                                'total_response_time': 324.3
                            },
                            {
                                'station_id': 'STA-003',
                                'turnout_time': 90.1,
                                'travel_time': 250.2,
                                'total_response_time': 340.3
                            }
                        ],
                        'by_priority': [
                            {
                                'priority': 'HIGH',
                                'average_response_time': 315.2
                            },
                            {
                                'priority': 'MEDIUM',
                                'average_response_time': 335.8
                            },
                            {
                                'priority': 'LOW',
                                'average_response_time': 385.3
                            }
                        ],
                        'by_call_type': [
                            {
                                'type': 'FIRE',
                                'average_response_time': 305.6
                            },
                            {
                                'type': 'EMS',
                                'average_response_time': 328.9
                            },
                            {
                                'type': 'HAZMAT',
                                'average_response_time': 340.5
                            },
                            {
                                'type': 'RESCUE',
                                'average_response_time': 312.7
                            },
                            {
                                'type': 'SERVICE',
                                'average_response_time': 380.2
                            }
                        ]
                    }
                })

            # Calculate actual response times
            response_times = calculate_response_times(session['station_data'], session['incident_data'])

            return jsonify({'response_times': response_times})

    @app.route('/api/station-overview/map-data', methods=['GET'])
    def station_overview_map_data():
            """Get data for the station coverage map"""
            # Check if we have data in session
            if 'station_data' not in session or not session['station_data'] or 'incident_data' not in session or not session['incident_data']:
                # Return sample map data
                return jsonify({
                    'stations': [
                        {
                            'station_id': 'STA-001',
                            'name': 'Main Street Fire Station',
                            'latitude': 33.4484,
                            'longitude': -112.0740,
                            'units': ['E1', 'L1', 'BC1']
                        },
                        {
                            'station_id': 'STA-002',
                            'name': 'Westside Fire Station',
                            'latitude': 33.4584,
                            'longitude': -112.0840,
                            'units': ['E2', 'A2']
                        },
                        {
                            'station_id': 'STA-003',
                            'name': 'Eastside Fire Station',
                            'latitude': 33.4684,
                            'longitude': -112.0640,
                            'units': ['E3', 'A3', 'HM3']
                        }
                    ],
                    'incidents': [
                        {
                            'incident_id': 'INC-001',
                            'station_id': 'STA-001',
                            'latitude': 33.4494,
                            'longitude': -112.0750,
                            'incident_type': 'FIRE'
                        },
                        {
                            'incident_id': 'INC-002',
                            'station_id': 'STA-002',
                            'latitude': 33.4594,
                            'longitude': -112.0850,
                            'incident_type': 'EMS'
                        },
                        {
                            'incident_id': 'INC-003',
                            'station_id': 'STA-003',
                            'latitude': 33.4694,
                            'longitude': -112.0650,
                            'incident_type': 'HAZMAT'
                        }
                    ]
                })

            # Prepare map data
            stations = session['station_data']

            # Filter incident data to just include necessary fields for map
            incident_map_data = []
            for incident in session['incident_data']:
                if 'latitude' in incident and 'longitude' in incident:
                    incident_map_data.append({
                        'incident_id': incident.get('incident_id'),
                        'station_id': incident.get('station_id'),
                        'latitude': incident.get('latitude'),
                        'longitude': incident.get('longitude'),
                        'incident_type': incident.get('incident_type')
                    })

            return jsonify({
                'stations': stations,
                'incidents': incident_map_data
            })

    @app.route('/api/station-overview/export', methods=['GET'])
    def station_overview_export_data():
            """Export station data in various formats"""
            # Get export parameters
            export_format = request.args.get('format', 'csv')
            export_type = request.args.get('type', 'metrics')

            # Check if we have data in session
            if (export_type == 'metrics' and 
                ('station_data' not in session or not session['station_data'] or 
                 'incident_data' not in session or not session['incident_data'])):
                return jsonify({'error': 'No data available to export'}), 404

            if export_type == 'metrics':
                # For metrics export, calculate metrics
                all_metrics = []
                for station in session['station_data']:
                    station_id = station.get('station_id')
                    station_incidents = [inc for inc in session['incident_data'] if inc.get('station_id') == station_id]
                    metrics = calculate_single_station_metrics(station, station_incidents)

                    all_metrics.append({
                        'station_id': station_id,
                        'name': station.get('name'),
                        'address': station.get('address'),
                        'city': station.get('city'),
                        'state': station.get('state'),
                        'total_incidents': metrics['call_volume']['total'],
                        'average_response_time': metrics['response_times']['average'],
                        'percentile_90': metrics['response_times']['percentile_90'],
                        'primary_incident_type': metrics['call_volume']['primary_type'],
                        'busiest_hour': metrics['busiest_times']['hour'],
                        'busiest_day': metrics['busiest_times']['day']
                    })

                if export_format == 'csv':
                    # Create CSV
                    csvfile = io.StringIO()
                    fieldnames = all_metrics[0].keys()
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writeheader()
                    for metric in all_metrics:
                        writer.writerow(metric)

                    response = make_response(csvfile.getvalue())
                    response.headers["Content-Disposition"] = "attachment; filename=station_metrics.csv"
                    response.headers["Content-Type"] = "text/csv"
                    return response

                elif export_format == 'excel':
                    # Create Excel
                    df = pd.DataFrame(all_metrics)
                    excel_file = io.BytesIO()

                    # Create a workbook with xlsxwriter
                    with pd.ExcelWriter(excel_file, engine='xlsxwriter') as writer:
                        df.to_excel(writer, sheet_name='Station Metrics', index=False)

                        # Get the worksheet
                        worksheet = writer.sheets['Station Metrics']

                        # Add some formatting
                        workbook = writer.book
                        header_format = workbook.add_format({
                            'bold': True,
                            'text_wrap': True,
                            'valign': 'top',
                            'fg_color': '#D7E4BC',
                            'border': 1
                        })

                        # Write the column headers with the defined format
                        for col_num, value in enumerate(df.columns.values):
                            worksheet.write(0, col_num, value, header_format)
                            worksheet.set_column(col_num, col_num, 15)

                    excel_file.seek(0)

                    response = make_response(excel_file.getvalue())
                    response.headers["Content-Disposition"] = "attachment; filename=station_metrics.xlsx"
                    response.headers["Content-Type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    return response

                else:
                    return jsonify({'error': f'Unsupported export format: {export_format}'}), 400

            else:
                return jsonify({'error': f'Unsupported export type: {export_type}'}), 400

        # Test Dashboard routes

    @app.route('/test-dashboard')
    def test_dashboard():
            """Serve the Test Dashboard tool"""
            try:
                return render_template('test-dashboard.html')
            except Exception as e:
                logger.error(f"Error rendering test dashboard: {str(e)}")
                return f"Error: {str(e)}", 500

    @app.route('/api/test-dashboard/data')
    def test_dashboard_data():
            """Get test dashboard mock data for visualization."""
            try:
                # Import sample data generator
                try:
                    from tests.monitoring.sample_data import generate_mock_dashboard_data
                    mock_data = generate_mock_dashboard_data()
                    return jsonify(mock_data)
                except ImportError:
                    # If we can't import the sample data generator, return empty data
                    logger.warning("Test dashboard sample data not available")
                    return jsonify({
                        'summary': {
                            'totalRuns': 0,
                            'successRate': 0,
                            'totalTests': 0,
                            'activeAlerts': 0
                        },
                        'history': {
                            'dates': [],
                            'passed': [],
                            'failed': []
                        },
                        'typeDistribution': {},
                        'durationsByType': {},
                        'latestRuns': [],
                        'alertRules': []
                    })
            except Exception as e:
                logger.error(f"Error fetching test dashboard data: {str(e)}")
                return jsonify({'error': str(e)}), 500

    @app.route('/api/test-runs/<int:run_id>')
    def get_test_run(run_id):
            """Get details for a specific test run."""
            try:
                # Import sample data generator
                try:
                    import random
                    from tests.monitoring.sample_data import generate_mock_dashboard_data

                    # Use mock data
                    mock_data = generate_mock_dashboard_data()
                    run = next((r for r in mock_data['latestRuns'] if r['id'] == run_id), None)

                    if not run:
                        return jsonify({'error': 'Test run not found'}), 404

                    # Generate mock results
                    results = []

                    # Add passed tests
                    for i in range(run['passed_tests']):
                        results.append({
                            'id': i + 1,
                            'name': f'test_passed_{i + 1}',
                            'module': f'tests.{run["type"]}.test_module_{i // 5 + 1}',
                            'class': f'Test{run["type"].capitalize()}Class{i // 10 + 1}',
                            'result': 'pass',
                            'duration': round(0.1 + random.random() * 0.5, 3)
                        })

                    # Add failed tests
                    for i in range(run['failed_tests']):
                        results.append({
                            'id': i + run['passed_tests'] + 1,
                            'name': f'test_failed_{i + 1}',
                            'module': f'tests.{run["type"]}.test_module_{i // 2 + 1}',
                            'class': f'Test{run["type"].capitalize()}Class{i // 3 + 1}',
                            'result': 'fail',
                            'duration': round(0.1 + random.random() * 0.5, 3),
                            'error_message': f'AssertionError: Expected True but got False',
                            'error_type': 'AssertionError'
                        })

                    # Add skipped tests
                    for i in range(run['skipped_tests']):
                        results.append({
                            'id': i + run['passed_tests'] + run['failed_tests'] + 1,
                            'name': f'test_skipped_{i + 1}',
                            'module': f'tests.{run["type"]}.test_module_{i // 2 + 1}',
                            'class': f'Test{run["type"].capitalize()}Class{i // 3 + 1}',
                            'result': 'skip',
                            'duration': 0
                        })

                    # Add results to run data
                    run_copy = run.copy()
                    run_copy['results'] = results

                    return jsonify(run_copy)
                except ImportError:
                    # If we can't import the sample data generator, return empty data
                    logger.warning("Test dashboard sample data not available")
                    return jsonify({'error': 'Test run details not available'}), 404

            except Exception as e:
                logger.error(f"Error fetching test run {run_id}: {str(e)}")
                return jsonify({'error': str(e)}), 500

        # Include the rest of your original routes here

    # Call Volume Forecaster Routes

    @app.route('/call-volume-forecaster')
    def call_volume_forecaster():
        """Render the Call Volume Forecaster page"""
        return render_template('call-volume-forecaster.html')

    @app.route('/api/call-volume-forecaster/upload', methods=['POST'])
    def call_volume_forecaster_upload():
        """API endpoint to upload and process incident data for call volume forecasting"""
        try:
            # Check if file was uploaded
            if 'file' not in request.files:
                return jsonify({"error": "No file uploaded"}), 400

            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400

            # Process the uploaded file
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

            # Process CSV or Excel files
            try:
                if file_extension == 'csv':
                    df = pd.read_csv(file)
                elif file_extension in ['xlsx', 'xls']:
                    df = pd.read_excel(file)
                else:
                    return jsonify({"error": "Unsupported file format. Please upload a CSV or Excel file."}), 400
            except Exception as e:
                return jsonify({"error": f"Error reading file: {str(e)}"}), 400

            # Store the data in the session
            session['call_volume_data'] = df.to_json(orient='records', date_format='iso')

            # Calculate data quality metrics
            data_quality = calculate_data_quality(df)

            # Generate sample data for the response (this would be based on the actual data)
            return jsonify({
                "message": "Data uploaded successfully",
                "file_name": filename,
                "record_count": len(df),
                "quality": data_quality
            })

        except Exception as e:
            logger.error(f"Error in call_volume_forecaster_upload: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/call-volume-forecaster/forecast', methods=['POST'])
    def call_volume_forecaster_generate():
        """API endpoint to generate a call volume forecast based on uploaded data"""
        try:
            # Check if data exists in session
            if 'call_volume_data' not in session:
                # If no data in session, use sample data
                forecast_data = generate_sample_forecast_data()
                return jsonify(forecast_data)

            # Get parameters from request
            data = request.json
            forecast_type = data.get('forecastType', 'monthly')
            forecast_period = int(data.get('forecastPeriod', 12))
            model_type = data.get('modelType', 'prophet')
            confidence_interval = int(data.get('confidenceInterval', 95))

            # Get advanced parameters if provided
            seasonal_periods = data.get('seasonalPeriods', ['weekly', 'monthly', 'yearly'])
            holiday_effects = data.get('holidayEffects', True)
            changepoints = data.get('changepoints', True)
            external_factors = data.get('externalFactors', [])

            # Load data from session
            df = pd.read_json(session['call_volume_data'], orient='records')

            # Generate forecast based on the data and parameters
            forecast_data = generate_forecast(
                df, 
                forecast_type, 
                forecast_period, 
                model_type, 
                confidence_interval,
                seasonal_periods,
                holiday_effects,
                changepoints,
                external_factors
            )

            return jsonify(forecast_data)

        except Exception as e:
            logger.error(f"Error in call_volume_forecaster_generate: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/call-volume-forecaster/export/<format>', methods=['POST'])
    def call_volume_forecaster_export(format):
        """API endpoint to export forecast data in various formats"""
        try:
            # Get forecast data from request
            data = request.json
            forecast_data = data.get('forecastData')

            if not forecast_data:
                return jsonify({"error": "No forecast data provided"}), 400

            # Export data based on the requested format
            if format == 'csv':
                return export_forecast_csv(forecast_data)
            elif format == 'excel':
                return export_forecast_excel(forecast_data)
            elif format == 'pdf':
                return export_forecast_pdf(forecast_data)
            elif format == 'image':
                return export_forecast_image(forecast_data)
            else:
                return jsonify({"error": f"Unsupported export format: {format}"}), 400

        except Exception as e:
            logger.error(f"Error in call_volume_forecaster_export: {str(e)}")
            return jsonify({"error": str(e)}), 500

    # Helper functions for Call Volume Forecaster

    @app.route('/data-formatter')
    def data_formatter():
            """Serve the Data Formatter tool"""
            return render_template('data-formatter.html')

    @app.route('/api/data-formatter/upload', methods=['POST'])
    def data_formatter_upload():
        """API endpoint to handle file uploads for the Data Formatter"""
        try:
            # Check if file was uploaded
            if 'file' not in request.files:
                return jsonify({"error": "No file uploaded"}), 400

            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400

            # Get additional parameters
            format_type = request.form.get('format', 'auto')

            # Process the uploaded file
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

            # Process different file types
            try:
                if file_extension in ['csv'] or (format_type == 'csv'):
                    # Process CSV file
                    df = pd.read_csv(file)
                    # Store in session for later use
                    session['data_formatter_data'] = df.to_json(orient='records', date_format='iso')
                    data = json.loads(df.to_json(orient='records', date_format='iso'))
                    fields = list(df.columns)

                    # Detect system type based on headers
                    system_type = detect_system_type(fields)

                    return jsonify({
                        "success": True,
                        "message": "CSV file uploaded successfully",
                        "filename": filename,
                        "format": "csv",
                        "rowCount": len(df),
                        "columnCount": len(fields),
                        "fields": fields,
                        "detectInfo": {
                            "systemType": system_type,
                            "hasGeoCoordinates": has_geo_coordinates(fields),
                            "hasTimestamps": has_timestamps(fields),
                            "suggestedTools": suggest_tools(fields)
                        },
                        "preview": data[:10] if len(data) > 0 else []
                    })

                elif file_extension in ['xlsx', 'xls'] or (format_type == 'excel'):
                    # Process Excel file
                    # Read just the sheet names first
                    excel_file = pd.ExcelFile(file)
                    sheet_names = excel_file.sheet_names

                    # If sheet name is specified, use that one
                    sheet_name = request.form.get('sheet', sheet_names[0])

                    # Read the specified sheet
                    df = pd.read_excel(file, sheet_name=sheet_name)

                    # Store in session for later use
                    session['data_formatter_data'] = df.to_json(orient='records', date_format='iso')
                    session['data_formatter_sheets'] = sheet_names

                    data = json.loads(df.to_json(orient='records', date_format='iso'))
                    fields = list(df.columns)

                    # Detect system type based on headers
                    system_type = detect_system_type(fields)

                    return jsonify({
                        "success": True,
                        "message": "Excel file uploaded successfully",
                        "filename": filename,
                        "format": "excel",
                        "sheets": sheet_names,
                        "activeSheet": sheet_name,
                        "rowCount": len(df),
                        "columnCount": len(fields),
                        "fields": fields,
                        "detectInfo": {
                            "systemType": system_type,
                            "hasGeoCoordinates": has_geo_coordinates(fields),
                            "hasTimestamps": has_timestamps(fields),
                            "suggestedTools": suggest_tools(fields)
                        },
                        "preview": data[:10] if len(data) > 0 else []
                    })

                elif file_extension in ['json'] or (format_type == 'json'):
                    # Process JSON file
                    file_content = file.read().decode('utf-8')
                    data = json.loads(file_content)

                    # Convert to DataFrame for easier processing
                    if isinstance(data, list):
                        df = pd.DataFrame(data)
                    elif isinstance(data, dict) and "results" in data:
                        # Common API response format
                        df = pd.DataFrame(data["results"])
                    else:
                        # Flatten the JSON structure
                        flattened = []
                        for key, value in data.items():
                            if isinstance(value, dict):
                                flattened.append(value)
                            elif isinstance(value, list):
                                flattened.extend(value)
                        df = pd.DataFrame(flattened)

                    # Store in session for later use
                    session['data_formatter_data'] = df.to_json(orient='records', date_format='iso')

                    fields = list(df.columns)

                    # Detect system type based on headers
                    system_type = detect_system_type(fields)

                    return jsonify({
                        "success": True,
                        "message": "JSON file uploaded successfully",
                        "filename": filename,
                        "format": "json",
                        "rowCount": len(df),
                        "columnCount": len(fields),
                        "fields": fields,
                        "detectInfo": {
                            "systemType": system_type,
                            "hasGeoCoordinates": has_geo_coordinates(fields),
                            "hasTimestamps": has_timestamps(fields),
                            "suggestedTools": suggest_tools(fields)
                        },
                        "preview": json.loads(df.head(10).to_json(orient='records', date_format='iso'))
                    })

                else:
                    # Unsupported format
                    return jsonify({
                        "error": f"Unsupported file format: {file_extension}. Please upload a CSV, Excel, or JSON file."
                    }), 400

            except Exception as e:
                logger.error(f"Error processing file: {str(e)}")
                return jsonify({"error": f"Error processing file: {str(e)}"}), 400

        except Exception as e:
            logger.error(f"Error in data_formatter_upload: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/data-formatter/transform', methods=['POST'])
    def data_formatter_transform():
        """API endpoint to transform data according to specified parameters"""
        try:
            # Get transformation parameters
            data = request.json
            target_tool = data.get('targetTool')
            options = data.get('options', {})

            # Check if we have data in the session
            if 'data_formatter_data' not in session:
                return jsonify({"error": "No data available. Please upload a file first."}), 400

            # Load data from session
            df = pd.read_json(session['data_formatter_data'], orient='records')

            # Apply transformations based on target tool
            transformed_df, log_entries = transform_data_for_tool(df, target_tool, options)

            # Store transformed data in session
            session['data_formatter_transformed'] = transformed_df.to_json(orient='records', date_format='iso')

            # Return preview and log
            return jsonify({
                "success": True,
                "message": "Data transformed successfully",
                "preview": json.loads(transformed_df.head(10).to_json(orient='records', date_format='iso')),
                "rowCount": len(transformed_df),
                "columnCount": len(transformed_df.columns),
                "fields": list(transformed_df.columns),
                "log": log_entries
            })

        except Exception as e:
            logger.error(f"Error in data_formatter_transform: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/data-formatter/download/<format>', methods=['GET'])
    def data_formatter_download(format):
        """API endpoint to download transformed data in various formats"""
        try:
            # Check if we have transformed data in the session
            if 'data_formatter_transformed' not in session:
                return jsonify({"error": "No transformed data available. Please transform data first."}), 400

            # Load transformed data from session
            df = pd.read_json(session['data_formatter_transformed'], orient='records')

            # Generate download based on requested format
            if format == 'csv':
                # Create CSV
                output = io.StringIO()
                df.to_csv(output, index=False)
                response = make_response(output.getvalue())
                response.headers["Content-Disposition"] = "attachment; filename=transformed_data.csv"
                response.headers["Content-type"] = "text/csv"
                return response

            elif format == 'excel':
                # Create Excel file
                output = io.BytesIO()
                with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                    df.to_excel(writer, sheet_name='Transformed Data', index=False)
                output.seek(0)
                response = make_response(output.getvalue())
                response.headers["Content-Disposition"] = "attachment; filename=transformed_data.xlsx"
                response.headers["Content-type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                return response

            elif format == 'json':
                # Create JSON file
                json_data = df.to_json(orient='records', date_format='iso')
                response = make_response(json_data)
                response.headers["Content-Disposition"] = "attachment; filename=transformed_data.json"
                response.headers["Content-type"] = "application/json"
                return response

            else:
                return jsonify({"error": f"Unsupported download format: {format}"}), 400

        except Exception as e:
            logger.error(f"Error in data_formatter_download: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/data-formatter/send-to-tool', methods=['POST'])
    def data_formatter_send_to_tool():
        """API endpoint to send transformed data directly to another tool"""
        try:
            # Get parameters
            data = request.json
            target_tool = data.get('targetTool')

            # Check if we have transformed data in the session
            if 'data_formatter_transformed' not in session:
                return jsonify({"error": "No transformed data available. Please transform data first."}), 400

            # Store data in session under the appropriate key for the target tool
            transformed_data = session['data_formatter_transformed']

            # Map tool to session key
            tool_session_keys = {
                'response-time': 'response_time_data',
                'call-density': 'call_density_data',
                'isochrone': 'isochrone_data',
                'isochrone-stations': 'isochrone_stations_data',
                'isochrone-incidents': 'isochrone_incidents_data',
                'coverage-gap': 'coverage_gap_data',
                'station-overview': 'station_overview_data'
            }

            if target_tool in tool_session_keys:
                session[tool_session_keys[target_tool]] = transformed_data

                # Generate redirect URL
                tool_urls = {
                    'response-time': '/fire-ems-dashboard',
                    'call-density': '/call-density-heatmap',
                    'isochrone': '/isochrone-map',
                    'isochrone-stations': '/isochrone-map?type=stations',
                    'isochrone-incidents': '/isochrone-map?type=incidents',
                    'coverage-gap': '/coverage-gap-finder',
                    'station-overview': '/station-overview'
                }

                redirect_url = tool_urls.get(target_tool, '/')

                return jsonify({
                    "success": True,
                    "message": "Data sent to tool successfully",
                    "redirectUrl": redirect_url
                })
            else:
                return jsonify({"error": f"Unsupported target tool: {target_tool}"}), 400

        except Exception as e:
            logger.error(f"Error in data_formatter_send_to_tool: {str(e)}")
            return jsonify({"error": str(e)}), 500

    # Helper functions for Data Formatter

    @app.route('/quick-stats')
    def quick_stats():
        """Render the Quick Stats page"""
        return render_template('quick-stats.html')

    @app.route('/api/quick-stats/upload', methods=['POST'])
    def quick_stats_upload():
        """API endpoint to upload and process incident data for quick stats generation"""
        try:
            # Check if file was uploaded
            if 'file' not in request.files:
                return jsonify({"error": "No file uploaded"}), 400

            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400

            # Process the uploaded file
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

            # Process CSV or Excel files
            try:
                if file_extension == 'csv':
                    df = pd.read_csv(file)
                elif file_extension in ['xlsx', 'xls']:
                    df = pd.read_excel(file)
                else:
                    return jsonify({"error": "Unsupported file format. Please upload a CSV or Excel file."}), 400
            except Exception as e:
                return jsonify({"error": f"Error reading file: {str(e)}"}), 400

            # Store the data in the session
            session['quick_stats_data'] = df.to_json(orient='records', date_format='iso')

            # Convert data to JSON format expected by frontend
            incidents = json.loads(df.to_json(orient='records', date_format='iso'))

            # Return processed data
            return jsonify({
                "message": "Data uploaded successfully",
                "file_name": filename,
                "record_count": len(df),
                "incidents": incidents
            })

        except Exception as e:
            logger.error(f"Error in quick_stats_upload: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/quick-stats/sample/<dataset>', methods=['GET'])
    def quick_stats_sample(dataset):
        """API endpoint to get sample incident data for quick stats demonstration"""
        try:
            # Define dataset files and paths
            sample_datasets = {
                'phoenix': 'phoenix_incidents.csv',
                'seattle': 'seattle_incidents.csv',
                'chicago': 'chicago_incidents.csv'
            }

            if dataset not in sample_datasets:
                return jsonify({"error": f"Unknown sample dataset: {dataset}"}), 400

            # Get file path
            file_path = os.path.join('sample_data', sample_datasets[dataset])

            # Check if file exists
            if not os.path.exists(file_path):
                logger.warning(f"Sample dataset file not found: {file_path}")
                # Return empty data for demo purposes
                return jsonify({
                    "message": "Sample data file not found. Returning empty dataset.",
                    "incidents": []
                })

            # Read sample data file
            try:
                df = pd.read_csv(file_path)
                incidents = json.loads(df.to_json(orient='records', date_format='iso'))

                return jsonify({
                    "message": "Sample data loaded successfully",
                    "dataset": dataset,
                    "record_count": len(df),
                    "incidents": incidents
                })
            except Exception as e:
                logger.error(f"Error reading sample data file: {str(e)}")
                return jsonify({"error": f"Error processing sample data: {str(e)}"}), 500

        except Exception as e:
            logger.error(f"Error in quick_stats_sample: {str(e)}")
            return jsonify({"error": str(e)}), 500

    # Create app instance for running directly
    try:
        # Ensure fixes are applied
        logger.info("Creating application with deployment fixes...")
        app = create_app(os.getenv('FLASK_ENV', 'development'))

        # Add diagnostic route for deployment verification

    @app.route('/deployment-status')
    def deployment_status():
            """Check deployment status - a quick way to verify fixes are working"""
            from database import Department, User
            status = {
                "status": "ok",
                "fixes_applied": True,
                "timestamp": datetime.utcnow().isoformat(),
                "environment": os.getenv('FLASK_ENV', 'development'),
                "features": {
                    "user_api": hasattr(User, 'to_dict'),
                    "webhooks": hasattr(Department, 'webhook_events') and hasattr(Department, 'webhooks_enabled')
                }
            }
            return jsonify(status)

        logger.info("Application created successfully with all fixes applied")
    except Exception as e:
        logger.critical(f"Failed to create application with fixes: {str(e)}")
        logger.critical(traceback.format_exc())
        # Create a basic app without fixes for emergency access
        app = Flask(__name__)

    @app.route('/')
    def emergency_home():
            return "Emergency mode - application failed to start properly. Check logs."

# Create app instance for running directly
try:
    # Ensure fixes are applied
    logger.info("Creating application with deployment fixes...")
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    # Fix database tables after app creation
    fix_deployment.fix_database_tables(app, db)
    
    # Add diagnostic route for deployment verification
    @app.route('/deployment-status')
    def deployment_status():
        """Check deployment status - a quick way to verify fixes are working"""
        status = {
            "status": "ok",
            "fixes_applied": True,
            "timestamp": datetime.utcnow().isoformat(),
            "environment": os.getenv('FLASK_ENV', 'development'),
            "features": {
                "user_api": hasattr(User, 'to_dict'),
                "webhooks": hasattr(Department, 'webhook_events') and hasattr(Department, 'webhooks_enabled')
            }
        }
        return jsonify(status)
        
    logger.info("Application created successfully with all fixes applied")
except Exception as e:
    logger.critical(f"Failed to create application with fixes: {str(e)}")
    logger.critical(traceback.format_exc())
    # Create a basic app without fixes for emergency access
    app = Flask(__name__)
    
    @app.route('/')
    def emergency_home():
        return "Emergency mode - application failed to start properly. Check logs."
        
    @app.route('/error')
    def error_details():
        return f"Error: {str(e)}"

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