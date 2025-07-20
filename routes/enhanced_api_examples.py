"""
Enhanced API Examples

Examples showing how existing API routes can be enhanced with user-friendly
error messages without modifying core functionality.

These examples demonstrate the pattern for applying error enhancements
to existing routes in a safe, additive manner.
"""

from flask import Blueprint, request, jsonify
import logging
from utils.enhanced_error_handler import FireEMSErrorResponses, create_user_friendly_error
from utils.error_enhancement_middleware import enhanced_error_handling


logger = logging.getLogger(__name__)

# Create blueprint for enhanced examples
enhanced_bp = Blueprint('enhanced_api_examples', __name__, url_prefix='/api/enhanced')


@enhanced_bp.route('/file-upload-example', methods=['POST'])
@enhanced_error_handling
def enhanced_file_upload_example():
    """
    Example of enhanced file upload endpoint with user-friendly error handling.
    
    This demonstrates how existing upload endpoints can be enhanced
    without modifying core functionality.
    """
    try:
        # Validate file presence
        if 'file' not in request.files:
            return FireEMSErrorResponses.file_upload_error(
                "No file was selected for upload"
            )
        
        file = request.files['file']
        
        # Validate file selection
        if file.filename == '':
            return FireEMSErrorResponses.file_upload_error(
                "Please select a file to upload"
            )
        
        # Validate file type
        allowed_extensions = {'csv', 'xlsx', 'xls', 'json', 'xml'}
        if not file.filename or '.' not in file.filename:
            return FireEMSErrorResponses.file_upload_error(
                "File must have a valid extension"
            )
        
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        if file_ext not in allowed_extensions:
            return create_user_friendly_error(
                f"File type '{file_ext}' is not supported",
                context={
                    "operation": "file_upload",
                    "supported_formats": list(allowed_extensions)
                },
                status_code=400
            )
        
        # Simulate successful processing
        return jsonify({
            "success": True,
            "message": "File uploaded successfully",
            "filename": file.filename,
            "file_type": file_ext,
            "guidance": "Your file has been processed and is ready for analysis."
        })
        
    except Exception as e:
        logger.error(f"Unexpected error in file upload: {str(e)}")
        return FireEMSErrorResponses.file_upload_error(
            "An unexpected error occurred during file upload"
        )


@enhanced_bp.route('/data-validation-example', methods=['POST'])
@enhanced_error_handling  
def enhanced_data_validation_example():
    """
    Example of enhanced data validation with specific guidance for missing fields.
    
    This shows how validation errors can provide helpful guidance
    instead of generic error messages.
    """
    try:
        data = request.get_json()
        
        if not data:
            return create_user_friendly_error(
                "No data provided in request",
                context={"operation": "data_validation"},
                status_code=400
            )
        
        # Required fields with user-friendly names
        required_fields = {
            'incident_id': 'Incident ID or Number',
            'incident_date': 'Incident Date',
            'incident_type': 'Incident Type'
        }
        
        missing_fields = []
        missing_field_names = []
        
        for field, friendly_name in required_fields.items():
            if field not in data or not data[field]:
                missing_fields.append(field)
                missing_field_names.append(friendly_name)
        
        if missing_fields:
            return create_user_friendly_error(
                f"Missing required information: {', '.join(missing_field_names)}",
                context={
                    "operation": "data_validation",
                    "missing_fields": missing_fields,
                    "missing_field_names": missing_field_names
                },
                status_code=400
            )
        
        # Validate date format
        incident_date = data.get('incident_date')
        if incident_date:
            try:
                from datetime import datetime
                # Try to parse common date formats
                for date_format in ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d %H:%M:%S']:
                    try:
                        datetime.strptime(incident_date, date_format)
                        break
                    except ValueError:
                        continue
                else:
                    # No format worked
                    return create_user_friendly_error(
                        "Date format is not recognized",
                        context={"operation": "date_validation"},
                        status_code=400
                    )
            except Exception:
                return create_user_friendly_error(
                    "Invalid date format provided",
                    context={"operation": "date_validation"},
                    status_code=400
                )
        
        # Simulate successful validation
        return jsonify({
            "success": True,
            "message": "Data validation passed",
            "validated_fields": list(required_fields.keys()),
            "guidance": "Your data meets all requirements and is ready for processing."
        })
        
    except Exception as e:
        logger.error(f"Error in data validation: {str(e)}")
        return FireEMSErrorResponses.validation_error(
            "An error occurred while validating your data"
        )


@enhanced_bp.route('/authentication-example', methods=['POST'])
@enhanced_error_handling
def enhanced_authentication_example():
    """
    Example of enhanced authentication error handling.
    
    Shows how login errors can provide helpful guidance
    without revealing sensitive information.
    """
    try:
        data = request.get_json()
        
        if not data:
            return FireEMSErrorResponses.authentication_error(
                "Login information is required"
            )
        
        email = data.get('email')
        password = data.get('password')
        
        # Validate required fields
        if not email:
            return create_user_friendly_error(
                "Email address is required",
                context={"operation": "authentication", "field": "email"},
                status_code=400
            )
        
        if not password:
            return create_user_friendly_error(
                "Password is required",
                context={"operation": "authentication", "field": "password"},
                status_code=400
            )
        
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return create_user_friendly_error(
                "Please enter a valid email address",
                context={"operation": "authentication", "field": "email"},
                status_code=400
            )
        
        # Simulate authentication check
        # In real implementation, this would check against database
        if email == "admin@example.com" and password == "correct_password":
            return jsonify({
                "success": True,
                "message": "Login successful",
                "user": {"email": email, "role": "admin"},
                "guidance": "Welcome back! You now have access to all features."
            })
        else:
            return FireEMSErrorResponses.authentication_error(
                "Invalid email or password"
            )
        
    except Exception as e:
        logger.error(f"Error in authentication: {str(e)}")
        return FireEMSErrorResponses.authentication_error(
            "An error occurred during login"
        )


