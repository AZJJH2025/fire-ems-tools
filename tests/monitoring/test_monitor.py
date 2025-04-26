"""
Test results monitoring.

This module provides functionality for monitoring test results and sending alerts.
"""

import os
import sys
import json
import time
import logging
import datetime
import smtplib
import sqlite3
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Union

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("TestMonitor")


class TestMonitor:
    """Monitor test results and send alerts."""
    
    def __init__(self, db_path: Optional[str] = None):
        """Initialize the test monitor.
        
        Args:
            db_path: Path to the SQLite database file
        """
        # Set up database path
        if db_path is None:
            # Use a default path in the monitoring directory
            db_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                "test_results.db"
            )
        
        self.db_path = db_path
        self.conn = None
        
        # Create database if it doesn't exist
        self._init_db()
    
    def _init_db(self):
        """Initialize the database."""
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        # Connect to the database
        self.conn = sqlite3.connect(self.db_path)
        
        # Create tables if they don't exist
        cursor = self.conn.cursor()
        
        # Test runs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS test_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            success INTEGER NOT NULL,
            total_tests INTEGER NOT NULL,
            passed_tests INTEGER NOT NULL,
            failed_tests INTEGER NOT NULL,
            skipped_tests INTEGER NOT NULL,
            branch TEXT,
            commit TEXT,
            environment TEXT,
            metadata TEXT
        )
        """)
        
        # Test results table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            module TEXT,
            class TEXT,
            result TEXT NOT NULL,
            duration REAL,
            error_message TEXT,
            error_type TEXT,
            FOREIGN KEY (run_id) REFERENCES test_runs (id)
        )
        """)
        
        # Alerts table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            sent INTEGER NOT NULL,
            sent_time TEXT,
            recipients TEXT,
            metadata TEXT
        )
        """)
        
        # Alert rules table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS alert_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            condition TEXT NOT NULL,
            recipients TEXT NOT NULL,
            active INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            last_triggered TEXT
        )
        """)
        
        self.conn.commit()
    
    def close(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
            self.conn = None
    
    def record_test_run(self, run_data: Dict[str, Any]) -> int:
        """Record a test run.
        
        Args:
            run_data: Dictionary with test run data
            
        Returns:
            ID of the created test run
        """
        # Connect to the database if needed
        if not self.conn:
            self._init_db()
        
        # Extract basic run data
        run_type = run_data.get('type', 'unknown')
        start_time = run_data.get('start_time', datetime.datetime.now().isoformat())
        end_time = run_data.get('end_time', datetime.datetime.now().isoformat())
        success = run_data.get('success', False)
        total_tests = run_data.get('total_tests', 0)
        passed_tests = run_data.get('passed_tests', 0)
        failed_tests = run_data.get('failed_tests', 0)
        skipped_tests = run_data.get('skipped_tests', 0)
        branch = run_data.get('branch')
        commit = run_data.get('commit')
        environment = run_data.get('environment')
        
        # Extract additional metadata
        metadata = {k: v for k, v in run_data.items() if k not in [
            'type', 'start_time', 'end_time', 'success', 'total_tests',
            'passed_tests', 'failed_tests', 'skipped_tests', 'branch',
            'commit', 'environment', 'results'
        ]}
        
        metadata_json = json.dumps(metadata)
        
        # Insert the test run
        cursor = self.conn.cursor()
        cursor.execute("""
        INSERT INTO test_runs (
            type, start_time, end_time, success, total_tests,
            passed_tests, failed_tests, skipped_tests, branch,
            commit, environment, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            run_type, start_time, end_time, 1 if success else 0,
            total_tests, passed_tests, failed_tests, skipped_tests,
            branch, commit, environment, metadata_json
        ))
        
        run_id = cursor.lastrowid
        
        # Record individual test results if provided
        results = run_data.get('results', [])
        for result in results:
            self.record_test_result(run_id, result)
        
        self.conn.commit()
        
        # Check alert rules for this test run
        self.check_alert_rules(run_type, run_id)
        
        return run_id
    
    def record_test_result(self, run_id: int, result_data: Dict[str, Any]):
        """Record a test result.
        
        Args:
            run_id: ID of the test run
            result_data: Dictionary with test result data
        """
        # Connect to the database if needed
        if not self.conn:
            self._init_db()
        
        # Extract result data
        name = result_data.get('name', 'unknown')
        module = result_data.get('module')
        class_name = result_data.get('class')
        result = result_data.get('result', 'unknown')
        duration = result_data.get('duration')
        error_message = result_data.get('error_message')
        error_type = result_data.get('error_type')
        
        # Insert the test result
        cursor = self.conn.cursor()
        cursor.execute("""
        INSERT INTO test_results (
            run_id, name, module, class, result, duration, error_message, error_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            run_id, name, module, class_name, result, duration, error_message, error_type
        ))
        
        self.conn.commit()
    
    def create_alert_rule(self, rule_data: Dict[str, Any]) -> int:
        """Create an alert rule.
        
        Args:
            rule_data: Dictionary with alert rule data
            
        Returns:
            ID of the created alert rule
        """
        # Connect to the database if needed
        if not self.conn:
            self._init_db()
        
        # Extract rule data
        name = rule_data.get('name', 'unknown')
        description = rule_data.get('description')
        rule_type = rule_data.get('type', 'test_run')
        condition = rule_data.get('condition', 'success == False')
        recipients = json.dumps(rule_data.get('recipients', []))
        active = rule_data.get('active', True)
        created_at = datetime.datetime.now().isoformat()
        
        # Insert the alert rule
        cursor = self.conn.cursor()
        cursor.execute("""
        INSERT INTO alert_rules (
            name, description, type, condition, recipients,
            active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            name, description, rule_type, condition, recipients,
            1 if active else 0, created_at
        ))
        
        rule_id = cursor.lastrowid
        self.conn.commit()
        
        return rule_id
    
    def check_alert_rules(self, test_type: str, run_id: int):
        """Check if any alert rules are triggered by a test run.
        
        Args:
            test_type: Type of the test
            run_id: ID of the test run
        """
        # Connect to the database if needed
        if not self.conn:
            self._init_db()
        
        # Get active alert rules for this test type
        cursor = self.conn.cursor()
        cursor.execute("""
        SELECT id, name, condition, recipients
        FROM alert_rules
        WHERE active = 1 AND type = ?
        """, (test_type,))
        
        rules = cursor.fetchall()
        
        if not rules:
            return
        
        # Get the test run data
        cursor.execute("""
        SELECT id, type, success, total_tests, passed_tests,
               failed_tests, skipped_tests
        FROM test_runs
        WHERE id = ?
        """, (run_id,))
        
        run = cursor.fetchone()
        
        if not run:
            return
        
        # Extract run data for evaluation
        run_data = {
            'id': run[0],
            'type': run[1],
            'success': bool(run[2]),
            'total_tests': run[3],
            'passed_tests': run[4],
            'failed_tests': run[5],
            'skipped_tests': run[6],
            'pass_rate': run[4] / run[3] if run[3] > 0 else 0
        }
        
        # Check each rule
        for rule_id, rule_name, condition, recipients_json in rules:
            try:
                # Evaluate the condition
                if eval(condition, {"__builtins__": {}}, run_data):
                    # Rule triggered, create an alert
                    recipients = json.loads(recipients_json)
                    self.create_alert(rule_id, rule_name, run_id, recipients)
                    
                    # Update last_triggered
                    cursor.execute("""
                    UPDATE alert_rules
                    SET last_triggered = ?
                    WHERE id = ?
                    """, (datetime.datetime.now().isoformat(), rule_id))
                    
                    self.conn.commit()
            except Exception as e:
                logger.error(f"Error evaluating alert rule {rule_name}: {e}")
    
    def create_alert(self, rule_id: int, rule_name: str, run_id: int, recipients: List[str]):
        """Create an alert for a triggered rule.
        
        Args:
            rule_id: ID of the triggered rule
            rule_name: Name of the triggered rule
            run_id: ID of the test run that triggered the rule
            recipients: List of alert recipients
        """
        # Connect to the database if needed
        if not self.conn:
            self._init_db()
        
        # Get test run details
        cursor = self.conn.cursor()
        cursor.execute("""
        SELECT type, start_time, end_time, success, total_tests,
               passed_tests, failed_tests, skipped_tests, branch,
               commit, environment
        FROM test_runs
        WHERE id = ?
        """, (run_id,))
        
        run = cursor.fetchone()
        
        if not run:
            return
        
        # Format the alert message
        message = f"Alert: {rule_name}\n\n"
        message += f"Test Run: {run[0]} (ID: {run_id})\n"
        message += f"Start Time: {run[1]}\n"
        message += f"End Time: {run[2]}\n"
        message += f"Success: {bool(run[3])}\n"
        message += f"Tests: {run[4]} total, {run[5]} passed, {run[6]} failed, {run[7]} skipped\n"
        
        if run[8]:  # branch
            message += f"Branch: {run[8]}\n"
        if run[9]:  # commit
            message += f"Commit: {run[9]}\n"
        if run[10]:  # environment
            message += f"Environment: {run[10]}\n"
        
        # Get failed tests
        cursor.execute("""
        SELECT name, module, error_message
        FROM test_results
        WHERE run_id = ? AND result = 'fail'
        LIMIT 10
        """, (run_id,))
        
        failed_tests = cursor.fetchall()
        
        if failed_tests:
            message += "\nFailed Tests:\n"
            for name, module, error in failed_tests:
                message += f"  - {name}"
                if module:
                    message += f" ({module})"
                message += "\n"
                if error:
                    message += f"    Error: {error}\n"
        
        # Create the alert record
        alert_type = f"rule:{rule_id}"
        timestamp = datetime.datetime.now().isoformat()
        metadata = json.dumps({
            "rule_id": rule_id,
            "run_id": run_id
        })
        
        cursor.execute("""
        INSERT INTO alerts (
            type, message, timestamp, sent, recipients, metadata
        ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            alert_type, message, timestamp, 0, json.dumps(recipients), metadata
        ))
        
        alert_id = cursor.lastrowid
        self.conn.commit()
        
        # Send the alert
        self.send_alert(alert_id)
    
    def send_alert(self, alert_id: int) -> bool:
        """Send an alert.
        
        Args:
            alert_id: ID of the alert to send
            
        Returns:
            True if the alert was sent successfully, False otherwise
        """
        # Connect to the database if needed
        if not self.conn:
            self._init_db()
        
        # Get the alert data
        cursor = self.conn.cursor()
        cursor.execute("""
        SELECT type, message, timestamp, recipients
        FROM alerts
        WHERE id = ?
        """, (alert_id,))
        
        alert = cursor.fetchone()
        
        if not alert:
            return False
        
        alert_type, message, timestamp, recipients_json = alert
        recipients = json.loads(recipients_json) if recipients_json else []
        
        if not recipients:
            logger.warning(f"No recipients for alert {alert_id}")
            return False
        
        # In a real implementation, this would send an email, Slack message, etc.
        # For this example, we'll just log the alert
        logger.info(f"Sending alert {alert_id} to {recipients}")
        logger.info(f"Alert message: {message}")
        
        # Simulate alert sending for the example
        success = True
        
        # Update alert status
        if success:
            cursor.execute("""
            UPDATE alerts
            SET sent = 1, sent_time = ?
            WHERE id = ?
            """, (datetime.datetime.now().isoformat(), alert_id))
            
            self.conn.commit()
        
        return success
    
    def get_test_runs(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent test runs.
        
        Args:
            limit: Maximum number of runs to return
            
        Returns:
            List of test run dictionaries
        """
        # Connect to the database if needed
        if not self.conn:
            self._init_db()
        
        # Query test runs
        cursor = self.conn.cursor()
        cursor.execute("""
        SELECT id, type, start_time, end_time, success, total_tests,
               passed_tests, failed_tests, skipped_tests, branch,
               commit, environment, metadata
        FROM test_runs
        ORDER BY start_time DESC
        LIMIT ?
        """, (limit,))
        
        runs = []
        for row in cursor.fetchall():
            runs.append({
                'id': row[0],
                'type': row[1],
                'start_time': row[2],
                'end_time': row[3],
                'success': bool(row[4]),
                'total_tests': row[5],
                'passed_tests': row[6],
                'failed_tests': row[7],
                'skipped_tests': row[8],
                'branch': row[9],
                'commit': row[10],
                'environment': row[11],
                'metadata': json.loads(row[12]) if row[12] else {}
            })
        
        return runs
    
    def get_test_results(self, run_id: int) -> List[Dict[str, Any]]:
        """Get test results for a test run.
        
        Args:
            run_id: ID of the test run
            
        Returns:
            List of test result dictionaries
        """
        # Connect to the database if needed
        if not self.conn:
            self._init_db()
        
        # Query test results
        cursor = self.conn.cursor()
        cursor.execute("""
        SELECT id, name, module, class, result, duration, error_message, error_type
        FROM test_results
        WHERE run_id = ?
        ORDER BY name
        """, (run_id,))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'id': row[0],
                'name': row[1],
                'module': row[2],
                'class': row[3],
                'result': row[4],
                'duration': row[5],
                'error_message': row[6],
                'error_type': row[7]
            })
        
        return results
    
    def get_alert_rules(self, active_only: bool = False) -> List[Dict[str, Any]]:
        """Get alert rules.
        
        Args:
            active_only: Whether to get only active rules
            
        Returns:
            List of alert rule dictionaries
        """
        # Connect to the database if needed
        if not self.conn:
            self._init_db()
        
        # Query alert rules
        cursor = self.conn.cursor()
        if active_only:
            cursor.execute("""
            SELECT id, name, description, type, condition, recipients,
                   active, created_at, last_triggered
            FROM alert_rules
            WHERE active = 1
            ORDER BY name
            """)
        else:
            cursor.execute("""
            SELECT id, name, description, type, condition, recipients,
                   active, created_at, last_triggered
            FROM alert_rules
            ORDER BY name
            """)
        
        rules = []
        for row in cursor.fetchall():
            rules.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'type': row[3],
                'condition': row[4],
                'recipients': json.loads(row[5]) if row[5] else [],
                'active': bool(row[6]),
                'created_at': row[7],
                'last_triggered': row[8]
            })
        
        return rules
    
    def get_alerts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent alerts.
        
        Args:
            limit: Maximum number of alerts to return
            
        Returns:
            List of alert dictionaries
        """
        # Connect to the database if needed
        if not self.conn:
            self._init_db()
        
        # Query alerts
        cursor = self.conn.cursor()
        cursor.execute("""
        SELECT id, type, message, timestamp, sent, sent_time,
               recipients, metadata
        FROM alerts
        ORDER BY timestamp DESC
        LIMIT ?
        """, (limit,))
        
        alerts = []
        for row in cursor.fetchall():
            alerts.append({
                'id': row[0],
                'type': row[1],
                'message': row[2],
                'timestamp': row[3],
                'sent': bool(row[4]),
                'sent_time': row[5],
                'recipients': json.loads(row[6]) if row[6] else [],
                'metadata': json.loads(row[7]) if row[7] else {}
            })
        
        return alerts


# Example usage
if __name__ == "__main__":
    # Create a test monitor
    monitor = TestMonitor()
    
    # Create a sample alert rule
    rule_id = monitor.create_alert_rule({
        'name': 'Failed Tests',
        'description': 'Alert when tests fail',
        'type': 'unit',
        'condition': 'success == False',
        'recipients': ['dev-team@example.com'],
        'active': True
    })
    
    print(f"Created alert rule: {rule_id}")
    
    # Record a test run that will trigger the rule
    run_id = monitor.record_test_run({
        'type': 'unit',
        'start_time': datetime.datetime.now().isoformat(),
        'end_time': datetime.datetime.now().isoformat(),
        'success': False,
        'total_tests': 10,
        'passed_tests': 8,
        'failed_tests': 2,
        'skipped_tests': 0,
        'branch': 'main',
        'commit': 'abcdef123456',
        'environment': 'test',
        'results': [
            {
                'name': 'test_pass',
                'module': 'test_module',
                'class': 'TestClass',
                'result': 'pass',
                'duration': 0.1
            },
            {
                'name': 'test_fail',
                'module': 'test_module',
                'class': 'TestClass',
                'result': 'fail',
                'duration': 0.2,
                'error_message': 'Assertion failed',
                'error_type': 'AssertionError'
            }
        ]
    })
    
    print(f"Recorded test run: {run_id}")
    
    # Get recent test runs
    runs = monitor.get_test_runs()
    print(f"Recent test runs: {len(runs)}")
    for run in runs:
        print(f"  {run['id']}: {run['type']} - {'Success' if run['success'] else 'Failure'}")
    
    # Get recent alerts
    alerts = monitor.get_alerts()
    print(f"Recent alerts: {len(alerts)}")
    for alert in alerts:
        print(f"  {alert['id']}: {alert['type']} - Sent: {alert['sent']}")
    
    # Close the connection
    monitor.close()