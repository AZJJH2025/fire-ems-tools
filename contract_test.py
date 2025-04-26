#!/usr/bin/env python3
"""
Contract Testing Framework for Fire-EMS Tools API

This module provides contract testing to ensure the API provider (backend)
and consumers (frontend, mobile app, etc.) maintain compatible API contracts.
"""

import argparse
import json
import logging
import os
import re
import subprocess
import sys
import time
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple, Any, Union

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('contract_testing.log', mode='w')
    ]
)
logger = logging.getLogger('contract_testing')

# Constants
PACT_DIR = "pacts"
CONTRACTS_DIR = "contracts"
LOG_DIR = "logs"
REPORT_DIR = "reports"
CONFIG_FILE = "pact_config.json"
DEFAULT_PROVIDER = "fire-ems-api"
DEFAULT_BROKER_URL = "http://localhost:9292"
DEFAULT_PROVIDER_BASE_URL = "http://localhost:8080"
DEFAULT_PROVIDER_STATES_URL = "http://localhost:8080/_pact/provider_states"
DEFAULT_PUBLISH_VERSION = "0.1.0"


class ContractTest:
    """Base class for contract testing."""
    
    def __init__(
        self,
        config_path: str = CONFIG_FILE,
        provider: str = DEFAULT_PROVIDER,
        broker_url: Optional[str] = None,
        provider_base_url: Optional[str] = None,
        provider_states_url: Optional[str] = None,
        publish_version: Optional[str] = None,
        publish_results: bool = False,
        verbose: bool = False
    ):
        """Initialize contract test.
        
        Args:
            config_path: Path to config file
            provider: Provider name
            broker_url: Pact Broker URL
            provider_base_url: Provider base URL
            provider_states_url: Provider states URL
            publish_version: Version for publishing
            publish_results: Whether to publish results
            verbose: Whether to show verbose output
        """
        self.provider = provider
        self.broker_url = broker_url
        self.provider_base_url = provider_base_url
        self.provider_states_url = provider_states_url
        self.publish_version = publish_version
        self.publish_results = publish_results
        self.verbose = verbose
        
        # Create directories
        os.makedirs(PACT_DIR, exist_ok=True)
        os.makedirs(CONTRACTS_DIR, exist_ok=True)
        os.makedirs(LOG_DIR, exist_ok=True)
        os.makedirs(REPORT_DIR, exist_ok=True)
        
        # Load configuration
        self.config = self.load_config(config_path)
        
        # Apply config values if not overridden
        if not broker_url and "broker_url" in self.config:
            self.broker_url = self.config["broker_url"]
        elif not broker_url:
            self.broker_url = DEFAULT_BROKER_URL
            
        if not provider_base_url and "provider_base_url" in self.config:
            self.provider_base_url = self.config["provider_base_url"]
        elif not provider_base_url:
            self.provider_base_url = DEFAULT_PROVIDER_BASE_URL
            
        if not provider_states_url and "provider_states_url" in self.config:
            self.provider_states_url = self.config["provider_states_url"]
        elif not provider_states_url:
            self.provider_states_url = DEFAULT_PROVIDER_STATES_URL
            
        if not publish_version and "publish_version" in self.config:
            self.publish_version = self.config["publish_version"]
        elif not publish_version:
            self.publish_version = DEFAULT_PUBLISH_VERSION
            
        self.consumers = self.config.get("consumers", [])
        
        # Check if pact-provider-verifier is installed
        self._check_pact_installed()
        
        logger.info(f"Initialized contract test for provider: {provider}")
        logger.info(f"Provider base URL: {self.provider_base_url}")
        logger.info(f"Publish to broker: {self.publish_results}")
    
    def _check_pact_installed(self) -> None:
        """Check if pact-provider-verifier is installed."""
        try:
            result = subprocess.run(
                ["pact-provider-verifier", "--version"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=False
            )
            
            if result.returncode != 0:
                logger.warning("pact-provider-verifier not found. Will attempt to install.")
                self._install_pact_provider_verifier()
            else:
                logger.info(f"Found pact-provider-verifier: {result.stdout.strip()}")
                
        except FileNotFoundError:
            logger.warning("pact-provider-verifier not found. Will attempt to install.")
            self._install_pact_provider_verifier()
    
    def _install_pact_provider_verifier(self) -> None:
        """Install pact-provider-verifier."""
        try:
            logger.info("Installing pact-provider-verifier using gem...")
            result = subprocess.run(
                ["gem", "install", "pact-provider-verifier"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=False
            )
            
            if result.returncode == 0:
                logger.info("Successfully installed pact-provider-verifier.")
            else:
                logger.error(f"Failed to install pact-provider-verifier: {result.stderr}")
                logger.error("Please install Ruby and run: gem install pact-provider-verifier")
                sys.exit(1)
                
        except Exception as e:
            logger.error(f"Error installing pact-provider-verifier: {e}")
            logger.error("Please install Ruby and run: gem install pact-provider-verifier")
            sys.exit(1)
    
    def load_config(self, config_path: str) -> Dict:
        """Load configuration from file.
        
        Args:
            config_path: Path to config file
            
        Returns:
            Configuration dictionary
        """
        if not os.path.exists(config_path):
            logger.warning(f"Config file not found: {config_path}")
            return {}
            
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                logger.info(f"Loaded configuration from {config_path}")
                return config
        except Exception as e:
            logger.error(f"Error loading config: {str(e)}")
            return {}
    
    def save_config(self, config_path: str = CONFIG_FILE) -> None:
        """Save configuration to file.
        
        Args:
            config_path: Path to config file
        """
        config = {
            "provider": self.provider,
            "broker_url": self.broker_url,
            "provider_base_url": self.provider_base_url,
            "provider_states_url": self.provider_states_url,
            "publish_version": self.publish_version,
            "consumers": self.consumers
        }
        
        try:
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
                logger.info(f"Saved configuration to {config_path}")
        except Exception as e:
            logger.error(f"Error saving config: {str(e)}")
    
    def verify_provider_against_broker(self) -> bool:
        """Verify provider against pacts from the broker.
        
        Returns:
            Whether verification succeeded
        """
        if not self.broker_url:
            logger.error("Broker URL not specified")
            return False
            
        cmd = [
            "pact-provider-verifier",
            "--provider", self.provider,
            "--pact-broker-base-url", self.broker_url,
            "--provider-base-url", self.provider_base_url
        ]
        
        if self.provider_states_url:
            cmd.extend(["--provider-states-setup-url", self.provider_states_url])
            
        if self.publish_results:
            cmd.extend([
                "--publish-verification-results",
                "--provider-app-version", self.publish_version
            ])
            
        if self.verbose:
            cmd.append("--verbose")
            
        logger.info(f"Running command: {' '.join(cmd)}")
        
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        log_file = os.path.join(LOG_DIR, f"broker-verification-{timestamp}.log")
        
        try:
            with open(log_file, 'w') as f:
                result = subprocess.run(
                    cmd,
                    stdout=f,
                    stderr=f,
                    text=True,
                    check=False
                )
                
            # Also log to console if verbose
            if self.verbose:
                with open(log_file, 'r') as f:
                    logger.info(f.read())
                    
            if result.returncode == 0:
                logger.info("Provider verification against broker succeeded!")
                return True
            else:
                logger.error(f"Provider verification against broker failed. See log: {log_file}")
                return False
                
        except Exception as e:
            logger.error(f"Error running provider verification: {e}")
            return False
    
    def verify_provider_against_pact_file(self, pact_file: str) -> bool:
        """Verify provider against a specific pact file.
        
        Args:
            pact_file: Path to pact file
            
        Returns:
            Whether verification succeeded
        """
        if not os.path.exists(pact_file):
            logger.error(f"Pact file not found: {pact_file}")
            return False
            
        cmd = [
            "pact-provider-verifier",
            "--provider", self.provider,
            "--pact-file", pact_file,
            "--provider-base-url", self.provider_base_url
        ]
        
        if self.provider_states_url:
            cmd.extend(["--provider-states-setup-url", self.provider_states_url])
            
        if self.verbose:
            cmd.append("--verbose")
            
        logger.info(f"Running command: {' '.join(cmd)}")
        
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        pact_name = os.path.basename(pact_file).replace(".json", "")
        log_file = os.path.join(LOG_DIR, f"{pact_name}-verification-{timestamp}.log")
        
        try:
            with open(log_file, 'w') as f:
                result = subprocess.run(
                    cmd,
                    stdout=f,
                    stderr=f,
                    text=True,
                    check=False
                )
                
            # Also log to console if verbose
            if self.verbose:
                with open(log_file, 'r') as f:
                    logger.info(f.read())
                    
            if result.returncode == 0:
                logger.info(f"Provider verification against {pact_file} succeeded!")
                return True
            else:
                logger.error(f"Provider verification against {pact_file} failed. See log: {log_file}")
                return False
                
        except Exception as e:
            logger.error(f"Error running provider verification: {e}")
            return False
    
    def publish_pact_to_broker(self, pact_file: str, consumer: str) -> bool:
        """Publish a pact file to the broker.
        
        Args:
            pact_file: Path to pact file
            consumer: Consumer name
            
        Returns:
            Whether publishing succeeded
        """
        if not os.path.exists(pact_file):
            logger.error(f"Pact file not found: {pact_file}")
            return False
            
        if not self.broker_url:
            logger.error("Broker URL not specified")
            return False
            
        cmd = [
            "pact-broker", "publish",
            pact_file,
            "--consumer-app-version", self.publish_version,
            "--broker-base-url", self.broker_url
        ]
        
        if consumer:
            cmd.extend(["--consumer", consumer])
            
        logger.info(f"Running command: {' '.join(cmd)}")
        
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        log_file = os.path.join(LOG_DIR, f"publish-{consumer}-{timestamp}.log")
        
        try:
            with open(log_file, 'w') as f:
                result = subprocess.run(
                    cmd,
                    stdout=f,
                    stderr=f,
                    text=True,
                    check=False
                )
                
            # Also log to console if verbose
            if self.verbose:
                with open(log_file, 'r') as f:
                    logger.info(f.read())
                    
            if result.returncode == 0:
                logger.info(f"Published {pact_file} to broker successfully!")
                return True
            else:
                logger.error(f"Failed to publish {pact_file} to broker. See log: {log_file}")
                return False
                
        except Exception as e:
            logger.error(f"Error publishing to broker: {e}")
            return False
    
    def run_verification_against_all_local_pacts(self) -> Dict[str, bool]:
        """Verify provider against all local pact files.
        
        Returns:
            Dictionary mapping pact files to verification results
        """
        pact_files = list(Path(PACT_DIR).glob("*.json"))
        if not pact_files:
            logger.warning(f"No pact files found in {PACT_DIR}")
            return {}
            
        results = {}
        
        for pact_file in pact_files:
            pact_path = str(pact_file)
            consumer = self._extract_consumer_from_pact(pact_path)
            
            logger.info(f"Verifying against pact file: {pact_path} (Consumer: {consumer})")
            success = self.verify_provider_against_pact_file(pact_path)
            results[pact_path] = success
            
        return results
    
    def _extract_consumer_from_pact(self, pact_file: str) -> str:
        """Extract consumer name from pact file.
        
        Args:
            pact_file: Path to pact file
            
        Returns:
            Consumer name
        """
        try:
            with open(pact_file, 'r') as f:
                pact_data = json.load(f)
                return pact_data.get("consumer", {}).get("name", "unknown-consumer")
        except Exception as e:
            logger.error(f"Error extracting consumer from pact file: {e}")
            return "unknown-consumer"
    
    def verify_and_publish(self) -> Dict[str, bool]:
        """Verify and publish all local pact files.
        
        Returns:
            Dictionary mapping pact files to verification results
        """
        pact_files = list(Path(PACT_DIR).glob("*.json"))
        if not pact_files:
            logger.warning(f"No pact files found in {PACT_DIR}")
            return {}
            
        results = {}
        
        for pact_file in pact_files:
            pact_path = str(pact_file)
            consumer = self._extract_consumer_from_pact(pact_path)
            
            logger.info(f"Verifying against pact file: {pact_path} (Consumer: {consumer})")
            success = self.verify_provider_against_pact_file(pact_path)
            results[pact_path] = success
            
            if success and self.publish_results:
                logger.info(f"Publishing pact file: {pact_path}")
                self.publish_pact_to_broker(pact_path, consumer)
                
        return results
    
    def generate_report(self, results: Dict[str, bool]) -> str:
        """Generate HTML report from verification results.
        
        Args:
            results: Dictionary mapping pact files to verification results
            
        Returns:
            Path to the HTML report
        """
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        report_path = os.path.join(REPORT_DIR, f"contract-test-report-{timestamp}.html")
        
        # Count successes and failures
        success_count = sum(1 for result in results.values() if result)
        failure_count = sum(1 for result in results.values() if not result)
        total_count = len(results)
        
        # Generate report HTML
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Contract Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1, h2, h3 {{ color: #333; }}
        .summary {{ 
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
        }}
        .metric {{ 
            text-align: center;
            padding: 10px;
            border-radius: 5px;
            min-width: 150px;
        }}
        .metric-value {{ 
            font-size: 24px;
            font-weight: bold;
            margin: 5px 0;
        }}
        .metric-label {{ font-size: 14px; color: #666; }}
        .success {{ background-color: #dff0d8; color: #3c763d; }}
        .failure {{ background-color: #f2dede; color: #a94442; }}
        .neutral {{ background-color: #d9edf7; color: #31708f; }}
        table {{ 
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }}
        th, td {{ 
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }}
        th {{ background-color: #f5f5f5; }}
        tr:nth-child(even) {{ background-color: #f9f9f9; }}
        .status {{ 
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 3px;
            display: inline-block;
            min-width: 60px;
            text-align: center;
        }}
        .status-success {{ background-color: #dff0d8; color: #3c763d; }}
        .status-failure {{ background-color: #f2dede; color: #a94442; }}
        .consumer {{ font-style: italic; color: #666; }}
    </style>
</head>
<body>
    <h1>Contract Test Report</h1>
    <div class="summary">
        <div class="metric neutral">
            <div class="metric-label">Total</div>
            <div class="metric-value">{total_count}</div>
        </div>
        <div class="metric success">
            <div class="metric-label">Success</div>
            <div class="metric-value">{success_count}</div>
        </div>
        <div class="metric failure">
            <div class="metric-label">Failure</div>
            <div class="metric-value">{failure_count}</div>
        </div>
        <div class="metric neutral">
            <div class="metric-label">Success Rate</div>
            <div class="metric-value">{
                f"{success_count / total_count * 100:.1f}%" if total_count > 0 else "N/A"
            }</div>
        </div>
    </div>
    
    <div class="test-info">
        <p><strong>Provider:</strong> {self.provider}</p>
        <p><strong>Base URL:</strong> {self.provider_base_url}</p>
        <p><strong>Timestamp:</strong> {timestamp}</p>
    </div>
    
    <h2>Verification Results</h2>
    <table>
        <tr>
            <th>Pact File</th>
            <th>Consumer</th>
            <th>Status</th>
        </tr>
        """
        
        # Add results
        for pact_file, success in results.items():
            consumer = self._extract_consumer_from_pact(pact_file)
            status_class = "status-success" if success else "status-failure"
            status_text = "PASSED" if success else "FAILED"
            
            html += f"""
        <tr>
            <td>{os.path.basename(pact_file)}</td>
            <td class="consumer">{consumer}</td>
            <td><div class="status {status_class}">{status_text}</div></td>
        </tr>
            """
        
        html += """
    </table>
    
    <h2>Log Files</h2>
    <p>Detailed logs are available in the logs directory.</p>
</body>
</html>
        """
        
        # Write the report file
        with open(report_path, 'w') as f:
            f.write(html)
            
        logger.info(f"Report generated: {report_path}")
        return report_path
    
    def generate_pact_files_from_templates(self) -> List[str]:
        """Generate pact files from contract templates.
        
        Returns:
            List of generated pact file paths
        """
        template_files = list(Path(CONTRACTS_DIR).glob("*.json"))
        if not template_files:
            logger.warning(f"No contract templates found in {CONTRACTS_DIR}")
            return []
            
        generated_files = []
        
        for template_file in template_files:
            try:
                # Load template
                with open(template_file, 'r') as f:
                    template = json.load(f)
                    
                # Generate pact file
                pact_file = self._generate_pact_from_template(template, str(template_file))
                if pact_file:
                    generated_files.append(pact_file)
                    
            except Exception as e:
                logger.error(f"Error processing template {template_file}: {e}")
                
        return generated_files
    
    def _generate_pact_from_template(self, template: Dict, template_path: str) -> Optional[str]:
        """Generate a pact file from a template.
        
        Args:
            template: Template data
            template_path: Path to template file
            
        Returns:
            Path to generated pact file
        """
        # Extract basic info
        consumer = template.get("consumer", "unknown-consumer")
        provider = template.get("provider", self.provider)
        interactions = template.get("interactions", [])
        
        if not interactions:
            logger.warning(f"No interactions in template {template_path}")
            return None
            
        # Create pact structure
        pact = {
            "consumer": {
                "name": consumer
            },
            "provider": {
                "name": provider
            },
            "interactions": interactions,
            "metadata": {
                "pactSpecification": {
                    "version": "2.0.0"
                }
            }
        }
        
        # Generate pact file
        filename = f"{consumer}-{provider}.json"
        pact_path = os.path.join(PACT_DIR, filename)
        
        with open(pact_path, 'w') as f:
            json.dump(pact, f, indent=2)
            
        logger.info(f"Generated pact file: {pact_path}")
        return pact_path


class ContractGenerator:
    """Utility for generating contract templates."""
    
    @staticmethod
    def generate_contract_template(
        consumer: str,
        provider: str,
        request_path: str,
        request_method: str = "GET",
        request_query: Optional[Dict] = None,
        request_headers: Optional[Dict] = None,
        request_body: Optional[Dict] = None,
        response_status: int = 200,
        response_headers: Optional[Dict] = None,
        response_body: Optional[Dict] = None,
        provider_state: Optional[str] = None,
        output_path: Optional[str] = None
    ) -> str:
        """Generate a contract template.
        
        Args:
            consumer: Consumer name
            provider: Provider name
            request_path: Request path
            request_method: Request method
            request_query: Request query parameters
            request_headers: Request headers
            request_body: Request body
            response_status: Response status code
            response_headers: Response headers
            response_body: Response body
            provider_state: Provider state description
            output_path: Output path for the template
            
        Returns:
            Path to the generated template
        """
        os.makedirs(CONTRACTS_DIR, exist_ok=True)
        
        # Create description
        description = f"{request_method} {request_path}"
        if provider_state:
            description = f"{provider_state} - {description}"
            
        # Create interaction
        interaction = {
            "description": description,
            "request": {
                "method": request_method,
                "path": request_path
            },
            "response": {
                "status": response_status
            }
        }
        
        # Add provider state if specified
        if provider_state:
            interaction["providerState"] = provider_state
            
        # Add query parameters if specified
        if request_query:
            interaction["request"]["query"] = request_query
            
        # Add headers if specified
        if request_headers:
            interaction["request"]["headers"] = request_headers
            
        # Add body if specified
        if request_body:
            interaction["request"]["body"] = request_body
            
        # Add response headers if specified
        if response_headers:
            interaction["response"]["headers"] = response_headers
            
        # Add response body if specified
        if response_body:
            interaction["response"]["body"] = response_body
            
        # Create template
        template = {
            "consumer": consumer,
            "provider": provider,
            "interactions": [interaction]
        }
        
        # Generate filename if not specified
        if not output_path:
            filename = f"{consumer}-{provider}-{request_method.lower()}-{request_path.replace('/', '-')}.json"
            output_path = os.path.join(CONTRACTS_DIR, filename)
            
        # Save template
        with open(output_path, 'w') as f:
            json.dump(template, f, indent=2)
            
        logger.info(f"Generated contract template: {output_path}")
        return output_path


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Contract Testing Framework")
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Verify command
    verify_parser = subparsers.add_parser("verify", help="Verify provider against pacts")
    verify_parser.add_argument("--provider", help="Provider name", default=DEFAULT_PROVIDER)
    verify_parser.add_argument("--url", help="Provider base URL", default=DEFAULT_PROVIDER_BASE_URL)
    verify_parser.add_argument("--pact-file", help="Specific pact file to verify against")
    verify_parser.add_argument("--verbose", action="store_true", help="Show verbose output")
    
    # Verify against broker command
    broker_parser = subparsers.add_parser("broker", help="Verify provider against pacts from broker")
    broker_parser.add_argument("--provider", help="Provider name", default=DEFAULT_PROVIDER)
    broker_parser.add_argument("--url", help="Provider base URL", default=DEFAULT_PROVIDER_BASE_URL)
    broker_parser.add_argument("--broker-url", help="Pact Broker URL", default=DEFAULT_BROKER_URL)
    broker_parser.add_argument("--publish", action="store_true", help="Publish verification results")
    broker_parser.add_argument("--version", help="Provider version", default=DEFAULT_PUBLISH_VERSION)
    broker_parser.add_argument("--verbose", action="store_true", help="Show verbose output")
    
    # Publish command
    publish_parser = subparsers.add_parser("publish", help="Publish pacts to broker")
    publish_parser.add_argument("--broker-url", help="Pact Broker URL", default=DEFAULT_BROKER_URL)
    publish_parser.add_argument("--pact-file", help="Specific pact file to publish")
    publish_parser.add_argument("--consumer", help="Consumer name")
    publish_parser.add_argument("--version", help="Consumer version", default=DEFAULT_PUBLISH_VERSION)
    publish_parser.add_argument("--verbose", action="store_true", help="Show verbose output")
    
    # Generate command
    generate_parser = subparsers.add_parser("generate", help="Generate pact files from templates")
    generate_parser.add_argument("--provider", help="Provider name", default=DEFAULT_PROVIDER)
    
    # Create template command
    template_parser = subparsers.add_parser("template", help="Create a contract template")
    template_parser.add_argument("--consumer", required=True, help="Consumer name")
    template_parser.add_argument("--provider", help="Provider name", default=DEFAULT_PROVIDER)
    template_parser.add_argument("--path", required=True, help="Request path")
    template_parser.add_argument("--method", default="GET", help="Request method")
    template_parser.add_argument("--output", help="Output path")
    
    args = parser.parse_args()
    
    # Handle commands
    if args.command == "verify":
        contract_test = ContractTest(
            provider=args.provider,
            provider_base_url=args.url,
            verbose=args.verbose
        )
        
        if args.pact_file:
            # Verify against a specific pact file
            success = contract_test.verify_provider_against_pact_file(args.pact_file)
            if success:
                logger.info("Verification succeeded!")
                return 0
            else:
                logger.error("Verification failed!")
                return 1
        else:
            # Verify against all local pact files
            results = contract_test.run_verification_against_all_local_pacts()
            report_path = contract_test.generate_report(results)
            
            if all(results.values()):
                logger.info(f"All verifications succeeded! Report: {report_path}")
                return 0
            else:
                logger.error(f"Some verifications failed! Report: {report_path}")
                return 1
                
    elif args.command == "broker":
        contract_test = ContractTest(
            provider=args.provider,
            provider_base_url=args.url,
            broker_url=args.broker_url,
            publish_version=args.version,
            publish_results=args.publish,
            verbose=args.verbose
        )
        
        success = contract_test.verify_provider_against_broker()
        if success:
            logger.info("Verification against broker succeeded!")
            return 0
        else:
            logger.error("Verification against broker failed!")
            return 1
            
    elif args.command == "publish":
        contract_test = ContractTest(
            broker_url=args.broker_url,
            publish_version=args.version,
            verbose=args.verbose
        )
        
        if args.pact_file:
            # Publish a specific pact file
            success = contract_test.publish_pact_to_broker(args.pact_file, args.consumer)
            if success:
                logger.info("Publishing succeeded!")
                return 0
            else:
                logger.error("Publishing failed!")
                return 1
        else:
            # Publish all local pact files
            pact_files = list(Path(PACT_DIR).glob("*.json"))
            if not pact_files:
                logger.warning(f"No pact files found in {PACT_DIR}")
                return 1
                
            success = True
            for pact_file in pact_files:
                pact_path = str(pact_file)
                consumer = contract_test._extract_consumer_from_pact(pact_path)
                result = contract_test.publish_pact_to_broker(pact_path, consumer)
                success = success and result
                
            if success:
                logger.info("All pacts published successfully!")
                return 0
            else:
                logger.error("Some pacts failed to publish!")
                return 1
                
    elif args.command == "generate":
        contract_test = ContractTest(provider=args.provider)
        generated_files = contract_test.generate_pact_files_from_templates()
        
        if generated_files:
            logger.info(f"Generated {len(generated_files)} pact files")
            return 0
        else:
            logger.warning("No pact files generated")
            return 1
            
    elif args.command == "template":
        output_path = ContractGenerator.generate_contract_template(
            consumer=args.consumer,
            provider=args.provider,
            request_path=args.path,
            request_method=args.method,
            output_path=args.output
        )
        
        logger.info(f"Template created: {output_path}")
        logger.info("Edit the template to add request and response details")
        return 0
        
    else:
        parser.print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())