"""
Emergency script to fix deployment issues.
This script provides a bootstrap function that should run before the main app.

Usage:
  import fix_deployment
  fix_deployment.apply_fixes()
  
  # Then continue with regular app creation
  app = create_app()

Usage in app.py:
  
  # Import the fix_deployment module
  import fix_deployment
  
  # Apply fixes before creating the app
  fix_deployment.apply_fixes()
  
  # Create the app
  app = create_app()
  
  # Fix database tables after app is created
  fix_deployment.fix_database_tables(app, db)
"""

import logging
import traceback
import secrets
import json
from datetime import datetime
from functools import wraps

logger = logging.getLogger(__name__)

def add_missing_columns(db_connection, table_name, column_definitions, dialect=None):
    """Add columns to a table if they don't exist.
    
    Args:
        db_connection: SQLAlchemy database connection
        table_name: Name of the table to modify
        column_definitions: List of (column_name, column_definition) tuples
        dialect: Database dialect (sqlite, postgresql, etc.)
    """
    from sqlalchemy import text
    
    for column_name, column_def in column_definitions:
        try:
            # Check if column exists
            db_connection.execute(text(f"SELECT {column_name} FROM {table_name} LIMIT 0"))
            logger.info(f"Column {column_name} already exists in {table_name}")
        except Exception:
            # Column doesn't exist, add it
            try:
                # Handle JSON differently for different databases
                if column_def.startswith('JSON') and dialect == 'sqlite':
                    # SQLite doesn't have a native JSON type, use TEXT
                    adjusted_def = column_def.replace('JSON', 'TEXT')
                    alter_statement = text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {adjusted_def}")
                    db_connection.execute(alter_statement)
                else:
                    alter_statement = text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_def}")
                    db_connection.execute(alter_statement)
                    
                logger.info(f"Added column {column_name} to {table_name}")
            except Exception as e:
                logger.warning(f"Failed to add column {column_name} to {table_name}: {str(e)}")

def add_method_to_class(cls, method_name, method_func):
    """Add a method to a class if it doesn't exist"""
    if not hasattr(cls, method_name):
        # Make sure the method is bound to the class
        bound_method = method_func
        setattr(cls, method_name, bound_method)
        logger.info(f"Added {method_name} method to {cls.__name__}")
        return True
    return False

