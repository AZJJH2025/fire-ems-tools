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
    """Home page route - redirect to React app"""
    return redirect('/app/')

# All other legacy routes removed - templates deleted during cleanup
# Use the modern React app at:
# - /app/ (homepage)
# - /app/data-formatter 
# - /app/response-time-analyzer
# - /app/fire-map-pro