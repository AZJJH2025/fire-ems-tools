"""Route Performance Testing

This module provides performance testing for the Flask blueprint routes.
It measures response times and throughput for critical routes.
"""

import unittest
import pytest
import time
import json
import random
import statistics
from concurrent.futures import ThreadPoolExecutor
from flask import Flask, url_for
from datetime import datetime, timedelta

from tests.routes.base import BlueprintTestCase
from database import db, Department, Incident, User, Station


class RoutePerformanceTest:
    """Base class for route performance testing."""
    
    def __init__(self, client, route, num_requests=100, description=None):
        """Initialize with test parameters.
        
        Args:
            client: Flask test client
            route: Route to test (URL path)
            num_requests: Number of requests to make
            description: Human-readable description
        """
        self.client = client
        self.route = route
        self.num_requests = num_requests
        self.description = description or f"Performance test for {route}"
        self.response_times = []
        self.errors = 0
        self.start_time = None
        self.end_time = None
    
    def run(self):
        """Run the performance test."""
        print(f"Starting performance test for {self.route}...")
        self.start_time = time.time()
        
        for i in range(self.num_requests):
            self._execute_request()
            
        self.end_time = time.time()
        print(f"Completed test for {self.route}: {len(self.response_times)} successful requests, {self.errors} errors")
        
        return self.calculate_metrics()
    
    def _execute_request(self):
        """Execute a single request and record metrics."""
        start_time = time.time()
        try:
            response = self.client.get(self.route)
            if response.status_code >= 400:
                self.errors += 1
            else:
                # Record response time in milliseconds
                self.response_times.append((time.time() - start_time) * 1000)
        except Exception as e:
            self.errors += 1
            print(f"Error testing {self.route}: {str(e)}")
    
    def calculate_metrics(self):
        """Calculate performance metrics from test results."""
        if not self.response_times:
            return {
                "route": self.route,
                "description": self.description,
                "requests": self.num_requests,
                "successful_requests": 0,
                "errors": self.errors,
                "error_rate": 1.0 if self.num_requests > 0 else 0,
                "avg_response_time_ms": 0,
                "min_response_time_ms": 0,
                "max_response_time_ms": 0,
                "p95_response_time_ms": 0,
                "median_response_time_ms": 0,
                "stdev_response_time_ms": 0,
                "requests_per_second": 0,
                "duration_seconds": 0
            }
        
        # Calculate statistics
        duration = self.end_time - self.start_time
        successful_requests = len(self.response_times)
        
        # Sort times for percentile calculation
        sorted_times = sorted(self.response_times)
        p95_index = int(successful_requests * 0.95)
        
        # Standard deviation should only be calculated if there is more than one response
        if successful_requests > 1:
            stdev = statistics.stdev(self.response_times)
        else:
            stdev = 0
        
        return {
            "route": self.route,
            "description": self.description,
            "requests": self.num_requests,
            "successful_requests": successful_requests,
            "errors": self.errors,
            "error_rate": self.errors / self.num_requests if self.num_requests > 0 else 0,
            "avg_response_time_ms": statistics.mean(self.response_times) if self.response_times else 0,
            "min_response_time_ms": min(self.response_times) if self.response_times else 0,
            "max_response_time_ms": max(self.response_times) if self.response_times else 0,
            "p95_response_time_ms": sorted_times[p95_index] if p95_index < len(sorted_times) else 0,
            "median_response_time_ms": statistics.median(self.response_times) if self.response_times else 0,
            "stdev_response_time_ms": stdev,
            "requests_per_second": successful_requests / duration if duration > 0 else 0,
            "duration_seconds": duration
        }


