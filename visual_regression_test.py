#!/usr/bin/env python3
"""
Visual Regression Testing Framework for Fire-EMS Tools

This script provides automated visual regression testing to detect unintended
visual changes in the Fire-EMS Tools application interface.
"""

import argparse
import asyncio
import json
import logging
import os
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple, Union

import cv2
import numpy as np
from playwright.async_api import async_playwright, Browser, BrowserContext, Page, ViewportSize

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('visual_regression.log', mode='w')
    ]
)
logger = logging.getLogger('visual_regression')

# Constants
DEFAULT_SERVER = "http://localhost:8080"
SCREENSHOT_DIR = "visual_regression/screenshots"
BASELINE_DIR = "visual_regression/baseline"
DIFF_DIR = "visual_regression/diff"
REPORT_DIR = "visual_regression/reports"
CONFIG_FILE = "visual_regression/config.json"
LOGIN_CREDENTIALS = {
    "admin": {"email": "admin@example.com", "password": "admin_password"},
    "user": {"email": "user@example.com", "password": "user_password"}
}


class VisualRegressionTest:
    """Main class for visual regression testing."""

    def __init__(
        self,
        base_url: str = DEFAULT_SERVER,
        browser_type: str = "chromium",
        viewport_sizes: Optional[List[Dict[str, int]]] = None,
        threshold: float = 0.1,
        update_baseline: bool = False,
        pages_to_test: Optional[List[str]] = None,
        ignore_regions: Optional[Dict[str, List[Dict[str, int]]]] = None
    ):
        """Initialize the visual regression test.
        
        Args:
            base_url: Base URL of the application
            browser_type: Browser to use (chromium, firefox, webkit)
            viewport_sizes: List of viewport sizes to test
            threshold: Threshold for pixel difference (0.0-1.0)
            update_baseline: Whether to update baseline screenshots
            pages_to_test: List of page routes to test
            ignore_regions: Dict of regions to ignore in comparisons
        """
        self.base_url = base_url
        self.browser_type = browser_type
        self.threshold = threshold
        self.update_baseline = update_baseline
        
        # Default viewport sizes if none provided
        self.viewport_sizes = viewport_sizes or [
            {"width": 1920, "height": 1080, "name": "desktop"},
            {"width": 768, "height": 1024, "name": "tablet"},
            {"width": 375, "height": 812, "name": "mobile"}
        ]
        
        # Default pages to test if none provided
        self.pages_to_test = pages_to_test or [
            {"route": "/", "name": "home"},
            {"route": "/fire-ems-dashboard", "name": "dashboard", "auth": "user"},
            {"route": "/incident-logger", "name": "incident-logger", "auth": "user"},
            {"route": "/call-density-heatmap", "name": "call-density", "auth": "user"},
            {"route": "/isochrone-map", "name": "isochrone-map", "auth": "user"}
        ]
        
        # Regions to ignore during comparison (e.g., dynamic content)
        self.ignore_regions = ignore_regions or {}
        
        # Create directories if they don't exist
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        os.makedirs(BASELINE_DIR, exist_ok=True)
        os.makedirs(DIFF_DIR, exist_ok=True)
        os.makedirs(REPORT_DIR, exist_ok=True)
        
        # Results storage
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "base_url": base_url,
            "threshold": threshold,
            "browser": browser_type,
            "pages_tested": 0,
            "screenshots_taken": 0,
            "differences_found": 0,
            "tests": []
        }
        
        logger.info(f"Initialized visual regression test with URL: {base_url}")
        logger.info(f"Testing {len(self.pages_to_test)} pages with {len(self.viewport_sizes)} viewport sizes")

    async def setup_browser(self) -> Tuple[Browser, BrowserContext]:
        """Set up browser for testing.
        
        Returns:
            Tuple of (browser, context)
        """
        playwright = await async_playwright().start()
        
        if self.browser_type == "chromium":
            browser = await playwright.chromium.launch()
        elif self.browser_type == "firefox":
            browser = await playwright.firefox.launch()
        elif self.browser_type == "webkit":
            browser = await playwright.webkit.launch()
        else:
            raise ValueError(f"Unsupported browser type: {self.browser_type}")
            
        # Create a context with default viewport
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720}
        )
        
        return browser, context

    async def login(self, page: Page, role: str = "user") -> bool:
        """Log in to the application.
        
        Args:
            page: Page to use for login
            role: Role to log in as (admin or user)
            
        Returns:
            Success status
        """
        if role not in LOGIN_CREDENTIALS:
            logger.error(f"Unknown role: {role}")
            return False
            
        credentials = LOGIN_CREDENTIALS[role]
        
        try:
            # Navigate to login page
            logger.info(f"Logging in as {role}")
            await page.goto(f"{self.base_url}/login")
            
            # Enter credentials
            await page.fill("input[name='email']", credentials["email"])
            await page.fill("input[name='password']", credentials["password"])
            
            # Submit form
            await page.click("button[type='submit']")
            
            # Wait for navigation to complete
            await page.wait_for_load_state("networkidle")
            
            # Check if login was successful
            if "/login" in page.url:
                logger.error("Login failed")
                return False
                
            logger.info(f"Successfully logged in as {role}")
            return True
        
        except Exception as e:
            logger.error(f"Error during login: {str(e)}")
            return False

    async def take_screenshot(
        self, 
        page: Page, 
        name: str, 
        viewport: Dict[str, int],
        device_name: str
    ) -> Optional[str]:
        """Take a screenshot of the page.
        
        Args:
            page: Page to screenshot
            name: Name for the screenshot
            viewport: Viewport dimensions
            device_name: Name of the device/viewport
            
        Returns:
            Path to the screenshot file
        """
        try:
            # Set viewport size
            await page.set_viewport_size({"width": viewport["width"], "height": viewport["height"]})
            
            # Wait for any animations or dynamic content to settle
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(1)
            
            # Create filename
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"{name}_{device_name}_{timestamp}.png"
            filepath = os.path.join(SCREENSHOT_DIR, filename)
            
            # Take screenshot
            await page.screenshot(path=filepath, full_page=True)
            logger.info(f"Screenshot taken: {filepath}")
            
            return filepath
        
        except Exception as e:
            logger.error(f"Error taking screenshot: {str(e)}")
            return None

    def get_baseline_path(self, name: str, device_name: str) -> Optional[str]:
        """Get the path to the baseline screenshot.
        
        Args:
            name: Name of the page
            device_name: Name of the device/viewport
            
        Returns:
            Path to the baseline file
        """
        baseline_pattern = f"{name}_{device_name}_*.png"
        baseline_dir = Path(BASELINE_DIR)
        
        try:
            # Find matching baseline files
            matching_files = list(baseline_dir.glob(baseline_pattern))
            
            if matching_files:
                # Return the most recent baseline
                return str(sorted(matching_files, key=lambda x: x.stat().st_mtime, reverse=True)[0])
                
            return None
        
        except Exception as e:
            logger.error(f"Error finding baseline: {str(e)}")
            return None

    def compare_screenshots(
        self, 
        screenshot_path: str, 
        baseline_path: str, 
        name: str,
        device_name: str
    ) -> Tuple[bool, Optional[str], float]:
        """Compare a screenshot with its baseline.
        
        Args:
            screenshot_path: Path to the current screenshot
            baseline_path: Path to the baseline screenshot
            name: Name of the page
            device_name: Name of the device/viewport
            
        Returns:
            Tuple of (passed, diff_path, difference_percentage)
        """
        if not os.path.exists(baseline_path):
            logger.warning(f"No baseline found for {name} on {device_name}")
            return False, None, 1.0
            
        try:
            # Read images
            current_img = cv2.imread(screenshot_path)
            baseline_img = cv2.imread(baseline_path)
            
            # Ensure images are same size
            if current_img.shape != baseline_img.shape:
                logger.warning(f"Image size mismatch for {name} on {device_name}")
                # Resize baseline to match current
                baseline_img = cv2.resize(baseline_img, (current_img.shape[1], current_img.shape[0]))
            
            # Apply ignore regions if defined for this page
            page_key = f"{name}_{device_name}"
            mask = None
            
            if page_key in self.ignore_regions:
                # Create a mask for ignored regions
                mask = np.ones(current_img.shape[:2], dtype=np.uint8) * 255
                
                for region in self.ignore_regions[page_key]:
                    x, y, w, h = region["x"], region["y"], region["width"], region["height"]
                    mask[y:y+h, x:x+w] = 0
                    
                # Apply mask to both images
                current_masked = cv2.bitwise_and(current_img, current_img, mask=mask)
                baseline_masked = cv2.bitwise_and(baseline_img, baseline_img, mask=mask)
                
                # Use masked images for comparison
                current_img = current_masked
                baseline_img = baseline_masked
            
            # Calculate absolute difference
            diff_img = cv2.absdiff(current_img, baseline_img)
            
            # Convert to grayscale and threshold
            gray_diff = cv2.cvtColor(diff_img, cv2.COLOR_BGR2GRAY)
            _, thresholded = cv2.threshold(gray_diff, 30, 255, cv2.THRESH_BINARY)
            
            # Calculate difference percentage
            total_pixels = thresholded.size
            different_pixels = cv2.countNonZero(thresholded)
            difference_percentage = different_pixels / total_pixels
            
            # Create diff visualization
            diff_color = cv2.applyColorMap(gray_diff, cv2.COLORMAP_JET)
            
            # Draw ignored regions if any
            if mask is not None:
                ignore_overlay = np.zeros_like(diff_color)
                ignore_overlay[mask == 0] = [0, 0, 255]  # Red for ignored regions
                diff_color = cv2.addWeighted(diff_color, 1.0, ignore_overlay, 0.5, 0)
            
            # Save diff image
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            diff_filename = f"{name}_{device_name}_diff_{timestamp}.png"
            diff_path = os.path.join(DIFF_DIR, diff_filename)
            cv2.imwrite(diff_path, diff_color)
            
            # Determine if the test passed
            passed = difference_percentage <= self.threshold
            
            if passed:
                logger.info(f"Comparison passed for {name} on {device_name} "
                          f"(Difference: {difference_percentage:.2%})")
            else:
                logger.warning(f"Comparison failed for {name} on {device_name} "
                             f"(Difference: {difference_percentage:.2%})")
                
            return passed, diff_path, difference_percentage
            
        except Exception as e:
            logger.error(f"Error comparing screenshots: {str(e)}")
            return False, None, 1.0

    async def test_page(
        self, 
        page: Page, 
        page_info: Dict[str, str], 
        viewport: Dict[str, int],
        viewport_name: str
    ) -> Dict:
        """Test a single page at a specific viewport size.
        
        Args:
            page: Playwright page
            page_info: Information about the page to test
            viewport: Viewport dimensions
            viewport_name: Name of the viewport
            
        Returns:
            Test result dictionary
        """
        route = page_info["route"]
        name = page_info["name"]
        requires_auth = page_info.get("auth", None)
        
        result = {
            "page": name,
            "route": route,
            "viewport": viewport_name,
            "width": viewport["width"],
            "height": viewport["height"],
            "timestamp": datetime.now().isoformat(),
            "status": "failed",
            "auth_required": requires_auth is not None,
            "error": None,
            "screenshot": None,
            "baseline": None,
            "diff": None,
            "difference_percentage": None
        }
        
        try:
            # Handle authentication if required
            if requires_auth:
                login_success = await self.login(page, requires_auth)
                if not login_success:
                    result["error"] = "Login failed"
                    return result
            
            # Navigate to the page
            logger.info(f"Testing {route} at {viewport_name} ({viewport['width']}x{viewport['height']})")
            await page.goto(f"{self.base_url}{route}")
            await page.wait_for_load_state("networkidle")
            
            # Take screenshot
            screenshot_path = await self.take_screenshot(page, name, viewport, viewport_name)
            if not screenshot_path:
                result["error"] = "Failed to take screenshot"
                return result
                
            result["screenshot"] = screenshot_path
            self.results["screenshots_taken"] += 1
            
            # Get baseline or update it
            baseline_path = self.get_baseline_path(name, viewport_name)
            
            if self.update_baseline or baseline_path is None:
                # Update/create new baseline
                new_baseline_name = f"{name}_{viewport_name}_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
                new_baseline_path = os.path.join(BASELINE_DIR, new_baseline_name)
                shutil.copy(screenshot_path, new_baseline_path)
                logger.info(f"Baseline updated: {new_baseline_path}")
                
                result["baseline"] = new_baseline_path
                result["status"] = "baseline_updated"
                return result
            
            # Compare with baseline
            result["baseline"] = baseline_path
            passed, diff_path, difference = self.compare_screenshots(
                screenshot_path, baseline_path, name, viewport_name
            )
            
            result["diff"] = diff_path
            result["difference_percentage"] = difference
            result["status"] = "passed" if passed else "failed"
            
            if not passed:
                self.results["differences_found"] += 1
                
            return result
            
        except Exception as e:
            logger.error(f"Error testing {route} at {viewport_name}: {str(e)}")
            result["error"] = str(e)
            return result

    async def run_tests(self) -> Dict:
        """Run visual regression tests for all pages and viewports.
        
        Returns:
            Dictionary of test results
        """
        browser, context = await self.setup_browser()
        
        try:
            page = await context.new_page()
            all_test_results = []
            
            # Iterate through pages and viewports
            for page_info in self.pages_to_test:
                for viewport in self.viewport_sizes:
                    # Create a new page for each test to ensure clean state
                    test_page = await context.new_page()
                    
                    # Run the test
                    result = await self.test_page(
                        test_page, 
                        page_info, 
                        {"width": viewport["width"], "height": viewport["height"]}, 
                        viewport["name"]
                    )
                    
                    all_test_results.append(result)
                    self.results["pages_tested"] += 1
                    
                    # Close the test page
                    await test_page.close()
            
            # Update the results
            self.results["tests"] = all_test_results
            
            return self.results
            
        finally:
            await browser.close()

    async def generate_report(self, results: Dict) -> str:
        """Generate HTML report for test results.
        
        Args:
            results: Test results dictionary
            
        Returns:
            Path to the HTML report
        """
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        report_path = os.path.join(REPORT_DIR, f"visual_regression_report_{timestamp}.html")
        
        # Group results by page
        pages = {}
        for test in results["tests"]:
            page_name = test["page"]
            if page_name not in pages:
                pages[page_name] = []
            pages[page_name].append(test)
        
        # Create report HTML
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Visual Regression Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1, h2, h3 {{ color: #333; }}
        .summary {{ 
            display: flex; 
            flex-wrap: wrap; 
            gap: 20px; 
            margin-bottom: 20px; 
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
        }}
        .metric {{ 
            flex: 1; 
            min-width: 200px; 
            text-align: center;
        }}
        .metric-value {{ 
            font-size: 24px; 
            font-weight: bold; 
            margin: 10px 0;
        }}
        .metric-label {{ 
            font-size: 14px; 
            color: #666;
        }}
        .page-section {{ 
            margin-bottom: 30px; 
            border: 1px solid #ddd; 
            border-radius: 5px;
            overflow: hidden;
        }}
        .page-header {{ 
            background-color: #f5f5f5; 
            padding: 10px 20px;
            border-bottom: 1px solid #ddd;
        }}
        .test-grid {{ 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
        }}
        .test-card {{ 
            border: 1px solid #ddd; 
            border-radius: 5px; 
            overflow: hidden;
        }}
        .test-header {{ 
            padding: 10px; 
            border-bottom: 1px solid #ddd;
            background-color: #f9f9f9;
        }}
        .test-content {{ 
            padding: 10px;
        }}
        .test-images {{ 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }}
        .test-image-container {{ 
            display: flex; 
            flex-direction: column;
            align-items: center;
        }}
        .test-image {{ 
            max-width: 100%; 
            border: 1px solid #ddd;
        }}
        .test-image-label {{ 
            font-size: 12px; 
            margin-top: 5px;
        }}
        .status-passed {{ color: green; }}
        .status-failed {{ color: red; }}
        .status-baseline {{ color: blue; }}
        .status-error {{ color: orange; }}
    </style>
</head>
<body>
    <h1>Visual Regression Test Report</h1>
    <div class="summary">
        <div class="metric">
            <div class="metric-label">Pages Tested</div>
            <div class="metric-value">{results["pages_tested"]}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Screenshots Taken</div>
            <div class="metric-value">{results["screenshots_taken"]}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Differences Found</div>
            <div class="metric-value" style="color: {
                'red' if results["differences_found"] > 0 else 'green'
            }">{results["differences_found"]}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Browser</div>
            <div class="metric-value" style="font-size: 18px;">{results["browser"]}</div>
        </div>
    </div>
    
    <div class="test-info">
        <p><strong>Base URL:</strong> {results["base_url"]}</p>
        <p><strong>Threshold:</strong> {results["threshold"]}</p>
        <p><strong>Timestamp:</strong> {results["timestamp"]}</p>
    </div>
    
    <h2>Test Results</h2>
    """
        
        # Add page sections
        for page_name, tests in pages.items():
            html += f"""
    <div class="page-section">
        <div class="page-header">
            <h3>{page_name}</h3>
        </div>
        <div class="test-grid">
            """
            
            # Add test cards
            for test in tests:
                status_class = {
                    "passed": "status-passed",
                    "failed": "status-failed",
                    "baseline_updated": "status-baseline",
                }.get(test["status"], "status-error")
                
                status_text = {
                    "passed": "✓ Passed",
                    "failed": "✗ Failed",
                    "baseline_updated": "◆ Baseline Updated",
                }.get(test["status"], "⚠ Error")
                
                # Create relative paths for images
                screenshot_rel = os.path.relpath(test["screenshot"], REPORT_DIR) if test["screenshot"] else None
                baseline_rel = os.path.relpath(test["baseline"], REPORT_DIR) if test["baseline"] else None
                diff_rel = os.path.relpath(test["diff"], REPORT_DIR) if test["diff"] else None
                
                html += f"""
            <div class="test-card">
                <div class="test-header">
                    <div><strong>Viewport:</strong> {test["viewport"]} ({test["width"]}x{test["height"]})</div>
                    <div><strong>Status:</strong> <span class="{status_class}">{status_text}</span></div>
                    {f'<div><strong>Difference:</strong> {test["difference_percentage"]:.2%}</div>' if test["difference_percentage"] is not None else ''}
                </div>
                <div class="test-content">
                    {f'<div><strong>Error:</strong> {test["error"]}</div>' if test["error"] else ''}
                    <div class="test-images">
                """
                
                # Add images
                if screenshot_rel:
                    html += f"""
                        <div class="test-image-container">
                            <img class="test-image" src="{screenshot_rel}" alt="Current">
                            <div class="test-image-label">Current</div>
                        </div>
                    """
                
                if baseline_rel:
                    html += f"""
                        <div class="test-image-container">
                            <img class="test-image" src="{baseline_rel}" alt="Baseline">
                            <div class="test-image-label">Baseline</div>
                        </div>
                    """
                
                if diff_rel and test["status"] == "failed":
                    html += f"""
                        <div class="test-image-container">
                            <img class="test-image" src="{diff_rel}" alt="Diff">
                            <div class="test-image-label">Diff</div>
                        </div>
                    """
                
                html += """
                    </div>
                </div>
            </div>
                """
            
            html += """
        </div>
    </div>
            """
        
        html += """
</body>
</html>
        """
        
        # Write the report file
        with open(report_path, "w") as f:
            f.write(html)
            
        logger.info(f"Report generated: {report_path}")
        return report_path

    def save_results(self, results: Dict) -> str:
        """Save test results to JSON file.
        
        Args:
            results: Test results dictionary
            
        Returns:
            Path to the JSON file
        """
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        results_path = os.path.join(REPORT_DIR, f"results_{timestamp}.json")
        
        with open(results_path, "w") as f:
            json.dump(results, f, indent=2)
            
        logger.info(f"Results saved to {results_path}")
        return results_path

    @staticmethod
    def create_ignore_region(
        x: int, 
        y: int, 
        width: int, 
        height: int
    ) -> Dict[str, int]:
        """Create an ignore region dictionary.
        
        Args:
            x: X coordinate
            y: Y coordinate
            width: Width of region
            height: Height of region
            
        Returns:
            Ignore region dictionary
        """
        return {
            "x": x,
            "y": y,
            "width": width,
            "height": height
        }

    @classmethod
    def load_config(cls, config_path: str = CONFIG_FILE) -> Dict:
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
            with open(config_path, "r") as f:
                config = json.load(f)
                logger.info(f"Loaded configuration from {config_path}")
                return config
        except Exception as e:
            logger.error(f"Error loading config: {str(e)}")
            return {}

    @classmethod
    def save_config(cls, config: Dict, config_path: str = CONFIG_FILE) -> None:
        """Save configuration to file.
        
        Args:
            config: Configuration dictionary
            config_path: Path to config file
        """
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(config_path), exist_ok=True)
            
            with open(config_path, "w") as f:
                json.dump(config, f, indent=2)
                logger.info(f"Saved configuration to {config_path}")
        except Exception as e:
            logger.error(f"Error saving config: {str(e)}")


async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Visual Regression Testing for Fire-EMS Tools")
    
    parser.add_argument("--url", type=str, default=DEFAULT_SERVER,
                        help=f"Base URL of the application (default: {DEFAULT_SERVER})")
    parser.add_argument("--browser", type=str, choices=["chromium", "firefox", "webkit"],
                        default="chromium", help="Browser to use (default: chromium)")
    parser.add_argument("--threshold", type=float, default=0.1,
                        help="Threshold for pixel difference (0.0-1.0, default: 0.1)")
    parser.add_argument("--update-baseline", action="store_true",
                        help="Update baseline screenshots")
    parser.add_argument("--config", type=str, default=CONFIG_FILE,
                        help=f"Path to config file (default: {CONFIG_FILE})")
    parser.add_argument("--pages", type=str, nargs="+",
                        help="Specific pages to test (by name or route)")
    parser.add_argument("--viewports", type=str, nargs="+",
                        help="Specific viewports to test (by name: desktop, tablet, mobile)")
    
    args = parser.parse_args()
    
    # Load configuration
    config = VisualRegressionTest.load_config(args.config)
    
    # Override with command line arguments
    test_config = {
        "base_url": args.url,
        "browser_type": args.browser,
        "threshold": args.threshold,
        "update_baseline": args.update_baseline,
    }
    
    # Apply configuration from file
    if config:
        if "ignore_regions" in config:
            test_config["ignore_regions"] = config["ignore_regions"]
        if "pages_to_test" in config and not args.pages:
            test_config["pages_to_test"] = config["pages_to_test"]
        if "viewport_sizes" in config and not args.viewports:
            test_config["viewport_sizes"] = config["viewport_sizes"]
    
    # Filter pages if specified
    if args.pages:
        if "pages_to_test" in test_config:
            filtered_pages = []
            for page in test_config["pages_to_test"]:
                if page["name"] in args.pages or page["route"] in args.pages:
                    filtered_pages.append(page)
            test_config["pages_to_test"] = filtered_pages
    
    # Filter viewports if specified
    if args.viewports:
        if "viewport_sizes" in test_config:
            filtered_viewports = []
            for viewport in test_config["viewport_sizes"]:
                if viewport["name"] in args.viewports:
                    filtered_viewports.append(viewport)
            test_config["viewport_sizes"] = filtered_viewports
    
    # Create test instance
    test = VisualRegressionTest(**test_config)
    
    try:
        # Run tests
        results = await test.run_tests()
        
        # Save results
        test.save_results(results)
        
        # Generate report
        report_path = await test.generate_report(results)
        
        logger.info(f"Testing completed. Report available at: {report_path}")
        
        # Return success status
        return 0 if results["differences_found"] == 0 else 1
        
    except Exception as e:
        logger.error(f"Testing failed: {str(e)}")
        return 1


if __name__ == "__main__":
    asyncio.run(main())