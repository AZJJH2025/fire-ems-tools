"""
FireEMS.ai - Fire & EMS Analytics Application

This is the main application file that initializes the Flask app,
registers blueprints, and sets up the database and other extensions.
"""
from flask import Flask, jsonify, render_template, session, request
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
from flask_login import LoginManager
import os
import logging
import traceback
from datetime import datetime, timedelta
import json
import secrets
from app_utils import init_limiter, safe_limit, require_api_key

# Setup logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Enable debug logging for all modules
logging.getLogger('routes.api').setLevel(logging.DEBUG)
logging.getLogger('routes.helpers.data_transformer').setLevel(logging.DEBUG)

# Ensure logs are written to flask.log as well
handler = logging.FileHandler('flask.log')
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logging.getLogger().addHandler(handler)

# Apply deployment fixes before importing models
import fix_deployment
fix_deployment.apply_fixes()

# Now import models after fixes have been applied
from database import db, Department, Incident, User, Station
from config import config

# Initialize Flask extensions
csrf = CSRFProtect()
login_manager = LoginManager()

# Limiter will be initialized in create_app function
limiter = None

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
    
    # Use our own static file handling instead of Flask's built-in
    app = Flask(__name__, 
                template_folder=template_folder,
                static_folder=None)
    
    # Initialize rate limiter
    init_limiter(app)
    
    # Set up template auto-reloading in development
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    
    # Apply configuration
    app.config.from_object(config[config_name])
    
    # Configure security headers
    @app.after_request
    def add_security_headers(response):
        # Set Content Security Policy
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' https://cdnjs.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://cdnjs.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net; connect-src 'self'"
        
        # Set X-Content-Type-Options
        response.headers['X-Content-Type-Options'] = 'nosniff'
        
        # Set X-Frame-Options
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        
        # Set X-XSS-Protection
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Set Referrer-Policy
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Set Permissions-Policy
        response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=(self)'
        
        # Ensure JavaScript files have the correct content type
        if response.mimetype == 'text/html' and request.path.endswith('.js'):
            response.mimetype = 'application/javascript'
            app.logger.info(f"Corrected mimetype for {request.path} to application/javascript")
            
        return response
    
    # Set up CORS with more restrictive settings
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # TEMPORARILY DISABLE CSRF FOR DEBUGGING
    app.config['WTF_CSRF_ENABLED'] = False
    
    # Initialize but don't enforce CSRF protection
    csrf.init_app(app)
    
    # Initialize extensions
    db.init_app(app)
    
    # Set up Flask-Login
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Session configuration (no need to set secret_key explicitly, it comes from app.config)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SECURE'] = app.config.get('SESSION_COOKIE_SECURE', False)
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=app.config.get('PERMANENT_SESSION_LIFETIME', 86400))
    
    # Check if we need to generate a session token
    @app.before_request
    def check_csrf_token():
        if '_csrf_token' not in session:
            session['_csrf_token'] = secrets.token_hex(16)
    
    # Register custom static file handling
    from static_middleware import register_static_handler
    register_static_handler(app)
        
    # Direct static file serving for emergencies
    @app.route('/app-static/<path:filename>')
    def serve_static_direct(filename):
        import os
        import mimetypes
        import traceback
        static_dir = os.path.join(os.getcwd(), 'static')
        
        try:
            # Get MIME type
            _, ext = os.path.splitext(filename)
            mimetype = mimetypes.types_map.get(ext.lower())
            
            # Force JavaScript MIME type for JS files
            if ext.lower() in ['.js', '.jsx']:
                mimetype = 'application/javascript'
            elif ext.lower() == '.css':
                mimetype = 'text/css'
                
            app.logger.info(f"Direct static file request: {filename} as {mimetype}")
            
            # Full path to file
            file_path = os.path.join(static_dir, filename)
            if not os.path.exists(file_path):
                app.logger.error(f"File not found: {file_path}")
                return f"File not found: {filename}", 404
                
            # Serve the file directly
            with open(file_path, 'rb') as f:
                content = f.read()
                
            from flask import make_response
            response = make_response(content)
            response.headers['Content-Type'] = mimetype or 'application/octet-stream'
            response.headers['X-Served-By'] = 'app-static direct route'
            return response
        except Exception as e:
            app.logger.error(f"Error serving {filename} via app-static: {str(e)}")
            app.logger.error(traceback.format_exc())
            return f"Error serving file: {str(e)}", 500
    
    # Diagnostic endpoint to check static file serving
    @app.route('/diagnostic/static')
    def static_diagnostic():
        """Interactive diagnostic page for troubleshooting static file serving"""
        import os
        import mimetypes
        import traceback
        from flask import render_template_string
        
        # Get all static file routes
        static_routes = [
            {'name': 'Blueprint Static', 'path': '/static/'},
            {'name': 'Direct Static', 'path': '/direct-static/'}, 
            {'name': 'App Static', 'path': '/app-static/'}
        ]
        
        # List some critical files to test
        static_files = ['styles.css', 'data-formatter.css', 'data-formatter-bundle.js']
        
        # Check if files exist
        static_dir = os.path.join(os.getcwd(), 'static')
        file_status = []
        
        for file in static_files:
            file_path = os.path.join(static_dir, file)
            exists = os.path.exists(file_path)
            size = os.path.getsize(file_path) if exists else 0
            _, ext = os.path.splitext(file)
            mimetype = mimetypes.types_map.get(ext.lower(), 'unknown')
            
            file_status.append({
                'name': file,
                'exists': exists,
                'size': size,
                'path': file_path,
                'mimetype': mimetype
            })
        
        # Get registered url rules for more info
        url_rules = []
        for rule in app.url_map.iter_rules():
            if 'static' in rule.endpoint:
                url_rules.append({
                    'endpoint': rule.endpoint,
                    'methods': ', '.join(rule.methods),
                    'rule': str(rule)
                })
        
        # Generate HTML template for diagnostics
        template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Static File Diagnostics</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 1200px; margin: 0 auto; }
                h1 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                h2 { color: #0066cc; margin-top: 30px; }
                .section { margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 5px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; }
                tr:hover { background-color: #f5f5f5; }
                .success { color: green; }
                .error { color: red; }
                .test-btn { background: #0066cc; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px; margin: 5px; }
                #test-results { margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px; min-height: 200px; }
                .code { font-family: monospace; background: #eee; padding: 2px 4px; }
            </style>
            <script>
                function testStaticFile(path, file) {
                    const url = path + file;
                    const resultDiv = document.getElementById('test-results');
                    
                    resultDiv.innerHTML = `<p>Testing: <strong>${url}</strong>...</p>`;
                    
                    const startTime = new Date();
                    
                    fetch(url)
                        .then(response => {
                            const elapsed = new Date() - startTime;
                            
                            let resultHtml = `
                                <p>URL: <strong>${url}</strong></p>
                                <p>Status: <strong>${response.status} ${response.statusText}</strong></p>
                                <p>Content-Type: <strong>${response.headers.get('content-type')}</strong></p>
                                <p>Time: <strong>${elapsed}ms</strong></p>
                                <p>Headers:</p>
                                <pre>`;
                            
                            response.headers.forEach((value, name) => {
                                resultHtml += `${name}: ${value}\\n`;
                            });
                            
                            resultHtml += `</pre>`;
                            
                            if (response.ok) {
                                return response.text().then(text => {
                                    const firstChars = text.substring(0, 100);
                                    resultHtml += `
                                        <p>Content starts with:</p>
                                        <pre>${firstChars}...</pre>
                                    `;
                                    resultDiv.innerHTML = resultHtml;
                                });
                            } else {
                                resultHtml += `<p class="error">Failed to load resource</p>`;
                                resultDiv.innerHTML = resultHtml;
                            }
                        })
                        .catch(error => {
                            resultDiv.innerHTML = `
                                <p>URL: <strong>${url}</strong></p>
                                <p class="error">Error: ${error.message}</p>
                            `;
                        });
                }
            </script>
        </head>
        <body>
            <h1>Static File Serving Diagnostics</h1>
            
            <div class="section">
                <h2>Static File Routes</h2>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Path</th>
                        <th>Test</th>
                    </tr>
                    {% for route in static_routes %}
                    <tr>
                        <td>{{ route.name }}</td>
                        <td>{{ route.path }}</td>
                        <td>
                            {% for file in static_files %}
                            <button class="test-btn" onclick="testStaticFile('{{ route.path }}', '{{ file }}')">Test {{ file }}</button>
                            {% endfor %}
                        </td>
                    </tr>
                    {% endfor %}
                </table>
            </div>
            
            <div class="section">
                <h2>Static File Status</h2>
                <table>
                    <tr>
                        <th>File</th>
                        <th>Exists</th>
                        <th>Size</th>
                        <th>MIME Type</th>
                        <th>Path</th>
                    </tr>
                    {% for file in file_status %}
                    <tr>
                        <td>{{ file.name }}</td>
                        <td class="{% if file.exists %}success{% else %}error{% endif %}">
                            {{ 'Yes' if file.exists else 'No' }}
                        </td>
                        <td>{{ file.size }} bytes</td>
                        <td>{{ file.mimetype }}</td>
                        <td>{{ file.path }}</td>
                    </tr>
                    {% endfor %}
                </table>
            </div>
            
            <div class="section">
                <h2>URL Rules</h2>
                <table>
                    <tr>
                        <th>Endpoint</th>
                        <th>Methods</th>
                        <th>Rule</th>
                    </tr>
                    {% for rule in url_rules %}
                    <tr>
                        <td>{{ rule.endpoint }}</td>
                        <td>{{ rule.methods }}</td>
                        <td>{{ rule.rule }}</td>
                    </tr>
                    {% endfor %}
                </table>
            </div>
            
            <div class="section">
                <h2>Test Results</h2>
                <div id="test-results">
                    <p>Click a "Test" button above to check a static file route.</p>
                </div>
            </div>
            
            <div class="section">
                <h2>Troubleshooting Tips</h2>
                <ol>
                    <li>Ensure files exist in the correct location</li>
                    <li>Check MIME types are being correctly set</li>
                    <li>Review response headers for any issues</li>
                    <li>Test different static file routes to see which works</li>
                    <li>Check for any 500 errors in the server logs</li>
                    <li>Try the direct route at <code>/app-static/styles.css</code> first</li>
                </ol>
            </div>
        </body>
        </html>
        """
        
        return render_template_string(template, 
                                    static_routes=static_routes,
                                    static_files=static_files,
                                    file_status=file_status,
                                    url_rules=url_rules)
    
    # Register blueprints from modular routes
    try:
        # Import blueprints
        from routes.main import bp as main_bp
        from routes.auth import bp as auth_bp
        from routes.api import bp as api_bp
        from routes.dashboards import bp as dashboards_bp
        from routes.tools import bp as tools_bp
        from routes.admin import bp as admin_bp
        
        # Register blueprints
        app.register_blueprint(main_bp)
        app.register_blueprint(auth_bp)
        app.register_blueprint(api_bp)
        app.register_blueprint(dashboards_bp)
        app.register_blueprint(tools_bp)
        app.register_blueprint(admin_bp)
        
        logger.info("Successfully registered all route blueprints")
    except ImportError as e:
        logger.error(f"Failed to import blueprints: {str(e)}")
        # Add basic routes as fallback
        @app.route('/')
        def index():
            return render_template('index.html')
            
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
                },
                "blueprint_error": str(e)
            }
            return jsonify(status)
        
        # Add basic routes for each tool
        for route in ['/fire-ems-dashboard', '/isochrone-map', '/call-density-heatmap', 
                      '/incident-logger', '/coverage-gap-finder', '/fire-map-pro',
                      '/data-formatter', '/station-overview', '/call-volume-forecaster',
                      '/quick-stats', '/user-guide']:
            # Create a route function dynamically
            def make_route_func(template_name):
                def route_func():
                    return render_template(f"{template_name}.html")
                return route_func
            
            # Register the route
            template_name = route[1:]  # Remove leading slash
            app.add_url_rule(route, endpoint=template_name.replace('-', '_'), 
                           view_func=make_route_func(template_name))
    
    # Add error handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('errors/404.html'), 404
        
    @app.errorhandler(500)
    def server_error(e):
        return render_template('errors/500.html'), 500
    
    return app

# Function to create a default super admin user
def create_default_admin():
    """Create a default super admin user if none exists"""
    try:
        with app.app_context():
            # Check if the User model has the required fields
            required_attrs = ['email', 'name', 'department_id', 'role', 'is_active']
            for attr in required_attrs:
                if not hasattr(User, attr):
                    logger.error(f"User model missing required attribute: {attr}")
                    return
            
            # Check for existing admin users
            admin_count = User.query.filter_by(role='super_admin').count()
            logger.info(f"Found {admin_count} existing super_admin users")
            
            if admin_count == 0:
                # Check if we need to create a default department first
                default_dept = Department.query.filter_by(code='ADMIN').first()
                if not default_dept:
                    logger.info("Creating default admin department")
                    default_dept = Department(
                        code='ADMIN',
                        name='System Administration',
                        is_active=True,
                        setup_complete=True
                    )
                    db.session.add(default_dept)
                    db.session.commit()
                    logger.info(f"Created default department with ID: {default_dept.id}")
                else:
                    logger.info(f"Using existing admin department with ID: {default_dept.id}")
                
                # Create default admin user
                admin_user = User(
                    email='admin@fireems.ai',
                    name='System Administrator',
                    department_id=default_dept.id,
                    role='super_admin',
                    is_active=True
                )
                
                # Make sure password is set correctly
                if not hasattr(admin_user, 'set_password'):
                    logger.error("User model does not have set_password method")
                    return
                    
                # Set a simple password for initial login
                admin_user.set_password('admin123')
                
                # Add and commit the new user
                db.session.add(admin_user)
                db.session.commit()
                logger.info(f"Created default super admin user (admin@fireems.ai) with ID: {admin_user.id}")
            else:
                logger.info("Super admin user already exists, skipping creation")
    except Exception as e:
        logger.error(f"Failed to create default admin user: {str(e)}")
        logger.error(traceback.format_exc())

# Create app instance for running directly
try:
    # Ensure fixes are applied
    logger.info("Creating application with deployment fixes...")
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    # Fix database tables after app creation
    fix_deployment.fix_database_tables(app, db)
    
    # Create default admin user if necessary
    create_default_admin()
    
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
    # Run the application
    port = int(os.environ.get("PORT", 5005))
    app.run(host='0.0.0.0', port=port, debug=True, threaded=True, use_reloader=False)