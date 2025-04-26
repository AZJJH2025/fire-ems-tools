"""
Generate sample test data for the dashboard.

This script creates sample test data for demonstration purposes.
"""

import json
import datetime
import random

def generate_mock_dashboard_data():
    """Generate mock data for the test dashboard."""
    # Get today's date and previous dates for history
    today = datetime.datetime.now()
    dates = []
    for i in range(15):
        date = today - datetime.timedelta(days=i)
        dates.append(date.strftime('%Y-%m-%d'))
    
    # Generate summary statistics
    summary = {
        'totalRuns': 152,
        'successRate': 87.5,
        'totalTests': 2840,
        'activeAlerts': 3
    }
    
    # Generate test history data
    history = {
        'dates': dates,
        'passed': [120, 115, 122, 128, 130, 125, 132, 135, 129, 140, 142, 138, 145, 148, 150],
        'failed': [15, 18, 12, 10, 8, 12, 8, 5, 10, 8, 5, 12, 8, 10, 5]
    }
    
    # Generate test type distribution
    type_distribution = {
        'Unit': 45,
        'Integration': 30,
        'API': 15,
        'Performance': 5,
        'Contract': 3,
        'Scenario': 2
    }
    
    # Generate test durations by type
    durations_by_type = {
        'Unit': 12.5,
        'Integration': 45.8,
        'API': 22.3,
        'Performance': 58.9,
        'Contract': 18.7,
        'Scenario': 75.2
    }
    
    # Generate latest test runs
    latest_runs = []
    
    for i in range(10):
        # Calculate a random time in the past
        hours_ago = i * 4 + random.randint(0, 3)
        run_time = today - datetime.timedelta(hours=hours_ago)
        
        # Random duration between 1-5 minutes
        duration_seconds = random.randint(60, 300)
        end_time = run_time + datetime.timedelta(seconds=duration_seconds)
        
        # Pick test type
        test_type = random.choice(list(type_distribution.keys())).lower()
        
        # Generate test counts based on type
        if test_type == 'unit':
            total_tests = random.randint(80, 120)
        elif test_type == 'integration':
            total_tests = random.randint(30, 50)
        elif test_type == 'api':
            total_tests = random.randint(20, 40)
        elif test_type == 'performance':
            total_tests = random.randint(5, 15)
        elif test_type == 'contract':
            total_tests = random.randint(3, 10)
        else:  # scenario
            total_tests = random.randint(2, 8)
        
        # Generate success/failure
        if random.random() < 0.8:  # 80% success rate
            failed_tests = 0
            success = True
        else:
            failed_tests = random.randint(1, max(1, int(total_tests * 0.2)))
            success = False
        
        passed_tests = total_tests - failed_tests
        skipped_tests = random.randint(0, max(1, int(total_tests * 0.05)))
        
        run = {
            'id': 152 - i,
            'type': test_type,
            'start_time': run_time.isoformat(),
            'end_time': end_time.isoformat(),
            'success': success,
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'skipped_tests': skipped_tests,
            'branch': 'main',
            'commit': ''.join(random.choice('0123456789abcdef') for _ in range(8)),
            'environment': random.choice(['local', 'ci', 'staging'])
        }
        
        latest_runs.append(run)
    
    # Generate alert rules
    alert_rules = [
        {
            'id': 1,
            'name': 'Failed Unit Tests',
            'description': 'Alert when unit tests fail',
            'type': 'unit',
            'condition': 'success == False',
            'recipients': ['dev-team@example.com'],
            'active': True,
            'created_at': (today - datetime.timedelta(days=90)).isoformat(),
            'last_triggered': (today - datetime.timedelta(days=5)).isoformat()
        },
        {
            'id': 2,
            'name': 'Performance Test Degradation',
            'description': 'Alert when performance tests show degradation',
            'type': 'performance',
            'condition': 'success == False',
            'recipients': ['performance-team@example.com', 'dev-leads@example.com'],
            'active': True,
            'created_at': (today - datetime.timedelta(days=30)).isoformat(),
            'last_triggered': (today - datetime.timedelta(hours=3)).isoformat()
        },
        {
            'id': 3,
            'name': 'API Contract Violation',
            'description': 'Alert when API contract tests fail',
            'type': 'contract',
            'condition': 'failed_tests > 0',
            'recipients': ['api-team@example.com'],
            'active': True,
            'created_at': (today - datetime.timedelta(days=15)).isoformat(),
            'last_triggered': None
        }
    ]
    
    # Combine all data
    dashboard_data = {
        'summary': summary,
        'history': history,
        'typeDistribution': type_distribution,
        'durationsByType': durations_by_type,
        'latestRuns': latest_runs,
        'alertRules': alert_rules
    }
    
    return dashboard_data

if __name__ == "__main__":
    data = generate_mock_dashboard_data()
    print(json.dumps(data, indent=2))