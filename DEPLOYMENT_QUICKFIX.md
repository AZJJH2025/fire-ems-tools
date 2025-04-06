# FireEMS.ai Deployment Quick Fix Guide

This document provides quick fix instructions for resolving deployment issues with the FireEMS.ai application.

## Current Issues

The application is currently failing to deploy due to the following issues:

1. Flask routes are being defined before the Flask app instance is created in app.py
2. JavaScript files have issues with loading, especially in FireMapPro's export function
3. Database schema evolution is not properly handled in some deployment environments

## Quick Fix Instructions

### Step 1: Fix the Flask Application Structure

1. Backup the current app.py file:
   ```bash
   cp app.py app.py.original
   ```

2. Replace app.py with the simplified fixed version:
   ```bash
   cp app_simple_fixed.py app.py
   ```

3. Test that the application loads correctly:
   ```bash
   python app.py
   ```

### Step 2: Fix JavaScript Issues

1. Run the deployment fix script to patch JavaScript files:
   ```bash
   python deployment_fix.py --fix
   ```

   This script will automatically fix issues in:
   - FireMapPro export functionality
   - Call Volume Forecaster chart rendering
   - Quick Stats data fetching
   - Data Formatter file upload handling

### Step 3: Ensure Database Compatibility

The fix_deployment.py script is already integrated into the application startup. It will automatically:

1. Add missing columns to database tables
2. Add missing methods to model classes
3. Handle JSON field compatibility between different database types

## Verifying the Fix

1. Start the application:
   ```bash
   python app.py
   ```

2. Visit the diagnostic endpoint to verify fixes are applied:
   ```
   http://localhost:5000/deployment-status
   ```

3. Test each of the problematic features:
   - FireMapPro map export
   - Call Volume Forecaster
   - Quick Stats
   - Data Formatter

## For Production Deployment

1. Use Gunicorn to run the application:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:8000 app:app
   ```

2. Set environment variables:
   ```bash
   export FLASK_ENV=production
   export DATABASE_URL=your_production_database_url
   ```

## Restoring Full Functionality

The simplified app.py only includes the basic routes. To restore full functionality:

1. Run the full app structure fix script:
   ```bash
   python deployment_fix_app.py
   ```

2. Review and test the generated app_fixed.py file
   
3. Once verified, replace app.py:
   ```bash
   cp app_fixed.py app.py
   ```

4. Run the full application test suite:
   ```bash
   pytest
   ```

## Troubleshooting

If you encounter issues after applying these fixes:

1. Check the logs (deployment_fix.log and server.log)
2. Ensure all required dependencies are installed (pip install -r requirements.txt)
3. Verify database connection parameters
4. Ensure static files are accessible

For ongoing support, please contact:
support@fireems.ai