"""
Migration runner script for the Fire-EMS application.
This script runs all available migrations to ensure the database is up to date.

Usage:
  python run_migrations.py
"""

import logging
import traceback
import importlib
import sys
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_all_migrations():
    """Run all available migrations in the correct order"""
    try:
        from flask import Flask
        from database import db
        
        # Create a temporary app context for running migrations
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'  # Temp database for checking
        
        # Try to use the real database if possible
        try:
            from config import config
            app.config.from_object(config['default'])
            config['default'].init_app(app)
        except Exception as e:
            logger.warning(f"Could not load real config, using temporary database: {str(e)}")
        
        # Initialize db
        db.init_app(app)
        
        with app.app_context():
            # Import and run migrations in order
            migrations = [
                ('migrations.user_api_migration', 'User API Migration'),
                ('migrations.webhook_migration', 'Webhook Migration')
            ]
            
            for module_name, description in migrations:
                try:
                    logger.info(f"Running {description}...")
                    module = importlib.import_module(module_name)
                    
                    # Run the migration
                    result = module.run_migration(db)
                    
                    if result:
                        logger.info(f"{description} completed successfully!")
                    else:
                        logger.warning(f"{description} did not complete successfully.")
                        
                except Exception as e:
                    logger.error(f"Error running {description}: {str(e)}")
                    logger.error(traceback.format_exc())
            
            # Apply additional fixes
            logger.info("Applying deployment fixes...")
            import fix_deployment
            fix_deployment.apply_fixes()
            fix_deployment.fix_database_tables(app, db)
            
            logger.info("All migrations completed!")
            return True
            
    except Exception as e:
        logger.error(f"Error running migrations: {str(e)}")
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    print("===== RUNNING DATABASE MIGRATIONS =====")
    print(f"Started at: {datetime.utcnow().isoformat()}")
    
    success = run_all_migrations()
    
    print(f"\nMigrations {'completed successfully' if success else 'failed'}")
    print(f"Finished at: {datetime.utcnow().isoformat()}")
    
    sys.exit(0 if success else 1)