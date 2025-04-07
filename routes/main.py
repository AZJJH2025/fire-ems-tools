"""
Main routes for FireEMS.ai application.

This module defines the routes for the main pages of the application, including:
- Home page
- Basic tool pages
- Static pages
"""

from flask import Blueprint, render_template, redirect, url_for, request, session
import os
import json
import logging

logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('main', __name__)

@bp.route("/")
def index():
    """Home page route"""
    return render_template('index.html')

@bp.route('/fire-ems-dashboard')
def fire_ems_dashboard():
    """Response Time Analyzer dashboard route"""
    return render_template('fire-ems-dashboard.html')

@bp.route('/isochrone-map')
def isochrone_map():
    """Isochrone Map route"""
    return render_template('isochrone-map.html')

@bp.route('/call-density-heatmap')
def call_density_heatmap():
    """Call Density Heatmap route"""
    return render_template('call-density-heatmap.html')

@bp.route('/incident-logger')
def incident_logger():
    """Incident Logger route"""
    return render_template('incident-logger.html')
    
@bp.route('/coverage-gap-finder')
def coverage_gap_finder():
    """Coverage Gap Finder route"""
    return render_template('coverage-gap-finder.html')
    
@bp.route('/fire-map-pro')
def fire_map_pro():
    """FireMapPro route"""
    return render_template('fire-map-pro.html')
    
@bp.route('/data-formatter')
def data_formatter():
    """Data Formatter route"""
    return render_template('data-formatter.html')
    
@bp.route('/station-overview')
def station_overview():
    """Station Overview route"""
    return render_template('station-overview.html')

@bp.route('/call-volume-forecaster')
def call_volume_forecaster():
    """Call Volume Forecaster route"""
    return render_template('call-volume-forecaster.html')

@bp.route('/quick-stats')
def quick_stats():
    """Quick Stats route"""
    return render_template('quick-stats.html')

@bp.route('/user-guide')
def user_guide():
    """User Guide route"""
    return render_template('user-guide.html')

@bp.route('/tests/module_testing_dashboard.html')
def module_testing_dashboard():
    """ES6 Module Testing Dashboard route"""
    return render_template('tests/module_testing_dashboard.html')

@bp.route('/admin')
def admin_dashboard():
    """Admin Dashboard route"""
    # Import necessary models and functions
    from database import db, Department, User, Incident
    from flask_login import current_user, login_required
    from flask import redirect, url_for, flash
    
    # Check if user is logged in and a super_admin
    if not hasattr(current_user, 'is_authenticated') or not current_user.is_authenticated:
        flash('You must be logged in to access the admin dashboard', 'error')
        return redirect(url_for('auth.login'))
        
    if not hasattr(current_user, 'is_super_admin') or not current_user.is_super_admin():
        flash('You do not have permission to access the admin dashboard', 'error')
        return redirect(url_for('main.index'))
    
    # Get counts for dashboard
    try:
        departments_count = Department.query.count()
        users_count = User.query.count()
        incidents_count = Incident.query.count()
    except Exception as e:
        # Log the error and show a message
        import logging
        logging.error(f"Error querying data for admin dashboard: {str(e)}")
        flash('An error occurred while loading the admin dashboard data', 'error')
        departments_count = 0
        users_count = 0
        incidents_count = 0
    
    # Render the template with the required data
    return render_template('admin/dashboard.html', 
                           current_user=current_user,
                           departments_count=departments_count,
                           users_count=users_count,
                           incidents_count=incidents_count)

@bp.route('/deployment-status')
def deployment_status():
    """Check deployment status"""
    from flask import jsonify
    from datetime import datetime
    from database import Department, User
    
    status = {
        "status": "ok",
        "fixes_applied": True,
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv('FLASK_ENV', 'development'),
        "features": {
            "user_api": hasattr(User, 'to_dict'),
            "webhooks": hasattr(Department, 'webhook_events') and hasattr(Department, 'webhooks_enabled')
        }
    }
    
    return jsonify(status)