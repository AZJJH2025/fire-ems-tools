#!/usr/bin/env python3
"""
Performance Testing Script

This script runs performance tests against the Fire-EMS Tools application
to measure response times and system behavior under load.

Usage:
    python test_performance.py [--users NUM] [--runtime SECONDS] [--department CODE]
"""

import os
import sys
import time
import json
import argparse
import random
import requests
import statistics
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import application modules if needed for testing setup
try:
    from app import app
    from database import Department, User, Station, Incident, db
except ImportError:
    print("Warning: Could not import application modules. Running in standalone mode.")
    app = None
    Department = None


class PerformanceTest:
    """Base class for performance tests"""
    
    def __init__(self, base_url, department_code, admin_email, admin_password):
        """Initialize test with base URL and authentication info"""
        self.base_url = base_url.rstrip('/')
        self.department_code = department_code
        self.admin_email = admin_email
        self.admin_password = admin_password
        self.session = requests.Session()
        self.test_metrics = {
            "name": self.__class__.__name__,
            "requests": 0,
            "errors": 0,
            "response_times": [],
            "start_time": None,
            "end_time": None
        }
    
    def login(self):
        """Log in to the application"""
        login_url = f"{self.base_url}/login"
        login_data = {
            "email": self.admin_email,
            "password": self.admin_password
        }
        
        response = self.session.post(login_url, data=login_data)
        return response.status_code == 200 or response.status_code == 302
    
    def run(self, duration_seconds=30):
        """Run the performance test for a specified duration"""
        print(f"Starting {self.__class__.__name__} for {duration_seconds} seconds...")
        
        self.test_metrics["start_time"] = datetime.now()
        end_time = datetime.now() + timedelta(seconds=duration_seconds)
        
        while datetime.now() < end_time:
            try:
                self._execute_test_iteration()
            except Exception as e:
                self.test_metrics["errors"] += 1
                print(f"Error in {self.__class__.__name__}: {str(e)}")
        
        self.test_metrics["end_time"] = datetime.now()
        return self.test_metrics
    
    def _execute_test_iteration(self):
        """Execute a single test iteration (to be implemented by subclasses)"""
        raise NotImplementedError("Subclasses must implement _execute_test_iteration")
    
    def _record_request(self, response_time):
        """Record metrics for a request"""
        self.test_metrics["requests"] += 1
        self.test_metrics["response_times"].append(response_time)
    
    def get_url(self, path):
        """Get a full URL for a path"""
        if path.startswith('/'):
            path = path[1:]
        return f"{self.base_url}/{path}"
    
    def get_department_url(self, path):
        """Get a department-specific URL"""
        if path.startswith('/'):
            path = path[1:]
        return f"{self.base_url}/dept/{self.department_code}/{path}"
    
    def calculate_metrics(self):
        """Calculate performance metrics from test results"""
        times = self.test_metrics["response_times"]
        
        if not times:
            return {
                "name": self.test_metrics["name"],
                "requests": 0,
                "errors": self.test_metrics["errors"],
                "avg_response_time": 0,
                "min_response_time": 0,
                "max_response_time": 0,
                "p95_response_time": 0,
                "requests_per_second": 0
            }
        
        duration = (self.test_metrics["end_time"] - self.test_metrics["start_time"]).total_seconds()
        
        return {
            "name": self.test_metrics["name"],
            "requests": self.test_metrics["requests"],
            "errors": self.test_metrics["errors"],
            "avg_response_time": statistics.mean(times),
            "min_response_time": min(times),
            "max_response_time": max(times),
            "p95_response_time": sorted(times)[int(len(times) * 0.95)],
            "requests_per_second": self.test_metrics["requests"] / duration if duration > 0 else 0
        }


class HomePageLoadTest(PerformanceTest):
    """Test performance of loading the department home page"""
    
    def _execute_test_iteration(self):
        """Load the department home page"""
        url = self.get_department_url('')
        
        start_time = time.time()
        response = self.session.get(url)
        response_time = time.time() - start_time
        
        if response.status_code != 200:
            self.test_metrics["errors"] += 1
        
        self._record_request(response_time)


class IncidentListTest(PerformanceTest):
    """Test performance of loading the incident list"""
    
    def _execute_test_iteration(self):
        """Load the incident list page"""
        url = self.get_department_url('incidents')
        
        start_time = time.time()
        response = self.session.get(url)
        response_time = time.time() - start_time
        
        if response.status_code != 200:
            self.test_metrics["errors"] += 1
        
        self._record_request(response_time)


