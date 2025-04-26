#!/usr/bin/env python3
"""
Specific Performance Tests for Fire-EMS Tools

This module contains more specific performance tests focusing on 
realistic user scenarios and load testing.
"""

import os
import sys
import json
import time
import unittest
import threading
import statistics
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import MagicMock, patch

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our simplified test base
from test_departments_simplified import SimpleDepartmentTestBase


class ResponseTimePerformanceTests(SimpleDepartmentTestBase):
    """Performance tests for response time analysis"""
    
    def test_large_dataset_response_time(self):
        """Test response time with a large dataset"""
        # Create a large dataset of incidents
        num_incidents = 50000  # 50,000 incidents
        incidents = []
        
        # Current date for reference
        now = datetime.now()
        
        # Generate test incidents over the past year
        for i in range(num_incidents):
            # Create an incident with a random date in the past year
            days_ago = i % 365  # Spread incidents across a year
            incident_date = now - timedelta(days=days_ago)
            
            # Add some randomization to the time
            hour = (i % 24)
            minute = (i % 60)
            
            incidents.append({
                'id': i,
                'incident_number': f'PERF-{i:06d}',
                'incident_date': incident_date.date().isoformat(),
                'incident_time': f'{hour:02d}:{minute:02d}:00',
                'response_time': (i % 900) + 60,  # Between 1 and 16 minutes in seconds
                'incident_type': ['FIRE', 'EMS', 'OTHER'][i % 3],
                'priority': ['HIGH', 'MEDIUM', 'LOW'][i % 3]
            })
        
        # Patch the function that gets incidents from the database
        with patch('app.get_incidents_for_department', return_value=incidents):
            # Measure time taken for the response time calculation
            start_time = time.time()
            
            # Make the request to the response time endpoint
            # This will trigger the calculation with our large dataset
            response = self.client.get('/api/department/performance/response-times')
            
            # Calculate elapsed time
            elapsed_time = time.time() - start_time
            
            # Check response status
            self.assertEqual(response.status_code, 200)
            
            # Response should come back in a reasonable time
            # For a dataset of this size, we'd expect it to take less than 5 seconds
            self.assertLess(elapsed_time, 5.0, 
                           f"Response time calculation took {elapsed_time:.2f} seconds, which is too slow")
            
            # Verify the response data
            data = json.loads(response.data.decode('utf-8'))
            self.assertIn('average_response_time', data)
            self.assertIn('by_priority', data)
            self.assertIn('by_type', data)
            self.assertIn('by_hour', data)


