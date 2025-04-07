"""
Test Dashboard Route.

This module provides a simple route for the test dashboard.
"""

from flask import render_template

def init_app(app):
    """Add the test dashboard route to the application."""
    
    @app.route('/test-dashboard')
    def test_dashboard():
        """Render the test dashboard page."""
        try:
            return render_template('test-dashboard.html')
        except Exception as e:
            return f"Error: {str(e)}", 500