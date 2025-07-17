# Route definitions for the React applications
# This file should be imported in the Flask app.py or tools.py file

def register_react_routes(app):
    """
    Registers routes for React applications in the Flask app
    
    Args:
        app: The Flask application object
    """
    @app.route('/data-formatter')
    def data_formatter():
        """Serve the React Data Formatter tool"""
        from flask import render_template
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        # Use template system with nonce injection and dynamic asset detection
        return render_template('react_app.html', main_asset=main_asset)
        
    @app.route('/data-formatter-react')
    def data_formatter_react():
        """Alternative route for the Data Formatter tool"""
        from flask import render_template
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        # Use template system with nonce injection and dynamic asset detection
        return render_template('react_app.html', main_asset=main_asset)
    
    @app.route('/response-time-analyzer')
    def response_time_analyzer():
        """Serve the Response Time Analyzer tool"""
        from flask import render_template
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        # Use template system with nonce injection and dynamic asset detection
        return render_template('react_app.html', main_asset=main_asset)
        
    @app.route('/response-time-analyzer-new')
    def response_time_analyzer_new():
        """New route for Response Time Analyzer"""
        from flask import render_template
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        # Use template system with nonce injection and dynamic asset detection
        return render_template('react_app.html', main_asset=main_asset)
    
    @app.route('/fire-map-pro')
    def fire_map_pro():
        """Serve the Fire Map Pro React application"""
        from flask import render_template
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        # Use template system with nonce injection and dynamic asset detection
        return render_template('react_app.html', main_asset=main_asset)
    
    @app.route('/water-supply-coverage')
    def water_supply_coverage():
        """Serve the Water Supply Coverage tool"""
        from flask import render_template
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        # Use template system with nonce injection and dynamic asset detection
        return render_template('react_app.html', main_asset=main_asset)
    
    @app.route('/station-coverage-optimizer')
    def station_coverage_optimizer():
        """Serve the Station Coverage Optimizer tool"""
        from flask import render_template
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        # Use template system with nonce injection and dynamic asset detection
        return render_template('react_app.html', main_asset=main_asset)
    
    @app.route('/iso-credit-calculator')
    def iso_credit_calculator():
        """Serve the ISO Credit Calculator tool"""
        from flask import render_template
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        # Use template system with nonce injection and dynamic asset detection
        return render_template('react_app.html', main_asset=main_asset)
    
    @app.route('/tank-zone-coverage')
    def tank_zone_coverage():
        """Serve the Tank Zone Coverage tool (legacy route - redirects to Water Supply Coverage)"""
        from flask import render_template
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        # Use template system with nonce injection and dynamic asset detection
        return render_template('react_app.html', main_asset=main_asset)
    
    # Universal HSTS middleware - ensures HSTS headers on ALL responses
    @app.before_request  
    def ensure_hsts_on_all_requests():
        """Add HSTS headers to ALL requests for HSTS preloading eligibility"""
        pass  # This will run before any route
    
    @app.after_request
    def add_hsts_to_all_responses(response):
        """Add HSTS headers to ALL responses, including redirects"""
        # Force HSTS headers on every response for preloading eligibility
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        response.headers['X-Universal-HSTS'] = 'Enabled'
        return response

    # Root domain route - handles both fireems.ai and www.fireems.ai with HSTS headers
    @app.route('/')
    def root_domain():
        """Serve the root domain with HSTS headers for preloading eligibility"""
        from flask import render_template, make_response, request, redirect, url_for
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        # If request is for root domain without www, serve directly (don't redirect)
        # This ensures HSTS headers are present on the root domain response
        if request.host == 'fireems.ai':
            response = make_response(render_template('react_app.html', main_asset=main_asset))
            response.headers['X-Root-Domain-Handler'] = 'Flask-App-Direct'
            return response
        
        # For www.fireems.ai, serve normally
        response = make_response(render_template('react_app.html', main_asset=main_asset))
        response.headers['X-Root-Domain-Handler'] = 'Flask-App-WWW'
        return response

    # Modern React App Routes - serve all /app/* routes with React app
    @app.route('/app/')
    @app.route('/app/<path:subpath>')
    def react_app(subpath=None):
        """Serve the modern React application for all /app/* routes"""
        from flask import render_template
        from utils.asset_utils import get_main_asset_file
        
        # Get the current main asset file dynamically
        main_asset = get_main_asset_file()
        
        return render_template('react_app.html', main_asset=main_asset)
    
    # Test route to verify route registration
    @app.route('/test-react-routes')
    def test_react_routes():
        return """
        <html>
        <head>
            <title>React Routes Test</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #2c3e50; }
                .link { display: block; margin: 10px 0; padding: 10px; background: #f5f5f5; }
            </style>
        </head>
        <body>
            <h1>React Routes Test Page</h1>
            <p>If you can see this page, route registration is working correctly.</p>
            <a class="link" href="/data-formatter-react">Go to Data Formatter</a>
            <a class="link" href="/response-time-analyzer">Go to Response Time Analyzer</a>
            <a class="link" href="/static/direct-transfer-test.html">Go to Direct Transfer Test</a>
        </body>
        </html>
        """
    
    # Add static file routes with correct MIME types
    @app.route('/static/<path:filename>')
    def serve_static(filename):
        """Serve static files with proper MIME types"""
        from flask import send_from_directory
        import mimetypes
        
        # Explicitly set MIME types for common file types
        if filename.endswith('.js'):
            return send_from_directory('static', filename, mimetype='application/javascript')
        elif filename.endswith('.css'):
            return send_from_directory('static', filename, mimetype='text/css')
        elif filename.endswith('.json'):
            return send_from_directory('static', filename, mimetype='application/json')
        elif filename.endswith('.html'):
            return send_from_directory('static', filename, mimetype='text/html')
        elif filename.endswith('.png'):
            return send_from_directory('static', filename, mimetype='image/png')
        elif filename.endswith('.jpg') or filename.endswith('.jpeg'):
            return send_from_directory('static', filename, mimetype='image/jpeg')
        elif filename.endswith('.svg'):
            return send_from_directory('static', filename, mimetype='image/svg+xml')
        elif filename.endswith('.woff2'):
            return send_from_directory('static', filename, mimetype='font/woff2')
        elif filename.endswith('.woff'):
            return send_from_directory('static', filename, mimetype='font/woff')
        
        # Default handling for other files
        return send_from_directory('static', filename)
    
    # Remove duplicate route - handled above by react_app function

    # Add specific routes for assets with MIME type handling
    @app.route('/assets/<path:filename>')
    def serve_assets(filename):
        """Serve asset files with proper MIME types"""
        from flask import send_from_directory
        import os
        
        # Check if the file exists in app/assets first (React build)
        app_assets = os.path.join('app', 'assets', filename)
        if os.path.exists(app_assets):
            if filename.endswith('.js'):
                return send_from_directory('app/assets', filename, mimetype='application/javascript')
            elif filename.endswith('.css'):
                return send_from_directory('app/assets', filename, mimetype='text/css')
            else:
                return send_from_directory('app/assets', filename)
        
        # Check if the file exists in fire-map-pro-react/assets
        fire_map_assets = os.path.join('static', 'fire-map-pro-react', 'assets', filename)
        if os.path.exists(fire_map_assets):
            if filename.endswith('.js'):
                return send_from_directory('static/fire-map-pro-react/assets', filename, mimetype='application/javascript')
            elif filename.endswith('.css'):
                return send_from_directory('static/fire-map-pro-react/assets', filename, mimetype='text/css')
            else:
                return send_from_directory('static/fire-map-pro-react/assets', filename)
        
        # Fallback to general assets directory
        if filename.endswith('.js'):
            return send_from_directory('static/assets', filename, mimetype='application/javascript')
        elif filename.endswith('.css'):
            return send_from_directory('static/assets', filename, mimetype='text/css')
        else:
            return send_from_directory('static/assets', filename)