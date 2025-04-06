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