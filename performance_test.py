#!/usr/bin/env python3
"""
Performance Testing Framework for Fire-EMS Tools

This script provides load testing, stress testing, and performance benchmarking
for the Fire-EMS Tools application.
"""

import argparse
import asyncio
import csv
import json
import logging
import os
import random
import sys
import time
from datetime import datetime, timedelta
from statistics import mean, median, stdev
from typing import Dict, List, Optional, Tuple, Union

import aiohttp
import matplotlib.pyplot as plt
import numpy as np


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('performance_test.log', mode='w')
    ]
)
logger = logging.getLogger('performance_test')


class PerformanceTest:
    """Base class for performance testing."""
    
    def __init__(
        self,
        base_url: str = 'http://localhost:8080',
        num_users: int = 10,
        duration: int = 60,
        ramp_up: int = 5,
        output_dir: str = 'performance_results',
        test_name: str = 'default',
        endpoints: Optional[List[str]] = None
    ):
        """Initialize performance test parameters.
        
        Args:
            base_url: Base URL of the application
            num_users: Number of virtual users
            duration: Test duration in seconds
            ramp_up: Ramp-up time in seconds to gradually add users
            output_dir: Directory to store results
            test_name: Name of the test for reporting
            endpoints: List of endpoints to test (default will test standard endpoints)
        """
        self.base_url = base_url
        self.num_users = num_users
        self.duration = duration
        self.ramp_up = min(ramp_up, duration)
        self.output_dir = output_dir
        self.test_name = test_name
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Default endpoints to test if none provided
        self.endpoints = endpoints or [
            '/',
            '/fire-ems-dashboard',
            '/call-density-heatmap',
            '/station-overview',
            '/incident-logger',
            '/fire-map-pro',
            '/data-formatter'
        ]
        
        # Results storage
        self.results = []
        self.errors = []
        self.start_time = None
        self.end_time = None
        
        logger.info(f"Initialized performance test: {test_name}")
        logger.info(f"Target: {base_url}")
        logger.info(f"Users: {num_users}, Duration: {duration}s, Ramp-up: {ramp_up}s")
    
    @staticmethod
    async def fetch_with_auth(
        session: aiohttp.ClientSession,
        url: str,
        username: str = 'rural_admin',
        password: str = 'rural_admin',
        method: str = 'GET',
        data: Optional[Dict] = None
    ) -> Tuple[float, int, str, float]:
        """Fetch a URL with authentication and measure response time.
        
        Args:
            session: aiohttp session
            url: URL to fetch
            username: Username for auth
            password: Password for auth
            method: HTTP method (GET, POST, etc.)
            data: Data to send for POST/PUT requests
            
        Returns:
            Tuple of (response time, status code, response text, server processing time)
        """
        start_time = time.time()
        server_time = 0
        
        try:
            if method.upper() == 'GET':
                async with session.get(url) as response:
                    text = await response.text()
                    status = response.status
                    if 'X-Process-Time' in response.headers:
                        server_time = float(response.headers['X-Process-Time'])
            elif method.upper() == 'POST':
                async with session.post(url, json=data) as response:
                    text = await response.text()
                    status = response.status
                    if 'X-Process-Time' in response.headers:
                        server_time = float(response.headers['X-Process-Time'])
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            elapsed = time.time() - start_time
            return elapsed, status, text, server_time
            
        except Exception as e:
            elapsed = time.time() - start_time
            logger.error(f"Error fetching {url}: {str(e)}")
            return elapsed, 0, str(e), 0
    
    async def login_user(
        self,
        session: aiohttp.ClientSession,
        username: str = 'rural_admin',
        password: str = 'rural_admin'
    ) -> bool:
        """Login a user and establish session.
        
        Args:
            session: aiohttp session
            username: Username 
            password: Password
            
        Returns:
            True if login successful, False otherwise
        """
        try:
            # First visit the login page to get CSRF token if needed
            login_url = f"{self.base_url}/login"
            async with session.get(login_url) as response:
                text = await response.text()
                
                # Extract CSRF token if present
                csrf_token = None
                if 'csrf_token' in text:
                    import re
                    match = re.search(r'name="csrf_token" value="([^"]+)"', text)
                    if match:
                        csrf_token = match.group(1)
            
            # Now login
            login_data = {
                'username': username,
                'password': password,
                'department': 'rural'  # Assuming department selection is needed
            }
            
            # Add CSRF token if found
            if csrf_token:
                login_data['csrf_token'] = csrf_token
                
            async with session.post(login_url, data=login_data, allow_redirects=True) as response:
                return response.status == 200 and '/dashboard' in str(response.url)
                
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return False
    
    async def simulate_user(self, user_id: int, delay: float = 0):
        """Simulate a single user's activity.
        
        Args:
            user_id: Unique ID for this user
            delay: Delay before starting this user (for ramp-up)
        """
        if delay > 0:
            await asyncio.sleep(delay)
            
        logger.info(f"Starting user {user_id}")
        user_results = []
        user_start_time = time.time()
        
        async with aiohttp.ClientSession(
            cookies={"_samesite_flag": "true"}, 
            connector=aiohttp.TCPConnector(ssl=False)
        ) as session:
            # Login
            is_logged_in = await self.login_user(session)
            if not is_logged_in:
                self.errors.append({
                    'user_id': user_id,
                    'time': time.time() - self.start_time,
                    'error': 'Login failed',
                    'endpoint': '/login'
                })
                logger.error(f"User {user_id} login failed")
                return
                
            # Stay active until test duration expires
            while time.time() - user_start_time < self.duration:
                # Choose a random endpoint to visit
                endpoint = random.choice(self.endpoints)
                url = f"{self.base_url}{endpoint}"
                
                # Perform request and record results
                elapsed, status, content, server_time = await self.fetch_with_auth(session, url)
                
                timestamp = time.time() - self.start_time
                result = {
                    'user_id': user_id,
                    'timestamp': timestamp,
                    'elapsed_time': elapsed,
                    'server_time': server_time,
                    'status': status,
                    'endpoint': endpoint,
                    'content_length': len(content) if isinstance(content, str) else 0
                }
                
                user_results.append(result)
                
                # If error occurred
                if status < 200 or status >= 400:
                    self.errors.append({
                        'user_id': user_id,
                        'time': timestamp,
                        'error': f"HTTP {status}",
                        'endpoint': endpoint
                    })
                
                # Random pause between requests (0.5-3 seconds)
                await asyncio.sleep(random.uniform(0.5, 3))
                
        self.results.extend(user_results)
        logger.info(f"User {user_id} completed with {len(user_results)} requests")
    
    async def run_test(self):
        """Run the performance test with all simulated users."""
        self.results = []
        self.errors = []
        self.start_time = time.time()
        
        logger.info(f"Starting performance test with {self.num_users} users")
        
        # Create user simulation tasks with appropriate delays for ramp-up
        tasks = []
        for i in range(self.num_users):
            # Calculate delay for user start if ramp_up is specified
            delay = 0
            if self.ramp_up > 0:
                delay = (i / self.num_users) * self.ramp_up
                
            task = asyncio.create_task(self.simulate_user(i, delay))
            tasks.append(task)
            
        # Wait for all users to complete
        await asyncio.gather(*tasks)
        
        self.end_time = time.time()
        logger.info(f"Performance test completed in {self.end_time - self.start_time:.2f} seconds")
    
    def analyze_results(self) -> Dict:
        """Analyze test results and return metrics.
        
        Returns:
            Dictionary of performance metrics
        """
        if not self.results:
            logger.warning("No results to analyze")
            return {}
            
        # Calculate overall metrics
        response_times = [r['elapsed_time'] for r in self.results]
        server_times = [r['server_time'] for r in self.results if r['server_time'] > 0]
        
        # Group by endpoint
        endpoints = {}
        for r in self.results:
            endpoint = r['endpoint']
            if endpoint not in endpoints:
                endpoints[endpoint] = []
            endpoints[endpoint].append(r['elapsed_time'])
            
        # Calculate percentiles
        percentiles = {
            '50th': np.percentile(response_times, 50),
            '90th': np.percentile(response_times, 90),
            '95th': np.percentile(response_times, 95),
            '99th': np.percentile(response_times, 99)
        }
        
        # Calculate metrics by endpoint
        endpoint_metrics = {}
        for endpoint, times in endpoints.items():
            endpoint_metrics[endpoint] = {
                'count': len(times),
                'min': min(times),
                'max': max(times),
                'mean': mean(times),
                'median': median(times),
                'p95': np.percentile(times, 95)
            }
            
        # Calculate error rate
        error_rate = len(self.errors) / len(self.results) if self.results else 0
            
        # Assemble overall metrics
        metrics = {
            'test_name': self.test_name,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'duration': self.end_time - self.start_time if self.end_time else 0,
            'num_users': self.num_users,
            'total_requests': len(self.results),
            'requests_per_second': len(self.results) / (self.end_time - self.start_time) if self.end_time else 0,
            'error_count': len(self.errors),
            'error_rate': error_rate,
            'response_time': {
                'min': min(response_times),
                'max': max(response_times),
                'mean': mean(response_times),
                'median': median(response_times),
                'stdev': stdev(response_times) if len(response_times) > 1 else 0
            },
            'server_time': {
                'min': min(server_times) if server_times else 0,
                'max': max(server_times) if server_times else 0,
                'mean': mean(server_times) if server_times else 0,
                'median': median(server_times) if server_times else 0
            },
            'percentiles': percentiles,
            'endpoints': endpoint_metrics
        }
        
        return metrics
    
    def save_results(self, metrics: Dict):
        """Save test results to files.
        
        Args:
            metrics: Performance metrics from analyze_results()
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        base_filename = f"{self.output_dir}/{self.test_name}_{timestamp}"
        
        # Save raw results as CSV
        with open(f"{base_filename}_raw.csv", 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=self.results[0].keys() if self.results else [])
            writer.writeheader()
            writer.writerows(self.results)
            
        # Save errors as CSV
        if self.errors:
            with open(f"{base_filename}_errors.csv", 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=self.errors[0].keys())
                writer.writeheader()
                writer.writerows(self.errors)
                
        # Save metrics as JSON
        with open(f"{base_filename}_metrics.json", 'w') as f:
            json.dump(metrics, f, indent=2, default=str)
            
        # Generate graphs
        self.generate_graphs(base_filename, metrics)
        
        # Generate HTML report
        self.generate_html_report(base_filename, metrics)
        
        logger.info(f"Results saved to {base_filename}_*.csv/json")
    
    def generate_graphs(self, base_filename: str, metrics: Dict):
        """Generate performance graphs from results.
        
        Args:
            base_filename: Base filename for saving graphs
            metrics: Performance metrics
        """
        if not self.results:
            return
            
        # Response time over time
        plt.figure(figsize=(12, 6))
        timestamps = [r['timestamp'] for r in self.results]
        response_times = [r['elapsed_time'] for r in self.results]
        plt.scatter(timestamps, response_times, alpha=0.5)
        plt.xlabel('Time (seconds)')
        plt.ylabel('Response Time (seconds)')
        plt.title('Response Time over Test Duration')
        plt.grid(True)
        plt.savefig(f"{base_filename}_response_time.png")
        
        # Response time histogram
        plt.figure(figsize=(10, 6))
        plt.hist(response_times, bins=30, alpha=0.7)
        plt.xlabel('Response Time (seconds)')
        plt.ylabel('Frequency')
        plt.title('Response Time Distribution')
        plt.grid(True)
        plt.savefig(f"{base_filename}_histogram.png")
        
        # Response time by endpoint
        plt.figure(figsize=(12, 8))
        endpoint_data = []
        endpoint_names = []
        
        for endpoint, data in metrics['endpoints'].items():
            endpoint_names.append(endpoint)
            endpoint_data.append([data['min'], data['median'], data['mean'], data['p95'], data['max']])
            
        endpoint_data = np.array(endpoint_data).T
        
        # Check if there's data to plot
        if len(endpoint_names) > 0:
            positions = np.arange(len(endpoint_names))
            fig, ax = plt.subplots(figsize=(12, 8))
            
            # Create box plot
            bp = ax.boxplot(
                [times for endpoint, times in metrics['endpoints'].items()],
                labels=endpoint_names,
                showfliers=True,
                patch_artist=True
            )
            
            # Customize box plot
            for box in bp['boxes']:
                box.set(facecolor='lightblue')
                
            plt.xticks(rotation=45, ha='right')
            plt.xlabel('Endpoint')
            plt.ylabel('Response Time (seconds)')
            plt.title('Response Time by Endpoint')
            plt.grid(True, axis='y')
            plt.tight_layout()
            plt.savefig(f"{base_filename}_by_endpoint.png")
        
        # Concurrent users over time
        plt.figure(figsize=(10, 6))
        user_times = {}
        for r in self.results:
            user_id = r['user_id']
            timestamp = r['timestamp']
            if user_id not in user_times:
                user_times[user_id] = []
            user_times[user_id].append(timestamp)
            
        # Count active users at each time point
        time_points = np.linspace(0, max(timestamps), 100)
        active_users = []
        
        for t in time_points:
            count = sum(1 for user_id, times in user_times.items() if any(t >= times[0]))
            active_users.append(count)
            
        plt.plot(time_points, active_users)
        plt.xlabel('Time (seconds)')
        plt.ylabel('Active Users')
        plt.title('Concurrent Users over Time')
        plt.grid(True)
        plt.savefig(f"{base_filename}_concurrent_users.png")
    
    def generate_html_report(self, base_filename: str, metrics: Dict):
        """Generate HTML report from results.
        
        Args:
            base_filename: Base filename for the report
            metrics: Performance metrics
        """
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Report: {self.test_name}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1, h2, h3 {{ color: #333; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        .summary {{ display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }}
        .metric-card {{ background: #f5f5f5; border-radius: 5px; padding: 15px; flex: 1; min-width: 200px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .metric-value {{ font-size: 24px; font-weight: bold; margin: 10px 0; }}
        .metric-title {{ font-size: 14px; color: #666; }}
        table {{ border-collapse: collapse; width: 100%; margin-bottom: 20px; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
        tr:nth-child(even) {{ background-color: #f9f9f9; }}
        .graph {{ margin: 20px 0; }}
        .graph img {{ max-width: 100%; height: auto; border: 1px solid #ddd; }}
        .success {{ color: green; }}
        .warning {{ color: orange; }}
        .error {{ color: red; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Performance Test Report</h1>
        <div class="test-info">
            <p><strong>Test Name:</strong> {self.test_name}</p>
            <p><strong>Start Time:</strong> {datetime.fromtimestamp(metrics['start_time'])}</p>
            <p><strong>Duration:</strong> {metrics['duration']:.2f} seconds</p>
            <p><strong>Target URL:</strong> {self.base_url}</p>
            <p><strong>Virtual Users:</strong> {self.num_users}</p>
        </div>
        
        <div class="summary">
            <div class="metric-card">
                <div class="metric-title">Total Requests</div>
                <div class="metric-value">{metrics['total_requests']}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Requests Per Second</div>
                <div class="metric-value">{metrics['requests_per_second']:.2f}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Average Response Time</div>
                <div class="metric-value">{metrics['response_time']['mean'] * 1000:.0f} ms</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">95th Percentile</div>
                <div class="metric-value">{metrics['percentiles']['95th'] * 1000:.0f} ms</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Error Rate</div>
                <div class="metric-value {
                    'success' if metrics['error_rate'] < 0.01 else 
                    'warning' if metrics['error_rate'] < 0.05 else 
                    'error'
                }">{metrics['error_rate']*100:.2f}%</div>
            </div>
        </div>
        
        <h2>Response Time Summary</h2>
        <table>
            <tr>
                <th>Metric</th>
                <th>Value (ms)</th>
            </tr>
            <tr>
                <td>Minimum</td>
                <td>{metrics['response_time']['min'] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>Maximum</td>
                <td>{metrics['response_time']['max'] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>Mean</td>
                <td>{metrics['response_time']['mean'] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>Median (50th Percentile)</td>
                <td>{metrics['response_time']['median'] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>90th Percentile</td>
                <td>{metrics['percentiles']['90th'] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>95th Percentile</td>
                <td>{metrics['percentiles']['95th'] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>99th Percentile</td>
                <td>{metrics['percentiles']['99th'] * 1000:.2f}</td>
            </tr>
            <tr>
                <td>Standard Deviation</td>
                <td>{metrics['response_time']['stdev'] * 1000:.2f}</td>
            </tr>
        </table>
        
        <h2>Endpoint Performance</h2>
        <table>
            <tr>
                <th>Endpoint</th>
                <th>Count</th>
                <th>Min (ms)</th>
                <th>Mean (ms)</th>
                <th>Median (ms)</th>
                <th>95th (ms)</th>
                <th>Max (ms)</th>
            </tr>
            {''.join([
                f"<tr><td>{endpoint}</td><td>{data['count']}</td><td>{data['min']*1000:.2f}</td><td>{data['mean']*1000:.2f}</td><td>{data['median']*1000:.2f}</td><td>{data['p95']*1000:.2f}</td><td>{data['max']*1000:.2f}</td></tr>"
                for endpoint, data in metrics['endpoints'].items()
            ])}
        </table>
        
        <h2>Graphs</h2>
        <div class="graph">
            <h3>Response Time over Test Duration</h3>
            <img src="{os.path.basename(base_filename)}_response_time.png" alt="Response Time Graph">
        </div>
        
        <div class="graph">
            <h3>Response Time Distribution</h3>
            <img src="{os.path.basename(base_filename)}_histogram.png" alt="Response Time Histogram">
        </div>
        
        <div class="graph">
            <h3>Response Time by Endpoint</h3>
            <img src="{os.path.basename(base_filename)}_by_endpoint.png" alt="Response Time by Endpoint">
        </div>
        
        <div class="graph">
            <h3>Concurrent Users over Time</h3>
            <img src="{os.path.basename(base_filename)}_concurrent_users.png" alt="Concurrent Users">
        </div>
        
        <h2>Error Summary</h2>
        {f"<p>No errors occurred during the test.</p>" if not self.errors else f"""
        <p>Total errors: {len(self.errors)} ({metrics['error_rate']*100:.2f}%)</p>
        <table>
            <tr>
                <th>User ID</th>
                <th>Time (s)</th>
                <th>Endpoint</th>
                <th>Error</th>
            </tr>
            {''.join([
                f"<tr><td>{e['user_id']}</td><td>{e['time']:.2f}</td><td>{e['endpoint']}</td><td>{e['error']}</td></tr>"
                for e in self.errors[:100]  # Show at most 100 errors
            ])}
            {f"<tr><td colspan='4'>... and {len(self.errors) - 100} more errors</td></tr>" if len(self.errors) > 100 else ""}
        </table>
        """}
    </div>
</body>
</html>
"""
        
        with open(f"{base_filename}_report.html", 'w') as f:
            f.write(html)
            
        logger.info(f"HTML report generated: {base_filename}_report.html")


