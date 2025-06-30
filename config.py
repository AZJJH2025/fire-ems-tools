import os
import secrets
import hashlib
import logging
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables from .env file in development
load_dotenv()

def generate_secure_key():
    """
    Generate a secure key to use when an environment variable is not provided.
    Only used in development - production should always use an environment variable.
    """
    warning_message = (
        "WARNING: Using dynamically generated SECRET_KEY. "
        "This is acceptable for development but insecure for production. "
        "Please set a SECRET_KEY environment variable for production deployments."
    )
    logger.warning(warning_message)
    print(warning_message)
    
    # Create a somewhat stable key based on application path (still not secure enough for production)
    app_path = os.path.abspath(os.path.dirname(__file__))
    base = hashlib.sha256(app_path.encode()).digest()
    return base + secrets.token_bytes(32)

class Config:
    """Base configuration."""
    # Database settings
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    # Fix for Render Postgres URL format - always do this for safety
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
        logger.info("Fixed DATABASE_URL format to start with postgresql://")
    
    # Debug log only if needed
    if os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', 't', '1', 'yes'):
        logger.info(f"Using database URL: {SQLALCHEMY_DATABASE_URI}")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Redis Configuration (for rate limiting and other services)
    REDIS_URL = os.environ.get('REDIS_URL')
    REDIS_SENTINEL_HOSTS = os.environ.get('REDIS_SENTINEL_HOSTS')
    REDIS_SENTINEL_MASTER = os.environ.get('REDIS_SENTINEL_MASTER', 'mymaster')
    REDIS_CLUSTER_HOSTS = os.environ.get('REDIS_CLUSTER_HOSTS')
    REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD')
    REDIS_DB = int(os.environ.get('REDIS_DB', 0))
    
    # Rate Limiting Configuration
    RATELIMIT_DEFAULT = "200 per hour;50 per minute"
    RATELIMIT_STORAGE_URL = REDIS_URL  # Use Redis if available
    RATELIMIT_HEADERS_ENABLED = True
    RATELIMIT_STRATEGY = "fixed-window"
    RATELIMIT_IN_MEMORY_FALLBACK = True
    RATELIMIT_STORAGE_OPTIONS = {
        "password": REDIS_PASSWORD,
        "db": REDIS_DB
    } if REDIS_PASSWORD else None
    
    # Security settings
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        # In development, generate a key if none is provided
        # In production, this should not happen
        SECRET_KEY = generate_secure_key()
        
    # Session security settings    
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() in ('true', 't', '1', 'yes')
    SESSION_COOKIE_SAMESITE = 'Strict'
    PERMANENT_SESSION_LIFETIME = int(os.environ.get('PERMANENT_SESSION_LIFETIME', 86400))
    
    # Security headers configuration
    SECURITY_HEADERS = {
        'HSTS_MAX_AGE': int(os.environ.get('HSTS_MAX_AGE', 31536000)),  # 1 year
        'HSTS_INCLUDE_SUBDOMAINS': os.environ.get('HSTS_INCLUDE_SUBDOMAINS', 'True').lower() in ('true', 't', '1', 'yes'),
        'CSP_NONCE_ENABLED': os.environ.get('CSP_NONCE_ENABLED', 'True').lower() in ('true', 't', '1', 'yes'),
        'FRAME_OPTIONS': os.environ.get('FRAME_OPTIONS', 'SAMEORIGIN'),
        'CONTENT_TYPE_OPTIONS': os.environ.get('CONTENT_TYPE_OPTIONS', 'nosniff'),
        'XSS_PROTECTION': os.environ.get('XSS_PROTECTION', '1; mode=block'),
        'REFERRER_POLICY': os.environ.get('REFERRER_POLICY', 'strict-origin-when-cross-origin'),
        'CROSS_ORIGIN_RESOURCE_POLICY': os.environ.get('CROSS_ORIGIN_RESOURCE_POLICY', 'same-origin'),
        'PERMISSIONS_POLICY': os.environ.get('PERMISSIONS_POLICY', 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()'),
    }
    
    # CSRF Protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_SECRET_KEY = os.environ.get('WTF_CSRF_SECRET_KEY', SECRET_KEY)
    
    # HIPAA Compliance flag
    HIPAA_COMPLIANCE_MODE = os.environ.get('HIPAA_COMPLIANCE_MODE', 'True').lower() in ('true', 't', '1', 'yes')
    
    # Application general settings
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', 't', '1', 'yes')
    
    @staticmethod
    def init_app(app):
        pass

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    # For development, you can use a local SQLite database if needed
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///dev.db'

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    
    # Force secure cookies in production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # Force secure session settings in production
        app.config['SESSION_COOKIE_SECURE'] = True
        app.config['SESSION_COOKIE_SAMESITE'] = 'Strict'
        
        # Log to stderr in production
        import logging
        from logging import StreamHandler
        file_handler = StreamHandler()
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)

# Config dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    
    'default': DevelopmentConfig
}