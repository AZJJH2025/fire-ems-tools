"""
WSGI entry point for gunicorn.

This file is used by gunicorn to run the application, using:
gunicorn wsgi:app

It provides a safer entry point that handles exceptions properly.
"""

import os
import logging
import traceback
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Capture start time
start_time = datetime.utcnow()
logger.info(f"Starting application at {start_time.isoformat()}")

try:
    # Apply deployment fixes first
    import fix_deployment
    fix_deployment.apply_fixes()
    logger.info("Applied deployment fixes")
    
    # Import the Flask app
    from app import app as flask_app
    
    # Run database table fixes if needed
    try:
        from database import db
        fix_deployment.fix_database_tables(flask_app, db)
        logger.info("Database tables fixed successfully")
    except Exception as e:
        logger.error(f"Error fixing database tables: {str(e)}")
        
    # Create the WSGI application
    app = flask_app
    
except Exception as e:
    # Log the error
    logger.critical(f"Failed to initialize application: {str(e)}")
    logger.critical(traceback.format_exc())
    
    # Create a minimal emergency app
    from flask import Flask, jsonify
    
    app = Flask(__name__)
    
    @app.route('/')
    def emergency_home():
        return "Emergency mode - application failed to start properly. Check logs."
        
    @app.route('/error')
    def error_details():
        return f"Error: {str(e)}"

# Log that the application is ready    
logger.info(f"Application ready after {(datetime.utcnow() - start_time).total_seconds()} seconds")

# This is the object that gunicorn expects
if __name__ == "__main__":
    app.run()