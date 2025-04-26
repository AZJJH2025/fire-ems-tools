# Redis Integration for FireEMS.ai

## Overview

This document explains the Redis integration for FireEMS.ai, focusing on how it's used for rate limiting with Flask-Limiter. Redis provides persistent storage for rate limiting data, which is important in a production environment with multiple application instances.

## Configuration

### Environment Variables

The following environment variables are used for Redis configuration:

- `REDIS_URL` - The main Redis connection string (e.g., `redis://username:password@host:port/db`)
- `REDIS_SENTINEL_HOSTS` - Comma-separated list of Redis Sentinel hosts (for high availability setups)
- `REDIS_SENTINEL_MASTER` - Name of the Redis Sentinel master (defaults to 'mymaster')
- `REDIS_CLUSTER_HOSTS` - Comma-separated list of Redis Cluster hosts (for clustering)
- `REDIS_PASSWORD` - Redis password (if not included in the URL)
- `REDIS_DB` - Redis database number (defaults to 0)

### Render.yaml Configuration

The Redis service is automatically provisioned on Render via the `render.yaml` configuration:

```yaml
services:
  - type: redis
    name: fire-ems-redis
    ipAllowList:
      - source: 0.0.0.0/0
        description: everywhere
    plan: free
    maxmemoryPolicy: volatile-lru
```

The Redis connection string is automatically injected into the application's environment through:

```yaml
envVars:
  - key: REDIS_URL
    fromService:
      type: redis
      name: fire-ems-redis
      property: connectionString
```

## Implementation Details

### Storage Selection Logic

The application uses a prioritized storage selection strategy:

1. Redis direct connection (fastest, preferred)
2. Redis Sentinel (for high availability)
3. Redis Cluster (for horizontal scaling)
4. Memory storage (fallback, not recommended for production)

The implementation is in `app_utils.py` in the `get_limiter_storage()` function.

### Version Compatibility

The code handles different versions of Flask-Limiter by:

1. First attempting to initialize with the newer API pattern (storage instance)
2. Falling back to older API pattern (storage_uri) if a TypeError occurs

This ensures compatibility across different Flask-Limiter versions.

### Health Checks

The application includes health checks for Redis connectivity at:

- `/api/health-check` - Returns a JSON response with the status of all components including Redis

## Testing Redis Integration

Two test scripts are provided to verify Redis integration:

### 1. test_redis.py

This script tests direct Redis connectivity and Flask-Limiter compatibility:

```bash
# Run basic Redis connectivity test
python test_redis.py

# Provide a specific Redis URL
python test_redis.py "redis://username:password@host:port/db"
```

### 2. test_render_config.py

This script tests the application configuration with Redis in a simulated Render environment:

```bash
# Run with default configuration
python test_render_config.py

# Provide a specific Redis URL
python test_render_config.py "redis://username:password@host:port/db"
```

## Troubleshooting

### Common Issues

1. **"Using in-memory storage" warning**:
   - This is expected in development environments without Redis
   - For production, ensure `REDIS_URL` is properly set

2. **Redis connection errors**:
   - Check network connectivity to Redis server
   - Verify Redis credentials in connection string
   - Check if Redis service is running

3. **Flask-Limiter initialization errors**:
   - The application will fall back to in-memory storage if Redis is unavailable
   - Check logs for specific error messages

### Monitoring

For Render deployments, monitor Redis health via:

- The Redis service dashboard in Render
- The `/api/health-check` endpoint of the application
- Application logs for any Redis-related errors

## Local Development

For local development, you can:

1. Use Docker to run a local Redis instance:
   ```bash
   docker run --name redis -p 6379:6379 -d redis
   ```

2. Set the `REDIS_URL` environment variable:
   ```bash
   export REDIS_URL=redis://localhost:6379/0
   ```

3. Run the application or test scripts with this configuration