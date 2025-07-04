# Flask Server Troubleshooting Guide

## Common Issues and Solutions

### 1. Connection Refused Issues

If you encounter "Connection refused" errors when trying to access the Flask server:

1. **Check if server is running**:
   ```bash
   ps aux | grep python3
   ```
   
2. **Restart the server** using the restart script:
   ```bash
   cd /Users/josephhester/fire-ems-tools
   ./restart_server.sh
   ```

3. **Try alternative addresses**:
   - http://127.0.0.1:5006 instead of http://localhost:5006
   - http://0.0.0.0:5006

### 2. Syntax or Import Errors

Common Python errors that may prevent the server from starting:

1. **Syntax errors** in app.py - Pay close attention to:
   - Order of Flask application initialization and route registration
   - Proper indentation and code blocks
   - Missing commas or parentheses

2. **Import errors** - Ensure proper imports:
   ```python
   # Correct imports for Flask server
   from flask import Flask, jsonify, render_template, session, request, send_file
   from flask_routes.react_routes import register_react_routes
   from flask_routes.tool_routes import register_tool_routes
   ```

### 3. Flask Process Management

1. **Kill a stuck Flask process**:
   ```bash
   pkill -f "python3 app.py"
   ```

2. **Run Flask in simple mode** for debugging:
   Edit app.py and change the server configuration:
   ```python
   app.run(host='localhost', port=5006, debug=False, threaded=False)
   ```

### 4. Server Configuration Best Practices

1. **Production vs Development**:
   - Development: `app.run(debug=True, port=5006)`
   - Testing: `app.run(host='localhost', port=5006, debug=False, threaded=False)`
   - Production: Use Gunicorn/uWSGI with proper WSGI configuration

2. **Host binding**:
   - `localhost` or `127.0.0.1`: Only accessible from your machine
   - `0.0.0.0`: Accessible from any network interface

3. **Port selection**:
   - Default Flask port: 5000
   - Our configured port: 5006
   - Avoid commonly used ports (3000, 8000, 8080)

## Fixed Server Configuration

The optimized app.py server configuration:

```python
if __name__ == "__main__":
    # Run the application
    port = int(os.environ.get("PORT", 5006))
    print(f"\n\n--------------------------------------")
    print(f"Server is starting at http://localhost:{port}")
    print(f"Access Data Formatter at: http://localhost:{port}/data-formatter-react")
    print(f"Access Response Time Analyzer at: http://localhost:{port}/response-time-analyzer")
    print(f"--------------------------------------\n\n")
    # Using minimal configuration to ensure stability
    app.run(host='localhost', port=port, debug=False, threaded=False)
```

## Starting and Stopping the Server

For the most reliable operation, use the provided scripts:

1. **Start/Restart the server**:
   ```bash
   cd /Users/josephhester/fire-ems-tools
   ./restart_server.sh
   ```

2. **Stop the server**:
   ```bash
   cd /Users/josephhester/fire-ems-tools
   pkill -f "python3 app.py"
   ```

## Access URLs

When the server is running properly:

- **Data Formatter**: http://localhost:5006/data-formatter-react
- **Response Time Analyzer**: http://localhost:5006/response-time-analyzer

## Debugging Tips

1. Check server logs for error messages
2. Ensure all required Python packages are installed
3. Verify the static files exist in the expected locations
4. Test with a simple route first before trying to access complex React apps
5. If all else fails, try running a simple HTTP server for testing:
   ```bash
   cd /Users/josephhester/fire-ems-tools/static
   python3 -m http.server 8000
   ```
   Then access http://localhost:8000/react-data-formatter/index.html