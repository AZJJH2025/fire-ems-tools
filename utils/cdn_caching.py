"""
CDN Caching Optimization for Fire EMS Tools

This module provides comprehensive CDN caching headers and optimization
for static assets to improve performance without modifying core functionality.

This is a zero-risk additive improvement that enhances caching behavior
while preserving all existing functionality.
"""

import os
import hashlib
import mimetypes
import logging
from datetime import datetime, timedelta
from flask import Response, request, current_app

logger = logging.getLogger(__name__)

class CDNCachingOptimizer:
    """
    CDN caching optimization with intelligent cache policies
    based on asset types and update frequency.
    """
    
    def __init__(self):
        # Cache policies for different asset types
        self.cache_policies = {
            # Long-term cache for versioned assets (1 year)
            'immutable': {
                'max_age': 31536000,  # 1 year
                'directives': 'public, max-age=31536000, immutable',
                'patterns': [
                    r'.*-[a-f0-9]{8,}\.js$',  # Vite hashed bundles
                    r'.*-[a-f0-9]{8,}\.css$', # Hashed CSS files
                    r'.*-[a-f0-9]{8,}\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$',  # Hashed assets with dots
                    r'.*-[a-f0-9]{8,}\.(png|jpg|jpeg|gif|svg|ico)$'  # Hashed images specifically
                ]
            },
            
            # Medium-term cache for stable assets (1 week)
            'stable': {
                'max_age': 604800,  # 1 week
                'directives': 'public, max-age=604800, stale-while-revalidate=86400',
                'patterns': [
                    r'.*\.woff2?$',  # Font files
                    r'.*\.ttf$',
                    r'.*\.eot$',
                    r'.*\.otf$',
                    r'favicon\.ico$',
                    r'robots\.txt$',
                    r'manifest\.json$'
                ]
            },
            
            # Short-term cache for dynamic assets (1 hour)
            'dynamic': {
                'max_age': 3600,  # 1 hour
                'directives': 'public, max-age=3600, must-revalidate',
                'patterns': [
                    r'.*\.js$',  # Non-hashed JS files
                    r'.*\.css$', # Non-hashed CSS files
                    r'.*\.(png|jpg|jpeg|gif|svg)$'  # Images without hashes
                ]
            },
            
            # No cache for development and HTML (immediate updates)
            'no_cache': {
                'max_age': 0,
                'directives': 'no-cache, no-store, must-revalidate',
                'patterns': [
                    r'.*\.html?$',
                    r'index\.html$',
                    r'.*\.php$',
                    r'.*\.json$'  # API-like responses
                ]
            }
        }
        
        # CDN-specific optimizations
        self.cdn_headers = {
            'Vary': 'Accept-Encoding',  # Support compression variations
            'X-Content-Type-Options': 'nosniff',  # Security
            'X-Frame-Options': 'DENY',  # Security for non-HTML assets
            'Referrer-Policy': 'strict-origin-when-cross-origin'  # Privacy
        }
    
    def get_cache_policy(self, filename: str) -> dict:
        """
        Determine the appropriate cache policy for a given file.
        
        Args:
            filename: The filename to analyze
            
        Returns:
            dict: Cache policy configuration
        """
        import re
        
        filename_lower = filename.lower()
        
        # Check each policy in order of specificity
        for policy_name, policy_config in self.cache_policies.items():
            for pattern in policy_config['patterns']:
                if re.match(pattern, filename_lower):
                    logger.debug(f"CDN Cache: {filename} matches {policy_name} policy")
                    return {
                        'policy': policy_name,
                        'max_age': policy_config['max_age'],
                        'directives': policy_config['directives']
                    }
        
        # Default to dynamic caching for unknown files
        logger.debug(f"CDN Cache: {filename} using default dynamic policy")
        return {
            'policy': 'dynamic',
            'max_age': self.cache_policies['dynamic']['max_age'],
            'directives': self.cache_policies['dynamic']['directives']
        }
    
    def generate_etag(self, filepath: str) -> str:
        """
        Generate an ETag for cache validation.
        
        Args:
            filepath: Path to the file
            
        Returns:
            str: ETag value
        """
        try:
            # Use file modification time and size for ETag
            stat = os.stat(filepath)
            etag_source = f"{stat.st_mtime}-{stat.st_size}"
            etag = hashlib.md5(etag_source.encode()).hexdigest()[:16]
            return f'"{etag}"'
        except Exception as e:
            logger.warning(f"Could not generate ETag for {filepath}: {e}")
            # Fallback to timestamp-based ETag
            timestamp = int(datetime.now().timestamp())
            return f'"{timestamp}"'
    
    def apply_caching_headers(self, response: Response, filename: str, filepath: str = None) -> Response:
        """
        Apply comprehensive caching headers to a Flask response.
        
        Args:
            response: Flask Response object
            filename: Name of the file being served
            filepath: Optional path to the file for ETag generation
            
        Returns:
            Response: Enhanced response with caching headers
        """
        try:
            # Get cache policy
            cache_policy = self.get_cache_policy(filename)
            
            # Apply Cache-Control header
            response.headers['Cache-Control'] = cache_policy['directives']
            
            # Add ETag if file path is available
            if filepath and os.path.exists(filepath):
                etag = self.generate_etag(filepath)
                response.headers['ETag'] = etag
                
                # Check if client has current version
                if request.headers.get('If-None-Match') == etag:
                    logger.debug(f"CDN Cache: 304 Not Modified for {filename}")
                    response.status_code = 304
                    return response
            
            # Add Expires header for better CDN compatibility
            if cache_policy['max_age'] > 0:
                expires = datetime.utcnow() + timedelta(seconds=cache_policy['max_age'])
                response.headers['Expires'] = expires.strftime('%a, %d %b %Y %H:%M:%S GMT')
            else:
                response.headers['Expires'] = '0'
            
            # Add Last-Modified header if file exists
            if filepath and os.path.exists(filepath):
                try:
                    mtime = os.path.getmtime(filepath)
                    last_modified = datetime.utcfromtimestamp(mtime)
                    response.headers['Last-Modified'] = last_modified.strftime('%a, %d %b %Y %H:%M:%S GMT')
                except Exception as e:
                    logger.warning(f"Could not set Last-Modified for {filename}: {e}")
            
            # Apply CDN-specific headers
            for header, value in self.cdn_headers.items():
                # Don't override existing headers
                if header not in response.headers:
                    response.headers[header] = value
            
            # Add debug headers in development
            if current_app and current_app.debug:
                response.headers['X-Cache-Policy'] = cache_policy['policy']
                response.headers['X-Cache-Max-Age'] = str(cache_policy['max_age'])
            
            logger.debug(f"CDN Cache: Applied {cache_policy['policy']} policy to {filename}")
            return response
            
        except Exception as e:
            logger.error(f"Error applying caching headers to {filename}: {e}")
            # Return response unchanged if caching enhancement fails
            return response
    
    def get_compression_headers(self, filename: str) -> dict:
        """
        Get compression-related headers for CDN optimization.
        
        Args:
            filename: Name of the file
            
        Returns:
            dict: Compression headers
        """
        headers = {}
        
        # Get file extension
        _, ext = os.path.splitext(filename.lower())
        
        # Compressible file types
        compressible_types = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.html': 'text/html',
            '.htm': 'text/html',
            '.json': 'application/json',
            '.xml': 'application/xml',
            '.svg': 'image/svg+xml',
            '.txt': 'text/plain'
        }
        
        if ext in compressible_types:
            headers['X-Compressible'] = 'true'
            # Hint to CDN that this content should be compressed
            headers['Content-Encoding-Hint'] = 'gzip, br'
        
        return headers


