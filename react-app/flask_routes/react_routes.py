# Route definitions for the React applications
# This file should be imported in the Flask app.py or tools.py file

def register_react_routes(app):
    """
    Registers routes for React applications in the Flask app
    
    Args:
        app: The Flask application object
    """
    @app.route('/data-formatter-react')
    def data_formatter_react():
        """Serve the React version of the Data Formatter tool"""
        from flask import send_file
        return send_file('static/react-data-formatter/index.html')
    
    @app.route('/response-time-analyzer')
    def response_time_analyzer():
        """Serve the React version of the Response Time Analyzer tool"""
        from flask import send_file
        return send_file('static/react-response-time-analyzer/index.html')
    
    # Add static file routes with correct MIME types
    @app.route('/static/<path:filename>')
    def serve_static(filename):
        """Serve static files with proper MIME types"""
        from flask import send_from_directory
        import mimetypes
        
        # Ensure JS files have the correct MIME type
        if filename.endswith('.js'):
            return send_from_directory('static', filename, mimetype='application/javascript')
        
        # Default handling for other files
        return send_from_directory('static', filename)