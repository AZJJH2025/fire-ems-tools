#!/usr/bin/env python3
"""
Run test scenarios for the application.

This script runs all or specific test scenarios and reports the results.
"""

import os
import sys
import argparse
import datetime
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add the parent directory to sys.path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Import scenarios
from tests.scenarios.response_time_analyzer import ResponseTimeDataUploadScenario, ResponseTimeVisualizationScenario, ResponseTimeAnalyticsScenario
from tests.scenarios.incident_logger import IncidentCreationScenario, CADIntegrationScenario, HIPAAComplianceScenario, IncidentValidationScenario
from tests.monitoring.test_monitor import TestMonitor

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ScenarioRunner")

# Initialize test monitor
test_monitor = TestMonitor()

def run_scenarios(scenario_names: Optional[List[str]] = None, 
                output_dir: Optional[str] = None,
                record_results: bool = True) -> Dict[str, bool]:
    """Run test scenarios.
    
    Args:
        scenario_names: List of scenario names to run, or None to run all
        output_dir: Directory to save results to, or None to not save
        record_results: Whether to record results in the test monitor
        
    Returns:
        A dictionary mapping scenario names to success status
    """
    # Define all available scenarios
    all_scenarios = {
        # Response Time Analyzer scenarios
        "ResponseTimeDataUpload": ResponseTimeDataUploadScenario(),
        "ResponseTimeVisualization": ResponseTimeVisualizationScenario(),
        "ResponseTimeAnalytics": ResponseTimeAnalyticsScenario(),
        
        # Incident Logger scenarios
        "IncidentCreation": IncidentCreationScenario(),
        "CADIntegration": CADIntegrationScenario(),
        "HIPAACompliance": HIPAAComplianceScenario(),
        "IncidentValidation": IncidentValidationScenario()
    }
    
    # Determine which scenarios to run
    scenarios_to_run = {}
    if scenario_names:
        for name in scenario_names:
            if name in all_scenarios:
                scenarios_to_run[name] = all_scenarios[name]
            else:
                logger.warning(f"Scenario '{name}' not found, skipping")
    else:
        # Run all scenarios
        scenarios_to_run = all_scenarios
    
    # Prepare for test results
    test_run_data = {
        'type': 'scenario',
        'start_time': datetime.datetime.now().isoformat(),
        'success': True,
        'total_tests': len(scenarios_to_run),
        'passed_tests': 0,
        'failed_tests': 0,
        'skipped_tests': 0,
        'branch': os.environ.get('GITHUB_REF_NAME', 'unknown'),
        'commit': os.environ.get('GITHUB_SHA', 'unknown'),
        'environment': os.environ.get('TEST_ENVIRONMENT', 'local'),
        'results': []
    }
    
    # Make sure output directory exists if specified
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    
    # Run the scenarios
    results = {}
    for name, scenario in scenarios_to_run.items():
        logger.info(f"Running scenario: {name}")
        try:
            success = scenario.execute()
            results[name] = success
            
            # Save results if output directory specified
            if output_dir:
                scenario.save_results(os.path.join(output_dir, f"{name}_results.json"))
            
            # Update test results
            if success:
                test_run_data['passed_tests'] += 1
            else:
                test_run_data['failed_tests'] += 1
                test_run_data['success'] = False
            
            # Add individual test result
            test_run_data['results'].append({
                'name': f"test_{name.lower()}",
                'module': 'tests.scenarios',
                'class': 'TestScenarios',
                'result': 'pass' if success else 'fail',
                'duration': scenario.state.get('duration', 0),
                'error_message': scenario.state.get('error', None) if not success else None,
                'error_type': 'AssertionError' if not success else None
            })
            
        except Exception as e:
            logger.exception(f"Error running scenario {name}: {e}")
            results[name] = False
            
            # Update test results
            test_run_data['failed_tests'] += 1
            test_run_data['success'] = False
            
            # Add individual test result
            test_run_data['results'].append({
                'name': f"test_{name.lower()}",
                'module': 'tests.scenarios',
                'class': 'TestScenarios',
                'result': 'fail',
                'duration': scenario.state.get('duration', 0),
                'error_message': str(e),
                'error_type': type(e).__name__
            })
    
    # Complete test run data
    test_run_data['end_time'] = datetime.datetime.now().isoformat()
    
    # Record test results
    if record_results:
        run_id = test_monitor.record_test_run(test_run_data)
        logger.info(f"Recorded test run {run_id}")
    
    # Print summary
    print("\n=== Scenario Results ===")
    for name, success in results.items():
        print(f"{name}: {'PASS' if success else 'FAIL'}")
    
    print(f"\nPassed: {test_run_data['passed_tests']}/{test_run_data['total_tests']} scenarios")
    
    return results

def main():
    """Main entry point for running scenarios."""
    parser = argparse.ArgumentParser(description="Run test scenarios")
    parser.add_argument("--scenarios", nargs="+", help="Names of scenarios to run")
    parser.add_argument("--output-dir", help="Directory to save results to")
    parser.add_argument("--no-record", action="store_true", help="Don't record results in the test monitor")
    args = parser.parse_args()
    
    # Run the specified scenarios
    run_scenarios(args.scenarios, args.output_dir, not args.no_record)

if __name__ == "__main__":
    main()