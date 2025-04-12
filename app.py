"""
FireEMS.ai - Fire & EMS Analytics Application

This is the main application file that initializes the Flask app,
registers blueprints, and sets up the database and other extensions.
"""
from flask import Flask, jsonify, render_template, session, request, send_file
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
        
    # Direct static file serving for emergencies - Enhanced robust version
    @app.route('/app-static/<path:filename>')
    def serve_static_direct(filename):
        import os
        import mimetypes
        import traceback
        import logging
        from flask import send_file, make_response, current_app
        
        # Setup dedicated logger for static files
        static_logger = logging.getLogger('app.static')
        if not static_logger.handlers:
            file_handler = logging.FileHandler('static_middleware.log')
            file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
            static_logger.addHandler(file_handler)
            static_logger.setLevel(logging.DEBUG)
        
        static_dir = os.path.join(os.getcwd(), 'static')
        
        try:
            # Sanitize the filename to prevent directory traversal attacks
            safe_filename = os.path.normpath(filename).lstrip('/')
            
            # Get file extension and MIME type
            _, ext = os.path.splitext(safe_filename)
            ext = ext.lower()
            
            # Comprehensive MIME type mapping
            mime_mapping = {
                '.js': 'application/javascript',
                '.jsx': 'application/javascript',
                '.mjs': 'application/javascript',
                '.json': 'application/json',
                '.css': 'text/css',
                '.html': 'text/html',
                '.htm': 'text/html',
                '.txt': 'text/plain',
                '.csv': 'text/csv',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon',
                '.pdf': 'application/pdf',
                '.xml': 'application/xml',
                '.zip': 'application/zip',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.eot': 'application/vnd.ms-fontobject',
                '.otf': 'font/otf',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav'
            }
            
            # Get MIME type from our mapping or fallback to mimetypes module
            mimetype = mime_mapping.get(ext)
            if not mimetype:
                mimetype = mimetypes.types_map.get(ext)
            
            # Log detailed information about the request
            static_logger.info(f"APP-STATIC REQUEST: '{safe_filename}' with type '{mimetype}'")
                
            # Full path to file
            file_path = os.path.join(static_dir, safe_filename)
            
            # Check if file exists
            if not os.path.exists(file_path) or not os.path.isfile(file_path):
                static_logger.error(f"APP-STATIC ERROR: File not found: {file_path}")
                
                # Try case-insensitive matching as a fallback
                try:
                    parent_dir = os.path.dirname(file_path)
                    if os.path.exists(parent_dir):
                        base_name = os.path.basename(file_path)
                        for existing_file in os.listdir(parent_dir):
                            if existing_file.lower() == base_name.lower():
                                # Found a case-insensitive match
                                file_path = os.path.join(parent_dir, existing_file)
                                static_logger.info(f"APP-STATIC RECOVERY: Found via case-insensitive match: {existing_file}")
                                break
                except Exception as case_err:
                    static_logger.error(f"APP-STATIC ERROR: Case-insensitive lookup failed: {str(case_err)}")
                
                # Check again after case-insensitive attempt
                if not os.path.exists(file_path) or not os.path.isfile(file_path):
                    return f"File not found: {safe_filename}", 404
            
            # First try with send_file which is more efficient
            try:
                response = send_file(file_path, mimetype=mimetype or 'application/octet-stream', 
                                    as_attachment=False, max_age=86400)
                response.headers['X-Served-By'] = 'app-static send_file'
                response.headers['Cache-Control'] = 'public, max-age=86400'
                static_logger.info(f"APP-STATIC SUCCESS: Served with send_file: {safe_filename}")
                return response
            except Exception as send_file_err:
                static_logger.warning(f"APP-STATIC WARNING: send_file failed, falling back to direct read: {str(send_file_err)}")
                
                # Fallback to direct file reading
                try:
                    with open(file_path, 'rb') as f:
                        content = f.read()
                        
                    response = make_response(content)
                    response.headers['Content-Type'] = mimetype or 'application/octet-stream'
                    response.headers['X-Served-By'] = 'app-static direct read'
                    response.headers['Cache-Control'] = 'public, max-age=86400'
                    static_logger.info(f"APP-STATIC SUCCESS: Served with direct read: {safe_filename}")
                    return response
                except Exception as read_err:
                    static_logger.error(f"APP-STATIC ERROR: Direct read failed: {str(read_err)}")
                    raise read_err  # Re-raise to be caught by the outer try/except
        except Exception as e:
            static_logger.error(f"APP-STATIC ERROR: Unhandled exception serving {filename}: {str(e)}")
            static_logger.error(traceback.format_exc())
            return f"Error serving file: {str(e)}", 500
    
    # Health check endpoints for resilience framework
    @app.route('/api/health-check')
    def api_health_check():
        """API health check endpoint for resilience monitoring"""
        health_data = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "environment": app.config.get('ENV', 'development'),
            "components": {
                "database": check_database_health(),
                "redis": check_redis_health()
            }
        }
        
        # Overall status is unhealthy if any component is unhealthy
        for component, status in health_data["components"].items():
            if not status["healthy"]:
                health_data["status"] = "unhealthy"
                break
                
        return jsonify(health_data)
        
    # Direct health check that doesn't rely on blueprint configuration
    @app.route('/direct-health-check')
    def direct_health_check():
        """Direct health check endpoint for debugging"""
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "environment": app.config.get('ENV', 'development'),
            "note": "Direct health check - bypassing blueprints"
        })
        
    def check_database_health():
        """Check if database is reachable and responding"""
        try:
            # Try a simple query
            with app.app_context():
                db.session.execute(db.select(db.text("1"))).scalar()
            return {"healthy": True, "message": "Database connection successful"}
        except Exception as e:
            app.logger.error(f"Database health check failed: {str(e)}")
            return {"healthy": False, "message": f"Database error: {str(e)}"}
            
    def check_redis_health():
        """Check if Redis is reachable and responding"""
        redis_url = app.config.get('REDIS_URL')
        if not redis_url:
            return {"healthy": True, "message": "Redis not configured, using in-memory storage"}
            
        try:
            import redis
            r = redis.from_url(redis_url)
            # Set a test key
            test_key = "health_check_test"
            r.set(test_key, "ok")
            # Verify we can read it back
            value = r.get(test_key)
            # Clean up
            r.delete(test_key)
            
            if value == b"ok":
                return {"healthy": True, "message": "Redis connection successful"}
            else:
                return {"healthy": False, "message": f"Redis value mismatch: {value}"}
        except ImportError:
            return {"healthy": False, "message": "Redis package not installed"}
        except Exception as e:
            app.logger.error(f"Redis health check failed: {str(e)}")
            return {"healthy": False, "message": f"Redis error: {str(e)}"}

    @app.route('/static/health-check.txt')
    def static_health_check():
        """Static file health check endpoint for resilience monitoring"""
        return "healthy", 200, {"Content-Type": "text/plain"}
    
    # Emergency mode diagnostic endpoint
    @app.route('/diagnostic/emergency')
    def emergency_diagnostic():
        """Interactive diagnostic page for testing emergency mode functionality"""
        app.logger.info(f"Emergency diagnostic request: {request.args}")
        # Log detailed diagnostic info
        if 'emergency_data' in request.args:
            app.logger.info(f"Emergency data param: {request.args.get('emergency_data')}")
        return send_file('static/test-emergency-fix.html')
        
    # New comprehensive emergency data test tool
    @app.route('/diagnostic/emergency-data-test')
    def emergency_data_test():
        """Comprehensive emergency data transfer testing tool"""
        app.logger.info(f"Emergency data test tool request: {request.args}")
        return send_file('static/emergency-data-test.html')
    
    # Diagnostic endpoint to check static file serving
    @app.route('/diagnostic/static')
    def static_diagnostic():
        """Interactive diagnostic page for troubleshooting static file serving"""
        import os
        import mimetypes
        import traceback
        import glob
        from flask import render_template_string
        
        # Get all static file routes
        static_routes = [
            {'name': 'Blueprint Static', 'path': '/static/'},
            {'name': 'Direct Static', 'path': '/direct-static/'}, 
            {'name': 'App Static (Emergency)', 'path': '/app-static/'}
        ]
        
        # List some critical files to test
        static_files = ['styles.css', 'data-formatter.css', 'data-formatter-bundle.js', 'data-formatter-direct.js', 'fire-ems-dashboard.js']
        
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
                <h2>Emergency Mode Features</h2>
                <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                    <h3 style="margin-top: 0; color: #0d47a1;">About Emergency Mode</h3>
                    <p>This application includes multiple fallback mechanisms to ensure it continues to work even when static files fail to load properly.</p>
                    
                    <h4>Static File Fallbacks:</h4>
                    <ol>
                        <li>Primary route: <code>/static/file.js</code> - Uses Flask's Blueprint</li>
                        <li>First fallback: <code>/direct-static/file.js</code> - Direct file reading fallback</li>
                        <li>Emergency fallback: <code>/app-static/file.js</code> - Highly resilient direct serving with detailed logging</li>
                    </ol>
                    
                    <h4>Client-Side Emergency Features:</h4>
                    <ul>
                        <li><strong>Resilient CSS Loading:</strong> Multiple path attempts with inline critical CSS</li>
                        <li><strong>Resilient JS Loading:</strong> CDN fallbacks and dedicated error handlers</li>
                        <li><strong>Client-side Processing:</strong> Pure JS implementations when React components fail</li>
                        <li><strong>Offline Data Processing:</strong> Client-side CSV parsing for Data Formatter</li>
                        <li><strong>LocalStorage Data Transfer:</strong> Emergency mode uses localStorage to transfer data between tools</li>
                    </ul>
                    
                    <h4>Emergency Data Storage Status:</h4>
                    <div id="emergency-storage-status">Checking localStorage usage...</div>
                    <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            const statusDiv = document.getElementById('emergency-storage-status');
                            
                            try {
                                let emergencyKeys = [];
                                let totalSize = 0;
                                
                                // Scan localStorage for emergency data
                                for (let i = 0; i < localStorage.length; i++) {
                                    const key = localStorage.key(i);
                                    if (key && key.startsWith('emergency_data_')) {
                                        const value = localStorage.getItem(key);
                                        const size = value ? value.length : 0;
                                        totalSize += size;
                                        
                                        const timestamp = key.replace('emergency_data_', '');
                                        const date = new Date(parseInt(timestamp));
                                        
                                        emergencyKeys.push({
                                            key: key,
                                            size: size,
                                            date: date
                                        });
                                    }
                                }
                                
                                // Display results
                                if (emergencyKeys.length === 0) {
                                    statusDiv.innerHTML = '<p>✅ No emergency data currently stored in localStorage.</p>';
                                } else {
                                    let html = `<p>⚠️ Found ${emergencyKeys.length} emergency data entries using approximately ${Math.round(totalSize / 1024)} KB:</p><ul>`;
                                    
                                    emergencyKeys.forEach(item => {
                                        html += `<li>
                                            <strong>${item.key}</strong> - ${Math.round(item.size / 1024)} KB, 
                                            created on ${item.date.toLocaleString()}
                                            <button onclick="localStorage.removeItem('${item.key}'); location.reload();">Clear</button>
                                        </li>`;
                                    });
                                    
                                    html += `</ul>
                                    <button onclick="clearAllEmergencyData()">Clear All Emergency Data</button>
                                    <script>
                                        function clearAllEmergencyData() {
                                            const keys = [];
                                            for (let i = 0; i < localStorage.length; i++) {
                                                const key = localStorage.key(i);
                                                if (key && key.startsWith('emergency_data_')) {
                                                    keys.push(key);
                                                }
                                            }
                                            
                                            keys.forEach(key => localStorage.removeItem(key));
                                            location.reload();
                                        }
                                    <\/script>`;
                                    
                                    statusDiv.innerHTML = html;
                                }
                            } catch (error) {
                                statusDiv.innerHTML = `<p>❌ Error checking localStorage: ${error.message}</p>`;
                            }
                        });
                    </script>
                </div>
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
            
            <div class="section">
                <h2>Emergency Mode Testing</h2>
                <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                    <h3 style="margin-top: 0; color: #e65100;">Emergency Data Transfer Test</h3>
                    <p>This section allows administrators to test the emergency data transfer functionality between tools.</p>
                    
                    <div style="margin-top: 15px;">
                        <h4>1. Create Test Data</h4>
                        <button id="create-test-data" style="background-color: #ff9800; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                            Create Sample Data
                        </button>
                        <span id="create-status"></span>
                    </div>
                    
                    <div style="margin-top: 15px;">
                        <h4>2. Test Transfer</h4>
                        <select id="target-tool" style="padding: 8px; margin-right: 10px;">
                            <option value="fire-ems-dashboard">Response Time Analyzer</option>
                            <option value="call-density-heatmap">Call Density Heatmap</option>
                            <option value="isochrone-map">Isochrone Map</option>
                            <option value="incident-logger">Incident Logger</option>
                        </select>
                        <button id="test-transfer" style="background-color: #ff9800; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                            Test Transfer
                        </button>
                    </div>
                    
                    <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            const createBtn = document.getElementById('create-test-data');
                            const transferBtn = document.getElementById('test-transfer');
                            const createStatus = document.getElementById('create-status');
                            const toolSelect = document.getElementById('target-tool');
                            
                            if (createBtn) {
                                createBtn.addEventListener('click', function() {
                                    // Feature detection for localStorage
                                    if (typeof Storage === 'undefined') {
                                        createStatus.textContent = '❌ Error: localStorage not supported in this browser';
                                        return;
                                    }
                                    
                                    // Generate a small test dataset
                                    const testData = [];
                                    const now = new Date();
                                    
                                    for (let i = 1; i <= 10; i++) {
                                        testData.push({
                                            incident_id: `TEST-${i}`,
                                            incident_date: now.toISOString().split('T')[0],
                                            incident_time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                                            latitude: (Math.random() * 10 + 30).toFixed(6),
                                            longitude: (Math.random() * 10 - 90).toFixed(6),
                                            incident_type: 'TEST',
                                            priority: Math.floor(Math.random() * 3) + 1
                                        });
                                    }
                                    
                                    // Store in localStorage with error handling for quota limits
                                    const dataId = 'emergency_data_test_' + Date.now();
                                    try {
                                        // Serialize data
                                        const serializedData = JSON.stringify(testData);
                                        const dataSize = new Blob([serializedData]).size;
                                        
                                        // Check size (show warning if over 1MB)
                                        const sizeWarning = dataSize > 1000000 ? ' ⚠️ Large data size may not work in all browsers!' : '';
                                        
                                        localStorage.setItem(dataId, serializedData);
                                        createStatus.innerHTML = `✅ Created sample data with ID: <code>${dataId}</code> (${Math.round(dataSize / 1024)} KB)${sizeWarning}`;
                                        
                                        // Save the ID for the transfer test
                                        window.testDataId = dataId;
                                    } catch (error) {
                                        if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                                            createStatus.textContent = '❌ Error: Storage quota exceeded. Try clearing browser storage.';
                                        } else {
                                            createStatus.textContent = `❌ Error: ${error.message}`;
                                        }
                                    }
                                });
                            }
                            
                            if (transferBtn) {
                                transferBtn.addEventListener('click', function() {
                                    if (!window.testDataId) {
                                        alert('Please create test data first');
                                        return;
                                    }
                                    
                                    const targetTool = toolSelect.value;
                                    const url = `/${targetTool}?emergency_data=${window.testDataId}`;
                                    
                                    // Open in new tab
                                    window.open(url, '_blank');
                                });
                            }
                        });
                    </script>
                </div>
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