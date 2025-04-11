#!/usr/bin/env python3
"""
Simple server starter script for FireEMS.ai
"""
import os
import sys
import logging
from app import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("flask_server.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5005))
    app.run(host='0.0.0.0', port=port, debug=True, threaded=True)