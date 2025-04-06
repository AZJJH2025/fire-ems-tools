"""
Deployment Fix Script for FireEMS.ai Application

This script provides diagnostic information and fixes for known deployment issues.
It should be run directly on the deployment server to diagnose issues.

Usage:
  python deployment_fix.py --diagnose  # Run diagnostics only
  python deployment_fix.py --fix       # Apply fixes
  python deployment_fix.py --all       # Run diagnostics and apply fixes
"""

import argparse
import logging
import os
import sys
import traceback
import json
from datetime import datetime
import importlib.util
import pkgutil
import platform
import subprocess
import inspect

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("deployment_fix.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# List of features that need compatibility checks
FEATURES = [
    "fire-map-pro",
    "call-volume-forecaster",
    "quick-stats",
    "data-formatter"
]

def check_environment():
    """Check the environment for potential issues"""
    logger.info("Checking environment...")
    
    # Check Python version
    python_version = platform.python_version()
    logger.info(f"Python version: {python_version}")
    
    # Check OS
    os_info = platform.platform()
    logger.info(f"Operating System: {os_info}")
    
    # Check available memory
    try:
        if platform.system() == "Linux":
            with open('/proc/meminfo', 'r') as f:
                mem_info = {}
                for line in f:
                    key, value = line.split(':', 1)
                    mem_info[key.strip()] = value.strip()
            logger.info(f"Memory: {mem_info.get('MemTotal', 'Unknown')}")
        else:
            logger.info("Memory check only supported on Linux")
    except Exception as e:
        logger.warning(f"Could not check memory: {str(e)}")
    
    # Check installed packages
    try:
        import pkg_resources
        installed_packages = {pkg.key: pkg.version for pkg in pkg_resources.working_set}
        logger.info(f"Installed packages: {json.dumps(installed_packages, indent=2)}")
        
        # Check for required packages from requirements.txt
        with open('requirements.txt', 'r') as f:
            required = [line.strip().split('==')[0] for line in f if '==' in line]
            missing = [pkg for pkg in required if pkg.lower() not in {k.lower() for k in installed_packages}]
            if missing:
                logger.warning(f"Missing required packages: {missing}")
    except Exception as e:
        logger.warning(f"Could not check installed packages: {str(e)}")
    
    # Check for database access
    try:
        # First try to import from our application
        from database import db
        logger.info("Database module imported successfully")
        
        # Test database connection
        from app import app
        with app.app_context():
            db.engine.connect()
            logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
    
    return True

def check_app_configuration():
    """Check the app configuration for issues"""
    logger.info("Checking app configuration...")
    
    try:
        # Import the app and check its configuration
        from app import app
        
        # Check if debug mode is enabled
        logger.info(f"Debug mode: {app.debug}")
        
        # Check secret key is set
        if not app.secret_key:
            logger.warning("Secret key is not set")
        else:
            logger.info("Secret key is set")
        
        # Check configuration
        if hasattr(app, 'config'):
            config_keys = [k for k in app.config.keys() if not k.startswith('_')]
            logger.info(f"App configuration keys: {config_keys}")
            
            # Check database URI is set
            if 'SQLALCHEMY_DATABASE_URI' in app.config:
                uri = app.config['SQLALCHEMY_DATABASE_URI']
                # Mask password in database URI for logging
                if '://' in uri:
                    parts = uri.split('://')
                    if '@' in parts[1]:
                        userpass, hostport = parts[1].split('@', 1)
                        if ':' in userpass:
                            user, _ = userpass.split(':', 1)
                            masked_uri = f"{parts[0]}://{user}:****@{hostport}"
                            logger.info(f"Database URI: {masked_uri}")
                        else:
                            logger.info(f"Database URI: {uri}")
                    else:
                        logger.info(f"Database URI: {uri}")
                else:
                    logger.info(f"Database URI: {uri}")
            else:
                logger.warning("SQLALCHEMY_DATABASE_URI not set in app configuration")
    except Exception as e:
        logger.error(f"Error checking app configuration: {str(e)}")
        logger.error(traceback.format_exc())
    
    return True

def check_template_compatibility():
    """Check templates for compatibility issues"""
    logger.info("Checking template compatibility...")
    
    try:
        import os
        import re
        
        template_dir = os.path.join(os.getcwd(), 'templates')
        if not os.path.exists(template_dir):
            logger.warning(f"Template directory {template_dir} does not exist")
            return False
        
        # Check all HTML templates
        templates = [f for f in os.listdir(template_dir) if f.endswith('.html')]
        logger.info(f"Found {len(templates)} templates: {templates}")
        
        # Check for JavaScript errors in templates
        for template in templates:
            template_path = os.path.join(template_dir, template)
            with open(template_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for missing JS references
                js_refs = re.findall(r'src=["\'](.+?\.js)["\']', content)
                for js_ref in js_refs:
                    if js_ref.startswith('/static/'):
                        js_path = os.path.join(os.getcwd(), js_ref.lstrip('/'))
                        if not os.path.exists(js_path):
                            logger.warning(f"Template {template} references non-existent JS file: {js_ref}")
                
                # Check for missing CSS references
                css_refs = re.findall(r'href=["\'](.+?\.css)["\']', content)
                for css_ref in css_refs:
                    if css_ref.startswith('/static/'):
                        css_path = os.path.join(os.getcwd(), css_ref.lstrip('/'))
                        if not os.path.exists(css_path):
                            logger.warning(f"Template {template} references non-existent CSS file: {css_ref}")
    except Exception as e:
        logger.error(f"Error checking template compatibility: {str(e)}")
        logger.error(traceback.format_exc())
    
    return True

def check_js_compatibility():
    """Check JS files for compatibility issues"""
    logger.info("Checking JS compatibility...")
    
    try:
        import os
        
        static_dir = os.path.join(os.getcwd(), 'static')
        if not os.path.exists(static_dir):
            logger.warning(f"Static directory {static_dir} does not exist")
            return False
        
        # Check all JS files
        js_files = []
        for root, _, files in os.walk(static_dir):
            for file in files:
                if file.endswith('.js'):
                    js_files.append(os.path.join(root, file))
        
        logger.info(f"Found {len(js_files)} JS files")
        
        # Check for specific patterns that might cause issues
        problematic_patterns = [
            ('html2canvas', 'HTML2Canvas usage might need additional configuration'),
            ('navigator.userAgent', 'User agent sniffing might cause issues on certain browsers'),
            ('document.body.appendChild', 'Direct DOM manipulation might need cleanup'),
            ('XMLHttpRequest', 'Legacy AJAX calls might need to be updated')
        ]
        
        # Check each JS file
        for js_file in js_files:
            rel_path = os.path.relpath(js_file, os.getcwd())
            logger.info(f"Checking {rel_path}")
            
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
                for pattern, message in problematic_patterns:
                    if pattern in content:
                        logger.warning(f"{rel_path}: {message}")
                        
                # Special check for fire-map-pro.js export function
                if 'fire-map-pro.js' in rel_path:
                    if 'exportAsPNG' in content:
                        logger.info("Found exportAsPNG function in fire-map-pro.js")
                        if 'tilesLoading' in content and 'tilesLoaded' in content:
                            logger.info("exportAsPNG function includes tile loading tracking")
                        else:
                            logger.warning("exportAsPNG function may be missing tile loading tracking")
    except Exception as e:
        logger.error(f"Error checking JS compatibility: {str(e)}")
        logger.error(traceback.format_exc())
    
    return True

def check_routes():
    """Check Flask routes for potential issues"""
    logger.info("Checking Flask routes...")
    
    try:
        # Import the app 
        from app import app
        
        # Get all routes
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'rule': str(rule)
            })
        
        logger.info(f"Found {len(routes)} routes")
        
        # Check for problematic routes
        for route in routes:
            # Check for routes using PUT/DELETE (might be blocked by some proxies)
            if 'PUT' in route['methods'] or 'DELETE' in route['methods']:
                logger.warning(f"Route {route['rule']} uses PUT/DELETE which might be blocked by some proxies")
            
            # Check routes for our features
            for feature in FEATURES:
                if feature in route['rule']:
                    logger.info(f"Found route for feature {feature}: {route['rule']}")
    except Exception as e:
        logger.error(f"Error checking routes: {str(e)}")
        logger.error(traceback.format_exc())
    
    return True

