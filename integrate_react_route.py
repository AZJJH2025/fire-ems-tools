#!/usr/bin/env python3
"""
Integration script for the React Data Formatter

This script modifies app.py to register the React Data Formatter routes.
"""

import os
import re
import sys
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("react_integration.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def backup_file(file_path):
    """Create a backup of the file before modifying it"""
    if os.path.exists(file_path):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"{file_path}.{timestamp}.bak"
        with open(file_path, 'r') as src, open(backup_path, 'w') as dst:
            dst.write(src.read())
        logger.info(f"Created backup at {backup_path}")
        return True
    else:
        logger.error(f"File not found: {file_path}")
        return False

def integrate_route():
    """Modify app.py to register the React Data Formatter routes"""
    app_py_path = os.path.join(os.getcwd(), 'app.py')
    
    # Step 1: Make a backup
    if not backup_file(app_py_path):
        return False
    
    # Step 2: Read the file
    with open(app_py_path, 'r') as f:
        content = f.read()
    
    # Step 3: Check if the import is already there
    if "from react_data_formatter_route import register_react_formatter_routes" in content:
        logger.info("Import already exists, skipping integration")
        return True
    
    # Step 4: Add the import
    import_pattern = r"(# Import blueprints|from routes\.main import bp as main_bp)"
    new_import = "# Import React Data Formatter route\nfrom react_data_formatter_route import register_react_formatter_routes\n\n"
    content = re.sub(import_pattern, new_import + r"\1", content, count=1)
    
    # Step 5: Add the registration
    register_pattern = r"(logger\.info\(\"Successfully registered all route blueprints\"\))"
    new_register = r"\1\n        # Register React Data Formatter routes\n        register_react_formatter_routes(app)\n        logger.info(\"Registered React Data Formatter routes\")"
    content = re.sub(register_pattern, new_register, content, count=1)
    
    # Step 6: Write back the modified content
    with open(app_py_path, 'w') as f:
        f.write(content)
    
    logger.info("Integration completed successfully")
    return True

if __name__ == "__main__":
    logger.info("Starting React Data Formatter integration")
    success = integrate_route()
    if success:
        logger.info("Integration completed successfully")
        print("Integration completed successfully!")
        print("To access the React Data Formatter, start the Flask server and visit:")
        print("http://localhost:5005/data-formatter-react")
    else:
        logger.error("Integration failed")
        print("Integration failed. See react_integration.log for details.")
        sys.exit(1)