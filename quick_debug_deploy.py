#!/usr/bin/env python3
"""
Quick deployment of debugging code - bypass build process
"""
import os
import shutil

def main():
    print("🚀 Quick debug deployment...")
    
    # Copy the enhanced source file directly to see if that works
    source_file = "/Users/josephhester/fire-ems-tools/react-app/src/components/analyzer/ResponseTimeAnalyzerContainer.tsx"
    
    # First, let's try a simple rebuild and copy
    try:
        print("1. Attempting simple build...")
        
        # Try to run npm build
        import subprocess
        result = subprocess.run(
            ["npm", "run", "build-no-check"],
            cwd="/Users/josephhester/fire-ems-tools/react-app",
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0:
            print("   ✅ Build successful!")
            
            # Copy to app directory
            dist_dir = "/Users/josephhester/fire-ems-tools/react-app/dist"
            app_dir = "/Users/josephhester/fire-ems-tools/app"
            
            if os.path.exists(app_dir):
                shutil.rmtree(app_dir)
            
            shutil.copytree(dist_dir, app_dir)
            
            # Fix paths
            html_file = os.path.join(app_dir, "index.html")
            with open(html_file, 'r') as f:
                content = f.read()
            content = content.replace('src="/assets/', 'src="/app/assets/')
            with open(html_file, 'w') as f:
                f.write(content)
            
            print("   ✅ Deployed to app directory!")
            
            # Check if our debug code made it in
            result = subprocess.run(
                ["grep", "-r", "NORMALIZE_FUNCTION_CALLED", app_dir],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("   ✅ Debug code found in build!")
                return True
            else:
                print("   ❌ Debug code NOT found in build")
                
        else:
            print(f"   ❌ Build failed: {result.stderr}")
    
    except Exception as e:
        print(f"   ❌ Build error: {e}")
    
    print("\n🔧 If build failed, try manual commands:")
    print("cd /Users/josephhester/fire-ems-tools/react-app")
    print("npm run build-no-check")
    print("cd /Users/josephhester/fire-ems-tools")
    print("rm -rf app && cp -r react-app/dist app")
    print("sed -i 's|src=\"/assets/|src=\"/app/assets/|g' app/index.html")
    
    return False

if __name__ == "__main__":
    main()