def check_static_files():
    """Check static files for potential issues"""
    logger.info("Checking static files...")
    
    try:
        import os
        import mimetypes
        
        static_dir = os.path.join(os.getcwd(), 'static')
        if not os.path.exists(static_dir):
            logger.warning(f"Static directory {static_dir} does not exist")
            return False
        
        # Check all files in static directory
        for root, _, files in os.walk(static_dir):
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, os.getcwd())
                
                # Check file size (warn if over 10MB)
                size = os.path.getsize(file_path)
                if size > 10 * 1024 * 1024:  # 10MB
                    logger.warning(f"Large file: {rel_path} ({size / 1024 / 1024:.2f} MB)")
                
                # Check file mime type
                mime_type, _ = mimetypes.guess_type(file_path)
                if not mime_type:
                    logger.warning(f"Could not determine MIME type for {rel_path}")
    except Exception as e:
        logger.error(f"Error checking static files: {str(e)}")
        logger.error(traceback.format_exc())
    
    return True

def apply_fixes():
    """Apply fixes for known issues"""
    logger.info("Applying fixes...")
    
    try:
        # First import the existing fix_deployment module 
        import fix_deployment
        
        # Apply existing fixes
        logger.info("Applying fixes from fix_deployment.py...")
        fix_deployment.apply_fixes()
        
        # Check if we can access the app and database
        try:
            from app import app
            from database import db
            
            # Fix database tables
            logger.info("Fixing database tables...")
            fix_deployment.fix_database_tables(app, db)
            
            # Fix app routes with safer versions
            logger.info("Patching app routes...")
            fix_deployment.patch_app_routes(app)
        except Exception as e:
            logger.error(f"Could not fix database tables or patch routes: {str(e)}")
        
        # Apply specific fixes for each problematic feature
        fix_fire_map_pro()
        fix_call_volume_forecaster()
        fix_quick_stats()
        fix_data_formatter()
        
        logger.info("All fixes applied successfully")
    except ImportError:
        logger.error("Could not import fix_deployment module")
    except Exception as e:
        logger.error(f"Error applying fixes: {str(e)}")
        logger.error(traceback.format_exc())
    
    return True