class ConcurrentRouteTest:
    """Test a route with concurrent requests."""
    
    def __init__(self, client, route, num_concurrent=10, requests_per_thread=10, description=None):
        """Initialize concurrent test.
        
        Args:
            client: Flask test client
            route: Route to test
            num_concurrent: Number of concurrent threads
            requests_per_thread: Number of requests per thread
            description: Human-readable description
        """
        self.client = client
        self.route = route
        self.num_concurrent = num_concurrent
        self.requests_per_thread = requests_per_thread
        self.description = description or f"Concurrent test for {route}"
        self.results = []
    
    def _thread_task(self):
        """Task executed by each thread."""
        test = RoutePerformanceTest(self.client, self.route, self.requests_per_thread)
        return test.run()
    
    def run(self):
        """Run concurrent test with multiple threads."""
        print(f"Starting concurrent test for {self.route} with {self.num_concurrent} threads...")
        
        with ThreadPoolExecutor(max_workers=self.num_concurrent) as executor:
            futures = [executor.submit(self._thread_task) for _ in range(self.num_concurrent)]
            self.results = [future.result() for future in futures]
        
        print(f"Completed concurrent test for {self.route}")
        return self.calculate_metrics()
    
    def calculate_metrics(self):
        """Calculate aggregated metrics from all threads."""
        if not self.results:
            return {}
        
        # Combine all response times
        all_response_times = []
        for result in self.results:
            # Generate synthetic response times based on the metrics
            # This is needed because we don't have the actual times from each thread
            times = [result["avg_response_time_ms"]] * result["successful_requests"]
            all_response_times.extend(times)
        
        total_requests = sum(result["requests"] for result in self.results)
        successful_requests = sum(result["successful_requests"] for result in self.results)
        total_errors = sum(result["errors"] for result in self.results)
        
        # Calculate overall duration (from first start to last end)
        start_time = min(result.get("start_time", float('inf')) for result in self.results) if self.results else 0
        end_time = max(result.get("end_time", 0) for result in self.results) if self.results else 0
        
        # Use the max duration as the overall duration
        max_duration = max(result["duration_seconds"] for result in self.results) if self.results else 0
        
        return {
            "route": self.route,
            "description": self.description,
            "num_concurrent": self.num_concurrent,
            "requests_per_thread": self.requests_per_thread,
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "total_errors": total_errors,
            "error_rate": total_errors / total_requests if total_requests > 0 else 0,
            "avg_response_time_ms": statistics.mean(all_response_times) if all_response_times else 0,
            "min_response_time_ms": min(result["min_response_time_ms"] for result in self.results) if self.results else 0,
            "max_response_time_ms": max(result["max_response_time_ms"] for result in self.results) if self.results else 0,
            "median_response_time_ms": statistics.median(all_response_times) if all_response_times else 0,
            "p95_response_time_ms": sorted(all_response_times)[int(len(all_response_times) * 0.95)] if all_response_times else 0,
            "requests_per_second": successful_requests / max_duration if max_duration > 0 else 0,
            "duration_seconds": max_duration,
            "thread_results": self.results
        }