class IncidentDetailTest(PerformanceTest):
    """Test performance of loading incident details"""
    
    def __init__(self, base_url, department_code, admin_email, admin_password):
        """Initialize with incident IDs"""
        super().__init__(base_url, department_code, admin_email, admin_password)
        self.incident_ids = []
    
    def setup(self):
        """Fetch incident IDs for testing"""
        if not self.login():
            raise Exception("Failed to log in")
            
        url = self.get_department_url('api/incidents')
        response = self.session.get(url)
        
        if response.status_code != 200:
            raise Exception(f"Failed to fetch incidents: {response.status_code}")
            
        try:
            data = response.json()
            self.incident_ids = [incident['id'] for incident in data.get('incidents', [])]
        except:
            # Fallback if the API endpoint is different
            # Try to extract incident IDs from the HTML
            url = self.get_department_url('incidents')
            response = self.session.get(url)
            
            if response.status_code != 200:
                raise Exception("Failed to fetch incident list")
                
            # Extract incident IDs from href attributes
            html = response.text
            import re
            pattern = r'/incidents/(\d+)'
            self.incident_ids = list(set(re.findall(pattern, html)))
        
        if not self.incident_ids:
            raise Exception("No incidents found for testing")
    
    def _execute_test_iteration(self):
        """Load a random incident detail page"""
        if not self.incident_ids:
            self.test_metrics["errors"] += 1
            return
            
        incident_id = random.choice(self.incident_ids)
        url = self.get_department_url(f'incidents/{incident_id}')
        
        start_time = time.time()
        response = self.session.get(url)
        response_time = time.time() - start_time
        
        if response.status_code != 200:
            self.test_metrics["errors"] += 1
        
        self._record_request(response_time)


class CallDensityMapTest(PerformanceTest):
    """Test performance of loading the call density heatmap"""
    
    def _execute_test_iteration(self):
        """Load the call density map page"""
        url = self.get_department_url('call-density')
        
        start_time = time.time()
        response = self.session.get(url)
        response_time = time.time() - start_time
        
        if response.status_code != 200:
            self.test_metrics["errors"] += 1
        
        self._record_request(response_time)


class IncidentCreateTest(PerformanceTest):
    """Test performance of creating incidents"""
    
    def _execute_test_iteration(self):
        """Create a new incident"""
        url = self.get_department_url('incidents/create')
        
        # Generate random incident data
        incident_data = {
            "title": f"Test Incident {random.randint(1000, 9999)}",
            "incident_type": random.choice([
                "Medical Emergency", "Fire Alarm", "Structure Fire", 
                "Vehicle Accident", "Gas Leak"
            ]),
            "location": f"{random.randint(100, 999)} Test Street",
            "latitude": str(37.7749 + random.uniform(-0.1, 0.1)),
            "longitude": str(-122.4194 + random.uniform(-0.1, 0.1)),
            "dispatch_time": datetime.now().isoformat(),
            "status": "active",
            "responding_units": ["1"]
        }
        
        start_time = time.time()
        response = self.session.post(url, data=incident_data)
        response_time = time.time() - start_time
        
        if response.status_code != 200 and response.status_code != 302:
            self.test_metrics["errors"] += 1
        
        self._record_request(response_time)


class ConcurrentUserTest:
    """Test with multiple concurrent users"""
    
    def __init__(self, base_url, department_code, admin_email, admin_password, num_users=10):
        """Initialize with number of concurrent users"""
        self.base_url = base_url
        self.department_code = department_code
        self.admin_email = admin_email
        self.admin_password = admin_password
        self.num_users = num_users
        self.tests = []
        self.results = []
    
    def run(self, duration_seconds=30):
        """Run tests with multiple concurrent users"""
        print(f"Running concurrent user test with {self.num_users} users for {duration_seconds} seconds...")
        
        # Create test instances for each user
        self.tests = []
        for i in range(self.num_users):
            # Alternate between test types
            if i % 5 == 0:
                test = HomePageLoadTest(self.base_url, self.department_code, self.admin_email, self.admin_password)
            elif i % 5 == 1:
                test = IncidentListTest(self.base_url, self.department_code, self.admin_email, self.admin_password)
            elif i % 5 == 2:
                test = CallDensityMapTest(self.base_url, self.department_code, self.admin_email, self.admin_password)
            elif i % 5 == 3:
                test = IncidentDetailTest(self.base_url, self.department_code, self.admin_email, self.admin_password)
                try:
                    test.setup()
                except Exception as e:
                    print(f"Warning: Failed to set up IncidentDetailTest: {str(e)}")
                    test = HomePageLoadTest(self.base_url, self.department_code, self.admin_email, self.admin_password)
            else:
                test = IncidentCreateTest(self.base_url, self.department_code, self.admin_email, self.admin_password)
            
            # Log in each test user
            test.login()
            self.tests.append(test)
        
        # Run tests in parallel
        with ThreadPoolExecutor(max_workers=self.num_users) as executor:
            futures = [executor.submit(test.run, duration_seconds) for test in self.tests]
            self.results = [future.result() for future in futures]
        
        return self.results
    
    def calculate_metrics(self):
        """Calculate aggregated metrics from all tests"""
        if not self.results:
            return {}
            
        # Combine metrics from all tests
        all_response_times = []
        total_requests = 0
        total_errors = 0
        
        for result in self.results:
            all_response_times.extend(result["response_times"])
            total_requests += result["requests"]
            total_errors += result["errors"]
        
        if not all_response_times:
            return {
                "total_users": self.num_users,
                "total_requests": 0,
                "total_errors": total_errors,
                "avg_response_time": 0,
                "min_response_time": 0,
                "max_response_time": 0,
                "p95_response_time": 0,
                "requests_per_second": 0
            }
        
        # Calculate start and end times
        start_time = min(result["start_time"] for result in self.results)
        end_time = max(result["end_time"] for result in self.results)
        duration = (end_time - start_time).total_seconds()
        
        return {
            "total_users": self.num_users,
            "total_requests": total_requests,
            "total_errors": total_errors,
            "avg_response_time": statistics.mean(all_response_times),
            "min_response_time": min(all_response_times),
            "max_response_time": max(all_response_times),
            "p95_response_time": sorted(all_response_times)[int(len(all_response_times) * 0.95)],
            "requests_per_second": total_requests / duration if duration > 0 else 0
        }


