"""
Fix for the static file path issue in the FireEMS.ai application.

This script corrects the static directory path to ensure files are found regardless
of which directory the app is launched from.
"""

import os
import logging

logger = logging.getLogger('static_path_fix')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)

def get_correct_static_path():
    """
    Returns the correct static path, ensuring it points to fire-ems-tools/static
    regardless of the current working directory.
    """
    # First try: use the directory where this script is located
    script_path = os.path.abspath(os.path.dirname(__file__))
    logger.info(f"Script directory: {script_path}")
    
    # Build the static path relative to the script directory
    static_path = os.path.join(script_path, 'static')
    
    # Verify the path exists
    if os.path.exists(static_path) and os.path.isdir(static_path):
        logger.info(f"Using static path: {static_path}")
        return static_path
    
    # Fallback: start with the current directory and navigate up until we find fire-ems-tools/static
    cwd = os.getcwd()
    logger.info(f"Current working directory: {cwd}")
    
    # If already in fire-ems-tools directory
    if os.path.basename(cwd) == 'fire-ems-tools':
        static_path = os.path.join(cwd, 'static')
        logger.info(f"In fire-ems-tools directory, using static path: {static_path}")
        return static_path
    
    # Try to find the fire-ems-tools directory
    parts = cwd.split(os.path.sep)
    for i in range(len(parts), 0, -1):
        test_path = os.path.sep.join(parts[:i])
        test_static_path = os.path.join(test_path, 'fire-ems-tools', 'static')
        
        logger.info(f"Testing static path: {test_static_path}")
        if os.path.exists(test_static_path) and os.path.isdir(test_static_path):
            logger.info(f"Found valid static path: {test_static_path}")
            return test_static_path
    
    # If we get here, try hardcoded path as a last resort
    hardcoded_path = '/Users/josephhester/fire-ems-tools/static'
    logger.info(f"Trying hardcoded path: {hardcoded_path}")
    if os.path.exists(hardcoded_path) and os.path.isdir(hardcoded_path):
        logger.info(f"Using hardcoded static path: {hardcoded_path}")
        return hardcoded_path
    
    logger.error("Could not find a valid static directory!")
    return None

# When imported, this provides the get_correct_static_path function
# When run directly, it tests and prints the path
if __name__ == "__main__":
    path = get_correct_static_path()
    if path:
        print(f"Correct static path: {path}")
        
        # List files in the static directory
        try:
            files = os.listdir(path)
            print(f"Files in {path}:")
            for file in files:
                print(f"  - {file}")
        except Exception as e:
            print(f"Error listing files: {e}")
    else:
        print("Failed to find static path!")