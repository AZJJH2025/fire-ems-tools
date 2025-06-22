"""
React App routes for FireEMS.ai application.

This module serves the new React application build, completely separate from
the legacy HTML templates.
"""

from flask import Blueprint, send_from_directory, current_app, abort
import os
import logging

logger = logging.getLogger(__name__)

# Create blueprint for React app
bp = Blueprint('react_app', __name__)

def get_react_build_dir():
    """Get the React build directory path"""
    # Check if we're in a Render environment or local development
    if os.environ.get('RENDER'):
        # On Render, use the app directory in project root (where we copy our React build)
        react_build_dir = '/opt/render/project/src/app'
    else:
        # Local development - check app directory first (our deploy location), then react-app/dist
        project_root = os.path.dirname(current_app.static_folder)
        app_build_dir = os.path.join(project_root, 'app')
        
        # Check if app/index.html exists (our deployed build)
        if os.path.exists(os.path.join(app_build_dir, 'index.html')):
            react_build_dir = app_build_dir
        else:
            # Fallback to react-app/dist for development
            react_build_dir = os.path.join(project_root, 'react-app', 'dist')
    return react_build_dir

@bp.route('/app')
@bp.route('/app/')
@bp.route('/app/<path:path>')
def react_app(path=''):
    """
    Serve the React application for all /app routes
    This includes Fire Map Pro, Data Formatter, Response Time Analyzer, etc.
    """
    try:
        react_build_dir = get_react_build_dir()
        index_path = os.path.join(react_build_dir, 'index.html')
        
        if os.path.exists(index_path):
            logger.info(f"Serving React app from: {react_build_dir}")
            
            # Read the HTML and fix asset paths
            with open(index_path, 'r') as f:
                html_content = f.read()
            
            # Replace /assets/ with /app/assets/ in the HTML
            html_content = html_content.replace('src="/assets/', 'src="/app/assets/')
            html_content = html_content.replace('href="/assets/', 'href="/app/assets/')
            
            from flask import Response
            return Response(html_content, mimetype='text/html')
        else:
            logger.error(f"React build not found at: {react_build_dir}")
            abort(404)
    except Exception as e:
        logger.error(f"Error serving React app: {str(e)}")
        abort(500)

@bp.route('/app/assets/<path:filename>')
def react_app_assets(filename):
    """Serve React app static assets"""
    try:
        react_build_dir = get_react_build_dir()
        assets_dir = os.path.join(react_build_dir, 'assets')
        
        if os.path.exists(os.path.join(assets_dir, filename)):
            logger.info(f"Serving React asset: {filename}")
            return send_from_directory(assets_dir, filename)
        else:
            logger.error(f"React asset not found: {filename}")
            abort(404)
    except Exception as e:
        logger.error(f"Error serving React asset {filename}: {str(e)}")
        abort(404)

# Specific routes that match React Router paths
@bp.route('/app/fire-map-pro')
@bp.route('/app/fire-map-pro/')
def react_fire_map_pro():
    """Direct route to React Fire Map Pro"""
    return react_app()

@bp.route('/app/data-formatter')
@bp.route('/app/data-formatter/')
def react_data_formatter():
    """Direct route to React Data Formatter"""
    return react_app()

@bp.route('/app/response-time-analyzer')
@bp.route('/app/response-time-analyzer/')
def react_response_analyzer():
    """Direct route to React Response Time Analyzer"""
    return react_app()

@bp.route('/app/water-supply-coverage')
@bp.route('/app/water-supply-coverage/')
def react_water_supply_coverage():
    """Direct route to React Water Supply Coverage Analysis"""
    return react_app()

@bp.route('/app/tank-zone-coverage')
@bp.route('/app/tank-zone-coverage/')
def react_tank_zone_coverage():
    """Legacy route to Water Supply Coverage Analysis (redirects to new tool)"""
    return react_app()

# Admin routes
@bp.route('/app/admin')
@bp.route('/app/admin/')
def react_admin():
    """Direct route to React Admin Console"""
    return react_app()

# Authentication routes
@bp.route('/app/login')
@bp.route('/app/login/')
def react_login():
    """Direct route to React Login Page"""
    return react_app()

@bp.route('/app/signup')
@bp.route('/app/signup/')
def react_signup():
    """Direct route to React Sign Up Page"""
    return react_app()