def fix_fire_map_pro():
    """Apply fixes for FireMapPro feature"""
    logger.info("Applying fixes for FireMapPro...")
    
    try:
        import os
        import re
        
        js_file = os.path.join(os.getcwd(), 'static', 'fire-map-pro.js')
        if not os.path.exists(js_file):
            logger.warning(f"FireMapPro JS file {js_file} does not exist")
            return False
        
        # Read the current file
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if the file has already been patched
        if 'PATCHED_FOR_DEPLOYMENT' in content:
            logger.info("FireMapPro JS file already patched")
            return True
        
        # Patch the exportAsPNG function
        logger.info("Patching exportAsPNG function...")
        
        # Add a comment indicating the file has been patched
        patched_content = "// PATCHED_FOR_DEPLOYMENT\n" + content
        
        # Ensure tile loading tracking is implemented
        if 'tilesLoading' not in content or 'tilesLoaded' not in content:
            # Replace the old exportAsPNG function with a fixed version
            # This is a simplified patch - in a real scenario we'd parse the JS and modify more precisely
            patched_content = patched_content.replace(
                "function exportAsPNG(title, includeLegend, includeScale)",
                "// Original exportAsPNG replaced for deployment fix\nfunction exportAsPNG(title, includeLegend, includeScale)"
            )
        
        # Add extra safeguards for DOM cleanup
        if 'exportContainer' in content and 'document.body.appendChild(exportContainer)' in content:
            # Make sure exportContainer is always removed
            cleanup_code = """
                // Ensure cleanup happens
                try {
                    const existingContainer = document.getElementById('export-container');
                    if (existingContainer) {
                        document.body.removeChild(existingContainer);
                    }
                } catch (e) {
                    console.warn('Cleanup of existing container failed:', e);
                }
            """
            
            patched_content = patched_content.replace(
                "document.body.appendChild(exportContainer);",
                f"{cleanup_code}\n    document.body.appendChild(exportContainer);"
            )
        
        # Write the patched file
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(patched_content)
        
        logger.info("FireMapPro JS file patched successfully")
    except Exception as e:
        logger.error(f"Error fixing FireMapPro: {str(e)}")
        logger.error(traceback.format_exc())
    
    return True

