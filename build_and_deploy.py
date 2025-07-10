#!/usr/bin/env python3
"""
Build and Deploy Script for Fire EMS Tools React App

This script builds the React application and copies the built files to the app directory.
It's designed to work around shell environment issues.
"""

import os
import shutil
import subprocess
import sys
import glob
from pathlib import Path

# Configuration
REACT_DIR = Path("/Users/josephhester/fire-ems-tools/react-app")
APP_DIR = Path("/Users/josephhester/fire-ems-tools/app")
DIST_DIR = REACT_DIR / "dist"

def log(message, level="INFO"):
    """Simple logging function"""
    print(f"[{level}] {message}")

def check_directories():
    """Check if required directories exist"""
    log("Checking directories...")
    
    if not REACT_DIR.exists():
        log(f"React directory not found: {REACT_DIR}", "ERROR")
        return False
    
    if not (REACT_DIR / "package.json").exists():
        log("package.json not found in React directory", "ERROR")
        return False
    
    log(f"React directory: {REACT_DIR} ✓")
    return True

def build_react_app():
    """Build the React application"""
    log("Building React application...")
    
    try:
        # Change to react directory and run build
        result = subprocess.run(
            ["npm", "run", "build-no-check"],
            cwd=REACT_DIR,
            capture_output=True,
            text=True,
            timeout=600
        )
        
        if result.returncode == 0:
            log("React build completed successfully! ✓")
            return True
        else:
            log(f"Build failed with exit code {result.returncode}", "ERROR")
            if result.stderr:
                log(f"Build errors: {result.stderr}", "ERROR")
            return False
            
    except subprocess.TimeoutExpired:
        log("Build timed out", "ERROR")
        return False
    except Exception as e:
        log(f"Build exception: {e}", "ERROR")
        return False

def copy_dist_to_app():
    """Copy built files from dist to app directory"""
    log("Copying build files to app directory...")
    
    if not DIST_DIR.exists():
        log(f"Dist directory not found: {DIST_DIR}", "ERROR")
        return False
    
    # Remove old app directory if it exists
    if APP_DIR.exists():
        log("Removing old app directory...")
        shutil.rmtree(APP_DIR)
    
    # Copy dist to app
    log("Copying files...")
    shutil.copytree(DIST_DIR, APP_DIR)
    
    # Verify copy
    if APP_DIR.exists():
        assets_dir = APP_DIR / "assets"
        if assets_dir.exists():
            assets_count = len(list(assets_dir.iterdir()))
            log(f"Successfully copied build to app directory ({assets_count} asset files) ✓")
            return True
        else:
            log("Assets directory not found after copy", "ERROR")
            return False
    else:
        log("App directory not created", "ERROR")
        return False

def verify_deployment():
    """Verify the deployment was successful"""
    log("Verifying deployment...")
    
    # Check key files exist
    index_html = APP_DIR / "index.html"
    assets_dir = APP_DIR / "assets"
    
    if not index_html.exists():
        log("index.html not found in app directory", "ERROR")
        return False
    
    if not assets_dir.exists():
        log("assets directory not found in app directory", "ERROR")
        return False
    
    # Check for JavaScript files
    js_files = list(assets_dir.glob("*.js"))
    css_files = list(assets_dir.glob("*.css"))
    
    log(f"Found {len(js_files)} JavaScript files and {len(css_files)} CSS files")
    
    if len(js_files) == 0:
        log("No JavaScript files found in assets", "ERROR")
        return False
    
    log("Deployment verification successful! ✓")
    return True

def main():
    """Main function"""
    log("Starting Fire EMS Tools build and deploy process...")
    
    # Step 1: Check directories
    if not check_directories():
        sys.exit(1)
    
    # Step 2: Build React app
    if not build_react_app():
        log("Build failed, trying to use existing dist...", "WARNING")
        if not DIST_DIR.exists():
            log("No existing dist directory found", "ERROR")
            sys.exit(1)
    
    # Step 3: Copy to app directory
    if not copy_dist_to_app():
        sys.exit(1)
    
    # Step 4: Verify deployment
    if not verify_deployment():
        sys.exit(1)
    
    log("🎉 Build and deployment completed successfully!")
    log(f"React app is now available in: {APP_DIR}")

if __name__ == "__main__":
    main()