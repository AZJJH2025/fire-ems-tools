# FireEMS Tools Server Setup Guide

## Current Server Configuration

This document outlines the current configuration of the FireEMS Tools server and provides instructions for starting the server properly.

### Server Overview

- **Server Type**: Flask web server
- **Port**: 5006
- **Main Script**: `minimal_react_app_fixed.py`
- **Available Applications**:
  - Homepage: Main landing page with all tools
  - Data Formatter: React application for data formatting and standardization
  - Response Time Analyzer: Tool for analyzing emergency response times
  - Call Density Heatmap: Visualization tool for incident density
  - Incident Dashboard: Monitoring and statistics tool
  - Trend Analyzer: Data trend analysis tool

### Directory Structure

```
/fire-ems-tools/
├── minimal_react_app_fixed.py     # Main server script
├── app.py                         # Full application (not currently used)
├── static/                        # Static assets directory
│   ├── js/                        # JavaScript utilities
│   │   └── utils/
│   │       ├── data-transformer.js   # Data transformation utilities
│   │       └── data-standardizer.js  # Data standardization utilities
│   ├── react-data-formatter/         # Data Formatter React app
│   │   ├── index.html                # Main HTML file
│   │   └── assets/                   # JS, CSS, and other assets
│   ├── alt-response-analyzer/        # Response Time Analyzer app
│   │   ├── index.html                # Main HTML file
│   │   └── assets/                   # JS, CSS, and other assets
│   └── [test files]                  # Various test HTML files
└── flask_routes/                  # Flask route definitions
    ├── react_routes.py            # Routes for React applications
    └── tool_routes.py             # Routes for tool integration
```

## Starting the Server

### Step 1: Kill any existing server instances

```bash
pkill -f "minimal_react_app_fixed.py"
```

### Step 2: Start the server

```bash
python3 minimal_react_app_fixed.py
```

The server will start on port 5006 and be accessible at:
- Homepage: http://localhost:5006/
- **Data Formatter**: http://localhost:5006/app/data-formatter
- **Response Time Analyzer**: http://localhost:5006/app/response-time-analyzer
- **Fire Map Pro**: http://localhost:5006/app/fire-map-pro

**Legacy Routes (for backward compatibility):**
- Data Formatter: http://localhost:5006/data-formatter-react
- Response Time Analyzer: http://localhost:5006/response-time-analyzer
- Fire Map Pro: http://localhost:5006/fire-map-pro

## Important Technical Details

### Time Format Handling

We've added support for multiple military time formats:
- 3-digit time (730) - Handled by padding to 4 digits (0730)
- 4-digit time (0730) - Standard military time format
- 5-digit time (73045) - Military time with seconds, padded to 6 digits
- 6-digit time (073045) - Standard military time with seconds

These changes were made in:
- `/static/js/utils/data-transformer.js`
- `/static/js/utils/data-standardizer.js`

### Date Format Handling

The application supports multiple date formats:
- MM/DD/YYYY (US format)
- DD/MM/YYYY (EU format)
- YYYY-MM-DD (ISO format)
- MM-DD-YYYY
- DD-MM-YYYY
- MM.DD.YYYY
- DD.MM.YYYY
- With support for 2-digit years (YY) in applicable formats

### Test Files

We've created several test files to verify functionality:
- `/static/test-military-time.html`
- `/static/test-time-standardization.html`
- `/static/response-time-calculation-test.html`
- `/static/date-parsing-test.html`

## Troubleshooting

### Issue: React apps show 404 or blank pages

**Symptoms:** React apps return 404 errors or load HTML but show blank pages
**Root Cause:** Missing Flask routes for `/app/` URLs or `/app/assets/` 

**Solution:**
1. Verify these routes exist in `minimal_react_app_fixed.py`:
   ```python
   @app.route('/app/data-formatter')
   @app.route('/app/response-time-analyzer') 
   @app.route('/app/fire-map-pro')
   @app.route('/app/assets/<path:filename>')
   ```
2. Test asset loading: `curl -I http://127.0.0.1:5006/app/assets/index-Dl9a1DEa.js`
3. Check browser dev tools for 404 errors on JavaScript files

### Issue: JavaScript assets not loading

If JS assets are not loading, check the following:
1. Ensure the server is running on port 5006
2. Verify that the HTML files are using the correct paths for JS assets
3. Check console errors in the browser developer tools
4. **CRITICAL**: Verify `/app/assets/` route exists for React app assets

### Issue: Response Time Analyzer showing incorrect content

If the Response Time Analyzer shows Data Formatter content:
1. Make sure `minimal_react_app_fixed.py` is using the correct path: `static/alt-response-analyzer/index.html`
2. Verify that no other routes are conflicting with the Response Time Analyzer route

### Issue: Missing CSS or styling issues

If CSS or styling is missing:
1. Check that the HTML files use either absolute paths or have a properly configured base tag
2. Verify that the server is correctly serving static files from the static directory

## Future Improvements

1. Additional features:
   - Enhance filtering capabilities in Response Time Analyzer
   - Add more visualization options
   - Implement user preferences for analysis view

2. Performance optimization:
   - Optimize server response times
   - Improve data transfer between tools
   - Reduce React app bundle size

## Last Updated: May 3, 2025

This configuration is the result of troubleshooting work done to resolve issues with:
1. Time format parsing
2. React asset serving
3. Route configurations
4. Consistent styling across applications