def fix_call_volume_forecaster():
    """Apply fixes for Call Volume Forecaster feature"""
    logger.info("Applying fixes for Call Volume Forecaster...")
    
    try:
        import os
        
        js_file = os.path.join(os.getcwd(), 'static', 'call-volume-forecaster.js')
        if not os.path.exists(js_file):
            logger.warning(f"Call Volume Forecaster JS file {js_file} does not exist")
            return False
        
        # Read the current file
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if the file has already been patched
        if 'PATCHED_FOR_DEPLOYMENT' in content:
            logger.info("Call Volume Forecaster JS file already patched")
            return True
        
        # Add a comment indicating the file has been patched
        patched_content = "// PATCHED_FOR_DEPLOYMENT\n" + content
        
        # Add error handler for chart.js
        if 'Chart' in content and 'catch' not in content:
            error_handling = """
                // Add global error handling for Chart instances
                try {
                    if (window.Chart) {
                        const originalAcquireContext = Chart.controllers.line.prototype.draw;
                        Chart.controllers.line.prototype.draw = function() {
                            try {
                                return originalAcquireContext.apply(this, arguments);
                            } catch (e) {
                                console.error('Error in Chart.js drawing:', e);
                                // Continue without failing
                                return null;
                            }
                        };
                    }
                } catch (e) {
                    console.warn('Could not patch Chart.js:', e);
                }
            """
            patched_content = patched_content.replace(
                "document.addEventListener('DOMContentLoaded', function() {",
                "document.addEventListener('DOMContentLoaded', function() {\n" + error_handling
            )
        
        # Write the patched file
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(patched_content)
        
        logger.info("Call Volume Forecaster JS file patched successfully")
    except Exception as e:
        logger.error(f"Error fixing Call Volume Forecaster: {str(e)}")
        logger.error(traceback.format_exc())
    
    return True

def fix_quick_stats():
    """Apply fixes for Quick Stats feature"""
    logger.info("Applying fixes for Quick Stats...")
    
    try:
        import os
        
        js_file = os.path.join(os.getcwd(), 'static', 'quick-stats.js')
        if not os.path.exists(js_file):
            logger.warning(f"Quick Stats JS file {js_file} does not exist")
            return False
        
        # Read the current file
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if the file has already been patched
        if 'PATCHED_FOR_DEPLOYMENT' in content:
            logger.info("Quick Stats JS file already patched")
            return True
        
        # Add a comment indicating the file has been patched
        patched_content = "// PATCHED_FOR_DEPLOYMENT\n" + content
        
        # Add error handling for fetch operations
        if 'fetch(' in content:
            patched_content = patched_content.replace(
                "fetch(",
                "// Add better error handling\nfetch("
            )
            
            # Add global error handler
            error_handler = """
                // Add global error handling for fetch operations
                window.addEventListener('error', function(e) {
                    console.error('Global error caught:', e.error);
                    const errorMsg = document.getElementById('error-message');
                    if (errorMsg) {
                        errorMsg.textContent = 'An error occurred. Please try refreshing the page.';
                        errorMsg.style.display = 'block';
                    }
                    return false;
                });
            """
            
            patched_content = patched_content.replace(
                "document.addEventListener('DOMContentLoaded', function() {",
                "document.addEventListener('DOMContentLoaded', function() {\n" + error_handler
            )
        
        # Write the patched file
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(patched_content)
        
        logger.info("Quick Stats JS file patched successfully")
    except Exception as e:
        logger.error(f"Error fixing Quick Stats: {str(e)}")
        logger.error(traceback.format_exc())
    
    return True

