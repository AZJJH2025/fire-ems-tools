import os
import sys
import traceback
import logging
import secrets
from logging.handlers import RotatingFileHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler('render_wsgi.log', maxBytes=10485760, backupCount=3),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('render_wsgi')

logger.info('Starting render_wsgi.py application wrapper')

# Ensure required template directories exist before importing Flask
for folder in ['templates', 'templates/auth', 'templates/errors']:
    full_path = os.path.join(os.getcwd(), folder)
    if not os.path.exists(full_path):
        logger.warning(f'Creating missing template directory: {full_path}')
        os.makedirs(full_path, exist_ok=True)

# Define fallback templates in case local files don't exist
fallback_templates = {
    'templates/auth/login.html': '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - FireEMS.ai</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/static/styles.css">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f8fa;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        
        .login-container {
            width: 100%;
            max-width: 400px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .login-header {
            background-color: #3498db;
            color: white;
            padding: 1.5rem;
            text-align: center;
        }
        
        .logo {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .login-title {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 500;
        }
        
        .login-form {
            padding: 2rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #2c3e50;
        }
        
        input[type="email"],
        input[type="password"] {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }
        
        input[type="email"]:focus,
        input[type="password"]:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        .remember-me {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        
        .remember-me input {
            margin-right: 0.5rem;
        }
        
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            width: 100%;
            text-align: center;
            transition: background-color 0.2s;
        }
        
        .btn:hover {
            background-color: #2980b9;
        }
        
        .login-footer {
            text-align: center;
            margin-top: 2rem;
            color: #7f8c8d;
        }
        
        .login-footer a {
            color: #3498db;
            text-decoration: none;
        }
        
        .login-footer a:hover {
            text-decoration: underline;
        }
        
        .alert {
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 4px;
            border-left: 4px solid;
        }
        
        .alert-danger {
            background-color: #fdf7f7;
            border-color: #e74c3c;
            color: #c0392b;
        }
        
        .alert-warning {
            background-color: #fdf6e3;
            border-color: #f39c12;
            color: #d35400;
        }
        
        .alert-success {
            background-color: #f4faf4;
            border-color: #2ecc71;
            color: #27ae60;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <div class="logo"><i class="fas fa-fire-extinguisher"></i></div>
            <h1 class="login-title">FireEMS.ai Login</h1>
        </div>
        
        <div class="login-form">
            <form action="/login" method="POST">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required autofocus>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <div class="remember-me">
                    <input type="checkbox" id="remember" name="remember">
                    <label for="remember">Remember me</label>
                </div>
                
                <button type="submit" class="btn">Sign In</button>
            </form>
            
            <div class="login-footer">
                <p>Don't have an account? Please contact your department administrator.</p>
                <p><a href="/">Return to Home</a></p>
                <p><small>Contact your administrator for login credentials</small></p>
            </div>
        </div>
    </div>
</body>
</html>
    ''',
    'templates/errors/404.html': '''
<!DOCTYPE html>
<html>
<head>
    <title>404 - Page Not Found</title>
    <link rel="stylesheet" href="/static/styles.css">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f8fa;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        
        .error-container {
            width: 100%;
            max-width: 600px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            text-align: center;
        }
        
        h1 {
            color: #e74c3c;
            margin-top: 0;
        }
        
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: none;
            margin-top: 1.5rem;
        }
        
        .btn:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist or has been moved.</p>
        <a href="/" class="btn">Return to Home</a>
    </div>
</body>
</html>
    ''',
    'templates/errors/500.html': '''
<!DOCTYPE html>
<html>
<head>
    <title>500 - Server Error</title>
    <link rel="stylesheet" href="/static/styles.css">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f8fa;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        
        .error-container {
            width: 100%;
            max-width: 600px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            text-align: center;
        }
        
        h1 {
            color: #e74c3c;
            margin-top: 0;
        }
        
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: none;
            margin-top: 1.5rem;
        }
        
        .btn:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>500 - Server Error</h1>
        <p>An unexpected error occurred. Our team has been notified.</p>
        <a href="/" class="btn">Return to Home</a>
    </div>
</body>
</html>
    '''
}

for template_path, content in fallback_templates.items():
    full_path = os.path.join(os.getcwd(), template_path)
    if not os.path.exists(full_path):
        logger.warning(f'Creating missing template file: {full_path}')
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w') as f:
            f.write(content)

# Try to import and create the main application
app = None
try:
    # Apply deployment fixes first
    import fix_deployment
    fix_deployment.apply_fixes()
    logger.info("Applied deployment fixes")
    
    # Import and create the application
    from app import create_app
    logger.info('Successfully imported create_app from app')
    app = create_app()
    logger.info('Successfully created main application')
    
    # Fix database tables if needed
    try:
        from database import db
        fix_deployment.fix_database_tables(app, db)
        logger.info("Database tables fixed successfully")
    except Exception as e:
        logger.error(f"Error fixing database tables: {str(e)}")
except Exception as e:
    logger.error(f'Failed to create main application: {str(e)}')
    logger.error(traceback.format_exc())
    
    # Try to use emergency application as fallback
    try:
        logger.info('Attempting to start emergency application')
        from emergency import create_emergency_app
        app = create_emergency_app()
        logger.info('Successfully created emergency application')
    except Exception as e2:
        logger.error(f'Failed to create emergency application: {str(e2)}')
        logger.error(traceback.format_exc())
        
        # Ultra minimal fallback
        from flask import Flask, jsonify, render_template_string
        minimal_app = Flask(__name__)
        
        @minimal_app.route('/')
        def minimal_home():
            return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>Fire-EMS Tools Recovery Mode</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .error { background-color: #f8d7da; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Fire-EMS Tools Emergency Recovery Mode</h1>
        <div class="error">
            <p>The application is experiencing technical difficulties. Please contact support.</p>
            <p>You can try the <a href="/error">error details page</a> or <a href="/emergency-init">emergency init</a>.</p>
        </div>
    </div>
</body>
</html>
            ''')
            
        @minimal_app.route('/error')
        def error_details():
            return jsonify({
                'main_app_error': str(e),
                'emergency_app_error': str(e2) if 'e2' in locals() else None,
                'python_version': sys.version,
                'environment': os.environ.get('FLASK_ENV', 'unknown'),
                'template_paths': [p for p in templates_to_check.keys() if os.path.exists(os.path.join(os.getcwd(), p))]
            })
            
        @minimal_app.route('/emergency-init')
        def emergency_init():
            try:
                import sqlite3
                import uuid
                import hashlib
                
                # Connect to the database
                conn = sqlite3.connect('fire_ems.db')
                cursor = conn.cursor()
                
                # Create departments table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS departments (
                        id INTEGER PRIMARY KEY,
                        code TEXT UNIQUE NOT NULL,
                        name TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        address TEXT,
                        city TEXT,
                        state TEXT,
                        zip_code TEXT,
                        phone TEXT,
                        email TEXT,
                        website TEXT,
                        logo_url TEXT,
                        primary_color TEXT DEFAULT '#3498db',
                        secondary_color TEXT DEFAULT '#2c3e50',
                        department_type TEXT DEFAULT 'combined',
                        num_stations INTEGER DEFAULT 1,
                        num_personnel INTEGER,
                        service_area REAL,
                        population_served INTEGER,
                        api_key TEXT UNIQUE,
                        api_enabled BOOLEAN DEFAULT 0,
                        webhooks_enabled BOOLEAN DEFAULT 0,
                        webhook_url TEXT,
                        webhook_secret TEXT,
                        webhook_events TEXT DEFAULT '{"incident.created": true, "incident.updated": true, "station.created": false, "user.created": false}',
                        webhook_last_error TEXT,
                        webhook_last_success TIMESTAMP,
                        is_active BOOLEAN DEFAULT 1,
                        setup_complete BOOLEAN DEFAULT 0,
                        features_enabled TEXT DEFAULT '{"incident_logger": true, "call_density": true, "isochrone_map": true, "dashboard": true}'
                    )
                ''')
                
                # Create users table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY,
                        department_id INTEGER NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password_hash TEXT,
                        name TEXT NOT NULL,
                        role TEXT DEFAULT 'user',
                        is_active BOOLEAN DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_login TIMESTAMP,
                        preferences TEXT DEFAULT '{}',
                        FOREIGN KEY (department_id) REFERENCES departments (id)
                    )
                ''')
                
                # Create stations table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS stations (
                        id INTEGER PRIMARY KEY,
                        department_id INTEGER NOT NULL,
                        name TEXT NOT NULL,
                        station_number TEXT NOT NULL,
                        address TEXT,
                        city TEXT,
                        state TEXT,
                        zip_code TEXT,
                        latitude REAL,
                        longitude REAL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        personnel_count INTEGER DEFAULT 0,
                        apparatus TEXT DEFAULT '{}',
                        FOREIGN KEY (department_id) REFERENCES departments (id)
                    )
                ''')
                
                # Create incidents table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS incidents (
                        id INTEGER PRIMARY KEY,
                        department_id INTEGER NOT NULL,
                        title TEXT,
                        incident_number TEXT,
                        incident_date TIMESTAMP,
                        incident_type TEXT,
                        location TEXT,
                        latitude REAL,
                        longitude REAL,
                        data TEXT DEFAULT '{}',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (department_id) REFERENCES departments (id)
                    )
                ''')
                
                # Make SQLite compatible with JSON
                conn.execute("PRAGMA journal_mode=WAL")
                
                # Check if a department exists
                cursor.execute("SELECT COUNT(*) FROM departments")
                if cursor.fetchone()[0] == 0:
                    # Create a department with a random API key
                    api_key = f"fems_{uuid.uuid4().hex}"
                    webhook_events = '{"incident.created": true, "incident.updated": true, "station.created": false, "user.created": false}'
                    features_enabled = '{"incident_logger": true, "call_density": true, "isochrone_map": true, "dashboard": true}'
                    
                    cursor.execute('''
                        INSERT INTO departments 
                            (code, name, department_type, api_key, api_enabled, is_active, setup_complete, webhook_events, features_enabled)
                        VALUES
                            ('recovery', 'Recovery Department', 'combined', ?, 1, 1, 1, ?, ?)
                    ''', (api_key, webhook_events, features_enabled))
                    dept_id = cursor.lastrowid
                    
                    # Create super admin user
                    admin_email = 'admin@fireems.ai'
                    admin_password = os.environ.get('SUPER_ADMIN_PASSWORD', 'temp_' + secrets.token_urlsafe(12))
                    preferences = '{}'
                    cursor.execute('''
                        INSERT INTO users
                            (department_id, email, password_hash, name, role, is_active, preferences)
                        VALUES
                            (?, ?, ?, 'Emergency Admin', 'super_admin', 1, ?)
                    ''', (
                        dept_id, 
                        admin_email, 
                        hashlib.sha256(admin_password.encode()).hexdigest(),
                        preferences
                    ))
                    
                conn.commit()
                conn.close()
                
                return render_template_string(f'''
<!DOCTYPE html>
<html>
<head>
    <title>Fire-EMS Tools Recovery</title>
    <style>
        body {{ font-family: Arial, sans-serif; padding: 20px; }}
        .container {{ max-width: 800px; margin: 0 auto; }}
        .success {{ background-color: #d4edda; padding: 15px; border-radius: 5px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Database Initialized</h1>
        <div class="success">
            <p>The database has been successfully initialized.</p>
            <p>Admin credentials are set via environment variables:</p>
            <ul>
                <li>Email: admin@fireems.ai</li>
                <li>Password: Set via SUPER_ADMIN_PASSWORD environment variable</li>
            </ul>
            <p><a href="/login">Go to login page</a></p>
        </div>
    </div>
</body>
</html>
                ''')
            except Exception as ex:
                return jsonify({
                    'error': str(ex),
                    'traceback': traceback.format_exc()
                })
        
        app = minimal_app
        logger.info('Created minimal fallback application')

if __name__ == '__main__':
    logger.info('Running application directly from render_wsgi.py')
    if app:
        app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))