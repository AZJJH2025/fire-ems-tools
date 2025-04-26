#!/usr/bin/env python3
"""
Redis connectivity test script for FireEMS.ai rate limiting.
"""

import os
import sys
import logging
import redis

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('redis_test')

def test_redis_connection(redis_url=None):
    """Test if Redis is reachable and responding"""
    if not redis_url:
        # Fallback to environment variable
        redis_url = os.environ.get('REDIS_URL')
        
    if not redis_url:
        logger.error("No Redis URL provided or found in environment variables")
        return False
    
    logger.info(f"Testing Redis connection to: {redis_url.split('@')[0] if '@' in redis_url else '[redacted]'}")
    
    try:
        # Attempt to connect to Redis
        r = redis.from_url(redis_url)
        
        # Set a test key
        test_key = "health_check_test"
        r.set(test_key, "ok")
        
        # Verify we can read it back
        value = r.get(test_key)
        
        # Clean up
        r.delete(test_key)
        
        if value == b"ok":
            logger.info("✅ Redis connectivity test successful!")
            return True
        else:
            logger.error(f"❌ Redis value mismatch: {value}")
            return False
            
    except redis.RedisError as e:
        logger.error(f"❌ Redis connection error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}")
        return False

def test_flask_limiter_redis(redis_url=None):
    """Test Flask-Limiter with Redis"""
    if not redis_url:
        # Fallback to environment variable
        redis_url = os.environ.get('REDIS_URL')
        
    if not redis_url:
        logger.error("No Redis URL provided or found in environment variables")
        return False
    
    try:
        from flask_limiter import Limiter
        from flask_limiter.util import get_remote_address
        from limits.storage import RedisStorage
        
        logger.info("Testing Flask-Limiter with Redis storage")
        
        # Try to create a RedisStorage instance
        storage = RedisStorage(redis_url)
        
        # Test if we can use it for Flask-Limiter
        try:
            # With newer Flask-Limiter versions, initialize with storage instance
            limiter = Limiter(
                key_func=get_remote_address,
                default_limits=["5 per minute"],
                storage_uri=None,
                storage=storage
            )
            logger.info("✅ Flask-Limiter initialization with storage instance successful!")
            
            # Test a simple rate limit
            test_key = "test_rate_limit"
            for i in range(1, 7):
                result = limiter.limiter.hit(test_key)
                logger.info(f"Rate limit test {i}: {'Allowed' if result else 'Blocked'}")
            
            return True
        except TypeError:
            # Try older version syntax
            logger.info("Trying older Flask-Limiter initialization with storage_uri")
            limiter = Limiter(
                key_func=get_remote_address,
                default_limits=["5 per minute"],
                storage_uri=redis_url
            )
            logger.info("✅ Flask-Limiter initialization with storage_uri successful!")
            
            # Test a simple rate limit
            test_key = "test_rate_limit"
            for i in range(1, 7):
                result = limiter.limiter.hit(test_key)
                logger.info(f"Rate limit test {i}: {'Allowed' if result else 'Blocked'}")
            
            return True
    except ImportError as e:
        logger.error(f"❌ Flask-Limiter or Redis package not installed: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"❌ Flask-Limiter error: {str(e)}")
        return False

if __name__ == "__main__":
    # Get Redis URL from command line argument or environment variable
    redis_url = sys.argv[1] if len(sys.argv) > 1 else None
    
    logger.info("==== Redis Connectivity Test ====")
    redis_result = test_redis_connection(redis_url)
    
    logger.info("\n==== Flask-Limiter Test ====")
    limiter_result = test_flask_limiter_redis(redis_url)
    
    # Exit with appropriate status code
    if redis_result and limiter_result:
        logger.info("\n✅ All tests passed successfully!")
        sys.exit(0)
    else:
        logger.error("\n❌ Some tests failed. Check logs for details.")
        sys.exit(1)