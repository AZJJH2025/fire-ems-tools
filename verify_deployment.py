"""
Verification script for deployment fixes.
This script verifies that all necessary fixes are applied properly.

Usage:
  python verify_deployment.py
"""

import logging
import traceback
import json
import sys
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def verify_database_models():
    """Verify that all database models have required fields and methods"""
    try:
        # Import models
        from database import Department, User, Station, Incident, db
        
        # Check User model
        user_checks = [
            ('User.to_dict', hasattr(User, 'to_dict')),
            ('User.preferences', hasattr(User, 'preferences'))
        ]
        
        # Check Department model
        department_checks = [
            ('Department.webhook_url', hasattr(Department, 'webhook_url')),
            ('Department.webhook_secret', hasattr(Department, 'webhook_secret')),
            ('Department.webhooks_enabled', hasattr(Department, 'webhooks_enabled')),
            ('Department.webhook_events', hasattr(Department, 'webhook_events')),
            ('Department.update_webhook_success', hasattr(Department, 'update_webhook_success')),
            ('Department.update_webhook_error', hasattr(Department, 'update_webhook_error')),
            ('Department.enable_webhooks', hasattr(Department, 'enable_webhooks')),
            ('Department.disable_webhooks', hasattr(Department, 'disable_webhooks')),
            ('Department.to_dict_with_webhook', hasattr(Department, 'to_dict_with_webhook'))
        ]
        
        # Combine all checks
        all_checks = user_checks + department_checks
        
        # Evaluate checks
        passed = [check for check, result in all_checks if result]
        failed = [check for check, result in all_checks if not result]
        
        # Print results
        print("\n=== DATABASE MODEL VERIFICATION ===")
        print(f"Passed: {len(passed)}/{len(all_checks)}")
        
        if failed:
            print("\nFailed checks:")
            for check in failed:
                print(f"  - {check}")
        else:
            print("\nAll checks passed!")
        
        return len(failed) == 0
        
    except Exception as e:
        logger.error(f"Error verifying database models: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def verify_database_tables():
    """Verify database tables by trying to create an app context and check tables"""
    try:
        # Import Flask and create a test app
        from flask import Flask
        from database import db
        
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        db.init_app(app)
        
        with app.app_context():
            # Create all tables
            db.create_all()
            
            # Check if tables exist
            tables = db.engine.table_names()
            expected_tables = ['users', 'departments', 'stations', 'incidents']
            
            missing_tables = [table for table in expected_tables if table not in tables]
            
            # Print results
            print("\n=== DATABASE TABLES VERIFICATION ===")
            print(f"Found {len(tables)} tables in database")
            
            if missing_tables:
                print("\nMissing tables:")
                for table in missing_tables:
                    print(f"  - {table}")
            else:
                print("\nAll expected tables found!")
                
            # Check columns in tables
            print("\nVerifying table columns:")
            columns = {}
            
            # Users table columns
            users_columns = db.engine.execute("PRAGMA table_info(users)").fetchall()
            columns['users'] = [col[1] for col in users_columns]  # Column name is at index 1
            print(f"  - users: {len(columns['users'])} columns found")
            
            # Departments table columns
            depts_columns = db.engine.execute("PRAGMA table_info(departments)").fetchall() 
            columns['departments'] = [col[1] for col in depts_columns]
            print(f"  - departments: {len(columns['departments'])} columns found")
            
            # Check for specific columns
            webhook_columns = [
                'webhooks_enabled', 'webhook_url', 'webhook_secret', 
                'webhook_events', 'webhook_last_error', 'webhook_last_success'
            ]
            
            missing_webhook_columns = [col for col in webhook_columns if col not in columns['departments']]
            
            if missing_webhook_columns:
                print("\nMissing webhook columns in departments table:")
                for col in missing_webhook_columns:
                    print(f"  - {col}")
            else:
                print("\nAll webhook columns found in departments table!")
                
            return len(missing_tables) == 0 and len(missing_webhook_columns) == 0
            
    except Exception as e:
        logger.error(f"Error verifying database tables: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def verify_fix_deployment_script():
    """Verify that the fix_deployment.py script is working correctly"""
    try:
        # Import the fix_deployment module
        import fix_deployment
        
        # Try to apply fixes
        result = fix_deployment.apply_fixes()
        
        print("\n=== FIX DEPLOYMENT SCRIPT VERIFICATION ===")
        if result:
            print("fix_deployment.py script ran successfully!")
        else:
            print("fix_deployment.py script encountered errors.")
            
        # Check if key functions exist
        functions = [
            'apply_fixes', 'fix_database_tables', 'add_missing_columns',
            'require_api_key_safe', 'add_method_to_class', 'patch_app_routes'
        ]
        
        missing_functions = [func for func in functions if not hasattr(fix_deployment, func)]
        
        if missing_functions:
            print("\nMissing functions in fix_deployment.py:")
            for func in missing_functions:
                print(f"  - {func}")
        else:
            print("\nAll required functions found in fix_deployment.py!")
            
        return result and len(missing_functions) == 0
        
    except Exception as e:
        logger.error(f"Error verifying fix_deployment script: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def verify_app_setup():
    """Verify that the app.py file is set up correctly to use fix_deployment"""
    try:
        with open('app.py', 'r') as f:
            app_content = f.read()
            
        # Check for import fix_deployment
        has_import = 'import fix_deployment' in app_content
        
        # Check for apply_fixes
        has_apply_fixes = 'fix_deployment.apply_fixes()' in app_content
        
        # Check for fix_database_tables
        has_fix_database = 'fix_deployment.fix_database_tables' in app_content
        
        # Check for patch_app_routes
        has_patch_routes = 'fix_deployment.patch_app_routes' in app_content
        
        print("\n=== APP SETUP VERIFICATION ===")
        checks = [
            ('Import fix_deployment', has_import),
            ('Call fix_deployment.apply_fixes()', has_apply_fixes),
            ('Call fix_deployment.fix_database_tables()', has_fix_database),
            ('Call fix_deployment.patch_app_routes()', has_patch_routes)
        ]
        
        for check, result in checks:
            print(f"  - {check}: {'✅' if result else '❌'}")
            
        all_passed = all(result for _, result in checks)
        
        if all_passed:
            print("\nApp setup appears to be correct!")
        else:
            print("\nSome app setup issues found. Please review app.py.")
            
        return all_passed
        
    except Exception as e:
        logger.error(f"Error verifying app setup: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def run_all_verifications():
    """Run all verification checks and generate a report"""
    results = {
        'timestamp': datetime.utcnow().isoformat(),
        'checks': {}
    }
    
    print("\n===== DEPLOYMENT VERIFICATION =====")
    print(f"Running verification at {results['timestamp']}")
    
    # Run all verification checks
    results['checks']['models'] = verify_database_models()
    results['checks']['tables'] = verify_database_tables()
    results['checks']['fix_script'] = verify_fix_deployment_script()
    results['checks']['app_setup'] = verify_app_setup()
    
    # Calculate overall status
    all_passed = all(results['checks'].values())
    results['status'] = 'PASSED' if all_passed else 'FAILED'
    
    # Print summary
    print("\n===== VERIFICATION SUMMARY =====")
    print(f"Status: {results['status']}")
    print("\nIndividual checks:")
    for check, result in results['checks'].items():
        status = '✅ PASSED' if result else '❌ FAILED'
        print(f"  - {check}: {status}")
    
    # Save report to file
    report_file = f"verification_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nVerification report saved to: {report_file}")
    
    return all_passed

if __name__ == "__main__":
    success = run_all_verifications()
    sys.exit(0 if success else 1)