class ConcurrentUserPerformanceTests(SimpleDepartmentTestBase):
    """Performance tests with simulated concurrent users"""
    
    def simulate_user_session(self, user_type, dept_code):
        """Simulate a user session with multiple actions"""
        # Create a client for this session
        client = self.app.test_client()
        
        # Login
        with client.session_transaction() as session:
            session['user_id'] = 100 + user_type  # Different user IDs
            session['department_id'] = self.departments[dept_code].id
            session['department_code'] = dept_code
            session['user_role'] = ['admin', 'manager', 'user'][user_type % 3]
            session['logged_in'] = True
        
        # Start timing
        start_time = time.time()
        results = {}
        
        # Perform a sequence of actions
        try:
            # 1. Dashboard view
            response = client.get('/dashboard')
            results['dashboard'] = {
                'status': response.status_code,
                'time': time.time() - start_time
            }
            start_time = time.time()
            
            # 2. Incident listing
            response = client.get('/incidents')
            results['incidents'] = {
                'status': response.status_code,
                'time': time.time() - start_time
            }
            start_time = time.time()
            
            # 3. Map view
            response = client.get('/fire-map-pro')
            results['map'] = {
                'status': response.status_code,
                'time': time.time() - start_time
            }
            start_time = time.time()
            
            # 4. Create incident (if admin/manager)
            if session['user_role'] in ['admin', 'manager']:
                incident_data = {
                    'incident_number': f'TEST-PERF-{user_type}-{int(time.time())}',
                    'incident_date': datetime.now().strftime('%Y-%m-%d'),
                    'incident_time': datetime.now().strftime('%H:%M:%S'),
                    'incident_type': 'FIRE',
                    'latitude': '33.4484',
                    'longitude': '-112.0740',
                    'description': f'Performance test incident {user_type}'
                }
                response = client.post('/incident/add', data=incident_data)
                results['create_incident'] = {
                    'status': response.status_code,
                    'time': time.time() - start_time
                }
            
            # 5. Logout
            response = client.get('/logout')
            results['logout'] = {
                'status': response.status_code,
                'time': time.time() - start_time
            }
            
            return results
            
        except Exception as e:
            return {'error': str(e)}
    
    def test_concurrent_users_performance(self):
        """Test performance with 100 concurrent users"""
        # Configure number of users and concurrency
        num_concurrent_users = 100
        timeout = 30  # Seconds
        
        # Select departments to test with
        dept_codes = list(self.departments.keys())
        
        # Function to run for each simulated user
        def user_task(user_id):
            # Rotate through department codes and user types
            dept_code = dept_codes[user_id % len(dept_codes)]
            user_type = user_id % 3  # admin, manager, user
            return self.simulate_user_session(user_type, dept_code)
        
        # Run concurrent users
        results = []
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=num_concurrent_users) as executor:
            # Submit all tasks
            futures = [executor.submit(user_task, i) for i in range(num_concurrent_users)]
            
            # Collect results
            for future in futures:
                try:
                    result = future.result(timeout=timeout)
                    results.append(result)
                except Exception as e:
                    results.append({'error': str(e)})
        
        # Calculate total elapsed time
        total_elapsed = time.time() - start_time
        
        # Analyze results
        success_count = sum(1 for r in results if 'error' not in r)
        
        # Extract timing information
        dashboard_times = [r.get('dashboard', {}).get('time', 0) for r in results if 'dashboard' in r]
        incidents_times = [r.get('incidents', {}).get('time', 0) for r in results if 'incidents' in r]
        map_times = [r.get('map', {}).get('time', 0) for r in results if 'map' in r]
        
        # Check success rate
        success_rate = success_count / num_concurrent_users
        self.assertGreaterEqual(success_rate, 0.95, 
                               f"Success rate too low: {success_rate:.2%} ({success_count}/{num_concurrent_users})")
        
        # Check response times are reasonable
        if dashboard_times:
            avg_dashboard = statistics.mean(dashboard_times)
            self.assertLess(avg_dashboard, 2.0, f"Dashboard average response time too high: {avg_dashboard:.2f}s")
            
        if incidents_times:
            avg_incidents = statistics.mean(incidents_times)
            self.assertLess(avg_incidents, 3.0, f"Incidents list average response time too high: {avg_incidents:.2f}s")
            
        if map_times:
            avg_map = statistics.mean(map_times)
            self.assertLess(avg_map, 5.0, f"Map average response time too high: {avg_map:.2f}s")
        
        # Check total test execution time
        self.assertLess(total_elapsed, 60.0, 
                       f"Total time for {num_concurrent_users} concurrent users: {total_elapsed:.2f}s is too slow")


class DatabasePerformanceTests(SimpleDepartmentTestBase):
    """Tests for database query performance"""
    
    def test_complex_query_performance(self):
        """Test performance of complex queries with joins and filters"""
        # Set up parameters for a complex query
        query_params = {
            'start_date': '2023-01-01',
            'end_date': '2023-12-31',
            'incident_types': ['FIRE', 'HAZMAT'],
            'stations': [1, 2, 3],
            'priority': ['HIGH', 'MEDIUM'],
            'status': 'COMPLETED',
            'sort': 'response_time',
            'sort_dir': 'desc',
            'limit': 100,
            'page': 1
        }
        
        # Make the request with complex filtering
        start_time = time.time()
        response = self.client.get('/api/incidents/search', query_string=query_params)
        elapsed_time = time.time() - start_time
        
        # Check response is successful
        self.assertEqual(response.status_code, 200)
        
        # Check that it returns in a reasonable time
        self.assertLess(elapsed_time, 3.0, 
                       f"Complex query took {elapsed_time:.2f}s which is too slow")
        
        # Verify the response format
        data = json.loads(response.data.decode('utf-8'))
        self.assertIn('incidents', data)
        self.assertIn('pagination', data)
    
    def test_report_generation_performance(self):
        """Test performance of generating a large report"""
        # Set up parameters for a comprehensive report
        report_params = {
            'report_type': 'comprehensive',
            'start_date': '2023-01-01',
            'end_date': '2023-12-31',
            'include_response_times': True,
            'include_incident_types': True,
            'include_station_breakdown': True,
            'include_temporal_analysis': True,
            'include_geographic_analysis': True,
            'format': 'json'  # Could be json, csv, xlsx
        }
        
        # Make the request for report generation
        start_time = time.time()
        response = self.client.get('/api/reports/generate', query_string=report_params)
        elapsed_time = time.time() - start_time
        
        # Check response is successful
        self.assertEqual(response.status_code, 200)
        
        # Check that it returns in a reasonable time
        # Reports can be complex, but should not take more than 10 seconds
        self.assertLess(elapsed_time, 10.0, 
                       f"Report generation took {elapsed_time:.2f}s which is too slow")
        
        # Verify the response has the expected sections
        data = json.loads(response.data.decode('utf-8'))
        self.assertIn('report', data)
        self.assertIn('metadata', data)
        self.assertIn('data', data['report'])


