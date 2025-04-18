"""Base test class for blueprint route testing.

This module provides a base test class that handles the common setup and
teardown operations for testing Flask blueprints in the application.
"""

import unittest
import pytest
from flask import Flask, session
from database import db, Department, Incident, User, Station

class BlueprintTestCase(unittest.TestCase):
    """Base test class for blueprint tests."""
    
    def setUp(self):
        """Set up the test environment."""
        # Create a test Flask application
        self.app = Flask(__name__)
        self.app.config.update({
            'TESTING': True,
            'SECRET_KEY': 'test-key',
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
            'SQLALCHEMY_TRACK_MODIFICATIONS': False,
            'WTF_CSRF_ENABLED': False
        })
        
        # Set up mock templates for testing
        @self.app.route('/test-templates')
        def test_templates():
            return "Template test route"
            
        # Set up mock template loader
        from jinja2 import DictLoader
        self.app.jinja_loader = DictLoader({
            'index.html': '<html><body><h1>Test Home</h1></body></html>',
            'fire-ems-dashboard.html': '<html><body><h1>Test Dashboard</h1></body></html>',
            'isochrone-map.html': '<html><body><h1>Test Isochrone Map</h1></body></html>',
            'call-density-heatmap.html': '<html><body><h1>Test Call Density Heatmap</h1></body></html>',
            'incident-logger.html': '<html><body><h1>Test Incident Logger</h1></body></html>',
            'coverage-gap-finder.html': '<html><body><h1>Test Coverage Gap Finder</h1></body></html>',
            'fire-map-pro.html': '<html><body><h1>Test Fire Map Pro</h1></body></html>',
            'data-formatter.html': '<html><body><h1>Test Data Formatter</h1></body></html>',
            'station-overview.html': '<html><body><h1>Test Station Overview</h1></body></html>',
            'call-volume-forecaster.html': '<html><body><h1>Test Call Volume Forecaster</h1></body></html>',
            'quick-stats.html': '<html><body><h1>Test Quick Stats</h1></body></html>',
            'errors/404.html': '<html><body><h1>404 Not Found</h1></body></html>',
            'errors/500.html': '<html><body><h1>500 Server Error</h1></body></html>',
        })
        
        # Initialize extensions
        db.init_app(self.app)
        
        # Create a test client
        self.client = self.app.test_client()
        
        # Establish application context
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Create the database tables
        db.create_all()
        
        # Set up test data
        self.setup_test_data()
    
    def tearDown(self):
        """Clean up after tests."""
        # Remove the database tables
        db.session.remove()
        db.drop_all()
        
        # Pop the application context
        self.app_context.pop()
    
    def setup_test_data(self):
        """Create test data in the database.
        
        Override this method in subclasses to create specific test data.
        """
        pass


class MainBlueprintTestCase(BlueprintTestCase):
    """Base test class for main blueprint tests."""
    
    def setUp(self):
        """Set up the test environment."""
        super().setUp()
        
        # Import and register the blueprint
        from routes.main import bp as main_bp
        self.app.register_blueprint(main_bp)


class AuthBlueprintTestCase(BlueprintTestCase):
    """Base test class for auth blueprint tests."""
    
    def setUp(self):
        """Set up the test environment."""
        super().setUp()
        
        # Import and register the blueprint
        from routes.auth import bp as auth_bp
        self.app.register_blueprint(auth_bp)


class ApiBlueprintTestCase(BlueprintTestCase):
    """Base test class for API blueprint tests."""
    
    def setUp(self):
        """Set up the test environment."""
        super().setUp()
        
        # Import and register the blueprint
        from routes.api import bp as api_bp
        self.app.register_blueprint(api_bp)


class DashboardsBlueprintTestCase(BlueprintTestCase):
    """Base test class for dashboards blueprint tests."""
    
    def setUp(self):
        """Set up the test environment."""
        super().setUp()
        
        # Import and register the blueprint
        from routes.dashboards import bp as dashboards_bp
        self.app.register_blueprint(dashboards_bp)


class ToolsBlueprintTestCase(BlueprintTestCase):
    """Base test class for tools blueprint tests."""
    
    def setUp(self):
        """Set up the test environment."""
        super().setUp()
        
        # Import and register the blueprint
        from routes.tools import bp as tools_bp
        self.app.register_blueprint(tools_bp)