class LoadTest(PerformanceTest):
    """Load testing to measure system behavior under expected load."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, test_name=kwargs.get('test_name', 'load_test'), **kwargs)
        
    async def run_test(self):
        """Run load test with expected load."""
        logger.info(f"Starting load test with {self.num_users} users")
        await super().run_test()
        
    def analyze_results(self):
        """Analyze load test results."""
        metrics = super().analyze_results()
        
        # Add additional load test specific metrics
        if metrics:
            metrics['test_type'] = 'load_test'
            metrics['thresholds'] = {
                'avg_response_time': {
                    'threshold': 1.0,  # seconds
                    'actual': metrics['response_time']['mean'],
                    'passed': metrics['response_time']['mean'] < 1.0
                },
                'error_rate': {
                    'threshold': 0.01,  # 1%
                    'actual': metrics['error_rate'],
                    'passed': metrics['error_rate'] < 0.01
                },
                'p95_response_time': {
                    'threshold': 2.0,  # seconds
                    'actual': metrics['percentiles']['95th'],
                    'passed': metrics['percentiles']['95th'] < 2.0
                }
            }
            
        return metrics


class StressTest(PerformanceTest):
    """Stress testing to find breaking points."""
    
    def __init__(
        self, 
        *args, 
        max_users: int = 100,
        step_users: int = 10,
        step_duration: int = 60,
        **kwargs
    ):
        """Initialize stress test.
        
        Args:
            max_users: Maximum number of concurrent users
            step_users: Users to add in each step
            step_duration: Duration of each step in seconds
        """
        # Start with a small number of users
        kwargs['num_users'] = step_users
        kwargs['duration'] = step_duration
        kwargs['test_name'] = kwargs.get('test_name', 'stress_test')
        
        super().__init__(*args, **kwargs)
        
        self.max_users = max_users
        self.step_users = step_users
        self.step_duration = step_duration
        self.step_results = []
        
    async def run_test(self):
        """Run incremental stress test."""
        logger.info(f"Starting stress test with initial users: {self.step_users}, "
                    f"max users: {self.max_users}, step size: {self.step_users}")
        
        current_users = self.step_users
        
        while current_users <= self.max_users:
            logger.info(f"Stress test step: {current_users} users")
            
            # Set current number of users
            self.num_users = current_users
            self.duration = self.step_duration
            
            # Run test with current user count
            await super().run_test()
            
            # Analyze this step
            metrics = super().analyze_results()
            metrics['users'] = current_users
            
            # Determine if system has broken under this load
            broken = False
            if metrics and (
                metrics['error_rate'] > 0.05 or  # More than 5% errors
                metrics['percentiles']['95th'] > 3.0 or  # 95th percentile > 3 seconds
                metrics['response_time']['mean'] > 2.0  # Average response time > 2 seconds
            ):
                logger.warning(f"System shows signs of breaking at {current_users} users")
                broken = True
                
            # Save step results
            step_result = {
                'users': current_users,
                'metrics': metrics,
                'broken': broken
            }
            self.step_results.append(step_result)
            
            # If system has broken, stop adding more load
            if broken:
                logger.info(f"Stopping stress test at {current_users} users due to performance issues")
                break
                
            # Increment users for next step
            current_users += self.step_users
            
            # Brief pause between steps
            await asyncio.sleep(5)
            
        logger.info(f"Stress test completed with {len(self.step_results)} steps")
        
    def analyze_results(self):
        """Analyze stress test results across all steps."""
        if not self.step_results:
            logger.warning("No step results to analyze")
            return {}
            
        # Calculate max acceptable users
        max_stable_users = 0
        breaking_point = None
        
        for step in self.step_results:
            if not step['broken']:
                max_stable_users = step['users']
            else:
                breaking_point = step['users']
                break
                
        # If we never broke the system, the breaking point is higher than our max tested users
        if breaking_point is None:
            breaking_point = self.max_users + self.step_users
            logger.info(f"System did not break under maximum tested load ({self.max_users} users)")
            
        metrics = {
            'test_type': 'stress_test',
            'max_users_tested': self.step_results[-1]['users'],
            'max_stable_users': max_stable_users,
            'breaking_point': breaking_point,
            'steps': self.step_results
        }
        
        return metrics
        
    def save_results(self, metrics):
        """Save stress test results."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        base_filename = f"{self.output_dir}/{self.test_name}_{timestamp}"
        
        # Save overall metrics as JSON
        with open(f"{base_filename}_metrics.json", 'w') as f:
            json.dump(metrics, f, indent=2, default=str)
            
        # Save step results as CSV
        with open(f"{base_filename}_steps.csv", 'w', newline='') as f:
            fieldnames = ['users', 'requests', 'avg_response_time', 'p95_response_time', 'error_rate', 'broken']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for step in metrics['steps']:
                m = step['metrics']
                writer.writerow({
                    'users': step['users'],
                    'requests': m['total_requests'],
                    'avg_response_time': m['response_time']['mean'],
                    'p95_response_time': m['percentiles']['95th'],
                    'error_rate': m['error_rate'],
                    'broken': step['broken']
                })
                
        # Generate scalability graph
        plt.figure(figsize=(12, 8))
        
        # Extract data for plotting
        users = [step['users'] for step in metrics['steps']]
        avg_times = [step['metrics']['response_time']['mean'] for step in metrics['steps']]
        p95_times = [step['metrics']['percentiles']['95th'] for step in metrics['steps']]
        error_rates = [step['metrics']['error_rate'] * 100 for step in metrics['steps']]
        
        # Plot response times
        fig, ax1 = plt.subplots(figsize=(12, 6))
        
        color = 'tab:blue'
        ax1.set_xlabel('Number of Users')
        ax1.set_ylabel('Response Time (seconds)', color=color)
        ax1.plot(users, avg_times, marker='o', linestyle='-', color=color, label='Avg Response Time')
        ax1.plot(users, p95_times, marker='s', linestyle='--', color='tab:cyan', label='95th Percentile')
        ax1.tick_params(axis='y', labelcolor=color)
        ax1.grid(True)
        
        # Plot error rates on second y-axis
        ax2 = ax1.twinx()
        color = 'tab:red'
        ax2.set_ylabel('Error Rate (%)', color=color)
        ax2.plot(users, error_rates, marker='x', linestyle='-.', color=color, label='Error Rate')
        ax2.tick_params(axis='y', labelcolor=color)
        
        # Add breaking point vertical line
        if metrics['breaking_point'] <= self.max_users:
            plt.axvline(x=metrics['breaking_point'], color='red', linestyle='--', 
                         label=f"Breaking Point: {metrics['breaking_point']} users")
        
        # Combine legends
        lines1, labels1 = ax1.get_legend_handles_labels()
        lines2, labels2 = ax2.get_legend_handles_labels()
        ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')
        
        plt.title('System Scalability: Response Time and Error Rate vs. User Load')
        plt.tight_layout()
        plt.savefig(f"{base_filename}_scalability.png")
        
        # Generate HTML report
        self.generate_stress_html_report(base_filename, metrics)
        
        logger.info(f"Stress test results saved to {base_filename}_*")
            
    def generate_stress_html_report(self, base_filename, metrics):
        """Generate HTML report for stress test.
        
        Args:
            base_filename: Base filename for the report
            metrics: Stress test metrics
        """
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Stress Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1, h2, h3 {{ color: #333; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        .summary {{ display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }}
        .metric-card {{ background: #f5f5f5; border-radius: 5px; padding: 15px; flex: 1; min-width: 200px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .metric-value {{ font-size: 24px; font-weight: bold; margin: 10px 0; }}
        .metric-title {{ font-size: 14px; color: #666; }}
        table {{ border-collapse: collapse; width: 100%; margin-bottom: 20px; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
        tr:nth-child(even) {{ background-color: #f9f9f9; }}
        .graph {{ margin: 20px 0; }}
        .graph img {{ max-width: 100%; height: auto; border: 1px solid #ddd; }}
        .success {{ color: green; }}
        .warning {{ color: orange; }}
        .error {{ color: red; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Stress Test Report</h1>
        <div class="test-info">
            <p><strong>Test Name:</strong> {self.test_name}</p>
            <p><strong>Target URL:</strong> {self.base_url}</p>
            <p><strong>Maximum Users Tested:</strong> {metrics['max_users_tested']}</p>
            <p><strong>Step Size:</strong> {self.step_users} users</p>
            <p><strong>Step Duration:</strong> {self.step_duration} seconds</p>
        </div>
        
        <div class="summary">
            <div class="metric-card">
                <div class="metric-title">Max Stable Users</div>
                <div class="metric-value">{metrics['max_stable_users']}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Breaking Point</div>
                <div class="metric-value">
                    {metrics['breaking_point'] if metrics['breaking_point'] <= self.max_users 
                     else f">= {self.max_users}"}
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-title">System Capacity Rating</div>
                <div class="metric-value {
                    'success' if metrics['max_stable_users'] >= 50 else 
                    'warning' if metrics['max_stable_users'] >= 20 else 
                    'error'
                }">
                    {
                        "Excellent" if metrics['max_stable_users'] >= 50 else
                        "Good" if metrics['max_stable_users'] >= 30 else
                        "Average" if metrics['max_stable_users'] >= 20 else
                        "Poor"
                    }
                </div>
            </div>
        </div>
        
        <h2>Scalability Graph</h2>
        <div class="graph">
            <img src="{os.path.basename(base_filename)}_scalability.png" alt="Scalability Graph">
        </div>
        
        <h2>Test Steps</h2>
        <table>
            <tr>
                <th>Users</th>
                <th>Requests</th>
                <th>Avg Response Time (ms)</th>
                <th>95th Percentile (ms)</th>
                <th>Error Rate</th>
                <th>Status</th>
            </tr>
            {''.join([
                f"""<tr>
                    <td>{step['users']}</td>
                    <td>{step['metrics']['total_requests']}</td>
                    <td>{step['metrics']['response_time']['mean'] * 1000:.2f}</td>
                    <td>{step['metrics']['percentiles']['95th'] * 1000:.2f}</td>
                    <td>{step['metrics']['error_rate'] * 100:.2f}%</td>
                    <td class="{
                        'error' if step['broken'] else 'success'
                    }">{
                        'Failed' if step['broken'] else 'Passed'
                    }</td>
                </tr>"""
                for step in metrics['steps']
            ])}
        </table>
        
        <h2>Conclusions</h2>
        <p>Based on the stress test results, the system can handle up to <strong>{metrics['max_stable_users']}</strong> concurrent users while maintaining acceptable performance.</p>
        
        {f"""<p>The system showed signs of stress at <strong>{metrics['breaking_point']}</strong> concurrent users, exhibiting increased response times and error rates.</p>""" 
          if metrics['breaking_point'] <= self.max_users else
         f"""<p>The system maintained acceptable performance throughout all test steps up to <strong>{self.max_users}</strong> concurrent users.</p>"""}
        
        <p>Recommendations:</p>
        <ul>
            {"<li>The application can comfortably support the expected user load.</li>" 
             if metrics['max_stable_users'] >= 30 else
             "<li>Consider performance optimizations to improve capacity.</li>"}
            {"<li>Implement load balancing to distribute traffic if user count is expected to exceed the breaking point.</li>"
             if metrics['breaking_point'] <= self.max_users else ""}
            {"<li>Set up monitoring alerts when active users approach " + str(int(metrics['max_stable_users'] * 0.8)) + ".</li>"}
        </ul>
    </div>
</body>
</html>
"""
        
        with open(f"{base_filename}_report.html", 'w') as f:
            f.write(html)
            
        logger.info(f"Stress test HTML report generated: {base_filename}_report.html")


class EndpointPerformanceTest(PerformanceTest):
    """Test performance of specific endpoints."""
    
    def __init__(self, *args, target_endpoints=None, requests_per_endpoint=100, **kwargs):
        """Initialize endpoint performance test.
        
        Args:
            target_endpoints: List of specific endpoints to test
            requests_per_endpoint: Number of requests to make per endpoint
        """
        kwargs['test_name'] = kwargs.get('test_name', 'endpoint_performance')
        super().__init__(*args, **kwargs)
        
        # Override endpoints with target endpoints if provided
        self.endpoints = target_endpoints or self.endpoints
        self.requests_per_endpoint = requests_per_endpoint
        
    async def simulate_user(self, user_id, delay=0):
        """Override user simulation to test each endpoint systematically."""
        if delay > 0:
            await asyncio.sleep(delay)
            
        logger.info(f"Starting user {user_id} for endpoint testing")
        user_results = []
        
        async with aiohttp.ClientSession(cookies={"_samesite_flag": "true"}) as session:
            # Login
            is_logged_in = await self.login_user(session)
            if not is_logged_in:
                self.errors.append({
                    'user_id': user_id,
                    'time': time.time() - self.start_time,
                    'error': 'Login failed',
                    'endpoint': '/login'
                })
                logger.error(f"User {user_id} login failed")
                return
                
            # Test each endpoint systematically
            for endpoint in self.endpoints:
                url = f"{self.base_url}{endpoint}"
                
                # Calculate how many requests this user should make to this endpoint
                # Distribute requests evenly among users
                user_requests = self.requests_per_endpoint // self.num_users
                if user_id < (self.requests_per_endpoint % self.num_users):
                    user_requests += 1
                    
                logger.info(f"User {user_id} testing endpoint {endpoint} with {user_requests} requests")
                
                for i in range(user_requests):
                    elapsed, status, content, server_time = await self.fetch_with_auth(session, url)
                    
                    timestamp = time.time() - self.start_time
                    result = {
                        'user_id': user_id,
                        'timestamp': timestamp,
                        'elapsed_time': elapsed,
                        'server_time': server_time,
                        'status': status,
                        'endpoint': endpoint,
                        'content_length': len(content) if isinstance(content, str) else 0
                    }
                    
                    user_results.append(result)
                    
                    # If error occurred
                    if status < 200 or status >= 400:
                        self.errors.append({
                            'user_id': user_id,
                            'time': timestamp,
                            'error': f"HTTP {status}",
                            'endpoint': endpoint
                        })
                    
                    # Small pause between requests to the same endpoint
                    await asyncio.sleep(random.uniform(0.1, 0.5))
                
        self.results.extend(user_results)
        logger.info(f"User {user_id} completed endpoint testing with {len(user_results)} requests")


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Performance testing for Fire-EMS Tools')
    
    parser.add_argument('--url', type=str, default='http://localhost:8080',
                        help='Base URL of the application (default: http://localhost:8080)')
    parser.add_argument('--type', type=str, choices=['load', 'stress', 'endpoint'], 
                        default='load', help='Type of performance test to run')
    parser.add_argument('--users', type=int, default=10,
                        help='Number of concurrent users (default: 10)')
    parser.add_argument('--duration', type=int, default=60,
                        help='Test duration in seconds (default: 60)')
    parser.add_argument('--ramp-up', type=int, default=5,
                        help='Ramp-up time in seconds (default: 5)')
    parser.add_argument('--output-dir', type=str, default='performance_results',
                        help='Directory to store results (default: performance_results)')
    parser.add_argument('--test-name', type=str, 
                        help='Name of the test for reporting (default: derived from type)')
    
    # Stress test specific arguments
    parser.add_argument('--max-users', type=int, default=100,
                        help='Maximum number of users for stress test (default: 100)')
    parser.add_argument('--step-users', type=int, default=10,
                        help='Users to add in each step for stress test (default: 10)')
    parser.add_argument('--step-duration', type=int, default=30,
                        help='Duration of each step in seconds for stress test (default: 30)')
    
    # Endpoint test specific arguments
    parser.add_argument('--endpoints', type=str, nargs='+',
                        help='Specific endpoints to test (default: all major endpoints)')
    parser.add_argument('--requests-per-endpoint', type=int, default=100,
                        help='Number of requests per endpoint (default: 100)')
    
    return parser.parse_args()


async def main():
    """Main entry point."""
    args = parse_args()
    
    if args.type == 'load':
        # Create and run load test
        test = LoadTest(
            base_url=args.url,
            num_users=args.users,
            duration=args.duration,
            ramp_up=args.ramp_up,
            output_dir=args.output_dir,
            test_name=args.test_name or 'load_test'
        )
    elif args.type == 'stress':
        # Create and run stress test
        test = StressTest(
            base_url=args.url,
            max_users=args.max_users,
            step_users=args.step_users,
            step_duration=args.step_duration,
            output_dir=args.output_dir,
            test_name=args.test_name or 'stress_test'
        )
    elif args.type == 'endpoint':
        # Create and run endpoint performance test
        test = EndpointPerformanceTest(
            base_url=args.url,
            num_users=args.users,
            duration=args.duration,
            ramp_up=args.ramp_up,
            output_dir=args.output_dir,
            test_name=args.test_name or 'endpoint_performance',
            target_endpoints=args.endpoints,
            requests_per_endpoint=args.requests_per_endpoint
        )
    else:
        logger.error(f"Unknown test type: {args.type}")
        return 1
        
    try:
        await test.run_test()
        metrics = test.analyze_results()
        test.save_results(metrics)
        
        logger.info("Performance test completed successfully")
        return 0
    except Exception as e:
        logger.error(f"Error during performance test: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return 1


if __name__ == '__main__':
    # Create event loop and run the main coroutine
    loop = asyncio.get_event_loop()
    exit_code = loop.run_until_complete(main())
    sys.exit(exit_code)