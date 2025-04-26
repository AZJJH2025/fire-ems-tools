# Restoring Full Functionality Plan

This document outlines the approach to restore full functionality to the app while maintaining the proper Flask application structure.

## Current Status

We've deployed a simplified app.py that has the correct structure but only includes basic routes. This fixed the deployment issues but lacks most of the functionality from the original app.py.

## Approach

### Phase 1: Route Organization

1. Create a modular structure for routes:
   ```
   routes/
     __init__.py
     auth.py         # Login/logout routes
     api.py          # API endpoints
     main.py         # Main page routes
     dashboards.py   # Dashboard routes
     tools.py        # Tool-specific routes
     admin.py        # Admin routes
   ```

2. Extract route functions from the original app.py (app.py.bak) and organize them into these modules.

3. Update imports and dependencies to ensure everything works correctly.

### Phase 2: Utility Functions

1. Create utility modules for common functions:
   ```
   utils/
     __init__.py
     decorators.py   # Authentication and permission decorators
     formatters.py   # Data formatting functions
     validators.py   # Input validation functions
     helpers.py      # General helper functions
   ```

2. Move utility functions from the original app.py into these modules.

### Phase 3: Main App Factory

1. Update app.py to import and register all routes from the modules:
   ```python
   def create_app(config_name='default'):
       # Create Flask app
       app = Flask(__name__)
       
       # Configure the app
       app.config.from_object(config[config_name])
       
       # Initialize extensions
       db.init_app(app)
       
       # Register blueprints
       from routes import auth, api, main, dashboards, tools, admin
       app.register_blueprint(auth.bp)
       app.register_blueprint(api.bp)
       app.register_blueprint(main.bp)
       app.register_blueprint(dashboards.bp)
       app.register_blueprint(tools.bp)
       app.register_blueprint(admin.bp)
       
       return app
   ```

### Phase 4: Testing and Validation

1. Test each route to ensure it works correctly.
2. Test database interactions.
3. Test API endpoints.
4. Verify all features are working as expected.

## Implementation Plan

1. Create skeleton route files with blueprint definitions
2. Extract route functions one group at a time
3. Test each group before moving to the next
4. Update app.py to register all blueprints
5. Deploy and verify the full application works

## Rollback Plan

If issues occur, we can always revert to the simplified app.py that we know works in production.