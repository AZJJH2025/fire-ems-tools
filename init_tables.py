"""
Database table initialization script for the Fire-EMS application.
This script ensures all necessary tables exist at application startup.
"""

import logging
import os
from sqlalchemy import inspect

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def init_tables(app, db):
    """Initialize database tables for the application"""
    logger.info("Checking database tables...")
    
    with app.app_context():
        try:
            # Get the SQLAlchemy inspector for checking tables
            inspector = inspect(db.engine)
            
            # Check if key tables exist
            existing_tables = inspector.get_table_names()
            logger.info(f"Found {len(existing_tables)} existing tables: {', '.join(existing_tables)}")
            
            # Expected tables
            expected_tables = ['departments', 'users', 'stations', 'incidents']
            missing_tables = [table for table in expected_tables if table not in existing_tables]
            
            if missing_tables:
                logger.warning(f"Missing tables: {', '.join(missing_tables)}")
                logger.info("Creating all database tables...")
                
                # Create all tables
                db.create_all()
                logger.info("Tables created successfully")
                
                # Create a default super admin if users table was missing
                if 'users' in missing_tables:
                    logger.info("Creating default super admin user...")
                    try:
                        from database import User
                        
                        # Check if we already have users
                        if User.query.count() == 0:
                            # Create a super admin user
                            super_admin = User(
                                department_id=1,  # This will be created with the test department
                                email="admin@fireems.ai",
                                name="System Administrator",
                                role="super_admin"
                            )
                            super_admin.set_password("FireEMS2025!")
                            db.session.add(super_admin)
                            
                            # Create a test department if needed
                            from database import Department
                            if Department.query.count() == 0:
                                test_dept = Department(
                                    code="test",
                                    name="Test Department",
                                    department_type="combined",
                                    api_enabled=True,
                                    webhooks_enabled=False,
                                    is_active=True,
                                    setup_complete=True,
                                    features_enabled={
                                        "incident_logger": True,
                                        "call_density": True,
                                        "isochrone_map": True,
                                        "dashboard": True
                                    }
                                )
                                # Generate API key
                                test_dept.generate_api_key()
                                db.session.add(test_dept)
                            
                            db.session.commit()
                            logger.info("Default super admin user created")
                            logger.info("Login with email: admin@fireems.ai and password: FireEMS2025!")
                    except Exception as e:
                        logger.error(f"Error creating super admin: {str(e)}")
                        db.session.rollback()
            else:
                logger.info("All expected tables exist")
                
            return True
                
        except Exception as e:
            logger.error(f"Error initializing database tables: {str(e)}")
            return False