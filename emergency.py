"""
Emergency Flask application that runs when the main app fails.
This provides basic diagnostics and error reporting.
"""

from flask import Flask, jsonify, render_template_string
import os
import sys
import traceback
import logging
import sqlite3
import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_emergency_app():
    """Factory function to create the emergency app"""
    logger.info("Creating emergency application")
    emergency_app = Flask(__name__)
    
    # Register routes on the emergency app
    register_emergency_routes(emergency_app)
    
    logger.info("Emergency application created successfully")
    return emergency_app

# Create a basic emergency app
app = Flask(__name__)

BASIC_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Fire-EMS Tools Emergency Mode</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
        h1 { color: #d9534f; }
        h2 { color: #5bc0de; margin-top: 30px; }
        .container { max-width: 900px; margin: 0 auto; }
        .error { background-color: #f2dede; border: 1px solid #ebccd1; color: #a94442; padding: 15px; border-radius: 4px; }
        .success { background-color: #dff0d8; border: 1px solid #d6e9c6; color: #3c763d; padding: 15px; border-radius: 4px; }
        .info { background-color: #d9edf7; border: 1px solid #bce8f1; color: #31708f; padding: 15px; border-radius: 4px; }
        pre { background-color: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .action-button { 
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #337ab7; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Fire-EMS Tools Emergency Mode</h1>
        <div class="error">
            <h2>Application Error</h2>
            <p>The main application encountered an error during startup. This emergency mode provides diagnostics and recovery options.</p>
        </div>
        
        {{ content | safe }}
        
        <h2>Actions</h2>
        <p>
            <a href="/emergency/db-init" class="action-button">Initialize Database</a>
            <a href="/emergency/diagnostics" class="action-button">Run Diagnostics</a>
            <a href="/emergency/create-admin" class="action-button">Create Admin</a>
        </p>
    </div>
</body>
</html>
"""

def register_emergency_routes(app):
    """Register all emergency routes on the given Flask app"""
    
    @app.route('/')
    def emergency_home():
        """Emergency home page"""
        content = """
        <h2>Status</h2>
        <div class="info">
            <p>The application is running in emergency mode because the main application failed to start.</p>
            <p>Use the buttons below to diagnose and fix common issues.</p>
        </div>
        """
        return render_template_string(BASIC_HTML, content=content)
    
    @app.route('/error')
    def error_details():
        """Show error details if available"""
        error_file = 'error_log.txt'
        error_content = "No error details available."
        
        try:
            if os.path.exists(error_file):
                with open(error_file, 'r') as f:
                    error_content = f.read()
        except Exception as e:
            error_content = f"Error reading error log: {str(e)}"
        
        content = f"""
        <h2>Error Details</h2>
        <div class="error">
            <pre>{error_content}</pre>
        </div>
        """
        return render_template_string(BASIC_HTML, content=content)
    
    @app.route('/emergency/diagnostics')
    def run_diagnostics():
        """Run basic diagnostics"""
    results = []
    
    # Check Python version
    results.append(("Python Version", sys.version, "info"))
    
    # Check environment
    env_vars = []
    important_vars = ['FLASK_ENV', 'DATABASE_URL', 'SQLALCHEMY_DATABASE_URI']
    for var in important_vars:
        env_vars.append(f"{var}: {os.environ.get(var, 'Not set')}")
    results.append(("Environment Variables", "<br>".join(env_vars), "info"))
    
    # Check database
    try:
        db_path = 'fire_ems.db'
        if os.path.exists(db_path):
            results.append(("Database File", f"Exists at {db_path}, Size: {os.path.getsize(db_path)/1024:.2f} KB", "success"))
            
            # Try to open and read tables
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            table_list = ", ".join([t[0] for t in tables])
            results.append(("Database Tables", f"Found {len(tables)} tables: {table_list}", "success"))
            
            # Check if departments table exists and get contents
            if 'departments' in [t[0] for t in tables]:
                cursor.execute("SELECT COUNT(*) FROM departments")
                dept_count = cursor.fetchone()[0]
                results.append(("Departments", f"Found {dept_count} departments", "success"))
            else:
                results.append(("Departments", "Table not found", "error"))
                
            # Check if users table exists and get contents
            if 'users' in [t[0] for t in tables]:
                cursor.execute("SELECT COUNT(*) FROM users")
                user_count = cursor.fetchone()[0]
                results.append(("Users", f"Found {user_count} users", "success"))
            else:
                results.append(("Users", "Table not found", "error"))
                
            conn.close()
        else:
            results.append(("Database File", f"Not found at {db_path}", "error"))
    except Exception as e:
        results.append(("Database Check", f"Error: {str(e)}", "error"))
    
    # Check file system permissions
    try:
        test_file = 'test_write.txt'
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)
        results.append(("File System", "Write permissions OK", "success"))
    except Exception as e:
        results.append(("File System", f"Write permission error: {str(e)}", "error"))
    
    # Build the content
    content = "<h2>Diagnostics Results</h2>"
    for name, result, result_type in results:
        content += f"""
        <h3>{name}</h3>
        <div class="{result_type}">
            <p>{result}</p>
        </div>
        """
    
    return render_template_string(BASIC_HTML, content=content)

@app.route('/emergency/db-init')
def initialize_database():
    """Initialize the database"""
    try:
        # Define the tables we need
        tables = {
            'departments': '''
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
            ''',
            'users': '''
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
            ''',
            'stations': '''
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
            ''',
            'incidents': '''
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
            '''
        }
        
        # Connect to the database
        conn = sqlite3.connect('fire_ems.db')
        cursor = conn.cursor()
        
        # Create tables
        for table_name, sql in tables.items():
            cursor.execute(sql)
            
        # Create a test department if none exists
        cursor.execute("SELECT COUNT(*) FROM departments")
        if cursor.fetchone()[0] == 0:
            # Generate a UUID-like API key
            import uuid
            api_key = f"fems_{uuid.uuid4().hex}_{os.urandom(4).hex()}"
            
            # Insert test department
            cursor.execute('''
                INSERT INTO departments (code, name, department_type, api_key, api_enabled, is_active, setup_complete)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', ('test', 'Test Department', 'combined', api_key, 1, 1, 1))
            
            dept_id = cursor.lastrowid
            
            # From werkzeug.security import generate_password_hash
            import hashlib
            def generate_password_hash(password):
                # Simple hash for emergency mode
                return hashlib.sha256(password.encode()).hexdigest()
            
            # Insert super admin user
            cursor.execute('''
                INSERT INTO users (department_id, email, password_hash, name, role)
                VALUES (?, ?, ?, ?, ?)
            ''', (dept_id, 'admin@fireems.ai', generate_password_hash('FireEMS2025!'), 'System Administrator', 'super_admin'))
            
        conn.commit()
        conn.close()
        
        results = "Database initialized successfully! Created all necessary tables and a default super admin user."
        result_type = "success"
        
    except Exception as e:
        results = f"Error initializing database: {str(e)}\n\n{traceback.format_exc()}"
        result_type = "error"
    
    content = f"""
    <h2>Database Initialization</h2>
    <div class="{result_type}">
        <pre>{results}</pre>
    </div>
    <p>Default login: <strong>admin@fireems.ai</strong> / <strong>FireEMS2025!</strong></p>
    """
    
    return render_template_string(BASIC_HTML, content=content)

@app.route('/emergency/create-admin')
def create_admin():
    """Create admin user manually"""
    try:
        import uuid
        import hashlib
        
        # Connect to the database
        conn = sqlite3.connect('fire_ems.db')
        cursor = conn.cursor()
        
        # Check if departments table exists, if not create it
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='departments'")
        if not cursor.fetchone():
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
        
        # Create a default department if it doesn't exist
        cursor.execute("SELECT id FROM departments WHERE code='emergency'")
        result = cursor.fetchone()
        if result:
            dept_id = result[0]
        else:
            # Generate API key
            api_key = f"fems_{uuid.uuid4().hex}_{os.urandom(4).hex()}"
            
            # Insert emergency department
            cursor.execute('''
                INSERT INTO departments (code, name, department_type, api_key, api_enabled, is_active, setup_complete)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', ('emergency', 'Emergency Department', 'combined', api_key, 1, 1, 1))
            
            dept_id = cursor.lastrowid
        
        # Check if users table exists, if not create it
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if not cursor.fetchone():
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
        
        # Simple password hashing for emergency mode
        def generate_password_hash(password):
            return hashlib.sha256(password.encode()).hexdigest()
        
        # Create the admin user
        email = 'emergency@fireems.ai'
        password = 'Emergency2025!'
        password_hash = generate_password_hash(password)
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email=?", (email,))
        if cursor.fetchone():
            # Update existing user
            cursor.execute('''
                UPDATE users 
                SET password_hash=?, role='super_admin', is_active=1, department_id=?
                WHERE email=?
            ''', (password_hash, dept_id, email))
            message = f"Updated existing user: {email}"
        else:
            # Create new user
            cursor.execute('''
                INSERT INTO users (department_id, email, password_hash, name, role, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (dept_id, email, password_hash, 'Emergency Admin', 'super_admin', 1))
            message = f"Created new admin user: {email}"
        
        conn.commit()
        conn.close()
        
        content = f"""
        <h2>Admin User Created</h2>
        <div class="success">
            <p>{message}</p>
            <p>You can now log in with:</p>
            <ul>
                <li><strong>Email:</strong> {email}</li>
                <li><strong>Password:</strong> {password}</li>
            </ul>
        </div>
        <p><a href="/login" class="action-button">Go to Login Page</a></p>
        """
        
    except Exception as e:
        content = f"""
        <h2>Error Creating Admin</h2>
        <div class="error">
            <p>Error: {str(e)}</p>
            <pre>{traceback.format_exc()}</pre>
        </div>
        """
    
    return render_template_string(BASIC_HTML, content=content)

@app.route('/login')
def login():
    """Redirect to main app login if possible"""
    return render_template_string(BASIC_HTML, content="""
    <h2>Login Redirect</h2>
    <div class="info">
        <p>Attempting to redirect to the main login page. If it doesn't work, the main application is still down.</p>
        <p>Try using the emergency tools first to initialize the database and create an admin user.</p>
    </div>
    <script>
        setTimeout(function() {
            window.location.href = "/login";
        }, 2000);
    </script>
    """)

# Register routes on the standalone app
register_emergency_routes(app)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)