class MapRenderingPerformanceTests(SimpleDepartmentTestBase):
    """Tests for map rendering performance"""
    
    def test_geojson_optimization(self):
        """Test optimization of GeoJSON data for complex polygons"""
        # Request district boundaries - often complex GeoJSON shapes
        # that need optimization for browser rendering
        tolerance_levels = [0.0001, 0.001, 0.01]  # Different simplification levels
        
        results = []
        sizes = []
        
        # Test each tolerance level
        for tolerance in tolerance_levels:
            # Request optimized GeoJSON
            start_time = time.time()
            response = self.client.get(f'/api/map/boundaries?tolerance={tolerance}')
            elapsed_time = time.time() - start_time
            
            # Check response is successful
            self.assertEqual(response.status_code, 200)
            
            # Store results
            data = response.data.decode('utf-8')
            data_size = len(data)
            sizes.append(data_size)
            
            results.append({
                'tolerance': tolerance,
                'time': elapsed_time,
                'size': data_size
            })
        
        # Verify that higher tolerance reduces data size
        self.assertGreater(sizes[0], sizes[1], "Medium tolerance should reduce data size")
        self.assertGreater(sizes[1], sizes[2], "High tolerance should reduce data size further")
        
        # Verify that the highest detail level still returns in reasonable time
        self.assertLess(results[0]['time'], 5.0, 
                       f"High detail rendering took {results[0]['time']:.2f}s which is too slow")
    
    def test_marker_clustering_performance(self):
        """Test performance of marker clustering with many points"""
        # Create a large number of points
        num_points = 10000
        points = []
        
        for i in range(num_points):
            # Create a grid of points across the map
            lat = 33.0 + (i % 100) * 0.01
            lng = -112.0 + (i // 100) * 0.01
            
            points.append({
                'id': i,
                'latitude': lat,
                'longitude': lng,
                'type': ['incident', 'hydrant', 'hazard'][i % 3],
                'name': f'Point {i}'
            })
        
        # Test with different clustering distances
        for distance in [20, 50, 100]:  # Pixels
            with patch('app.get_map_points', return_value=points):
                # Request clustered points
                start_time = time.time()
                response = self.client.get(f'/api/map/points?cluster=true&clusterDistance={distance}')
                elapsed_time = time.time() - start_time
                
                # Check response is successful
                self.assertEqual(response.status_code, 200)
                
                # Verify clustering reduces point count
                data = json.loads(response.data.decode('utf-8'))
                
                if 'clusters' in data:
                    # If results are clusters
                    self.assertLess(len(data['clusters']), num_points, 
                                  f"Clustering with distance {distance} did not reduce point count")
                    
                    # Higher distances should produce fewer clusters
                    if distance > 20:
                        # Store the previous cluster count for comparison
                        # This assumes the test runs with distances in increasing order
                        if 'prev_cluster_count' in locals():
                            self.assertLess(len(data['clusters']), prev_cluster_count, 
                                          f"Higher distance {distance} did not reduce cluster count")
                        
                        prev_cluster_count = len(data['clusters'])
                elif 'points' in data:
                    # If results are individual points, should still be limited
                    self.assertLess(len(data['points']), num_points)
                
                # Check that it returns in a reasonable time
                self.assertLess(elapsed_time, 3.0, 
                               f"Clustering {num_points} points took {elapsed_time:.2f}s which is too slow")


# Run tests if executed directly
if __name__ == "__main__":
    unittest.main()