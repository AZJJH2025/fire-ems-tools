#!/usr/bin/env python3
"""
Contract Test Runner

A script to run contract tests for the Fire-EMS Tools application.
"""

import os
import sys
import argparse
import json
import importlib
import inspect
import datetime
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Type, Tuple

# Add tests package to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ContractTestRunner")


def discover_contract_tests(contract_dir: str = 'contract') -> Dict[str, Dict[str, Any]]:
    """Discover all contract tests in the contract directory.
    
    Args:
        contract_dir: Directory containing contract test modules
        
    Returns:
        Dictionary mapping test names to metadata
    """
    tests = {}
    
    # Get the contract directory path
    contract_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), contract_dir)
    
    if not os.path.exists(contract_path):
        logger.error(f"Contract directory not found: {contract_path}")
        return tests
    
    # Find all Python files in the contract directory
    contract_files = []
    for file in os.listdir(contract_path):
        if file.endswith('.py') and not file.startswith('__'):
            contract_files.append(file[:-3])  # Remove .py extension
    
    # Import each contract module and find contract test classes
    for module_name in contract_files:
        try:
            # Import the module
            module = importlib.import_module(f"{contract_dir}.{module_name}")
            
            # Find all contract test classes in the module
            for name, obj in inspect.getmembers(module):
                # Check if it's a class that inherits from ContractTest
                if (inspect.isclass(obj) and 
                    hasattr(obj, 'provider_name') and 
                    hasattr(obj, 'consumer_name') and
                    hasattr(obj, 'verify_provider') and
                    hasattr(obj, 'verify_consumer') and
                    name != 'ContractTest'):
                    
                    # Add to tests dictionary
                    tests[name] = {
                        'class': obj,
                        'module': module_name,
                        'provider': getattr(obj, 'provider_name'),
                        'consumer': getattr(obj, 'consumer_name')
                    }
        
        except Exception as e:
            logger.error(f"Error importing module {module_name}: {e}")
            continue
    
    return tests


def run_contract_test(test_class: Type, report_dir: Optional[str] = None) -> Tuple[bool, bool]:
    """Run a contract test.
    
    Args:
        test_class: The test class to run
        report_dir: Optional directory to save reports
        
    Returns:
        Tuple of (provider_result, consumer_result)
    """
    # Create an instance of the test class
    test_instance = test_class()
    
    # Get test metadata
    provider = test_instance.provider_name
    consumer = test_instance.consumer_name
    
    logger.info(f"Running contract test for {provider} - {consumer}")
    
    # Set up the test
    test_instance.setUp()
    
    try:
        # Verify provider
        logger.info(f"Verifying provider: {provider}")
        provider_result = test_instance.verify_provider()
        
        # Verify consumer
        logger.info(f"Verifying consumer: {consumer}")
        consumer_result = test_instance.verify_consumer()
        
        # Save report if requested
        if report_dir and (provider_result or consumer_result):
            os.makedirs(report_dir, exist_ok=True)
            
            # Generate a filename for the report
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{provider.replace(' ', '_').lower()}_{consumer.replace(' ', '_').lower()}_{timestamp}.json"
            filepath = os.path.join(report_dir, filename)
            
            # Create the report
            report = {
                "provider": provider,
                "consumer": consumer,
                "provider_verified": provider_result,
                "consumer_verified": consumer_result,
                "timestamp": timestamp,
                "contract_file": test_instance.contract_file
            }
            
            # Save the report
            with open(filepath, 'w') as f:
                json.dump(report, f, indent=2)
            
            logger.info(f"Saved contract test report to {filepath}")
        
        return provider_result, consumer_result
    
    finally:
        # Clean up
        test_instance.tearDown()


def verify_provider(tests: Dict[str, Dict[str, Any]], provider: str,
                   report_dir: Optional[str] = None) -> Dict[str, bool]:
    """Verify a specific provider against all its contracts.
    
    Args:
        tests: Dictionary of discovered tests
        provider: Name of the provider to verify
        report_dir: Optional directory to save reports
        
    Returns:
        Dictionary mapping test names to verification results
    """
    results = {}
    
    for name, info in tests.items():
        if info['provider'] == provider:
            logger.info(f"Verifying provider {provider} with test {name}")
            provider_result, _ = run_contract_test(info['class'], report_dir)
            results[name] = provider_result
    
    return results


