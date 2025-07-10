#!/usr/bin/env python3

import os
import shutil
import glob

print("🚀 Copying React build from dist to app directory...")

# Configuration
react_dist_dir = "/Users/josephhester/fire-ems-tools/react-app/dist"
app_dir = "/Users/josephhester/fire-ems-tools/app"

# Check source exists
if not os.path.exists(react_dist_dir):
    print(f"❌ Source directory not found: {react_dist_dir}")
    exit(1)

print(f"✅ Source directory exists: {react_dist_dir}")

# Remove old app directory if it exists
if os.path.exists(app_dir):
    print("🧹 Removing old app directory...")
    shutil.rmtree(app_dir)

# Copy all files from dist to app
print("📦 Copying files...")
shutil.copytree(react_dist_dir, app_dir)

# Verify the copy
if os.path.exists(app_dir):
    files_count = len(os.listdir(app_dir))
    print(f"✅ Successfully copied {files_count} items to app directory")
    
    # List the main files
    print("\nMain files in app directory:")
    for item in sorted(os.listdir(app_dir)):
        item_path = os.path.join(app_dir, item)
        if os.path.isfile(item_path):
            print(f"  📄 {item}")
        else:
            print(f"  📁 {item}/")
    
    # Check assets directory
    assets_dir = os.path.join(app_dir, "assets")
    if os.path.exists(assets_dir):
        assets_count = len(os.listdir(assets_dir))
        print(f"\n✅ Assets directory contains {assets_count} files")
    
    print("\n🎉 Copy operation completed successfully!")
else:
    print("❌ Copy operation failed!")
    exit(1)