@pytest.mark.performance
class TestRoutePerformance(BlueprintTestCase):
    """Test performance of critical routes."""
    
    def setUp(self):
        """Set up the test environment with all blueprints."""
        super().setUp()
        self.setup_test_data()
        
        # Number of requests to make for each test
        self.num_requests = 100
        
        # Routes to test for performance
        self.critical_routes = [
            {
                "route": "/",
                "description": "Home Page",
                "group": "main"
            },
            {
                "route": "/fire-ems-dashboard",
                "description": "Fire EMS Dashboard",
                "group": "dashboards"
            },
            {
                "route": "/call-density-heatmap",
                "description": "Call Density Heatmap",
                "group": "tools"
            },
            {
                "route": "/incident-logger",
                "description": "Incident Logger",
                "group": "tools"
            },
            {
                "route": "/api/incidents",
                "description": "API Incidents Endpoint",
                "group": "api"
            },
            {
                "route": "/api/stations",
                "description": "API Stations Endpoint",
                "group": "api"
            }
        ]
        
        # Set up API mock
        import routes.api
        from tests.routes.test_api_routes import mock_require_api_key
        routes.api.require_api_key = mock_require_api_key
    
    def setup_test_data(self):
        """Create test data in the database."""
        # Create a test department
        dept = Department(
            name="Test Department", 
            code="TEST", 
            api_key="test-api-key", 
            status="active"
        )
        db.session.add(dept)
        
        # Create test stations
        for i in range(3):
            station = Station(
                name=f"Test Station {i+1}", 
                station_number=f"S{i+1}",
                department_id=1, 
                latitude=33.448376 + (i * 0.01), 
                longitude=-112.074036 + (i * 0.01),
                address=f"123 Test St {i+1}",
                status="active"
            )
            db.session.add(station)
        
        # Create test incidents
        for i in range(50):
            incident = Incident(
                incident_number=f"TEST-{i+1}",
                department_id=1,
                station_id=i % 3 + 1,
                latitude=33.448376 + (i * 0.005),
                longitude=-112.074036 + (i * 0.005),
                incident_type="EMS" if i % 2 == 0 else "Fire",
                priority=str(i % 3 + 1),
                status="Closed"
            )
            db.session.add(incident)
        
        db.session.commit()
    
    def test_route_performance(self):
        """Test the performance of critical routes."""
        # Skip this test in normal test runs
        if not pytest.config.getoption("--run-performance", default=False):
            pytest.skip("Performance tests only run with --run-performance flag")
        
        results = []
        
        for route_info in self.critical_routes:
            # Run performance test for route
            test = RoutePerformanceTest(
                self.client,
                route_info["route"],
                self.num_requests,
                route_info["description"]
            )
            metrics = test.run()
            metrics["group"] = route_info["group"]
            results.append(metrics)
            
            # Add a short delay between tests to prevent resource contention
            time.sleep(0.5)
        
        # Save results to file
        self._save_results(results, "route_performance")
    
    def test_concurrent_performance(self):
        """Test performance with concurrent requests."""
        # Skip this test in normal test runs
        if not pytest.config.getoption("--run-performance", default=False):
            pytest.skip("Performance tests only run with --run-performance flag")
        
        results = []
        
        # Test home page with concurrent requests
        home_test = ConcurrentRouteTest(
            self.client,
            "/", 
            num_concurrent=10,
            requests_per_thread=10,
            description="Concurrent Home Page Requests"
        )
        home_results = home_test.run()
        home_results["group"] = "main"
        results.append(home_results)
        
        # Test API incidents endpoint with concurrent requests
        api_test = ConcurrentRouteTest(
            self.client,
            "/api/incidents", 
            num_concurrent=10,
            requests_per_thread=10,
            description="Concurrent API Incidents Requests"
        )
        api_results = api_test.run()
        api_results["group"] = "api"
        results.append(api_results)
        
        # Save results to file
        self._save_results(results, "concurrent_performance")
    
    def _save_results(self, results, test_type):
        """Save test results to file."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"performance_{test_type}_{timestamp}.json"
        
        data = {
            "timestamp": datetime.now().isoformat(),
            "test_type": test_type,
            "results": results
        }
        
        # Create output directory
        import os
        os.makedirs("performance_results", exist_ok=True)
        
        # Save to file
        with open(f"performance_results/{filename}", 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Performance results saved to performance_results/{filename}")
        
        # Also generate a simple report
        self._generate_simple_report(results, test_type, timestamp)
    
    def _generate_simple_report(self, results, test_type, timestamp):
        """Generate a simple text report of performance results."""
        report_lines = [
            f"Performance Test Report: {test_type}",
            f"Timestamp: {timestamp}",
            f"Number of tests: {len(results)}",
            ""
        ]
        
        for i, result in enumerate(results):
            report_lines.extend([
                f"Test #{i+1}: {result.get('description', 'Unknown')} ({result.get('group', 'Unknown')})",
                f"  Route: {result.get('route', 'Unknown')}",
                f"  Requests: {result.get('total_requests', result.get('requests', 'Unknown'))}",
                f"  Success: {result.get('successful_requests', 'Unknown')} ({100 - result.get('error_rate', 0) * 100:.1f}%)",
                f"  Response times (ms):",
                f"    Average: {result.get('avg_response_time_ms', 0):.2f}",
                f"    Median:  {result.get('median_response_time_ms', 0):.2f}",
                f"    95th %:  {result.get('p95_response_time_ms', 0):.2f}",
                f"    Min:     {result.get('min_response_time_ms', 0):.2f}",
                f"    Max:     {result.get('max_response_time_ms', 0):.2f}",
                f"  Throughput: {result.get('requests_per_second', 0):.2f} req/sec",
                ""
            ])
        
        # Add summary
        if results:
            avg_times = [result.get('avg_response_time_ms', 0) for result in results]
            throughputs = [result.get('requests_per_second', 0) for result in results]
            
            report_lines.extend([
                "Summary:",
                f"  Average response time across all tests: {statistics.mean(avg_times):.2f} ms",
                f"  Average throughput across all tests: {statistics.mean(throughputs):.2f} req/sec",
                ""
            ])
        
        # Write report to file
        report_path = f"performance_results/performance_{test_type}_{timestamp}_report.txt"
        with open(report_path, 'w') as f:
            f.write("\n".join(report_lines))
        
        print(f"Performance report saved to {report_path}")


def add_performance_option(parser):
    """Add performance test option to pytest."""
    parser.addoption(
        "--run-performance",
        action="store_true",
        default=False,
        help="Run performance tests"
    )


# Register pytest plugin for adding command line options
pytest.register_pytest_plugin = add_performance_option


if __name__ == '__main__':
    unittest.main()