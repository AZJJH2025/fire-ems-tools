"""
React Data Formatter Route

This module adds a route to serve the React version of the Data Formatter tool.
It integrates with the existing Flask application.

Usage:
1. Place this file in the root directory of the Flask application
2. Import and register this route in app.py after other blueprints
"""

from flask import Blueprint, send_from_directory, render_template, jsonify
import os
import logging

logger = logging.getLogger(__name__)

# Create a blueprint for the React Data Formatter
react_formatter_bp = Blueprint('react_formatter', __name__)

@react_formatter_bp.route('/data-formatter-react')
def data_formatter_react():
    """Serve the React version of the Data Formatter tool"""
    try:
        # Path to the React build index.html
        react_index_path = os.path.join(os.getcwd(), 'static', 'react-data-formatter', 'index.html')
        
        # Check if the file exists
        if os.path.exists(react_index_path):
            logger.info(f"Serving React Data Formatter from: {react_index_path}")
            # Return the React index.html file
            return send_from_directory(
                os.path.join(os.getcwd(), 'static', 'react-data-formatter'),
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

def register_react_formatter_routes(app):
    """Register the React Data Formatter blueprint with the Flask app"""
    app.register_blueprint(react_formatter_bp)
    logger.info("Registered React Data Formatter blueprint")