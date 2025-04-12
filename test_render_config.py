#!/usr/bin/env python3
"""
Test script to simulate Render configuration for FireEMS.ai.
"""

import os
import sys
import logging
from app import create_app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('render_config_test')

def test_app_initialization(redis_url=None, flask_env='production'):
    """Test app initialization with Render-like configuration"""
    # Set environment variables to simulate Render
    if redis_url:
        os.environ['REDIS_URL'] = redis_url
    
    os.environ['FLASK_ENV'] = flask_env
    os.environ['RENDER'] = 'true'
    os.environ['SECRET_KEY'] = 'test_secret_key'
    
    try:
        logger.info(f"Creating app with FLASK_ENV={flask_env} and REDIS_URL={'set' if redis_url else 'not set'}")
        app = create_app(flask_env)
        
        # Check Redis configuration
        redis_url_config = app.config.get('REDIS_URL')
        logger.info(f"Redis URL from config: {'set' if redis_url_config else 'not set'}")
        
        # Check rate limiting configuration
        ratelimit_storage_url = app.config.get('RATELIMIT_STORAGE_URL')
        logger.info(f"Rate limiting storage URL: {'set' if ratelimit_storage_url else 'not set'}")
        
        with app.app_context():
            # The check_redis_health function is defined in the create_app function
            # So we can't import it directly, but we can access it via the app's health check route
            
            # Test the limiter initialization
            from app_utils import init_limiter, limiter
            
            if limiter is None:
                logger.warning("Limiter is not initialized yet, initializing now")
                init_limiter(app)
                from app_utils import limiter
            
            if limiter:
                storage_type = limiter.limiter.storage.__class__.__name__
                logger.info(f"Limiter initialized with storage type: {storage_type}")
            else:
                logger.error("Failed to initialize rate limiter")
                
        return True
    except Exception as e:
        logger.error(f"Error during app initialization: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    # Get Redis URL from command line argument
    redis_url = sys.argv[1] if len(sys.argv) > 1 else None
    
    logger.info("==== Render Configuration Test ====")
    result = test_app_initialization(redis_url)
    
    # Exit with appropriate status code
    if result:
        logger.info("\n✅ App initialization test passed!")
        sys.exit(0)
    else:
        logger.error("\n❌ App initialization test failed. Check logs for details.")
        sys.exit(1)