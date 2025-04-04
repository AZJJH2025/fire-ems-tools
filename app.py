from flask import Flask, request, jsonify, send_from_directory, render_template, redirect, url_for, abort, flash, session
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import jinja2
import pandas as pd
import os
import traceback
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import requests
import time
import json
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
        
        return render_template('admin/dashboard.html', 
                              departments_count=departments_count,
                              users_count=users_count,
                              incidents_count=incidents_count)
    
    @app.route('/admin/departments')
    @login_required
    def admin_departments_list():
        """List all departments"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        departments = Department.query.all()
        return render_template('admin/departments.html', departments=departments)
    
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
                for key in ['incident_logger', 'call_density', 'isochrone_map', 'dashboard']:
                    features_enabled[key] = key in request.form
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
                
                flash(f"Department '{department.name}' has been registered successfully", 'success')
                
                # Redirect to department view or success page
                return redirect(url_for('admin_department_view', dept_id=department.id))
                
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Error registering department: {str(e)}")
                app.logger.error(traceback.format_exc())
                # Re-render the form with error message
                flash(f"Error registering department: {str(e)}", 'danger')
                return render_template('admin/department-register.html')
        
        # GET request - show the registration form
        return render_template('admin/department-register.html')
    
    @app.route('/admin/departments/<int:dept_id>')
    @login_required
    def admin_department_view(dept_id):
        """View a specific department's details"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        department = Department.query.get_or_404(dept_id)
        return render_template('admin/department-view.html', department=department)
    
    @app.route('/admin/departments/<int:dept_id>/edit', methods=['GET', 'POST'])
    @login_required
    def admin_department_edit(dept_id):
        """Edit a department"""
        if not current_user.is_super_admin():
            abort(403)  # Forbidden
            
        department = Department.query.get_or_404(dept_id)
        
        if request.method == 'POST':
            # Extract form data & update department
            form_data = request.form
            
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
            
            # Update features
            features_enabled = {}
            for key in ['incident_logger', 'call_density', 'isochrone_map', 'dashboard']:
                features_enabled[key] = key in request.form
            department.features_enabled = features_enabled
            
            # Update status
            department.is_active = 'is_active' in request.form
            department.setup_complete = 'setup_complete' in request.form
            
            # Save changes
            db.session.commit()
            
            flash(f"Department '{department.name}' has been updated successfully", 'success')
            
            # Redirect to department view
            return redirect(url_for('admin_department_view', dept_id=department.id))
        
        # GET request - show edit form
        return render_template('admin/department-edit.html', department=department)
    
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
                for key in ['incident_logger', 'call_density', 'isochrone_map', 'dashboard']:
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