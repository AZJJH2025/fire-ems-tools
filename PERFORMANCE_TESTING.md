# Performance Testing for Fire-EMS Tools

This document outlines the performance testing methodology and tools for Fire-EMS Tools application.

## Overview

Performance testing ensures that the application performs well under various conditions, including:

1. **Load Testing**: Evaluates application performance under expected user loads
2. **Stress Testing**: Identifies breaking points by gradually increasing load
3. **Endpoint Performance**: Analyzes performance of specific endpoints

Our performance testing framework provides automated tools for testing, analyzing, and reporting on application performance.

## Getting Started

### Prerequisites

- Python 3.10 or later
- Required packages: `aiohttp`, `matplotlib`, `numpy`

### Installation

Install the required packages:

```bash
pip install aiohttp matplotlib numpy
```

## Running Performance Tests

### Basic Load Test

Test how the system performs under expected load:

```bash
./performance_test.py --type load --users 10 --duration 60
```

### Stress Test

Incrementally increase load to find breaking points:

```bash
./performance_test.py --type stress --max-users 100 --step-users 10 --step-duration 30
```

### Endpoint Performance Test

Test specific endpoints for performance characteristics:

```bash
./performance_test.py --type endpoint --endpoints /incident-logger /call-density-heatmap --requests-per-endpoint 100
```

## Command Line Options

```
usage: performance_test.py [-h] [--url URL] [--type {load,stress,endpoint}] [--users USERS]
                           [--duration DURATION] [--ramp-up RAMP_UP] [--output-dir OUTPUT_DIR]
                           [--test-name TEST_NAME] [--max-users MAX_USERS] [--step-users STEP_USERS]
                           [--step-duration STEP_DURATION] [--endpoints ENDPOINTS [ENDPOINTS ...]]
                           [--requests-per-endpoint REQUESTS_PER_ENDPOINT]

Performance testing for Fire-EMS Tools

options:
  -h, --help            show this help message and exit
  --url URL             Base URL of the application (default: http://localhost:8080)
  --type {load,stress,endpoint}
                        Type of performance test to run
  --users USERS         Number of concurrent users (default: 10)
  --duration DURATION   Test duration in seconds (default: 60)
  --ramp-up RAMP_UP     Ramp-up time in seconds (default: 5)
  --output-dir OUTPUT_DIR
                        Directory to store results (default: performance_results)
  --test-name TEST_NAME
                        Name of the test for reporting (default: derived from type)
  --max-users MAX_USERS
                        Maximum number of users for stress test (default: 100)
  --step-users STEP_USERS
                        Users to add in each step for stress test (default: 10)
  --step-duration STEP_DURATION
                        Duration of each step in seconds for stress test (default: 30)
  --endpoints ENDPOINTS [ENDPOINTS ...]
                        Specific endpoints to test (default: all major endpoints)
  --requests-per-endpoint REQUESTS_PER_ENDPOINT
                        Number of requests per endpoint (default: 100)
```

## Test Types

### Load Test

Load testing evaluates the application's performance under expected user loads. It measures:

- Response times (minimum, maximum, average, percentiles)
- Throughput (requests per second)
- Error rates
- Resource utilization

**When to use:**
- Before deployment to verify the application can handle expected user loads
- After major changes to ensure performance hasn't degraded
- To establish performance baselines

**Example:**
```bash
./performance_test.py --type load --users 20 --duration 120 --ramp-up 10
```

### Stress Test

Stress testing incrementally increases load until the application breaks or degrades. It helps identify:

- Breaking points
- Maximum sustainable user load
- How the system fails under extreme load
- Performance degradation patterns

**When to use:**
- To determine system capacity limits
- To validate autoscaling triggers
- To identify performance bottlenecks

**Example:**
```bash
./performance_test.py --type stress --max-users 100 --step-users 10 --step-duration 30
```

### Endpoint Performance Test

Endpoint testing focuses on specific application features to identify performance characteristics:

