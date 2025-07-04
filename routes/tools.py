"""
Tool routes for Fire EMS Tools
All legacy template routes removed after cleanup - use React app at /app/* instead
"""

import logging
from flask import Blueprint, redirect

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('tools', __name__, url_prefix='/tools')

@bp.route('/')
def tools_index():
    """Tools index - redirect to React app"""
    return redirect('/app/')

# All legacy tool routes removed - templates deleted during cleanup
# Use the modern React app at /app/*