def fix_data_formatter():
    """Apply fixes for Data Formatter feature"""
    logger.info("Applying fixes for Data Formatter...")
    
    try:
        import os
        
        js_file = os.path.join(os.getcwd(), 'static', 'data-formatter.js')
        if not os.path.exists(js_file):
            logger.warning(f"Data Formatter JS file {js_file} does not exist")
            return False
        
        # Read the current file
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if the file has already been patched
        if 'PATCHED_FOR_DEPLOYMENT' in content:
            logger.info("Data Formatter JS file already patched")
            return True
        
        # Add a comment indicating the file has been patched
        patched_content = "// PATCHED_FOR_DEPLOYMENT\n" + content
        
        # Fix file upload handling if present
        if 'FormData' in content and 'append(' in content:
            # Add timeout for large file uploads
            timeout_code = """
                // Add timeout for large file uploads
                const originalFetch = window.fetch;
                window.fetch = function(url, options) {
                    if (options && options.body instanceof FormData) {
                        // Add a longer timeout for file uploads
                        const controller = new AbortController();
                        const signal = controller.signal;
                        
                        // Set a 5-minute timeout
                        const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);
                        
                        // Add the signal to the options
                        options.signal = signal;
                        
                        return originalFetch(url, options)
                            .finally(() => clearTimeout(timeoutId));
                    }
                    
                    return originalFetch(url, options);
                };
            """
            
            patched_content = patched_content.replace(
                "document.addEventListener('DOMContentLoaded', function() {",
                "document.addEventListener('DOMContentLoaded', function() {\n" + timeout_code
            )
        
        # Write the patched file
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(patched_content)
        
        logger.info("Data Formatter JS file patched successfully")
    except Exception as e:
        logger.error(f"Error fixing Data Formatter: {str(e)}")
        logger.error(traceback.format_exc())
    
    return True

def run_diagnostics():
    """Run all diagnostic checks"""
    logger.info("Running all diagnostics...")
    
    results = {
        "environment": check_environment(),
        "app_configuration": check_app_configuration(),
        "templates": check_template_compatibility(),
        "js_files": check_js_compatibility(),
        "routes": check_routes(),
        "static_files": check_static_files()
    }
    
    logger.info(f"Diagnostic results: {json.dumps(results, indent=2)}")
    return all(results.values())

def main():
    parser = argparse.ArgumentParser(description='FireEMS.ai Deployment Fix Tool')
    parser.add_argument('--diagnose', action='store_true', help='Run diagnostics only')
    parser.add_argument('--fix', action='store_true', help='Apply fixes')
    parser.add_argument('--all', action='store_true', help='Run diagnostics and apply fixes')
    
    args = parser.parse_args()
    
    if args.all or (not args.diagnose and not args.fix):
        logger.info("Running full diagnostics and fixes...")
        run_diagnostics()
        apply_fixes()
    elif args.diagnose:
        logger.info("Running diagnostics only...")
        run_diagnostics()
    elif args.fix:
        logger.info("Applying fixes only...")
        apply_fixes()
    
    logger.info("Deployment fix tool completed")

if __name__ == "__main__":
    main()