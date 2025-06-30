"""
SOC 2 Compliance Logging System for FireEMS.ai
Implements comprehensive audit trails for security events, access control, and data changes.
"""

import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional
from functools import wraps
from flask import request, session, g, current_app
import hashlib

class ComplianceLogger:
    """
    Centralized compliance logging for SOC 2 audit trails.
    
    This class provides structured logging for:
    - Security events (authentication, authorization)
    - Access control (login, logout, permission changes)
    - Data integrity (CRUD operations, schema changes)
    - System events (configuration changes, errors)
    """
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize the compliance logger with Flask app."""
        # Set up dedicated compliance logger
        self.logger = logging.getLogger('fireems.compliance')
        
        if not self.logger.handlers:
            # Create compliance log file handler
            file_handler = logging.FileHandler('compliance_audit.log')
            file_handler.setLevel(logging.INFO)
            
            # Structured JSON formatting for audit trails
            formatter = logging.Formatter('%(asctime)s - %(message)s')
            file_handler.setFormatter(formatter)
            
            self.logger.addHandler(file_handler)
            self.logger.setLevel(logging.INFO)
        
        # Store instance in app for access
        app.compliance_logger = self
    
    def _get_request_context(self) -> Dict[str, Any]:
        """Get current request context for audit trails."""
        context = {
            'timestamp': datetime.utcnow().isoformat(),
            'ip_address': request.remote_addr if request else 'system',
            'user_agent': request.headers.get('User-Agent', 'unknown') if request else 'system',
            'session_id': session.get('_id', 'anonymous') if session else 'system',
            'user_id': getattr(g, 'user_id', 'anonymous') if hasattr(g, 'user_id') else 'anonymous',
            'request_id': getattr(g, 'request_id', 'unknown') if hasattr(g, 'request_id') else 'unknown'
        }
        return context
    
    def _log_event(self, event_type: str, event_data: Dict[str, Any]):
        """Log a structured compliance event."""
        log_entry = {
            'event_type': event_type,
            'context': self._get_request_context(),
            'data': event_data
        }
        
        # Log as structured JSON for easy parsing
        self.logger.info(json.dumps(log_entry, default=str))
    
    # Authentication & Authorization Events
    def log_login_attempt(self, user_email: str, success: bool, failure_reason: Optional[str] = None):
        """Log user login attempts for security monitoring."""
        event_data = {
            'user_email': user_email,
            'success': success,
            'failure_reason': failure_reason,
            'auth_method': 'email_password'
        }
        self._log_event('LOGIN_ATTEMPT', event_data)
    
    def log_logout(self, user_id: str, user_email: str):
        """Log user logout for session tracking."""
        event_data = {
            'user_id': user_id,
            'user_email': user_email,
            'session_duration': 'calculated_if_available'
        }
        self._log_event('LOGOUT', event_data)
    
    def log_permission_change(self, target_user_id: str, permission_change: str, changed_by: str):
        """Log permission and role changes for access control audit."""
        event_data = {
            'target_user_id': target_user_id,
            'permission_change': permission_change,
            'changed_by': changed_by,
            'change_reason': 'admin_action'
        }
        self._log_event('PERMISSION_CHANGE', event_data)
    
    def log_admin_action(self, action: str, target: str, details: Dict[str, Any]):
        """Log administrative actions for security oversight."""
        event_data = {
            'admin_action': action,
            'target': target,
            'details': details,
            'admin_user': getattr(g, 'user_id', 'unknown')
        }
        self._log_event('ADMIN_ACTION', event_data)
    
    # Data Integrity Events
    def log_data_access(self, table: str, record_ids: list, access_type: str):
        """Log data access for confidentiality tracking."""
        event_data = {
            'table': table,
            'record_count': len(record_ids),
            'record_ids_hash': hashlib.sha256(str(sorted(record_ids)).encode()).hexdigest()[:16],
            'access_type': access_type  # 'read', 'export', 'bulk_access'
        }
        self._log_event('DATA_ACCESS', event_data)
    
    def log_data_modification(self, table: str, record_id: str, operation: str, 
                            old_values: Optional[Dict] = None, new_values: Optional[Dict] = None):
        """Log data modifications for integrity monitoring."""
        event_data = {
            'table': table,
            'record_id': record_id,
            'operation': operation,  # 'create', 'update', 'delete'
            'fields_changed': list(new_values.keys()) if new_values else [],
            'change_count': len(new_values) if new_values else 0,
            'has_sensitive_data': self._check_sensitive_fields(table, old_values, new_values)
        }
        self._log_event('DATA_MODIFICATION', event_data)
    
    def log_bulk_operation(self, operation: str, table: str, record_count: int, criteria: str):
        """Log bulk operations for data integrity oversight."""
        event_data = {
            'operation': operation,
            'table': table,
            'record_count': record_count,
            'criteria': criteria,
            'operation_id': hashlib.sha256(f"{operation}{table}{datetime.utcnow()}".encode()).hexdigest()[:16]
        }
        self._log_event('BULK_OPERATION', event_data)
    
    # System Events
    def log_configuration_change(self, config_type: str, change_details: Dict[str, Any]):
        """Log system configuration changes for operational security."""
        event_data = {
            'config_type': config_type,
            'change_details': change_details,
            'changed_by': getattr(g, 'user_id', 'system'),
            'environment': current_app.config.get('ENV', 'unknown')
        }
        self._log_event('CONFIGURATION_CHANGE', event_data)
    
    def log_security_event(self, event_type: str, severity: str, description: str, details: Dict[str, Any]):
        """Log security events for incident response."""
        event_data = {
            'security_event_type': event_type,
            'severity': severity,  # 'low', 'medium', 'high', 'critical'
            'description': description,
            'details': details,
            'requires_response': severity in ['high', 'critical']
        }
        self._log_event('SECURITY_EVENT', event_data)
    
    def log_error_event(self, error_type: str, error_details: str, stack_trace: Optional[str] = None):
        """Log application errors for availability monitoring."""
        event_data = {
            'error_type': error_type,
            'error_details': error_details,
            'has_stack_trace': stack_trace is not None,
            'endpoint': request.endpoint if request else 'unknown',
            'method': request.method if request else 'unknown'
        }
        self._log_event('ERROR_EVENT', event_data)
    
    # Export and Integration Events
    def log_data_export(self, export_type: str, record_count: int, destination: str, 
                       exported_fields: list, user_justification: Optional[str] = None):
        """Log data exports for confidentiality compliance."""
        event_data = {
            'export_type': export_type,
            'record_count': record_count,
            'destination': destination,
            'exported_fields': exported_fields,
            'contains_pii': self._check_pii_fields(exported_fields),
            'user_justification': user_justification,
            'export_id': hashlib.sha256(f"{export_type}{datetime.utcnow()}".encode()).hexdigest()[:16]
        }
        self._log_event('DATA_EXPORT', event_data)
    
    def log_api_access(self, endpoint: str, method: str, response_code: int, 
                      response_time: float, data_accessed: Optional[Dict] = None):
        """Log API access for availability and security monitoring."""
        event_data = {
            'endpoint': endpoint,
            'method': method,
            'response_code': response_code,
            'response_time_ms': round(response_time * 1000, 2),
            'data_accessed': data_accessed,
            'api_key_used': 'api_key' in request.headers if request else False
        }
        self._log_event('API_ACCESS', event_data)
    
    # Helper Methods
    def _check_sensitive_fields(self, table: str, old_values: Optional[Dict], new_values: Optional[Dict]) -> bool:
        """Check if sensitive fields are being modified."""
        sensitive_fields = {
            'users': ['email', 'password_hash', 'phone', 'ssn'],
            'departments': ['contact_email', 'phone', 'address'],
            'incidents': ['phone_number', 'caller_name', 'address']
        }
        
        table_sensitive = sensitive_fields.get(table, [])
        if not table_sensitive:
            return False
        
        modified_fields = set()
        if new_values:
            modified_fields.update(new_values.keys())
        if old_values:
            modified_fields.update(old_values.keys())
        
        return bool(set(table_sensitive) & modified_fields)
    
    def _check_pii_fields(self, field_list: list) -> bool:
        """Check if exported fields contain PII."""
        pii_fields = ['email', 'phone', 'address', 'name', 'ssn', 'phone_number', 'caller_name']
        return bool(set(pii_fields) & set(field_list))


# Decorator for automatic compliance logging
def log_compliance_event(event_type: str):
    """Decorator to automatically log compliance events for functions."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = datetime.utcnow()
            
            try:
                result = func(*args, **kwargs)
                
                # Log successful operation
                if hasattr(current_app, 'compliance_logger'):
                    duration = (datetime.utcnow() - start_time).total_seconds()
                    current_app.compliance_logger._log_event(
                        f"{event_type}_SUCCESS",
                        {
                            'function': func.__name__,
                            'duration_seconds': duration,
                            'args_count': len(args),
                            'kwargs_keys': list(kwargs.keys())
                        }
                    )
                
                return result
                
            except Exception as e:
                # Log failed operation
                if hasattr(current_app, 'compliance_logger'):
                    duration = (datetime.utcnow() - start_time).total_seconds()
                    current_app.compliance_logger._log_event(
                        f"{event_type}_FAILURE",
                        {
                            'function': func.__name__,
                            'duration_seconds': duration,
                            'error_type': type(e).__name__,
                            'error_message': str(e)
                        }
                    )
                
                raise
        
        return wrapper
    return decorator


# Usage Examples for Integration:
"""
from compliance_logger import ComplianceLogger, log_compliance_event

# In app.py
compliance_logger = ComplianceLogger(app)

# In routes
@log_compliance_event('USER_LOGIN')
def login():
    # ... login logic ...
    app.compliance_logger.log_login_attempt(email, success=True)

@log_compliance_event('DATA_EXPORT')
def export_data():
    # ... export logic ...
    app.compliance_logger.log_data_export(
        export_type='incident_data',
        record_count=100,
        destination='pdf_report',
        exported_fields=['incident_id', 'date', 'type'],
        user_justification='Monthly compliance report'
    )
"""