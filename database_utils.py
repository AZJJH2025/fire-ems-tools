"""
Database utilities for retry logic and connection health monitoring
"""

import functools
import time
import logging
from typing import Callable, Any, Optional
from sqlalchemy.exc import OperationalError, DisconnectionError, TimeoutError
import psycopg2

logger = logging.getLogger(__name__)

class DatabaseRetryConfig:
    """Configuration for database retry behavior"""
    
    def __init__(self):
        self.max_attempts = 3
        self.initial_delay = 1.0
        self.max_delay = 8.0
        self.exponential_base = 2.0
        
        # Errors that should trigger retry
        self.retriable_errors = (
            OperationalError,
            DisconnectionError,
            TimeoutError,
            psycopg2.OperationalError,
            psycopg2.InterfaceError,
            psycopg2.DatabaseError
        )

def with_database_retry(config: Optional[DatabaseRetryConfig] = None):
    """
    Decorator to retry database operations with exponential backoff
    
    Args:
        config: DatabaseRetryConfig instance, uses default if None
    """
    if config is None:
        config = DatabaseRetryConfig()
    
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_exception = None
            delay = config.initial_delay
            
            for attempt in range(config.max_attempts):
                try:
                    logger.debug(f"🔄 Database operation attempt {attempt + 1}/{config.max_attempts}: {func.__name__}")
                    return func(*args, **kwargs)
                    
                except config.retriable_errors as e:
                    last_exception = e
                    
                    # Log the error with details
                    error_msg = str(e)
                    if "SSL SYSCALL error: EOF detected" in error_msg:
                        logger.warning(f"🔌 Database connection dropped during {func.__name__} (attempt {attempt + 1}): SSL EOF error")
                    elif "server closed the connection unexpectedly" in error_msg:
                        logger.warning(f"🔌 Database server closed connection during {func.__name__} (attempt {attempt + 1})")
                    else:
                        logger.warning(f"🔌 Database error in {func.__name__} (attempt {attempt + 1}): {error_msg}")
                    
                    # Don't sleep after the last attempt
                    if attempt < config.max_attempts - 1:
                        logger.info(f"⏳ Retrying {func.__name__} in {delay:.1f} seconds...")
                        time.sleep(delay)
                        delay = min(delay * config.exponential_base, config.max_delay)
                    
                except Exception as e:
                    # Non-retriable error, fail immediately
                    logger.error(f"❌ Non-retriable error in {func.__name__}: {str(e)}")
                    raise
            
            # All retries exhausted
            logger.error(f"💥 Database operation {func.__name__} failed after {config.max_attempts} attempts")
            raise last_exception
            
        return wrapper
    return decorator

def check_database_health(db) -> bool:
    """
    Check database connection health
    
    Args:
        db: SQLAlchemy database instance
        
    Returns:
        bool: True if healthy, False otherwise
    """
    try:
        # Simple query to test connection using modern SQLAlchemy 2.0 API
        with db.engine.connect() as connection:
            from sqlalchemy import text
            result = connection.execute(text("SELECT 1"))
            result.close()
        logger.debug("✅ Database health check passed")
        return True
        
    except Exception as e:
        logger.warning(f"❌ Database health check failed: {str(e)}")
        return False

def get_connection_pool_stats(db) -> dict:
    """
    Get connection pool statistics for monitoring
    
    Args:
        db: SQLAlchemy database instance
        
    Returns:
        dict: Pool statistics
    """
    try:
        pool = db.engine.pool
        return {
            'pool_size': pool.size(),
            'checked_in': pool.checkedin(),
            'checked_out': pool.checkedout(),
            'overflow': pool.overflow(),
            'invalid': pool.invalid(),
        }
    except Exception as e:
        logger.warning(f"Unable to get pool stats: {str(e)}")
        return {}

# Example usage decorators for common database operations
def retry_db_query(func):
    """Simple decorator for database queries"""
    return with_database_retry()(func)

def retry_db_write(func):
    """Decorator for database writes with slightly more aggressive retry"""
    config = DatabaseRetryConfig()
    config.max_attempts = 5  # More retries for writes
    config.max_delay = 16.0  # Longer max delay
    return with_database_retry(config)(func)