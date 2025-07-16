#!/usr/bin/env python3
"""
Deployment script for Fire EMS Tools production deployment.

This script automates the process of building the React app and preparing
it for production deployment with proper asset management.
"""

import os
import subprocess
import sys
from utils.asset_utils import ensure_assets_copied, get_main_asset_file


def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Exit code: {e.returncode}")
        print(f"Error output: {e.stderr}")
        return False


def main():
    """Main deployment process."""
    print("🚀 Starting Fire EMS Tools deployment process...")
    
    # Change to project root directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Step 1: Build the React application
    print("\n📦 Building React application...")
    if not run_command("cd react-app && npm run build-no-check", "React application build"):
        print("💥 React build failed - aborting deployment")
        sys.exit(1)
    
    # Step 2: Copy assets to deployment directory
    print("\n📁 Copying assets to deployment directory...")
    if ensure_assets_copied():
        print("✅ Assets copied successfully")
    else:
        print("❌ Failed to copy assets - aborting deployment")
        sys.exit(1)
    
    # Step 3: Verify asset detection
    print("\n🔍 Verifying dynamic asset detection...")
    main_asset = get_main_asset_file()
    if main_asset:
        print(f"✅ Main asset file detected: {main_asset}")
    else:
        print("❌ Failed to detect main asset file - aborting deployment")
        sys.exit(1)
    
    # Step 4: Verify asset file exists
    asset_path = os.path.join('app', 'assets', main_asset)
    if os.path.exists(asset_path):
        file_size = os.path.getsize(asset_path)
        print(f"✅ Asset file exists: {main_asset} ({file_size:,} bytes)")
    else:
        print(f"❌ Asset file not found: {asset_path}")
        sys.exit(1)
    
    print("\n🎉 Deployment preparation completed successfully!")
    print("\nNext steps:")
    print("1. Start the Flask server: python app.py")
    print("2. Test the application at http://localhost:5006")
    print("3. Deploy to production server")
    
    print(f"\n📊 Deployment Summary:")
    print(f"   Main asset: {main_asset}")
    print(f"   Asset size: {file_size:,} bytes")
    print(f"   Deployment ready: ✅")


if __name__ == "__main__":
    main()