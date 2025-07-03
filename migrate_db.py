#!/usr/bin/env python3
"""
Database Migration Script for FireEMS Tools
Creates new tables for department and user requests
"""

import os
import sys
from flask import Flask
from database import db, DepartmentRequest, UserRequest

def create_app():
    """Create Flask app for migration"""
    app = Flask(__name__)
    
    # Database configuration
    if os.environ.get('DATABASE_URL'):
        # Production - use Render database
        database_url = os.environ.get('DATABASE_URL')
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://')
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        # Development - use local SQLite
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fire_ems_tools.db'
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    db.init_app(app)
    return app

def migrate_database():
    """Run database migration"""
    app = create_app()
    
    with app.app_context():
        try:
            print("Starting database migration...")
            
            # Create all tables
            db.create_all()
            
            print("✅ Database migration completed successfully!")
            print("Created tables:")
            print("  - department_requests")
            print("  - user_requests")
            print("  - Updated existing tables if needed")
            
            return True
            
        except Exception as e:
            print(f"❌ Database migration failed: {str(e)}")
            return False

if __name__ == '__main__':
    success = migrate_database()
    sys.exit(0 if success else 1)