@enhanced_bp.route('/database-error-example', methods=['GET'])
@enhanced_error_handling
def enhanced_database_error_example():
    """
    Example of enhanced database error handling.
    
    Shows how database errors can be translated to user-friendly messages.
    """
    try:
        # Simulate different types of database errors
        error_type = request.args.get('error_type', 'connection')
        
        if error_type == 'connection':
            # Simulate connection error
            raise ConnectionError("Unable to connect to database")
        elif error_type == 'timeout':
            # Simulate timeout error
            raise TimeoutError("Database query timed out")
        elif error_type == 'duplicate':
            # Simulate duplicate key error
            raise ValueError("Duplicate entry for unique field")
        else:
            # Normal operation
            return jsonify({
                "success": True,
                "message": "Database operation successful",
                "data": {"example": "data"},
                "guidance": "Your request was processed successfully."
            })
        
    except ConnectionError as e:
        logger.error(f"Database connection error: {str(e)}")
        return create_user_friendly_error(
            "Unable to connect to the database",
            exception=e,
            context={"operation": "database_connection"},
            status_code=503
        )
    except TimeoutError as e:
        logger.error(f"Database timeout error: {str(e)}")
        return create_user_friendly_error(
            "The database request took too long to complete",
            exception=e,
            context={"operation": "database_timeout"},
            status_code=504
        )
    except ValueError as e:
        logger.error(f"Database validation error: {str(e)}")
        return create_user_friendly_error(
            "This record already exists in the system",
            exception=e,
            context={"operation": "database_validation"},
            status_code=409
        )
    except Exception as e:
        logger.error(f"Unexpected database error: {str(e)}")
        return create_user_friendly_error(
            "An unexpected database error occurred",
            exception=e,
            context={"operation": "database_general"},
            status_code=500
        )


@enhanced_bp.route('/rate-limit-example', methods=['GET'])
@enhanced_error_handling
def enhanced_rate_limit_example():
    """
    Example of enhanced rate limiting error handling.
    
    Shows how rate limit errors can provide helpful guidance.
    """
    try:
        # Simulate rate limiting check
        # In real implementation, this would check actual rate limits
        request_count = int(request.args.get('requests', 0))
        
        if request_count > 5:
            return create_user_friendly_error(
                "Too many requests - please slow down",
                context={"operation": "rate_limiting"},
                status_code=429
            )
        
        return jsonify({
            "success": True,
            "message": "Request processed successfully",
            "requests_remaining": 5 - request_count,
            "guidance": "You can make additional requests without hitting rate limits."
        })
        
    except Exception as e:
        logger.error(f"Error in rate limit check: {str(e)}")
        return create_user_friendly_error(
            "An error occurred while processing your request",
            exception=e,
            context={"operation": "rate_limiting"},
            status_code=500
        )


@enhanced_bp.route('/help', methods=['GET'])
def enhanced_api_help():
    """
    Help endpoint showing available enhanced API examples.
    
    This demonstrates how help and documentation can be integrated
    into error responses.
    """
    return jsonify({
        "title": "Enhanced API Examples",
        "description": "Examples of user-friendly error handling in Fire EMS Tools",
        "endpoints": {
            "/api/enhanced/file-upload-example": {
                "method": "POST",
                "description": "Example of enhanced file upload error handling",
                "test_cases": [
                    "No file provided",
                    "Empty filename", 
                    "Invalid file type",
                    "Successful upload"
                ]
            },
            "/api/enhanced/data-validation-example": {
                "method": "POST",
                "description": "Example of enhanced data validation with helpful guidance",
                "test_cases": [
                    "Missing required fields",
                    "Invalid date format",
                    "Successful validation"
                ]
            },
            "/api/enhanced/authentication-example": {
                "method": "POST",
                "description": "Example of enhanced authentication error handling",
                "test_cases": [
                    "Missing credentials",
                    "Invalid email format",
                    "Incorrect password",
                    "Successful login"
                ]
            },
            "/api/enhanced/database-error-example": {
                "method": "GET",
                "description": "Example of enhanced database error handling",
                "parameters": {
                    "error_type": "connection | timeout | duplicate | none"
                }
            },
            "/api/enhanced/rate-limit-example": {
                "method": "GET", 
                "description": "Example of enhanced rate limiting error handling",
                "parameters": {
                    "requests": "Number of requests (>5 triggers rate limit)"
                }
            }
        },
        "features": [
            "User-friendly error messages",
            "Context-aware guidance",
            "Solution suggestions",
            "Error categorization",
            "Helpful documentation links"
        ]
    })


# Function to demonstrate integration with existing Flask app
def register_enhanced_examples(app):
    """Register enhanced API examples with existing Flask app"""
    try:
        app.register_blueprint(enhanced_bp)
        logger.info("Enhanced API examples registered successfully")
    except Exception as e:
        logger.error(f"Failed to register enhanced API examples: {str(e)}")


if __name__ == "__main__":
    print("Enhanced API Examples")
    print("=" * 30)
    print()
    print("This module provides examples of enhanced error handling")
    print("for Fire EMS Tools API endpoints.")
    print()
    print("Test the examples at:")
    print("- /api/enhanced/help - List of available examples")
    print("- /api/enhanced/file-upload-example - File upload errors")
    print("- /api/enhanced/data-validation-example - Validation errors")
    print("- /api/enhanced/authentication-example - Auth errors")
    print("- /api/enhanced/database-error-example - Database errors")
    print("- /api/enhanced/rate-limit-example - Rate limiting errors")
    print()
    print("Each example shows user-friendly error messages with guidance.")