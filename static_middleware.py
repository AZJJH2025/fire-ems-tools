"""
Static file middleware for FireEMS.ai application.

This module provides proper static file handling to ensure correct MIME types
and other optimizations for static file serving.
"""

import os
import mimetypes
import traceback
import logging
from flask import send_from_directory, Blueprint, request, Response, current_app

# Set up specific logger for this module
logger = logging.getLogger('static_middleware')
logger.setLevel(logging.DEBUG)

# Register additional MIME types to ensure proper Content-Type headers
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/json', '.json')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('application/javascript', '.jsx') # Added JSX files

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
    try:
        # Check if we're running on Render
        is_render = os.environ.get('RENDER', 'false').lower() == 'true'
        
        # Set correct static folder based on environment
        if is_render:
            # Render deployment path
            static_folder = '/opt/render/project/src/static'
            logger.info(f"Using Render-specific static path: {static_folder}")
        else:
            # Local development path
            static_folder = os.path.join(os.getcwd(), 'static')
            logger.info(f"Using local development static path: {static_folder}")
        
        # Get the file extension
        _, ext = os.path.splitext(filename)
        
        # Get the appropriate MIME type
        mimetype = mimetypes.types_map.get(ext.lower())
        
        # Extra debug header for troubleshooting
        headers = {
            'X-Static-File': 'Served by static_middleware.py',
            'X-Original-Mimetype': str(mimetype),
            'X-Static-Path': static_folder
        }
        
        # Force JavaScript MIME type for .js files regardless of what's detected
        if ext.lower() in ['.js', '.jsx']:
            mimetype = 'application/javascript'
            logger.debug(f"Forcing application/javascript mimetype for {filename}")
        elif ext.lower() == '.css':
            mimetype = 'text/css'
            logger.debug(f"Forcing text/css mimetype for {filename}")
        
        # Add cache control headers for non-HTML files
        if ext.lower() not in ['.html', '.htm']:
            # Cache for 1 hour (3600 seconds)
            headers['Cache-Control'] = 'public, max-age=3600'
        
        # Log this request for debugging
        logger.info(f"Serving static file: {filename} with mimetype: {mimetype}")
        
        # Full file path for logging
        full_path = os.path.join(static_folder, filename)
        if not os.path.exists(full_path):
            logger.error(f"Static file not found: {full_path}")
            
            # List files in the directory to help diagnose
            try:
                parent_dir = os.path.dirname(full_path)
                if os.path.exists(parent_dir):
                    files_in_dir = os.listdir(parent_dir)
                    logger.error(f"Files in directory {parent_dir}: {files_in_dir}")
                    
                    # Try case-insensitive matching as a fallback
                    basename = os.path.basename(filename).lower()
                    found_match = False
                    for f in files_in_dir:
                        if f.lower() == basename:
                            # Found a case-insensitive match
                            actual_filename = os.path.join(os.path.dirname(filename), f)
                            full_path = os.path.join(static_folder, actual_filename)
                            logger.info(f"Found case-insensitive match: {f} for requested {filename}")
                            found_match = True
                            break
                    
                    if not found_match:
                        logger.error(f"No case-insensitive match found for {filename}")
                        return f"File not found: {filename}", 404
                else:
                    logger.error(f"Parent directory doesn't exist: {parent_dir}")
                    return f"File not found: {filename} (parent directory missing)", 404
            except Exception as e:
                logger.error(f"Error listing directory: {str(e)}")
                return f"Error checking for file: {str(e)}", 500
        
        logger.info(f"File exists at: {full_path}")
        logger.debug(f"File size: {os.path.getsize(full_path)} bytes")
        
        # Direct file serving as a fallback mechanism
        try:
            # Check if it's Render environment (which has different behavior with Flask's send_from_directory)
            is_render = os.environ.get('RENDER', 'false').lower() == 'true'
            
            if is_render:
                # On Render, read and serve the file directly instead of using send_from_directory
                with open(full_path, 'rb') as f:
                    content = f.read()
                
                logger.info(f"Serving {filename} directly on Render, size: {len(content)} bytes")
                response = Response(content, mimetype=mimetype)
                for key, value in headers.items():
                    response.headers[key] = value
                return response
            else:
                # Get response from send_from_directory without passing headers
                response = send_from_directory(
                    static_folder, 
                    filename if 'found_match' not in locals() or not found_match else actual_filename,
                    mimetype=mimetype,
                    as_attachment=False,
                    download_name=None,
                    conditional=True
                )
                
                # Add our custom headers to the response after it's created
                for key, value in headers.items():
                    response.headers[key] = value
                    
                return response
        except Exception as e:
            logger.error(f"Error using send_from_directory for {filename}: {str(e)}")
            logger.error(traceback.format_exc())
            
            # Fallback to direct file reading and serving
            with open(full_path, 'rb') as f:
                content = f.read()
            
            logger.info(f"Serving {filename} using fallback direct file reading method")
            response = Response(content, mimetype=mimetype)
            for key, value in headers.items():
                response.headers[key] = value
            return response
            
    except Exception as e:
        # Catch-all exception handler
        logger.error(f"Unhandled exception serving static file {filename}: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Try direct file reading as a last resort
        try:
            static_folder = os.path.join(os.getcwd(), 'static')
            full_path = os.path.join(static_folder, filename)
            
            if os.path.exists(full_path):
                _, ext = os.path.splitext(filename)
                
                # Determine MIME type
                if ext.lower() in ['.js', '.jsx']:
                    mimetype = 'application/javascript'
                elif ext.lower() == '.css':
                    mimetype = 'text/css'
                else:
                    mimetype = mimetypes.types_map.get(ext.lower(), 'application/octet-stream')
                
                # Read file directly
                with open(full_path, 'rb') as f:
                    content = f.read()
                
                logger.info(f"Emergency fallback: Serving {filename} with mimetype {mimetype}")
                response = Response(content, mimetype=mimetype)
                return response
            else:
                logger.error(f"Emergency fallback: File not found - {full_path}")
                return f"File not found: {filename}", 404
        except Exception as last_error:
            logger.critical(f"All attempts to serve {filename} failed: {str(last_error)}")
            return f"Server error: {str(e)}", 500

def register_static_handler(app):
    """
    Register the static file handler with the Flask app.
    
    Args:
        app: The Flask application instance
    """
    # Configure file logging for static middleware
    handler = logging.FileHandler('static_middleware.log')
    handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    logger.addHandler(handler)
    
    # Register the blueprint
    app.register_blueprint(static_bp)
    
    # Add direct static route as a fallback at the application level
    @app.route('/direct-static/<path:filename>')
    def direct_static_fallback(filename):
        """Alternative direct static file route that bypasses the blueprint system"""
        try:
            logger.info(f"Using direct-static fallback route for: {filename}")
            
            # Check if we're running on Render
            is_render = os.environ.get('RENDER', 'false').lower() == 'true'
            
            # Set correct static folder based on environment
            if is_render:
                # Render deployment path
                static_folder = '/opt/render/project/src/static'
                logger.info(f"Using Render-specific static path for direct-static: {static_folder}")
            else:
                # Local development path
                static_folder = os.path.join(os.getcwd(), 'static')
                logger.info(f"Using local development static path for direct-static: {static_folder}")
            
            full_path = os.path.join(static_folder, filename)
            
            if not os.path.exists(full_path):
                logger.error(f"Direct-static: File not found - {full_path}")
                return f"File not found: {filename}", 404
                
            # Get file extension and determine MIME type
            _, ext = os.path.splitext(filename)
            
            # Force appropriate MIME types
            if ext.lower() in ['.js', '.jsx']:
                mimetype = 'application/javascript'
            elif ext.lower() == '.css':
                mimetype = 'text/css'
            else:
                mimetype = mimetypes.types_map.get(ext.lower(), 'application/octet-stream')
            
            # Log file info
            logger.info(f"Direct-static: File exists at: {full_path}")
            file_size = os.path.getsize(full_path)
            logger.debug(f"Direct-static: File size: {file_size} bytes")
            
            # Read and serve the file directly
            with open(full_path, 'rb') as f:
                content = f.read()
            
            logger.info(f"Direct-static: Serving {filename} directly, content size: {len(content)} bytes")
            response = Response(content, mimetype=mimetype)
            response.headers['X-Served-By'] = 'direct-static fallback route'
            response.headers['Content-Length'] = str(len(content))
            return response
            
        except Exception as e:
            logger.error(f"Error in direct-static route for {filename}: {str(e)}")
            logger.error(traceback.format_exc())
            return f"Server error: {str(e)}", 500
    
    # Log static file configuration
    logger.info(f"Registered static file handler middleware")
    logger.info(f"Static folder: {os.path.join(os.getcwd(), 'static')}")
    logger.info(f"JavaScript MIME type: {mimetypes.types_map.get('.js')}")
    logger.info(f"Available fallback routes: /direct-static/, /app-static/")
    
    # Verify content-type mappings
    for ext in ['.js', '.css', '.jsx', '.json']:
        logger.info(f"MIME type for {ext}: {mimetypes.types_map.get(ext.lower())}")
        
    # List some static files to verify they exist
    static_dir = os.path.join(os.getcwd(), 'static')
    try:
        some_files = [f for f in os.listdir(static_dir) if f.endswith(('.js', '.css'))][:5]
        logger.info(f"Sample static files: {some_files}")
    except Exception as e:
        logger.error(f"Error listing static files: {str(e)}")