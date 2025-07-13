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
    
    # CRITICAL FIX: Build React app during Python startup on Render
    # This bypasses Render's buildCommand limitation for Python projects
    if os.environ.get('RENDER'):
        import subprocess
        import shutil
        
        logger.info("🚀 RENDER DETECTED: Building React app during Python startup...")
        
        react_dir = '/opt/render/project/src/react-app'
        app_dir = '/opt/render/project/src/app'
        
        # Check if React build is needed (missing or outdated)
        app_index = os.path.join(app_dir, 'index.html')
        should_build = True
        
        if os.path.exists(app_index):
            # Check if build is fresh (less than 5 minutes old)
            import time
            file_age = time.time() - os.path.getmtime(app_index)
            if file_age < 300:  # 5 minutes
                should_build = False
                logger.info("📋 React build is fresh, skipping rebuild")
        
        if should_build:
            try:
                logger.info("📦 Installing Node.js dependencies...")
                result = subprocess.run(
                    ['npm', 'install'], 
                    cwd=react_dir, 
                    capture_output=True, 
                    text=True, 
                    timeout=300
                )
                if result.returncode != 0:
                    logger.error(f"npm install failed: {result.stderr}")
                    raise Exception("npm install failed")
                
                logger.info("🔨 Building React app...")
                result = subprocess.run(
                    ['npm', 'run', 'build'], 
                    cwd=react_dir, 
                    capture_output=True, 
                    text=True, 
                    timeout=300
                )
                if result.returncode != 0:
                    logger.error(f"npm run build failed: {result.stderr}")
                    raise Exception("npm run build failed")
                
                logger.info("📋 Copying fresh build to app directory...")
                dist_dir = os.path.join(react_dir, 'dist')
                
                # Clear old app directory
                if os.path.exists(app_dir):
                    shutil.rmtree(app_dir)
                os.makedirs(app_dir, exist_ok=True)
                
                # Copy fresh build
                for item in os.listdir(dist_dir):
                    src = os.path.join(dist_dir, item)
                    dst = os.path.join(app_dir, item)
                    if os.path.isdir(src):
                        shutil.copytree(src, dst)
                    else:
                        shutil.copy2(src, dst)
                
                logger.info("✅ React build completed successfully! Latest hydrant fixes deployed.")
                
            except Exception as build_error:
                logger.error(f"❌ React build failed: {str(build_error)}")
                logger.warning("⚠️ Continuing with existing build if available...")
        else:
            logger.info("📋 Using existing React build")
    
    # Import the Flask app (using factory pattern)
    from app import create_app
    
    # Create the application
    flask_app = create_app()
    
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