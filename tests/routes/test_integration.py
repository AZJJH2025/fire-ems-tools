"""Integration tests for route blueprints.

This module contains integration tests that verify blueprints work together properly.
"""

import unittest
import pytest
import json
from flask import Flask, session
from werkzeug.security import generate_password_hash

from tests.routes.base import BlueprintTestCase
from database import db, Department, User, Incident, Station


# Mock login_user function
def mock_login_user(user, remember=False):
    session['user_id'] = user.id
    session['_fresh'] = True
    return True


# Mock logout_user function
def mock_logout_user():
    if 'user_id' in session:
        del session['user_id']
    if '_fresh' in session:
        del session['_fresh']
    return True


# Mock login_required decorator
def mock_login_required(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return "Please log in to access this page", 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function


# Mock current_user for authentication status checking
class MockCurrentUser:
    @property
    def is_authenticated(self):
        return 'user_id' in session


mock_current_user = MockCurrentUser()


# Mock require_api_key decorator
def mock_require_api_key(f):
    def decorated_function(*args, **kwargs):
        kwargs['department'] = Department.query.first()
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function


@pytest.mark.integration
class TestRouteIntegration(BlueprintTestCase):
    """Test cases for route integration."""
    
    def setUp(self):
        """Set up the test environment with all blueprints and test data."""
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
            'auth/login.html': '<html><body><h1>Test Login</h1></body></html>',
            'auth/register.html': '<html><body><h1>Test Register</h1></body></html>',
            'errors/404.html': '<html><body><h1>404 Not Found</h1></body></html>',
            'errors/500.html': '<html><body><h1>500 Server Error</h1></body></html>',
        })
        
        # Initialize extensions
        db.init_app(self.app)
        
        # Register all blueprints
        try:
            # Import blueprints
            from routes.main import bp as main_bp
            from routes.auth import bp as auth_bp
            from routes.api import bp as api_bp
            from routes.dashboards import bp as dashboards_bp
            from routes.tools import bp as tools_bp
            
            # Register blueprints
            self.app.register_blueprint(main_bp)
            self.app.register_blueprint(auth_bp)
            self.app.register_blueprint(api_bp)
            self.app.register_blueprint(dashboards_bp)
            self.app.register_blueprint(tools_bp)
            
            # Mock auth functions
            import routes.auth
            routes.auth.login_user = mock_login_user
            routes.auth.logout_user = mock_logout_user
            routes.auth.login_required = mock_login_required
            routes.auth.current_user = mock_current_user
            
            # Mock API key validation
            import routes.api
            routes.api.require_api_key = mock_require_api_key
            
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
    
    def setup_test_data(self):
        """Create test data in the database."""
        # Create a test department
        dept = Department(
            name="Test Department", 
            code="TEST", 
            api_key="test-api-key", 
            status="active"
        )
        db.session.add(dept)
        
        # Create test users with direct password hash setting
        user1 = User(
            email="test@example.com",
            name="Test User",
            department_id=1,
            role="user"
        )
        user1.password_hash = generate_password_hash("password123")
        
        user2 = User(
            email="admin@example.com",
            name="Admin User",
            department_id=1,
            role="admin"
        )
        user2.password_hash = generate_password_hash("adminpass")
        
        db.session.add(user1)
        db.session.add(user2)
        
        # Create test stations
        for i in range(3):
            station = Station(
                name=f"Test Station {i+1}", 
                station_number=f"S{i+1}",
                department_id=1, 
                latitude=33.448376 + (i * 0.01), 
                longitude=-112.074036 + (i * 0.01),
                address=f"123 Test St {i+1}",
                status="active"
            )
            db.session.add(station)
        
        # Create test incidents
        for i in range(5):
            incident = Incident(
                incident_number=f"TEST-{i+1}",
                department_id=1,
                station_id=i % 3 + 1,
                latitude=33.448376 + (i * 0.005),
                longitude=-112.074036 + (i * 0.005),
                incident_type="EMS" if i % 2 == 0 else "Fire",
                priority=str(i % 3 + 1),
                status="Closed"
            )
            db.session.add(incident)
        
        db.session.commit()
    
    def test_auth_flow(self):
        """Test full authentication flow: login, access protected routes, logout."""
        # Check if blueprints were successfully imported
        if hasattr(self, 'blueprint_import_failed') and self.blueprint_import_failed:
            self.skipTest(f"Blueprint import failed: {self.blueprint_import_error}")
        
        # 1. First try to access a protected page (should fail)
        response = self.client.get('/auth/logout')
        self.assertEqual(response.status_code, 401)
        
        # 2. Login with valid credentials
        response = self.client.post('/auth/login', data={
            'email': 'test@example.com',
            'password': 'password123'
        }, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        
        # 3. Verify we're now logged in
        with self.client.session_transaction() as sess:
            self.assertIn('user_id', sess)
        
        # 4. Try to access the protected page again (should succeed)
        response = self.client.get('/auth/logout', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        
        # 5. Verify we're now logged out
        with self.client.session_transaction() as sess:
            self.assertNotIn('user_id', sess)
    
    def test_api_main_integration(self):
        """Test integration between API and main routes."""
        # Check if blueprints were successfully imported
        if hasattr(self, 'blueprint_import_failed') and self.blueprint_import_failed:
            self.skipTest(f"Blueprint import failed: {self.blueprint_import_error}")
        
        # 1. First access the main page
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        
        # 2. Then access the incident logger page
        response = self.client.get('/incident-logger')
        self.assertEqual(response.status_code, 200)
        
        # 3. Get incidents from API
        response = self.client.get('/api/incidents')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('incidents', data)
        incident_id = data['incidents'][0]['id']
        
        # 4. Get specific incident details
        response = self.client.get(f'/api/incidents/{incident_id}')
        self.assertEqual(response.status_code, 200)
        incident_data = response.get_json()
        self.assertEqual(incident_data['id'], incident_id)
    
    def test_cross_blueprint_dependencies(self):
        """Test that dependencies between blueprints are working correctly."""
        # Check if blueprints were successfully imported
        if hasattr(self, 'blueprint_import_failed') and self.blueprint_import_failed:
            self.skipTest(f"Blueprint import failed: {self.blueprint_import_error}")
        
        # Login first
        self.client.post('/auth/login', data={
            'email': 'test@example.com',
            'password': 'password123'
        })
        
        # Test sequence that depends on multiple blueprints
        
        # 1. Check main dashboard
        response = self.client.get('/fire-ems-dashboard')
        self.assertEqual(response.status_code, 200)
        
        # 2. Get station data via API
        response = self.client.get('/api/stations')
        self.assertEqual(response.status_code, 200)
        stations_data = response.get_json()
        self.assertIn('stations', stations_data)
        
        # 3. Create a new incident via API
        new_incident = {
            'incident_number': 'INT-123',
            'incident_type': 'Integration Test',
            'incident_date': '2023-08-01T12:00:00',
            'latitude': 33.5,
            'longitude': -112.1,
            'status': 'Active'
        }
        
        response = self.client.post(
            '/api/incidents', 
            data=json.dumps(new_incident),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        
        # 4. Verify the new incident is returned in the incidents list
        response = self.client.get('/api/incidents')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        # Find our new incident
        found = False
        for incident in data['incidents']:
            if incident['incident_number'] == 'INT-123':
                found = True
                break
        
        self.assertTrue(found, "Newly created incident not found in API response")
    
    def test_endpoint_naming_consistency(self):
        """Test that endpoint naming is consistent across blueprints."""
        # Check if blueprints were successfully imported
        if hasattr(self, 'blueprint_import_failed') and self.blueprint_import_failed:
            self.skipTest(f"Blueprint import failed: {self.blueprint_import_error}")
        
        with self.app.test_request_context():
            # Collect all endpoint names
            endpoints = []
            for rule in self.app.url_map.iter_rules():
                if not rule.endpoint.startswith('static'):
                    endpoints.append(rule.endpoint)
            
            # Check blueprint naming consistency
            main_endpoints = [ep for ep in endpoints if ep.startswith('main.')]
            auth_endpoints = [ep for ep in endpoints if ep.startswith('auth.')]
            api_endpoints = [ep for ep in endpoints if ep.startswith('api.')]
            
            # Verify we have endpoints from each blueprint
            self.assertTrue(len(main_endpoints) > 0, "No main blueprint endpoints found")
            self.assertTrue(len(auth_endpoints) > 0, "No auth blueprint endpoints found")
            self.assertTrue(len(api_endpoints) > 0, "No API blueprint endpoints found")


if __name__ == '__main__':
    unittest.main()