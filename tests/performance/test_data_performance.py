"""
Performance tests for data handling.

These tests measure the performance of loading, saving, and processing test data.
"""

import asyncio
import time
import json
import sys
import unittest
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import statistics

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from utilities.test_data_manager import data_manager
from utilities.setup_test_database import load_fixture_to_database


class DataPerformanceTests(unittest.TestCase):
    """Performance tests for data handling operations."""
    
    @classmethod
    def setUpClass(cls):
        """Set up the test fixture for the entire test class."""
        # Load the large test fixture for performance testing
        cls.fixture_name = "large_test"
        cls.fixture = data_manager.get_fixture(cls.fixture_name)
        
        # Set up a temporary database path
        cls.db_path = str(Path(__file__).parent / "temp_perf_test.db")
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests in the class have been run."""
        # Reset data manager
        data_manager.reset_all()
        
        # Remove the temporary database
        db_path = Path(cls.db_path)
        if db_path.exists():
            db_path.unlink()
    
    def test_dataset_loading_performance(self):
        """Test the performance of loading datasets."""
        # Measure the time it takes to load all datasets
        start_time = time.time()
        
        # Load all datasets
        datasets = []
        for dataset_info in self.fixture.datasets:
            dataset = data_manager.get_dataset(
                dataset_info["name"], dataset_info["category"]
            )
            datasets.append(dataset)
        
        end_time = time.time()
        load_time = end_time - start_time
        
        print(f"\nLoaded {len(datasets)} datasets in {load_time:.4f} seconds")
        print(f"Average load time per dataset: {load_time / len(datasets):.4f} seconds")
        
        # Assert that loading is reasonably fast
        # Should take less than 0.1 seconds per dataset on average
        self.assertLess(load_time / len(datasets), 0.1)
    
    def test_database_loading_performance(self):
        """Test the performance of loading data into the database."""
        # Measure the time it takes to load the fixture into a database
        start_time = time.time()
        
        # Load the fixture into the database
        conn = load_fixture_to_database(self.fixture_name, self.db_path, overwrite=True)
        
        end_time = time.time()
        load_time = end_time - start_time
        
        print(f"\nLoaded fixture into database in {load_time:.4f} seconds")
        
        # Get row counts for each table
        cursor = conn.cursor()
        table_counts = {}
        for table in ["departments", "stations", "users", "incidents"]:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            table_counts[table] = cursor.fetchone()[0]
        
        print(f"Database contains: {table_counts}")
        
        total_rows = sum(table_counts.values())
        print(f"Total rows: {total_rows}")
        print(f"Average load time per row: {load_time / total_rows:.6f} seconds")
        
        # Close the connection
        conn.close()
        
        # Assert that loading is reasonably fast
        # Should take less than 0.01 seconds per row on average
        self.assertLess(load_time / total_rows, 0.01)
    
    def test_parallel_dataset_access(self):
        """Test the performance of accessing datasets in parallel."""
        # Define a function to load a dataset
        def load_dataset(dataset_info):
            dataset = data_manager.get_dataset(
                dataset_info["name"], dataset_info["category"]
            )
            return len(dataset.data)
        
        # Measure the time it takes to load all datasets in parallel
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=8) as executor:
            results = list(executor.map(load_dataset, self.fixture.datasets))
        
        end_time = time.time()
        load_time = end_time - start_time
        
        print(f"\nLoaded {len(results)} datasets in parallel in {load_time:.4f} seconds")
        print(f"Average load time per dataset: {load_time / len(results):.4f} seconds")
        
        # Assert that parallel loading is faster than sequential loading
        # This is just a rough check - the actual improvement depends on the system
        sequential_time = 0.05 * len(self.fixture.datasets)  # Estimated sequential time
        self.assertLess(load_time, sequential_time)
    
    def test_query_performance(self):
        """Test the performance of querying the database."""
        # Load the fixture into the database
        conn = load_fixture_to_database(self.fixture_name, self.db_path, overwrite=True)
        cursor = conn.cursor()
        
        # Get a sample department ID
        cursor.execute("SELECT id FROM departments LIMIT 1")
        department_id = cursor.fetchone()[0]
        
        # Define queries to test
        queries = [
            ("Simple count", 
             "SELECT COUNT(*) FROM incidents"),
            ("Filtered count", 
             "SELECT COUNT(*) FROM incidents WHERE category = 'EMS'"),
            ("Join query", 
             """
             SELECT s.name, COUNT(i.id)
             FROM stations s
             LEFT JOIN incidents i ON s.department_id = i.department_id
             GROUP BY s.name
             """),
            ("Complex join", 
             """
             SELECT d.name, COUNT(i.id)
             FROM departments d
             JOIN stations s ON d.id = s.department_id
             JOIN incidents i ON d.id = i.department_id
             WHERE i.category = 'Fire'
             GROUP BY d.name
             """),
            ("Department incidents", 
             f"SELECT COUNT(*) FROM incidents WHERE department_id = '{department_id}'"),
        ]
        
        # Run each query and measure performance
        results = []
        for name, query in queries:
            # Run the query multiple times to get an average
            times = []
            for _ in range(5):
                start_time = time.time()
                cursor.execute(query)
                cursor.fetchall()
                end_time = time.time()
                times.append(end_time - start_time)
            
            # Calculate statistics
            avg_time = statistics.mean(times)
            median_time = statistics.median(times)
            min_time = min(times)
            max_time = max(times)
            
            results.append({
                "query": name,
                "avg_time": avg_time,
                "median_time": median_time,
                "min_time": min_time,
                "max_time": max_time
            })
        
        # Print results
        print("\nQuery Performance:")
        for result in results:
            print(f"  {result['query']}:")
            print(f"    Avg: {result['avg_time']:.6f}s")
            print(f"    Median: {result['median_time']:.6f}s")
            print(f"    Min: {result['min_time']:.6f}s")
            print(f"    Max: {result['max_time']:.6f}s")
        
        # Close the connection
        conn.close()
        
        # Assert that queries are reasonably fast
        # Most queries should complete in less than 0.1 seconds
        for result in results:
            self.assertLess(result['median_time'], 0.1)


class AsyncDataPerformanceTests(unittest.TestCase):
    """Asynchronous performance tests for data handling operations."""
    
    @classmethod
    def setUpClass(cls):
        """Set up the test fixture for the entire test class."""
        # Load the large test fixture for performance testing
        cls.fixture_name = "large_test"
        cls.fixture = data_manager.get_fixture(cls.fixture_name)
        
        # Set up a temporary database path
        cls.db_path = str(Path(__file__).parent / "temp_async_perf_test.db")
        
        # Load the fixture into the database
        conn = load_fixture_to_database(cls.fixture_name, cls.db_path, overwrite=True)
        conn.close()
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests in the class have been run."""
        # Reset data manager
        data_manager.reset_all()
        
        # Remove the temporary database
        db_path = Path(cls.db_path)
        if db_path.exists():
            db_path.unlink()
    
    async def async_query(self, query):
        """Run a query asynchronously."""
        # This is a simulation of an async query - in a real app, you'd use
        # an async database driver like aiosqlite
        loop = asyncio.get_event_loop()
        
        def run_query():
            import sqlite3
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(query)
            result = cursor.fetchall()
            conn.close()
            return result
        
        return await loop.run_in_executor(None, run_query)
    
    async def run_parallel_queries(self, queries, concurrency=10):
        """Run multiple queries in parallel."""
        tasks = []
        for _ in range(concurrency):
            for query in queries:
                tasks.append(self.async_query(query))
        
        return await asyncio.gather(*tasks)
    
    def test_concurrent_queries(self):
        """Test the performance of running queries concurrently."""
        # Define queries to test
        queries = [
            "SELECT COUNT(*) FROM incidents WHERE category = 'EMS'",
            "SELECT COUNT(*) FROM incidents WHERE category = 'Fire'",
            "SELECT COUNT(*) FROM incidents WHERE category = 'Service'",
            "SELECT COUNT(*) FROM stations",
            "SELECT COUNT(*) FROM users WHERE role = 'Firefighter/EMT'"
        ]
        
        # Set concurrency level
        concurrency = 10
        
        # Measure the time it takes to run all queries concurrently
        start_time = time.time()
        
        # Run the queries
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        results = loop.run_until_complete(self.run_parallel_queries(queries, concurrency))
        loop.close()
        
        end_time = time.time()
        query_time = end_time - start_time
        
        total_queries = len(queries) * concurrency
        print(f"\nRan {total_queries} queries concurrently in {query_time:.4f} seconds")
        print(f"Average time per query: {query_time / total_queries:.6f} seconds")
        print(f"Queries per second: {total_queries / query_time:.2f}")
        
        # Assert that concurrent querying is reasonably fast
        # Should be able to handle at least 100 queries per second
        self.assertGreater(total_queries / query_time, 100)


if __name__ == "__main__":
    unittest.main()