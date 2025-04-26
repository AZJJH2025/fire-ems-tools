#!/usr/bin/env python3
"""
API Testing Framework for Fire-EMS Tools

This module provides an advanced API testing framework that integrates with Postman
and supports automated API contract validation, performance testing, and security checks.
"""

import argparse
import json
import logging
import os
import platform
import shutil
import subprocess
import sys
import tempfile
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Union, Any, Tuple

import requests
from requests.auth import AuthBase

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('api_testing.log', mode='w')
    ]
)
logger = logging.getLogger('api_testing')

# Constants
CONFIG_FILE = 'api_test_config.json'
COLLECTIONS_DIR = 'api_collections'
POSTMAN_ENV_DIR = 'postman_environments'
DEFAULT_SERVER = "http://localhost:8080"
API_BASE_URL = "/api/v1"
REPORT_DIR = "api_test_reports"

# Default headers
DEFAULT_HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}


class APIKeyAuth(AuthBase):
    """API Key Authentication handler for requests."""

    def __init__(self, api_key: str, header_name: str = 'X-API-Key'):
        self.api_key = api_key
        self.header_name = header_name

    def __call__(self, r):
        r.headers[self.header_name] = self.api_key
        return r


class APITestConfig:
    """Configuration for API testing."""

    def __init__(self, server_url: str = DEFAULT_SERVER, 
                 api_key: Optional[str] = None,
                 admin_email: str = "test_admin@example.com",
                 admin_password: str = "test_password"):
        self.server_url = server_url
        self.api_key = api_key
        self.admin_email = admin_email
        self.admin_password = admin_password
        self.department_code = None

    @property
    def api_url(self) -> str:
        """Get the full API URL including the base server URL."""
        return f"{self.server_url}{API_BASE_URL}"

    def to_dict(self) -> Dict:
        """Convert configuration to dictionary for serialization."""
        return {
            'server_url': self.server_url,
            'api_key': self.api_key,
            'admin_email': self.admin_email,
            'admin_password': self.admin_password,
            'department_code': self.department_code
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'APITestConfig':
        """Create a configuration object from a dictionary."""
        config = cls(
            server_url=data.get('server_url', DEFAULT_SERVER),
            api_key=data.get('api_key'),
            admin_email=data.get('admin_email', "test_admin@example.com"),
            admin_password=data.get('admin_password', "test_password")
        )
        config.department_code = data.get('department_code')
        return config

    def save(self, filename: str = CONFIG_FILE) -> None:
        """Save configuration to a file."""
        with open(filename, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
        logger.info(f"Configuration saved to {filename}")

    @classmethod
    def load(cls, filename: str = CONFIG_FILE) -> 'APITestConfig':
        """Load configuration from a file."""
        if not os.path.exists(filename):
            logger.warning(f"Configuration file {filename} not found. Using defaults.")
            return cls()

        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            logger.info(f"Configuration loaded from {filename}")
            return cls.from_dict(data)
        except Exception as e:
            logger.error(f"Error loading configuration: {str(e)}")
            return cls()


class PostmanCollection:
    """Manage Postman collections for API testing."""

    def __init__(self, collection_path: str, environment_path: Optional[str] = None):
        self.collection_path = os.path.abspath(collection_path)
        self.environment_path = os.path.abspath(environment_path) if environment_path else None
        self._ensure_newman_installed()

    @staticmethod
    def _ensure_newman_installed() -> None:
        """Check if Newman is installed. If not, try to install it."""
        try:
            output = subprocess.run(
                ["newman", "--version"], 
                capture_output=True, 
                text=True, 
                check=False
            )
            
            if output.returncode != 0:
                logger.warning("Newman not found. Attempting to install...")
                subprocess.run(
                    ["npm", "install", "-g", "newman"],
                    check=True
                )
                logger.info("Newman installed successfully")
            else:
                logger.info(f"Newman version: {output.stdout.strip()}")
                
        except Exception as e:
            logger.error(f"Error checking/installing Newman: {str(e)}")
            logger.error("Please install Newman manually: npm install -g newman")
            raise RuntimeError("Newman is required but not available")

    def run(self, 
            output_dir: str = REPORT_DIR, 
            report_format: str = "html", 
            timeout: int = 60) -> Tuple[bool, str]:
        """
        Run the Postman collection with Newman.
        
        Args:
            output_dir: Directory to save reports
            report_format: Format for the report (html, json, etc.)
            timeout: Timeout in seconds for collection execution
            
        Returns:
            Tuple of (success boolean, report path)
        """
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_name = f"api_test_report_{timestamp}"
        report_path = os.path.join(output_dir, report_name)
        
        # Build the Newman command
        cmd = ["newman", "run", self.collection_path]
        
        # Add environment if provided
        if self.environment_path:
            cmd.extend(["--environment", self.environment_path])
            
        # Add reporters
        if report_format == "html":
            cmd.extend(["--reporters", "cli,html", "--reporter-html-export", f"{report_path}.html"])
        elif report_format == "json":
            cmd.extend(["--reporters", "cli,json", "--reporter-json-export", f"{report_path}.json"])
        else:
            cmd.extend(["--reporters", f"cli,{report_format}", 
                      f"--reporter-{report_format}-export", f"{report_path}.{report_format}"])
            
        # Log the command
        logger.info(f"Running command: {' '.join(cmd)}")
        
        try:
            # Run the collection with a timeout
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                check=False
            )
            
            # Write detailed log
            with open(f"{report_path}.log", "w") as log_file:
                log_file.write(f"STDOUT:\n{result.stdout}\n\nSTDERR:\n{result.stderr}")
                
            # Check if the run was successful
            success = result.returncode == 0
            report_file = f"{report_path}.{report_format}"
            
            if success:
                logger.info(f"Newman collection run successful. Report saved to {report_file}")
            else:
                logger.error(f"Newman collection run failed with code {result.returncode}")
                logger.error(f"See detailed log at {report_path}.log")
                
            return success, report_file
            
        except subprocess.TimeoutExpired:
            logger.error(f"Newman collection run timed out after {timeout} seconds")
            return False, f"{report_path}.log"
            
        except Exception as e:
            logger.error(f"Error running Newman collection: {str(e)}")
            return False, f"{report_path}.log"
    
    @staticmethod
    def create_environment(
            config: APITestConfig,
            output_path: Optional[str] = None) -> str:
        """
        Create a Postman environment file based on the API configuration.
        
        Args:
            config: API test configuration
            output_path: Path to save the environment file. If None, uses a default path.
            
        Returns:
            Path to the created environment file
        """
        if output_path is None:
            os.makedirs(POSTMAN_ENV_DIR, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = os.path.join(POSTMAN_ENV_DIR, f"env_{timestamp}.json")
            
        # Create environment template
        environment = {
            "id": f"fire-ems-api-env-{int(time.time())}",
            "name": f"Fire-EMS API Test Environment ({config.department_code or 'unknown'})",
            "values": [
                {
                    "key": "baseUrl",
                    "value": config.server_url,
                    "enabled": True
                },
                {
                    "key": "apiKey",
                    "value": config.api_key or "",
                    "enabled": True
                },
                {
                    "key": "apiPath",
                    "value": API_BASE_URL,
                    "enabled": True
                },
                {
                    "key": "departmentCode",
                    "value": config.department_code or "",
                    "enabled": True
                },
                {
                    "key": "adminEmail",
                    "value": config.admin_email,
                    "enabled": True
                },
                {
                    "key": "adminPassword",
                    "value": config.admin_password,
                    "enabled": True
                }
            ],
            "timestamp": int(time.time()) * 1000
        }
        
        # Write the environment file
        with open(output_path, 'w') as f:
            json.dump(environment, f, indent=2)
            
        logger.info(f"Created Postman environment at {output_path}")
        return output_path
    
    @staticmethod
    def create_collection(
            name: str,
            endpoints: List[Dict],
            output_path: Optional[str] = None) -> str:
        """
        Create a Postman collection file with the specified endpoints.
        
        Args:
            name: Name of the collection
            endpoints: List of endpoint configurations
            output_path: Path to save the collection file. If None, uses a default path.
            
        Returns:
            Path to the created collection file
        """
        if output_path is None:
            os.makedirs(COLLECTIONS_DIR, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_name = name.replace(" ", "_").lower()
            output_path = os.path.join(COLLECTIONS_DIR, f"{safe_name}_{timestamp}.json")
            
        # Create collection template
        collection = {
            "info": {
                "name": name,
                "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            "item": []
        }
        
        # Add each endpoint as an item
        for endpoint in endpoints:
            item = {
                "name": endpoint.get("name", "Unnamed Request"),
                "request": {
                    "method": endpoint.get("method", "GET"),
                    "header": endpoint.get("headers", [
                        {
                            "key": "X-API-Key",
                            "value": "{{apiKey}}",
                            "type": "text"
                        }
                    ]),
                    "url": {
                        "raw": f"{{{{baseUrl}}}}{{{{apiPath}}}}{endpoint.get('path', '/')}",
                        "host": ["{{baseUrl}}"],
                        "path": ["{{apiPath}}", *endpoint.get("path", "/").strip("/").split("/")]
                    }
                }
            }
            
            # Add query parameters if provided
            if "params" in endpoint:
                item["request"]["url"]["query"] = [
                    {"key": key, "value": value} 
                    for key, value in endpoint["params"].items()
                ]
                
            # Add request body if provided
            if "body" in endpoint:
                item["request"]["body"] = {
                    "mode": "raw",
                    "raw": json.dumps(endpoint["body"], indent=2),
                    "options": {
                        "raw": {
                            "language": "json"
                        }
                    }
                }
                
            # Add tests if provided
            if "tests" in endpoint:
                item["event"] = [
                    {
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": endpoint["tests"]
                        }
                    }
                ]
                
            collection["item"].append(item)
            
        # Write the collection file
        with open(output_path, 'w') as f:
            json.dump(collection, f, indent=2)
            
        logger.info(f"Created Postman collection at {output_path}")
        return output_path


class APITester:
    """Core API testing functionality."""

    def __init__(self, config: APITestConfig):
        self.config = config
        self.session = requests.Session()
        
        # Set default headers
        self.session.headers.update(DEFAULT_HEADERS)
        
        # Set authentication if an API key is provided
        if config.api_key:
            self.session.auth = APIKeyAuth(config.api_key)

    def setup_test_environment(self) -> bool:
        """
        Set up a test environment with a test department and API key.
        
        Returns:
            Success status (True/False)
        """
        logger.info("Setting up test environment...")
        
        try:
            # Login as admin
            login_url = f"{self.config.server_url}/login"
            login_data = {
                "email": self.config.admin_email,
                "password": self.config.admin_password
            }
            
            login_response = self.session.post(login_url, data=login_data)
            if login_response.status_code != 200:
                logger.error(f"Failed to login as admin. Status code: {login_response.status_code}")
                return False
                
            logger.info("Admin login successful")
            
            # Create a test department if needed
            if not self.config.department_code:
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                self.config.department_code = f"api_test_{timestamp}"
                
                department_data = {
                    "name": f"API Test Department {timestamp}",
                    "code": self.config.department_code,
                    "department_type": "combined",
                    "email": "api_test@example.com",
                    "admin_name": "API Test Admin",
                    "admin_email": self.config.admin_email,
                    "admin_password": self.config.admin_password,
                    "incident_logger": "on",
                    "call_density": "on",
                    "isochrone_map": "on",
                    "api_enabled": "on",
                    "generate_api_key": "true"
                }
                
                create_url = f"{self.config.server_url}/admin/departments/register"
                create_response = self.session.post(create_url, data=department_data)
                
                if create_response.status_code != 200:
                    logger.error(f"Failed to create test department. Status code: {create_response.status_code}")
                    return False
                    
                logger.info(f"Created test department with code: {self.config.department_code}")
                
            # Enable API and get API key
            if not self.config.api_key:
                # First, visit the settings page
                settings_url = f"{self.config.server_url}/dept/{self.config.department_code}/settings"
                settings_response = self.session.get(settings_url)
                
                if settings_response.status_code != 200:
                    logger.error(f"Failed to access department settings. Status code: {settings_response.status_code}")
                    return False
                
                # Enable API and generate key
                update_data = {
                    "api_enabled": "on",
                    "generate_api_key": "true"
                }
                
                update_response = self.session.post(settings_url, data=update_data)
                if update_response.status_code != 200:
                    logger.error(f"Failed to enable API. Status code: {update_response.status_code}")
                    return False
                
                # Get the API key from the API docs page
                docs_url = f"{self.config.server_url}/dept/{self.config.department_code}/api-docs"
                docs_response = self.session.get(docs_url)
                
                if docs_response.status_code != 200:
                    logger.error(f"Failed to access API docs. Status code: {docs_response.status_code}")
                    return False
                
                # Extract API key from the page content
                import re
                key_match = re.search(r'id="api-key" value="([^"]+)"', docs_response.text)
                if key_match:
                    self.config.api_key = key_match.group(1)
                    logger.info(f"Extracted API key: {self.config.api_key}")
                    
                    # Update session with the new API key
                    self.session.auth = APIKeyAuth(self.config.api_key)
                else:
                    logger.error("Failed to extract API key from API docs page")
                    return False
            
            # Create some test data
            self.create_test_data()
            
            # Save the updated configuration
            self.config.save()
            
            return True
            
        except Exception as e:
            logger.error(f"Error setting up test environment: {str(e)}")
            return False

    def create_test_data(self) -> None:
        """Create test data (stations, incidents, etc.) for API testing."""
        try:
            # Create a test station
            station_data = {
                "name": "API Test Station 1",
                "station_number": f"TEST-{int(time.time())}",
                "address": "123 API Test St",
                "city": "Testville",
                "state": "TS",
                "zip_code": "12345",
                "latitude": 35.1234,
                "longitude": -115.5678,
                "personnel_count": 10,
                "apparatus": {
                    "engine": 1,
                    "ambulance": 1
                }
            }
            
            station_url = f"{self.config.api_url}/stations"
            station_response = self.session.post(
                station_url, 
                json=station_data,
                headers={"X-API-Key": self.config.api_key}
            )
            
            if station_response.status_code == 200:
                logger.info("Created test station successfully")
            else:
                logger.warning(f"Failed to create test station: {station_response.status_code}")
                
            # Create test incidents
            for i in range(3):
                incident_data = {
                    "incident_title": f"API Test Incident {i+1}",
                    "incident_number": f"API-TEST-{int(time.time())}-{i+1}",
                    "incident_date": (datetime.now() - timedelta(days=i)).isoformat(),
                    "incident_type": ["Medical", "Fire", "Rescue"][i % 3],
                    "location": f"{i+100} API Test Ave",
                    "latitude": 35.1234 + (i * 0.01),
                    "longitude": -115.5678 - (i * 0.01)
                }
                
                incident_url = f"{self.config.api_url}/incidents"
                incident_response = self.session.post(
                    incident_url, 
                    json=incident_data,
                    headers={"X-API-Key": self.config.api_key}
                )
                
                if incident_response.status_code == 200:
                    logger.info(f"Created test incident {i+1} successfully")
                else:
                    logger.warning(f"Failed to create test incident {i+1}: {incident_response.status_code}")
                    
        except Exception as e:
            logger.error(f"Error creating test data: {str(e)}")

    def make_request(self, 
                   method: str, 
                   endpoint: str, 
                   data: Optional[Dict] = None, 
                   params: Optional[Dict] = None,
                   headers: Optional[Dict] = None) -> requests.Response:
        """
        Make an API request with proper error handling.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint (without the base URL and API path)
            data: Request data for POST/PUT requests
            params: Query parameters
            headers: Additional headers
            
        Returns:
            Response object
        """
        url = f"{self.config.api_url}/{endpoint.lstrip('/')}"
        request_headers = DEFAULT_HEADERS.copy()
        if headers:
            request_headers.update(headers)
            
        # Add API key authentication if not already in session
        if not self.session.auth and self.config.api_key:
            request_headers["X-API-Key"] = self.config.api_key
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, params=params, headers=request_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, params=params, headers=request_headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, params=params, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, params=params, headers=request_headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            return response
            
        except requests.RequestException as e:
            logger.error(f"Request error for {method} {url}: {str(e)}")
            raise

    def run_load_test(self, 
                    endpoint: str, 
                    num_requests: int = 100, 
                    concurrency: int = 10,
                    method: str = "GET",
                    data: Optional[Dict] = None) -> Dict:
        """
        Run a load test on a specific API endpoint.
        
        Args:
            endpoint: API endpoint to test
            num_requests: Total number of requests to make
            concurrency: Number of concurrent requests
            method: HTTP method to use
            data: Request data (for POST/PUT)
            
        Returns:
            Dictionary with test results
        """
        logger.info(f"Starting load test on {endpoint} with {num_requests} requests, concurrency={concurrency}")
        
        results = []
        errors = []
        start_time = time.time()
        
        # Function to execute in threads
        def make_request_with_timing():
            req_start = time.time()
            try:
                response = self.make_request(method, endpoint, data)
                elapsed = time.time() - req_start
                return {
                    "success": 200 <= response.status_code < 300,
                    "status_code": response.status_code,
                    "elapsed_time": elapsed,
                    "content_length": len(response.content)
                }
            except Exception as e:
                elapsed = time.time() - req_start
                errors.append(str(e))
                return {
                    "success": False,
                    "status_code": 0,
                    "elapsed_time": elapsed,
                    "error": str(e)
                }
        
        # Execute requests in parallel
        with ThreadPoolExecutor(max_workers=concurrency) as executor:
            for result in executor.map(lambda _: make_request_with_timing(), range(num_requests)):
                results.append(result)
                
        total_time = time.time() - start_time
        
        # Calculate statistics
        success_count = sum(1 for r in results if r["success"])
        success_rate = success_count / num_requests if num_requests > 0 else 0
        
        if results:
            response_times = [r["elapsed_time"] for r in results]
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            min_response_time = min(response_times)
            
            # Calculate percentiles
            response_times.sort()
            p50 = response_times[int(len(response_times) * 0.5)]
            p95 = response_times[int(len(response_times) * 0.95)]
            p99 = response_times[int(len(response_times) * 0.99)]
        else:
            avg_response_time = max_response_time = min_response_time = 0
            p50 = p95 = p99 = 0
        
        # Prepare the results
        test_results = {
            "endpoint": endpoint,
            "method": method,
            "total_requests": num_requests,
            "concurrency": concurrency,
            "total_time": total_time,
            "requests_per_second": num_requests / total_time if total_time > 0 else 0,
            "success_count": success_count,
            "success_rate": success_rate,
            "error_count": num_requests - success_count,
            "errors": errors[:10],  # Include up to 10 errors
            "response_time": {
                "average": avg_response_time,
                "min": min_response_time,
                "max": max_response_time,
                "p50": p50,
                "p95": p95,
                "p99": p99
            }
        }
        
        logger.info(f"Load test completed: {success_rate:.2%} success rate, "
                   f"{test_results['requests_per_second']:.2f} req/s, "
                   f"avg response time: {avg_response_time:.4f}s")
        
        return test_results

    def generate_api_contract(self, output_path: Optional[str] = None) -> str:
        """
        Generate an OpenAPI specification based on API responses.
        
        Args:
            output_path: Path to save the OpenAPI spec. If None, uses a default path.
            
        Returns:
            Path to the generated specification file
        """
        if output_path is None:
            os.makedirs("api_specs", exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = os.path.join("api_specs", f"openapi_spec_{timestamp}.json")
        
        # Basic structure for the OpenAPI specification
        api_spec = {
            "openapi": "3.0.0",
            "info": {
                "title": "Fire-EMS Tools API",
                "description": "API for Fire-EMS incident management",
                "version": "1.0.0"
            },
            "servers": [
                {
                    "url": self.config.server_url + API_BASE_URL,
                    "description": "API server"
                }
            ],
            "paths": {},
            "components": {
                "securitySchemes": {
                    "ApiKeyAuth": {
                        "type": "apiKey",
                        "in": "header",
                        "name": "X-API-Key"
                    }
                },
                "schemas": {}
            },
            "security": [
                {
                    "ApiKeyAuth": []
                }
            ]
        }
        
        # List of endpoints to document
        endpoints = [
            {"path": "/department", "method": "GET"},
            {"path": "/incidents", "method": "GET"},
            {"path": "/incidents", "method": "POST"},
            {"path": "/incidents/{id}", "method": "GET"},
            {"path": "/stations", "method": "GET"},
            {"path": "/stations", "method": "POST"},
            {"path": "/stations/{id}", "method": "GET"},
            {"path": "/users", "method": "GET"},
            {"path": "/users", "method": "POST"},
            {"path": "/users/{id}", "method": "GET"},
            {"path": "/users/{id}", "method": "PUT"}
        ]
        
        # Document each endpoint
        for endpoint in endpoints:
            path = endpoint["path"]
            method = endpoint["method"].lower()
            
            # Initialize path entry if it doesn't exist
            if path not in api_spec["paths"]:
                api_spec["paths"][path] = {}
                
            # Make a sample request to the endpoint
            try:
                if "{id}" in path:
                    # For endpoints with ID parameter, get a sample ID first
                    base_path = path.split("/{")[0]
                    list_response = self.make_request("GET", base_path)
                    
                    if list_response.status_code == 200:
                        data = list_response.json()
                        items = None
                        
                        # Find the array in the response
                        for key, value in data.items():
                            if isinstance(value, list) and value:
                                items = value
                                break
                                
                        if items:
                            # Replace {id} with an actual ID
                            sample_id = items[0].get("id")
                            if sample_id:
                                test_path = path.replace("{id}", str(sample_id))
                                response = self.make_request(method.upper(), test_path)
                            else:
                                logger.warning(f"Could not find ID for {path}")
                                continue
                        else:
                            logger.warning(f"No items found for {base_path}")
                            continue
                    else:
                        logger.warning(f"Failed to get list for {base_path}: {list_response.status_code}")
                        continue
                else:
                    # For non-ID endpoints, just make the request
                    response = self.make_request(method.upper(), path)
                    
                # Document the endpoint based on the response
                if response.status_code == 200:
                    response_data = response.json()
                    
                    # Extract schema from response
                    schema = self._extract_schema(response_data)
                    
                    # Add the schema to components
                    schema_name = f"{path.split('/')[-1].capitalize()}Response"
                    if "{id}" in path:
                        schema_name = f"{path.split('/')[-2].capitalize()}DetailResponse"
                        
                    api_spec["components"]["schemas"][schema_name] = schema
                    
                    # Add the endpoint documentation
                    api_spec["paths"][path][method] = {
                        "summary": f"{method.upper()} {path}",
                        "description": f"Endpoint for {path}",
                        "responses": {
                            "200": {
                                "description": "Successful response",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": f"#/components/schemas/{schema_name}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    # Add parameters for path parameters
                    if "{id}" in path:
                        if "parameters" not in api_spec["paths"][path][method]:
                            api_spec["paths"][path][method]["parameters"] = []
                            
                        api_spec["paths"][path][method]["parameters"].append({
                            "name": "id",
                            "in": "path",
                            "required": True,
                            "schema": {
                                "type": "integer"
                            },
                            "description": "ID of the resource"
                        })
                        
                    logger.info(f"Documented {method.upper()} {path}")
                    
            except Exception as e:
                logger.error(f"Error documenting {method.upper()} {path}: {str(e)}")
                continue
                
        # Write the API specification to file
        with open(output_path, 'w') as f:
            json.dump(api_spec, f, indent=2)
            
        logger.info(f"Generated OpenAPI specification at {output_path}")
        return output_path
        
    def _extract_schema(self, data: Any) -> Dict:
        """Extract JSON schema from a data sample."""
        if isinstance(data, dict):
            properties = {}
            for key, value in data.items():
                properties[key] = self._extract_schema(value)
                
            return {
                "type": "object",
                "properties": properties
            }
            
        elif isinstance(data, list):
            if data:
                # Use the first item as a sample
                return {
                    "type": "array",
                    "items": self._extract_schema(data[0])
                }
            else:
                return {
                    "type": "array",
                    "items": {}
                }
                
        elif isinstance(data, str):
            return {"type": "string"}
            
        elif isinstance(data, bool):
            return {"type": "boolean"}
            
        elif isinstance(data, int):
            return {"type": "integer"}
            
        elif isinstance(data, float):
            return {"type": "number"}
            
        elif data is None:
            return {"type": "null"}
            
        else:
            return {"type": "string"}


class APITestSuite(unittest.TestCase):
    """Unittest test suite for manual API testing."""
    
    @classmethod
    def setUpClass(cls):
        """Set up the test environment once for all tests."""
        cls.config = APITestConfig.load()
        cls.tester = APITester(cls.config)
        
        # Set up a test environment if needed
        if not cls.config.api_key:
            cls.tester.setup_test_environment()
            # Reload config with the new API key
            cls.config = APITestConfig.load()
            cls.tester = APITester(cls.config)
            
    def setUp(self):
        """Set up for each test."""
        if not self.config.api_key:
            self.skipTest("No API key available. Run setup first.")
            
    def test_department_info(self):
        """Test the department info endpoint."""
        response = self.tester.make_request("GET", "department")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("department", data)
        self.assertEqual(data["department"]["code"], self.config.department_code)
        
    def test_get_incidents(self):
        """Test getting all incidents."""
        response = self.tester.make_request("GET", "incidents")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("incidents", data)
        self.assertIsInstance(data["incidents"], list)
        
    def test_create_incident(self):
        """Test creating a new incident."""
        incident_data = {
            "incident_title": "Unit Test Incident",
            "incident_number": f"TEST-{int(time.time())}",
            "incident_date": datetime.now().isoformat(),
            "incident_type": "EMS",
            "location": "123 Unit Test St",
            "latitude": 37.7749,
            "longitude": -122.4194
        }
        
        response = self.tester.make_request("POST", "incidents", data=incident_data)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("incident_id", data)
        
        # Verify the incident was created
        incident_id = data["incident_id"]
        get_response = self.tester.make_request("GET", f"incidents/{incident_id}")
        self.assertEqual(get_response.status_code, 200)
        
        get_data = get_response.json()
        self.assertTrue(get_data.get("success"))
        self.assertIn("incident", get_data)
        self.assertEqual(get_data["incident"]["id"], incident_id)
        
    def test_get_stations(self):
        """Test getting all stations."""
        response = self.tester.make_request("GET", "stations")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("stations", data)
        self.assertIsInstance(data["stations"], list)
        
    def test_api_authentication(self):
        """Test API authentication requirements."""
        # Test without API key
        session = requests.Session()
        response = session.get(f"{self.config.api_url}/department")
        self.assertEqual(response.status_code, 401)
        
        # Test with invalid API key
        headers = {"X-API-Key": "invalid_key_12345"}
        response = session.get(f"{self.config.api_url}/department", headers=headers)
        self.assertEqual(response.status_code, 401)
        
        # Test with valid API key
        headers = {"X-API-Key": self.config.api_key}
        response = session.get(f"{self.config.api_url}/department", headers=headers)
        self.assertEqual(response.status_code, 200)


def create_default_postman_collection() -> str:
    """Create a default Postman collection for API testing."""
    endpoints = [
        {
            "name": "Get Department Info",
            "method": "GET",
            "path": "/department",
            "tests": [
                "pm.test(\"Status code is 200\", function() {",
                "    pm.response.to.have.status(200);",
                "});",
                "",
                "pm.test(\"Response has required fields\", function() {",
                "    var jsonData = pm.response.json();",
                "    pm.expect(jsonData.success).to.be.true;",
                "    pm.expect(jsonData.department).to.be.an('object');",
                "    pm.expect(jsonData.department.code).to.eql(pm.environment.get('departmentCode'));",
                "});"
            ]
        },
        {
            "name": "Get All Incidents",
            "method": "GET",
            "path": "/incidents",
            "tests": [
                "pm.test(\"Status code is 200\", function() {",
                "    pm.response.to.have.status(200);",
                "});",
                "",
                "pm.test(\"Response contains incidents array\", function() {",
                "    var jsonData = pm.response.json();",
                "    pm.expect(jsonData.success).to.be.true;",
                "    pm.expect(jsonData.incidents).to.be.an('array');",
                "});",
                "",
                "// Save the first incident ID for later tests",
                "if (pm.response.json().incidents && pm.response.json().incidents.length > 0) {",
                "    pm.environment.set('incidentId', pm.response.json().incidents[0].id);",
                "}"
            ]
        },
        {
            "name": "Get Incident by ID",
            "method": "GET",
            "path": "/incidents/{{incidentId}}",
            "tests": [
                "pm.test(\"Status code is 200\", function() {",
                "    pm.response.to.have.status(200);",
                "});",
                "",
                "pm.test(\"Response contains incident details\", function() {",
                "    var jsonData = pm.response.json();",
                "    pm.expect(jsonData.success).to.be.true;",
                "    pm.expect(jsonData.incident).to.be.an('object');",
                "    pm.expect(jsonData.incident.id).to.eql(parseInt(pm.environment.get('incidentId')));",
                "});"
            ]
        },
        {
            "name": "Create New Incident",
            "method": "POST",
            "path": "/incidents",
            "body": {
                "incident_title": "Postman Test Incident",
                "incident_number": "POSTMAN-{{$timestamp}}",
                "incident_date": "{{$isoTimestamp}}",
                "incident_type": "Fire",
                "location": "123 Postman Test St",
                "latitude": 37.7749,
                "longitude": -122.4194
            },
            "tests": [
                "pm.test(\"Status code is 200\", function() {",
                "    pm.response.to.have.status(200);",
                "});",
                "",
                "pm.test(\"Incident created successfully\", function() {",
                "    var jsonData = pm.response.json();",
                "    pm.expect(jsonData.success).to.be.true;",
                "    pm.expect(jsonData.incident_id).to.be.a('number');",
                "    ",
                "    // Save the new incident ID for later tests",
                "    pm.environment.set('newIncidentId', jsonData.incident_id);",
                "});"
            ]
        },
        {
            "name": "Get New Incident by ID",
            "method": "GET",
            "path": "/incidents/{{newIncidentId}}",
            "tests": [
                "pm.test(\"Status code is 200\", function() {",
                "    pm.response.to.have.status(200);",
                "});",
                "",
                "pm.test(\"New incident details match\", function() {",
                "    var jsonData = pm.response.json();",
                "    pm.expect(jsonData.success).to.be.true;",
                "    pm.expect(jsonData.incident).to.be.an('object');",
                "    pm.expect(jsonData.incident.id).to.eql(parseInt(pm.environment.get('newIncidentId')));",
                "    pm.expect(jsonData.incident.title).to.eql('Postman Test Incident');",
                "});"
            ]
        },
        {
            "name": "Get All Stations",
            "method": "GET",
            "path": "/stations",
            "tests": [
                "pm.test(\"Status code is 200\", function() {",
                "    pm.response.to.have.status(200);",
                "});",
                "",
                "pm.test(\"Response contains stations array\", function() {",
                "    var jsonData = pm.response.json();",
                "    pm.expect(jsonData.success).to.be.true;",
                "    pm.expect(jsonData.stations).to.be.an('array');",
                "});",
                "",
                "// Save the first station ID for later tests",
                "if (pm.response.json().stations && pm.response.json().stations.length > 0) {",
                "    pm.environment.set('stationId', pm.response.json().stations[0].id);",
                "}"
            ]
        },
        {
            "name": "Get Station by ID",
            "method": "GET",
            "path": "/stations/{{stationId}}",
            "tests": [
                "pm.test(\"Status code is 200\", function() {",
                "    pm.response.to.have.status(200);",
                "});",
                "",
                "pm.test(\"Response contains station details\", function() {",
                "    var jsonData = pm.response.json();",
                "    pm.expect(jsonData.success).to.be.true;",
                "    pm.expect(jsonData.station).to.be.an('object');",
                "    pm.expect(jsonData.station.id).to.eql(parseInt(pm.environment.get('stationId')));",
                "});"
            ]
        },
        {
            "name": "Create New Station",
            "method": "POST",
            "path": "/stations",
            "body": {
                "name": "Postman Test Station",
                "station_number": "POSTMAN-{{$timestamp}}",
                "address": "456 Postman Ave",
                "city": "Testville",
                "state": "TS",
                "zip_code": "12345",
                "latitude": 35.1234,
                "longitude": -115.5678,
                "personnel_count": 5,
                "apparatus": {
                    "engine": 1,
                    "ambulance": 1
                }
            },
            "tests": [
                "pm.test(\"Status code is 200\", function() {",
                "    pm.response.to.have.status(200);",
                "});",
                "",
                "pm.test(\"Station created successfully\", function() {",
                "    var jsonData = pm.response.json();",
                "    pm.expect(jsonData.success).to.be.true;",
                "    pm.expect(jsonData.station_id).to.be.a('number');",
                "    ",
                "    // Save the new station ID for later tests",
                "    pm.environment.set('newStationId', jsonData.station_id);",
                "});"
            ]
        },
        {
            "name": "Get New Station by ID",
            "method": "GET",
            "path": "/stations/{{newStationId}}",
            "tests": [
                "pm.test(\"Status code is 200\", function() {",
                "    pm.response.to.have.status(200);",
                "});",
                "",
                "pm.test(\"New station details match\", function() {",
                "    var jsonData = pm.response.json();",
                "    pm.expect(jsonData.success).to.be.true;",
                "    pm.expect(jsonData.station).to.be.an('object');",
                "    pm.expect(jsonData.station.id).to.eql(parseInt(pm.environment.get('newStationId')));",
                "    pm.expect(jsonData.station.name).to.eql('Postman Test Station');",
                "});"
            ]
        },
        {
            "name": "Invalid Authentication Test",
            "method": "GET",
            "path": "/department",
            "headers": [
                {
                    "key": "X-API-Key",
                    "value": "invalid_key_12345",
                    "type": "text"
                }
            ],
            "tests": [
                "pm.test(\"Status code is 401 for invalid API key\", function() {",
                "    pm.response.to.have.status(401);",
                "});",
                "",
                "pm.test(\"Response contains error message\", function() {",
                "    var jsonData = pm.response.json();",
                "    pm.expect(jsonData.error).to.exist;",
                "});"
            ]
        },
        {
            "name": "Missing Required Fields Test",
            "method": "POST",
            "path": "/incidents",
            "body": {
                "location": "Incomplete Data Test"
            },
            "tests": [
                "pm.test(\"Status code is 400 for missing fields\", function() {",
                "    pm.response.to.have.status(400);",
                "});",
                "",
                "pm.test(\"Response indicates missing fields\", function() {",
                "    var jsonData = pm.response.json();",
                "    pm.expect(jsonData.error).to.exist;",
                "    pm.expect(jsonData.required_fields).to.exist;",
                "});"
            ]
        }
    ]
    
    return PostmanCollection.create_collection(
        "Fire-EMS API Tests", 
        endpoints
    )


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="API Testing Framework for Fire-EMS Tools")
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Setup command
    setup_parser = subparsers.add_parser("setup", help="Set up test environment")
    setup_parser.add_argument("--server", help="Server URL", default=DEFAULT_SERVER)
    setup_parser.add_argument("--admin-email", help="Admin email", default="test_admin@example.com")
    setup_parser.add_argument("--admin-password", help="Admin password", default="test_password")
    
    # Run Postman tests command
    postman_parser = subparsers.add_parser("postman", help="Run Postman collection tests")
    postman_parser.add_argument("--collection", help="Path to Postman collection", default=None)
    postman_parser.add_argument("--environment", help="Path to Postman environment", default=None)
    postman_parser.add_argument("--create-collection", help="Create a default collection", action="store_true")
    postman_parser.add_argument("--report-format", help="Report format", choices=["html", "json"], default="html")
    
    # Load test command
    load_parser = subparsers.add_parser("load", help="Run load tests")
    load_parser.add_argument("--endpoint", help="API endpoint to test", default="department")
    load_parser.add_argument("--requests", help="Number of requests", type=int, default=100)
    load_parser.add_argument("--concurrency", help="Concurrency level", type=int, default=10)
    load_parser.add_argument("--method", help="HTTP method", choices=["GET", "POST"], default="GET")
    
    # Generate API spec command
    spec_parser = subparsers.add_parser("spec", help="Generate OpenAPI specification")
    spec_parser.add_argument("--output", help="Output path", default=None)
    
    # Run unit tests command
    unit_parser = subparsers.add_parser("unittest", help="Run unittest test suite")
    
    args = parser.parse_args()
    
    # Load configuration
    config = APITestConfig.load()
    
    # Handle commands
    if args.command == "setup":
        # Create a new configuration
        config = APITestConfig(
            server_url=args.server,
            admin_email=args.admin_email,
            admin_password=args.admin_password
        )
        
        # Set up the test environment
        tester = APITester(config)
        if tester.setup_test_environment():
            logger.info("Test environment setup completed successfully")
            logger.info(f"Department code: {config.department_code}")
            logger.info(f"API key: {config.api_key}")
        else:
            logger.error("Test environment setup failed")
            return 1
            
    elif args.command == "postman":
        if not config.api_key:
            logger.error("No API key available. Run setup first.")
            return 1
            
        # Create environment file
        env_path = args.environment
        if not env_path:
            env_path = PostmanCollection.create_environment(config)
            
        # Create or use collection
        collection_path = args.collection
        if not collection_path:
            if args.create_collection:
                collection_path = create_default_postman_collection()
            else:
                logger.error("No collection specified. Use --collection or --create-collection")
                return 1
                
        # Run the collection
        collection = PostmanCollection(collection_path, env_path)
        success, report_path = collection.run(report_format=args.report_format)
        
        if success:
            logger.info(f"Postman tests passed. Report available at {report_path}")
        else:
            logger.error(f"Postman tests failed. See report at {report_path}")
            return 1
            
    elif args.command == "load":
        if not config.api_key:
            logger.error("No API key available. Run setup first.")
            return 1
            
        # Run load test
        tester = APITester(config)
        results = tester.run_load_test(
            endpoint=args.endpoint,
            num_requests=args.requests,
            concurrency=args.concurrency,
            method=args.method
        )
        
        # Save results to file
        os.makedirs(REPORT_DIR, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_path = os.path.join(REPORT_DIR, f"load_test_{timestamp}.json")
        
        with open(results_path, 'w') as f:
            json.dump(results, f, indent=2)
            
        logger.info(f"Load test results saved to {results_path}")
        
    elif args.command == "spec":
        if not config.api_key:
            logger.error("No API key available. Run setup first.")
            return 1
            
        # Generate API specification
        tester = APITester(config)
        spec_path = tester.generate_api_contract(args.output)
        
        logger.info(f"API specification generated at {spec_path}")
        
    elif args.command == "unittest":
        # Run unit tests
        unittest.main(argv=[sys.argv[0]])
        
    else:
        parser.print_help()
        
    return 0


if __name__ == "__main__":
    sys.exit(main())