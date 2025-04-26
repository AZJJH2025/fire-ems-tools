#!/usr/bin/env python3
"""
Completely standalone minimal application for emergency recovery
This does not import anything from the main app
"""

import os
import sys
import logging
import hashlib
import sqlite3
import uuid
import traceback
from logging.handlers import RotatingFileHandler
from flask import Flask, render_template_string, redirect, request, jsonify, Response

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler('standalone.log', maxBytes=10485760, backupCount=3),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('standalone')
logger.info('Starting standalone emergency application')

# Create a completely standalone Flask app
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'standalone_emergency_key')

# HTML Templates as strings
HOME_HTML = '''
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
            <h2>Emergency Recovery Mode</h2>
            <p>This is a standalone emergency recovery application for Fire-EMS Tools. Use this to initialize your database and recover access.</p>
            <a href="/login" class="btn">Login</a>
            <a href="/init" class="btn">Initialize Database</a>
        </div>
    </div>
    
    <div class="container">
        <div class="features">
            <div class="feature">
                <h3>Login</h3>
                <p>Access your Fire-EMS Tools account</p>
                <a href="/login" class="btn">Login</a>
            </div>
            <div class="feature">
                <h3>Initialize Database</h3>
                <p>Reset and initialize the database with default admin user</p>
                <a href="/init" class="btn">Initialize</a>
            </div>
            <div class="feature">
                <h3>System Status</h3>
                <p>Check the system status and configuration</p>
                <a href="/status" class="btn">Check Status</a>
            </div>
        </div>
    </div>
    
    <footer>
        <div class="container">
            <p>&copy; 2025 Fire-EMS Tools | Emergency Recovery Mode</p>
        </div>
    </footer>
</body>
</html>
'''

LOGIN_HTML = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Fire-EMS Tools</title>
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
            <div class="logo">🚒</div>
            <h1 class="login-title">Fire-EMS Tools Login</h1>
        </div>
        
        <div class="login-form">
            {% if error %}
                <div class="alert alert-danger">
                    {{ error }}
                </div>
            {% endif %}
            
            {% if success %}
                <div class="alert alert-success">
                    {{ success }}
                </div>
            {% endif %}
            
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
                <p><small>Default admin: admin@fireems.ai / FireEMS2025!</small></p>
            </div>
        </div>
    </div>
</body>
</html>
'''

SUCCESS_HTML = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Success - Fire-EMS Tools</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f8fa;
            color: #333;
        }
        
        .container {
            max-width: 800px;
            margin: 50px auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            text-align: center;
        }
        
        h1 {
            color: #3498db;
            margin-top: 0;
        }
        
        .success {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            text-align: left;
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
            margin-top: 20px;
        }
        
        .btn:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>{{ title }}</h1>
        <div class="success">
            {{ message | safe }}
        </div>
        <a href="{{ back_url }}" class="btn">{{ back_text }}</a>
    </div>
</body>
</html>
'''

ERROR_HTML = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Fire-EMS Tools</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f8fa;
            color: #333;
        }
        
        .container {
            max-width: 800px;
            margin: 50px auto;
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
        
        .error {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            text-align: left;
            white-space: pre-wrap;
            overflow-x: auto;
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
            margin-top: 20px;
        }
        
        .btn:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>{{ title }}</h1>
        <div class="error">
            {{ message | safe }}
        </div>
        <a href="{{ back_url }}" class="btn">{{ back_text }}</a>
    </div>
</body>
</html>
'''

DATABASE_PATH = 'fire_ems.db'

# Helper functions
def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def init_database():
    """Initialize the database with tables and default admin user"""
    try:
        # Connect to database
        conn = sqlite3.connect(DATABASE_PATH)
        conn.execute("PRAGMA journal_mode=WAL")
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
        
        # Check if we need to create default department and admin
        cursor.execute("SELECT COUNT(*) FROM departments")
        if cursor.fetchone()[0] == 0:
            # Create a department
            api_key = f"fems_{uuid.uuid4().hex}"
            webhook_events = '{"incident.created": true, "incident.updated": true, "station.created": false, "user.created": false}'
            features_enabled = '{"incident_logger": true, "call_density": true, "isochrone_map": true, "dashboard": true}'
            
            cursor.execute('''
                INSERT INTO departments 
                    (code, name, department_type, api_key, api_enabled, is_active, setup_complete, webhook_events, features_enabled)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                'standalone', 
                'Standalone Recovery Department', 
                'combined', 
                api_key, 
                1, 
                1, 
                1, 
                webhook_events, 
                features_enabled
            ))
            dept_id = cursor.lastrowid
            
            # Create admin user
            admin_email = 'admin@fireems.ai'
            admin_password = 'FireEMS2025!'
            preferences = '{}'
            cursor.execute('''
                INSERT INTO users
                    (department_id, email, password_hash, name, role, is_active, preferences)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?)
            ''', (
                dept_id, 
                admin_email, 
                hash_password(admin_password),
                'Standalone Admin', 
                'super_admin', 
                1, 
                preferences
            ))
            
            logger.info(f"Created default department with ID {dept_id} and admin user")
        
        conn.commit()
        conn.close()
        return True, "Database initialized successfully"
    except Exception as e:
        logger.error(f"Database initialization error: {str(e)}")
        logger.error(traceback.format_exc())
        return False, f"Error initializing database: {str(e)}"

