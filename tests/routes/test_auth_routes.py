"""Tests for auth routes blueprint.

This module contains tests for the authentication routes of the application,
including login and logout functionality.
"""

import unittest
import pytest
from flask import url_for, session
from werkzeug.security import generate_password_hash

from tests.routes.base import AuthBlueprintTestCase
from database import User, Department, db

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


@pytest.mark.auth
class TestAuthRoutes(AuthBlueprintTestCase):
    """Test cases for auth blueprint routes."""
    
    def setUp(self):
        """Set up the test environment."""
        super().setUp()
        
        # Set up a session
        with self.app.test_request_context():
            self.app.config['TESTING'] = True
            self.app.config['WTF_CSRF_ENABLED'] = False
            
            # Mock flask_login functions
            import routes.auth
            routes.auth.login_user = mock_login_user
            routes.auth.logout_user = mock_logout_user
            routes.auth.login_required = mock_login_required
            routes.auth.current_user = mock_current_user
    
    def setup_test_data(self):
        """Create test data in the database."""
        # Create a test department
        dept = Department(
            name="Test Department", 
            code="TEST",
            status="active"
        )
        db.session.add(dept)
        
        # Create test users
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
        db.session.commit()
    
    def test_login_page(self):
        """Test that the login page loads."""
        response = self.client.get('/auth/login')
        self.assertEqual(response.status_code, 200)
        # Check that login form template is rendered
        self.assertIn(b'<h1>Test Home</h1>', response.data)  # Using our mock template
    
    def test_login_success(self):
        """Test successful login."""
        response = self.client.post('/auth/login', data={
            'email': 'test@example.com',
            'password': 'password123',
            'remember': False
        }, follow_redirects=True)
        
        self.assertEqual(response.status_code, 200)
        
        # Check that the user is logged in (session should have user_id)
        with self.client.session_transaction() as sess:
            self.assertIn('user_id', sess)
            self.assertEqual(sess['user_id'], 1)
    
    def test_login_failure(self):
        """Test failed login with wrong password."""
        response = self.client.post('/auth/login', data={
            'email': 'test@example.com',
            'password': 'wrongpassword',
            'remember': False
        }, follow_redirects=True)
        
        # We should stay on the login page
        self.assertEqual(response.status_code, 200)
        
        # Check that the user is not logged in
        with self.client.session_transaction() as sess:
            self.assertNotIn('user_id', sess)
    
    def test_login_nonexistent_user(self):
        """Test login with nonexistent user."""
        response = self.client.post('/auth/login', data={
            'email': 'nonexistent@example.com',
            'password': 'password123',
            'remember': False
        }, follow_redirects=True)
        
        # We should stay on the login page
        self.assertEqual(response.status_code, 200)
        
        # Check that the user is not logged in
        with self.client.session_transaction() as sess:
            self.assertNotIn('user_id', sess)
    
    def test_logout(self):
        """Test logout functionality."""
        # First login
        self.client.post('/auth/login', data={
            'email': 'test@example.com',
            'password': 'password123'
        })
        
        # Then logout
        response = self.client.get('/auth/logout', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        
        # Check that the user is logged out
        with self.client.session_transaction() as sess:
            self.assertNotIn('user_id', sess)
    
    def test_register_page(self):
        """Test that the registration page loads."""
        response = self.client.get('/auth/register')
        self.assertEqual(response.status_code, 200)
        # Check that registration form template is rendered
        self.assertIn(b'<h1>Test Home</h1>', response.data)  # Using our mock template
    
    def test_register_success(self):
        """Test successful user registration."""
        response = self.client.post('/auth/register', data={
            'email': 'newuser@example.com',
            'name': 'New User',
            'password': 'newpassword',
            'department_code': 'TEST'
        }, follow_redirects=True)
        
        # Should redirect to login page
        self.assertEqual(response.status_code, 200)
        
        # Verify the user was created
        user = User.query.filter_by(email='newuser@example.com').first()
        self.assertIsNotNone(user)
        self.assertEqual(user.name, 'New User')
        self.assertEqual(user.department_id, 1)
        self.assertEqual(user.role, 'user')
    
    def test_register_existing_email(self):
        """Test registration with an existing email."""
        response = self.client.post('/auth/register', data={
            'email': 'test@example.com',  # This email already exists
            'name': 'Duplicate User',
            'password': 'newpassword',
            'department_code': 'TEST'
        }, follow_redirects=True)
        
        # Should stay on the registration page
        self.assertEqual(response.status_code, 200)
        
        # Verify no new user was created
        users = User.query.filter_by(email='test@example.com').all()
        self.assertEqual(len(users), 1)  # Still only one user with this email
    
    def test_register_invalid_department(self):
        """Test registration with an invalid department code."""
        response = self.client.post('/auth/register', data={
            'email': 'newuser@example.com',
            'name': 'New User',
            'password': 'newpassword',
            'department_code': 'INVALID'  # This department code doesn't exist
        }, follow_redirects=True)
        
        # Should stay on the registration page
        self.assertEqual(response.status_code, 200)
        
        # Verify no user was created
        user = User.query.filter_by(email='newuser@example.com').first()
        self.assertIsNone(user)


if __name__ == '__main__':
    unittest.main()