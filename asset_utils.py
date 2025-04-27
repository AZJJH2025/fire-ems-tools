"""
Asset utilities for handling webpack-generated static files in Flask application.

This module provides functionality to read webpack manifest files and 
expose them to Jinja templates for proper static asset referencing.
"""

import os
import json
import logging
import hashlib
import glob
import re
from flask import current_app
from functools import lru_cache

logger = logging.getLogger(__name__)

@lru_cache(maxsize=4)  # Cache a few manifests to avoid repeated disk reads
def load_asset_manifest(manifest_path):
    """
    Load a webpack asset manifest JSON file with caching.
    
    Args:
        manifest_path: The absolute path to the manifest file
        
    Returns:
        A dictionary with the manifest contents or an empty dict if the file doesn't exist
    """
    try:
        if not os.path.exists(manifest_path):
            logger.warning(f"Asset manifest not found at: {manifest_path}")
            return {}
            
        with open(manifest_path, 'r') as f:
            manifest_data = json.load(f)
            logger.debug(f"Successfully loaded asset manifest from {manifest_path}")
            return manifest_data
    except Exception as e:
        logger.error(f"Error loading asset manifest from {manifest_path}: {str(e)}")
        return {}

def get_asset_path(name, manifest_name='react-data-formatter'):
    """
    Get the path to a webpack asset using its logical name.
    
    Args:
        name: The logical name of the asset (e.g., 'data-formatter.js')
        manifest_name: The name of the manifest (mapping to a specific webpack config)
        
    Returns:
        The path to the asset with correct hashes, or the original name if not found
    """
    try:
        # Check if we're running on Render
        is_render = os.environ.get('RENDER', 'false').lower() == 'true'
        
        # Set correct static folder path based on environment
        if is_render:
            # Render deployment path
            root_path = '/opt/render/project/src'
        else:
            # Local development path
            root_path = os.getcwd()
        
        # Find manifest based on name
        if manifest_name == 'react-data-formatter':
            manifest_path = os.path.join(root_path, 'static', 'js', 'react-data-formatter', 'dist', 'manifest.json')
        else:
            manifest_path = os.path.join(root_path, 'static', 'js', manifest_name, 'dist', 'manifest.json')
            
        # Load the manifest
        manifest = load_asset_manifest(manifest_path)
        
        # If manifest is empty, return default path
        if not manifest:
            base_path = f'js/{manifest_name}/dist/'
            return os.path.join(base_path, name)
            
        # Check files section first
        if 'files' in manifest and name in manifest['files']:
            return os.path.join(f'js/{manifest_name}/dist/', manifest['files'][name])
            
        # Try the entrypoints section
        if 'entrypoints' in manifest:
            entry_name = name.split('.')[0]  # Strip extension to match entrypoint name
            if entry_name in manifest['entrypoints']:
                # Return the first js file in the entrypoint
                for file in manifest['entrypoints'][entry_name]:
                    if file.endswith('.js'):
                        return os.path.join(f'js/{manifest_name}/dist/', file)
        
        # Direct lookup for simple manifests
        if name in manifest:
            return os.path.join(f'js/{manifest_name}/dist/', manifest[name])
            
        # Fallback: Return the original name
        logger.warning(f"Asset '{name}' not found in manifest '{manifest_name}'")
        return os.path.join(f'js/{manifest_name}/dist/', name)
        
    except Exception as e:
        logger.error(f"Error resolving asset path for {name}: {str(e)}")
        # Default fallback path
        return f'js/{manifest_name}/dist/{name}'

# Global cache of computed hashes to avoid re-computing
# Format: {file_path: {'hash': hash_value, 'timestamp': last_computed}}
_asset_hash_cache = {}

