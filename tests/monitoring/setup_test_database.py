"""
Setup test results database.

This script creates a sample test results database for demo purposes.
"""

import os
import sys
import sqlite3
import json
import datetime
import time
import random

# Add the parent directory to the path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from monitoring.test_monitor import TestMonitor


def setup_sample_database():
    """Create a sample test results database."""
    # Create a test monitor with a temporary database
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_results.db")
    
    # Delete the database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
    
    # Create a new test monitor
    monitor = TestMonitor(db_path)
    
    # Create sample alert rules
    rule_ids = []
    
    rule_ids.append(monitor.create_alert_rule({
        'name': 'Failed Tests',
        'description': 'Alert when tests fail',
        'type': 'unit',
        'condition': 'success == False',
        'recipients': ['dev-team@example.com'],
        'active': True
    }))
    
    rule_ids.append(monitor.create_alert_rule({
        'name': 'Performance Degradation',
        'description': 'Alert when performance tests degrade',
        'type': 'performance',
        'condition': 'failed_tests > 0',
        'recipients': ['perf-team@example.com'],
        'active': True
    }))
    
    rule_ids.append(monitor.create_alert_rule({
        'name': 'API Contract Violation',
        'description': 'Alert when API contracts are violated',
        'type': 'contract',
        'condition': 'success == False',
        'recipients': ['api-team@example.com'],
        'active': True
    }))
    
    rule_ids.append(monitor.create_alert_rule({
        'name': 'Critical Integration Failure',
        'description': 'Alert when critical integration tests fail',
        'type': 'integration',
        'condition': 'failed_tests / total_tests > 0.1',
        'recipients': ['ops-team@example.com', 'dev-leads@example.com'],
        'active': True
    }))
    
    # Create sample test runs
    test_types = ['unit', 'integration', 'api', 'performance', 'contract', 'scenario']
    branches = ['main', 'feature-testing', 'bugfix-logger']
    environments = ['local', 'ci', 'staging']
    
    # Generate test runs for the last 30 days
    now = datetime.datetime.now()
    
    for day in range(30):
        # Generate 2-5 test runs per day
        runs_per_day = random.randint(2, 5)
        
        for _ in range(runs_per_day):
            # Pick a random time on this day
            hours_offset = random.randint(0, 23)
            minutes_offset = random.randint(0, 59)
            seconds_offset = random.randint(0, 59)
            
            run_date = now - datetime.timedelta(days=day, 
                                              hours=hours_offset, 
                                              minutes=minutes_offset, 
                                              seconds=seconds_offset)
            
            # Pick test parameters
            test_type = random.choice(test_types)
            branch = random.choice(branches)
            environment = random.choice(environments)
            
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
            
            # Generate success/failure rate
            if random.random() < 0.85:  # 85% success rate
                # Success with occasional failures
                failed_tests = random.randint(0, max(1, int(total_tests * 0.05)))
                success = failed_tests == 0
            else:
                # Failure with more significant failures
                failed_tests = random.randint(max(1, int(total_tests * 0.05)), 
                                           max(2, int(total_tests * 0.2)))
                success = False
            
            passed_tests = total_tests - failed_tests
            skipped_tests = random.randint(0, max(1, int(total_tests * 0.05)))
            
            # Generate test duration (1-5 minutes)
            duration_seconds = random.randint(60, 300)
            end_time = run_date + datetime.timedelta(seconds=duration_seconds)
            
            # Generate commit hash
            commit = ''.join(random.choice('0123456789abcdef') for _ in range(8))
            
            # Create test results
            results = []
            
            # Add passed tests
            for i in range(passed_tests):
                module_index = random.randint(1, 5)
                class_index = random.randint(1, 3)
                test_index = random.randint(1, 20)
                
                result = {
                    'name': f'test_function_{test_index}',
                    'module': f'tests.{test_type}.test_module_{module_index}',
                    'class': f'Test{test_type.capitalize()}{class_index}',
                    'result': 'pass',
                    'duration': random.uniform(0.01, 0.5)
                }
                
                results.append(result)
            
            # Add failed tests
            for i in range(failed_tests):
                module_index = random.randint(1, 5)
                class_index = random.randint(1, 3)
                test_index = random.randint(1, 20)
                
                error_types = ['AssertionError', 'ValueError', 'TypeError', 'KeyError', 'IndexError']
                error_messages = [
                    'Expected True but got False',
                    'Invalid value provided',
                    'Cannot convert type',
                    'Key not found in dictionary',
                    'List index out of range',
                    'Expected response 200 but got 404',
                    'Timeout waiting for resource',
                    'Connection refused',
                    'Database constraint violation',
                    'Permission denied for operation'
                ]
                
                result = {
                    'name': f'test_function_{test_index}',
                    'module': f'tests.{test_type}.test_module_{module_index}',
                    'class': f'Test{test_type.capitalize()}{class_index}',
                    'result': 'fail',
                    'duration': random.uniform(0.05, 1.0),
                    'error_type': random.choice(error_types),
                    'error_message': random.choice(error_messages)
                }
                
                results.append(result)
            
            # Add skipped tests
            for i in range(skipped_tests):
                module_index = random.randint(1, 5)
                class_index = random.randint(1, 3)
                test_index = random.randint(1, 20)
                
                result = {
                    'name': f'test_function_{test_index}',
                    'module': f'tests.{test_type}.test_module_{module_index}',
                    'class': f'Test{test_type.capitalize()}{class_index}',
                    'result': 'skip',
                    'duration': 0
                }
                
                results.append(result)
            
            # Record the test run
            run_data = {
                'type': test_type,
                'start_time': run_date.isoformat(),
                'end_time': end_time.isoformat(),
                'success': success,
                'total_tests': total_tests,
                'passed_tests': passed_tests,
                'failed_tests': failed_tests,
                'skipped_tests': skipped_tests,
                'branch': branch,
                'commit': commit,
                'environment': environment,
                'results': results
            }
            
            # Record the test run
            run_id = monitor.record_test_run(run_data)
    
    # Close the connection
    monitor.close()
    
    print(f"Created test results database at {db_path}")
    print(f"Added {len(rule_ids)} alert rules")
    print(f"Generated test data for the last 30 days")


if __name__ == "__main__":
    setup_sample_database()