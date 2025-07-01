"""
Enterprise Security Middleware for FireEMS.ai
Implements comprehensive security headers and CSP policies for government/enterprise compliance.
"""

import secrets
import hashlib
import re
import os
from functools import wraps
from flask import g, request, current_app
from urllib.parse import urlparse


class SecurityHeadersMiddleware:
    """
    Comprehensive security headers middleware for enterprise compliance.
    """
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize the security middleware with the Flask app."""
        app.before_request(self.generate_nonce)
        app.after_request(self.add_security_headers)
        
        # Store CSP nonces in app context
        if not hasattr(app, 'csp_nonces'):
            app.csp_nonces = {}
    
    def generate_nonce(self):
        """Generate a cryptographically secure nonce for CSP."""
        if current_app.config.get('SECURITY_HEADERS', {}).get('CSP_NONCE_ENABLED', True):
            # Generate a fresh nonce for each request
            nonce = secrets.token_urlsafe(16)
            g.csp_nonce = nonce
            g.csp_style_nonce = secrets.token_urlsafe(16)
        else:
            g.csp_nonce = None
            g.csp_style_nonce = None
    
    def get_csp_policy(self):
        """
        Generate Content Security Policy based on environment and configuration.
        """
        # Check if we're in production - Render sets various production indicators
        is_production = (
            os.environ.get('RENDER') or  # Render platform
            os.environ.get('FLASK_ENV') == 'production' or
            current_app.config.get('ENV') == 'production' or
            not current_app.config.get('DEBUG', True)
        )
        is_dev = not is_production
        
        # Debug logging for CSP environment detection
        current_app.logger.info(f"CSP Environment Detection: RENDER={os.environ.get('RENDER')}, "
                               f"FLASK_ENV={os.environ.get('FLASK_ENV')}, "
                               f"CONFIG_ENV={current_app.config.get('ENV')}, "
                               f"DEBUG={current_app.config.get('DEBUG')}, "
                               f"is_production={is_production}, is_dev={is_dev}")
        nonce = getattr(g, 'csp_nonce', None)
        style_nonce = getattr(g, 'csp_style_nonce', None)
        
        if is_dev:
            # Development CSP - more permissive for development tools
            script_nonce = f"'nonce-{nonce}'" if nonce else ""
            style_nonce = f"'nonce-{style_nonce}'" if style_nonce else ""
            script_src = f"script-src 'self' {script_nonce} 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net"
            style_src = f"style-src 'self' {style_nonce} 'unsafe-inline' https://fonts.googleapis.com"
            
            csp_directives = [
                "default-src 'self'",
                script_src,
                style_src,
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: https:",
                "connect-src 'self' https://api.github.com",  # For dependency checks
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "upgrade-insecure-requests"
            ]
        else:
            # Production CSP - React-compatible security policy
            script_nonce = f"'nonce-{nonce}'" if nonce else ""
            style_nonce = f"'nonce-{style_nonce}'" if style_nonce else ""
            # Allow 'unsafe-inline' for styles and Google Fonts for Material-UI
            script_src = f"script-src 'self' {script_nonce}"
            # Material-UI bundles styles at build time without nonces, so skip nonces for styles
            # Allow trusted CDNs for Bootstrap, Font Awesome, and Google Fonts
            style_src = f"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com data:"
            style_src_elem = f"style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com data:"
            
            csp_directives = [
                "default-src 'self'",
                script_src,
                style_src,
                style_src_elem,  # Required for JavaScript-injected styles from Material-UI
                "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",  # Allow Google Fonts and Font Awesome
                "img-src 'self' data: blob:",  # Allow blob: for charts/images
                "connect-src 'self'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "upgrade-insecure-requests"
            ]
        
        # Add report-uri if CSP reporting is enabled
        if current_app.config.get('CSP_REPORT_URI'):
            csp_directives.append(f"report-uri {current_app.config['CSP_REPORT_URI']}")
        else:
            csp_directives.append("report-uri /api/csp-report")
        
        return "; ".join(filter(None, csp_directives))
    
    def add_security_headers(self, response):
        """
        Add comprehensive security headers to all responses.
        """
        # Skip security headers for certain file types or paths
        if self._should_skip_headers(request.path):
            return response
        
        security_config = current_app.config.get('SECURITY_HEADERS', {})
        
        # Content Security Policy
        csp_policy = self.get_csp_policy()
        response.headers['Content-Security-Policy'] = csp_policy
        
        # HTTP Strict Transport Security (HSTS) - Force set for production
        # Always set HSTS headers since Render.com serves everything over HTTPS
        hsts_max_age = security_config.get('HSTS_MAX_AGE', 31536000)
        hsts_header = f"max-age={hsts_max_age}"
        
        if security_config.get('HSTS_INCLUDE_SUBDOMAINS', True):
            hsts_header += "; includeSubDomains"
        
        if security_config.get('HSTS_PRELOAD', True):
            hsts_header += "; preload"
        
        response.headers['Strict-Transport-Security'] = hsts_header
        current_app.logger.info(f"HSTS Header Always Set: {hsts_header}")
        
        # X-Content-Type-Options
        response.headers['X-Content-Type-Options'] = security_config.get('CONTENT_TYPE_OPTIONS', 'nosniff')
        
        # X-Frame-Options
        response.headers['X-Frame-Options'] = security_config.get('FRAME_OPTIONS', 'SAMEORIGIN')
        
        # X-XSS-Protection (deprecated but still used by some browsers)
        response.headers['X-XSS-Protection'] = security_config.get('XSS_PROTECTION', '1; mode=block')
        
        # Referrer-Policy
        response.headers['Referrer-Policy'] = security_config.get('REFERRER_POLICY', 'strict-origin-when-cross-origin')
        
        # Cross-Origin-Resource-Policy
        response.headers['Cross-Origin-Resource-Policy'] = security_config.get('CROSS_ORIGIN_RESOURCE_POLICY', 'same-origin')
        
        # Permissions-Policy (formerly Feature-Policy)
        response.headers['Permissions-Policy'] = security_config.get('PERMISSIONS_POLICY', 
            'camera=(), microphone=(), geolocation=(self), payment=(), usb=()')
        
        # Cross-Origin-Embedder-Policy for additional isolation
        response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
        
        # Cross-Origin-Opener-Policy for popup isolation
        response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
        
        # Additional security headers for enterprise compliance
        response.headers['X-Permitted-Cross-Domain-Policies'] = 'none'
        response.headers['X-Download-Options'] = 'noopen'
        
        # Cache control for sensitive pages
        if self._is_sensitive_page(request.path):
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, private'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
        
        return response
    
    def _should_skip_headers(self, path):
        """
        Determine if security headers should be skipped for certain paths.
        """
        skip_paths = [
            '/static/',
            '/assets/',
            '/api/health-check',
            '/diagnostic/',
            '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf'
        ]
        
        return any(skip in path for skip in skip_paths)
    
    def _is_sensitive_page(self, path):
        """
        Identify sensitive pages that need strict cache control.
        """
        sensitive_patterns = [
            '/admin',
            '/auth',
            '/login',
            '/dashboard',
            '/api/user',
            '/api/auth'
        ]
        
        return any(pattern in path for pattern in sensitive_patterns)


def get_sri_hash(content):
    """
    Generate Subresource Integrity (SRI) hash for content.
    """
    if isinstance(content, str):
        content = content.encode('utf-8')
    
    sha256_hash = hashlib.sha256(content).digest()
    import base64
    return f"sha256-{base64.b64encode(sha256_hash).decode('ascii')}"


def csp_nonce():
    """
    Template helper function to get the current CSP nonce.
    """
    return getattr(g, 'csp_nonce', '')


def csp_style_nonce():
    """
    Template helper function to get the current CSP style nonce.
    """
    return getattr(g, 'csp_style_nonce', '')


def secure_headers(f):
    """
    Decorator to add additional security headers to specific routes.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        response = f(*args, **kwargs)
        
        # Add route-specific headers if needed
        if hasattr(response, 'headers'):
            response.headers['X-Route-Protected'] = 'true'
        
        return response
    
    return decorated_function


