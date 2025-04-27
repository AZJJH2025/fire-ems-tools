#!/usr/bin/env python3
"""
Enhanced Bundle Integrity Checker

This script verifies that the data-formatter-bundle.js file is served correctly
by the Flask application, comparing on-disk files with the served file.
It checks multiple potential bundle locations and provides detailed diagnostics.
"""

import os
import sys
import hashlib
import argparse
import requests
import json
import glob
import logging
from urllib.parse import urljoin
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('bundle_integrity.log')
    ]
)
logger = logging.getLogger('bundle_integrity')

def compute_file_hash(file_path, algorithm='sha256'):
    """Compute a hash of the given file"""
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return None
        
    try:
        hasher = hashlib.new(algorithm)
        
        with open(file_path, 'rb') as f:
            # Read file in chunks to handle large files efficiently
            for chunk in iter(lambda: f.read(4096), b''):
                hasher.update(chunk)
                
        return hasher.hexdigest()
    except Exception as e:
        logger.error(f"Error computing hash for {file_path}: {str(e)}")
        return None

def compute_content_hash(content, algorithm='sha256'):
    """Compute a hash of the given content"""
    try:
        hasher = hashlib.new(algorithm)
        hasher.update(content)
        return hasher.hexdigest()
    except Exception as e:
        logger.error(f"Error computing content hash: {str(e)}")
        return None

def find_bundle_files(base_dir=''):
    """Find all potential data-formatter-bundle.js files"""
    if not base_dir:
        base_dir = os.getcwd()
        
    static_dir = os.path.join(base_dir, 'static')
    
    # Check well-known locations
    known_locations = [
        os.path.join(static_dir, 'js', 'data-formatter-bundle.js'),
        os.path.join(static_dir, 'data-formatter-bundle.js'),
        os.path.join(static_dir, 'js', 'react-data-formatter', 'dist', 'data-formatter.js')
    ]
    
    found_bundles = []
    
    # Check known locations first
    for location in known_locations:
        if os.path.exists(location) and os.path.getsize(location) > 0:
            file_info = {
                'path': location,
                'size': os.path.getsize(location),
                'modified': datetime.fromtimestamp(os.path.getmtime(location)).isoformat(),
                'hash': compute_file_hash(location)
            }
            found_bundles.append(file_info)
    
    # Use glob to find any additional similar files
    js_files = glob.glob(os.path.join(static_dir, 'js', 'data-formatter*.js'))
    js_files.extend(glob.glob(os.path.join(static_dir, 'data-formatter*.js')))
    js_files.extend(glob.glob(os.path.join(static_dir, 'js', 'react-data-formatter', 'dist', 'data-formatter*.js')))
    
    # Add any found files that weren't in known locations
    for file_path in js_files:
        if file_path not in [b['path'] for b in found_bundles]:
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                file_info = {
                    'path': file_path,
                    'size': os.path.getsize(file_path),
                    'modified': datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat(),
                    'hash': compute_file_hash(file_path)
                }
                found_bundles.append(file_info)
    
    return found_bundles

