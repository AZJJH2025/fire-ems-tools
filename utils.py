"""
Utility functions and decorators for the FireEMS.ai application.

This module contains common utility functions and decorators that are used across
the application, extracted to avoid circular imports.
"""

import logging
import functools
from flask import request, jsonify, current_app, g

logger = logging.getLogger(__name__)

# Create a safer rate limiting decorator
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    
    # Define limiter as a global that will be initialized later
    limiter = None
    
    def init_limiter(app):
        """Initialize the limiter with the Flask app"""
        global limiter
        limiter = Limiter(
            app,
            key_func=get_remote_address,
            default_limits=["200 per hour", "50 per minute"]
        )
        return limiter
    
    # Create a safer limit decorator
    def safe_limit(limit_string, **kwargs):
        """A safer version of limiter.limit that won't fail if limiter is not working"""
        def decorator(f):
            @functools.wraps(f)
            def decorated_function(*args, **kwargs):
                global limiter
                if limiter is not None:
                    try:
                        # Try to use the real limiter
                        decorated = limiter.limit(limit_string)(f)
                        return decorated(*args, **kwargs)
                    except Exception as e:
                        # If it fails, just return the original function
                        logger.warning(f"Rate limiting failed, continuing without limits: {str(e)}")
                        return f(*args, **kwargs)
                else:
                    # If limiter is not initialized, just return the original function
                    return f(*args, **kwargs)
            return decorated_function
        return decorator
except ImportError:
    # Create dummy functions if limiter is not available
    def init_limiter(app):
        logger.warning("Flask-Limiter not installed, rate limiting disabled")
        return None
    
    def safe_limit(limit_string, **kwargs):
        """Dummy decorator when limiter is not available"""
        def decorator(f):
            return f
        return decorator

# API key authentication decorator
def require_api_key(f):
    """Decorator to require API key authentication"""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        
        if not api_key:
            return jsonify({"error": "API key is required"}), 401
        
        # Import here to avoid circular imports
        from database import Department
        
        # Find department with this API key
        department = Department.query.filter_by(api_key=api_key).first()
        
        if not department:
            return jsonify({"error": "Invalid API key"}), 401
        
        # Check if department is active
        if not department.is_active:
            return jsonify({"error": "Department is inactive"}), 403
        
        # Add department to kwargs
        kwargs['department'] = department
        
        # Store department in g for other functions to access
        g.department = department
        
        return f(*args, **kwargs)
    
    return decorated_function

# File upload helper functions
def allowed_file(filename, allowed_extensions):
    """Check if a filename has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def get_upload_path():
    """Get the upload directory path, creating it if it doesn't exist"""
    import os
    upload_path = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(upload_path, exist_ok=True)
    return upload_path

def get_files_path():
    """Get the data files path, creating it if it doesn't exist"""
    import os
    data_path = os.path.join(current_app.root_path, 'data', 'uploads')
    os.makedirs(data_path, exist_ok=True)
    return data_path