"""
Utility functions for dynamic asset handling in production deployments.
"""

import os
import glob


def get_main_asset_file():
    """
    Dynamically find the main React bundle file.
    
    Returns:
        str: The filename of the main React bundle (e.g., 'index-CtqP-_vm.js')
             or None if not found.
    """
    # Look in the deployment directory first
    assets_dir = 'app/assets'
    if os.path.exists(assets_dir):
        index_files = glob.glob(os.path.join(assets_dir, 'index-*.js'))
        if index_files:
            return os.path.basename(index_files[0])
    
    # Fallback to build directory
    build_assets_dir = 'react-app/dist/assets'
    if os.path.exists(build_assets_dir):
        index_files = glob.glob(os.path.join(build_assets_dir, 'index-*.js'))
        if index_files:
            return os.path.basename(index_files[0])
    
    # Return None if no index file found
    return None


def get_asset_manifest():
    """
    Get the full asset manifest for the React app.
    
    Returns:
        dict: Dictionary containing all asset files mapped by their logical names.
    """
    manifest = {}
    
    # Look for all assets in the deployment directory
    assets_dir = 'app/assets'
    if os.path.exists(assets_dir):
        for filename in os.listdir(assets_dir):
            if filename.endswith('.js'):
                # Map logical name to actual filename
                if filename.startswith('index-'):
                    manifest['main'] = filename
                else:
                    # Extract logical name from filename (e.g., 'AdminDashboard-BT25J5tX.js' -> 'AdminDashboard')
                    logical_name = filename.split('-')[0]
                    manifest[logical_name] = filename
    
    return manifest


def ensure_assets_copied():
    """
    Ensure the latest React build assets are copied to the deployment directory.
    
    Returns:
        bool: True if assets were copied successfully, False otherwise.
    """
    try:
        import shutil
        
        # Source and destination directories
        source_dir = 'react-app/dist'
        dest_dir = 'app'
        
        # Check if source directory exists
        if not os.path.exists(source_dir):
            return False
            
        # Copy all files from source to destination
        if os.path.exists(dest_dir):
            # Remove existing directory to ensure clean copy
            shutil.rmtree(dest_dir)
            
        shutil.copytree(source_dir, dest_dir)
        return True
        
    except Exception as e:
        print(f"Error copying assets: {e}")
        return False