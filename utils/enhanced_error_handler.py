"""
Enhanced Error Handler

Provides user-friendly error messages with actionable guidance for Fire EMS Tools.
This module enhances existing error handling without modifying core functionality.

Features:
- User-friendly error messages
- Context-aware guidance
- Common solution suggestions
- Error categorization
- Logging integration
"""

import logging
import traceback
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum
from flask import jsonify, request
from datetime import datetime


class ErrorCategory(Enum):
    """Error categories for user-friendly messaging"""
    VALIDATION = "validation"
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    FILE_UPLOAD = "file_upload"
    DATA_PROCESSING = "data_processing"
    DATABASE = "database"
    NETWORK = "network"
    SYSTEM = "system"
    CONFIGURATION = "configuration"


class ErrorSeverity(Enum):
    """Error severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EnhancedErrorHandler:
    """Enhanced error handler with user-friendly messages and guidance"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._error_patterns = self._initialize_error_patterns()
        self._solution_library = self._initialize_solution_library()
    
    def _initialize_error_patterns(self) -> Dict[str, Dict]:
        """Initialize common error patterns with user-friendly translations"""
        return {
            # File Upload Errors
            "no_file_part": {
                "category": ErrorCategory.FILE_UPLOAD,
                "severity": ErrorSeverity.MEDIUM,
                "user_message": "No file was selected for upload",
                "guidance": "Please select a file to upload before clicking the upload button.",
                "solutions": ["file_selection_help"]
            },
            "empty_filename": {
                "category": ErrorCategory.FILE_UPLOAD,
                "severity": ErrorSeverity.MEDIUM,
                "user_message": "The selected file appears to be empty or invalid",
                "guidance": "Please select a valid data file (CSV, Excel, JSON, or XML).",
                "solutions": ["file_format_help", "file_validation_help"]
            },
            "file_type_not_allowed": {
                "category": ErrorCategory.FILE_UPLOAD,
                "severity": ErrorSeverity.MEDIUM,
                "user_message": "The file format is not supported",
                "guidance": "Fire EMS Tools supports CSV, Excel (.xlsx, .xls), JSON, and XML files.",
                "solutions": ["file_format_conversion", "supported_formats_list"]
            },
            "file_too_large": {
                "category": ErrorCategory.FILE_UPLOAD,
                "severity": ErrorSeverity.MEDIUM,
                "user_message": "The uploaded file is too large",
                "guidance": "Please try uploading a smaller file or contact your administrator.",
                "solutions": ["file_size_optimization", "data_filtering"]
            },
            
            # Data Processing Errors
            "missing_required_field": {
                "category": ErrorCategory.VALIDATION,
                "severity": ErrorSeverity.HIGH,
                "user_message": "Required information is missing",
                "guidance": "Some required fields are missing from your data or field mapping.",
                "solutions": ["field_mapping_help", "data_requirements_check"]
            },
            "invalid_date_format": {
                "category": ErrorCategory.DATA_PROCESSING,
                "severity": ErrorSeverity.MEDIUM,
                "user_message": "Date format is not recognized",
                "guidance": "Please check that dates are in a standard format (MM/DD/YYYY, YYYY-MM-DD, etc.).",
                "solutions": ["date_format_examples", "data_formatting_guide"]
            },
            "data_transformation_failed": {
                "category": ErrorCategory.DATA_PROCESSING,
                "severity": ErrorSeverity.HIGH,
                "user_message": "Unable to process the data",
                "guidance": "There was an issue processing your data. Please check the format and try again.",
                "solutions": ["data_format_validation", "field_mapping_review", "contact_support"]
            },
            
            # Authentication Errors
            "login_failed": {
                "category": ErrorCategory.AUTHENTICATION,
                "severity": ErrorSeverity.MEDIUM,
                "user_message": "Login credentials are incorrect",
                "guidance": "Please check your email and password, or contact your administrator.",
                "solutions": ["password_reset_link", "account_verification"]
            },
            "session_expired": {
                "category": ErrorCategory.AUTHENTICATION,
                "severity": ErrorSeverity.LOW,
                "user_message": "Your session has expired",
                "guidance": "Please log in again to continue using the application.",
                "solutions": ["automatic_login_redirect"]
            },
            "access_denied": {
                "category": ErrorCategory.AUTHORIZATION,
                "severity": ErrorSeverity.MEDIUM,
                "user_message": "You don't have permission to access this feature",
                "guidance": "Contact your department administrator to request access.",
                "solutions": ["role_permission_info", "admin_contact"]
            },
            
            # Database Errors
            "database_connection_failed": {
                "category": ErrorCategory.DATABASE,
                "severity": ErrorSeverity.CRITICAL,
                "user_message": "Unable to connect to the database",
                "guidance": "There's a temporary issue with our servers. Please try again in a few moments.",
                "solutions": ["retry_operation", "status_page_link", "contact_support"]
            },
            "duplicate_record": {
                "category": ErrorCategory.VALIDATION,
                "severity": ErrorSeverity.MEDIUM,
                "user_message": "This record already exists",
                "guidance": "A record with this information already exists in the system.",
                "solutions": ["record_search_help", "update_existing_record"]
            },
            
            # Network Errors
            "request_timeout": {
                "category": ErrorCategory.NETWORK,
                "severity": ErrorSeverity.MEDIUM,
                "user_message": "The operation took too long to complete",
                "guidance": "Please check your internet connection and try again.",
                "solutions": ["connection_check", "retry_operation"]
            },
            "server_unavailable": {
                "category": ErrorCategory.SYSTEM,
                "severity": ErrorSeverity.HIGH,
                "user_message": "The service is temporarily unavailable",
                "guidance": "Our servers are experiencing issues. Please try again later.",
                "solutions": ["status_page_link", "retry_later", "contact_support"]
            }
        }
    
    def _initialize_solution_library(self) -> Dict[str, Dict]:
        """Initialize library of common solutions and help resources"""
        return {
            "file_selection_help": {
                "title": "How to Select a File",
                "description": "Click the 'Choose File' or 'Browse' button and select your data file from your computer.",
                "link": "/docs/users/QUICK_START#file-upload"
            },
            "file_format_help": {
                "title": "Supported File Formats",
                "description": "Fire EMS Tools supports CSV, Excel (.xlsx, .xls), JSON, and XML files.",
                "formats": ["CSV (.csv)", "Excel (.xlsx, .xls)", "JSON (.json)", "XML (.xml)"],
                "link": "/docs/users/DATA_FORMATTER#supported-formats"
            },
            "file_format_conversion": {
                "title": "Converting File Formats",
                "description": "If your data is in a different format, you can usually export it as CSV from your CAD system or spreadsheet program.",
                "steps": [
                    "Open your data in Excel or similar program",
                    "Click 'File' → 'Save As'",
                    "Choose 'CSV' from the format dropdown",
                    "Save and upload the new CSV file"
                ]
            },
            "supported_formats_list": {
                "title": "Complete List of Supported Formats",
                "formats": {
                    "CSV": "Comma-separated values - most common format",
                    "Excel": "Microsoft Excel files (.xlsx, .xls)",
                    "JSON": "JavaScript Object Notation - structured data",
                    "XML": "Extensible Markup Language - structured data"
                }
            },
            "field_mapping_help": {
                "title": "Field Mapping Guide",
                "description": "Map your data columns to the required fields for analysis.",
                "link": "/docs/users/DATA_FORMATTER#field-mapping",
                "steps": [
                    "Review the required fields list",
                    "Match your data columns to the target fields",
                    "Use the dropdown menus to create mappings",
                    "Ensure all required fields are mapped"
                ]
            },
            "data_requirements_check": {
                "title": "Data Requirements",
                "description": "Each tool requires specific data fields to function properly.",
                "common_required": [
                    "Incident ID or Number",
                    "Date and Time information",
                    "Location data (address or coordinates)"
                ],
                "link": "/docs/users/QUICK_START#data-requirements"
            },
            "date_format_examples": {
                "title": "Common Date Formats",
                "examples": [
                    "MM/DD/YYYY (01/15/2024)",
                    "YYYY-MM-DD (2024-01-15)",
                    "DD/MM/YYYY (15/01/2024)",
                    "MM-DD-YYYY (01-15-2024)",
                    "Full datetime: 01/15/2024 14:30:00"
                ],
                "note": "The system automatically detects most common date formats."
            },
            "password_reset_link": {
                "title": "Reset Your Password",
                "description": "Use the 'Forgot Password' link on the login page to reset your password.",
                "link": "/auth/forgot-password"
            },
            "role_permission_info": {
                "title": "User Roles and Permissions",
                "description": "Different user roles have different access levels.",
                "roles": {
                    "User": "Basic access to tools and data entry",
                    "Manager": "Access to departmental reports and management",
                    "Admin": "Full departmental administration access"
                }
            },
            "admin_contact": {
                "title": "Contact Your Administrator",
                "description": "Your department administrator can help with access issues and user management."
            },
            "retry_operation": {
                "title": "Try Again",
                "description": "Sometimes temporary issues resolve themselves. Please try the operation again.",
                "wait_time": "Wait 30 seconds before retrying"
            },
            "status_page_link": {
                "title": "System Status",
                "description": "Check our system status page for current service information.",
                "link": "/api/health"
            },
            "contact_support": {
                "title": "Contact Support",
                "description": "If the problem persists, please contact technical support.",
                "methods": [
                    "Email: support@fireems.ai",
                    "Submit issue on GitHub: https://github.com/anthropics/claude-code/issues"
                ]
            },
            "connection_check": {
                "title": "Check Your Connection",
                "steps": [
                    "Verify your internet connection is working",
                    "Try refreshing the page",
                    "Close and reopen your browser",
                    "Try from a different device or network"
                ]
            },
            "file_size_optimization": {
                "title": "Reducing File Size",
                "tips": [
                    "Remove unnecessary columns from your data",
                    "Filter to include only recent incidents",
                    "Save Excel files as CSV format",
                    "Contact support for help with large datasets"
                ]
            },
            "data_filtering": {
                "title": "Filter Your Data",
                "description": "Consider filtering your data to include only the information needed for analysis.",
                "suggestions": [
                    "Last 12 months of incidents",
                    "Specific incident types only",
                    "Remove test or duplicate records"
                ]
            }
        }
    
    def categorize_error(self, error_message: str, exception: Optional[Exception] = None) -> str:
        """Categorize an error based on message content and exception type"""
        error_message_lower = error_message.lower()
        
        # Check for specific error patterns
        if "no file part" in error_message_lower or "no file selected" in error_message_lower:
            return "no_file_part"
        elif "empty filename" in error_message_lower or "filename == ''" in error_message_lower:
            return "empty_filename"
        elif "file type not allowed" in error_message_lower or "not allowed" in error_message_lower:
            return "file_type_not_allowed"
        elif "missing required field" in error_message_lower:
            return "missing_required_field"
        elif "date" in error_message_lower and ("format" in error_message_lower or "parse" in error_message_lower):
            return "invalid_date_format"
        elif "transformation" in error_message_lower and "failed" in error_message_lower:
            return "data_transformation_failed"
        elif "login" in error_message_lower or "credentials" in error_message_lower:
            return "login_failed"
        elif "session" in error_message_lower and "expired" in error_message_lower:
            return "session_expired"
        elif "permission" in error_message_lower or "access denied" in error_message_lower:
            return "access_denied"
        elif "database" in error_message_lower and "connection" in error_message_lower:
            return "database_connection_failed"
        elif "duplicate" in error_message_lower or "already exists" in error_message_lower:
            return "duplicate_record"
        elif "timeout" in error_message_lower:
            return "request_timeout"
        elif "server" in error_message_lower and "unavailable" in error_message_lower:
            return "server_unavailable"
        elif "file" in error_message_lower and "large" in error_message_lower:
            return "file_too_large"
        
        # Check exception types
        if exception:
            if isinstance(exception, FileNotFoundError):
                return "file_not_found"
            elif isinstance(exception, PermissionError):
                return "access_denied"
            elif isinstance(exception, ValueError) and "date" in str(exception).lower():
                return "invalid_date_format"
            elif isinstance(exception, ConnectionError):
                return "database_connection_failed"
        
        # Default to generic system error
        return "system_error"
    
    def create_enhanced_error_response(
        self, 
        error_message: str, 
        exception: Optional[Exception] = None,
        context: Optional[Dict] = None,
        status_code: int = 500
    ) -> Tuple[Dict, int]:
        """Create an enhanced error response with user-friendly messages and guidance"""
        
        # Get request context
        request_context = {
            "endpoint": request.endpoint if request else "unknown",
            "method": request.method if request else "unknown",
            "user_agent": request.headers.get('User-Agent', 'unknown') if request else "unknown"
        }
        
        # Add any additional context
        if context:
            request_context.update(context)
        
        # Categorize the error
        error_type = self.categorize_error(error_message, exception)
        error_pattern = self._error_patterns.get(error_type, {})
        
        # Build enhanced error response
        enhanced_response = {
            "success": False,
            "error": {
                "message": error_pattern.get("user_message", error_message),
                "technical_message": error_message,  # Keep original for debugging
                "category": error_pattern.get("category", ErrorCategory.SYSTEM).value,
                "severity": error_pattern.get("severity", ErrorSeverity.MEDIUM).value,
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": request_context.get("request_id", "unknown")
            }
        }
        
        # Add user guidance
        if "guidance" in error_pattern:
            enhanced_response["error"]["guidance"] = error_pattern["guidance"]
        
        # Add solutions and help resources
        solutions = error_pattern.get("solutions", [])
        if solutions:
            enhanced_response["error"]["solutions"] = []
            for solution_key in solutions:
                solution = self._solution_library.get(solution_key, {})
                if solution:
                    enhanced_response["error"]["solutions"].append(solution)
        
        # Add context-specific help
        if error_type == "file_type_not_allowed":
            enhanced_response["error"]["supported_formats"] = [
                "CSV (.csv)",
                "Excel (.xlsx, .xls)", 
                "JSON (.json)",
                "XML (.xml)"
            ]
        elif error_type == "missing_required_field":
            # Add specific field requirements based on context
            if context and "tool" in context:
                tool_name = context["tool"]
                enhanced_response["error"]["tool_requirements"] = f"See documentation for {tool_name} field requirements"
        
        # Log the enhanced error for debugging
        self.logger.error(
            f"Enhanced error response: {error_type} - {error_message}",
            extra={
                "error_type": error_type,
                "category": error_pattern.get("category", ErrorCategory.SYSTEM).value,
                "severity": error_pattern.get("severity", ErrorSeverity.MEDIUM).value,
                "context": request_context,
                "exception": str(exception) if exception else None
            }
        )
        
        return enhanced_response, status_code
    
    def wrap_flask_error(self, original_error_func):
        """Decorator to wrap existing Flask error handlers with enhanced messaging"""
        def enhanced_error_handler(*args, **kwargs):
            try:
                # Call original error handler
                response = original_error_func(*args, **kwargs)
                
                # If response is already enhanced, return as-is
                if isinstance(response, tuple) and len(response) == 2:
                    response_data, status_code = response
                    if isinstance(response_data, dict) and "error" in response_data and "guidance" in response_data.get("error", {}):
                        return response
                
                # Enhance basic error responses
                if isinstance(response, tuple) and len(response) == 2:
                    response_data, status_code = response
                    if isinstance(response_data, dict) and "error" in response_data:
                        error_message = response_data["error"]
                        enhanced_response, _ = self.create_enhanced_error_response(
                            error_message, 
                            status_code=status_code
                        )
                        return jsonify(enhanced_response), status_code
                
                return response
                
            except Exception as e:
                # Fallback error handling
                self.logger.error(f"Error in enhanced error handler: {str(e)}")
                return jsonify({
                    "error": "An unexpected error occurred",
                    "guidance": "Please try again or contact support if the problem persists."
                }), 500
        
        return enhanced_error_handler


