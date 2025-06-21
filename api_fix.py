#!/usr/bin/env python3
"""
API endpoint fix for minimal_react_app_fixed.py

Apply this patch to fix the 404 error for /api/get-tool-data
"""
import argparse
import os
import re
import sys


def fix_api_endpoint(file_path):
    """
    Fix the API endpoint in the Flask server file
    """
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return False

    with open(file_path, "r") as f:
        content = f.read()

    # Check if the API endpoint is already defined
    if "@app.route('/api/get-tool-data'" in content:
        print("API endpoint is already defined in the file.")
        return True

    # Find the place to insert the new endpoint
    endpoint_pattern = r"@app\.route\('/api/send-to-tool'.*?\)\s+def send_to_tool\(\):"
    match = re.search(endpoint_pattern, content, re.DOTALL)
    
    if not match:
        print("Could not find the send-to-tool endpoint in the file.")
        return False
    
    # Find the end of the send-to-tool function
    function_start = match.start()
    depth = 0
    function_end = function_start
    
    # Find the first non-empty line after the function definition
    lines = content[function_start:].split('\n')
    function_start_line = 0
    
    for i, line in enumerate(lines):
        if "def send_to_tool():" in line:
            function_start_line = i
            break
    
    # Find where the function ends
    for i, line in enumerate(lines[function_start_line+1:], start=function_start_line+1):
        stripped = line.strip()
        
        # Skip empty lines
        if not stripped:
            continue
        
        # Check indentation to determine function boundary
        if stripped and not line.startswith('    '):
            function_end = function_start + sum(len(l) + 1 for l in lines[:i])
            break
    
    # If we didn't find the end, assume it's the end of the file
    if function_end == function_start:
        function_end = len(content)
    
    # Create the new endpoint code
    new_endpoint = """
# API endpoint for retrieving tool data
@app.route('/api/get-tool-data', methods=['GET'])
def get_tool_data():
    \"\"\"Retrieve data stored for tool transfer\"\"\"
    try:
        print("Request received for /api/get-tool-data")
        print(f"Session keys: {list(session.keys())}")
        
        # Check if tool_data exists in session
        tool_data = session.get('tool_data')
        
        if not tool_data:
            print("No tool_data found in session")
            return jsonify({"success": False, "error": "No data found"}), 404
        
        # Log info about the data being returned
        print(f"Tool data found. Type: {type(tool_data)}")
        if isinstance(tool_data, dict):
            print(f"Tool data keys: {list(tool_data.keys())}")
            data_size = len(tool_data.get('data', []))
            print(f"Returning {data_size} records")
        
        # After sending the data, consider keeping it in session for potential reuse
        # session.pop('tool_data', None)  # Uncomment to clear after sending
        
        return jsonify({
            "success": True,
            "data": tool_data,
            "timestamp": os.path.getmtime(__file__)  # Add timestamp to prevent caching
        })
    except Exception as e:
        # Detailed error logging
        import traceback
        print(f"Error in get_tool_data: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500
"""

    # Insert the new endpoint before the home page route
    new_content = content[:function_end] + new_endpoint + content[function_end:]
    
    # Write the updated content back to the file
    with open(file_path, "w") as f:
        f.write(new_content)
    
    print(f"Successfully added the get-tool-data API endpoint to {file_path}")
    print("You'll need to restart the Flask server for changes to take effect.")
    return True


def main():
    parser = argparse.ArgumentParser(description="Fix API endpoint in Flask server")
    parser.add_argument("--file", default="/Users/josephhester/fire-ems-tools/minimal_react_app_fixed.py",
                        help="Path to the Flask server file")
    args = parser.parse_args()
    
    success = fix_api_endpoint(args.file)
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())