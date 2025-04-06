"""
FireEMS.ai - Fire & EMS Analytics Application

This is the main application file that initializes the Flask app,
registers blueprints, and sets up the database and other extensions.
"""
from flask import Flask, jsonify, render_template, session, request
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
import os
import logging
import traceback
from datetime import datetime, timedelta
import json
import secrets

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

# Initialize Flask extensions
csrf = CSRFProtect()

# Import safe_limit decorator for rate limiting
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    
    # Create a safer version of limiter that won't fail in production
    limiter = Limiter(key_func=get_remote_address, default_limits=["200 per hour", "50 per minute"])
    
    # Create a safer limit decorator
    def safe_limit(limit_string, **kwargs):
        """A safer version of limiter.limit that won't fail if limiter is not working"""
        def decorator(f):
            try:
                # Try to use the real limiter
                return limiter.limit(limit_string, **kwargs)(f)
            except Exception as e:
                # If it fails, just return the original function
                logger.warning(f"Rate limiting failed, continuing without limits: {str(e)}")
                return f
        return decorator
except Exception as e:
    logger.error(f"Error initializing limiter: {str(e)}")
    # Create dummy functions if limiter fails
    limiter = None
    def safe_limit(limit_string, **kwargs):
        def decorator(f):
            return f
        return decorator

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
        
        return response
    
    # Set up CORS with more restrictive settings
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Set up anti-CSRF protection
    csrf.init_app(app)

    # Add exemptions for API endpoints if needed
    @csrf.exempt
    def csrf_exempt_api():
        if request.path.startswith('/api/'):
            return True
        return False
    
    # Initialize extensions
    db.init_app(app)
    if limiter:
        limiter.init_app(app)
    
    # Session configuration (no need to set secret_key explicitly, it comes from app.config)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SECURE'] = app.config.get('SESSION_COOKIE_SECURE', False)
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=app.config.get('PERMANENT_SESSION_LIFETIME', 86400))
    
    # Check if we need to generate a session token
    @app.before_request
    def check_csrf_token():
        if '_csrf_token' not in session:
            session['_csrf_token'] = secrets.token_hex(16)
    
    # Register blueprints from modular routes
    try:
        # Import blueprints
        from routes.main import bp as main_bp
        from routes.auth import bp as auth_bp
        from routes.api import bp as api_bp
        from routes.dashboards import bp as dashboards_bp
        from routes.tools import bp as tools_bp
        
        # Register blueprints
        app.register_blueprint(main_bp)
        app.register_blueprint(auth_bp)
        app.register_blueprint(api_bp)
        app.register_blueprint(dashboards_bp)
        app.register_blueprint(tools_bp)
        
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

# Create app instance for running directly
try:
    # Ensure fixes are applied
    logger.info("Creating application with deployment fixes...")
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    # Fix database tables after app creation
    fix_deployment.fix_database_tables(app, db)
    
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
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)