def authenticate_user(email, password):
    """Authenticate a user against the database"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Find user by email
        cursor.execute('''
            SELECT id, password_hash, role, department_id, name 
            FROM users 
            WHERE email = ? AND is_active = 1
        ''', (email,))
        
        user = cursor.fetchone()
        if not user:
            return False, "Invalid email or password"
        
        user_id, stored_hash, role, dept_id, name = user
        
        # Check password
        if hash_password(password) != stored_hash:
            return False, "Invalid email or password"
        
        # Update last login timestamp
        cursor.execute('''
            UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
        ''', (user_id,))
        
        conn.commit()
        conn.close()
        
        return True, {
            'id': user_id,
            'email': email,
            'role': role,
            'department_id': dept_id,
            'name': name
        }
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return False, f"Database error: {str(e)}"

def get_db_status():
    """Get database status information"""
    try:
        if not os.path.exists(DATABASE_PATH):
            return {
                'exists': False,
                'size': 0,
                'tables': [],
                'departments': 0,
                'users': 0
            }
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Get list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        # Count departments
        departments = 0
        if 'departments' in tables:
            cursor.execute("SELECT COUNT(*) FROM departments")
            departments = cursor.fetchone()[0]
        
        # Count users
        users = 0
        if 'users' in tables:
            cursor.execute("SELECT COUNT(*) FROM users")
            users = cursor.fetchone()[0]
        
        # Get file size
        size = os.path.getsize(DATABASE_PATH)
        
        conn.close()
        
        return {
            'exists': True,
            'size': size,
            'tables': tables,
            'departments': departments,
            'users': users
        }
    except Exception as e:
        logger.error(f"Status error: {str(e)}")
        return {
            'error': str(e)
        }

# Route handlers
@app.route('/')
def home():
    """Home page"""
    return render_template_string(HOME_HTML)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page and handler"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not email or not password:
            return render_template_string(LOGIN_HTML, error="Email and password are required")
        
        success, result = authenticate_user(email, password)
        if not success:
            return render_template_string(LOGIN_HTML, error=result)
        
        # User authenticated successfully
        role = result['role']
        if role == 'super_admin':
            return redirect('/admin/dashboard')
        else:
            return redirect('/dept/dashboard')
    
    return render_template_string(LOGIN_HTML)

@app.route('/init')
def initialize():
    """Initialize the database"""
    success, message = init_database()
    
    if success:
        db_status = get_db_status()
        details = f"""
        <p>{message}</p>
        <p><strong>Database Status:</strong></p>
        <ul>
            <li>Tables: {', '.join(db_status['tables'])}</li>
            <li>Departments: {db_status['departments']}</li>
            <li>Users: {db_status['users']}</li>
            <li>Size: {db_status['size'] / 1024:.2f} KB</li>
        </ul>
        <p><strong>Default Admin Credentials:</strong></p>
        <ul>
            <li>Email: admin@fireems.ai</li>
            <li>Password: FireEMS2025!</li>
        </ul>
        """
        return render_template_string(
            SUCCESS_HTML, 
            title="Database Initialized", 
            message=details,
            back_url="/login",
            back_text="Go to Login"
        )
    else:
        return render_template_string(
            ERROR_HTML, 
            title="Database Initialization Error", 
            message=message,
            back_url="/",
            back_text="Return Home"
        )

@app.route('/status')
def status():
    """System status page"""
    db_status = get_db_status()
    
    if 'error' in db_status:
        message = f"Error getting database status: {db_status['error']}"
        return render_template_string(
            ERROR_HTML, 
            title="System Status Error", 
            message=message,
            back_url="/",
            back_text="Return Home"
        )
    
    message = f"""
    <h2>System Information</h2>
    <ul>
        <li><strong>Python:</strong> {sys.version}</li>
        <li><strong>Environment:</strong> {os.environ.get('FLASK_ENV', 'production')}</li>
        <li><strong>Working Directory:</strong> {os.getcwd()}</li>
    </ul>
    
    <h2>Database Status</h2>
    <ul>
        <li><strong>Database File:</strong> {DATABASE_PATH} ({'Exists' if db_status['exists'] else 'Missing'})</li>
        <li><strong>Size:</strong> {db_status['size'] / 1024:.2f} KB</li>
        <li><strong>Tables:</strong> {', '.join(db_status['tables']) if db_status['tables'] else 'None'}</li>
        <li><strong>Departments:</strong> {db_status['departments']}</li>
        <li><strong>Users:</strong> {db_status['users']}</li>
    </ul>
    """
    
    return render_template_string(
        SUCCESS_HTML, 
        title="System Status", 
        message=message,
        back_url="/",
        back_text="Return Home"
    )

@app.route('/admin/dashboard')
def admin_dashboard():
    """Placeholder admin dashboard"""
    return render_template_string(
        SUCCESS_HTML, 
        title="Admin Dashboard", 
        message="<p>This is a placeholder for the admin dashboard.</p><p>In the full application, you would see admin controls here.</p>",
        back_url="/",
        back_text="Return Home"
    )

@app.route('/dept/dashboard')
def dept_dashboard():
    """Placeholder department dashboard"""
    return render_template_string(
        SUCCESS_HTML, 
        title="Department Dashboard", 
        message="<p>This is a placeholder for the department dashboard.</p><p>In the full application, you would see department controls here.</p>",
        back_url="/",
        back_text="Return Home"
    )

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors"""
    return render_template_string(
        ERROR_HTML, 
        title="404 - Page Not Found", 
        message="The page you requested could not be found.",
        back_url="/",
        back_text="Return Home"
    ), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return render_template_string(
        ERROR_HTML, 
        title="500 - Server Error", 
        message="An unexpected error occurred on the server.",
        back_url="/",
        back_text="Return Home"
    ), 500

# Stand-alone running
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))