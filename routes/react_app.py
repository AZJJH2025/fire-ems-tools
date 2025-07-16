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
    Uses template system with CSP nonce injection for security.
    """
    try:
        from flask import render_template
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        logger.info(f"Serving React app with asset: {main_asset}")
        
        # Use template system with nonce injection and dynamic asset detection
        return render_template('react_app.html', main_asset=main_asset)
        
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

# Favicon route
@bp.route('/favicon.svg')
@bp.route('/app/favicon.svg')
def favicon():
    """Serve favicon.svg"""
    from flask import send_file, abort
    try:
        react_build_dir = get_react_build_dir()
        favicon_path = os.path.join(react_build_dir, 'favicon.svg')
        
        if os.path.exists(favicon_path):
            return send_file(favicon_path, mimetype='image/svg+xml')
        else:
            # Fallback to static directory
            static_favicon = os.path.join('static', 'favicon.svg')
            if os.path.exists(static_favicon):
                return send_file(static_favicon, mimetype='image/svg+xml')
            else:
                abort(404)
    except Exception as e:
        logger.error(f"Error serving favicon: {str(e)}")
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

# Tool routes without /app/ prefix for direct tool access
@bp.route('/water-supply-coverage')
@bp.route('/water-supply-coverage/')
def water_supply_coverage():
    """Direct route to Water Supply Coverage tool (no /app/ prefix)"""
    return react_app()

@bp.route('/fire-map-pro')
@bp.route('/fire-map-pro/')
def fire_map_pro():
    """Direct route to Fire Map Pro tool (no /app/ prefix)"""
    return react_app()

@bp.route('/response-time-analyzer')
@bp.route('/response-time-analyzer/')
def response_time_analyzer():
    """Direct route to Response Time Analyzer tool (no /app/ prefix)"""
    return react_app()

@bp.route('/station-coverage-optimizer')
@bp.route('/station-coverage-optimizer/')
def station_coverage_optimizer():
    """Direct route to Station Coverage Optimizer tool (no /app/ prefix)"""
    return react_app()

@bp.route('/iso-credit-calculator')
@bp.route('/iso-credit-calculator/')
def iso_credit_calculator():
    """Direct route to ISO Credit Calculator tool (no /app/ prefix)"""
    return react_app()