class StaticAssetOptimizer:
    """
    Static asset optimization utilities for CDN deployment.
    """
    
    def __init__(self):
        self.caching_optimizer = CDNCachingOptimizer()
    
    def optimize_response(self, response: Response, filename: str, filepath: str = None) -> Response:
        """
        Apply comprehensive optimizations to a static asset response.
        
        Args:
            response: Flask Response object
            filename: Name of the file being served
            filepath: Optional path to the file
            
        Returns:
            Response: Optimized response
        """
        try:
            # Apply caching headers
            response = self.caching_optimizer.apply_caching_headers(response, filename, filepath)
            
            # Apply compression hints
            compression_headers = self.caching_optimizer.get_compression_headers(filename)
            for header, value in compression_headers.items():
                response.headers[header] = value
            
            # Ensure proper MIME type
            _, ext = os.path.splitext(filename.lower())
            proper_mimetype = self._get_proper_mimetype(ext)
            if proper_mimetype and response.mimetype != proper_mimetype:
                response.mimetype = proper_mimetype
                response.headers['Content-Type'] = proper_mimetype
            
            # Add asset identification
            response.headers['X-Asset-Type'] = self._classify_asset(filename)
            
            logger.debug(f"Asset optimization applied to {filename}")
            return response
            
        except Exception as e:
            logger.error(f"Error optimizing response for {filename}: {e}")
            return response
    
    def _get_proper_mimetype(self, ext: str) -> str:
        """Get the correct MIME type for a file extension."""
        mime_overrides = {
            '.js': 'application/javascript',
            '.jsx': 'application/javascript',
            '.mjs': 'application/javascript',
            '.css': 'text/css',
            '.svg': 'image/svg+xml',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.otf': 'font/otf'
        }
        
        return mime_overrides.get(ext) or mimetypes.types_map.get(ext)
    
    def _classify_asset(self, filename: str) -> str:
        """Classify the type of asset for debugging."""
        _, ext = os.path.splitext(filename.lower())
        
        if ext in ['.js', '.jsx', '.mjs']:
            return 'script'
        elif ext == '.css':
            return 'stylesheet'
        elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico']:
            return 'image'
        elif ext in ['.woff', '.woff2', '.ttf', '.otf', '.eot']:
            return 'font'
        elif ext in ['.html', '.htm']:
            return 'document'
        else:
            return 'other'


