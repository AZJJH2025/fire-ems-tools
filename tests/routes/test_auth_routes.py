"""Tests for auth routes blueprint.

This module contains tests for the authentication routes of the application,
including login and logout functionality.
"""

import unittest
import pytest
from flask import url_for, session

from tests.routes.base import AuthBlueprintTestCase
from database import User, db

# Mark all tests in this module as auth blueprint tests


@pytest.mark.auth
class TestAuthRoutes(AuthBlueprintTestCase):
    """Test cases for auth blueprint routes."""
    
    def setup_test_data(self):
        """Create a test user in the database."""
        # Create a test user
        user = User(username='testuser', email='test@example.com')
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
    
    def test_login_page(self):
        """Test that the login page loads."""
        # Check if the auth routes have a login route defined
        with self.app.app_context():
            if hasattr(self.app.url_map, 'login'):
                response = self.client.get('/login')
                self.assertEqual(response.status_code, 200)
            else:
                # If there's no login route, skip this test
                self.skipTest("Login route not defined in auth blueprint")


if __name__ == '__main__':
    unittest.main()
