"""
React Data Formatter Route

This module adds a route to serve the React version of the Data Formatter tool.
It integrates with the existing Flask application.

Usage:
1. Place this file in the root directory of the Flask application
2. Import and register this route in app.py after other blueprints
"""

from flask import Blueprint, send_from_directory, render_template, jsonify, url_for
import os
import logging
# Import the static path fix function
from static_path_fix import get_correct_static_path

logger = logging.getLogger(__name__)

# Create a blueprint for the React Data Formatter
react_formatter_bp = Blueprint('react_formatter', __name__, static_folder='static')

# Route to serve React app's main page
@react_formatter_bp.route('/data-formatter-react')
def data_formatter_react():
    """Serve the React version of the Data Formatter tool"""
    try:
        # Get the correct static directory
        static_dir = get_correct_static_path()
        if not static_dir:
            logger.error("Could not determine static directory path")
            return jsonify({"error": "Could not determine static directory path"}), 500
            
        # Path to the React build index.html
        react_index_path = os.path.join(static_dir, 'react-data-formatter', 'index.html')
        
        # Check if the file exists
        if os.path.exists(react_index_path):
            logger.info(f"Serving React Data Formatter from: {react_index_path}")
            # Return the React index.html file
            return send_from_directory(
                os.path.join(static_dir, 'react-data-formatter'),
                'index.html'
            )
        else:
            # Log error and return fallback template
            logger.error(f"React build not found at: {react_index_path}")
            return render_template('data-formatter.html', 
                                   error="React version not available, using standard version")
    except Exception as e:
        logger.error(f"Error serving React Data Formatter: {str(e)}")
        return jsonify({"error": f"Could not load React Data Formatter: {str(e)}"}), 500

# Route to serve React app's assets
@react_formatter_bp.route('/assets/<path:filename>')
def react_assets(filename):
    """Serve static assets for the React app"""
    try:
        static_dir = get_correct_static_path()
        if not static_dir:
            logger.error("Could not determine static directory path for assets")
            return jsonify({"error": "Could not determine static directory path"}), 500
            
        assets_dir = os.path.join(static_dir, 'react-data-formatter', 'assets')
        logger.info(f"Serving asset {filename} from {assets_dir}")
        return send_from_directory(assets_dir, filename)
    except Exception as e:
        logger.error(f"Error serving React asset {filename}: {str(e)}")
        return jsonify({"error": f"Could not load asset: {str(e)}"}), 500

# Route to serve other static files at the root level
@react_formatter_bp.route('/<path:filename>')
def react_root_files(filename):
    """Serve static files at the root of the React app (like favicon)"""
    try:
        if filename in ['favicon.svg', 'robots.txt', 'manifest.json']:
            static_dir = get_correct_static_path()
            if not static_dir:
                logger.error(f"Could not determine static directory path for root file {filename}")
                return jsonify({"error": "Could not determine static directory path"}), 500
                
            react_dir = os.path.join(static_dir, 'react-data-formatter')
            logger.info(f"Serving root file {filename} from {react_dir}")
            return send_from_directory(react_dir, filename)
        return "", 404
    except Exception as e:
        logger.error(f"Error serving React root file {filename}: {str(e)}")
        return jsonify({"error": f"Could not load file: {str(e)}"}), 500

def register_react_formatter_routes(app):
    """Register the React Data Formatter blueprint with the Flask app"""
    # Register with prefix for the main route
    app.register_blueprint(react_formatter_bp, url_prefix='/data-formatter-react')
    
    # Also register routes for assets without prefix to match what the HTML expects
    @app.route('/react-data-formatter/assets/<path:filename>')
    def react_assets_direct(filename):
        """Serve static assets for the React app at the expected path"""
        try:
            static_dir = get_correct_static_path()
            if not static_dir:
                logger.error("Could not determine static directory path for assets")
                return jsonify({"error": "Could not determine static directory path"}), 500
                
            assets_dir = os.path.join(static_dir, 'react-data-formatter', 'assets')
            logger.info(f"Serving asset {filename} from {assets_dir}")
            return send_from_directory(assets_dir, filename)
        except Exception as e:
            logger.error(f"Error serving React asset {filename}: {str(e)}")
            return jsonify({"error": f"Could not load asset: {str(e)}"}), 500
    
    # Add route for assets at the root path (what React expects)
    @app.route('/assets/<path:filename>')
    def react_assets_root(filename):
        """Serve React assets from /assets/ path"""
        try:
            static_dir = get_correct_static_path()
            if not static_dir:
                logger.error("Could not determine static directory path for root assets")
                return jsonify({"error": "Could not determine static directory path"}), 500
                
            assets_dir = os.path.join(static_dir, 'react-data-formatter', 'assets')
            logger.info(f"Serving root asset {filename} from {assets_dir}")
            return send_from_directory(assets_dir, filename)
        except Exception as e:
            logger.error(f"Error serving React root asset {filename}: {str(e)}")
            return jsonify({"error": f"Could not load asset: {str(e)}"}), 500
    
    logger.info("Registered React Data Formatter blueprint")