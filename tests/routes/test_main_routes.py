"""Tests for main routes blueprint.

This module contains tests for the main routes of the application,
including the home page and basic tool pages.
"""

import unittest
import pytest
from flask import url_for

from tests.routes.base import MainBlueprintTestCase

# Mark all tests in this module as main blueprint tests


@pytest.mark.main
class TestMainRoutes(MainBlueprintTestCase):
    """Test cases for main blueprint routes."""
    
    def test_index_route(self):
        """Test that the index route returns a 200 status code."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
    
    def test_dashboard_route(self):
        """Test that the fire-ems-dashboard route returns a 200 status code."""
        response = self.client.get('/fire-ems-dashboard')
        self.assertEqual(response.status_code, 200)
    
    def test_isochrone_map_route(self):
        """Test that the isochrone-map route returns a 200 status code."""
        response = self.client.get('/isochrone-map')
        self.assertEqual(response.status_code, 200)
    
    def test_call_density_heatmap_route(self):
        """Test that the call-density-heatmap route returns a 200 status code."""
        response = self.client.get('/call-density-heatmap')
        self.assertEqual(response.status_code, 200)
    
    def test_incident_logger_route(self):
        """Test that the incident-logger route returns a 200 status code."""
        response = self.client.get('/incident-logger')
        self.assertEqual(response.status_code, 200)
    
    def test_coverage_gap_finder_route(self):
        """Test that the coverage-gap-finder route returns a 200 status code."""
        response = self.client.get('/coverage-gap-finder')
        self.assertEqual(response.status_code, 200)
    
    def test_fire_map_pro_route(self):
        """Test that the fire-map-pro route returns a 200 status code."""
        response = self.client.get('/fire-map-pro')
        self.assertEqual(response.status_code, 200)
    
    def test_data_formatter_route(self):
        """Test that the data-formatter route returns a 200 status code."""
        response = self.client.get('/data-formatter')
        self.assertEqual(response.status_code, 200)
    
    def test_station_overview_route(self):
        """Test that the station-overview route returns a 200 status code."""
        response = self.client.get('/station-overview')
        self.assertEqual(response.status_code, 200)
    
    def test_call_volume_forecaster_route(self):
        """Test that the call-volume-forecaster route returns a 200 status code."""
        response = self.client.get('/call-volume-forecaster')
        self.assertEqual(response.status_code, 200)
    
    def test_quick_stats_route(self):
        """Test that the quick-stats route returns a 200 status code."""
        response = self.client.get('/quick-stats')
        self.assertEqual(response.status_code, 200)
    
    def test_deployment_status_route(self):
        """Test that the deployment-status route returns valid JSON."""
        response = self.client.get('/deployment-status')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/json')
        data = response.get_json()
        self.assertIn('status', data)
        self.assertEqual(data['status'], 'ok')
        self.assertIn('fixes_applied', data)
        self.assertIn('timestamp', data)
        self.assertIn('environment', data)
        self.assertIn('features', data)


if __name__ == '__main__':
    unittest.main()
