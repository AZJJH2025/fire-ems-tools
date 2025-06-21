#!/usr/bin/env python3

# Inline execution to avoid shell issues
import subprocess
import os
import shutil
import glob

print("🚀 Starting inline rebuild process...")

# Configuration
react_dir = "/Users/josephhester/fire-ems-tools/react-app"
app_dir = "/Users/josephhester/fire-ems-tools/app"

# Step 1: Check current state
print(f"React directory: {react_dir}")
print(f"App directory: {app_dir}")
print(f"React dir exists: {os.path.exists(react_dir)}")
print(f"App dir exists: {os.path.exists(app_dir)}")

# Step 2: Clean previous build
print("\n🧹 Cleaning previous build...")
dist_path = os.path.join(react_dir, "dist")
vite_cache = os.path.join(react_dir, "node_modules", ".vite")

if os.path.exists(dist_path):
    shutil.rmtree(dist_path)
    print("✅ Removed dist directory")

if os.path.exists(vite_cache):
    shutil.rmtree(vite_cache)
    print("✅ Removed vite cache")

# Step 3: Try to build using subprocess
print("\n🔨 Building React app...")
try:
    # Change to react directory and build
    result = subprocess.run(
        ["npm", "run", "build-no-check"],
        cwd=react_dir,
        capture_output=True,
        text=True,
        timeout=600  # 10 minute timeout
    )
    
    print(f"Build exit code: {result.returncode}")
    
    if result.stdout:
        print("Build output:")
        print(result.stdout[:1000])  # First 1000 chars
    
    if result.stderr:
        print("Build errors:")
        print(result.stderr[:1000])  # First 1000 chars
    
    if result.returncode == 0:
        print("✅ Build completed successfully!")
        
        # Step 4: Check the new build
        if os.path.exists(dist_path):
            print(f"✅ New dist directory created")
            
            # Check for debugging code
            js_files = glob.glob(os.path.join(dist_path, "assets", "*.js"))
            print(f"Found {len(js_files)} JavaScript files")
            
            debug_found = False
            for js_file in js_files:
                try:
                    with open(js_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if 'NORMALIZE FUNCTION CALLED' in content:
                            print(f"✅ DEBUGGING CODE FOUND in {os.path.basename(js_file)}")
                            debug_found = True
                        elif '🔍' in content and 'console.log' in content:
                            print(f"✅ DEBUG EMOJI FOUND in {os.path.basename(js_file)}")
                            debug_found = True
                except Exception as e:
                    print(f"Error reading {js_file}: {e}")
            
            if debug_found:
                print("\n🎉 SUCCESS: Debugging code is in the new build!")
                
                # Step 5: Deploy to app directory
                print("\n📦 Deploying to app directory...")
                
                if os.path.exists(app_dir):
                    shutil.rmtree(app_dir)
                    print("✅ Removed old app directory")
                
                shutil.copytree(dist_path, app_dir)
                print("✅ Copied new build to app directory")
                
                # Fix HTML paths
                html_files = glob.glob(os.path.join(app_dir, "*.html"))
                for html_file in html_files:
                    with open(html_file, 'r') as f:
                        content = f.read()
                    
                    content = content.replace('"/assets/', '"/app/assets/')
                    
                    with open(html_file, 'w') as f:
                        f.write(content)
                    
                    print(f"✅ Fixed paths in {os.path.basename(html_file)}")
                
                print("\n🚀 DEPLOYMENT COMPLETE!")
                print("Enhanced debugging is now deployed and should work.")
                
            else:
                print("\n❌ DEBUGGING CODE NOT FOUND in build")
                print("The build succeeded but debugging code is missing")
                
        else:
            print("❌ Dist directory was not created")
    else:
        print("❌ Build failed!")
        
except subprocess.TimeoutExpired:
    print("❌ Build timed out")
except Exception as e:
    print(f"❌ Build exception: {e}")
    import traceback
    traceback.print_exc()

print("\n--- Process complete ---")