"""
Error Enhancement Middleware

Provides a middleware layer to enhance existing error responses with user-friendly
messages and guidance without modifying core application logic.

This is a zero-risk additive improvement that intercepts error responses and
enhances them with better user experience.
"""

import json
import logging
from flask import request, g
from werkzeug.exceptions import HTTPException
from utils.enhanced_error_handler import error_handler, FireEMSErrorResponses


logger = logging.getLogger(__name__)


class ErrorEnhancementMiddleware:
    """Middleware to enhance error responses across the application"""
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize the middleware with a Flask app"""
        app.before_request(self.before_request)
        app.after_request(self.after_request)
        app.errorhandler(Exception)(self.handle_general_exception)
        app.errorhandler(HTTPException)(self.handle_http_exception)
        
        # Register specific error handlers for common scenarios
        app.errorhandler(400)(self.handle_bad_request)
        app.errorhandler(401)(self.handle_unauthorized)
        app.errorhandler(403)(self.handle_forbidden)
        app.errorhandler(404)(self.handle_not_found)
        app.errorhandler(413)(self.handle_payload_too_large)
        app.errorhandler(422)(self.handle_unprocessable_entity)
        app.errorhandler(429)(self.handle_rate_limit)
        app.errorhandler(500)(self.handle_internal_server_error)
        app.errorhandler(503)(self.handle_service_unavailable)
    
    def before_request(self):
        """Set up request context for error handling"""
        g.request_start_time = None
        g.error_context = {
            "endpoint": request.endpoint,
            "method": request.method,
            "path": request.path,
            "user_agent": request.headers.get('User-Agent', 'unknown')
        }
    
    def after_request(self, response):
        """Enhance error responses after request processing"""
        try:
            # Only enhance JSON error responses
            if (response.status_code >= 400 and 
                response.content_type and 
                'application/json' in response.content_type):
                
                # Try to parse existing response
                try:
                    response_data = json.loads(response.get_data(as_text=True))
                    
                    # Check if response already has enhanced error format
                    if (isinstance(response_data, dict) and 
                        "error" in response_data and 
                        isinstance(response_data["error"], dict) and
                        "guidance" in response_data["error"]):
                        # Already enhanced, leave as-is
                        return response
                    
                    # Enhance basic error responses
                    enhanced_response = self._enhance_error_response(
                        response_data, 
                        response.status_code
                    )
                    
                    if enhanced_response:
                        response.set_data(json.dumps(enhanced_response))
                        
                except (json.JSONDecodeError, ValueError):
                    # Not JSON or invalid JSON, leave as-is
                    pass
                    
        except Exception as e:
            # Don't let middleware errors break the response
            logger.error(f"Error in error enhancement middleware: {str(e)}")
        
        return response
    
    def _enhance_error_response(self, response_data: dict, status_code: int) -> dict:
        """Enhance a basic error response with user-friendly messaging"""
        try:
            # Extract error message from various response formats
            error_message = None
            
            if isinstance(response_data, dict):
                # Common error response formats
                error_message = (
                    response_data.get('error') or
                    response_data.get('message') or
                    response_data.get('detail') or
                    response_data.get('description')
                )
            
            if not error_message:
                return None
            
            # Get context from request
            context = getattr(g, 'error_context', {})
            
            # Add endpoint-specific context
            if context.get('endpoint'):
                if 'upload' in context['endpoint']:
                    context['operation'] = 'file_upload'
                elif 'auth' in context['endpoint'] or 'login' in context['endpoint']:
                    context['operation'] = 'authentication'
                elif 'admin' in context['endpoint']:
                    context['operation'] = 'administration'
                elif 'transform' in context['endpoint']:
                    context['operation'] = 'data_processing'
            
            # Create enhanced error response
            enhanced_response, _ = error_handler.create_enhanced_error_response(
                str(error_message),
                context=context,
                status_code=status_code
            )
            
            # Preserve any additional fields from original response
            if isinstance(response_data, dict):
                for key, value in response_data.items():
                    if key not in ['error', 'message', 'detail', 'description']:
                        enhanced_response[key] = value
            
            return enhanced_response
            
        except Exception as e:
            logger.error(f"Error enhancing error response: {str(e)}")
            return None
    
    def handle_general_exception(self, error):
        """Handle general unhandled exceptions"""
        logger.error(f"Unhandled exception: {str(error)}", exc_info=True)
        
        # Determine appropriate error response based on context
        context = getattr(g, 'error_context', {})
        
        enhanced_response, status_code = error_handler.create_enhanced_error_response(
            str(error),
            exception=error,
            context=context,
            status_code=500
        )
        
        return enhanced_response, status_code
    
    def handle_http_exception(self, error):
        """Handle HTTP exceptions (4xx, 5xx errors)"""
        context = getattr(g, 'error_context', {})
        
        enhanced_response, _ = error_handler.create_enhanced_error_response(
            error.description or str(error),
            exception=error,
            context=context,
            status_code=error.code or 500
        )
        
        return enhanced_response, error.code or 500
    
    def handle_bad_request(self, error):
        """Handle 400 Bad Request errors"""
        context = getattr(g, 'error_context', {})
        
        # Provide specific guidance based on endpoint
        if context.get('endpoint') and 'upload' in context.get('endpoint', ''):
            return FireEMSErrorResponses.file_upload_error(
                "Invalid request format - please check your file and try again"
            )
        elif context.get('endpoint') and 'transform' in context.get('endpoint', ''):
            return FireEMSErrorResponses.data_processing_error(
                "Invalid data format - please check your field mappings"
            )
        else:
            return FireEMSErrorResponses.validation_error(
                "The request contains invalid data"
            )
    
    def handle_unauthorized(self, error):
        """Handle 401 Unauthorized errors"""
        return FireEMSErrorResponses.authentication_error(
            "Please log in to access this feature"
        )
    
    def handle_forbidden(self, error):
        """Handle 403 Forbidden errors"""
        return FireEMSErrorResponses.authorization_error(
            "You don't have permission to access this feature"
        )
    
    def handle_not_found(self, error):
        """Handle 404 Not Found errors with helpful context"""
        context = getattr(g, 'error_context', {})
        path = context.get('path', '')
        
        # Provide specific guidance based on what wasn't found
        if '/api/' in path:
            message = "The requested API endpoint was not found"
            guidance = "Please check the API documentation for available endpoints."
        elif '/docs/' in path:
            message = "The requested documentation page was not found"
            guidance = "Visit the documentation home page to find available guides."
        elif '/app/' in path:
            message = "The requested tool or page was not found"
            guidance = "Return to the homepage to access available tools."
        else:
            message = "The requested page was not found"
            guidance = "Please check the URL or return to the homepage."
        
        enhanced_response = {
            "success": False,
            "error": {
                "message": message,
                "guidance": guidance,
                "category": "navigation",
                "severity": "low",
                "solutions": [
                    {
                        "title": "Return to Homepage",
                        "description": "Go back to the main page to access available tools and features.",
                        "link": "/"
                    },
                    {
                        "title": "Browse Documentation",
                        "description": "Check our user guides and documentation for help.",
                        "link": "/docs/users/DOCUMENTATION_HUB"
                    }
                ]
            }
        }
        
        return enhanced_response, 404
    
    def handle_payload_too_large(self, error):
        """Handle 413 Payload Too Large errors"""
        return FireEMSErrorResponses.file_upload_error(
            "The uploaded file is too large for processing"
        )
    
    def handle_unprocessable_entity(self, error):
        """Handle 422 Unprocessable Entity errors"""
        context = getattr(g, 'error_context', {})
        
        if context.get('operation') == 'file_upload':
            return FireEMSErrorResponses.file_upload_error(
                "The uploaded file could not be processed"
            )
        else:
            return FireEMSErrorResponses.validation_error(
                "The submitted data could not be processed"
            )
    
    def handle_rate_limit(self, error):
        """Handle 429 Rate Limit errors"""
        enhanced_response = {
            "success": False,
            "error": {
                "message": "Too many requests - please slow down",
                "guidance": "You're making requests too quickly. Please wait a moment before trying again.",
                "category": "rate_limit",
                "severity": "medium",
                "solutions": [
                    {
                        "title": "Wait and Retry",
                        "description": "Wait 30-60 seconds before making another request.",
                        "wait_time": "30-60 seconds"
                    },
                    {
                        "title": "Reduce Request Frequency",
                        "description": "Avoid clicking buttons multiple times quickly.",
                        "tip": "Wait for operations to complete before starting new ones"
                    }
                ]
            }
        }
        
        return enhanced_response, 429
    
    def handle_internal_server_error(self, error):
        """Handle 500 Internal Server Error"""
        context = getattr(g, 'error_context', {})
        
        enhanced_response = {
            "success": False,
            "error": {
                "message": "An internal server error occurred",
                "guidance": "There was an unexpected problem on our end. Please try again in a few moments.",
                "category": "system",
                "severity": "high",
                "solutions": [
                    {
                        "title": "Try Again",
                        "description": "Wait a moment and retry your request.",
                        "wait_time": "30 seconds"
                    },
                    {
                        "title": "Check System Status",
                        "description": "Visit our health check page to see system status.",
                        "link": "/api/health"
                    },
                    {
                        "title": "Contact Support",
                        "description": "If the problem persists, please contact technical support.",
                        "contact": "support@fireems.ai"
                    }
                ]
            }
        }
        
        return enhanced_response, 500
    
    def handle_service_unavailable(self, error):
        """Handle 503 Service Unavailable errors"""
        enhanced_response = {
            "success": False,
            "error": {
                "message": "Service temporarily unavailable",
                "guidance": "The service is currently undergoing maintenance or experiencing high load.",
                "category": "system",
                "severity": "high",
                "solutions": [
                    {
                        "title": "Try Again Later",
                        "description": "Please try again in a few minutes.",
                        "wait_time": "5-10 minutes"
                    },
                    {
                        "title": "Check System Status",
                        "description": "Visit our health check page for current status.",
                        "link": "/api/health"
                    }
                ]
            }
        }
        
        return enhanced_response, 503


# Convenience function to apply error enhancement to existing Flask apps
def apply_error_enhancement(app):
    """Apply error enhancement middleware to an existing Flask app"""
    middleware = ErrorEnhancementMiddleware()
    middleware.init_app(app)
    return middleware


# Decorator for individual route error handling
def enhanced_error_handling(f):
    """Decorator to add enhanced error handling to individual routes"""
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}", exc_info=True)
            
            # Get context
            context = {
                "function": f.__name__,
                "endpoint": request.endpoint if request else "unknown"
            }
            
            enhanced_response, status_code = error_handler.create_enhanced_error_response(
                str(e),
                exception=e,
                context=context,
                status_code=500
            )
            
            return enhanced_response, status_code
    
    wrapper.__name__ = f.__name__
    return wrapper