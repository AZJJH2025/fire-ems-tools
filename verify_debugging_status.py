#!/usr/bin/env python3
"""
Verify the current status of debugging code in source, dist, and app directories
"""
import os
import glob

def check_directory_for_debug_code(directory, description):
    """Check a directory for debugging code patterns"""
    print(f"\n🔍 Checking {description}: {directory}")
    
    if not os.path.exists(directory):
        print(f"❌ Directory does not exist")
        return False
    
    # Patterns to search for
    patterns = [
        'NORMALIZE FUNCTION CALLED',
        '🔍.*NORMALIZE',
        'console.log.*🔍'
    ]
    
    found_any = False
    
    # Search TypeScript files
    ts_files = glob.glob(os.path.join(directory, "**/*.tsx"), recursive=True)
    ts_files.extend(glob.glob(os.path.join(directory, "**/*.ts"), recursive=True))
    
    for ts_file in ts_files:
        try:
            with open(ts_file, 'r', encoding='utf-8') as f:
                content = f.read()
                for pattern in patterns:
                    if pattern in content:
                        print(f"✅ Found '{pattern}' in {os.path.relpath(ts_file, directory)}")
                        found_any = True
        except Exception as e:
            print(f"⚠️ Could not read {ts_file}: {e}")
    
    # Search JavaScript files
    js_files = glob.glob(os.path.join(directory, "**/*.js"), recursive=True)
    
    for js_file in js_files:
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                for pattern in patterns:
                    if pattern in content:
                        print(f"✅ Found '{pattern}' in {os.path.relpath(js_file, directory)}")
                        found_any = True
        except Exception as e:
            print(f"⚠️ Could not read {js_file}: {e}")
    
    if not found_any:
        print(f"❌ No debugging code found in {description}")
    
    return found_any

def main():
    print("🔧 Debugging Code Status Verification")
    print("="*50)
    
    base_dir = "/Users/josephhester/fire-ems-tools"
    
    # Check source directory
    source_found = check_directory_for_debug_code(
        os.path.join(base_dir, "react-app/src"),
        "React Source Code"
    )
    
    # Check dist directory  
    dist_found = check_directory_for_debug_code(
        os.path.join(base_dir, "react-app/dist"),
        "React Dist Build"
    )
    
    # Check app directory
    app_found = check_directory_for_debug_code(
        os.path.join(base_dir, "app"),
        "Deployed App"
    )
    
    print("\n" + "="*50)
    print("📊 SUMMARY")
    print("="*50)
    print(f"Source Code (react-app/src): {'✅ HAS debugging code' if source_found else '❌ NO debugging code'}")
    print(f"Dist Build (react-app/dist): {'✅ HAS debugging code' if dist_found else '❌ NO debugging code'}")
    print(f"Deployed App (app/):        {'✅ HAS debugging code' if app_found else '❌ NO debugging code'}")
    
    if source_found and not dist_found:
        print("\n🔥 ACTION NEEDED: Source has debugging code but dist build doesn't!")
        print("   → Need to rebuild React app with: npm run build-no-check")
    
    if dist_found and not app_found:
        print("\n🔥 ACTION NEEDED: Dist has debugging code but app deployment doesn't!")
        print("   → Need to copy dist to app and fix paths")
    
    if not source_found:
        print("\n⚠️ WARNING: Source code doesn't contain debugging code!")
        print("   → Check if debugging code was removed or modified")
    
    if source_found and dist_found and app_found:
        print("\n🎉 SUCCESS: Debugging code is present in all locations!")

if __name__ == "__main__":
    main()