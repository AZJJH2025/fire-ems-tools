#!/usr/bin/env python3
"""
GraphQL API Testing Framework for Fire-EMS Tools

This module provides comprehensive testing for GraphQL APIs, including:
- Query validation
- Mutation testing
- Schema validation
- Performance testing
- Security testing
"""

import argparse
import asyncio
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple, Union, Any

import aiohttp
import matplotlib.pyplot as plt
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('graphql_api_test.log', mode='w')
    ]
)
logger = logging.getLogger('graphql_api_test')

# Constants
DEFAULT_SERVER = "http://localhost:8080"
GRAPHQL_ENDPOINT = "/graphql"
REPORT_DIR = "graphql_test_reports"
CONFIG_FILE = "graphql_test_config.json"
TEST_DIR = "graphql_tests"
LOGIN_CREDENTIALS = {
    "admin": {"email": "admin@example.com", "password": "admin_password"},
    "user": {"email": "user@example.com", "password": "user_password"}
}


class GraphQLRequest:
    """Represents a GraphQL request."""
    
    def __init__(
        self,
        query: str,
        variables: Optional[Dict] = None,
        operation_name: Optional[str] = None,
        auth_required: bool = False,
        role: str = "user",
        description: Optional[str] = None,
        expected_status: int = 200,
        validation_rules: Optional[List[Dict]] = None
    ):
        """Initialize a GraphQL request.
        
        Args:
            query: GraphQL query/mutation string
            variables: GraphQL variables
            operation_name: Name of the operation
            auth_required: Whether authentication is required
            role: Role required for authentication
            description: Description of the request
            expected_status: Expected HTTP status code
            validation_rules: Rules to validate the response
        """
        self.query = query
        self.variables = variables or {}
        self.operation_name = operation_name
        self.auth_required = auth_required
        self.role = role
        self.description = description
        self.expected_status = expected_status
        self.validation_rules = validation_rules or []
        
    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization."""
        return {
            "query": self.query,
            "variables": self.variables,
            "operationName": self.operation_name
        }
        
    @staticmethod
    def from_file(file_path: str) -> 'GraphQLRequest':
        """Load GraphQL request from file.
        
        Args:
            file_path: Path to the file
            
        Returns:
            GraphQLRequest instance
        """
        with open(file_path, 'r') as f:
            data = json.load(f)
            
        return GraphQLRequest(
            query=data.get("query", ""),
            variables=data.get("variables", {}),
            operation_name=data.get("operationName"),
            auth_required=data.get("auth_required", False),
            role=data.get("role", "user"),
            description=data.get("description"),
            expected_status=data.get("expected_status", 200),
            validation_rules=data.get("validation_rules", [])
        )


class GraphQLAPITester:
    """Main class for GraphQL API testing."""
    
    def __init__(
        self,
        base_url: str = DEFAULT_SERVER,
        graphql_endpoint: str = GRAPHQL_ENDPOINT,
        timeout: float = 30.0,
        headers: Optional[Dict] = None,
        auth_token: Optional[str] = None
    ):
        """Initialize the GraphQL API tester.
        
        Args:
            base_url: Base URL of the API
            graphql_endpoint: Path to the GraphQL endpoint
            timeout: Request timeout in seconds
            headers: Additional HTTP headers
            auth_token: Authentication token
        """
        self.base_url = base_url
        self.graphql_endpoint = graphql_endpoint
        self.timeout = timeout
        self.headers = headers or {"Content-Type": "application/json"}
        self.auth_token = auth_token
        self.session = None
        
        # Create report directory
        os.makedirs(REPORT_DIR, exist_ok=True)
        
        # Results storage
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "base_url": base_url,
            "endpoint": graphql_endpoint,
            "tests_total": 0,
            "tests_passed": 0,
            "tests_failed": 0,
            "test_results": []
        }
        
        logger.info(f"Initialized GraphQL API tester with URL: {base_url}{graphql_endpoint}")
        
    async def authenticate(self, role: str = "user") -> bool:
        """Authenticate with the API.
        
        Args:
            role: Role to authenticate as (admin or user)
            
        Returns:
            Success status
        """
        if role not in LOGIN_CREDENTIALS:
            logger.error(f"Unknown role: {role}")
            return False
            
        credentials = LOGIN_CREDENTIALS[role]
        
        # Create login mutation
        login_mutation = """
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                token
                user {
                    id
                    email
                    role
                }
            }
        }
        """
        
        login_variables = {
            "email": credentials["email"],
            "password": credentials["password"]
        }
        
        try:
            # Execute login mutation
            response = await self.execute_query(
                query=login_mutation,
                variables=login_variables,
                auth_required=False
            )
            
            # Check if login was successful
            if response.get("errors"):
                logger.error(f"Login failed: {response['errors']}")
                return False
                
            # Extract token from response
            data = response.get("data", {})
            login_data = data.get("login", {})
            token = login_data.get("token")
            
            if not token:
                logger.error("Login succeeded but no token was returned")
                return False
                
            # Store token for future requests
            self.auth_token = token
            self.headers["Authorization"] = f"Bearer {token}"
            
            logger.info(f"Successfully logged in as {role}")
            return True
            
        except Exception as e:
            logger.error(f"Error during authentication: {str(e)}")
            return False
    
    async def initialize_session(self) -> None:
        """Initialize aiohttp session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                headers=self.headers,
                timeout=aiohttp.ClientTimeout(total=self.timeout)
            )
    
    async def close_session(self) -> None:
        """Close aiohttp session."""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def execute_query(
        self,
        query: str,
        variables: Optional[Dict] = None,
        operation_name: Optional[str] = None,
        auth_required: bool = False,
        role: str = "user"
    ) -> Dict:
        """Execute a GraphQL query or mutation.
        
        Args:
            query: GraphQL query/mutation string
            variables: GraphQL variables
            operation_name: Name of the operation
            auth_required: Whether authentication is required
            role: Role required for authentication
            
        Returns:
            GraphQL response
        """
        # Initialize session if needed
        await self.initialize_session()
        
        # Handle authentication if required
        if auth_required and not self.auth_token:
            auth_success = await self.authenticate(role)
            if not auth_success:
                return {"errors": [{"message": "Authentication failed"}]}
        
        # Prepare request
        payload = {
            "query": query,
            "variables": variables or {},
        }
        
        if operation_name:
            payload["operationName"] = operation_name
        
        url = f"{self.base_url}{self.graphql_endpoint}"
        
        try:
            # Execute query
            async with self.session.post(url, json=payload) as response:
                response_data = await response.json()
                status_code = response.status
                
                # Record detailed response info for testing purposes
                result = {
                    "status_code": status_code,
                    "response": response_data,
                    "headers": dict(response.headers)
                }
                
                return response_data
                
        except Exception as e:
            logger.error(f"Error executing query: {str(e)}")
            return {"errors": [{"message": str(e)}]}
    
    def validate_response(
        self, 
        response: Dict, 
        validation_rules: List[Dict]
    ) -> Tuple[bool, List[str]]:
        """Validate a GraphQL response against rules.
        
        Args:
            response: GraphQL response
            validation_rules: List of validation rules
            
        Returns:
            Tuple of (success, error_messages)
        """
        success = True
        error_messages = []
        
        # Helper to get nested values using dot notation
        def get_nested_value(obj, path):
            keys = path.split('.')
            value = obj
            for key in keys:
                if isinstance(value, dict) and key in value:
                    value = value[key]
                else:
                    return None
            return value
        
        # Process each validation rule
        for rule in validation_rules:
            rule_type = rule.get("type")
            
            if rule_type == "no_errors":
                # Check that response has no errors
                if "errors" in response:
                    success = False
                    error_messages.append(f"Response contains errors: {response['errors']}")
            
            elif rule_type == "has_data":
                # Check that response has data
                if "data" not in response or response["data"] is None:
                    success = False
                    error_messages.append("Response does not contain data")
            
            elif rule_type == "field_exists":
                # Check that a field exists in the response
                path = rule.get("path", "")
                value = get_nested_value(response, path)
                if value is None:
                    success = False
                    error_messages.append(f"Field does not exist: {path}")
            
            elif rule_type == "field_equals":
                # Check that a field equals an expected value
                path = rule.get("path", "")
                expected = rule.get("value")
                value = get_nested_value(response, path)
                if value != expected:
                    success = False
                    error_messages.append(f"Field {path} value {value} does not match expected {expected}")
            
            elif rule_type == "field_contains":
                # Check that a field contains an expected value
                path = rule.get("path", "")
                expected = rule.get("value")
                value = get_nested_value(response, path)
                
                if not value or expected not in value:
                    success = False
                    error_messages.append(f"Field {path} value does not contain {expected}")
            
            elif rule_type == "array_length":
                # Check array length
                path = rule.get("path", "")
                min_length = rule.get("min", 0)
                max_length = rule.get("max", float('inf'))
                
                value = get_nested_value(response, path)
                if not isinstance(value, list):
                    success = False
                    error_messages.append(f"Field {path} is not an array")
                elif len(value) < min_length:
                    success = False
                    error_messages.append(f"Array {path} length {len(value)} is less than min {min_length}")
                elif len(value) > max_length:
                    success = False
                    error_messages.append(f"Array {path} length {len(value)} is greater than max {max_length}")
            
            elif rule_type == "custom":
                # Custom validation function (defined in Python)
                validator_name = rule.get("validator", "")
                if hasattr(self, validator_name):
                    validator = getattr(self, validator_name)
                    if callable(validator):
                        validator_result, validator_message = validator(response, rule)
                        if not validator_result:
                            success = False
                            error_messages.append(validator_message)
                    else:
                        logger.warning(f"Validator {validator_name} is not callable")
                else:
                    logger.warning(f"Validator {validator_name} not found")
        
        return success, error_messages
    
    async def run_test(self, request: GraphQLRequest) -> Dict:
        """Run a single GraphQL test.
        
        Args:
            request: GraphQL request
            
        Returns:
            Test result dictionary
        """
        start_time = time.time()
        
        result = {
            "description": request.description or "Unnamed Test",
            "query": request.query,
            "variables": request.variables,
            "operation_name": request.operation_name,
            "auth_required": request.auth_required,
            "role": request.role,
            "timestamp": datetime.now().isoformat(),
            "success": False,
            "status_code": None,
            "errors": [],
            "validation_errors": [],
            "response": None,
            "duration_ms": 0
        }
        
        try:
            # Execute the query
            response = await self.execute_query(
                query=request.query,
                variables=request.variables,
                operation_name=request.operation_name,
                auth_required=request.auth_required,
                role=request.role
            )
            
            # Record response
            result["response"] = response
            
            # Check HTTP status code
            if hasattr(response, "status_code"):
                status_code = response.status_code
            else:
                # Default to 200 for successful requests when status code isn't available
                status_code = 200 if "errors" not in response else 400
                
            result["status_code"] = status_code
            
            # Validate response
            validation_success, validation_errors = self.validate_response(
                response, request.validation_rules
            )
            
            result["validation_errors"] = validation_errors
            
            # Determine test success
            if status_code != request.expected_status:
                result["errors"].append(f"Expected status {request.expected_status}, got {status_code}")
                result["success"] = False
            elif "errors" in response and not any(rule.get("type") == "expect_errors" for rule in request.validation_rules):
                result["errors"].append(f"GraphQL errors: {response['errors']}")
                result["success"] = False
            elif not validation_success:
                result["success"] = False
            else:
                result["success"] = True
                
        except Exception as e:
            result["errors"].append(f"Test execution error: {str(e)}")
            result["success"] = False
            
        # Calculate duration
        result["duration_ms"] = round((time.time() - start_time) * 1000, 2)
        
        # Log result
        log_method = logger.info if result["success"] else logger.error
        log_method(f"Test {result['description']}: {'SUCCESS' if result['success'] else 'FAILURE'} "
                  f"({result['duration_ms']} ms)")
        
        if not result["success"]:
            for error in result["errors"] + result["validation_errors"]:
                logger.error(f"  - {error}")
                
        return result
    
    async def run_tests_from_directory(self, directory: str = TEST_DIR) -> Dict:
        """Run all tests from a directory.
        
        Args:
            directory: Directory containing test files
            
        Returns:
            Dictionary of test results
        """
        if not os.path.exists(directory):
            logger.error(f"Test directory not found: {directory}")
            return self.results
            
        # Find all JSON files in the directory
        test_files = sorted(Path(directory).glob("**/*.json"))
        
        if not test_files:
            logger.warning(f"No test files found in {directory}")
            return self.results
            
        logger.info(f"Found {len(test_files)} test files")
        
        # Initialize session
        await self.initialize_session()
        
        try:
            # Load and run each test
            for test_file in test_files:
                logger.info(f"Running test from file: {test_file}")
                try:
                    request = GraphQLRequest.from_file(str(test_file))
                    
                    # Add default description if none provided
                    if not request.description:
                        request.description = test_file.stem.replace("_", " ").title()
                        
                    # Run the test
                    result = await self.run_test(request)
                    
                    # Update statistics
                    self.results["tests_total"] += 1
                    if result["success"]:
                        self.results["tests_passed"] += 1
                    else:
                        self.results["tests_failed"] += 1
                        
                    # Add to results
                    self.results["test_results"].append(result)
                    
                except Exception as e:
                    logger.error(f"Error running test from file {test_file}: {str(e)}")
                    self.results["tests_total"] += 1
                    self.results["tests_failed"] += 1
                    self.results["test_results"].append({
                        "description": test_file.stem.replace("_", " ").title(),
                        "file": str(test_file),
                        "success": False,
                        "errors": [f"Failed to execute test: {str(e)}"],
                        "timestamp": datetime.now().isoformat()
                    })
                    
            return self.results
            
        finally:
            # Clean up session
            await self.close_session()
    
    async def run_schema_validation(self) -> Dict:
        """Validate the GraphQL schema.
        
        Returns:
            Validation result
        """
        # Query for the schema using introspection
        introspection_query = """
        query IntrospectionQuery {
            __schema {
                types {
                    name
                    description
                    kind
                    fields {
                        name
                        description
                        type {
                            name
                            kind
                            ofType {
                                name
                                kind
                            }
                        }
                        args {
                            name
                            description
                            defaultValue
                        }
                    }
                    inputFields {
                        name
                        description
                    }
                    interfaces {
                        name
                    }
                    enumValues {
                        name
                        description
                    }
                    possibleTypes {
                        name
                    }
                }
                queryType {
                    name
                }
                mutationType {
                    name
                }
                subscriptionType {
                    name
                }
                directives {
                    name
                    description
                    locations
                    args {
                        name
                        description
                        defaultValue
                    }
                }
            }
        }
        """
        
        # Execute the introspection query
        schema_response = await self.execute_query(introspection_query)
        
        # Check if we got a valid schema
        if "errors" in schema_response:
            return {
                "success": False,
                "errors": schema_response.get("errors", []),
                "schema": None
            }
            
        if "data" not in schema_response or "__schema" not in schema_response["data"]:
            return {
                "success": False,
                "errors": ["Invalid schema response"],
                "schema": schema_response
            }
            
        # Basic validation (this could be expanded for more thorough validation)
        schema = schema_response["data"]["__schema"]
        errors = []
        
        # Check for query type
        if not schema.get("queryType"):
            errors.append("Schema does not define a query type")
            
        # Count types
        types = schema.get("types", [])
        object_types = [t for t in types if t.get("kind") == "OBJECT" and not t.get("name", "").startswith("__")]
        scalar_types = [t for t in types if t.get("kind") == "SCALAR"]
        enum_types = [t for t in types if t.get("kind") == "ENUM"]
        interface_types = [t for t in types if t.get("kind") == "INTERFACE"]
        union_types = [t for t in types if t.get("kind") == "UNION"]
        input_types = [t for t in types if t.get("kind") == "INPUT_OBJECT"]
        
        # Check for missing descriptions
        for type_obj in object_types:
            if not type_obj.get("description"):
                errors.append(f"Type {type_obj.get('name')} is missing a description")
                
            for field in type_obj.get("fields", []) or []:
                if not field.get("description"):
                    errors.append(f"Field {type_obj.get('name')}.{field.get('name')} is missing a description")
        
        # Result
        return {
            "success": len(errors) == 0,
            "errors": errors,
            "stats": {
                "total_types": len(types),
                "object_types": len(object_types),
                "scalar_types": len(scalar_types),
                "enum_types": len(enum_types),
                "interface_types": len(interface_types),
                "union_types": len(union_types),
                "input_types": len(input_types)
            },
            "schema": schema
        }
    
    async def run_load_test(
        self,
        request: GraphQLRequest,
        num_requests: int = 100,
        concurrency: int = 10
    ) -> Dict:
        """Run a load test for a specific GraphQL query.
        
        Args:
            request: GraphQL request to test
            num_requests: Total number of requests to make
            concurrency: Number of concurrent requests
            
        Returns:
            Dictionary with load test results
        """
        logger.info(f"Starting load test with {num_requests} requests, concurrency={concurrency}")
        
        # Initialize session
        await self.initialize_session()
        
        # Handle authentication if required
        if request.auth_required:
            auth_success = await self.authenticate(request.role)
            if not auth_success:
                return {
                    "success": False,
                    "errors": ["Authentication failed"],
                    "results": []
                }
        
        # Prepare for test
        results = []
        errors = []
        start_time = time.time()
        
        # Semaphore to control concurrency
        semaphore = asyncio.Semaphore(concurrency)
        
        # Function to execute in parallel
        async def execute_test():
            async with semaphore:
                req_start = time.time()
                try:
                    response = await self.execute_query(
                        query=request.query,
                        variables=request.variables,
                        operation_name=request.operation_name,
                        auth_required=False  # We're already authenticated if needed
                    )
                    
                    elapsed = time.time() - req_start
                    return {
                        "success": "errors" not in response,
                        "errors": response.get("errors", []),
                        "elapsed_time": elapsed,
                        "timestamp": time.time()
                    }
                except Exception as e:
                    elapsed = time.time() - req_start
                    errors.append(str(e))
                    return {
                        "success": False,
                        "errors": [str(e)],
                        "elapsed_time": elapsed,
                        "timestamp": time.time()
                    }
        
        # Execute requests in parallel
        tasks = [execute_test() for _ in range(num_requests)]
        for result in await asyncio.gather(*tasks):
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
        load_test_results = {
            "query": request.query,
            "variables": request.variables,
            "operation_name": request.operation_name,
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
            },
            "results": results
        }
        
        logger.info(f"Load test completed: {success_rate:.2%} success rate, "
                   f"{load_test_results['requests_per_second']:.2f} req/s, "
                   f"avg response time: {avg_response_time:.4f}s")
        
        return load_test_results
    
    def generate_html_report(self, results: Dict) -> str:
        """Generate HTML report for test results.
        
        Args:
            results: Test results
            
        Returns:
            Path to the HTML report
        """
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        report_path = os.path.join(REPORT_DIR, f"graphql_test_report_{timestamp}.html")
        
        # Create report HTML
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>GraphQL API Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1, h2, h3 {{ color: #333; }}
        .summary {{ 
            display: flex; 
            flex-wrap: wrap; 
            gap: 20px; 
            margin-bottom: 20px; 
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
        }}
        .metric {{ 
            flex: 1; 
            min-width: 200px; 
            text-align: center;
        }}
        .metric-value {{ 
            font-size: 24px; 
            font-weight: bold; 
            margin: 10px 0;
        }}
        .metric-label {{ 
            font-size: 14px; 
            color: #666;
        }}
        .test-card {{ 
            margin-bottom: 20px; 
            border: 1px solid #ddd; 
            border-radius: 5px;
            overflow: hidden;
        }}
        .test-header {{ 
            padding: 10px 20px;
            border-bottom: 1px solid #ddd;
            background-color: #f5f5f5;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .test-title {{ 
            margin: 0;
            font-size: 18px;
        }}
        .test-status {{ 
            padding: 5px 10px;
            border-radius: 3px;
            font-weight: bold;
        }}
        .test-status.success {{ 
            background-color: #dff0d8;
            color: #3c763d;
        }}
        .test-status.failure {{ 
            background-color: #f2dede;
            color: #a94442;
        }}
        .test-body {{ 
            padding: 20px;
        }}
        .test-details {{ 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }}
        .test-query {{ 
            grid-column: 1 / 2;
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 3px;
            white-space: pre-wrap;
            font-family: monospace;
        }}
        .test-response {{ 
            grid-column: 2 / 3;
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 3px;
            white-space: pre-wrap;
            font-family: monospace;
            max-height: 400px;
            overflow: auto;
        }}
        .test-errors {{ 
            grid-column: 1 / 3;
            margin-top: 10px;
            color: #a94442;
        }}
        .error-list {{ 
            list-style-type: none;
            padding-left: 0;
        }}
        .error-list li {{ 
            margin-bottom: 5px;
            padding: 5px 10px;
            background-color: #f2dede;
            border-radius: 3px;
        }}
        .test-duration {{ 
            font-size: 12px;
            color: #777;
            margin-top: 10px;
        }}
        pre {{ 
            margin: 0;
            overflow: auto;
        }}
        .code {{ 
            font-family: monospace;
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 3px;
            overflow: auto;
        }}
        .toggle-button {{
            background: none;
            border: none;
            color: #0275d8;
            cursor: pointer;
            text-decoration: underline;
        }}
    </style>
    <script>
        function toggleDetails(id) {{
            var details = document.getElementById(id);
            if (details.style.display === 'none') {{
                details.style.display = 'grid';
            }} else {{
                details.style.display = 'none';
            }}
        }}
    </script>
</head>
<body>
    <h1>GraphQL API Test Report</h1>
    <div class="summary">
        <div class="metric">
            <div class="metric-label">Total Tests</div>
            <div class="metric-value">{results["tests_total"]}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Passed</div>
            <div class="metric-value" style="color: green">{results["tests_passed"]}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Failed</div>
            <div class="metric-value" style="color: red">{results["tests_failed"]}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Success Rate</div>
            <div class="metric-value" style="color: {
                'green' if results['tests_total'] > 0 and (results['tests_passed'] / results['tests_total']) >= 0.9 else
                'orange' if results['tests_total'] > 0 and (results['tests_passed'] / results['tests_total']) >= 0.7 else
                'red'
            }">
                {f"{(results['tests_passed'] / results['tests_total']) * 100:.1f}%" if results['tests_total'] > 0 else "N/A"}
            </div>
        </div>
    </div>
    
    <div class="test-info">
        <p><strong>API URL:</strong> {results["base_url"]}{results["endpoint"]}</p>
        <p><strong>Timestamp:</strong> {results["timestamp"]}</p>
    </div>
    
    <h2>Test Results</h2>
    """
        
        # Add test cards
        for i, test in enumerate(results["test_results"]):
            success = test.get("success", False)
            description = test.get("description", "Unnamed Test")
            query = test.get("query", "")
            variables = json.dumps(test.get("variables", {}), indent=2)
            response = json.dumps(test.get("response", {}), indent=2) if test.get("response") else "{}"
            duration = test.get("duration_ms", 0)
            errors = test.get("errors", [])
            validation_errors = test.get("validation_errors", [])
            
            html += f"""
    <div class="test-card">
        <div class="test-header">
            <h3 class="test-title">{description}</h3>
            <div class="test-status {'success' if success else 'failure'}">{
                'PASSED' if success else 'FAILED'
            }</div>
        </div>
        <div class="test-body">
            <button class="toggle-button" onclick="toggleDetails('test-details-{i}')">
                {
                    'Hide' if i < 5 else 'Show'  # Show first 5 tests by default
                } Details
            </button>
            <div id="test-details-{i}" class="test-details" style="display: {'grid' if i < 5 else 'none'}">
                <div class="test-query">
                    <strong>Query:</strong>
                    <pre>{query}</pre>
                    
                    <strong>Variables:</strong>
                    <pre>{variables}</pre>
                </div>
                <div class="test-response">
                    <strong>Response:</strong>
                    <pre>{response}</pre>
                </div>
            """
            
            # Add errors if any
            if errors or validation_errors:
                html += f"""
                <div class="test-errors">
                    <strong>Errors:</strong>
                    <ul class="error-list">
                        {
                            ''.join([f'<li>{error}</li>' for error in errors + validation_errors])
                        }
                    </ul>
                </div>
                """
                
            html += f"""
            </div>
            <div class="test-duration">Duration: {duration} ms</div>
        </div>
    </div>
            """
        
        html += """
</body>
</html>
        """
        
        # Write the report file
        with open(report_path, "w") as f:
            f.write(html)
            
        logger.info(f"Report generated: {report_path}")
        return report_path
    
    def generate_load_test_report(self, results: Dict) -> str:
        """Generate HTML report for load test results.
        
        Args:
            results: Load test results
            
        Returns:
            Path to the HTML report
        """
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        report_path = os.path.join(REPORT_DIR, f"graphql_load_test_report_{timestamp}.html")
        
        # Generate response time graph
        graph_path = os.path.join(REPORT_DIR, f"graphql_load_test_graph_{timestamp}.png")
        self.generate_load_test_graph(results, graph_path)
        
        # Create report HTML
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>GraphQL API Load Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1, h2, h3 {{ color: #333; }}
        .summary {{ 
            display: flex; 
            flex-wrap: wrap; 
            gap: 20px; 
            margin-bottom: 20px; 
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
        }}
        .metric {{ 
            flex: 1; 
            min-width: 200px; 
            text-align: center;
        }}
        .metric-value {{ 
            font-size: 24px; 
            font-weight: bold; 
            margin: 10px 0;
        }}
        .metric-label {{ 
            font-size: 14px; 
            color: #666;
        }}
        .card {{ 
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 20px;
        }}
        .graph {{ 
            margin: 20px 0;
            text-align: center;
        }}
        .graph img {{ 
            max-width: 100%;
            border: 1px solid #ddd;
        }}
        table {{ 
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        th, td {{ 
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }}
        th {{ 
            background-color: #f2f2f2;
        }}
        tr:nth-child(even) {{ 
            background-color: #f9f9f9;
        }}
        pre {{ 
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 3px;
            overflow: auto;
        }}
    </style>
</head>
<body>
    <h1>GraphQL API Load Test Report</h1>
    <div class="summary">
        <div class="metric">
            <div class="metric-label">Total Requests</div>
            <div class="metric-value">{results["total_requests"]}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Requests/Second</div>
            <div class="metric-value">{results["requests_per_second"]:.2f}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Success Rate</div>
            <div class="metric-value" style="color: {
                'green' if results['success_rate'] >= 0.95 else
                'orange' if results['success_rate'] >= 0.8 else
                'red'
            }">
                {results["success_rate"] * 100:.1f}%
            </div>
        </div>
        <div class="metric">
            <div class="metric-label">Avg Response Time</div>
            <div class="metric-value">{results["response_time"]["average"] * 1000:.2f} ms</div>
        </div>
    </div>
    
    <div class="card">
        <h2>Test Configuration</h2>
        <div><strong>Concurrency:</strong> {results["concurrency"]}</div>
        <div><strong>Total Duration:</strong> {results["total_time"]:.2f} seconds</div>
        <h3>Query</h3>
        <pre>{results["query"]}</pre>
        
        <h3>Variables</h3>
        <pre>{json.dumps(results["variables"], indent=2)}</pre>
    </div>
    
    <div class="graph">
        <h2>Response Time Distribution</h2>
        <img src="{os.path.basename(graph_path)}" alt="Response Time Graph">
    </div>
    
    <div class="card">
        <h2>Response Time Statistics</h2>
        <table>
            <tr>
                <th>Metric</th>
                <th>Value (ms)</th>
            </tr>
            <tr>
                <td>Minimum</td>
                <td>{results["response_time"]["min"] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>Average</td>
                <td>{results["response_time"]["average"] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>50th Percentile (Median)</td>
                <td>{results["response_time"]["p50"] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>95th Percentile</td>
                <td>{results["response_time"]["p95"] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>99th Percentile</td>
                <td>{results["response_time"]["p99"] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>Maximum</td>
                <td>{results["response_time"]["max"] * 1000:.2f}</td>
            </tr>
        </table>
    </div>
    """
        
        # Add errors section if there are any
        if results["error_count"] > 0:
            html += f"""
    <div class="card">
        <h2>Errors</h2>
        <div><strong>Error Count:</strong> {results["error_count"]} ({results["error_count"] / results["total_requests"] * 100:.1f}%)</div>
        <ul>
            {
                ''.join([f'<li>{error}</li>' for error in results["errors"]])
            }
            {
                f'<li>... and {results["error_count"] - len(results["errors"])} more</li>' if results["error_count"] > len(results["errors"]) else ''
            }
        </ul>
    </div>
            """
            
        html += """
</body>
</html>
        """
        
        # Write the report file
        with open(report_path, "w") as f:
            f.write(html)
            
        logger.info(f"Load test report generated: {report_path}")
        return report_path
    
    def generate_load_test_graph(self, results: Dict, output_path: str) -> None:
        """Generate response time distribution graph for load test.
        
        Args:
            results: Load test results
            output_path: Path to save the graph
        """
        # Extract response times
        response_times = [r["elapsed_time"] * 1000 for r in results["results"]]  # Convert to ms
        
        plt.figure(figsize=(10, 6))
        
        # Response time histogram
        plt.hist(response_times, bins=30, alpha=0.7, color='#4285F4')
        plt.axvline(x=results["response_time"]["p95"] * 1000, color='r', linestyle='--', 
                   label=f'95th Percentile: {results["response_time"]["p95"] * 1000:.2f} ms')
        plt.axvline(x=results["response_time"]["average"] * 1000, color='g', linestyle='-', 
                   label=f'Average: {results["response_time"]["average"] * 1000:.2f} ms')
        
        plt.xlabel('Response Time (ms)')
        plt.ylabel('Frequency')
        plt.title('Response Time Distribution')
        plt.grid(True, alpha=0.3)
        plt.legend()
        
        # Save graph
        plt.tight_layout()
        plt.savefig(output_path)
        plt.close()
        
        logger.info(f"Load test graph generated: {output_path}")
    
    def save_results(self, results: Dict) -> str:
        """Save test results to JSON file.
        
        Args:
            results: Test results
            
        Returns:
            Path to the JSON file
        """
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        results_path = os.path.join(REPORT_DIR, f"graphql_test_results_{timestamp}.json")
        
        with open(results_path, "w") as f:
            json.dump(results, f, indent=2, default=str)
            
        logger.info(f"Results saved to {results_path}")
        return results_path


class GraphQLSchemaValidator:
    """GraphQL schema validation utility."""
    
    @staticmethod
    def validate_schema(schema: Dict) -> Tuple[bool, List[str]]:
        """Validate a GraphQL schema.
        
        Args:
            schema: GraphQL schema from introspection
            
        Returns:
            Tuple of (success, errors)
        """
        success = True
        errors = []
        
        # Basic schema validation
        if not schema.get("queryType"):
            success = False
            errors.append("Schema is missing a query type")
            
        # Validate types
        types = schema.get("types", [])
        for type_obj in types:
            # Skip introspection types
            if type_obj.get("name", "").startswith("__"):
                continue
                
            # Check for description
            if not type_obj.get("description") and type_obj.get("kind") == "OBJECT":
                errors.append(f"Type {type_obj.get('name')} is missing a description")
                
            # Check fields
            fields = type_obj.get("fields", []) or []
            for field in fields:
                if not field.get("description"):
                    errors.append(f"Field {type_obj.get('name')}.{field.get('name')} is missing a description")
                    
                # Check field arguments
                args = field.get("args", []) or []
                for arg in args:
                    if not arg.get("description"):
                        errors.append(f"Argument {type_obj.get('name')}.{field.get('name')}({arg.get('name')}) is missing a description")
        
        return success, errors


async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="GraphQL API Testing Framework")
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Test command
    test_parser = subparsers.add_parser("test", help="Run GraphQL API tests")
    test_parser.add_argument("--url", type=str, default=DEFAULT_SERVER,
                        help=f"Base URL of the API (default: {DEFAULT_SERVER})")
    test_parser.add_argument("--endpoint", type=str, default=GRAPHQL_ENDPOINT,
                        help=f"GraphQL endpoint path (default: {GRAPHQL_ENDPOINT})")
    test_parser.add_argument("--dir", type=str, default=TEST_DIR,
                        help=f"Directory containing test files (default: {TEST_DIR})")
    
    # Schema command
    schema_parser = subparsers.add_parser("schema", help="Validate GraphQL schema")
    schema_parser.add_argument("--url", type=str, default=DEFAULT_SERVER,
                          help=f"Base URL of the API (default: {DEFAULT_SERVER})")
    schema_parser.add_argument("--endpoint", type=str, default=GRAPHQL_ENDPOINT,
                          help=f"GraphQL endpoint path (default: {GRAPHQL_ENDPOINT})")
    
    # Load test command
    load_parser = subparsers.add_parser("load", help="Run GraphQL load tests")
    load_parser.add_argument("--url", type=str, default=DEFAULT_SERVER,
                        help=f"Base URL of the API (default: {DEFAULT_SERVER})")
    load_parser.add_argument("--endpoint", type=str, default=GRAPHQL_ENDPOINT,
                        help=f"GraphQL endpoint path (default: {GRAPHQL_ENDPOINT})")
    load_parser.add_argument("--requests", type=int, default=100,
                        help="Number of requests to make (default: 100)")
    load_parser.add_argument("--concurrency", type=int, default=10,
                        help="Concurrency level (default: 10)")
    load_parser.add_argument("--query", type=str,
                        help="Path to file containing GraphQL query")
    
    args = parser.parse_args()
    
    # Handle commands
    if args.command == "test":
        tester = GraphQLAPITester(
            base_url=args.url,
            graphql_endpoint=args.endpoint
        )
        
        try:
            # Run tests
            results = await tester.run_tests_from_directory(args.dir)
            
            # Save results
            tester.save_results(results)
            
            # Generate report
            report_path = tester.generate_html_report(results)
            
            logger.info(f"Testing completed. Report available at: {report_path}")
            
            # Return success status
            return 0 if results["tests_failed"] == 0 else 1
            
        except Exception as e:
            logger.error(f"Testing failed: {str(e)}")
            return 1
            
    elif args.command == "schema":
        tester = GraphQLAPITester(
            base_url=args.url,
            graphql_endpoint=args.endpoint
        )
        
        try:
            # Run schema validation
            validation = await tester.run_schema_validation()
            
            if validation["success"]:
                logger.info("Schema validation passed!")
                
                # Print schema statistics
                stats = validation["stats"]
                logger.info(f"Schema statistics:")
                logger.info(f"- Total types: {stats['total_types']}")
                logger.info(f"- Object types: {stats['object_types']}")
                logger.info(f"- Scalar types: {stats['scalar_types']}")
                logger.info(f"- Enum types: {stats['enum_types']}")
                logger.info(f"- Interface types: {stats['interface_types']}")
                logger.info(f"- Union types: {stats['union_types']}")
                logger.info(f"- Input types: {stats['input_types']}")
                
                return 0
            else:
                logger.warning("Schema validation failed")
                for error in validation["errors"]:
                    logger.warning(f"- {error}")
                    
                return 1
                
        except Exception as e:
            logger.error(f"Schema validation failed: {str(e)}")
            return 1
            
    elif args.command == "load":
        tester = GraphQLAPITester(
            base_url=args.url,
            graphql_endpoint=args.endpoint
        )
        
        if not args.query:
            logger.error("No query specified for load test")
            return 1
            
        try:
            # Load query from file
            with open(args.query, 'r') as f:
                query_data = json.load(f)
                
            request = GraphQLRequest(
                query=query_data.get("query", ""),
                variables=query_data.get("variables", {}),
                operation_name=query_data.get("operationName"),
                auth_required=query_data.get("auth_required", False),
                role=query_data.get("role", "user")
            )
            
            # Run load test
            results = await tester.run_load_test(
                request=request,
                num_requests=args.requests,
                concurrency=args.concurrency
            )
            
            # Generate report
            report_path = tester.generate_load_test_report(results)
            
            logger.info(f"Load test completed. Report available at: {report_path}")
            
            return 0
            
        except Exception as e:
            logger.error(f"Load test failed: {str(e)}")
            return 1
    
    else:
        parser.print_help()
        
    return 0


if __name__ == "__main__":
    asyncio.run(main())