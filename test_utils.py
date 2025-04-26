"""
Utility test file for checking compatibility issues.
Run this before deployment to detect common issues.
"""

import json
import os
import sys
from datetime import datetime
from app import create_app
from database import db, Department, User, Station, Incident

def test_models(app_config='development'):
    """Test model methods to ensure compatibility"""
    app = create_app(app_config)
    
    with app.app_context():
        # Create a test department
        dept = Department(
            code='test_dept',
            name='Test Department',
            api_enabled=True
        )
        
        # Test Department to_dict method
        print("Testing Department.to_dict()...")
        dept_dict = dept.to_dict()
        print(f"Department.to_dict() output: {json.dumps(dept_dict, indent=2)}")
        
        # Create a test user
        user = User(
            department_id=1,  # Just for testing
            email='test@example.com',
            name='Test User',
            role='user',
            is_active=True
        )
        user.set_password('password123')
        
        # Test User to_dict method
        print("\nTesting User.to_dict()...")
        try:
            user_dict = user.to_dict()
            print(f"User.to_dict() output: {json.dumps(user_dict, indent=2)}")
        except Exception as e:
            print(f"Error in User.to_dict(): {str(e)}")
            
            # Fix the to_dict method if it doesn't exist
            if not hasattr(User, 'to_dict'):
                print("Adding to_dict method to User model...")
                def to_dict(self):
                    return {
                        'id': self.id,
                        'department_id': self.department_id,
                        'email': self.email,
                        'name': self.name,
                        'role': self.role,
                        'is_active': self.is_active,
                        'created_at': self.created_at.isoformat() if self.created_at else None,
                        'last_login': self.last_login.isoformat() if self.last_login else None
                    }
                setattr(User, 'to_dict', to_dict)
                user_dict = user.to_dict()
                print(f"Fixed User.to_dict() output: {json.dumps(user_dict, indent=2)}")
            
        # Test if preferences field exists
        if hasattr(User, 'preferences'):
            print("\nUser model has preferences field")
        else:
            print("\nWarning: User model doesn't have preferences field")

def main():
    """Main entry point for the test utils"""
    test_models()
    
if __name__ == "__main__":
    main()