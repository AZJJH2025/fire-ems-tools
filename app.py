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

# Global constants
METERS_PER_MILE = 1609.34

# Apply deployment fixes before importing models
import fix_deployment
fix_deployment.apply_fixes()

# Now import models after fixes have been applied
from database import db, Department, Incident, User, Station
from config import config

# Import test dashboard routes
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
try:
    import test_dashboard_routes
    has_test_dashboard = True
except ImportError:
    logger.warning("Test dashboard routes not available")
    has_test_dashboard = False

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
    # Get API key from header, query param, or form data
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        api_key = request.args.get('api_key')
    if not api_key:
        api_key = request.form.get('api_key')
        
    # If API key exists, use it as identity
    if api_key:
        # Only use the first part of the key to avoid exposing the full key in the limiter storage
        api_key_parts = api_key.split('_')
        if len(api_key_parts) > 1:
            return f"api_key_{api_key_parts[1]}"
        return f"api_key_{api_key[:8]}"
    
    # Fallback to IP address
    return get_remote_address()

# Create a safer limit decorator that won't fail in production
def safe_limit(limit_string, **kwargs):
    """A safer version of limiter.limit that won't fail if limiter is not working"""
    def decorator(f):
        try:
            # Try to use the real limiter with all passed arguments
            return limiter.limit(limit_string, **kwargs)(f)
        except Exception as e:
            # If it fails, just return the original function
            logger.warning(f"Rate limiting failed, continuing without limits: {str(e)}")
            return f
    return decorator

def require_api_key(f):
    """Decorator to require API key authentication for API endpoints
    
    This uses the safer version from fix_deployment when available,
    falling back to the original implementation if that fails.
    """
    # First try to use the safer version from fix_deployment
    try:
        return fix_deployment.require_api_key_safe(f)
    except Exception as e:
        logger.warning(f"Could not use safer API key decorator, falling back to original: {str(e)}")
        
        # Original implementation as fallback
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # Get API key from header, query param, or form data
                api_key = request.headers.get('X-API-Key')
                if not api_key:
                    api_key = request.args.get('api_key')
                if not api_key:
                    api_key = request.form.get('api_key')
                    
                if not api_key:
                    return jsonify({"error": "API key is required"}), 401
                    
                # Find department with matching API key
                department = Department.query.filter_by(api_key=api_key, api_enabled=True).first()
                if not department:
                    return jsonify({"error": "Invalid or disabled API key"}), 401
                    
                # Add department to kwargs
                kwargs['department'] = department
                return f(*args, **kwargs)
            except Exception as e:
                logger.error(f"Error in require_api_key: {str(e)}")
                return jsonify({"error": "Authentication error", "details": str(e)}), 500
        return decorated_function

