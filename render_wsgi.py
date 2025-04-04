import os
import sys
import traceback
import logging
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

# Try to import and create the main application
app = None
try:
    from app import create_app
    logger.info('Successfully imported create_app from app')
    app = create_app()
    logger.info('Successfully created main application')
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
        from flask import Flask, jsonify
        minimal_app = Flask(__name__)
        
        @minimal_app.route('/')
        def minimal_home():
            return 'Fire-EMS Tools Emergency Recovery Mode - Contact Support'
            
        @minimal_app.route('/error')
        def error_details():
            return jsonify({
                'main_app_error': str(e),
                'emergency_app_error': str(e2) if 'e2' in locals() else None,
                'python_version': sys.version,
                'environment': os.environ.get('FLASK_ENV', 'unknown')
            })
        
        app = minimal_app
        logger.info('Created minimal fallback application')

# Ensure the template folders exist in deployment
if app and hasattr(app, 'jinja_loader') and hasattr(app.jinja_loader, 'searchpath'):
    logger.info(f'Template searchpath: {app.jinja_loader.searchpath}')
    
    # Check for critical template folders
    for folder in ['templates', 'templates/auth', 'templates/errors']:
        full_path = os.path.join(os.getcwd(), folder)
        if not os.path.exists(full_path):
            logger.warning(f'Creating missing template directory: {full_path}')
            os.makedirs(full_path, exist_ok=True)
    
    # Create minimal templates if they don't exist
    templates_to_check = {
        'templates/auth/login.html': '''
<!DOCTYPE html>
<html>
<head>
    <title>Login - Fire-EMS Tools</title>
    <link rel="stylesheet" href="/static/styles.css">
</head>
<body>
    <div class="login-container">
        <h1>Fire-EMS Tools Login</h1>
        <form method="POST" action="/login">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
        </form>
        <p>Default admin: admin@fireems.ai / FireEMS2025!</p>
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
</head>
<body>
    <div class="error-container">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <a href="/" class="btn btn-primary">Return Home</a>
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
</head>
<body>
    <div class="error-container">
        <h1>500 - Server Error</h1>
        <p>An unexpected error occurred. Our team has been notified.</p>
        <a href="/" class="btn btn-primary">Return Home</a>
    </div>
</body>
</html>
        '''
    }
    
    for template_path, content in templates_to_check.items():
        full_path = os.path.join(os.getcwd(), template_path)
        if not os.path.exists(full_path):
            logger.warning(f'Creating missing template file: {full_path}')
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'w') as f:
                f.write(content)

if __name__ == '__main__':
    logger.info('Running application directly from render_wsgi.py')
    if app:
        app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))