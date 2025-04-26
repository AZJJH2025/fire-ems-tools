#!/usr/bin/env python3
"""
Script to replace all limiter.limit decorators with safe_limit
"""

import re

file_path = 'app.py'

# Read the file
with open(file_path, 'r') as f:
    content = f.read()

# Replace all instances of @limiter.limit with @safe_limit
new_content = re.sub(r'@limiter\.limit\(', '@safe_limit(', content)

# Write the file back
with open(file_path, 'w') as f:
    f.write(new_content)

print("Replaced all instances of @limiter.limit with @safe_limit")