def create_app(config_name='default'):
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
    
    # Authentication routes
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
    @login_required
    def logout():
        """User logout"""
        logout_user()
        flash('You have been logged out', 'success')
        return redirect(url_for('login'))
    
    # Home page route for the tool collection
    @app.route("/")
    def home():
        """Serve the home page with the tool collection."""
        try:
            return render_template("index.html")
        except jinja2.exceptions.TemplateNotFound:
            logger.error("Home template not found, using fallback")
            # Inline home page as fallback
            return '''
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Fire-EMS Tools</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                        color: #333;
                        background-color: #f5f8fa;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    header {
                        background-color: #3498db;
                        color: white;
                        padding: 1rem 0;
                        text-align: center;
                    }
                    h1 {
                        margin: 0;
                        padding: 0;
                    }
                    .hero {
                        background-color: #2c3e50;
                        color: white;
                        padding: 3rem 0;
                        text-align: center;
                        margin-bottom: 2rem;
                    }
                    .hero h2 {
                        font-size: 2.5rem;
                        margin-bottom: 1rem;
                    }
                    .hero p {
                        font-size: 1.2rem;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .features {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        margin-bottom: 3rem;
                    }
                    .feature {
                        flex: 0 0 calc(33.333% - 20px);
                        background-color: white;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        border-radius: 5px;
                        padding: 1.5rem;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .feature h3 {
                        color: #3498db;
                        margin-top: 0;
                    }
                    .btn {
                        display: inline-block;
                        background-color: #3498db;
                        color: white;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        margin-top: 10px;
                    }
                    .btn:hover {
                        background-color: #2980b9;
                    }
                    footer {
                        background-color: #2c3e50;
                        color: white;
                        text-align: center;
                        padding: 1rem 0;
                        margin-top: 2rem;
                    }
                    @media (max-width: 768px) {
                        .feature {
                            flex: 0 0 100%;
                        }
                    }
                </style>
            </head>
            <body>
                <header>
                    <div class="container">
                        <h1>Fire-EMS Tools</h1>
                    </div>
                </header>
                
                <div class="hero">
                    <div class="container">
                        <h2>Tools for Fire-EMS Professionals</h2>
                        <p>A comprehensive suite of tools designed to help Fire and EMS departments optimize operations and improve response times.</p>
                        <a href="/login" class="btn">Login</a>
                    </div>
                </div>
                
                <div class="container">
                    <div class="features">
                        <div class="feature">
                            <h3>Incident Logger</h3>
                            <p>Record and manage emergency incidents with detailed information.</p>
                            <a href="/incident-logger" class="btn">Open Tool</a>
                        </div>
                        <div class="feature">
                            <h3>Call Density Heatmap</h3>
                            <p>Visualize incident hotspots to optimize resource allocation.</p>
                            <a href="/call-density-heatmap" class="btn">Open Tool</a>
                        </div>
                        <div class="feature">
                            <h3>Isochrone Map</h3>
                            <p>Analyze response time coverage from your stations.</p>
                            <a href="/isochrone-map" class="btn">Open Tool</a>
                        </div>
                    </div>
                </div>
                
                <footer>
                    <div class="container">
                        <p>&copy; 2025 Fire-EMS Tools</p>
                    </div>
                </footer>
            </body>
            </html>
            '''
    
    # Admin routes
    @app.route('/admin')
    @login_required
    def admin_index():
        """Admin index - redirects to dashboard"""
        # Check if user is a super admin
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        return redirect(url_for('admin_dashboard'))
    
    @app.route('/admin/dashboard')
    @login_required
    def admin_dashboard():
        """Admin dashboard home"""
        # Check if user is a super admin
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        # Get stats for the dashboard
        departments_count = Department.query.count()
        users_count = User.query.count()
        incidents_count = Incident.query.count()
        
        try:
            return render_template('admin/dashboard.html', 
                                  departments_count=departments_count,
                                  users_count=users_count,
                                  incidents_count=incidents_count)
        except jinja2.exceptions.TemplateNotFound:
            app.logger.error("Template not found: admin/dashboard.html")
            # Fallback to inline HTML with basic functionality
            return f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Dashboard - FireEMS.ai</title>
                <link rel="stylesheet" href="/static/styles.css">
                <link rel="stylesheet" href="/static/admin-styles.css">
                <style>
                    .stats-container {{
                        display: flex;
                        flex-wrap: wrap;
                        gap: 20px;
                        margin-bottom: 30px;
                    }}
                    .stat-card {{
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        padding: 20px;
                        flex: 1;
                        min-width: 200px;
                        text-align: center;
                    }}
                    .stat-value {{
                        font-size: 2.5rem;
                        font-weight: bold;
                        color: #3498db;
                        margin: 10px 0;
                    }}
                    .stat-label {{
                        color: #7f8c8d;
                        font-size: 1rem;
                    }}
                </style>
            </head>
            <body>
                <header>
                    <div class="container">
                        <div class="header-content">
                            <div class="logo">
                                <i class="fas fa-fire-extinguisher"></i> FireEMS.ai Admin
                            </div>
                        </div>
                    </div>
                </header>
                
                <nav>
                    <div class="container">
                        <ul class="nav-list">
                            <li class="nav-item">
                                <a href="/admin/dashboard" class="nav-link active">Dashboard</a>
                            </li>
                            <li class="nav-item">
                                <a href="/admin/departments" class="nav-link">Departments</a>
                            </li>
                            <li class="nav-item">
                                <a href="/admin/users" class="nav-link">Users</a>
                            </li>
                            <li class="nav-item">
                                <a href="/admin/settings" class="nav-link">Settings</a>
                            </li>
                        </ul>
                    </div>
                </nav>
                
                <main class="container">
                    <div class="content-header">
                        <h1 class="content-title">Admin Dashboard</h1>
                        <p>Emergency mode: Template not found. Limited functionality available.</p>
                    </div>
                    
                    <div class="stats-container">
                        <div class="stat-card">
                            <div class="stat-value">{departments_count}</div>
                            <div class="stat-label">Departments</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{users_count}</div>
                            <div class="stat-label">Users</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{incidents_count}</div>
                            <div class="stat-label">Incidents</div>
                        </div>
                    </div>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px;">
                        <h2>Quick Links</h2>
                        <ul>
                            <li><a href="/admin/departments">Manage Departments</a></li>
                            <li><a href="/admin/users">Manage Users</a></li>
                            <li><a href="/admin/settings">System Settings</a></li>
                        </ul>
                    </div>
                </main>
            </body>
            </html>
            """
    
    @app.route('/admin/departments')
    @login_required
    def admin_departments_list():
        """List all departments"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
        
        try:    
            departments = Department.query.all()
            try:
                return render_template('admin/departments.html', departments=departments)
            except jinja2.exceptions.TemplateNotFound:
                app.logger.error("Template not found: admin/departments.html")
                # Fallback to inline HTML with error message
                return f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Admin - Departments</title>
                    <link rel="stylesheet" href="/static/styles.css">
                    <link rel="stylesheet" href="/static/admin-styles.css">
                </head>
                <body>
                    <h1>Admin - Departments</h1>
                    <p>Error: Template not found. Please check your deployment.</p>
                    <a href="/admin/dashboard">Return to Dashboard</a>
                </body>
                </html>
                """
        except Exception as e:
            app.logger.error(f"Error retrieving departments: {str(e)}")
            app.logger.error(traceback.format_exc())
            flash(f"Error retrieving departments: {str(e)}", 'error')
            return redirect(url_for('admin_dashboard'))
    
    @app.route('/admin/departments/register', methods=['GET', 'POST'])
    @login_required
    def admin_department_register():
        """Register a new department"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        if request.method == 'POST':
            try:
                # Extract form data
                form_data = request.form
                
                # Validate required fields
                required_fields = ['name', 'code', 'email', 'admin_name', 'admin_email', 'admin_password']
                for field in required_fields:
                    if not form_data.get(field):
                        flash(f"The field '{field}' is required.", 'error')
                        return render_template('admin/department-register.html')
                
                # Check if department code is already in use
                existing_dept = Department.query.filter_by(code=form_data.get('code')).first()
                if existing_dept:
                    flash(f"Department code '{form_data.get('code')}' is already in use. Please choose another code.", 'error')
                    return render_template('admin/department-register.html')
                
                # Check if admin email is already in use
                existing_user = User.query.filter_by(email=form_data.get('admin_email')).first()
                if existing_user:
                    flash(f"User with email '{form_data.get('admin_email')}' already exists.", 'error')
                    return render_template('admin/department-register.html')
                
                # Validate password confirmation
                if form_data.get('admin_password') != form_data.get('admin_password_confirm'):
                    flash("Admin passwords do not match.", 'error')
                    return render_template('admin/department-register.html')
                
                # Create new department
                department = Department(
                    name=form_data.get('name'),
                    code=form_data.get('code'),
                    department_type=form_data.get('department_type', 'combined'),
                    email=form_data.get('email'),
                    phone=form_data.get('phone'),
                    website=form_data.get('website'),
                    address=form_data.get('address'),
                    city=form_data.get('city'),
                    state=form_data.get('state'),
                    zip_code=form_data.get('zip_code'),
                    num_stations=int(form_data.get('num_stations', 1)),
                    num_personnel=int(form_data.get('num_personnel', 0)) if form_data.get('num_personnel') else None,
                    service_area=float(form_data.get('service_area', 0)) if form_data.get('service_area') else None,
                    population_served=int(form_data.get('population_served', 0)) if form_data.get('population_served') else None,
                    logo_url=form_data.get('logo_url'),
                    primary_color=form_data.get('primary_color', '#3498db'),
                    secondary_color=form_data.get('secondary_color', '#2c3e50')
                )
                
                # Create features dictionary from checkboxes
                features_enabled = {}
                for key, value in request.form.items():
                    if key.startswith('features_enabled.'):
                        feature_name = key.split('.')[1]
                        features_enabled[feature_name] = True
                    
                if features_enabled:
                    department.features_enabled = features_enabled
                
                # Save department
                db.session.add(department)
                db.session.flush()  # This gets the department ID without committing transaction
                
                # Create admin user for department
                admin_user = User(
                    department_id=department.id,
                    name=form_data.get('admin_name'),
                    email=form_data.get('admin_email'),
                    role='admin'
                )
                admin_user.set_password(form_data.get('admin_password'))
                
                db.session.add(admin_user)
                db.session.commit()
                
                flash(f"Department '{department.name}' has been registered successfully with admin user.", 'success')
                
                # Redirect to department view
                return redirect(url_for('admin_department_view', dept_id=department.id))
                
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error registering department: {str(e)}")
                app.logger.error(traceback.format_exc())
                # Re-render the form with error message
                flash(f"Error registering department: {str(e)}", 'error')
                try:
                    return render_template('admin/department-register.html')
                except jinja2.exceptions.TemplateNotFound:
                    # Fallback to inline HTML with error message
                    return f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Error - Department Registration</title>
                        <link rel="stylesheet" href="/static/styles.css">
                        <link rel="stylesheet" href="/static/admin-styles.css">
                    </head>
                    <body>
                        <h1>Error Registering Department</h1>
                        <p>An error occurred: {str(e)}</p>
                        <a href="/admin/departments">Return to Departments</a>
                    </body>
                    </html>
                    """
        
        # GET request - show the registration form
        try:
            return render_template('admin/department-register.html')
        except jinja2.exceptions.TemplateNotFound:
            app.logger.error("Template not found: admin/department-register.html")
            # Fallback to inline HTML with error message
            return f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin - Register Department</title>
                <link rel="stylesheet" href="/static/styles.css">
                <link rel="stylesheet" href="/static/admin-styles.css">
            </head>
            <body>
                <h1>Admin - Register Department</h1>
                <p>Error: Template not found. Please check your deployment.</p>
                <a href="/admin/departments">Return to Departments</a>
            </body>
            </html>
            """
    
    @app.route('/admin/departments/<int:dept_id>')
    @login_required
    def admin_department_view(dept_id):
        """View a specific department's details"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        try:
            department = Department.query.get_or_404(dept_id)
            try:
                return render_template('admin/department-view.html', department=department)
            except jinja2.exceptions.TemplateNotFound:
                app.logger.error("Template not found: admin/department-view.html")
                # Fallback to inline HTML with error message
                return f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Admin - Department Details</title>
                    <link rel="stylesheet" href="/static/styles.css">
                    <link rel="stylesheet" href="/static/admin-styles.css">
                </head>
                <body>
                    <h1>Admin - Department Details</h1>
                    <h2>{department.name} ({department.code})</h2>
                    <p>Error: Template not found. Please check your deployment.</p>
                    <a href="/admin/departments">Return to Departments</a>
                </body>
                </html>
                """
        except Exception as e:
            app.logger.error(f"Error retrieving department details: {str(e)}")
            app.logger.error(traceback.format_exc())
            flash(f"Error retrieving department details: {str(e)}", 'error')
            return redirect(url_for('admin_departments_list'))
    
    @app.route('/admin/departments/<int:dept_id>/edit', methods=['GET', 'POST'])
    @login_required
    def admin_department_edit(dept_id):
        """Edit a department"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
        
        try:    
            department = Department.query.get_or_404(dept_id)
            
            if request.method == 'POST':
                try:
                    # Extract form data & update department
                    form_data = request.form
                    
                    # Validate required fields
                    required_fields = ['name', 'code', 'email']
                    for field in required_fields:
                        if not form_data.get(field):
                            flash(f"The field '{field}' is required.", 'error')
                            return render_template('admin/department-edit.html', department=department)
                    
                    # Check if department code is already in use by another department
                    if form_data.get('code') != department.code:
                        existing_dept = Department.query.filter_by(code=form_data.get('code')).first()
                        if existing_dept:
                            flash(f"Department code '{form_data.get('code')}' is already in use. Please choose another code.", 'error')
                            return render_template('admin/department-edit.html', department=department)
                    
                    # Update department fields
                    department.name = form_data.get('name')
                    department.code = form_data.get('code')
                    department.department_type = form_data.get('department_type', 'combined')
                    department.email = form_data.get('email')
                    department.phone = form_data.get('phone')
                    department.website = form_data.get('website')
                    department.address = form_data.get('address')
                    department.city = form_data.get('city')
                    department.state = form_data.get('state')
                    department.zip_code = form_data.get('zip_code')
                    department.num_stations = int(form_data.get('num_stations', 1))
                    department.num_personnel = int(form_data.get('num_personnel', 0)) if form_data.get('num_personnel') else None
                    department.service_area = float(form_data.get('service_area', 0)) if form_data.get('service_area') else None
                    department.population_served = int(form_data.get('population_served', 0)) if form_data.get('population_served') else None
                    department.logo_url = form_data.get('logo_url')
                    department.primary_color = form_data.get('primary_color', '#3498db')
                    department.secondary_color = form_data.get('secondary_color', '#2c3e50')
                    
                    # Update features from checkboxes with feature_enabled prefix
                    features_enabled = {}
                    for key, value in request.form.items():
                        if key.startswith('features_enabled.'):
                            feature_name = key.split('.')[1]
                            features_enabled[feature_name] = True
                        
                    if features_enabled:
                        department.features_enabled = features_enabled
                    
                    # Update status
                    department.is_active = 'is_active' in request.form
                    department.setup_complete = 'setup_complete' in request.form
                    
                    # Save changes
                    db.session.commit()
                    
                    flash(f"Department '{department.name}' has been updated successfully", 'success')
                    
                    # Redirect to department view
                    return redirect(url_for('admin_department_view', dept_id=department.id))
                
                except Exception as e:
                    db.session.rollback()
                    app.logger.error(f"Error updating department: {str(e)}")
                    app.logger.error(traceback.format_exc())
                    flash(f"Error updating department: {str(e)}", 'error')
                    try:
                        return render_template('admin/department-edit.html', department=department)
                    except jinja2.exceptions.TemplateNotFound:
                        return f"""
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Error - Department Edit</title>
                            <link rel="stylesheet" href="/static/styles.css">
                            <link rel="stylesheet" href="/static/admin-styles.css">
                        </head>
                        <body>
                            <h1>Error Updating Department</h1>
                            <p>An error occurred: {str(e)}</p>
                            <a href="/admin/departments/{department.id}">Return to Department</a>
                        </body>
                        </html>
                        """
            
            # GET request - show edit form
            try:
                return render_template('admin/department-edit.html', department=department)
            except jinja2.exceptions.TemplateNotFound:
                app.logger.error("Template not found: admin/department-edit.html")
                # Fallback to inline HTML with error message
                return f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Admin - Edit Department</title>
                    <link rel="stylesheet" href="/static/styles.css">
                    <link rel="stylesheet" href="/static/admin-styles.css">
                </head>
                <body>
                    <h1>Admin - Edit Department</h1>
                    <h2>{department.name} ({department.code})</h2>
                    <p>Error: Template not found. Please check your deployment.</p>
                    <a href="/admin/departments/{department.id}">Return to Department</a>
                </body>
                </html>
                """
        
        except Exception as e:
            app.logger.error(f"Error retrieving department for editing: {str(e)}")
            app.logger.error(traceback.format_exc())
            flash(f"Error retrieving department for editing: {str(e)}", 'error')
            return redirect(url_for('admin_departments_list'))
            
    @app.route('/admin/departments/<int:dept_id>/delete', methods=['GET', 'POST'])
    @login_required
    def admin_department_delete(dept_id):
        """Delete a department (admin only)"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        try:
            department = Department.query.get_or_404(dept_id)
            
            if request.method == 'POST':
                try:
                    # Verify confirmation code
                    confirmation_code = request.form.get('confirmation_code')
                    if confirmation_code != department.code:
                        flash("Confirmation code does not match department code. Department was not deleted.", 'error')
                        return redirect(url_for('admin_department_view', dept_id=dept_id))
                    
                    # Get department name for flash message
                    dept_name = department.name
                    
                    # Delete all associated records
                    # Note: This assumes cascade delete is set up in the database
                    # If not, you'll need to delete related records manually
                    
                    # Delete the department
                    db.session.delete(department)
                    db.session.commit()
                    
                    flash(f"Department '{dept_name}' and all associated data has been deleted.", 'success')
                    return redirect(url_for('admin_departments_list'))
                    
                except Exception as e:
                    db.session.rollback()
                    app.logger.error(f"Error deleting department: {str(e)}")
                    app.logger.error(traceback.format_exc())
                    flash(f"Error deleting department: {str(e)}", 'error')
                    return redirect(url_for('admin_department_view', dept_id=dept_id))
            
            # GET request - show confirmation form
            try:
                return render_template('admin/department-delete.html', department=department)
            except jinja2.exceptions.TemplateNotFound:
                app.logger.error("Template not found: admin/department-delete.html")
                # Fallback to inline HTML with confirmation form
                return f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Admin - Delete Department</title>
                    <link rel="stylesheet" href="/static/styles.css">
                    <link rel="stylesheet" href="/static/admin-styles.css">
                    <style>
                        .delete-warning {{
                            color: #e74c3c;
                            background-color: #fadbd8;
                            padding: 1rem;
                            border-radius: 4px;
                            margin-bottom: 1.5rem;
                        }}
                        .confirmation-form {{
                            background-color: white;
                            padding: 2rem;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            max-width: 600px;
                            margin: 0 auto;
                        }}
                    </style>
                </head>
                <body>
                    <header>
                        <div class="container">
                            <div class="header-content">
                                <div class="logo">
                                    <i class="fas fa-fire-extinguisher"></i> FireEMS.ai Admin
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    <nav>
                        <div class="container">
                            <ul class="nav-list">
                                <li class="nav-item">
                                    <a href="/admin/dashboard" class="nav-link">Dashboard</a>
                                </li>
                                <li class="nav-item">
                                    <a href="/admin/departments" class="nav-link active">Departments</a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    
                    <main class="container">
                        <div class="content-header">
                            <h1 class="content-title">Delete Department</h1>
                            <a href="/admin/departments/{department.id}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left"></i> Back to Department
                            </a>
                        </div>
                        
                        <div class="confirmation-form">
                            <div class="delete-warning">
                                <h3><i class="fas fa-exclamation-triangle"></i> Warning: This action cannot be undone</h3>
                                <p>You are about to delete department <strong>{department.name}</strong> ({department.code}) and all associated data including:</p>
                                <ul>
                                    <li>All stations</li>
                                    <li>All users</li>
                                    <li>All incidents</li>
                                    <li>All department settings</li>
                                </ul>
                            </div>
                            
                            <form action="/admin/departments/{department.id}/delete" method="POST">
                                <div class="form-group">
                                    <label for="confirmation_code">To confirm, please enter the department code: <strong>{department.code}</strong></label>
                                    <input type="text" id="confirmation_code" name="confirmation_code" required>
                                </div>
                                
                                <div class="form-actions">
                                    <a href="/admin/departments/{department.id}" class="btn btn-secondary">Cancel</a>
                                    <button type="submit" class="btn btn-danger">Permanently Delete Department</button>
                                </div>
                            </form>
                        </div>
                    </main>
                </body>
                </html>
                """
                
        except Exception as e:
            app.logger.error(f"Error preparing department deletion: {str(e)}")
            app.logger.error(traceback.format_exc())
            flash(f"Error preparing department deletion: {str(e)}", 'error')
            return redirect(url_for('admin_departments_list'))
    
    # Admin Users Management
    @app.route('/admin/users')
    @login_required
    def admin_users_list():
        """List all users (admin only)"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        try:
            # Get all users, ordered by department
            users = User.query.join(Department).order_by(Department.name, User.name).all()
            departments = Department.query.all()
            
            try:
                return render_template('admin/users.html', users=users, departments=departments)
            except jinja2.exceptions.TemplateNotFound:
                app.logger.error("Template not found: admin/users.html")
                # Fallback to inline HTML with basic functionality
                users_html = ""
                for user in users:
                    dept_name = user.department.name if user.department else "No Department"
                    users_html += f"""
                    <tr>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{dept_name}</td>
                        <td>{'Active' if user.is_active else 'Inactive'}</td>
                    </tr>
                    """
                
                return f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Admin - Users</title>
                    <link rel="stylesheet" href="/static/styles.css">
                    <link rel="stylesheet" href="/static/admin-styles.css">
                </head>
                <body>
                    <header>
                        <div class="container">
                            <div class="header-content">
                                <div class="logo">
                                    <i class="fas fa-fire-extinguisher"></i> FireEMS.ai Admin
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    <nav>
                        <div class="container">
                            <ul class="nav-list">
                                <li class="nav-item">
                                    <a href="/admin/dashboard" class="nav-link">Dashboard</a>
                                </li>
                                <li class="nav-item">
                                    <a href="/admin/departments" class="nav-link">Departments</a>
                                </li>
                                <li class="nav-item">
                                    <a href="/admin/users" class="nav-link active">Users</a>
                                </li>
                                <li class="nav-item">
                                    <a href="/admin/settings" class="nav-link">Settings</a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    
                    <main class="container">
                        <div class="content-header">
                            <h1 class="content-title">Users</h1>
                            <p>Emergency mode: Template not found. Limited functionality available.</p>
                        </div>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Name</th>
                                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Email</th>
                                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Role</th>
                                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Department</th>
                                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users_html}
                                </tbody>
                            </table>
                        </div>
                    </main>
                </body>
                </html>
                """
        except Exception as e:
            app.logger.error(f"Error retrieving users: {str(e)}")
            app.logger.error(traceback.format_exc())
            flash(f"Error retrieving users: {str(e)}", 'error')
            return redirect(url_for('admin_dashboard'))
    
    # Admin Settings
    @app.route('/admin/settings')
    @login_required
    def admin_settings():
        """Admin settings page"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        try:
            try:
                return render_template('admin/settings.html')
            except jinja2.exceptions.TemplateNotFound:
                app.logger.error("Template not found: admin/settings.html")
                # Fallback to inline HTML with basic functionality
                return f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Admin - Settings</title>
                    <link rel="stylesheet" href="/static/styles.css">
                    <link rel="stylesheet" href="/static/admin-styles.css">
                </head>
                <body>
                    <header>
                        <div class="container">
                            <div class="header-content">
                                <div class="logo">
                                    <i class="fas fa-fire-extinguisher"></i> FireEMS.ai Admin
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    <nav>
                        <div class="container">
                            <ul class="nav-list">
                                <li class="nav-item">
                                    <a href="/admin/dashboard" class="nav-link">Dashboard</a>
                                </li>
                                <li class="nav-item">
                                    <a href="/admin/departments" class="nav-link">Departments</a>
                                </li>
                                <li class="nav-item">
                                    <a href="/admin/users" class="nav-link">Users</a>
                                </li>
                                <li class="nav-item">
                                    <a href="/admin/settings" class="nav-link active">Settings</a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    
                    <main class="container">
                        <div class="content-header">
                            <h1 class="content-title">System Settings</h1>
                            <p>Emergency mode: Template not found. Limited functionality available.</p>
                        </div>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px;">
                            <h2>System Information</h2>
                            <p>Version: 1.0.0</p>
                            <p>Database: SQLite</p>
                            <p>Environment: Production</p>
                            
                            <h2>Maintenance</h2>
                            <p>This section will allow system maintenance operations when fully implemented.</p>
                        </div>
                    </main>
                </body>
                </html>
                """
        except Exception as e:
            app.logger.error(f"Error loading settings page: {str(e)}")
            app.logger.error(traceback.format_exc())
            flash(f"Error loading settings page: {str(e)}", 'error')
            return redirect(url_for('admin_dashboard'))
    
    # Admin Tool Management
    @app.route('/admin/tools')
    @login_required
    def admin_tools():
        """Admin tools management page"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        # Get list of all tools and their status
        tools = [
            {
                "name": "Response Time Analyzer",
                "route": "fire-ems-dashboard",
                "icon": "stopwatch",
                "status": "ready",
                "enabled": True,
                "description": "Upload and analyze incident data to visualize response time patterns, identify bottlenecks, and improve performance metrics."
            },
            {
                "name": "Isochrone Map Generator",
                "route": "isochrone-map",
                "icon": "map",
                "status": "ready",
                "enabled": True,
                "description": "Create coverage area maps based on emergency response travel times to visualize and optimize response boundaries."
            },
            {
                "name": "Incident Logger",
                "route": "incident-logger",
                "icon": "clipboard-list",
                "status": "ready",
                "enabled": True,
                "description": "Streamlined incident data entry and management system with NFIRS compliance, validation, and export capabilities."
            },
            {
                "name": "Call Density Heatmap",
                "route": "call-density-heatmap",
                "icon": "fire",
                "status": "ready",
                "enabled": True,
                "description": "Visualize historical call data with customizable heatmaps to identify activity hotspots and optimize resource allocation."
            },
            {
                "name": "Coverage Gap Finder",
                "route": "coverage-gap-finder",
                "icon": "search-location",
                "status": "ready",
                "enabled": False,
                "description": "Identify underserved areas in your jurisdiction to optimize station locations and resource deployment."
            },
            {
                "name": "FireMapPro",
                "route": "fire-map-pro",
                "icon": "map-marked-alt",
                "status": "ready",
                "enabled": False,
                "description": "Advanced interactive map creator for fire department and EMS planning with multiple data layers."
            },
            {
                "name": "Data Formatter",
                "route": "data-formatter",
                "icon": "exchange-alt",
                "status": "ready", 
                "enabled": False,
                "description": "Convert, standardize, and prepare your data for seamless use with any FireEMS.ai tool."
            },
            {
                "name": "Station Overview",
                "route": "station-overview",
                "icon": "building",
                "status": "ready",
                "enabled": False,
                "description": "Comprehensive overview of station performance, unit utilization, and response metrics by station."
            }
        ]
        
        # Update tool status from session if available
        if 'tool_status' in session:
            tool_status = session['tool_status']
            for tool in tools:
                if tool['route'] in tool_status:
                    tool['enabled'] = tool_status[tool['route']]
        
        # Get usage statistics
        statistics = {
            "total_usage": 2856,
            "most_used": "Incident Logger",
            "most_used_count": 872,
            "avg_per_dept": 6.4,
            "new_activations": 12
        }
        
        try:
            return render_template('admin/tools.html', tools=tools, statistics=statistics)
        except jinja2.exceptions.TemplateNotFound:
            app.logger.error("Template not found: admin/tools.html")
            # Fallback to inline HTML with basic functionality
            return """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Tool Management</title>
                <link rel="stylesheet" href="/static/styles.css">
            </head>
            <body>
                <h1>Tool Management</h1>
                <p>The tool management template could not be found. Please check your deployment.</p>
                <a href="/admin/dashboard">Return to Dashboard</a>
            </body>
            </html>
            """
    
    @app.route('/admin/tools/usage')
    @login_required
    def admin_tools_usage():
        """Admin tools usage statistics page"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        # Get tool usage statistics - in a real app, this would come from a database
        tool_id = request.args.get('tool')
        
        # Sample data for the view
        tools = [
            {"name": "Response Time Analyzer", "id": "response-time-analyzer", "total_uses": 458, "departments": 12},
            {"name": "Isochrone Map Generator", "id": "isochrone-map", "total_uses": 386, "departments": 14},
            {"name": "Incident Logger", "id": "incident-logger", "total_uses": 872, "departments": 18},
            {"name": "Call Density Heatmap", "id": "call-density-heatmap", "total_uses": 321, "departments": 11},
            {"name": "Coverage Gap Finder", "id": "coverage-gap-finder", "total_uses": 214, "departments": 8},
            {"name": "FireMapPro", "id": "fire-map-pro", "total_uses": 189, "departments": 7},
            {"name": "Data Formatter", "id": "data-formatter", "total_uses": 276, "departments": 14},
            {"name": "Station Overview", "id": "station-overview", "total_uses": 140, "departments": 9}
        ]
        
        # Filter to specific tool if requested
        if tool_id:
            tools = [t for t in tools if t["id"] == tool_id]
            
        try:
            return render_template('admin/tools-usage.html', tools=tools, selected_tool=tool_id)
        except jinja2.exceptions.TemplateNotFound:
            app.logger.error("Template not found: admin/tools-usage.html")
            # Fallback to inline HTML with basic functionality
            return """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Tool Usage Statistics</title>
                <link rel="stylesheet" href="/static/styles.css">
            </head>
            <body>
                <h1>Tool Usage Statistics</h1>
                <p>The tool usage statistics template could not be found. Please check your deployment.</p>
                <a href="/admin/tools">Return to Tool Management</a>
            </body>
            </html>
            """
    
    # API endpoint to update tool status
    @app.route('/api/admin/tools/update_status', methods=['POST'])
    @login_required
    def update_tool_status():
        """Update the enabled status of a tool"""
        if not current_user.is_super_admin():
            return jsonify({"error": "Unauthorized"}), 403
            
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        tool_route = data.get('route')
        enabled = data.get('enabled', False)
        
        if not tool_route:
            return jsonify({"error": "Tool route is required"}), 400
            
        # For this implementation, we'll store tool status in a tool_status table in the database
        # But for now, we'll use a simple approach with Flask session since we don't 
        # have a proper tool model in the database
        
        # Initialize tool_status in session if it doesn't exist
        if 'tool_status' not in session:
            session['tool_status'] = {}
            
        # Update the tool status
        session['tool_status'][tool_route] = enabled
        session.modified = True
        
        # In a real app, this would update a database record
        
        return jsonify({
            "success": True, 
            "message": f"Tool {tool_route} has been {'enabled' if enabled else 'disabled'}",
            "route": tool_route, 
            "enabled": enabled
        })
    
    # Department routing
    @app.route('/dept/<dept_code>')
    @login_required
    def dept_home(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # If setup is not complete and user is admin, redirect to setup wizard
        if not department.setup_complete and (current_user.is_admin() or current_user.is_super_admin()):
            flash('Please complete the department setup', 'info')
            return redirect(url_for('dept_setup_wizard', dept_code=dept_code))
            
        return render_template('dept/home.html', department=department, user=current_user)
        
    @app.route('/dept/<dept_code>/setup', methods=['GET', 'POST'])
    @login_required
    def dept_setup_wizard(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Only admins can access the setup wizard
        if not current_user.is_admin() and not current_user.is_super_admin():
            flash('You do not have permission to setup the department', 'danger')
            return redirect(url_for('dept_home', dept_code=dept_code))
            
        # If setup is already complete, redirect to settings
        if department.setup_complete and request.method == 'GET':
            flash('Department setup is already complete. You can modify settings here.', 'info')
            return redirect(url_for('dept_settings', dept_code=dept_code))
        
        if request.method == 'POST':
            try:
                # Extract form data
                department.name = request.form.get('name')
                department.department_type = request.form.get('department_type', 'combined')
                department.email = request.form.get('email')
                department.phone = request.form.get('phone')
                department.website = request.form.get('website')
                department.address = request.form.get('address')
                department.city = request.form.get('city')
                department.state = request.form.get('state')
                department.zip_code = request.form.get('zip_code')
                
                # Convert numeric values
                num_stations = request.form.get('num_stations')
                department.num_stations = int(num_stations) if num_stations and num_stations.isdigit() else 1
                
                num_personnel = request.form.get('num_personnel')
                department.num_personnel = int(num_personnel) if num_personnel and num_personnel.isdigit() else None
                
                service_area = request.form.get('service_area')
                try:
                    department.service_area = float(service_area) if service_area else None
                except ValueError:
                    department.service_area = None
                
                population_served = request.form.get('population_served')
                department.population_served = int(population_served) if population_served and population_served.isdigit() else None
                
                # Branding & Appearance
                department.logo_url = request.form.get('logo_url')
                department.primary_color = request.form.get('primary_color', '#3498db')
                department.secondary_color = request.form.get('secondary_color', '#2c3e50')
                
                # Feature settings
                features_enabled = {}
                for key in ['incident_logger', 'call_density', 'isochrone_map', 'dashboard']:
                    features_enabled[key] = key in request.form
                department.features_enabled = features_enabled
                
                # Set setup_complete flag
                if 'setup_complete' in request.form:
                    department.setup_complete = True
                
                # Save changes
                db.session.commit()
                
                flash('Department setup completed successfully!', 'success')
                return redirect(url_for('dept_home', dept_code=dept_code))
                
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error in department setup: {str(e)}")
                app.logger.error(traceback.format_exc())
                flash(f'Error saving settings: {str(e)}', 'danger')
        
        # GET request - render setup wizard
        return render_template('dept/setup_wizard.html', department=department, user=current_user)
    
    # Department Dashboard
    @app.route('/dept/<dept_code>/dashboard')
    @login_required
    def dept_dashboard(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if feature is enabled for this department
        if not department.features_enabled.get('dashboard', True):
            flash('The Dashboard feature is not enabled for your department', 'warning')
            return redirect(url_for('dept_home', dept_code=dept_code))
        
        # Get department statistics
        incident_count = Incident.query.filter_by(department_id=department.id).count()
        station_count = Station.query.filter_by(department_id=department.id).count()
        user_count = User.query.filter_by(department_id=department.id).count()
        
        # Get recent incidents
        recent_incidents = Incident.query.filter_by(department_id=department.id).order_by(Incident.created_at.desc()).limit(5).all()
        
        return render_template('dept/dashboard.html', 
                              department=department, 
                              user=current_user,
                              incident_count=incident_count,
                              station_count=station_count,
                              user_count=user_count,
                              recent_incidents=recent_incidents)
    
    # Station Management
    @app.route('/dept/<dept_code>/stations')
    @login_required
    def dept_stations(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Get all stations for this department
        stations = Station.query.filter_by(department_id=department.id).all()
        
        return render_template('dept/stations.html', 
                              department=department, 
                              user=current_user,
                              stations=stations)
    
    @app.route('/dept/<dept_code>/stations/add', methods=['GET', 'POST'])
    @login_required
    def dept_add_station(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if user is admin
        if not current_user.is_admin() and not current_user.is_super_admin():
            flash('You do not have permission to add stations', 'danger')
            return redirect(url_for('dept_stations', dept_code=dept_code))
        
        if request.method == 'POST':
            try:
                # Extract station data from form
                name = request.form.get('name')
                station_number = request.form.get('station_number')
                address = request.form.get('address')
                city = request.form.get('city')
                state = request.form.get('state')
                zip_code = request.form.get('zip_code')
                personnel_count = request.form.get('personnel_count')
                
                # Validate required fields
                if not name or not station_number:
                    flash('Station name and number are required', 'danger')
                    return render_template('dept/station_form.html', department=department, user=current_user)
                
                # Check if station number already exists for this department
                existing_station = Station.query.filter_by(
                    department_id=department.id, 
                    station_number=station_number
                ).first()
                
                if existing_station:
                    flash(f'Station number {station_number} already exists', 'danger')
                    return render_template('dept/station_form.html', department=department, user=current_user)
                
                # Geocode address if provided
                latitude, longitude = None, None
                if address and city and state:
                    full_address = f"{address}, {city}, {state} {zip_code}"
                    latitude, longitude = geocode_address(full_address)
                
                # Create apparatus JSON object from form data
                apparatus = {}
                apparatus_types = ['engine', 'ladder', 'ambulance', 'rescue', 'tanker', 'brush', 'command']
                for apparatus_type in apparatus_types:
                    count = request.form.get(f'apparatus_{apparatus_type}')
                    if count and int(count) > 0:
                        apparatus[apparatus_type] = int(count)
                
                # Create new station
                new_station = Station(
                    department_id=department.id,
                    name=name,
                    station_number=station_number,
                    address=address,
                    city=city,
                    state=state,
                    zip_code=zip_code,
                    latitude=latitude,
                    longitude=longitude,
                    personnel_count=int(personnel_count) if personnel_count else 0,
                    apparatus=apparatus
                )
                
                db.session.add(new_station)
                db.session.commit()
                
                flash(f'Station {name} has been added successfully', 'success')
                return redirect(url_for('dept_stations', dept_code=dept_code))
                
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error adding station: {str(e)}")
                app.logger.error(traceback.format_exc())
                flash(f'Error adding station: {str(e)}', 'danger')
                return render_template('dept/station_form.html', department=department, user=current_user)
        
        # GET request - display form
        return render_template('dept/station_form.html', department=department, user=current_user)
    
    @app.route('/dept/<dept_code>/stations/<int:station_id>')
    @login_required
    def dept_view_station(dept_code, station_id):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Get the station
        station = Station.query.filter_by(id=station_id, department_id=department.id).first_or_404()
        
        return render_template('dept/station_view.html', 
                              department=department, 
                              user=current_user,
                              station=station)
    
    @app.route('/dept/<dept_code>/stations/<int:station_id>/edit', methods=['GET', 'POST'])
    @login_required
    def dept_edit_station(dept_code, station_id):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if user is admin
        if not current_user.is_admin() and not current_user.is_super_admin():
            flash('You do not have permission to edit stations', 'danger')
            return redirect(url_for('dept_view_station', dept_code=dept_code, station_id=station_id))
        
        # Get the station
        station = Station.query.filter_by(id=station_id, department_id=department.id).first_or_404()
        
        if request.method == 'POST':
            try:
                # Extract station data from form
                station.name = request.form.get('name')
                station.station_number = request.form.get('station_number')
                station.address = request.form.get('address')
                station.city = request.form.get('city')
                station.state = request.form.get('state')
                station.zip_code = request.form.get('zip_code')
                personnel_count = request.form.get('personnel_count')
                station.personnel_count = int(personnel_count) if personnel_count else 0
                
                # Check if station number already exists for this department (excluding this station)
                existing_station = Station.query.filter(
                    Station.department_id == department.id,
                    Station.station_number == station.station_number,
                    Station.id != station.id
                ).first()
                
                if existing_station:
                    flash(f'Station number {station.station_number} already exists', 'danger')
                    return render_template('dept/station_form.html', 
                                         department=department, 
                                         user=current_user,
                                         station=station)
                
                # Geocode address if changed
                if request.form.get('update_location') == 'true':
                    full_address = f"{station.address}, {station.city}, {station.state} {station.zip_code}"
                    station.latitude, station.longitude = geocode_address(full_address)
                
                # Update apparatus JSON object from form data
                apparatus = {}
                apparatus_types = ['engine', 'ladder', 'ambulance', 'rescue', 'tanker', 'brush', 'command']
                for apparatus_type in apparatus_types:
                    count = request.form.get(f'apparatus_{apparatus_type}')
                    if count and int(count) > 0:
                        apparatus[apparatus_type] = int(count)
                
                station.apparatus = apparatus
                
                db.session.commit()
                
                flash(f'Station {station.name} has been updated successfully', 'success')
                return redirect(url_for('dept_view_station', dept_code=dept_code, station_id=station.id))
                
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error updating station: {str(e)}")
                app.logger.error(traceback.format_exc())
                flash(f'Error updating station: {str(e)}', 'danger')
                return render_template('dept/station_form.html', 
                                     department=department, 
                                     user=current_user,
                                     station=station)
        
        # GET request - display form with station data
        return render_template('dept/station_form.html', 
                              department=department, 
                              user=current_user,
                              station=station)
    
    # User Management
    @app.route('/dept/<dept_code>/users')
    @login_required
    def dept_users(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if user is admin
        if not current_user.is_admin() and not current_user.is_super_admin():
            flash('You do not have permission to view user management', 'danger')
            return redirect(url_for('dept_home', dept_code=dept_code))
        
        # Get all users for this department
        users = User.query.filter_by(department_id=department.id).all()
        
        return render_template('dept/users.html', 
                              department=department, 
                              user=current_user,
                              users=users)
                              
    # Department Help Page
    @app.route('/dept/<dept_code>/help')
    @login_required
    def dept_help(dept_code):
        """Department help and documentation page"""
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        try:
            return render_template('dept/help.html', department=department, user=current_user)
        except jinja2.exceptions.TemplateNotFound:
            app.logger.error("Template not found: dept/help.html")
            # Create a fallback help page
            return f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Department Help - {department.name}</title>
                <link rel="stylesheet" href="/static/styles.css">
                <style>
                    .help-section {
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        padding: 20px;
                        margin-bottom: 20px;
                    }
                    .help-section h2 {
                        color: #3498db;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 10px;
                        margin-top: 0;
                    }
                    .help-topic {
                        margin-bottom: 30px;
                    }
                    .help-topic h3 {
                        color: #2c3e50;
                        margin-bottom: 10px;
                    }
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
                                <a href="/dept/{department.code}/incidents" class="nav-link">Incidents</a>
                            </li>
                            <li class="nav-item">
                                <a href="/dept/{department.code}/help" class="nav-link active">Help</a>
                            </li>
                        </ul>
                    </div>
                </nav>
                
                <main class="container">
                    <div class="content-header">
                        <h1 class="content-title">Help & Documentation</h1>
                    </div>
                    
                    <div class="help-section">
                        <h2>Getting Started</h2>
                        <div class="help-topic">
                            <h3>Navigating the Portal</h3>
                            <p>The department portal is organized into several sections accessible from the navigation menu:</p>
                            <ul>
                                <li><strong>Home</strong> - Overview of department features and quick links</li>
                                <li><strong>Dashboard</strong> - Statistics and visual representations of your department data</li>
                                <li><strong>Incidents</strong> - Log and manage incident reports</li>
                                <li><strong>Stations</strong> - Manage your department's stations and resources</li>
                                <li><strong>Users</strong> - Manage department users (admin only)</li>
                                <li><strong>Settings</strong> - Configure department preferences (admin only)</li>
                            </ul>
                        </div>
                        
                        <div class="help-topic">
                            <h3>User Roles</h3>
                            <p>The system has three user roles with different permissions:</p>
                            <ul>
                                <li><strong>Admin</strong> - Full access to all department features and settings</li>
                                <li><strong>Manager</strong> - Can view all data and manage incidents and stations</li>
                                <li><strong>User</strong> - Basic access to view and log incidents</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <h2>Features</h2>
                        
                        <div class="help-topic">
                            <h3>Incident Logger</h3>
                            <p>The Incident Logger allows you to record detailed information about emergency incidents:</p>
                            <ul>
                                <li>Record incident number, date, time, location, and type</li>
                                <li>Track resources dispatched and response times</li>
                                <li>Document patient information with HIPAA compliance</li>
                                <li>Upload images and additional files</li>
                            </ul>
                        </div>
                        
                        <div class="help-topic">
                            <h3>Call Density Heatmap</h3>
                            <p>Visualize incident hotspots across your service area:</p>
                            <ul>
                                <li>View geographic distribution of incidents</li>
                                <li>Filter by incident type, date range, and time of day</li>
                                <li>Identify high-activity areas for resource planning</li>
                            </ul>
                        </div>
                        
                        <div class="help-topic">
                            <h3>Isochrone Map</h3>
                            <p>Analyze response time coverage from your stations:</p>
                            <ul>
                                <li>Visualize 4, 8, and 12-minute response zones</li>
                                <li>Identify coverage gaps in your service area</li>
                                <li>Plan optimal locations for new stations</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <h2>Need More Help?</h2>
                        <p>If you need additional assistance, contact your department administrator or email support@fireems.ai.</p>
                    </div>
                </main>
            </body>
            </html>
            """
    
    # Department Webhook Settings
    @app.route('/dept/<dept_code>/webhooks', methods=['GET'])
    @login_required
    def dept_webhooks(dept_code):
        # Get department
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if user is admin
        if not current_user.is_admin() and not current_user.is_super_admin():
            flash('You do not have permission to access webhook settings', 'danger')
            return redirect(url_for('dept_home', dept_code=dept_code))
        
        return render_template('dept/webhooks.html', department=department, user=current_user)
    
    # Department Settings
    @app.route('/dept/<dept_code>/settings', methods=['GET', 'POST'])
    @login_required
    def dept_settings(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if user is admin
        if not current_user.is_admin() and not current_user.is_super_admin():
            flash('You do not have permission to modify department settings', 'danger')
            return redirect(url_for('dept_home', dept_code=dept_code))
        
        if request.method == 'POST':
            try:
                # Extract form data
                department.name = request.form.get('name')
                department.department_type = request.form.get('department_type', 'combined')
                department.email = request.form.get('email')
                department.phone = request.form.get('phone')
                department.website = request.form.get('website')
                department.address = request.form.get('address')
                department.city = request.form.get('city')
                department.state = request.form.get('state')
                department.zip_code = request.form.get('zip_code')
                
                # Convert numeric values
                num_stations = request.form.get('num_stations')
                department.num_stations = int(num_stations) if num_stations and num_stations.isdigit() else 1
                
                num_personnel = request.form.get('num_personnel')
                department.num_personnel = int(num_personnel) if num_personnel and num_personnel.isdigit() else None
                
                service_area = request.form.get('service_area')
                try:
                    department.service_area = float(service_area) if service_area else None
                except ValueError:
                    department.service_area = None
                
                population_served = request.form.get('population_served')
                department.population_served = int(population_served) if population_served and population_served.isdigit() else None
                
                # Branding & Appearance
                department.logo_url = request.form.get('logo_url')
                department.primary_color = request.form.get('primary_color', '#3498db')
                department.secondary_color = request.form.get('secondary_color', '#2c3e50')
                
                # Feature settings
                features_enabled = {}
                for key in ['incident_logger', 'call_density', 'isochrone_map', 'dashboard', 
                           'coverage_gap_finder', 'fire_map_pro', 'data_formatter', 'station_overview']:
                    features_enabled[key] = key in request.form
                department.features_enabled = features_enabled
                
                # API settings
                api_enabled = 'api_enabled' in request.form
                
                # Handle API key generation and regeneration
                if api_enabled:
                    # Generate a new API key if needed
                    if not department.api_key or request.form.get('generate_api_key') == 'true':
                        department.generate_api_key()
                    # Regenerate if requested
                    elif request.form.get('regenerate_api_key') == 'true':
                        department.generate_api_key()
                    # Make sure API is enabled
                    department.api_enabled = True
                else:
                    # Disable API if unchecked
                    department.api_enabled = False
                
                # Save changes
                db.session.commit()
                
                flash('Department settings have been updated successfully', 'success')
                return redirect(url_for('dept_settings', dept_code=dept_code))
                
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error updating department settings: {str(e)}")
                app.logger.error(traceback.format_exc())
                flash(f'Error updating settings: {str(e)}', 'danger')
        
        # GET request - render settings form
        return render_template('dept/settings.html', department=department, user=current_user)
    
    @app.route('/dept/<dept_code>/users/add', methods=['GET', 'POST'])
    @login_required
    def dept_add_user(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if user is admin
        if not current_user.is_admin() and not current_user.is_super_admin():
            flash('You do not have permission to add users', 'danger')
            return redirect(url_for('dept_users', dept_code=dept_code))
        
        if request.method == 'POST':
            try:
                # Extract user data from form
                name = request.form.get('name')
                email = request.form.get('email')
                password = request.form.get('password')
                role = request.form.get('role')
                
                # Validate required fields
                if not name or not email or not password:
                    flash('Name, email, and password are required', 'danger')
                    return render_template('dept/user_form.html', department=department, user=current_user)
                
                # Validate email format
                import re
                email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                if not re.match(email_pattern, email):
                    flash('Invalid email format', 'danger')
                    return render_template('dept/user_form.html', department=department, user=current_user)
                
                # Check if email already exists
                existing_user = User.query.filter_by(email=email).first()
                if existing_user:
                    flash('A user with that email already exists', 'danger')
                    return render_template('dept/user_form.html', department=department, user=current_user)
                
                # Validate role
                valid_roles = ['admin', 'manager', 'user']
                if role not in valid_roles:
                    role = 'user'  # Default to user if invalid role
                
                # Create new user
                new_user = User(
                    department_id=department.id,
                    name=name,
                    email=email,
                    role=role,
                    is_active=True
                )
                new_user.set_password(password)
                
                db.session.add(new_user)
                db.session.commit()
                
                flash(f'User {name} has been added successfully', 'success')
                return redirect(url_for('dept_users', dept_code=dept_code))
                
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error adding user: {str(e)}")
                app.logger.error(traceback.format_exc())
                flash(f'Error adding user: {str(e)}', 'danger')
                return render_template('dept/user_form.html', department=department, user=current_user)
        
        # GET request - display form
        return render_template('dept/user_form.html', department=department, user=current_user)
    
    @app.route('/dept/<dept_code>/users/<int:user_id>')
    @login_required
    def dept_view_user(dept_code, user_id):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if user is admin or viewing themselves
        if not current_user.is_admin() and not current_user.is_super_admin() and current_user.id != user_id:
            flash('You do not have permission to view other users', 'danger')
            return redirect(url_for('dept_home', dept_code=dept_code))
        
        # Get the user
        user_to_view = User.query.filter_by(id=user_id, department_id=department.id).first_or_404()
        
        return render_template('dept/user_view.html', 
                              department=department, 
                              user=current_user,
                              user_to_view=user_to_view)
    
    @app.route('/dept/<dept_code>/users/<int:user_id>/edit', methods=['GET', 'POST'])
    @login_required
    def dept_edit_user(dept_code, user_id):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if user is admin or editing themselves (but non-admins can't change roles)
        if not current_user.is_admin() and not current_user.is_super_admin() and current_user.id != user_id:
            flash('You do not have permission to edit other users', 'danger')
            return redirect(url_for('dept_home', dept_code=dept_code))
        
        # Get the user
        user_to_edit = User.query.filter_by(id=user_id, department_id=department.id).first_or_404()
        
        if request.method == 'POST':
            try:
                # Extract user data from form
                user_to_edit.name = request.form.get('name')
                
                # Only admins can change roles
                if (current_user.is_admin() or current_user.is_super_admin()) and request.form.get('role'):
                    valid_roles = ['admin', 'manager', 'user']
                    role = request.form.get('role')
                    if role in valid_roles:
                        user_to_edit.role = role
                
                # Update active status
                if current_user.is_admin() or current_user.is_super_admin():
                    user_to_edit.is_active = 'is_active' in request.form
                
                # Update email (check for uniqueness)
                new_email = request.form.get('email')
                if new_email != user_to_edit.email:
                    # Validate email format
                    import re
                    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                    if not re.match(email_pattern, new_email):
                        flash('Invalid email format', 'danger')
                        return render_template('dept/user_form.html', 
                                             department=department, 
                                             user=current_user,
                                             user_to_edit=user_to_edit)
                    
                    # Check if email already exists
                    existing_user = User.query.filter(
                        User.email == new_email,
                        User.id != user_to_edit.id
                    ).first()
                    if existing_user:
                        flash('A user with that email already exists', 'danger')
                        return render_template('dept/user_form.html', 
                                             department=department, 
                                             user=current_user,
                                             user_to_edit=user_to_edit)
                    
                    user_to_edit.email = new_email
                
                # Update password if provided
                new_password = request.form.get('password')
                if new_password and new_password.strip():
                    user_to_edit.set_password(new_password)
                
                db.session.commit()
                
                flash(f'User {user_to_edit.name} has been updated successfully', 'success')
                
                # Redirect based on who made the edit
                if current_user.id == user_to_edit.id:
                    return redirect(url_for('dept_view_user', dept_code=dept_code, user_id=user_id))
                else:
                    return redirect(url_for('dept_users', dept_code=dept_code))
                
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error updating user: {str(e)}")
                app.logger.error(traceback.format_exc())
                flash(f'Error updating user: {str(e)}', 'danger')
                return render_template('dept/user_form.html', 
                                     department=department, 
                                     user=current_user,
                                     user_to_edit=user_to_edit)
        
        # GET request - display form with user data
        return render_template('dept/user_form.html', 
                              department=department, 
                              user=current_user,
                              user_to_edit=user_to_edit)
    
    # Department-specific Incident Logger
    @app.route('/dept/<dept_code>/incident-logger')
    @login_required
    def dept_incident_logger(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if feature is enabled for this department
        if not department.features_enabled.get('incident_logger', True):
            flash('The Incident Logger feature is not enabled for your department', 'warning')
            return redirect(url_for('dept_home', dept_code=dept_code))
            
        return render_template('incident-logger.html', department=department, user=current_user)
        
    # Department-specific Call Density Map
    @app.route('/dept/<dept_code>/call-density')
    @login_required
    def dept_call_density(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if feature is enabled for this department
        if not department.features_enabled.get('call_density', True):
            flash('The Call Density feature is not enabled for your department', 'warning')
            return redirect(url_for('dept_home', dept_code=dept_code))
            
        return render_template('call-density-heatmap.html', department=department, user=current_user)
        
    # Department-specific Isochrone Map
    @app.route('/dept/<dept_code>/isochrone-map')
    @login_required
    def dept_isochrone_map(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if feature is enabled for this department
        if not department.features_enabled.get('isochrone_map', True):
            flash('The Isochrone Map feature is not enabled for your department', 'warning')
            return redirect(url_for('dept_home', dept_code=dept_code))
            
        return render_template('isochrone-map.html', department=department, user=current_user)
        
    # Department-specific Coverage Gap Finder
    @app.route('/dept/<dept_code>/coverage-gap-finder')
    @login_required
    def dept_coverage_gap_finder(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if feature is enabled for this department
        if not department.features_enabled.get('coverage_gap_finder', False):
            flash('The Coverage Gap Finder feature is not enabled for your department', 'warning')
            return redirect(url_for('dept_home', dept_code=dept_code))
            
        return render_template('coverage-gap-finder.html', department=department, user=current_user)
        
    # Department-specific FireMapPro
    @app.route('/dept/<dept_code>/fire-map-pro')
    @login_required
    def dept_fire_map_pro(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if feature is enabled for this department
        if not department.features_enabled.get('fire_map_pro', False):
            flash('The FireMapPro feature is not enabled for your department', 'warning')
            return redirect(url_for('dept_home', dept_code=dept_code))
            
        return render_template('fire-map-pro.html', department=department, user=current_user)
        
    # Department-specific Data Formatter
    @app.route('/dept/<dept_code>/data-formatter')
    @login_required
    def dept_data_formatter(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if feature is enabled for this department
        if not department.features_enabled.get('data_formatter', False):
            flash('The Data Formatter feature is not enabled for your department', 'warning')
            return redirect(url_for('dept_home', dept_code=dept_code))
            
        return render_template('data-formatter.html', department=department, user=current_user)
        
    # Department-specific Station Overview
    @app.route('/dept/<dept_code>/station-overview')
    @login_required
    def dept_station_overview(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Check if feature is enabled for this department
        if not department.features_enabled.get('station_overview', False):
            flash('The Station Overview feature is not enabled for your department', 'warning')
            return redirect(url_for('dept_home', dept_code=dept_code))
            
        return render_template('station-overview.html', department=department, user=current_user)
        
    # Department Reports
    @app.route('/dept/<dept_code>/reports')
    @login_required
    def dept_reports(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
        
        # For now, show a simple message that reports are coming soon
        flash('Reports functionality is coming soon!', 'info')
        return redirect(url_for('dept_home', dept_code=dept_code))
        
    # API Documentation
    @app.route('/dept/<dept_code>/api-docs')
    @login_required
    def dept_api_docs(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Only admins can access API docs
        if not current_user.is_admin() and not current_user.is_super_admin():
            flash('You do not have permission to view API documentation', 'danger')
            return redirect(url_for('dept_home', dept_code=dept_code))
        
        return render_template('dept/api_docs.html', department=department, user=current_user)
    
    # API to save an incident (via login)
    @app.route('/api/dept/<dept_code>/incidents', methods=['POST'])
    @login_required
    def save_incident(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            return jsonify({"error": "You are not authorized to access this resource"}), 403
            
        try:
            form_data = request.json
            if not form_data:
                return jsonify({"error": "No data provided"}), 400
                
            # Add user information to the incident
            form_data['user_id'] = current_user.id
            form_data['user_name'] = current_user.name
                
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
    
    # API to get all incidents for a department (via login)
    @app.route('/api/dept/<dept_code>/incidents', methods=['GET'])
    @login_required
    def get_incidents(dept_code):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            return jsonify({"error": "You are not authorized to access this resource"}), 403
            
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
            
    # API Endpoints with API Key Authentication
    
    # API endpoint to get department info
    @app.route('/api/v1/department', methods=['GET'])
    @require_api_key
    @safe_limit("100/hour;30/minute", key_func=get_api_key_identity)
    def api_get_department_info(department):
        """Get department information using API key authentication"""
        try:
            return jsonify({
                "success": True,
                "department": department.to_dict()
            })
        except Exception as e:
            app.logger.error(f"Error retrieving department info: {str(e)}")
            app.logger.error(traceback.format_exc())
            return jsonify({"error": str(e)}), 500
    
    # API endpoint to get all incidents
    @app.route('/api/v1/incidents', methods=['GET'])
    @require_api_key
    @safe_limit("100/hour;20/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("300/hour;60/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("50/hour;10/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("100/hour;30/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("300/hour;60/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("30/hour;5/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("100/hour;20/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("300/hour;60/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("30/hour;5/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("50/hour;10/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("100/hour;20/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("30/hour;5/minute", key_func=get_api_key_identity)
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
    @require_api_key
    @safe_limit("10/hour;2/minute", key_func=get_api_key_identity)
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
    @login_required
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
    @app.route('/dept/<dept_code>/incidents/<int:incident_id>')
    @login_required
    def dept_view_incident(dept_code, incident_id):
        """View a specific incident"""
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            abort(403)  # Forbidden
            
        # Get the incident
        incident = Incident.query.filter_by(id=incident_id, department_id=department.id).first_or_404()
        
        try:
            return render_template('dept/incident_view.html', 
                                  department=department, 
                                  user=current_user,
                                  incident=incident)
        except jinja2.exceptions.TemplateNotFound:
            app.logger.error("Template not found: dept/incident_view.html")
            # Generate a fallback template
            incident_date = incident.incident_date.strftime('%m/%d/%Y %I:%M %p') if incident.incident_date else 'Unknown'
            
            # Format the address
            address_parts = []
            if incident.address:
                address_parts.append(incident.address)
            if incident.city:
                address_parts.append(incident.city)
            if incident.state:
                address_parts.append(incident.state)
            if incident.zip_code:
                address_parts.append(incident.zip_code)
            
            location = ", ".join(address_parts) if address_parts else "No address recorded"
            
            return f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Incident {incident.incident_number} - {department.name}</title>
                <link rel="stylesheet" href="/static/styles.css">
                <style>
                    .incident-details {{
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        padding: 20px;
                        margin-bottom: 20px;
                    }}
                    .incident-section {{
                        margin-bottom: 20px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #eee;
                    }}
                    .incident-section:last-child {{
                        border-bottom: none;
                    }}
                    .field-group {{
                        margin-bottom: 15px;
                    }}
                    .field-label {{
                        font-weight: bold;
                        color: #7f8c8d;
                        margin-bottom: 5px;
                    }}
                    .field-value {{
                        font-size: 1.1em;
                    }}
                    .map-container {{
                        height: 300px;
                        border-radius: 8px;
                        overflow: hidden;
                        margin-top: 10px;
                    }}
                    .no-map {{
                        height: 300px;
                        border-radius: 8px;
                        background-color: #ecf0f1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #7f8c8d;
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
                                <a href="/dept/{department.code}/incidents" class="nav-link">Incidents</a>
                            </li>
                            <li class="nav-item">
                                <a href="/dept/{department.code}/help" class="nav-link">Help</a>
                            </li>
                        </ul>
                    </div>
                </nav>
                
                <main class="container">
                    <div class="content-header">
                        <h1 class="content-title">Incident Report: {incident.incident_number or 'No Number'}</h1>
                        <div>
                            <a href="/dept/{department.code}/incidents" class="btn btn-secondary">
                                <i class="fas fa-arrow-left"></i> Back to Incidents
                            </a>
                            <a href="/dept/{department.code}/incidents/{incident.id}/edit" class="btn btn-primary">
                                <i class="fas fa-edit"></i> Edit Incident
                            </a>
                        </div>
                    </div>
                    
                    <div class="incident-details">
                        <div class="incident-section">
                            <h2>Basic Information</h2>
                            <div class="field-group">
                                <div class="field-label">Incident Title</div>
                                <div class="field-value">{incident.incident_title or 'No title'}</div>
                            </div>
                            <div class="field-group">
                                <div class="field-label">Incident Number</div>
                                <div class="field-value">{incident.incident_number or 'No number assigned'}</div>
                            </div>
                            <div class="field-group">
                                <div class="field-label">Date/Time</div>
                                <div class="field-value">{incident_date}</div>
                            </div>
                            <div class="field-group">
                                <div class="field-label">Incident Type</div>
                                <div class="field-value">{incident.incident_type or 'Unknown'}</div>
                            </div>
                            <div class="field-group">
                                <div class="field-label">Priority</div>
                                <div class="field-value">{incident.priority or 'Not specified'}</div>
                            </div>
                            <div class="field-group">
                                <div class="field-label">Status</div>
                                <div class="field-value">{incident.status or 'Unknown'}</div>
                            </div>
                        </div>
                        
                        <div class="incident-section">
                            <h2>Location</h2>
                            <div class="field-group">
                                <div class="field-label">Address</div>
                                <div class="field-value">{location}</div>
                            </div>
                            <div class="field-group">
                                <div class="field-label">Location Details</div>
                                <div class="field-value">{incident.location_details or 'No additional details'}</div>
                            </div>
                            <div class="field-group">
                                <div class="field-label">Map</div>
                                <div class="field-value">
                                    {'<div class="map-container" id="map"></div>' if incident.latitude and incident.longitude else '<div class="no-map">No location coordinates available</div>'}
                                </div>
                            </div>
                        </div>
                        
                        <div class="incident-section">
                            <h2>Description</h2>
                            <div class="field-value">
                                {incident.description or 'No description provided'}
                            </div>
                        </div>
                        
                        <div class="incident-section">
                            <h2>Response Details</h2>
                            <div class="field-group">
                                <div class="field-label">Units Dispatched</div>
                                <div class="field-value">{incident.units_dispatched or 'No units recorded'}</div>
                            </div>
                            <div class="field-group">
                                <div class="field-label">First Unit Arrival</div>
                                <div class="field-value">
                                    {incident.first_unit_arrived.strftime('%m/%d/%Y %I:%M %p') if incident.first_unit_arrived else 'Not recorded'}
                                </div>
                            </div>
                            <div class="field-group">
                                <div class="field-label">Incident Commander</div>
                                <div class="field-value">{incident.incident_commander or 'Not specified'}</div>
                            </div>
                        </div>
                        
                        <div class="incident-section">
                            <h2>Additional Information</h2>
                            <div class="field-value">
                                {incident.additional_info or 'No additional information provided'}
                            </div>
                        </div>
                        
                        <div class="incident-section">
                            <h2>Record Information</h2>
                            <div class="field-group">
                                <div class="field-label">Created By</div>
                                <div class="field-value">{incident.user_name or 'System'}</div>
                            </div>
                            <div class="field-group">
                                <div class="field-label">Created Date</div>
                                <div class="field-value">
                                    {incident.created_at.strftime('%m/%d/%Y %I:%M %p') if incident.created_at else 'Unknown'}
                                </div>
                            </div>
                            <div class="field-group">
                                <div class="field-label">Last Updated</div>
                                <div class="field-value">
                                    {incident.updated_at.strftime('%m/%d/%Y %I:%M %p') if incident.updated_at else 'Never updated'}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                
                # Map initialization script was removed to fix syntax error
            </body>
            </html>
            """
            
    # API to get a specific incident
    @app.route('/api/dept/<dept_code>/incidents/<int:incident_id>', methods=['GET'])
    @login_required
    def get_incident(dept_code, incident_id):
        department = Department.query.filter_by(code=dept_code).first_or_404()
        
        # Check if user belongs to this department unless they are super_admin
        if not current_user.is_super_admin() and current_user.department_id != department.id:
            return jsonify({"error": "You are not authorized to access this resource"}), 403
            
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
    def calculate_station_metrics(stations, incidents):
        """
        Calculate metrics for all stations based on incident data
        
        Args:
            stations (list): List of station dictionaries
            incidents (list): List of incident dictionaries
            
        Returns:
            dict: Calculated metrics
        """
        # Initialize metrics structure
        metrics = {
            'response_times': {
                'average': 0,
                'percentile_90': 0
            },
            'call_volume': {
                'total': len(incidents),
                'by_type': {}
            },
            'unit_utilization': {
                'average': 0,
                'max': 0,
                'min': 0
            }
        }
        
        # Calculate call volume by type
        call_types = [inc.get('incident_type') for inc in incidents if inc.get('incident_type')]
        type_counts = Counter(call_types)
        metrics['call_volume']['by_type'] = dict(type_counts)
        
        # Calculate response times
        response_times = []
        
        for incident in incidents:
            if incident.get('dispatch_time') and incident.get('arrival_time'):
                try:
                    dispatch_time = datetime.fromisoformat(incident['dispatch_time'])
                    arrival_time = datetime.fromisoformat(incident['arrival_time'])
                    
                    # Response time in seconds
                    response_time = (arrival_time - dispatch_time).total_seconds()
                    if response_time > 0:  # Avoid negative times due to data errors
                        response_times.append(response_time)
                except (ValueError, TypeError):
                    continue
        
        if response_times:
            metrics['response_times']['average'] = sum(response_times) / len(response_times)
            metrics['response_times']['percentile_90'] = np.percentile(response_times, 90) if len(response_times) >= 10 else 0
        
        # Calculate unit utilization
        unit_times = defaultdict(float)
        unit_counts = defaultdict(int)
        
        for incident in incidents:
            if incident.get('unit_id') and incident.get('dispatch_time') and incident.get('clear_time'):
                try:
                    unit_id = incident['unit_id']
                    dispatch_time = datetime.fromisoformat(incident['dispatch_time'])
                    clear_time = datetime.fromisoformat(incident['clear_time'])
                    
                    # Incident duration in hours
                    duration = (clear_time - dispatch_time).total_seconds() / 3600.0
                    if duration > 0:  # Avoid negative times due to data errors
                        unit_times[unit_id] += duration
                        unit_counts[unit_id] += 1
                except (ValueError, TypeError):
                    continue
        
        # Calculate utilization percentages (based on 24-hour day)
        utilization_percentages = []
        for unit_id, total_time in unit_times.items():
            # Calculate percentage based on a 24-hour day over the period
            # Here we simplify and just calculate percentage of a full day
            utilization_percentage = (total_time / 24.0) * 100
            utilization_percentages.append(utilization_percentage)
        
        if utilization_percentages:
            metrics['unit_utilization']['average'] = sum(utilization_percentages) / len(utilization_percentages)
            metrics['unit_utilization']['max'] = max(utilization_percentages)
            metrics['unit_utilization']['min'] = min(utilization_percentages)
        
        return metrics

    def calculate_single_station_metrics(station, incidents):
        """
        Calculate metrics for a single station
        
        Args:
            station (dict): Station dictionary
            incidents (list): List of incident dictionaries for this station
            
        Returns:
            dict: Calculated metrics for this station
        """
        # Initialize metrics structure
        metrics = {
            'response_times': {
                'average': 0,
                'percentile_90': 0,
                'turnout_time': 0,
                'travel_time': 0
            },
            'call_volume': {
                'total': len(incidents),
                'by_type': {},
                'primary_type': 'N/A'
            },
            'busiest_times': {
                'hour': 0,
                'day': 'N/A',
                'month': 'N/A'
            }
        }
        
        # Calculate call volume by type
        call_types = [inc.get('incident_type') for inc in incidents if inc.get('incident_type')]
        type_counts = Counter(call_types)
        metrics['call_volume']['by_type'] = dict(type_counts)
        
        # Determine primary incident type
        if type_counts:
            metrics['call_volume']['primary_type'] = type_counts.most_common(1)[0][0]
        
        # Calculate response times
        response_times = []
        turnout_times = []
        travel_times = []
        
        for incident in incidents:
            # Calculate response time (dispatch to arrival)
            if incident.get('dispatch_time') and incident.get('arrival_time'):
                try:
                    dispatch_time = datetime.fromisoformat(incident['dispatch_time'])
                    arrival_time = datetime.fromisoformat(incident['arrival_time'])
                    
                    # Response time in seconds
                    response_time = (arrival_time - dispatch_time).total_seconds()
                    if response_time > 0:  # Avoid negative times due to data errors
                        response_times.append(response_time)
                except (ValueError, TypeError):
                    pass
            
            # Calculate turnout time (dispatch to en route)
            if incident.get('dispatch_time') and incident.get('en_route_time'):
                try:
                    dispatch_time = datetime.fromisoformat(incident['dispatch_time'])
                    en_route_time = datetime.fromisoformat(incident['en_route_time'])
                    
                    # Turnout time in seconds
                    turnout_time = (en_route_time - dispatch_time).total_seconds()
                    if turnout_time > 0:  # Avoid negative times due to data errors
                        turnout_times.append(turnout_time)
                except (ValueError, TypeError):
                    pass
            
            # Calculate travel time (en route to arrival)
            if incident.get('en_route_time') and incident.get('arrival_time'):
                try:
                    en_route_time = datetime.fromisoformat(incident['en_route_time'])
                    arrival_time = datetime.fromisoformat(incident['arrival_time'])
                    
                    # Travel time in seconds
                    travel_time = (arrival_time - en_route_time).total_seconds()
                    if travel_time > 0:  # Avoid negative times due to data errors
                        travel_times.append(travel_time)
                except (ValueError, TypeError):
                    pass
        
        if response_times:
            metrics['response_times']['average'] = sum(response_times) / len(response_times)
            metrics['response_times']['percentile_90'] = np.percentile(response_times, 90) if len(response_times) >= 10 else 0
        
        if turnout_times:
            metrics['response_times']['turnout_time'] = sum(turnout_times) / len(turnout_times)
        
        if travel_times:
            metrics['response_times']['travel_time'] = sum(travel_times) / len(travel_times)
        
        # Calculate busiest times
        hours = []
        days = []
        months = []
        
        for incident in incidents:
            if incident.get('dispatch_time'):
                try:
                    dispatch_time = datetime.fromisoformat(incident['dispatch_time'])
                    hours.append(dispatch_time.hour)
                    days.append(dispatch_time.strftime('%A'))  # Day name
                    months.append(dispatch_time.strftime('%B'))  # Month name
                except (ValueError, TypeError):
                    pass
        
        if hours:
            hour_counts = Counter(hours)
            metrics['busiest_times']['hour'] = hour_counts.most_common(1)[0][0]
        
        if days:
            day_counts = Counter(days)
            metrics['busiest_times']['day'] = day_counts.most_common(1)[0][0]
        
        if months:
            month_counts = Counter(months)
            metrics['busiest_times']['month'] = month_counts.most_common(1)[0][0]
        
        return metrics

    def calculate_unit_utilization(stations, incidents):
        """
        Calculate unit utilization metrics
        
        Args:
            stations (list): List of station dictionaries
            incidents (list): List of incident dictionaries
            
        Returns:
            list: Unit utilization data
        """
        # Get all unique units
        all_units = set()
        station_units = {}
        
        for station in stations:
            station_id = station.get('station_id')
            units = station.get('units', [])
            
            for unit in units:
                all_units.add(unit)
                station_units[unit] = station_id
        
        # Calculate utilization for each unit
        unit_data = []
        
        for unit_id in all_units:
            # Get incidents for this unit
            unit_incidents = [inc for inc in incidents if inc.get('unit_id') == unit_id]
            total_incidents = len(unit_incidents)
            
            # Calculate total time spent on incidents
            total_time = 0
            valid_incidents = 0
            
            for incident in unit_incidents:
                if incident.get('dispatch_time') and incident.get('clear_time'):
                    try:
                        dispatch_time = datetime.fromisoformat(incident['dispatch_time'])
                        clear_time = datetime.fromisoformat(incident['clear_time'])
                        
                        # Incident duration in hours
                        duration = (clear_time - dispatch_time).total_seconds() / 3600.0
                        if duration > 0:  # Avoid negative times due to data errors
                            total_time += duration
                            valid_incidents += 1
                    except (ValueError, TypeError):
                        continue
            
            # Calculate utilization percentage (based on 24-hour day)
            utilization_percentage = (total_time / 24.0) * 100 if total_time > 0 else 0
            
            # Add unit data
            unit_data.append({
                'unit_id': unit_id,
                'station_id': station_units.get(unit_id, 'Unknown'),
                'utilization_percentage': round(utilization_percentage, 1),
                'total_time': round(total_time, 1),
                'total_incidents': total_incidents,
                'valid_incidents': valid_incidents
            })
        
        # Sort by utilization percentage (descending)
        unit_data.sort(key=lambda x: x['utilization_percentage'], reverse=True)
        
        return unit_data

    def calculate_response_times(stations, incidents):
        """
        Calculate detailed response time analysis
        
        Args:
            stations (list): List of station dictionaries
            incidents (list): List of incident dictionaries
            
        Returns:
            dict: Response time analysis
        """
        # Initialize response times structure
        response_time_data = {
            'average': 0,
            'by_station': [],
            'by_priority': [],
            'by_call_type': []
        }
        
        # Calculate overall average response time
        all_response_times = []
        
        for incident in incidents:
            if incident.get('dispatch_time') and incident.get('arrival_time'):
                try:
                    dispatch_time = datetime.fromisoformat(incident['dispatch_time'])
                    arrival_time = datetime.fromisoformat(incident['arrival_time'])
                    
                    # Response time in seconds
                    response_time = (arrival_time - dispatch_time).total_seconds()
                    if response_time > 0:  # Avoid negative times due to data errors
                        all_response_times.append(response_time)
                except (ValueError, TypeError):
                    continue
        
        if all_response_times:
            response_time_data['average'] = sum(all_response_times) / len(all_response_times)
        
        # Calculate response times by station
        station_ids = [station.get('station_id') for station in stations]
        
        for station_id in station_ids:
            # Get incidents for this station
            station_incidents = [inc for inc in incidents if inc.get('station_id') == station_id]
            
            if not station_incidents:
                continue
            
            # Calculate response time components
            turnout_times = []
            travel_times = []
            total_times = []
            
            for incident in station_incidents:
                # Calculate turnout time (dispatch to en route)
                if incident.get('dispatch_time') and incident.get('en_route_time'):
                    try:
                        dispatch_time = datetime.fromisoformat(incident['dispatch_time'])
                        en_route_time = datetime.fromisoformat(incident['en_route_time'])
                        
                        # Turnout time in seconds
                        turnout_time = (en_route_time - dispatch_time).total_seconds()
                        if turnout_time > 0:  # Avoid negative times due to data errors
                            turnout_times.append(turnout_time)
                    except (ValueError, TypeError):
                        pass
                
                # Calculate travel time (en route to arrival)
                if incident.get('en_route_time') and incident.get('arrival_time'):
                    try:
                        en_route_time = datetime.fromisoformat(incident['en_route_time'])
                        arrival_time = datetime.fromisoformat(incident['arrival_time'])
                        
                        # Travel time in seconds
                        travel_time = (arrival_time - en_route_time).total_seconds()
                        if travel_time > 0:  # Avoid negative times due to data errors
                            travel_times.append(travel_time)
                    except (ValueError, TypeError):
                        pass
                
                # Calculate total response time (dispatch to arrival)
                if incident.get('dispatch_time') and incident.get('arrival_time'):
                    try:
                        dispatch_time = datetime.fromisoformat(incident['dispatch_time'])
                        arrival_time = datetime.fromisoformat(incident['arrival_time'])
                        
                        # Total response time in seconds
                        total_time = (arrival_time - dispatch_time).total_seconds()
                        if total_time > 0:  # Avoid negative times due to data errors
                            total_times.append(total_time)
                    except (ValueError, TypeError):
                        pass
            
            # Calculate averages
            avg_turnout = sum(turnout_times) / len(turnout_times) if turnout_times else 0
            avg_travel = sum(travel_times) / len(travel_times) if travel_times else 0
            avg_total = sum(total_times) / len(total_times) if total_times else 0
            
            # Add to response times by station
            response_time_data['by_station'].append({
                'station_id': station_id,
                'turnout_time': avg_turnout,
                'travel_time': avg_travel,
                'total_response_time': avg_total
            })
        
        # Calculate response times by priority
        priorities = set(inc.get('priority') for inc in incidents if inc.get('priority'))
        
        for priority in priorities:
            # Get incidents for this priority
            priority_incidents = [inc for inc in incidents if inc.get('priority') == priority]
            
            if not priority_incidents:
                continue
            
            # Calculate average response time
            priority_times = []
            
            for incident in priority_incidents:
                if incident.get('dispatch_time') and incident.get('arrival_time'):
                    try:
                        dispatch_time = datetime.fromisoformat(incident['dispatch_time'])
                        arrival_time = datetime.fromisoformat(incident['arrival_time'])
                        
                        # Response time in seconds
                        response_time = (arrival_time - dispatch_time).total_seconds()
                        if response_time > 0:  # Avoid negative times due to data errors
                            priority_times.append(response_time)
                    except (ValueError, TypeError):
                        pass
            
            if priority_times:
                avg_time = sum(priority_times) / len(priority_times)
                
                # Add to response times by priority
                response_time_data['by_priority'].append({
                    'priority': priority,
                    'average_response_time': avg_time
                })
        
        # Calculate response times by call type
        call_types = set(inc.get('incident_type') for inc in incidents if inc.get('incident_type'))
        
        for call_type in call_types:
            # Get incidents for this call type
            type_incidents = [inc for inc in incidents if inc.get('incident_type') == call_type]
            
            if not type_incidents:
                continue
            
            # Calculate average response time
            type_times = []
            
            for incident in type_incidents:
                if incident.get('dispatch_time') and incident.get('arrival_time'):
                    try:
                        dispatch_time = datetime.fromisoformat(incident['dispatch_time'])
                        arrival_time = datetime.fromisoformat(incident['arrival_time'])
                        
                        # Response time in seconds
                        response_time = (arrival_time - dispatch_time).total_seconds()
                        if response_time > 0:  # Avoid negative times due to data errors
                            type_times.append(response_time)
                    except (ValueError, TypeError):
                        pass
            
            if type_times:
                avg_time = sum(type_times) / len(type_times)
                
                # Add to response times by call type
                response_time_data['by_call_type'].append({
                    'type': call_type,
                    'average_response_time': avg_time
                })
        
        # Sort results
        response_time_data['by_station'].sort(key=lambda x: x['total_response_time'])
        response_time_data['by_priority'].sort(key=lambda x: x['average_response_time'])
        response_time_data['by_call_type'].sort(key=lambda x: x['average_response_time'])
        
        return response_time_data
    
    # Coverage Gap Finder helper functions
    def calculate_coverage_gaps(stations, boundary=None, response_time=4, travel_speed=25, turnout_time=1.0):
        """
        Calculate coverage gaps based on station locations and parameters
        
        Args:
            stations (list): List of station dictionaries with coordinates
            boundary (dict, optional): GeoJSON boundary of the jurisdiction
            response_time (float): Target response time in minutes
            travel_speed (float): Average travel speed in mph
            turnout_time (float): Turnout time in minutes
            
        Returns:
            dict: Coverage analysis with gaps and statistics
        """
        # Initialize result structure
        result = {
            'coverage_areas': [],
            'gap_areas': [],
            'stats': {
                'total_area': 0,
                'covered_area': 0,
                'coverage_percentage': 0,
                'population_covered': 0,
                'population_percentage': 0,
            }
        }
        
        # Skip calculations if no stations
        if not stations:
            return result
        
        # Calculate travel distance based on response time and speed
        # response_time = turnout_time + travel_time, so travel_time = response_time - turnout_time
        travel_time = max(0, response_time - turnout_time)  # Travel time in minutes
        travel_distance = (travel_time / 60) * travel_speed  # Distance in miles
        
        # Convert to meters for GeoJSON calculations
        travel_distance_meters = travel_distance * METERS_PER_MILE
        
        # Generate coverage areas for each station
        for station in stations:
            # Get station coordinates
            try:
                lat = float(station.get('latitude', station.get('Latitude')))
                lng = float(station.get('longitude', station.get('Longitude')))
                
                # Skip if invalid coordinates
                if not (lat and lng):
                    continue
                
                # Create a point for the station
                station_point = {
                    'type': 'Point',
                    'coordinates': [lng, lat]
                }
                
                # Create a circle for the coverage area
                # Note: In a real implementation, this would use more advanced algorithms
                # considering road networks, but for simplicity we use a circle
                coverage_area = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [lng, lat]
                    },
                    'properties': {
                        'station_id': station.get('station_id', station.get('Station ID', '')),
                        'name': station.get('name', station.get('Station Name', '')),
                        'radius': travel_distance_meters
                    }
                }
                
                result['coverage_areas'].append(coverage_area)
                
            except (ValueError, TypeError) as e:
                print(f"Error processing station {station.get('station_id', station.get('Station ID', ''))}: {e}")
                continue
        
        # If we have a boundary, calculate the gap areas
        if boundary:
            # In a real implementation, this would compute the difference between the boundary
            # and the union of all coverage areas. Here we're simplifying.
            result['gap_areas'] = {
                'type': 'Feature',
                'geometry': boundary,
                'properties': {
                    'description': 'Coverage gaps (simplified)'
                }
            }
            
            # Calculate approximate statistics
            result['stats']['total_area'] = boundary.get('total_area', 0)
            result['stats']['covered_area'] = sum([area.get('properties', {}).get('radius', 0) ** 2 * math.pi 
                                                for area in result['coverage_areas']])
            
            # Note: This is a simplification as it doesn't account for overlapping coverage areas
            if result['stats']['total_area'] > 0:
                result['stats']['coverage_percentage'] = min(100, 
                    (result['stats']['covered_area'] / result['stats']['total_area']) * 100)
            
        return result

    def suggest_station_locations(stations, incidents, gaps, num_stations=1):
        """
        Suggest new station locations to fill coverage gaps
        
        Args:
            stations (list): List of existing station dictionaries
            incidents (list): List of incident dictionaries
            gaps (dict): Coverage gap analysis from calculate_coverage_gaps
            num_stations (int): Number of new stations to suggest
            
        Returns:
            list: Suggested station locations
        """
        # Initialize result
        suggested_stations = []
        
        # Skip if no gaps or if gaps structure is invalid
        if not gaps or 'gap_areas' not in gaps:
            return suggested_stations
        
        # In a real implementation, this would use a clustering algorithm on incidents
        # in gap areas to suggest optimal station locations
        # For simplicity, we'll use a random approach for demo purposes
        
        # Get random incidents in gap areas as potential station locations
        if incidents and len(incidents) > 0:
            # Filter incidents to those in gap areas (simplified approach)
            gap_incidents = []
            for incident in incidents:
                # In a real implementation, would check if incident is within gap_areas
                # For demo, we'll just check if it's far from existing stations
                try:
                    lat = float(incident.get('latitude', incident.get('Latitude')))
                    lng = float(incident.get('longitude', incident.get('Longitude')))
                    
                    # Skip if invalid coordinates
                    if not (lat and lng):
                        continue
                        
                    # Check if incident is far from all existing stations (simplified)
                    is_in_gap = True
                    for station in stations:
                        station_lat = float(station.get('latitude', station.get('Latitude')))
                        station_lng = float(station.get('longitude', station.get('Longitude')))
                        
                        # Calculate distance (simplified)
                        dist = math.sqrt((lat - station_lat) ** 2 + (lng - station_lng) ** 2)
                        
                        # If incident is close to a station, it's not in a gap
                        if dist < 0.05:  # Arbitrary threshold, should be based on coverage radius
                            is_in_gap = False
                            break
                    
                    if is_in_gap:
                        gap_incidents.append(incident)
                        
                except (ValueError, TypeError):
                    continue
            
            # Create suggested stations from gap incidents
            if gap_incidents:
                # Sort incidents by frequency or priority (simplified)
                # In a real implementation, would use proper clustering
                for _ in range(min(num_stations, len(gap_incidents))):
                    # Pick a random incident as a suggested station location
                    incident = random.choice(gap_incidents)
                    
                    try:
                        lat = float(incident.get('latitude', incident.get('Latitude')))
                        lng = float(incident.get('longitude', incident.get('Longitude')))
                        
                        suggested_stations.append({
                            'station_id': f'NEW-{len(suggested_stations) + 1}',
                            'name': f'Suggested Station {len(suggested_stations) + 1}',
                            'latitude': lat,
                            'longitude': lng,
                            'suggested': True
                        })
                        
                        # Remove this incident from candidates
                        gap_incidents.remove(incident)
                        
                    except (ValueError, TypeError):
                        continue
            
        # If we couldn't create enough stations from incidents, just use random points
        while len(suggested_stations) < num_stations:
            # In a real implementation, would use a proper algorithm to find optimal locations
            # For demo, we'll use random coordinates within the bounds of existing stations
            if not stations:
                break
                
            # Get bounds from existing stations
            lats = [float(s.get('latitude', s.get('Latitude', 0))) for s in stations if s.get('latitude') or s.get('Latitude')]
            lngs = [float(s.get('longitude', s.get('Longitude', 0))) for s in stations if s.get('longitude') or s.get('Longitude')]
            
            if not lats or not lngs:
                break
                
            min_lat, max_lat = min(lats), max(lats)
            min_lng, max_lng = min(lngs), max(lngs)
            
            # Add some randomness to the bounds
            lat_range = max_lat - min_lat
            lng_range = max_lng - min_lng
            
            min_lat -= lat_range * 0.1
            max_lat += lat_range * 0.1
            min_lng -= lng_range * 0.1
            max_lng += lng_range * 0.1
            
            # Create a random station within these bounds
            random_lat = min_lat + (max_lat - min_lat) * random.random()
            random_lng = min_lng + (max_lng - min_lng) * random.random()
            
            suggested_stations.append({
                'station_id': f'NEW-{len(suggested_stations) + 1}',
                'name': f'Suggested Station {len(suggested_stations) + 1}',
                'latitude': random_lat,
                'longitude': random_lng,
                'suggested': True
            })
        
        return suggested_stations

    # Coverage Gap Finder API endpoints
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