def validate_referrer(allowed_domains=None):
    """
    Decorator to validate HTTP referrer for CSRF protection.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
                referrer = request.headers.get('Referer', '')
                
                if allowed_domains is None:
                    # Default to same origin
                    allowed = [request.host_url.rstrip('/')]
                else:
                    allowed = allowed_domains
                
                if referrer:
                    referrer_domain = urlparse(referrer).netloc
                    request_domain = urlparse(request.host_url).netloc
                    
                    if referrer_domain != request_domain:
                        current_app.logger.warning(f"Referrer validation failed: {referrer_domain} != {request_domain}")
                        return "Forbidden", 403
                else:
                    # Missing referrer for state-changing request
                    current_app.logger.warning("Missing referrer for state-changing request")
                    return "Forbidden", 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


# Enterprise security audit logging
class SecurityAuditLogger:
    """
    Security audit logging for compliance requirements.
    """
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize security audit logging."""
        app.before_request(self.log_request)
        app.after_request(self.log_response)
    
    def log_request(self):
        """Log security-relevant request information."""
        if self._is_security_relevant(request):
            current_app.logger.info(
                f"SECURITY_AUDIT: {request.method} {request.path} "
                f"from {request.remote_addr} "
                f"User-Agent: {request.headers.get('User-Agent', 'Unknown')}"
            )
    
    def log_response(self, response):
        """Log security-relevant response information."""
        if self._is_security_relevant(request):
            current_app.logger.info(
                f"SECURITY_AUDIT: Response {response.status_code} "
                f"for {request.method} {request.path}"
            )
        
        return response
    
    def _is_security_relevant(self, request):
        """Determine if a request is security-relevant for audit logging."""
        security_paths = [
            '/admin', '/auth', '/login', '/logout', '/api/auth',
            '/api/user', '/api/admin', '/dashboard'
        ]
        
        return (
            any(path in request.path for path in security_paths) or
            request.method in ['POST', 'PUT', 'DELETE', 'PATCH']
        )