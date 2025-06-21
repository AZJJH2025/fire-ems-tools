# React App Integration Plan

## Overview
This plan outlines the steps to integrate the built React app with the Flask application to ensure the Data Formatter tool is accessible through the existing Flask server.

## Steps

### 1. Configure Flask to Serve React Static Files

The Flask app already has several routes and mechanisms for serving static files. We'll modify it to serve our React build files as well.

1. First, copy the contents of the React build directory to the Flask static directory:
```bash
cp -r /Users/josephhester/fire-ems-tools/react-app/dist/* /Users/josephhester/fire-ems-tools/static/react-data-formatter/
```

2. Create a Flask route to serve the React app (a modification to `app.py` or `routes/tools.py`):
```python
@app.route('/data-formatter-react')
def data_formatter_react():
    """Serve the React version of the Data Formatter tool"""
    return send_file('static/react-data-formatter/index.html')
```

### 2. Configure API Routes for the React App

The React app will need to communicate with the same backend API endpoints that the existing data formatter uses. These API routes are already in place in `routes/tools.py`.

The key endpoints that will be used are:
- `/tools-api/data-formatter/upload` - For file upload
- `/tools-api/data-formatter/transform` - For data transformation
- `/tools-api/data-formatter/download` - For downloading transformed data
- `/tools-api/data-formatter/send-to-tool` - For sending data to other tools

### 3. Configure Correct Base Path in React Build

Make sure the React app is built with the correct base path. This ensures that the app can find its assets when served from the Flask application.

The `vite.config.ts` should have a `base` option that matches where it will be served from, which in this case is `/static/react-data-formatter/`.

### 4. Handle Routing and Navigation

1. Make sure internal links within the React app work correctly with the new base path.
2. Ensure navigation between the React app and other parts of the Flask application works seamlessly.

### 5. Integration Testing

After implementation:
1. Test file upload functionality
2. Test data transformation
3. Test download of transformed data
4. Test sending data to other tools
5. Test navigation between the React app and other parts of the Flask application

### 6. Fallback Strategy

In case the React integration doesn't work as expected, have a fallback strategy to revert to the original Data Formatter implementation.

## Implementation Details

### Flask Route Implementation

In `app.py` or `routes/tools.py`, add:

```python
@bp.route('/data-formatter-react')
def data_formatter_react():
    """Serve the React version of the Data Formatter tool"""
    return send_file('static/react-data-formatter/index.html')
```

### Navigation Menu Update

Consider adding a link in the navigation menu to the React version of the Data Formatter tool:

```html
<a href="/data-formatter-react">Data Formatter (React)</a>
```

### Deployment Script

Create a script to automate the deployment of the React app to the Flask static directory:

```bash
#!/bin/bash
# deploy_react.sh

# Build the React app
cd /Users/josephhester/fire-ems-tools/react-app
npm run build-no-check

# Ensure target directory exists
mkdir -p /Users/josephhester/fire-ems-tools/static/react-data-formatter

# Copy build files to Flask static directory
cp -r /Users/josephhester/fire-ems-tools/react-app/dist/* /Users/josephhester/fire-ems-tools/static/react-data-formatter/

echo "React app deployed to Flask static directory!"
```

Make the script executable:
```bash
chmod +x deploy_react.sh
```

## Conclusion

This integration approach leverages the existing Flask infrastructure to serve the React app, making it accessible through the same server that hosts the rest of the application. This solution avoids the need to run a separate server for the React app and simplifies deployment.