# Render.com Deployment Instructions

## Updating Start Command

To fix the 502 errors and template not found issues, update your Render.com deployment configuration with the following changes:

1. Go to your Render.com dashboard
2. Select your Fire-EMS Tools service
3. Click on the "Settings" tab
4. Scroll down to the "Start Command" section
5. Update the start command from:
   ```
   gunicorn app:app
   ```
   To:
   ```
   gunicorn render_wsgi:app
   ```
6. Click "Save Changes"
7. Manually deploy the latest commit from the "Manual Deploy" section

## Testing After Deployment

After updating and deploying, access the following URLs to verify that everything is working correctly:

1. Home page: https://fire-ems-tools.onrender.com/
2. Login page: https://fire-ems-tools.onrender.com/login
3. Emergency diagnostics (if needed): https://fire-ems-tools.onrender.com/emergency/diagnostics

## Recovery Process If Deployment Still Fails

If you continue to experience issues:

1. Access the emergency diagnostics page: https://fire-ems-tools.onrender.com/emergency/diagnostics
2. Check for any database issues and run the database initialization if needed: https://fire-ems-tools.onrender.com/emergency/db-init
3. Create a new admin user if needed: https://fire-ems-tools.onrender.com/emergency/create-admin
4. Log in with the emergency admin credentials: emergency@fireems.ai / Emergency2025!

## What Changed

The following enhancements were made to improve deployment reliability:

1. Created `render_wsgi.py` - A wrapper that:
   - Attempts to start the main application
   - Falls back to emergency mode if the main app fails
   - Automatically creates missing template directories and files
   - Provides detailed error logs

2. Enhanced `emergency.py` with:
   - A factory function for WSGI compatibility
   - Database diagnostics and recovery tools
   - Template auto-creation for critical files
   - Better error handling and reporting

These changes make the application more resilient to deployment issues, especially when templated files are missing or database tables need to be initialized.