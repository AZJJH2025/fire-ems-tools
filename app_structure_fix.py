"""
Simple app structure fix script for FireEMS.ai app.py

This script creates a very simplified version of app.py with the basic structure fixed.
It ensures that routes are defined after the Flask app instance is created.
"""

import logging
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Main fix function"""
    app_path = os.path.join(os.getcwd(), 'app.py')
    fixed_path = os.path.join(os.getcwd(), 'app_simple_fixed.py')
    
    # Create a simplified version of app.py with proper structure
    content = """from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, url_for, abort, flash, session, make_response
from flask_cors import CORS
import os
import logging
import traceback
from datetime import datetime
import json

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

def create_app(config_name='default'):
    \"\"\"Create and configure the Flask application\"\"\"
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
    
    # Set up CORS
    CORS(app)
    
    # Initialize extensions
    db.init_app(app)
    
    # Register the main routes
    @app.route('/')
    def index():
        \"\"\"Home page route\"\"\"
        return render_template('index.html')
    
    @app.route('/fire-map-pro')
    def fire_map_pro():
        \"\"\"FireMapPro route\"\"\"
        return render_template('fire-map-pro.html')
    
    @app.route('/call-volume-forecaster')
    def call_volume_forecaster():
        \"\"\"Call Volume Forecaster route\"\"\"
        return render_template('call-volume-forecaster.html')
    
    @app.route('/quick-stats')
    def quick_stats():
        \"\"\"Quick Stats route\"\"\"
        return render_template('quick-stats.html')
    
    @app.route('/data-formatter')
    def data_formatter():
        \"\"\"Data Formatter route\"\"\"
        return render_template('data-formatter.html')
    
    # Add diagnostic route for deployment verification
    @app.route('/deployment-status')
    def deployment_status():
        \"\"\"Check deployment status - a quick way to verify fixes are working\"\"\"
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
"""
    
    # Write the fixed file
    with open(fixed_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    logger.info(f"Created simplified fixed app.py at {fixed_path}")
    logger.info("This is a minimized version to verify the fix works. It only includes the basic routes.")
    logger.info("To fully restore all functionality, you'll need to merge this with the full app.py.")

if __name__ == "__main__":
    main()