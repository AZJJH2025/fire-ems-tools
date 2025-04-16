"""
Asset utilities for handling webpack-generated static files in Flask application.

This module provides functionality to read webpack manifest files and 
expose them to Jinja templates for proper static asset referencing.
"""

import os
import json
import logging
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

def init_asset_utils(app):
    """
    Initialize the asset utilities with the Flask app.
    
    This function:
    1. Sets up a Jinja filter for asset URLs
    2. Adds a utility function to the template context
    
    Args:
        app: The Flask application instance
    """
    # Add a Jinja filter for asset URLs
    @app.template_filter('asset_url')
    def asset_url_filter(name, manifest_name='react-data-formatter'):
        return get_asset_path(name, manifest_name)
    
    # Add a context processor for manifest access
    @app.context_processor
    def asset_processor():
        return {
            'asset_url': get_asset_path,
            'manifest_lookup': get_asset_path
        }
    
    logger.info("Asset utilities initialized successfully")