"""Route Integrity Tests

This module contains tests to verify that all routes in the application are
properly registered and accessible.
"""

import unittest
import pytest
from flask import Flask, url_for
import os
import importlib

from database import db
from tests.routes.base import BlueprintTestCase


@pytest.mark.unit
class TestRouteIntegrity(BlueprintTestCase):
    """Test cases for verifying route integrity across the application."""
    
    def setUp(self):
        """Set up the test environment with all blueprints."""
        # Create a test Flask application
        self.app = Flask(__name__)
        self.app.config.update({
            'TESTING': True,
            'SECRET_KEY': 'test-key',
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
            'SQLALCHEMY_TRACK_MODIFICATIONS': False,
            'WTF_CSRF_ENABLED': False
        })
        
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
        
        # Register all blueprints
        try:
            from routes.main import bp as main_bp
            from routes.auth import bp as auth_bp
            from routes.api import bp as api_bp
            from routes.dashboards import bp as dashboards_bp
            from routes.tools import bp as tools_bp
            
            self.app.register_blueprint(main_bp)
            self.app.register_blueprint(auth_bp)
            self.app.register_blueprint(api_bp)
            self.app.register_blueprint(dashboards_bp)
            self.app.register_blueprint(tools_bp)
            self.blueprint_import_failed = False
        except ImportError as e:
            # Record the failure but continue with test setup
            self.blueprint_import_failed = True
            self.blueprint_import_error = str(e)
        
        # Create a test client
        self.client = self.app.test_client()
        
        # Establish application context
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Create the database tables
        db.create_all()
        
        # Set up test data
        self.setup_test_data()
    
    def test_blueprint_import(self):
        """Test that all blueprints can be imported without errors."""
        if hasattr(self, 'blueprint_import_failed') and self.blueprint_import_failed:
            self.fail(f"Blueprint import failed: {self.blueprint_import_error}")
    
    def test_route_setup(self):
        """Test that all expected routes are set up correctly."""
        # Skip this test if blueprints failed to import
        if hasattr(self, 'blueprint_import_failed') and self.blueprint_import_failed:
            self.skipTest("Blueprint import failed")
        
        with self.app.app_context():
            # Get all registered routes
            routes = []
            for rule in self.app.url_map.iter_rules():
                routes.append(rule.endpoint)
            
            # Check for expected main blueprint routes
            self.assertIn('main.index', routes, "Home page route not registered")
            self.assertIn('main.fire_ems_dashboard', routes, "Dashboard route not registered")
            self.assertIn('main.isochrone_map', routes, "Isochrone map route not registered")
            self.assertIn('main.call_density_heatmap', routes, "Call density heatmap route not registered")
            self.assertIn('main.incident_logger', routes, "Incident logger route not registered")
            
            # Check for API routes (assuming an expected endpoint)
            # Note: You'll need to adapt these checks based on your actual API endpoints
            api_routes = [route for route in routes if route.startswith('api.')]
            self.assertTrue(len(api_routes) > 0, "No API routes registered")
    
    def test_essential_routes_reachable(self):
        """Test that essential routes can be accessed without errors."""
        # Skip this test if blueprints failed to import
        if hasattr(self, 'blueprint_import_failed') and self.blueprint_import_failed:
            self.skipTest("Blueprint import failed")
        
        # Test the home page
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200, "Home page not accessible")
        
        # Test main feature pages
        essential_routes = [
            '/fire-ems-dashboard',
            '/isochrone-map',
            '/call-density-heatmap',
            '/incident-logger',
            '/deployment-status'
        ]
        
        for route in essential_routes:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 200, f"{route} not accessible")


if __name__ == '__main__':
    unittest.main()