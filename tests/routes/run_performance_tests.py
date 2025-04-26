#!/usr/bin/env python3
"""
Run performance tests for Flask blueprint routes.

This script runs performance tests for the blueprint routes in the application,
measuring response times and throughput.

Usage:
    python tests/routes/run_performance_tests.py [--routes] [--concurrent] [--output DIR]
"""

import os
import sys
import json
import time
import argparse
import statistics
from datetime import datetime
import matplotlib.pyplot as plt
import numpy as np

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Import the test class
from tests.routes.test_route_performance import RoutePerformanceTest, ConcurrentRouteTest, TestRoutePerformance


def setup_test_environment():
    """Set up the test environment with Flask app and test client."""
    # Create an instance of the test class to get access to its setup
    test_instance = TestRoutePerformance()
    test_instance.setUp()
    
    return test_instance


def run_route_performance_tests(test_instance, routes=None, num_requests=100):
    """Run performance tests for specified routes or default critical routes."""
    client = test_instance.client
    
    # Use default critical routes if none specified
    routes_to_test = routes or test_instance.critical_routes
    
    results = []
    for route_info in routes_to_test:
        print(f"\nTesting {route_info['description']} ({route_info['route']})...")
        test = RoutePerformanceTest(
            client,
            route_info["route"],
            num_requests,
            route_info["description"]
        )
        metrics = test.run()
        metrics["group"] = route_info["group"]
        results.append(metrics)
        
        # Brief pause between tests
        time.sleep(1)
    
    return results


def run_concurrent_performance_tests(test_instance, routes=None, num_concurrent=10, requests_per_thread=10):
    """Run concurrent performance tests for specified routes or default critical routes."""
    client = test_instance.client
    
    # Use default critical routes if none specified
    routes_to_test = routes or test_instance.critical_routes
    
    results = []
    for route_info in routes_to_test:
        print(f"\nTesting {route_info['description']} ({route_info['route']}) with concurrent requests...")
        test = ConcurrentRouteTest(
            client,
            route_info["route"],
            num_concurrent,
            requests_per_thread,
            f"Concurrent {route_info['description']} Requests"
        )
        metrics = test.run()
        metrics["group"] = route_info["group"]
        results.append(metrics)
        
        # Brief pause between tests
        time.sleep(2)
    
    return results