def safe_json_dumps(obj):
    """Safely convert an object to JSON string, handling datetime objects"""
    def json_serial(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")
    
    try:
        return json.dumps(obj, default=json_serial)
    except Exception:
        return '{}'  # Return empty JSON object on failure

def apply_fixes():
    """Apply all necessary fixes to make the application deployable"""
    logger.info("Applying emergency deployment fixes...")
    
    try:
        # 1. Fix User methods
        from database import User
        
        # Add comprehensive to_dict method if missing
        def user_to_dict(self):
            """Comprehensive to_dict method for the User model"""
            result = {
                'id': self.id,
                'department_id': self.department_id,
                'email': self.email,
                'name': self.name,
                'role': self.role
            }
            
            # Safely add optional fields
            try:
                result['is_active'] = bool(self.is_active) if hasattr(self, 'is_active') else True
            except Exception:
                result['is_active'] = True
                
            # Add date fields if they exist
            try:
                if hasattr(self, 'created_at') and self.created_at:
                    result['created_at'] = self.created_at.isoformat()
            except Exception:
                result['created_at'] = None
                
            try:
                if hasattr(self, 'last_login') and self.last_login:
                    result['last_login'] = self.last_login.isoformat()
            except Exception:
                result['last_login'] = None
                
            # Add preferences with safety check
            try:
                if hasattr(self, 'preferences'):
                    if isinstance(self.preferences, dict):
                        result['preferences'] = self.preferences
                    elif isinstance(self.preferences, str):
                        try:
                            result['preferences'] = json.loads(self.preferences)
                        except Exception:
                            result['preferences'] = {}
                    else:
                        result['preferences'] = {}
            except Exception:
                result['preferences'] = {}
                
            return result
        
        add_method_to_class(User, 'to_dict', user_to_dict)
        
        # 2. Fix webhooks
        from database import Department
        
        # Add webhook fields to the Department model if they don't exist
        if not hasattr(Department, 'webhooks_enabled'):
            setattr(Department, 'webhooks_enabled', False)
            logger.info("Added webhooks_enabled attribute to Department")
            
        if not hasattr(Department, 'webhook_url'):
            setattr(Department, 'webhook_url', None)
            logger.info("Added webhook_url attribute to Department")
            
        if not hasattr(Department, 'webhook_secret'):
            setattr(Department, 'webhook_secret', None)
            logger.info("Added webhook_secret attribute to Department")
            
        if not hasattr(Department, 'webhook_events'):
            default_events = {
                "incident.created": True,
                "incident.updated": True,
                "station.created": False,
                "user.created": False
            }
            setattr(Department, 'webhook_events', default_events)
            logger.info("Added webhook_events attribute to Department")
            
        if not hasattr(Department, 'webhook_last_error'):
            setattr(Department, 'webhook_last_error', None)
            logger.info("Added webhook_last_error attribute to Department")
            
        if not hasattr(Department, 'webhook_last_success'):
            setattr(Department, 'webhook_last_success', None)
            logger.info("Added webhook_last_success attribute to Department")
            
        # Add webhook methods if missing
        def generate_webhook_secret(self):
            """Generate a new webhook secret for this department"""
            self.webhook_secret = secrets.token_hex(32)
            return self.webhook_secret
        
        def enable_webhooks(self):
            """Enable webhooks for this department"""
            if not self.webhook_secret:
                self.generate_webhook_secret()
            self.webhooks_enabled = True
        
        def disable_webhooks(self):
            """Disable webhooks for this department"""
            self.webhooks_enabled = False
            
        def update_webhook_success(self):
            """Update the last successful webhook delivery timestamp"""
            try:
                self.webhook_last_success = datetime.utcnow()
            except Exception as e:
                logger.warning(f"Could not update webhook_last_success: {str(e)}")
            
        def update_webhook_error(self, error_message):
            """Update the last webhook error message"""
            try:
                self.webhook_last_error = str(error_message)
            except Exception as e:
                logger.warning(f"Could not update webhook_last_error: {str(e)}")
                
        def to_dict_with_webhook(self):
            """Convert department to dictionary including webhook details (for admin use only)"""
            result = self.to_dict() if hasattr(self, 'to_dict') else {'id': self.id, 'name': self.name, 'code': self.code}
            
            # Add webhook fields with safety checks
            try:
                result['webhook_url'] = self.webhook_url if hasattr(self, 'webhook_url') else None
                result['webhook_secret'] = self.webhook_secret if hasattr(self, 'webhook_secret') else None
                
                if hasattr(self, 'webhook_events'):
                    if isinstance(self.webhook_events, dict):
                        result['webhook_events'] = self.webhook_events
                    elif isinstance(self.webhook_events, str):
                        try:
                            result['webhook_events'] = json.loads(self.webhook_events)
                        except Exception:
                            result['webhook_events'] = {}
                    else:
                        result['webhook_events'] = {}
                else:
                    result['webhook_events'] = {}
                    
                result['webhooks_enabled'] = bool(self.webhooks_enabled) if hasattr(self, 'webhooks_enabled') else False
                result['webhook_last_error'] = self.webhook_last_error if hasattr(self, 'webhook_last_error') else None
                
                if hasattr(self, 'webhook_last_success') and self.webhook_last_success:
                    result['webhook_last_success'] = self.webhook_last_success.isoformat()
                else:
                    result['webhook_last_success'] = None
            except Exception as e:
                logger.warning(f"Error in to_dict_with_webhook: {str(e)}")
                # Set default values for missing fields
                result['webhook_url'] = None
                result['webhook_secret'] = None
                result['webhook_events'] = {}
                result['webhooks_enabled'] = False
                result['webhook_last_error'] = None
                result['webhook_last_success'] = None
                
            return result
        
        add_method_to_class(Department, 'generate_webhook_secret', generate_webhook_secret)
        add_method_to_class(Department, 'enable_webhooks', enable_webhooks)
        add_method_to_class(Department, 'disable_webhooks', disable_webhooks)
        add_method_to_class(Department, 'update_webhook_success', update_webhook_success)
        add_method_to_class(Department, 'update_webhook_error', update_webhook_error)
        add_method_to_class(Department, 'to_dict_with_webhook', to_dict_with_webhook)
        
        # 3. Add safe getters for JSON fields to handle different database representations
        def get_json_field(obj, field_name, default=None):
            """Safely get a JSON field from an object, handling different representations"""
            if not hasattr(obj, field_name):
                return default
                
            value = getattr(obj, field_name)
            
            if value is None:
                return default
                
            if isinstance(value, dict):
                return value
                
            if isinstance(value, str):
                try:
                    return json.loads(value)
                except Exception:
                    return default
                    
            return default
            
        # Add the helper function to the global namespace
        import builtins
        setattr(builtins, 'get_json_field', get_json_field)
        logger.info("Added get_json_field helper function to global namespace")
        
        # Apply the import fix to webhook_sender module if needed
        try:
            import sys
            from importlib import reload
            if 'utils.webhook_sender' in sys.modules:
                reload(sys.modules['utils.webhook_sender'])
                logger.info("Reloaded utils.webhook_sender module")
        except Exception as e:
            logger.warning(f"Could not reload webhook_sender module: {str(e)}")
        
        logger.info("All fixes have been applied successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Failed to apply fixes: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def fix_database_tables(app, db):
    """Fix database tables at runtime"""
    from sqlalchemy import text
    
    with app.app_context():
        # Use a transaction to ensure all schema changes are atomic
        with db.engine.begin() as connection:
            dialect = db.engine.dialect.name
            
            try:
                # Check if tables exist first
                try:
                    connection.execute(text("SELECT 1 FROM users LIMIT 1"))
                    users_table_exists = True
                except Exception:
                    users_table_exists = False
                    logger.warning("Users table does not exist, skipping column additions")
                
                try:
                    connection.execute(text("SELECT 1 FROM departments LIMIT 1"))
                    departments_table_exists = True
                except Exception:
                    departments_table_exists = False
                    logger.warning("Departments table does not exist, skipping column additions")
                
                # Only proceed with column additions if tables exist
                if users_table_exists:
                    # Fix users table - add authentication fields
                    add_missing_columns(connection, 'users', [
                        ('preferences', 'JSON DEFAULT \'{}\''),
                        ('has_temp_password', 'BOOLEAN DEFAULT FALSE'),
                        ('reset_token_hash', 'VARCHAR(255)'),
                        ('reset_token_expires', 'TIMESTAMP')
                    ], dialect)
                
                if departments_table_exists:
                    # Fix departments table
                    add_missing_columns(connection, 'departments', [
                        ('webhooks_enabled', 'BOOLEAN DEFAULT FALSE'),
                        ('webhook_url', 'VARCHAR(255)'),
                        ('webhook_secret', 'VARCHAR(64)'),
                        ('webhook_events', 'JSON DEFAULT \'{"incident.created": true, "incident.updated": true, "station.created": false, "user.created": false}\''),
                        ('webhook_last_error', 'TEXT'),
                        ('webhook_last_success', 'TIMESTAMP')
                    ], dialect)
                
                # Transaction will be automatically committed if no exceptions occur
                
            except Exception as e:
                logger.error(f"Failed to modify database schema: {str(e)}")
                logger.error(traceback.format_exc())
                # Transaction will be automatically rolled back on exception
        
        # Update missing webhook secrets for departments with API keys in a separate transaction
        try:
            from database import Department
            departments_with_api = db.session.query(Department).filter_by(api_enabled=True).all()
            
            for dept in departments_with_api:
                if hasattr(dept, 'webhook_secret') and not dept.webhook_secret:
                    dept.webhook_secret = secrets.token_hex(32)
                    logger.info(f"Generated webhook secret for department {dept.id}")
            
            if departments_with_api:
                db.session.commit()
                logger.info(f"Updated webhook secrets for {len(departments_with_api)} departments")
        except Exception as e:
            logger.error(f"Failed to update webhook secrets: {str(e)}")
            db.session.rollback()
        
        logger.info("Database tables fixed successfully")

def require_api_key_safe(original_function):
    """A safer version of the require_api_key decorator that handles errors gracefully"""
    @wraps(original_function)
    def decorated_function(*args, **kwargs):
        from flask import request, jsonify
        
        try:
            # Get API key from header, query param, or form data
            api_key = request.headers.get('X-API-Key')
            if not api_key:
                api_key = request.args.get('api_key')
            if not api_key:
                api_key = request.form.get('api_key')
                
            if not api_key:
                return jsonify({"error": "API key is required"}), 401
                
            # Find department with matching API key
            try:
                from database import Department
                department = Department.query.filter_by(api_key=api_key).first()
                
                # Verification of api_enabled field (with safety check)
                api_enabled = False
                try:
                    if hasattr(department, 'api_enabled'):
                        api_enabled = bool(department.api_enabled)
                except Exception:
                    api_enabled = False
                
                if not department or not api_enabled:
                    return jsonify({"error": "Invalid or disabled API key"}), 401
                    
                # Add department to kwargs
                kwargs['department'] = department
                return original_function(*args, **kwargs)
            except Exception as e:
                logger.error(f"Error in require_api_key: {str(e)}")
                return jsonify({"error": "Authentication error", "details": str(e)}), 500
                
        except Exception as e:
            logger.error(f"Unexpected error in require_api_key: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500
            
    return decorated_function

def patch_app_routes(app):
    """Patch application routes with safer versions"""
    try:
        from flask import Flask
        
        # Get all endpoints from app
        for rule in app.url_map.iter_rules():
            endpoint = rule.endpoint
            view_func = app.view_functions.get(endpoint)
            
            # Check if this is an API endpoint that uses require_api_key
            if endpoint.startswith('api_') and hasattr(view_func, '__wrapped__'):
                # Get original function
                original_func = view_func.__wrapped__
                
                # Replace with safer version
                app.view_functions[endpoint] = require_api_key_safe(original_func)
                logger.info(f"Patched route {endpoint} with safer require_api_key decorator")
    except Exception as e:
        logger.error(f"Failed to patch app routes: {str(e)}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    apply_fixes()
    print("Deployment fixes applied. You can now create the app and run fix_database_tables.")