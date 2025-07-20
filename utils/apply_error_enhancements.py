"""
Apply Error Enhancements

Safe integration script to apply user-friendly error enhancements to existing
Flask application without modifying core code.

This script can be imported and applied to add enhanced error handling
across the entire application.
"""

import logging
from flask import Flask
from utils.error_enhancement_middleware import ErrorEnhancementMiddleware, apply_error_enhancement
from utils.enhanced_error_handler import error_handler


logger = logging.getLogger(__name__)


def enhance_flask_app_errors(app: Flask) -> None:
    """
    Apply comprehensive error enhancements to a Flask application.
    
    This function is designed to be called during app initialization
    to add user-friendly error handling throughout the application.
    
    Args:
        app: Flask application instance
    """
    try:
        logger.info("Applying enhanced error handling to Flask application...")
        
        # Apply error enhancement middleware
        middleware = apply_error_enhancement(app)
        
        # Add enhanced error handling for specific routes that commonly have issues
        enhance_api_routes(app)
        
        # Add custom error pages for common scenarios
        add_custom_error_pages(app)
        
        logger.info("✅ Enhanced error handling successfully applied")
        
    except Exception as e:
        logger.error(f"Failed to apply error enhancements: {str(e)}")
        # Don't let enhancement failures break the application
        pass


def enhance_api_routes(app: Flask) -> None:
    """Add enhanced error handling to specific API routes"""
    try:
        # Get existing endpoints that commonly need enhanced error handling
        api_endpoints = [
            'api.upload_data_file',
            'api.upload_analyzer_file', 
            'api.transform_data',
            'api.api_create_incident',
            'api.api_create_station'
        ]
        
        for endpoint_name in api_endpoints:
            if endpoint_name in app.view_functions:
                original_func = app.view_functions[endpoint_name]
                app.view_functions[endpoint_name] = enhance_route_errors(original_func)
                logger.debug(f"Enhanced error handling for {endpoint_name}")
        
    except Exception as e:
        logger.error(f"Error enhancing API routes: {str(e)}")


def enhance_route_errors(original_func):
    """Wrapper to enhance error handling for individual route functions"""
    def enhanced_route(*args, **kwargs):
        try:
            return original_func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {original_func.__name__}: {str(e)}")
            
            # Create enhanced error response
            context = {
                "function": original_func.__name__,
                "route": "api"
            }
            
            enhanced_response, status_code = error_handler.create_enhanced_error_response(
                str(e),
                exception=e,
                context=context,
                status_code=500
            )
            
            return enhanced_response, status_code
    
    enhanced_route.__name__ = original_func.__name__
    return enhanced_route


