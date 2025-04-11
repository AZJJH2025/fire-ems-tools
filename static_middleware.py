"""
Static file middleware for FireEMS.ai application.

This module provides proper static file handling to ensure correct MIME types
and other optimizations for static file serving.
"""

import os
import mimetypes
from flask import send_from_directory, Blueprint, request

# Register additional MIME types to ensure proper Content-Type headers
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/json', '.json')
mimetypes.add_type('image/svg+xml', '.svg')

# Create blueprint
static_bp = Blueprint('static_handler', __name__)

@static_bp.route('/static/<path:filename>')
def serve_static(filename):
    """
    Serve static files with proper MIME types and caching headers.
    
    Args:
        filename: The relative path to the file within the static directory
        
    Returns:
        The file with appropriate headers
    """
    static_folder = os.path.join(os.getcwd(), 'static')
    
    # Get the file extension
    _, ext = os.path.splitext(filename)
    
    # Get the appropriate MIME type
    mimetype = mimetypes.types_map.get(ext.lower())
    
    # Extra debug header for troubleshooting
    headers = {
        'X-Static-File': 'Served by static_middleware.py',
        'X-Original-Mimetype': str(mimetype),
    }
    
    # Force javascript mime type for .js files regardless of what's detected
    if ext.lower() == '.js':
        mimetype = 'application/javascript'
        
    # Add cache control headers for non-HTML files
    if ext.lower() not in ['.html', '.htm']:
        # Cache for 1 hour (3600 seconds)
        headers['Cache-Control'] = 'public, max-age=3600'
    
    return send_from_directory(
        static_folder, 
        filename,
        mimetype=mimetype,
        as_attachment=False,
        download_name=None,
        conditional=True,
        headers=headers
    )

def register_static_handler(app):
    """
    Register the static file handler with the Flask app.
    
    Args:
        app: The Flask application instance
    """
    app.register_blueprint(static_bp)
    
    # Log static file configuration
    app.logger.info(f"Registered static file handler middleware")
    app.logger.info(f"Static folder: {os.path.join(os.getcwd(), 'static')}")
    app.logger.info(f"JavaScript MIME type: {mimetypes.types_map.get('.js')}")