def save_results(results, test_type, output_dir):
    """Save test results to file and generate reports."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    os.makedirs(output_dir, exist_ok=True)
    
    # Save results as JSON
    filename = f"{output_dir}/performance_{test_type}_{timestamp}.json"
    data = {
        "timestamp": datetime.now().isoformat(),
        "test_type": test_type,
        "results": results
    }
    
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\nResults saved to {filename}")
    
    # Generate text report
    generate_text_report(results, test_type, timestamp, output_dir)
    
    # Generate charts
    generate_charts(results, test_type, timestamp, output_dir)


def generate_text_report(results, test_type, timestamp, output_dir):
    """Generate a detailed text report of performance results."""
    report_lines = [
        f"Performance Test Report: {test_type}",
        f"Timestamp: {timestamp}",
        f"Number of tests: {len(results)}",
        "",
        "=" * 80,
        ""
    ]
    
    for i, result in enumerate(results):
        report_lines.extend([
            f"Test #{i+1}: {result.get('description', 'Unknown')} ({result.get('group', 'Unknown')})",
            f"  Route: {result.get('route', 'Unknown')}",
            f"  Requests: {result.get('total_requests', result.get('requests', 'Unknown'))}",
            f"  Success: {result.get('successful_requests', 'Unknown')} "
            f"({100 - result.get('error_rate', 0) * 100:.1f}%)",
            f"  Response times (ms):",
            f"    Average: {result.get('avg_response_time_ms', 0):.2f}",
            f"    Median:  {result.get('median_response_time_ms', 0):.2f}",
            f"    95th %:  {result.get('p95_response_time_ms', 0):.2f}",
            f"    Min:     {result.get('min_response_time_ms', 0):.2f}",
            f"    Max:     {result.get('max_response_time_ms', 0):.2f}",
            f"    StdDev:  {result.get('stdev_response_time_ms', 0):.2f}",
            f"  Throughput: {result.get('requests_per_second', 0):.2f} req/sec",
            f"  Duration: {result.get('duration_seconds', 0):.2f} seconds",
            "",
            "-" * 80,
            ""
        ])
    
    # Add summary statistics
    if results:
        avg_times = [result.get('avg_response_time_ms', 0) for result in results]
        p95_times = [result.get('p95_response_time_ms', 0) for result in results]
        throughputs = [result.get('requests_per_second', 0) for result in results]
        
        # Group results by blueprint
        groups = {}
        for result in results:
            group = result.get('group', 'unknown')
            if group not in groups:
                groups[group] = []
            groups[group].append(result)
        
        report_lines.extend([
            "Summary Statistics:",
            f"  Overall average response time: {statistics.mean(avg_times):.2f} ms",
            f"  Overall 95th percentile response time: {statistics.mean(p95_times):.2f} ms",
            f"  Overall average throughput: {statistics.mean(throughputs):.2f} req/sec",
            "",
            "Statistics by Blueprint Group:",
            ""
        ])
        
        for group_name, group_results in groups.items():
            group_avg_times = [r.get('avg_response_time_ms', 0) for r in group_results]
            group_throughputs = [r.get('requests_per_second', 0) for r in group_results]
            
            report_lines.extend([
                f"  {group_name.upper()} Blueprint:",
                f"    Routes tested: {len(group_results)}",
                f"    Average response time: {statistics.mean(group_avg_times):.2f} ms",
                f"    Average throughput: {statistics.mean(group_throughputs):.2f} req/sec",
                ""
            ])
    
    # Add performance recommendations
    report_lines.extend([
        "Performance Recommendations:",
        ""
    ])
    
    # Identify slow routes (> 200ms average)
    slow_routes = [r for r in results if r.get('avg_response_time_ms', 0) > 200]
    if slow_routes:
        report_lines.append("  Slow Routes (> 200ms average response time):")
        for route in slow_routes:
            report_lines.append(f"    - {route.get('description', 'Unknown')} ({route.get('route', 'Unknown')}): "
                               f"{route.get('avg_response_time_ms', 0):.2f} ms")
        report_lines.append("")
    
    # Identify routes with high variance
    high_variance_routes = [r for r in results if r.get('stdev_response_time_ms', 0) > 100]
    if high_variance_routes:
        report_lines.append("  Routes with High Variance (> 100ms standard deviation):")
        for route in high_variance_routes:
            report_lines.append(f"    - {route.get('description', 'Unknown')} ({route.get('route', 'Unknown')}): "
                               f"{route.get('stdev_response_time_ms', 0):.2f} ms std dev")
        report_lines.append("")
    
    # Write report to file
    report_path = f"{output_dir}/performance_{test_type}_{timestamp}_report.txt"
    with open(report_path, 'w') as f:
        f.write("\n".join(report_lines))
    
    print(f"Performance report saved to {report_path}")


def generate_charts(results, test_type, timestamp, output_dir):
    """Generate charts for visualizing performance results."""
    if not results:
        return
    
    # Prepare data for charts
    routes = [r.get('description', r.get('route', 'Unknown')) for r in results]
    avg_times = [r.get('avg_response_time_ms', 0) for r in results]
    p95_times = [r.get('p95_response_time_ms', 0) for r in results]
    throughputs = [r.get('requests_per_second', 0) for r in results]
    
    # Truncate long route names
    max_length = 20
    short_routes = [r[:max_length] + '...' if len(r) > max_length else r for r in routes]
    
    # Create figure directory
    fig_dir = f"{output_dir}/figures"
    os.makedirs(fig_dir, exist_ok=True)
    
    # 1. Response Time Comparison
    plt.figure(figsize=(12, 6))
    x = np.arange(len(routes))
    width = 0.35
    
    plt.bar(x - width/2, avg_times, width, label='Average')
    plt.bar(x + width/2, p95_times, width, label='95th Percentile')
    
    plt.xlabel('Route')
    plt.ylabel('Response Time (ms)')
    plt.title('Response Time by Route')
    plt.xticks(x, short_routes, rotation=45, ha='right')
    plt.legend()
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    
    # Save the chart
    plt.savefig(f"{fig_dir}/response_time_{test_type}_{timestamp}.png")
    plt.close()
    
    # 2. Throughput Comparison
    plt.figure(figsize=(12, 6))
    plt.bar(x, throughputs, color='green', alpha=0.7)
    
    plt.xlabel('Route')
    plt.ylabel('Requests per Second')
    plt.title('Throughput by Route')
    plt.xticks(x, short_routes, rotation=45, ha='right')
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    
    # Save the chart
    plt.savefig(f"{fig_dir}/throughput_{test_type}_{timestamp}.png")
    plt.close()
    
    # 3. Combined chart for blueprint groups
    groups = {}
    for result in results:
        group = result.get('group', 'unknown')
        if group not in groups:
            groups[group] = []
        groups[group].append(result)
    
    if len(groups) > 1:  # Only create this chart if we have multiple groups
        group_names = list(groups.keys())
        group_avg_times = [statistics.mean([r.get('avg_response_time_ms', 0) for r in group]) 
                          for group in groups.values()]
        group_throughputs = [statistics.mean([r.get('requests_per_second', 0) for r in group]) 
                            for group in groups.values()]
        
        fig, ax1 = plt.subplots(figsize=(10, 6))
        
        # Plot average response time
        color = 'tab:blue'
        ax1.set_xlabel('Blueprint Group')
        ax1.set_ylabel('Average Response Time (ms)', color=color)
        ax1.bar(group_names, group_avg_times, color=color, alpha=0.7)
        ax1.tick_params(axis='y', labelcolor=color)
        
        # Create second y-axis for throughput
        ax2 = ax1.twinx()
        color = 'tab:green'
        ax2.set_ylabel('Requests per Second', color=color)
        ax2.plot(group_names, group_throughputs, 'o-', color=color, linewidth=2, markersize=8)
        ax2.tick_params(axis='y', labelcolor=color)
        
        plt.title('Performance by Blueprint Group')
        plt.grid(False)
        plt.tight_layout()
        
        # Save the chart
        plt.savefig(f"{fig_dir}/blueprint_comparison_{test_type}_{timestamp}.png")
        plt.close()
    
    print(f"Performance charts saved to {fig_dir}/")


def main():
    """Main function to parse arguments and run tests."""
    parser = argparse.ArgumentParser(description='Run performance tests for blueprint routes')
    parser.add_argument('--routes', action='store_true', default=True,
                        help='Run basic route performance tests')
    parser.add_argument('--concurrent', action='store_true',
                        help='Run concurrent performance tests')
    parser.add_argument('--requests', type=int, default=100,
                        help='Number of requests per route (default: 100)')
    parser.add_argument('--concurrent-users', type=int, default=10,
                        help='Number of concurrent users (default: 10)')
    parser.add_argument('--requests-per-user', type=int, default=10,
                        help='Number of requests per concurrent user (default: 10)')
    parser.add_argument('--output', default='performance_results',
                        help='Output directory for results (default: performance_results)')
    
    args = parser.parse_args()
    
    # Print test configuration
    print("Fire-EMS Tools Blueprint Performance Tests")
    print("-------------------------------------------")
    print(f"Requests per route: {args.requests}")
    if args.concurrent:
        print(f"Concurrent users: {args.concurrent_users}")
        print(f"Requests per user: {args.requests_per_user}")
    print(f"Output directory: {args.output}")
    print("-------------------------------------------\n")
    
    # Set up test environment
    test_instance = setup_test_environment()
    
    # Run route performance tests
    if args.routes:
        print("\nRunning route performance tests...")
        route_results = run_route_performance_tests(
            test_instance, 
            num_requests=args.requests
        )
        save_results(route_results, "route", args.output)
    
    # Run concurrent performance tests
    if args.concurrent:
        print("\nRunning concurrent performance tests...")
        concurrent_results = run_concurrent_performance_tests(
            test_instance,
            num_concurrent=args.concurrent_users,
            requests_per_thread=args.requests_per_user
        )
        save_results(concurrent_results, "concurrent", args.output)
    
    print("\nAll performance tests completed successfully!")


if __name__ == '__main__':
    main()