def verify_consumer(tests: Dict[str, Dict[str, Any]], consumer: str,
                   report_dir: Optional[str] = None) -> Dict[str, bool]:
    """Verify a specific consumer against all its contracts.
    
    Args:
        tests: Dictionary of discovered tests
        consumer: Name of the consumer to verify
        report_dir: Optional directory to save reports
        
    Returns:
        Dictionary mapping test names to verification results
    """
    results = {}
    
    for name, info in tests.items():
        if info['consumer'] == consumer:
            logger.info(f"Verifying consumer {consumer} with test {name}")
            _, consumer_result = run_contract_test(info['class'], report_dir)
            results[name] = consumer_result
    
    return results


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description="Run contract tests for Fire-EMS Tools")
    parser.add_argument(
        "action",
        choices=["list", "verify-provider", "verify-consumer", "verify-all"],
        help="Action to perform"
    )
    parser.add_argument(
        "--name",
        help="Name of the provider or consumer to verify"
    )
    parser.add_argument(
        "--test",
        help="Specific test to run (by class name)"
    )
    parser.add_argument(
        "--report-dir",
        default="contract_reports",
        help="Directory to save contract test reports"
    )
    
    args = parser.parse_args()
    
    # Discover available contract tests
    tests = discover_contract_tests()
    
    if not tests:
        logger.error("No contract tests discovered")
        sys.exit(1)
    
    # List tests if requested
    if args.action == "list":
        print("\nAvailable Contract Tests:")
        print("------------------------")
        
        # Group tests by provider-consumer pair
        by_pair = {}
        for name, info in tests.items():
            pair = f"{info['provider']} - {info['consumer']}"
            if pair not in by_pair:
                by_pair[pair] = []
            by_pair[pair].append(name)
        
        # Print grouped by pair
        for pair, test_names in by_pair.items():
            print(f"\n{pair}:")
            for name in test_names:
                print(f"  - {name}")
        
        print("\nProviders:")
        providers = sorted(set(info['provider'] for info in tests.values()))
        for provider in providers:
            print(f"  - {provider}")
        
        print("\nConsumers:")
        consumers = sorted(set(info['consumer'] for info in tests.values()))
        for consumer in consumers:
            print(f"  - {consumer}")
        
        sys.exit(0)
    
    # Run a specific test if requested
    if args.test:
        if args.test in tests:
            logger.info(f"Running specific test: {args.test}")
            provider_result, consumer_result = run_contract_test(
                tests[args.test]['class'],
                args.report_dir
            )
            
            print(f"\nTest: {args.test}")
            print(f"Provider: {tests[args.test]['provider']} - {'PASS' if provider_result else 'FAIL'}")
            print(f"Consumer: {tests[args.test]['consumer']} - {'PASS' if consumer_result else 'FAIL'}")
            
            if provider_result and consumer_result:
                sys.exit(0)
            else:
                sys.exit(1)
        else:
            logger.error(f"Test not found: {args.test}")
            sys.exit(1)
    
    # Verify a specific provider if requested
    if args.action == "verify-provider":
        if not args.name:
            logger.error("Provider name is required for verify-provider action")
            sys.exit(1)
        
        results = verify_provider(tests, args.name, args.report_dir)
        
        if not results:
            logger.error(f"No tests found for provider: {args.name}")
            sys.exit(1)
        
        print(f"\nProvider: {args.name}")
        for name, result in results.items():
            print(f"  Test {name}: {'PASS' if result else 'FAIL'}")
        
        if all(results.values()):
            print(f"\nAll tests for provider {args.name} PASSED")
            sys.exit(0)
        else:
            print(f"\nSome tests for provider {args.name} FAILED")
            sys.exit(1)
    
    # Verify a specific consumer if requested
    if args.action == "verify-consumer":
        if not args.name:
            logger.error("Consumer name is required for verify-consumer action")
            sys.exit(1)
        
        results = verify_consumer(tests, args.name, args.report_dir)
        
        if not results:
            logger.error(f"No tests found for consumer: {args.name}")
            sys.exit(1)
        
        print(f"\nConsumer: {args.name}")
        for name, result in results.items():
            print(f"  Test {name}: {'PASS' if result else 'FAIL'}")
        
        if all(results.values()):
            print(f"\nAll tests for consumer {args.name} PASSED")
            sys.exit(0)
        else:
            print(f"\nSome tests for consumer {args.name} FAILED")
            sys.exit(1)
    
    # Verify all contracts if requested
    if args.action == "verify-all":
        all_results = {}
        
        for name, info in tests.items():
            logger.info(f"Running contract test: {name}")
            provider_result, consumer_result = run_contract_test(
                info['class'],
                args.report_dir
            )
            
            all_results[name] = {
                'provider': provider_result,
                'consumer': consumer_result
            }
        
        # Print summary grouped by provider-consumer pair
        print("\n=== Contract Test Results ===")
        
        by_pair = {}
        for name, info in tests.items():
            pair = f"{info['provider']} - {info['consumer']}"
            if pair not in by_pair:
                by_pair[pair] = []
            by_pair[pair].append(name)
        
        for pair, test_names in by_pair.items():
            print(f"\n{pair}:")
            for name in test_names:
                provider_result = all_results[name]['provider']
                consumer_result = all_results[name]['consumer']
                print(f"  {name}:")
                print(f"    Provider: {'PASS' if provider_result else 'FAIL'}")
                print(f"    Consumer: {'PASS' if consumer_result else 'FAIL'}")
        
        # Check if all tests passed
        all_passed = all(
            result['provider'] and result['consumer']
            for result in all_results.values()
        )
        
        if all_passed:
            print("\nAll contract tests PASSED")
            sys.exit(0)
        else:
            print("\nSome contract tests FAILED")
            sys.exit(1)


if __name__ == "__main__":
    main()