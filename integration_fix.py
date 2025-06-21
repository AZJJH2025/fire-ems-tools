#!/usr/bin/env python3
"""
Default Value Validation Fix Integration

This script integrates the validation fix for default values into the data formatter HTML template.
It adds the fix-validation.js script to the template to ensure proper handling of default values.
"""

import os
import re

def integrate_validation_fix():
    """Integrate the validation fix script into the data formatter template."""
    # Paths to the template and the fix script
    template_path = os.path.join('templates', 'data-formatter.html')
    
    # Check if the template exists
    if not os.path.exists(template_path):
        print(f"Error: Template file {template_path} not found.")
        return False
    
    # Read the template content
    with open(template_path, 'r') as f:
        template_content = f.read()
    
    # Check if the fix is already integrated
    if 'fix-validation.js' in template_content:
        print("Validation fix is already integrated.")
        return True
    
    # Find the end of the script section to insert our fix
    script_pattern = r'(<script\s+type="module"\s+src="/static/js/data-formatter.js"\s+defer>\s*</script>)'
    match = re.search(script_pattern, template_content)

    if not match:
        # Try alternative pattern
        script_pattern = r'(<script\s+[^>]*data-formatter\.js[^>]*>\s*</script>)'
        match = re.search(script_pattern, template_content)

    if not match:
        print("Error: Could not find the main data formatter script tag.")
        return False

    # Prepare the fix script tag
    fix_script_tag = '\n  <!-- Default Value Validation Fix -->\n  <script src="/static/fix-validation.js"></script>'
    
    # Insert the fix script tag after the main script
    new_content = template_content[:match.end()] + fix_script_tag + template_content[match.end():]
    
    # Write the updated template
    with open(template_path, 'w') as f:
        f.write(new_content)
    
    print("Successfully integrated the validation fix script.")
    return True

if __name__ == "__main__":
    print("Integrating default value validation fix...")
    if integrate_validation_fix():
        print("✅ Integration complete.")
    else:
        print("❌ Integration failed.")