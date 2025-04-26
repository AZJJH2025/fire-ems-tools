"""
Direct WSGI override for Render.com deployment
This completely bypasses the template files by adding direct route handlers
"""

import os
import sys
import logging
import traceback
from logging.handlers import RotatingFileHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler('direct_wsgi.log', maxBytes=10485760, backupCount=3),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('direct_wsgi')

logger.info('Starting direct_wsgi.py application wrapper')

# Import the application directly - no factory
try:
    from app import app
    logger.info('Successfully imported app directly')
except Exception as e:
    logger.error(f'Failed to import app directly: {str(e)}')
    logger.error(traceback.format_exc())
    
    # Create minimal fallback
    from flask import Flask, render_template_string, redirect, url_for, request, flash, jsonify
    import hashlib
    import sqlite3
    import uuid
    
    app = Flask(__name__)
    app.secret_key = os.environ.get('SECRET_KEY', 'dev_key_for_emergency')
    
    logger.info('Created minimal emergency application')

# Now override the critical route handlers directly

LOGIN_HTML = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - FireEMS.ai</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
            {% if messages %}
                {% for category, message in messages %}
                    <div class="alert alert-{{ category }}">
                        {{ message }}
                    </div>
                {% endfor %}
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

ERROR_404_HTML = '''
<!DOCTYPE html>
<html>
<head>
    <title>404 - Page Not Found</title>
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
'''

ERROR_500_HTML = '''
<!DOCTYPE html>
<html>
<head>
    <title>500 - Server Error</title>
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

# Route overrides
@app.route('/login', methods=['GET', 'POST'])
def direct_login():
    """Direct login route handler that bypasses templates"""
    logger.info('Direct login route handler called')
    
    messages = []
    if request.method == 'POST':
        try:
            email = request.form.get('email')
            password = request.form.get('password')
            
            if not email or not password:
                messages.append(('danger', 'Email and password are required'))
            else:
                # Connect to database
                conn = sqlite3.connect('fire_ems.db')
                cursor = conn.cursor()
                
                # Check if user exists
                cursor.execute("SELECT id, password_hash, department_id, role FROM users WHERE email = ?", (email,))
                user = cursor.fetchone()
                
                if user and user[1] == hashlib.sha256(password.encode()).hexdigest():
                    # Update last login
                    cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", (user[0],))
                    conn.commit()
                    
                    # Redirect to appropriate page based on role
                    if user[3] == 'super_admin':
                        return redirect('/admin/dashboard')
                    else:
                        return redirect('/dept/dashboard')
                else:
                    messages.append(('danger', 'Invalid email or password'))
                
                conn.close()
        except Exception as e:
            logger.error(f'Login error: {str(e)}')
            messages.append(('danger', 'An error occurred during login'))
    
    # Render login template directly
    return render_template_string(LOGIN_HTML, messages=messages)

@app.errorhandler(404)
def direct_not_found_error(error):
    """Direct 404 error handler that bypasses templates"""
    logger.info('Direct 404 error handler called')
    return render_template_string(ERROR_404_HTML), 404

@app.errorhandler(500)
def direct_server_error(error):
    """Direct 500 error handler that bypasses templates"""
    logger.error(f'500 error: {str(error)}')
    return render_template_string(ERROR_500_HTML), 500

@app.route('/emergency/init', methods=['GET'])
def emergency_init():
    """Direct database initialization"""
    try:
        import sqlite3
        import uuid
        import hashlib
        
        # Connect to the database
        conn = sqlite3.connect('fire_ems.db')
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
                    ('direct', 'Direct Recovery Department', 'combined', ?, 1, 1, 1, ?, ?)
            ''', (api_key, webhook_events, features_enabled))
            dept_id = cursor.lastrowid
            
            # Create super admin user
            admin_email = 'admin@fireems.ai'
            admin_password = 'FireEMS2025!'
            preferences = '{}'
            cursor.execute('''
                INSERT INTO users
                    (department_id, email, password_hash, name, role, is_active, preferences)
                VALUES
                    (?, ?, ?, 'Direct Admin', 'super_admin', 1, ?)
            ''', (
                dept_id, 
                admin_email, 
                hashlib.sha256(admin_password.encode()).hexdigest(),
                preferences
            ))
        
        conn.commit()
        conn.close()
        
        return render_template_string('''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Database Initialized</title>
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
                    margin: 0 auto;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    padding: 2rem;
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
                }
                
                .btn:hover {
                    background-color: #2980b9;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Database Initialized</h1>
                <div class="success">
                    <p>The database has been successfully initialized.</p>
                    <p><strong>Admin credentials:</strong></p>
                    <ul>
                        <li>Email: admin@fireems.ai</li>
                        <li>Password: FireEMS2025!</li>
                    </ul>
                </div>
                <p><a href="/login" class="btn">Go to Login</a></p>
            </div>
        </body>
        </html>
        ''')
    except Exception as e:
        logger.error(f'Database initialization error: {str(e)}')
        logger.error(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        })

if __name__ == '__main__':
    logger.info('Running application directly from direct_wsgi.py')
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))