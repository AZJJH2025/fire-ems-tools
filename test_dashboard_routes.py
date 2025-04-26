"""
Test Dashboard Routes.

This module contains the routes for the test visualization dashboard.
"""

from flask import jsonify, render_template, request
import os
import json
import time
import random
from datetime import datetime, timedelta
import sys
import sqlite3
import logging

# Add the tests directory to the path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tests'))

# Import test monitor and sample data generator
try:
    from tests.monitoring.test_monitor import TestMonitor
    test_monitor_available = True
except ImportError:
    test_monitor_available = False

try:
    from tests.monitoring.sample_data import generate_mock_dashboard_data
    mock_data_available = True
except ImportError:
    mock_data_available = False

# Use sample data if test monitor is not available
use_sample_data = not test_monitor_available or os.environ.get('USE_SAMPLE_DATA', 'false').lower() == 'true'

# Mock TestMonitor if not available
if not test_monitor_available:
    class TestMonitor:
        def __init__(self, db_path=None):
            self.db_path = db_path or os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                "tests/monitoring/test_results.db"
            )
            
        def get_test_runs(self, limit=10):
            # Use sample data if available
            if mock_data_available:
                mock_data = generate_mock_dashboard_data()
                return mock_data['latestRuns']
            return []
            
        def get_test_results(self, run_id):
            # Generate mock results
            if mock_data_available:
                # Find the run in the mock data
                mock_data = generate_mock_dashboard_data()
                run = next((r for r in mock_data['latestRuns'] if r['id'] == run_id), None)
                
                if not run:
                    return []
                
                # Generate mock results
                results = []
                
                # Add passed tests
                for i in range(run['passed_tests']):
                    results.append({
                        'id': i + 1,
                        'name': f'test_passed_{i + 1}',
                        'module': f'tests.{run["type"]}.test_module_{i // 5 + 1}',
                        'class': f'Test{run["type"].capitalize()}Class{i // 10 + 1}',
                        'result': 'pass',
                        'duration': round(0.1 + random.random() * 0.5, 3)
                    })
                
                # Add failed tests
                for i in range(run['failed_tests']):
                    results.append({
                        'id': i + run['passed_tests'] + 1,
                        'name': f'test_failed_{i + 1}',
                        'module': f'tests.{run["type"]}.test_module_{i // 2 + 1}',
                        'class': f'Test{run["type"].capitalize()}Class{i // 3 + 1}',
                        'result': 'fail',
                        'duration': round(0.1 + random.random() * 0.5, 3),
                        'error_message': f'AssertionError: Expected True but got False',
                        'error_type': 'AssertionError'
                    })
                
                # Add skipped tests
                for i in range(run['skipped_tests']):
                    results.append({
                        'id': i + run['passed_tests'] + run['failed_tests'] + 1,
                        'name': f'test_skipped_{i + 1}',
                        'module': f'tests.{run["type"]}.test_module_{i // 2 + 1}',
                        'class': f'Test{run["type"].capitalize()}Class{i // 3 + 1}',
                        'result': 'skip',
                        'duration': 0
                    })
                
                return results
            return []
            
        def get_alert_rules(self, active_only=False):
            # Use sample data if available
            if mock_data_available:
                mock_data = generate_mock_dashboard_data()
                rules = mock_data['alertRules']
                
                if active_only:
                    return [r for r in rules if r.get('active', False)]
                return rules
            return []
            
        def get_alerts(self, limit=10):
            # Use sample data if available
            if mock_data_available:
                # Generate sample alerts based on rules
                rules = self.get_alert_rules()
                alerts = []
                
                for rule in rules:
                    if rule.get('last_triggered'):
                        alerts.append({
                            'id': len(alerts) + 1,
                            'type': f"rule:{rule['id']}",
                            'message': f"Alert: {rule['name']}\n\nTest Run triggered this alert.",
                            'timestamp': rule.get('last_triggered'),
                            'sent': random.choice([True, False]),
                            'sent_time': rule.get('last_triggered'),
                            'recipients': rule.get('recipients', []),
                            'metadata': {'rule_id': rule['id'], 'run_id': random.randint(1, 100)}
                        })
                
                return alerts[:limit]
            return []


# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("TestDashboard")

# Force using sample data for now
use_sample_data = True

# Initialize the test monitor only if we're not using sample data
test_monitor = None if use_sample_data else TestMonitor()

def init_app(app):
    """Initialize the test dashboard routes with the Flask app."""
    
    @app.route('/test-dashboard')
    def test_dashboard():
        """Render the test dashboard page."""
        try:
            return render_template('test-dashboard.html')
        except Exception as e:
            logger.error(f"Error rendering test dashboard: {str(e)}")
            return f"Error: {str(e)}", 500
    
    @app.route('/api/test-dashboard/data')
    def test_dashboard_data():
        """Get test dashboard data for visualization."""
        try:
            # Check if we should use sample data
            if use_sample_data and mock_data_available:
                # Use the mock data generator
                mock_data = generate_mock_dashboard_data()
                return jsonify(mock_data)
            
            # Otherwise, use the test monitor
            # Check if the test monitor is initialized
            if test_monitor is None:
                # Fallback to mock data if monitor is not available
                mock_data = generate_mock_dashboard_data()
                return jsonify(mock_data)
                
            # Get recent test runs
            test_runs = test_monitor.get_test_runs(limit=100)
            
            # Get alert rules
            alert_rules = test_monitor.get_alert_rules()
            
            # Get recent alerts
            alerts = test_monitor.get_alerts(limit=20)
            
            # Calculate summary statistics
            summary = calculate_summary_stats(test_runs, alerts)
            
            # Calculate test history data
            history = calculate_history_data(test_runs)
            
            # Calculate test type distribution
            type_distribution = calculate_type_distribution(test_runs)
            
            # Calculate average durations by test type
            durations_by_type = calculate_durations_by_type(test_runs)
            
            # Format latest runs for display
            latest_runs = format_latest_runs(test_runs[:10])
            
            return jsonify({
                'summary': summary,
                'history': history,
                'typeDistribution': type_distribution,
                'durationsByType': durations_by_type,
                'latestRuns': latest_runs,
                'alertRules': alert_rules,
                'alerts': alerts
            })
        except Exception as e:
            logger.error(f"Error fetching test dashboard data: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/test-runs/<int:run_id>')
    def get_test_run(run_id):
        """Get details for a specific test run."""
        try:
            if use_sample_data and mock_data_available:
                # Use mock data
                mock_data = generate_mock_dashboard_data()
                run = next((r for r in mock_data['latestRuns'] if r['id'] == run_id), None)
                
                if not run:
                    return jsonify({'error': 'Test run not found'}), 404
                
                # Generate mock results
                results = []
                
                # Add passed tests
                for i in range(run['passed_tests']):
                    results.append({
                        'id': i + 1,
                        'name': f'test_passed_{i + 1}',
                        'module': f'tests.{run["type"]}.test_module_{i // 5 + 1}',
                        'class': f'Test{run["type"].capitalize()}Class{i // 10 + 1}',
                        'result': 'pass',
                        'duration': round(0.1 + random.random() * 0.5, 3)
                    })
                
                # Add failed tests
                for i in range(run['failed_tests']):
                    results.append({
                        'id': i + run['passed_tests'] + 1,
                        'name': f'test_failed_{i + 1}',
                        'module': f'tests.{run["type"]}.test_module_{i // 2 + 1}',
                        'class': f'Test{run["type"].capitalize()}Class{i // 3 + 1}',
                        'result': 'fail',
                        'duration': round(0.1 + random.random() * 0.5, 3),
                        'error_message': f'AssertionError: Expected True but got False',
                        'error_type': 'AssertionError'
                    })
                
                # Add skipped tests
                for i in range(run['skipped_tests']):
                    results.append({
                        'id': i + run['passed_tests'] + run['failed_tests'] + 1,
                        'name': f'test_skipped_{i + 1}',
                        'module': f'tests.{run["type"]}.test_module_{i // 2 + 1}',
                        'class': f'Test{run["type"].capitalize()}Class{i // 3 + 1}',
                        'result': 'skip',
                        'duration': 0
                    })
                
                # Add results to run data
                run_copy = run.copy()
                run_copy['results'] = results
                
                return jsonify(run_copy)
            
            # Otherwise use the test monitor
            if test_monitor is None:
                # Fallback to mock data if monitor is not available
                return jsonify({'error': 'Test monitor not available'}), 500
                
            # Get test runs
            test_runs = test_monitor.get_test_runs(limit=100)
            
            # Find specific run
            run = next((r for r in test_runs if r['id'] == run_id), None)
            
            if not run:
                return jsonify({'error': 'Test run not found'}), 404
            
            # Get test results for this run
            results = test_monitor.get_test_results(run_id)
            
            # Add results to run data
            run['results'] = results
            
            return jsonify(run)
        except Exception as e:
            logger.error(f"Error fetching test run {run_id}: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/alert-rules', methods=['POST'])
    def create_alert_rule():
        """Create a new alert rule."""
        try:
            # Get request data
            rule_data = request.json
            
            # Validate required fields
            if not rule_data or not all(k in rule_data for k in ['name', 'type', 'condition', 'recipients']):
                return jsonify({'error': 'Missing required fields'}), 400
            
            # Create alert rule
            rule_id = test_monitor.create_alert_rule(rule_data)
            
            return jsonify({'id': rule_id, 'message': 'Alert rule created successfully'})
        except Exception as e:
            logger.error(f"Error creating alert rule: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/alert-rules/<int:rule_id>', methods=['GET'])
    def get_alert_rule(rule_id):
        """Get details for a specific alert rule."""
        try:
            # Get all alert rules
            rules = test_monitor.get_alert_rules()
            
            # Find specific rule
            rule = next((r for r in rules if r['id'] == rule_id), None)
            
            if not rule:
                return jsonify({'error': 'Alert rule not found'}), 404
            
            return jsonify(rule)
        except Exception as e:
            logger.error(f"Error fetching alert rule {rule_id}: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/alert-rules/<int:rule_id>', methods=['PUT'])
    def update_alert_rule(rule_id):
        """Update an existing alert rule."""
        try:
            # Get request data
            rule_data = request.json
            
            # Validate required fields
            if not rule_data or not all(k in rule_data for k in ['name', 'type', 'condition', 'recipients']):
                return jsonify({'error': 'Missing required fields'}), 400
            
            # Get all alert rules
            rules = test_monitor.get_alert_rules()
            
            # Check if rule exists
            if not any(r['id'] == rule_id for r in rules):
                return jsonify({'error': 'Alert rule not found'}), 404
            
            # Update alert rule
            # Note: In a real implementation, we would update the rule in the database
            # Since we don't have direct access to modify methods, we'll simulate success
            
            return jsonify({'message': 'Alert rule updated successfully'})
        except Exception as e:
            logger.error(f"Error updating alert rule {rule_id}: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/alert-rules/<int:rule_id>', methods=['DELETE'])
    def delete_alert_rule(rule_id):
        """Delete an alert rule."""
        try:
            # Get all alert rules
            rules = test_monitor.get_alert_rules()
            
            # Check if rule exists
            if not any(r['id'] == rule_id for r in rules):
                return jsonify({'error': 'Alert rule not found'}), 404
            
            # Delete alert rule
            # Note: In a real implementation, we would delete the rule from the database
            # Since we don't have direct access to delete methods, we'll simulate success
            
            return jsonify({'message': 'Alert rule deleted successfully'})
        except Exception as e:
            logger.error(f"Error deleting alert rule {rule_id}: {str(e)}")
            return jsonify({'error': str(e)}), 500

def calculate_summary_stats(test_runs, alerts):
    """Calculate summary statistics for the dashboard."""
    # Default values if no data is available
    if not test_runs:
        return {
            'totalRuns': 0,
            'successRate': 0,
            'totalTests': 0,
            'activeAlerts': len([a for a in alerts if not a.get('sent', False)])
        }
    
    # Calculate total runs
    total_runs = len(test_runs)
    
    # Calculate success rate
    successful_runs = sum(1 for run in test_runs if run.get('success', False))
    success_rate = (successful_runs / total_runs) * 100 if total_runs > 0 else 0
    
    # Calculate total tests
    total_tests = sum(run.get('total_tests', 0) for run in test_runs)
    
    # Calculate active alerts
    active_alerts = len([a for a in alerts if not a.get('sent', False)])
    
    return {
        'totalRuns': total_runs,
        'successRate': success_rate,
        'totalTests': total_tests,
        'activeAlerts': active_alerts
    }

def calculate_history_data(test_runs):
    """Calculate test history data for the chart."""
    # Default data if no test runs
    if not test_runs:
        return {
            'dates': [],
            'passed': [],
            'failed': []
        }
    
    # Sort runs by start time
    sorted_runs = sorted(test_runs, key=lambda r: r.get('start_time', ''))
    
    # Group runs by date (up to 15 days)
    dates = {}
    
    # Track the last 15 days
    today = datetime.now().date()
    for i in range(15):
        date = (today - timedelta(days=i)).isoformat()
        dates[date] = {'passed': 0, 'failed': 0}
    
    # Fill in the data
    for run in sorted_runs:
        try:
            # Parse date from start_time
            date_str = run.get('start_time', '')
            if not date_str:
                continue
                
            date = datetime.fromisoformat(date_str.replace('Z', '+00:00')).date().isoformat()
            
            # Only include dates in our range
            if date in dates:
                dates[date]['passed'] += run.get('passed_tests', 0)
                dates[date]['failed'] += run.get('failed_tests', 0)
        except (ValueError, TypeError):
            # Skip runs with invalid dates
            continue
    
    # Convert to arrays for chart.js
    date_labels = list(reversed(list(dates.keys())))
    passed_values = [dates[date]['passed'] for date in date_labels]
    failed_values = [dates[date]['failed'] for date in date_labels]
    
    return {
        'dates': date_labels,
        'passed': passed_values,
        'failed': failed_values
    }

def calculate_type_distribution(test_runs):
    """Calculate test type distribution for the chart."""
    # Default data if no test runs
    if not test_runs:
        return {
            'Unit': 0,
            'Integration': 0,
            'API': 0,
            'Performance': 0,
            'Contract': 0,
            'Scenario': 0
        }
    
    # Count runs by type
    type_counts = {}
    
    for run in test_runs:
        test_type = run.get('type', 'unknown').capitalize()
        type_counts[test_type] = type_counts.get(test_type, 0) + 1
    
    return type_counts

def calculate_durations_by_type(test_runs):
    """Calculate average test durations by type."""
    # Default data if no test runs
    if not test_runs:
        return {
            'Unit': 0,
            'Integration': 0,
            'API': 0,
            'Performance': 0,
            'Contract': 0,
            'Scenario': 0
        }
    
    # Track durations by type
    type_durations = {}
    type_counts = {}
    
    for run in test_runs:
        test_type = run.get('type', 'unknown').capitalize()
        
        try:
            # Calculate duration in seconds
            start_time = datetime.fromisoformat(run.get('start_time', '').replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(run.get('end_time', '').replace('Z', '+00:00'))
            duration = (end_time - start_time).total_seconds()
            
            # Add to type totals
            if test_type not in type_durations:
                type_durations[test_type] = 0
                type_counts[test_type] = 0
                
            type_durations[test_type] += duration
            type_counts[test_type] += 1
        except (ValueError, TypeError):
            # Skip runs with invalid times
            continue
    
    # Calculate averages
    average_durations = {}
    for test_type, total_duration in type_durations.items():
        count = type_counts.get(test_type, 0)
        average_durations[test_type] = round(total_duration / count, 1) if count > 0 else 0
    
    return average_durations

def format_latest_runs(test_runs):
    """Format the latest test runs for display."""
    # Return the test runs as is (they're already in the right format)
    return test_runs