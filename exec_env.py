#!/usr/bin/env python3
import os
import subprocess

# Find npm and node
try:
    npm_path = subprocess.check_output(["/usr/bin/which", "npm"], text=True).strip()
    print(f"NPM found at: {npm_path}")
except:
    print("NPM not found in PATH")

try:
    node_path = subprocess.check_output(["/usr/bin/which", "node"], text=True).strip()
    print(f"Node found at: {node_path}")
except:
    print("Node not found in PATH")

# Print current environment
print("PATH:", os.environ.get('PATH', 'Not set'))
print("Current dir:", os.getcwd())

# Try to execute npm directly
try:
    os.chdir("/Users/josephhester/fire-ems-tools/react-app")
    result = subprocess.run([npm_path, "run", "build-no-check"], capture_output=True, text=True, timeout=300)
    print(f"Build exit code: {result.returncode}")
    print(f"Build output: {result.stdout}")
    if result.stderr:
        print(f"Build errors: {result.stderr}")
except Exception as e:
    print(f"Build failed: {e}")