# Global instances for easy import
cdn_optimizer = CDNCachingOptimizer()
asset_optimizer = StaticAssetOptimizer()


def apply_cdn_optimization(response: Response, filename: str, filepath: str = None) -> Response:
    """
    Convenience function to apply CDN optimization to a response.
    
    This is the main function that should be called from static file handlers.
    
    Args:
        response: Flask Response object
        filename: Name of the file being served
        filepath: Optional path to the file
        
    Returns:
        Response: Optimized response with CDN headers
    """
    return asset_optimizer.optimize_response(response, filename, filepath)


def get_cache_policy_info(filename: str) -> dict:
    """
    Get information about the cache policy that would be applied to a file.
    
    This is useful for debugging and monitoring.
    
    Args:
        filename: Name of the file to analyze
        
    Returns:
        dict: Cache policy information
    """
    return cdn_optimizer.get_cache_policy(filename)


# Configuration for different environments
def get_environment_config() -> dict:
    """
    Get CDN configuration based on the current environment.
    
    Returns:
        dict: Environment-specific configuration
    """
    is_production = os.environ.get('FLASK_ENV') == 'production'
    is_render = os.environ.get('RENDER') or os.environ.get('RENDER_SERVICE_ID')
    
    config = {
        'enable_long_cache': is_production,
        'enable_etags': True,
        'enable_compression_hints': True,
        'debug_headers': not is_production,
        'cdn_provider': 'cloudflare' if is_render else 'none'
    }
    
    logger.info(f"CDN Environment config: {config}")
    return config


if __name__ == "__main__":
    # Test the caching policies
    test_files = [
        'index-abc123.js',      # Should get immutable
        'main.js',              # Should get dynamic
        'styles.css',           # Should get dynamic
        'font.woff2',          # Should get stable
        'index.html',          # Should get no_cache
        'manifest.json'        # Should get stable
    ]
    
    print("CDN Caching Policy Test:")
    print("=" * 50)
    
    for filename in test_files:
        policy = get_cache_policy_info(filename)
        print(f"{filename:<20} → {policy['policy']:<10} ({policy['max_age']}s)")
    
    print("\nEnvironment Configuration:")
    print("=" * 30)
    env_config = get_environment_config()
    for key, value in env_config.items():
        print(f"{key}: {value}")