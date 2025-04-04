"""
Database initialization script

This script creates all database tables and adds initial data.
Run this script once when setting up your application:

python init_db.py
"""

import os
import sys
from app import create_app
from database import db, Department

def init_database():
    """Initialize the database with tables and sample data"""
    # Use production config if on Render, otherwise development
    config_name = 'production' if os.environ.get('RENDER') else 'development'
    app = create_app(config_name)
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        
        # Check if we need to create initial departments
        if Department.query.count() == 0:
            print("Adding initial departments...")
            departments = [
                Department(code='dept123', name='Fire Department 123'),
                Department(code='dept456', name='EMS Department 456'),
                Department(code='demo', name='Demo Department')
            ]
            db.session.add_all(departments)
            db.session.commit()
            print(f"Added {len(departments)} departments successfully")
        else:
            print(f"Departments already exist, found {Department.query.count()} departments")
            
        print("Database initialization complete")
        
if __name__ == "__main__":
    init_database()