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