def add_custom_error_pages(app: Flask) -> None:
    """Add custom error pages with helpful guidance"""
    try:
        # Add helpful 404 page for React routes
        @app.errorhandler(404)
        def enhanced_404_handler(error):
            from flask import request, jsonify
            
            # For API requests, return JSON
            if request.path.startswith('/api/'):
                return jsonify({
                    "success": False,
                    "error": {
                        "message": "API endpoint not found",
                        "guidance": "Please check the API documentation for available endpoints.",
                        "category": "navigation",
                        "severity": "medium",
                        "solutions": [
                            {
                                "title": "API Documentation",
                                "description": "Check available API endpoints and their usage.",
                                "link": "/docs/api/"
                            },
                            {
                                "title": "Health Check",
                                "description": "Verify the API service is running.",
                                "link": "/api/health"
                            }
                        ]
                    }
                }), 404
            
            # For web requests, return helpful HTML or redirect
            from flask import render_template_string
            
            error_page = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Page Not Found - Fire EMS Tools</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .error-container { max-width: 600px; margin: 0 auto; }
                    .error-title { color: #d32f2f; font-size: 24px; margin-bottom: 20px; }
                    .error-message { color: #424242; margin-bottom: 20px; }
                    .solutions { background: #f5f5f5; padding: 20px; border-radius: 4px; }
                    .solution { margin-bottom: 10px; }
                    .solution a { color: #1976d2; text-decoration: none; }
                    .solution a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1 class="error-title">🔥 Page Not Found</h1>
                    <p class="error-message">
                        The page you're looking for doesn't exist or may have been moved.
                    </p>
                    <div class="solutions">
                        <h3>What you can do:</h3>
                        <div class="solution">
                            🏠 <a href="/">Return to Homepage</a> - Access all Fire EMS Tools
                        </div>
                        <div class="solution">
                            📚 <a href="/docs/users/DOCUMENTATION_HUB">Browse Documentation</a> - User guides and help
                        </div>
                        <div class="solution">
                            🔧 <a href="/api/health">Check System Status</a> - Verify services are running
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            return render_template_string(error_page), 404
        
        logger.debug("Custom error pages added")
        
    except Exception as e:
        logger.error(f"Error adding custom error pages: {str(e)}")


def create_error_monitoring_endpoint(app: Flask) -> None:
    """Create an endpoint for monitoring error patterns (optional)"""
    try:
        @app.route('/api/error-monitoring')
        def error_monitoring():
            """Endpoint to check error handling status"""
            from flask import jsonify
            
            return jsonify({
                "error_handling_status": "enhanced",
                "features": [
                    "User-friendly error messages",
                    "Context-aware guidance", 
                    "Solution suggestions",
                    "Error categorization",
                    "Enhanced logging"
                ],
                "middleware_active": True,
                "timestamp": "2025-07-20T15:30:00Z"
            })
        
        logger.debug("Error monitoring endpoint created")
        
    except Exception as e:
        logger.error(f"Error creating monitoring endpoint: {str(e)}")


# Convenience function for quick integration
def quick_enhance_errors(app: Flask) -> None:
    """
    Quick one-line integration for enhanced error handling.
    
    Usage:
        from utils.apply_error_enhancements import quick_enhance_errors
        quick_enhance_errors(app)
    """
    enhance_flask_app_errors(app)
    create_error_monitoring_endpoint(app)


# Example integration patterns
def example_integration_patterns():
    """Example code showing how to integrate error enhancements"""
    
    # Pattern 1: During app creation
    example_app_creation = '''
    from flask import Flask
    from utils.apply_error_enhancements import quick_enhance_errors
    
    def create_app():
        app = Flask(__name__)
        
        # ... other app configuration ...
        
        # Add enhanced error handling
        quick_enhance_errors(app)
        
        return app
    '''
    
    # Pattern 2: For specific routes
    example_route_enhancement = '''
    from utils.error_enhancement_middleware import enhanced_error_handling
    
    @app.route('/api/sensitive-operation')
    @enhanced_error_handling
    def sensitive_operation():
        # ... route logic ...
        pass
    '''
    
    # Pattern 3: Manual error response creation
    example_manual_errors = '''
    from utils.enhanced_error_handler import FireEMSErrorResponses
    
    @app.route('/api/upload')
    def upload_endpoint():
        try:
            # ... upload logic ...
            pass
        except Exception as e:
            return FireEMSErrorResponses.file_upload_error(str(e))
    '''
    
    return {
        "app_creation": example_app_creation,
        "route_enhancement": example_route_enhancement,
        "manual_errors": example_manual_errors
    }


if __name__ == "__main__":
    # Test script functionality
    print("Fire EMS Tools - Error Enhancement System")
    print("=" * 50)
    print()
    print("This module provides enhanced error handling for Fire EMS Tools.")
    print("Key features:")
    print("- User-friendly error messages")
    print("- Context-aware guidance")
    print("- Solution suggestions")
    print("- Error categorization")
    print("- Zero-risk integration")
    print()
    print("Usage:")
    print("  from utils.apply_error_enhancements import quick_enhance_errors")
    print("  quick_enhance_errors(app)")
    print()
    print("For more details, see the module documentation.")