# Global error handler instance
error_handler = EnhancedErrorHandler()


def create_user_friendly_error(
    message: str, 
    exception: Optional[Exception] = None,
    context: Optional[Dict] = None,
    status_code: int = 500
) -> Tuple[Dict, int]:
    """Convenience function to create user-friendly error responses"""
    return error_handler.create_enhanced_error_response(
        message, exception, context, status_code
    )


def enhance_existing_error_handler(original_handler):
    """Decorator to enhance existing error handlers with user-friendly messages"""
    return error_handler.wrap_flask_error(original_handler)


# Common error response patterns for specific scenarios
class FireEMSErrorResponses:
    """Pre-built error responses for common Fire EMS Tools scenarios"""
    
    @staticmethod
    def file_upload_error(specific_message: str = None) -> Tuple[Dict, int]:
        """Standard file upload error response"""
        message = specific_message or "File upload failed"
        return create_user_friendly_error(
            message,
            context={"operation": "file_upload"},
            status_code=400
        )
    
    @staticmethod
    def data_processing_error(specific_message: str = None) -> Tuple[Dict, int]:
        """Standard data processing error response"""
        message = specific_message or "Data processing failed"
        return create_user_friendly_error(
            message,
            context={"operation": "data_processing"},
            status_code=400
        )
    
    @staticmethod
    def authentication_error(specific_message: str = None) -> Tuple[Dict, int]:
        """Standard authentication error response"""
        message = specific_message or "Authentication failed"
        return create_user_friendly_error(
            message,
            context={"operation": "authentication"},
            status_code=401
        )
    
    @staticmethod
    def authorization_error(specific_message: str = None) -> Tuple[Dict, int]:
        """Standard authorization error response"""
        message = specific_message or "Access denied"
        return create_user_friendly_error(
            message,
            context={"operation": "authorization"},
            status_code=403
        )
    
    @staticmethod
    def validation_error(specific_message: str = None, missing_fields: List[str] = None) -> Tuple[Dict, int]:
        """Standard validation error response"""
        message = specific_message or "Validation failed"
        context = {"operation": "validation"}
        if missing_fields:
            context["missing_fields"] = missing_fields
        return create_user_friendly_error(
            message,
            context=context,
            status_code=400
        )