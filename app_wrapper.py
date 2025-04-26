"""
App Wrapper: A wrapper for the main app that handles template issues
This preserves normal functionality while ensuring templates exist
"""

import os
import sys
import logging
import shutil
from logging.handlers import RotatingFileHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler('app_wrapper.log', maxBytes=10485760, backupCount=3),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('app_wrapper')

logger.info('Starting app_wrapper.py')

# Define the required templates
TEMPLATES_TO_CREATE = {
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
            {% with messages = get_flashed_messages(with_categories=true) %}
                {% if messages %}
                    {% for category, message in messages %}
                        <div class="alert alert-{{ category }}">
                            {{ message }}
                        </div>
                    {% endfor %}
                {% endif %}
            {% endwith %}
            
            <form action="{{ url_for('login') }}" method="POST">
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

# Create required directories and template files
for template_path, content in TEMPLATES_TO_CREATE.items():
    full_path = os.path.join(os.getcwd(), template_path)
    
    # Create directories if they don't exist
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    # Create the file if it doesn't exist or is empty
    if not os.path.exists(full_path) or os.path.getsize(full_path) == 0:
        logger.info(f'Creating template file: {full_path}')
        with open(full_path, 'w') as f:
            f.write(content)
    else:
        logger.info(f'Template file already exists: {full_path}')

logger.info('All template files have been created or verified')

# Create static directory if it doesn't exist
static_dir = os.path.join(os.getcwd(), 'static')
os.makedirs(static_dir, exist_ok=True)

# Create a basic CSS file if it doesn't exist
styles_css_path = os.path.join(static_dir, 'styles.css')
if not os.path.exists(styles_css_path) or os.path.getsize(styles_css_path) == 0:
    logger.info(f'Creating basic styles.css file')
    with open(styles_css_path, 'w') as f:
        f.write('''
/* Basic styles for Fire-EMS Tools */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    color: #333;
    background-color: #f5f8fa;
}
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
}
h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
    color: #2c3e50;
}
a {
    color: #3498db;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}
.btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
}
.btn:hover {
    background-color: #2980b9;
}
''')

# Now, import the main app
logger.info('Importing the main application...')
try:
    from app import app
    logger.info('Main application imported successfully')
except Exception as e:
    logger.error(f'Error importing main application: {str(e)}')
    # The import failed, so we need to create a minimal app
    from flask import Flask, render_template_string, redirect, url_for
    app = Flask(__name__)
    
    @app.route('/')
    def home():
        return render_template_string('''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Fire-EMS Tools</title>
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
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Fire-EMS Tools</h1>
                <p>The main application failed to load. Please check the logs for more information.</p>
                <a href="/login" class="btn">Try Login</a>
            </div>
        </body>
        </html>
        ''')
    
    @app.route('/login')
    def login():
        return redirect('/auth/login')
    
    logger.info('Created minimal fallback application')

# This file is meant to be used as a WSGI entry point
# The application will be available as app_wrapper.app
if __name__ == '__main__':
    # For local development
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))