def run_tests(args):
    """Run performance tests based on arguments"""
    # Set up test configuration
    base_url = args.url
    department_code = args.department
    
    # Set credentials based on department
    if department_code == 'rural':
        admin_email = 'chief@pinecrestfire.org'
        admin_password = 'rural-admin-pass'
    elif department_code == 'suburban':
        admin_email = 'chief@oakridgefd.gov'
        admin_password = 'suburban-admin-pass'
    elif department_code == 'urban':
        admin_email = 'chief@bayportfire.gov'
        admin_password = 'urban-admin-pass'
    elif department_code == 'regional':
        admin_email = 'director@tricountyems.org'
        admin_password = 'combined-admin-pass'
    else:
        admin_email = args.email
        admin_password = args.password
    
    # Run single user tests first
    test_classes = [
        HomePageLoadTest,
        IncidentListTest,
        CallDensityMapTest
    ]
    
    single_user_results = []
    for test_class in test_classes:
        test = test_class(base_url, department_code, admin_email, admin_password)
        test.login()
        test.run(args.runtime)
        metrics = test.calculate_metrics()
        single_user_results.append(metrics)
        
        print(f"\n{metrics['name']} Results:")
        print(f"  Requests: {metrics['requests']} ({metrics['requests_per_second']:.2f} req/sec)")
        print(f"  Errors: {metrics['errors']}")
        print(f"  Avg Response Time: {metrics['avg_response_time']:.4f} sec")
        print(f"  95th Percentile: {metrics['p95_response_time']:.4f} sec")
    
    # Try to run incident detail test if possible
    try:
        test = IncidentDetailTest(base_url, department_code, admin_email, admin_password)
        test.login()
        test.setup()
        test.run(args.runtime)
        metrics = test.calculate_metrics()
        single_user_results.append(metrics)
        
        print(f"\n{metrics['name']} Results:")
        print(f"  Requests: {metrics['requests']} ({metrics['requests_per_second']:.2f} req/sec)")
        print(f"  Errors: {metrics['errors']}")
        print(f"  Avg Response Time: {metrics['avg_response_time']:.4f} sec")
        print(f"  95th Percentile: {metrics['p95_response_time']:.4f} sec")
    except Exception as e:
        print(f"\nSkipping IncidentDetailTest: {str(e)}")
    
    # Run concurrent user test
    concurrent_test = ConcurrentUserTest(
        base_url, department_code, admin_email, admin_password, 
        num_users=args.users
    )
    concurrent_test.run(args.runtime)
    concurrent_metrics = concurrent_test.calculate_metrics()
    
    print(f"\nConcurrent User Test Results ({args.users} users):")
    print(f"  Total Requests: {concurrent_metrics['total_requests']} ({concurrent_metrics['requests_per_second']:.2f} req/sec)")
    print(f"  Total Errors: {concurrent_metrics['total_errors']}")
    print(f"  Avg Response Time: {concurrent_metrics['avg_response_time']:.4f} sec")
    print(f"  95th Percentile: {concurrent_metrics['p95_response_time']:.4f} sec")
    
    # Save results to file
    results = {
        "timestamp": datetime.now().isoformat(),
        "department": department_code,
        "users": args.users,
        "runtime": args.runtime,
        "single_user_tests": single_user_results,
        "concurrent_user_test": concurrent_metrics
    }
    
    filename = f"performance_results_{department_code}_{args.users}users_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nResults saved to {filename}")


def main():
    """Main function to run performance tests"""
    parser = argparse.ArgumentParser(description='Run performance tests for Fire-EMS Tools')
    parser.add_argument('--url', default='http://localhost:5000', help='Base URL of the application')
    parser.add_argument('--users', type=int, default=5, help='Number of concurrent users for load testing')
    parser.add_argument('--runtime', type=int, default=30, help='Duration of each test in seconds')
    parser.add_argument('--department', default='urban', help='Department code to test')
    parser.add_argument('--email', help='Admin email (if not using default test departments)')
    parser.add_argument('--password', help='Admin password (if not using default test departments)')
    
    args = parser.parse_args()
    
    print(f"Starting performance tests for {args.department} department")
    print(f"URL: {args.url}")
    print(f"Concurrent Users: {args.users}")
    print(f"Test Runtime: {args.runtime} seconds")
    
    run_tests(args)


if __name__ == "__main__":
    main()