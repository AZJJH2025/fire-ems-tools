# Fire-EMS Tools Deployment Guide

This document provides detailed instructions for deploying the Fire-EMS Tools application, with specific attention to the fixes for deployment issues.

## Pre-deployment Steps

Before deploying to production, run the following verification steps to ensure all fixes are properly applied:

1. Run the verification script:
   ```
   python verify_deployment.py
   ```

   This will verify that all required fixes are in place and produce a verification report.

2. Run the migration script:
   ```
   python run_migrations.py
   ```

   This will apply all necessary database migrations.

## Deployment Process

### 1. Prepare the Environment

Make sure all required packages are installed:

```
pip install -r requirements.txt
```

### 2. Apply Database Migrations

The application has been updated to automatically apply database fixes and migrations at startup. However, it's recommended to run migrations explicitly before starting the application:

```
python run_migrations.py
```

### 3. Start the Application

The application can be started using:

```
python app.py
```

Or with a specific port:

```
python app.py port=8080
```

### 4. Verify Deployment

Once the application is running, verify that the deployment was successful by accessing the deployment status endpoint:

```
curl http://your-server:port/deployment-status
```

This should return a JSON response with deployment status information.

## Troubleshooting

If you encounter deployment issues, follow these troubleshooting steps:

### Database Issues

1. Check database connections:
   ```
   python test_db.py
   ```

2. Manually apply migrations:
   ```
   python -c "from database import db; from migrations.user_api_migration import run_migration; run_migration(db)"
   python -c "from database import db; from migrations.webhook_migration import run_migration; run_migration(db)"
   ```

### Application Issues

1. Check logs for error messages.

2. Ensure the application has access to all required files and directories.

3. If the application starts in emergency mode, access the `/error` endpoint to see the error details.

4. If webhook functionality fails, you may need to manually add webhook secrets:
   ```python
   python -c "from database import db, Department; import secrets; from flask import Flask; app = Flask(__name__); db.init_app(app); with app.app_context(): departments = Department.query.filter_by(api_enabled=True).all(); for dept in departments: dept.webhook_secret = secrets.token_hex(32); db.session.commit()"
   ```

## Key Components

The deployment fixes include:

1. **fix_deployment.py**: Emergency fixes for models and tables
2. **migrations/**: Database migration scripts
3. **verify_deployment.py**: Verification script
4. **run_migrations.py**: Migration runner

## Important Notes

- The application now includes comprehensive error handling and fallbacks to ensure it can start even if some components fail.
- A new `/deployment-status` endpoint is available to verify the status of deployment fixes.
- All migrations and fixes are applied automatically when the application starts.
- The `fix_deployment.py` module should be included in any deployment.

## Recovery

If deployment fails completely, you can revert to a minimal version of the application:

1. Rename `app.py` to `app.py.full`
2. Create a new `app.py` with minimal functionality that doesn't rely on database models.

Example minimal app:

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "Emergency mode - basic functionality only"

@app.route('/status')
def status():
    return jsonify({"status": "emergency mode"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
```