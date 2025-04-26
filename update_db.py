"""
Database update script

This script updates the database schema for existing databases.
Run this script when you need to migrate the database to a new schema:

python update_db.py
"""

import os
import sys
from app import create_app
from database import db, Department, User, Station, Incident
from sqlalchemy import text
import secrets
import uuid

def update_database():
    """Update the database schema with new fields"""
    # Use production config if on Render, otherwise development
    config_name = 'production' if os.environ.get('RENDER') else 'development'
    app = create_app(config_name)
    
    with app.app_context():
        try:
            # Add API key fields if they don't exist
            inspector = db.inspect(db.engine)
            columns = [column['name'] for column in inspector.get_columns('departments')]
            
            # Add api_key column if it doesn't exist
            if 'api_key' not in columns:
                print("Adding api_key column to departments table...")
                with db.engine.connect() as conn:
                    conn.execute(text("ALTER TABLE departments ADD COLUMN api_key VARCHAR(64)"))
                print("Added api_key column")
            
            # Add api_enabled column if it doesn't exist
            if 'api_enabled' not in columns:
                print("Adding api_enabled column to departments table...")
                with db.engine.connect() as conn:
                    conn.execute(text("ALTER TABLE departments ADD COLUMN api_enabled BOOLEAN DEFAULT 0"))
                print("Added api_enabled column")
            
            # Generate API keys for departments that don't have one (optional)
            print("Checking for departments without API keys...")
            departments_count = 0
            for dept in Department.query.all():
                if dept.api_key is None:
                    # Generate a new API key
                    dept.api_key = f"fems_{uuid.uuid4().hex}_{secrets.token_hex(8)}"
                    dept.api_enabled = False  # Default to disabled
                    departments_count += 1
            
            if departments_count > 0:
                print(f"Generated API keys for {departments_count} departments")
                db.session.commit()
            else:
                print("All departments already have API keys or no departments found")
                
            print("Database update complete")
            
        except Exception as e:
            print(f"Error updating database: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    return True
    
if __name__ == "__main__":
    success = update_database()
    if success:
        print("Database updated successfully")
    else:
        print("Database update failed")
        sys.exit(1)