def compute_file_hash(file_path, algorithm='sha256', length=8):
    """
    Compute a hash of the file content for cache busting.
    
    Args:
        file_path: Path to the file
        algorithm: Hash algorithm to use (default: sha256)
        length: Length of hash to return (default: 8 chars)
        
    Returns:
        Short hash of the file content
    """
    global _asset_hash_cache
    
    # Check if we have a cached hash
    if file_path in _asset_hash_cache:
        cache_entry = _asset_hash_cache[file_path]
        file_mtime = os.path.getmtime(file_path)
        
        # If file hasn't been modified since we computed the hash, use cached hash
        if cache_entry.get('timestamp', 0) >= file_mtime:
            return cache_entry['hash']
    
    # No cache hit or file modified, compute hash
    if os.path.exists(file_path):
        try:
            hasher = hashlib.new(algorithm)
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b''):
                    hasher.update(chunk)
            
            file_hash = hasher.hexdigest()[:length]
            
            # Cache the result
            _asset_hash_cache[file_path] = {
                'hash': file_hash,
                'timestamp': os.path.getmtime(file_path)
            }
            
            return file_hash
        except Exception as e:
            logger.error(f"Error computing hash for {file_path}: {str(e)}")
            return 'error'
    else:
        logger.error(f"File not found when computing hash: {file_path}")
        return 'missing'

def get_hashed_asset_url(filename):
    """
    Generate URL for a static asset with content-based hash.
    
    Args:
        filename: Relative path to asset (e.g., 'js/data-formatter-bundle.js')
        
    Returns:
        URL to the asset with content hash
    """
    try:
        # Check if we're running on Render
        is_render = os.environ.get('RENDER', 'false').lower() == 'true'
        
        # Set correct static folder path based on environment
        if is_render:
            # Render deployment path
            root_path = '/opt/render/project/src'
        else:
            # Local development path
            root_path = os.getcwd()
            
        # Find the file path
        file_path = os.path.join(root_path, 'static', filename)
        
        if os.path.exists(file_path):
            # Compute hash
            file_hash = compute_file_hash(file_path)
            
            # Split filename to insert hash
            name, ext = os.path.splitext(filename)
            
            # Generate URL with hash
            return f"/static/{name}.{file_hash}{ext}"
        else:
            logger.warning(f"Static file not found for hashing: {file_path}")
            return f"/static/{filename}"
    except Exception as e:
        logger.error(f"Error generating hashed asset URL for {filename}: {str(e)}")
        return f"/static/{filename}"

def get_git_commit_hash(short=True):
    """
    Get the current Git commit hash for cache busting.
    
    Args:
        short: Whether to return short hash (default: True)
        
    Returns:
        Current Git commit hash or None if not available
    """
    try:
        import subprocess
        
        # Get the git hash
        cmd = ['git', 'rev-parse', 'HEAD']
        if short:
            cmd = ['git', 'rev-parse', '--short', 'HEAD']
            
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        if result.returncode == 0:
            return result.stdout.strip()
        else:
            logger.warning(f"Git command failed: {result.stderr}")
            return None
    except Exception as e:
        logger.error(f"Error getting Git commit hash: {str(e)}")
        return None

def init_asset_utils(app):
    """
    Initialize the asset utilities with the Flask app.
    
    This function:
    1. Sets up a Jinja filter for asset URLs
    2. Adds utility functions to the template context
    
    Args:
        app: The Flask application instance
    """
    # Add a Jinja filter for asset URLs
    @app.template_filter('asset_url')
    def asset_url_filter(name, manifest_name='react-data-formatter'):
        return get_asset_path(name, manifest_name)
    
    # Add a Jinja filter for hashed URLs
    @app.template_filter('hashed_url')
    def hashed_url_filter(filename):
        return get_hashed_asset_url(filename)
    
    # Add a context processor for asset access
    @app.context_processor
    def asset_processor():
        return {
            'asset_url': get_asset_path,
            'manifest_lookup': get_asset_path,
            'hashed_url': get_hashed_asset_url,
            'asset_hash': compute_file_hash,
            'git_hash': get_git_commit_hash
        }
    
    logger.info("Asset utilities initialized successfully")