- Per-endpoint response times
- Resource-intensive operations
- Bottlenecks in specific features

**When to use:**
- When optimizing specific features
- After adding new endpoints/features
- To compare different implementation approaches

**Example:**
```bash
./performance_test.py --type endpoint --endpoints /incident-logger /fire-map-pro --requests-per-endpoint 200
```

## Performance Reports

The performance testing framework generates comprehensive reports:

### CSV Data Files

- `*_raw.csv`: Raw test results for detailed analysis
- `*_errors.csv`: Error details if errors occurred during testing
- `*_steps.csv`: For stress tests, results of each load step

### JSON Metrics

- `*_metrics.json`: Aggregated metrics for programmatic analysis

### HTML Reports

Interactive HTML reports provide:
- Summary metrics
- Performance graphs
- Detailed tables
- Recommendations

Open the HTML report in a browser to view the complete test results.

### Graphs

- **Response Time Graph**: Shows response times over the test duration
- **Response Time Histogram**: Distribution of response times
- **Response Time by Endpoint**: Comparison of endpoint performance
- **Concurrent Users**: Users over time
- **Scalability Graph**: For stress tests, shows how response time and error rate scale with user load

## Performance Metrics

### Key Metrics

1. **Response Time**
   - Average: Mean response time across all requests
   - Median: 50th percentile response time
   - 95th Percentile: Response time below which 95% of requests fall
   - 99th Percentile: Response time below which 99% of requests fall

2. **Throughput**
   - Requests per second: Total number of requests divided by test duration
   - Successful requests per second: Successful requests divided by test duration

3. **Error Rate**
   - Percentage of requests that failed or returned an error status

4. **Scalability Metrics**
   - Maximum stable users: Highest user count without performance degradation
   - Breaking point: User count at which the system begins to fail

## Performance Thresholds

We define the following performance thresholds:

- **Response Time**
  - Excellent: < 300ms average
  - Good: < 800ms average
  - Acceptable: < 1500ms average
  - Poor: >= 1500ms average

- **Error Rate**
  - Excellent: < 0.1%
  - Good: < 1%
  - Acceptable: < 5%
  - Poor: >= 5%

- **System Capacity**
  - Excellent: > 50 concurrent users
  - Good: 30-50 concurrent users
  - Acceptable: 20-30 concurrent users
  - Poor: < 20 concurrent users

## CI/CD Integration

Performance tests can be integrated into CI/CD pipelines:

```yaml
- name: Run performance tests
  run: |
    pip install aiohttp matplotlib numpy
    ./performance_test.py --type load --users 10 --duration 60 --test-name ci_performance_test
    
- name: Upload performance reports
  uses: actions/upload-artifact@v3
  with:
    name: performance-reports
    path: performance_results/
    retention-days: 14
```

## Best Practices

1. **Establish Baselines**: Create baseline performance metrics before making changes
2. **Regular Testing**: Run performance tests regularly, not just before releases
3. **Realistic Scenarios**: Test with realistic user scenarios and data
4. **Isolated Environment**: Run tests in an environment similar to production
5. **Monitor Resources**: Monitor CPU, memory, and network during tests
6. **Incremental Load**: Start with low loads and gradually increase
7. **Test Fail-over**: Verify how the system behaves when components fail
8. **Data Variation**: Use varied test data to avoid caching effects

## Troubleshooting

### Common Issues

1. **Connection errors**: Check network settings and firewall rules
2. **Authentication failures**: Verify login credentials and session handling
3. **Memory issues**: For large tests, increase available memory or reduce test size

### Getting Help

For more detailed information about the testing framework:

```bash
./performance_test.py --help
```

## Resources

- [Aiohttp Documentation](https://docs.aiohttp.org/)
- [Matplotlib Documentation](https://matplotlib.org/stable/contents.html)
- [Load Testing Best Practices](https://www.blazemeter.com/blog/load-testing-best-practices)