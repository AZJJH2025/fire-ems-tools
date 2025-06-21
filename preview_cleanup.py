#!/usr/bin/env python3
"""
Preview Legacy Cleanup - Shows what WOULD be removed without actually removing
"""

import os
import glob
from pathlib import Path

# Files and directories to KEEP (everything else gets removed)
KEEP_ITEMS = {
    'react-app/',
    'app.py',
    'requirements.txt', 
    'render.yaml',
    'wsgi.py',
    'database.py',
    'config.py',
    'instance/',
    'routes/',
    'utils/',
    'migrations/',
    'app/',
    'data/',
    'sample_data/',
    'README.md',
    'CLAUDE.md',
    '.git/',
    '.gitignore',
    'venv/',
    '__pycache__/',
}

REMOVE_PATTERNS = [
    '*.html', '*-test.html', '*test.html',
    '*server.py', '*server.js', 'simple*.py', 'minimal*.py',
    'emergency*.py', 'alt_port*.py', 'direct*.py', 'clean*.py',
    'standalone*.py', 'build*.sh', 'deploy*.py', 'deploy*.sh',
    'run_*.py', 'run_*.sh', 'start*.sh', 'restart*.sh',
    'stop*.py', 'stop*.sh', 'execute*.py', 'rebuild*.py',
    'manual*.py', 'copy*.py', 'trigger*.js', 'test_*.py',
    'test*.html', 'test-*.csv', 'test-*.js', '*.log', '*.bak',
    'debug.js', 'nano', 'static/', 'templates/', 'app-static/',
    '*TESTING*.md', '*FIXES*.md', '*PLAN*.md', '*SUMMARY*.md',
    '*TROUBLESHOOTING*.md', '*DEBUG*.md', '*DEPLOYMENT*.md',
    '*INTEGRATION*.md', '*REBUILD*.md', '*SESSION*.md',
    'WHAT_WE_ACCOMPLISHED.md', 'NEXT_STEPS.md', 'final_*.md',
    'fix-*.md'
]

def should_keep_item(item_path, base_path):
    relative_path = os.path.relpath(item_path, base_path)
    for keep_item in KEEP_ITEMS:
        if relative_path.startswith(keep_item) or relative_path == keep_item.rstrip('/'):
            return True
    return False

def should_remove_item(item_path, base_path):
    relative_path = os.path.relpath(item_path, base_path)
    filename = os.path.basename(item_path)
    
    for pattern in REMOVE_PATTERNS:
        if pattern.endswith('/'):
            if relative_path.startswith(pattern) or relative_path == pattern.rstrip('/'):
                return True
        else:
            from fnmatch import fnmatch
            if fnmatch(filename, pattern) or fnmatch(relative_path, pattern):
                return True
    return False

def preview_cleanup(base_path):
    base_path = Path(base_path)
    to_remove = []
    to_keep = []
    
    print("🔍 CLEANUP PREVIEW - What would be removed:")
    print("=" * 60)
    
    for root, dirs, files in os.walk(base_path):
        # Check directories
        for d in dirs:
            dir_path = os.path.join(root, d)
            if '/react-app/' in dir_path or dir_path.endswith('/react-app'):
                to_keep.append(dir_path)
            elif should_keep_item(dir_path, base_path):
                to_keep.append(dir_path)
            elif should_remove_item(dir_path, base_path):
                to_remove.append(dir_path)
            else:
                to_keep.append(dir_path)
                
        # Check files  
        for f in files:
            file_path = os.path.join(root, f)
            if '/react-app/' in file_path:
                to_keep.append(file_path)
            elif should_keep_item(file_path, base_path):
                to_keep.append(file_path)
            elif should_remove_item(file_path, base_path):
                to_remove.append(file_path)
            else:
                to_keep.append(file_path)
    
    # Show what would be removed
    print(f"\n🗑️  WOULD REMOVE ({len(to_remove)} items):")
    for item in sorted(to_remove)[:20]:  # Show first 20
        rel_path = os.path.relpath(item, base_path)
        item_type = "📁" if os.path.isdir(item) else "📄"
        print(f"  {item_type} {rel_path}")
    
    if len(to_remove) > 20:
        print(f"  ... and {len(to_remove) - 20} more items")
    
    print(f"\n✅ WOULD KEEP ({len(to_keep)} items):")
    keep_dirs = set()
    for item in to_keep:
        rel_path = os.path.relpath(item, base_path)
        if os.path.isdir(item):
            keep_dirs.add(rel_path)
    
    for dir_path in sorted(keep_dirs)[:15]:  # Show main directories
        print(f"  📁 {dir_path}")
    
    print(f"\n📊 SUMMARY:")
    print(f"  🗑️  Remove: {len(to_remove)} items")
    print(f"  ✅ Keep: {len(to_keep)} items")
    print(f"  📁 Main directories kept: react-app/, app/, routes/, instance/")
    
    return to_remove, to_keep

if __name__ == "__main__":
    base_dir = "/Users/josephhester/fire-ems-tools"
    preview_cleanup(base_dir)