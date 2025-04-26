"""
Deployment Fix App - Creates a proper application structure
This script modifies app.py to ensure routes are correctly defined
"""

import os
import re
import sys
import shutil
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def fix_app_structure():
    """Fix the app.py structure to ensure Flask app is initialized correctly"""
    app_path = os.path.join(os.getcwd(), 'app.py')
    backup_path = os.path.join(os.getcwd(), 'app.py.bak')
    
    # Create backup
    logger.info(f"Creating backup of app.py at {backup_path}")
    shutil.copy2(app_path, backup_path)
    
    # Read app.py
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if there's a 'create_app' function definition
    if 'def create_app(' in content:
        logger.info("Found create_app function, proceeding with fix")
        
        # Extract imports section
        imports_match = re.search(r'^(.*?)# Setup logging', content, re.DOTALL)
        if not imports_match:
            logger.error("Could not locate imports section")
            return False
        
        imports_section = imports_match.group(1)
        
        # Extract create_app function
        create_app_match = re.search(r'def create_app\(.*?\):(.*?)^[^\s]', content, re.DOTALL | re.MULTILINE)
        if not create_app_match:
            logger.error("Could not locate create_app function body")
            return False
        
        create_app_body = create_app_match.group(1)
        
        # Extract routes
        routes = re.findall(r'@app\.route\([\'"].*?[\'"].*?\)\s+def (.*?)(?:\(|:)', content, re.DOTALL)
        logger.info(f"Found {len(routes)} routes to fix")
        
        # Create a new structure for app.py
        new_content = imports_section + "\n"
        new_content += "# Setup logging\n"
        new_content += "logging.basicConfig(\n"
        new_content += "    level=logging.INFO,\n"
        new_content += "    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'\n"
        new_content += ")\n"
        new_content += "logger = logging.getLogger(__name__)\n\n"
        
        # Add fix_deployment call
        new_content += "# Apply deployment fixes before importing models\n"
        new_content += "import fix_deployment\n"
        new_content += "fix_deployment.apply_fixes()\n\n"
        
        # Add imports from database
        if "from database import db" in content:
            new_content += "# Now import models after fixes have been applied\n"
            new_content += "from database import db, Department, Incident, User, Station\n"
            new_content += "from config import config\n\n"
        
        # Add login manager and limiter
        if "login_manager =" in content:
            login_match = re.search(r'login_manager = (.*?)(?=\n\n)', content, re.DOTALL)
            if login_match:
                new_content += "login_manager = " + login_match.group(1) + "\n\n"
        
        if "limiter =" in content:
            limiter_match = re.search(r'try:\s+limiter = Limiter(.*?)except.*?limiter = DummyLimiter\(\)', content, re.DOTALL)
            if limiter_match:
                new_content += "# Create a safer version of limiter that won't fail in production\n"
                new_content += "try:\n"
                new_content += "    limiter = Limiter" + limiter_match.group(1) + "\n"
                new_content += "except Exception as e:\n"
                new_content += "    logger.error(f\"Error initializing limiter: {str(e)}\")\n"
                new_content += "    # Create a dummy limiter that does nothing\n"
                new_content += "    class DummyLimiter:\n"
                new_content += "        def __init__(self, *args, **kwargs):\n"
                new_content += "            pass\n"
                new_content += "            \n"
                new_content += "        def init_app(self, app):\n"
                new_content += "            logger.info(\"Using dummy rate limiter\")\n"
                new_content += "            \n"
                new_content += "        def limit(self, *args, **kwargs):\n"
                new_content += "            def decorator(f):\n"
                new_content += "                return f\n"
                new_content += "            return decorator\n"
                new_content += "            \n"
                new_content += "        def exempt(self, *args, **kwargs):\n"
                new_content += "            def decorator(f):\n"
                new_content += "                return f\n"
                new_content += "            return decorator\n"
                new_content += "    \n"
                new_content += "    limiter = DummyLimiter()\n\n"
        
        # Add helper functions
        helper_funcs = ["get_api_key_identity", "safe_limit", "require_api_key"]
        for func in helper_funcs:
            func_match = re.search(r'def ' + func + r'\(.*?\):(.*?)(?=\n\s*def|\n\s*@|\n\s*$|\n\s*#)', content, re.DOTALL)
            if func_match:
                new_content += f"def {func}" + func_match.group(0).split(func, 1)[1] + "\n\n"
        
        # Add create_app function
        new_content += "def create_app(config_name='default'):\n"
        new_content += "    \"\"\"Application factory function\"\"\"\n"
        new_content += create_app_body.strip() + "\n\n"
        
        # Add route registration
        new_content += "    # Register routes\n"
        
        # Get all routes as raw text blocks
        route_blocks = re.findall(r'@app\.route\([\'"].*?[\'"].*?\)\s+def .*?(?=\n\s*@|\n\s*$|\n\s*def)', content, re.DOTALL)
        for i, block in enumerate(route_blocks):
            # Replace @app.route with @app.route
            route_decorator = re.search(r'@app\.route\([\'"].*?[\'"].*?\)', block)
            if route_decorator:
                route_name = re.search(r'def (.*?)(?:\(|:)', block)
                if route_name:
                    func_name = route_name.group(1)
                    logger.info(f"Adding route: {func_name}")
                    
                    # Add the full function from the original file
                    func_match = re.search(r'def ' + func_name + r'\(.*?\):(.*?)(?=\n\s*def|\n\s*@|\n\s*$)', content, re.DOTALL)
                    if func_match:
                        # Extract the full function code
                        func_def = f"def {func_name}" + func_match.group(0).split(func_name, 1)[1]
                        # Fix indentation
                        func_lines = func_def.split('\n')
                        indented_func = []
                        for line in func_lines:
                            if line.strip():
                                indented_func.append("    " + line)
                            else:
                                indented_func.append("")
                        # Add route decorator with correct indentation
                        route_dec = route_decorator.group(0)
                        route_dec = "    " + route_dec
                        
                        # Add to content
                        new_content += route_dec + "\n"
                        new_content += "\n".join(indented_func) + "\n\n"
        
        # Add app creation at the end
        new_content += "# Create app instance for running directly\n"
        new_content += "try:\n"
        new_content += "    # Ensure fixes are applied\n"
        new_content += "    logger.info(\"Creating application with deployment fixes...\")\n"
        new_content += "    app = create_app(os.getenv('FLASK_ENV', 'development'))\n"
        new_content += "    \n"
        new_content += "    # Fix database tables after app creation\n"
        new_content += "    fix_deployment.fix_database_tables(app, db)\n"
        new_content += "    \n"
        new_content += "    # Add diagnostic route for deployment verification\n"
        new_content += "    @app.route('/deployment-status')\n"
        new_content += "    def deployment_status():\n"
        new_content += "        \"\"\"Check deployment status - a quick way to verify fixes are working\"\"\"\n"
        new_content += "        status = {\n"
        new_content += "            \"status\": \"ok\",\n"
        new_content += "            \"fixes_applied\": True,\n"
        new_content += "            \"timestamp\": datetime.utcnow().isoformat(),\n"
        new_content += "            \"environment\": os.getenv('FLASK_ENV', 'development'),\n"
        new_content += "            \"features\": {\n"
        new_content += "                \"user_api\": hasattr(User, 'to_dict'),\n"
        new_content += "                \"webhooks\": hasattr(Department, 'webhook_events') and hasattr(Department, 'webhooks_enabled')\n"
        new_content += "            }\n"
        new_content += "        }\n"
        new_content += "        return jsonify(status)\n"
        new_content += "        \n"
        new_content += "    logger.info(\"Application created successfully with all fixes applied\")\n"
        new_content += "except Exception as e:\n"
        new_content += "    logger.critical(f\"Failed to create application with fixes: {str(e)}\")\n"
        new_content += "    logger.critical(traceback.format_exc())\n"
        new_content += "    # Create a basic app without fixes for emergency access\n"
        new_content += "    app = Flask(__name__)\n"
        new_content += "    \n"
        new_content += "    @app.route('/')\n"
        new_content += "    def emergency_home():\n"
        new_content += "        return \"Emergency mode - application failed to start properly. Check logs.\"\n"
        new_content += "        \n"
        new_content += "    @app.route('/error')\n"
        new_content += "    def error_details():\n"
        new_content += "        return f\"Error: {str(e)}\"\n"
        new_content += "\n"
        
        # Add main section
        if "__name__ ==" in content:
            main_match = re.search(r'if __name__ == "__main__":(.*?)$', content, re.DOTALL)
            if main_match:
                new_content += "if __name__ == \"__main__\":" + main_match.group(1)
        
        # Write new content
        with open(os.path.join(os.getcwd(), 'app_fixed.py'), 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        logger.info("Created fixed app.py structure at app_fixed.py")
        logger.info("Please review the file and then rename it to app.py if it looks correct")
        
        return True
    else:
        logger.error("Could not find create_app function in app.py")
        return False

if __name__ == "__main__":
    fix_app_structure()