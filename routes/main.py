"""
Main routes for Fire EMS Tools
All legacy template routes removed after cleanup - use React app at /app/* instead
"""

import logging
import os
from flask import Blueprint, redirect

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('main', __name__)

@bp.route("/")
def index():
    """Home page route - serve React app directly"""
    from flask import current_app
    from routes.react_app import get_react_build_dir
    import os
    
    try:
        react_build_dir = get_react_build_dir()
        index_path = os.path.join(react_build_dir, 'index.html')
        
        if os.path.exists(index_path):
            # Read the HTML and fix asset paths
            with open(index_path, 'r') as f:
                html_content = f.read()
            
            # For root route, assets should be available at /app/assets/
            html_content = html_content.replace('src="/assets/', 'src="/app/assets/')
            html_content = html_content.replace('href="/assets/', 'href="/app/assets/')
            
            from flask import Response
            return Response(html_content, mimetype='text/html')
        else:
            # Fallback to redirect if React build not found
            return redirect('/app/')
    except Exception as e:
        # Fallback to redirect on any error
        return redirect('/app/')

# All other legacy routes removed - templates deleted during cleanup
# Use the modern React app at:
# - /app/ (homepage)
# - /app/data-formatter 
# - /app/response-time-analyzer
# - /app/fire-map-pro