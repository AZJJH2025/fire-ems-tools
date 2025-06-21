#!/usr/bin/env python3
"""
Simple Flask server to serve the built React app from the static directory.
"""
from flask import Flask, send_from_directory, request, redirect
import os
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("react_formatter_server.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__, static_folder="static")

# Path to the built React app
REACT_APP_DIR = os.path.join("static", "react-data-formatter")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """
    Serve the React app. For any path:
    1. Try to serve the file directly if it exists
    2. Otherwise, serve index.html to let React handle routing
    """
    logger.info(f"Request for path: {path}")
    
    # Check if the requested file exists
    if path and os.path.exists(os.path.join(REACT_APP_DIR, path)):
        logger.info(f"Serving file: {path}")
        return send_from_directory(REACT_APP_DIR, path)
    
    # For root path, serve index.html
    if not path:
        logger.info("Serving index.html for root path")
        return send_from_directory(REACT_APP_DIR, 'index.html')
    
    # For assets paths, serve directly
    if path.startswith('assets/'):
        file_path = path.replace('assets/', '')
        asset_dir = os.path.join(REACT_APP_DIR, 'assets')
        logger.info(f"Serving asset: {file_path} from {asset_dir}")
        return send_from_directory(asset_dir, file_path)
    
    # For any other path, serve index.html and let React handle routing
    logger.info(f"Path {path} not found, serving index.html")
    return send_from_directory(REACT_APP_DIR, 'index.html')

if __name__ == '__main__':
    # Get the port from command line args or use default
    port = int(os.environ.get("PORT", 7777))
    
    # Verify that the React app directory exists
    if not os.path.isdir(REACT_APP_DIR):
        logger.error(f"React app directory {REACT_APP_DIR} does not exist. Make sure to build the app first.")
        sys.exit(1)
    
    # Verify that index.html exists
    if not os.path.isfile(os.path.join(REACT_APP_DIR, 'index.html')):
        logger.error(f"index.html not found in {REACT_APP_DIR}. Make sure to build the app properly.")
        sys.exit(1)
    
    # Log available files
    logger.info(f"Available files in {REACT_APP_DIR}:")
    for root, dirs, files in os.walk(REACT_APP_DIR):
        for file in files:
            logger.info(f"  {os.path.join(root, file)}")
    
    # Start the server
    logger.info(f"Starting server on port {port}")
    logger.info(f"Access the new data formatter at: http://localhost:{port}/")
    app.run(host='0.0.0.0', port=port, debug=True)