def verify_bundle_integrity(base_url, verbose=False):
    """
    Verify bundle integrity by comparing on-disk files with the served file
    
    Args:
        base_url: Base URL of the Flask application
        verbose: Whether to print verbose information
        
    Returns:
        (success, message, details) tuple
    """
    # Find all potential bundle files
    bundle_files = find_bundle_files()
    
    if not bundle_files:
        return False, "Error: No bundle files found on disk", {}
        
    if verbose:
        logger.info(f"Found {len(bundle_files)} potential bundle files:")
        for idx, bundle in enumerate(bundle_files):
            logger.info(f"  {idx+1}. {bundle['path']} ({bundle['size']} bytes, modified {bundle['modified']})")
    
    # Fetch the file from the server
    try:
        bundle_url = urljoin(base_url, 'static/data-formatter-bundle.js')
        if verbose:
            logger.info(f"Fetching bundle from: {bundle_url}")
            
        response = requests.get(bundle_url, timeout=10)
        
        if response.status_code != 200:
            return False, f"Error: Got HTTP {response.status_code} when fetching the bundle", {
                'status_code': response.status_code,
                'headers': dict(response.headers),
                'bundle_files': bundle_files
            }
            
        # Get the actual served path from response headers if available
        served_path = response.headers.get('X-Bundle-Path', 'unknown')
        
        # Compute served content hash
        served_hash = compute_content_hash(response.content)
        served_size = len(response.content)
        
        if verbose:
            logger.info(f"Served hash: {served_hash}")
            logger.info(f"Served size: {served_size} bytes")
            logger.info(f"Content-Type: {response.headers.get('Content-Type', 'unknown')}")
            logger.info(f"Served from: {served_path}")
        
        # Check all bundle files to find a match
        matched_file = None
        for bundle in bundle_files:
            if bundle['hash'] == served_hash:
                matched_file = bundle
                break
        
        # Build result details
        details = {
            'url': bundle_url,
            'status_code': response.status_code,
            'headers': dict(response.headers),
            'served_hash': served_hash,
            'served_size': served_size,
            'served_path': served_path,
            'content_type': response.headers.get('Content-Type', 'unknown'),
            'bundle_files': bundle_files,
            'matched_file': matched_file
        }
        
        # Return result based on match
        if matched_file:
            return True, f"Success: Bundle integrity verified (hash: {served_hash}, path: {matched_file['path']})", details
        else:
            return False, f"Error: No matching on-disk file found for served bundle (hash: {served_hash})", details
            
    except Exception as e:
        logger.error(f"Error fetching served bundle: {str(e)}")
        return False, f"Error fetching served bundle: {str(e)}", {
            'error': str(e),
            'bundle_files': bundle_files
        }

def test_all_routes(base_url, verbose=False):
    """Test all routes that serve the bundle"""
    routes = [
        'static/data-formatter-bundle.js',
        'static/data-formatter-bundle.12345678.js',  # Test hashed route
        'app-static/js/data-formatter-bundle.js',    # Test app-static route
        'direct-static/js/data-formatter-bundle.js', # Test direct-static route
    ]
    
    results = {}
    
    for route in routes:
        try:
            url = urljoin(base_url, route)
            if verbose:
                logger.info(f"Testing route: {url}")
                
            response = requests.get(url, timeout=10)
            
            results[route] = {
                'status_code': response.status_code,
                'content_type': response.headers.get('Content-Type', 'unknown'),
                'size': len(response.content) if response.status_code == 200 else 0,
                'headers': dict(response.headers),
                'success': response.status_code == 200
            }
            
            # Only compute hash if successful
            if response.status_code == 200:
                results[route]['hash'] = compute_content_hash(response.content)
            
        except Exception as e:
            results[route] = {
                'error': str(e),
                'success': False
            }
    
    return results

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Enhanced data-formatter-bundle.js integrity checker")
    parser.add_argument("--url", default="http://localhost:5005", help="Base URL of the Flask application")
    parser.add_argument("--verbose", "-v", action="store_true", help="Increase verbosity")
    parser.add_argument("--test-all", "-a", action="store_true", help="Test all routes")
    parser.add_argument("--output", "-o", help="Output JSON file for results")
    args = parser.parse_args()
    
    # Run the checks
    if args.test_all:
        logger.info("Testing all bundle routes...")
        route_results = test_all_routes(args.url, args.verbose)
        
        # Print test results summary
        for route, result in route_results.items():
            status = "✅ Success" if result.get('success') else "❌ Failed"
            if 'error' in result:
                logger.info(f"{status} - {route}: {result.get('error')}")
            else:
                logger.info(f"{status} - {route}: HTTP {result.get('status_code')}, {result.get('size')} bytes")
                
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(route_results, f, indent=2)
            logger.info(f"Route test results written to {args.output}")
    else:
        # Just check the main route
        logger.info("Verifying bundle integrity...")
        success, message, details = verify_bundle_integrity(args.url, args.verbose)
        logger.info(message)
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(details, f, indent=2)
            logger.info(f"Details written to {args.output}")
        
        # Exit with appropriate code
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()