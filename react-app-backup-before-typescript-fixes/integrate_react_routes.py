#!/usr/bin/env python3
# integrate_react_routes.py - Integrate the React routes into the Flask application

import os
import shutil
import sys

def create_flask_routes_directory():
    """Create the flask_routes directory in the parent folder if it doesn't exist."""
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    flask_routes_dir = os.path.join(parent_dir, 'flask_routes')
    
    if not os.path.exists(flask_routes_dir):
        print(f"Creating flask_routes directory at: {flask_routes_dir}")
        os.makedirs(flask_routes_dir)
    
    return flask_routes_dir

def copy_routes_files():
    """Copy the route files to the Flask application."""
    # Source directory
    source_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flask_routes')
    
    # Destination in the parent's flask_routes directory
    flask_routes_dir = create_flask_routes_directory()
    
    # Copy react_routes.py
    react_routes_source = os.path.join(source_dir, 'react_routes.py')
    react_routes_dest = os.path.join(flask_routes_dir, 'react_routes.py')
    
    print(f"Copying react routes file from: {react_routes_source}")
    print(f"To: {react_routes_dest}")
    
    # Copy the file
    shutil.copy2(react_routes_source, react_routes_dest)
    print("React routes file copied successfully!")
    
    # Copy tool_routes.py
    tool_routes_source = os.path.join(source_dir, 'tool_routes.py')
    tool_routes_dest = os.path.join(flask_routes_dir, 'tool_routes.py')
    
    print(f"Copying tool routes file from: {tool_routes_source}")
    print(f"To: {tool_routes_dest}")
    
    # Copy the file
    shutil.copy2(tool_routes_source, tool_routes_dest)
    print("Tool routes file copied successfully!")

def add_import_to_app_py():
    """Add import and route registration to app.py if needed."""
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    app_py_path = os.path.join(parent_dir, 'app.py')
    
    if not os.path.exists(app_py_path):
        print(f"Warning: app.py not found at {app_py_path}")
        print("You will need to manually import and register the routes in your Flask application.")
        return
    
    # Read the current content of app.py
    with open(app_py_path, 'r') as file:
        content = file.read()
    
    # Check and add the react routes import
    if 'from flask_routes.react_routes import register_react_routes' not in content:
        # Add the import near the top of the file, after other imports
        import_line = 'from flask_routes.react_routes import register_react_routes'
        content = content.replace('from flask import Flask', 'from flask import Flask\n' + import_line)
        
        # Add the route registration after app initialization
        register_line = 'register_react_routes(app)'
        if 'app = Flask' in content:
            content = content.replace('app = Flask', 'app = Flask', 1)  # Find first occurrence
            app_init_end = content.find('\n', content.find('app = Flask'))
            content = content[:app_init_end+1] + '\n# Register React application routes\n' + register_line + '\n' + content[app_init_end+1:]
        
        print("Added React routes import and registration to app.py")
    else:
        print("React routes import already present in app.py")
    
    # Check and add the tool routes import
    if 'from flask_routes.tool_routes import register_tool_routes' not in content:
        # Add the import near the top of the file, after other imports
        import_line = 'from flask_routes.tool_routes import register_tool_routes'
        
        if 'from flask_routes.react_routes import register_react_routes' in content:
            content = content.replace(
                'from flask_routes.react_routes import register_react_routes', 
                'from flask_routes.react_routes import register_react_routes\n' + import_line
            )
        else:
            content = content.replace('from flask import Flask', 'from flask import Flask\n' + import_line)
        
        # Add the route registration after app initialization or after react routes registration
        register_line = 'register_tool_routes(app)'
        
        if 'register_react_routes(app)' in content:
            content = content.replace(
                'register_react_routes(app)', 
                'register_react_routes(app)\n# Register tool integration routes\n' + register_line
            )
        elif 'app = Flask' in content:
            content = content.replace('app = Flask', 'app = Flask', 1)  # Find first occurrence
            app_init_end = content.find('\n', content.find('app = Flask'))
            content = content[:app_init_end+1] + '\n# Register tool integration routes\n' + register_line + '\n' + content[app_init_end+1:]
        
        print("Added tool routes import and registration to app.py")
    else:
        print("Tool routes import already present in app.py")
    
    # Write back the modified content
    with open(app_py_path, 'w') as file:
        file.write(content)

def main():
    """Main function to integrate React routes."""
    print("Integrating React routes and tool integrations into Flask application...")
    
    try:
        copy_routes_files()
        add_import_to_app_py()
        
        print("\nIntegration completed successfully!")
        print("Make sure your Flask server is running and visit:")
        print("  http://localhost:5005/data-formatter-react")
        print("  http://localhost:5005/response-time-analyzer")
        print("\nThe tools can now communicate with each other through the Flask session.")
    except Exception as e:
        print(f"Error during integration: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())