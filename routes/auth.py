"""
Authentication routes for Fire EMS Tools
All legacy template routes removed after cleanup - use React app authentication at /app/* instead
"""

import logging
from flask import Blueprint, redirect, jsonify

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/login')
def login():
    """Login route - redirect to React app"""
    return redirect('/app/login')

@bp.route('/register')
def register():
    """Register route - redirect to React app"""
    return redirect('/app/signup')

@bp.route('/logout')
def logout():
    """Logout route"""
    return redirect('/app/')

# All other legacy authentication routes removed - templates deleted during cleanup
# Use the modern React app authentication at:
# - /app/login
# - /app/signup