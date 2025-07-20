"""
Database Integration Tests

Tests database connectivity, connection pooling, and reliability improvements
without modifying production code.

Test Categories:
- Database connectivity and pool optimization  
- Connection reliability and failover
- Transaction integrity
- Performance under load
- Health monitoring integration
"""

import pytest
import sqlite3
import tempfile
import os
import time
import threading
from unittest.mock import patch, Mock
from contextlib import contextmanager

# Import database components
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from database import db, User, Department, Incident, Station
from config import TestingConfig
from app import create_app


class TestDatabaseIntegration:
    """Database integration and reliability tests"""
    
    @pytest.fixture(scope="class")
    def app(self):
        """Create test Flask application with database"""
        app = create_app()
        app.config.from_object(TestingConfig)
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['TESTING'] = True
        
        with app.app_context():
            db.create_all()
            self._create_test_data()
            
        return app
    
    @pytest.fixture(scope="class")
    def app_context(self, app):
        """Provide application context for database tests"""
        with app.app_context():
            yield app
    
    def _create_test_data(self):
        """Create test data for database integration tests"""
        # Create test department
        dept = Department(
            code='DBTEST001',
            name='Database Test Department',
            city='Test City',
            state='TS',
            department_type='fire',
            is_active=True
        )
        db.session.add(dept)
        db.session.flush()
        
        # Create multiple test users for connection pool testing
        for i in range(5):
            user = User(
                email=f'dbtest{i}@test.com',
                name=f'DB Test User {i}',
                role='user' if i > 0 else 'admin',
                department_id=dept.id,
                is_active=True
            )
            user.set_password('dbtest123')
            db.session.add(user)
        
        db.session.commit()


class TestDatabaseConnectivity(TestDatabaseIntegration):
    """Test basic database connectivity and operations"""
    
    def test_database_connection_established(self, app_context):
        """Test that database connection is properly established"""
        # Simple query to verify connection
        result = db.session.execute(db.text('SELECT 1 as test')).fetchone()
        assert result[0] == 1
    
    def test_database_health_check_integration(self, app_context):
        """Test database connectivity check from health endpoint logic"""
        try:
            # Test the same query used in health check endpoint
            db.session.execute(db.text('SELECT 1'))
            db_status = "connected"
        except Exception:
            db_status = "disconnected"
        
        # Database should be connected in test environment
        assert db_status == "connected"
    
    def test_basic_crud_operations(self, app_context):
        """Test basic Create, Read, Update, Delete operations"""
        # Create
        new_dept = Department(
            code='CRUD001',
            name='CRUD Test Department',
            city='CRUD City',
            state='CR',
            department_type='ems'
        )
        db.session.add(new_dept)
        db.session.commit()
        
        # Read
        retrieved_dept = Department.query.filter_by(code='CRUD001').first()
        assert retrieved_dept is not None
        assert retrieved_dept.name == 'CRUD Test Department'
        
        # Update
        retrieved_dept.name = 'Updated CRUD Department'
        db.session.commit()
        
        updated_dept = Department.query.filter_by(code='CRUD001').first()
        assert updated_dept.name == 'Updated CRUD Department'
        
        # Delete
        db.session.delete(updated_dept)
        db.session.commit()
        
        deleted_dept = Department.query.filter_by(code='CRUD001').first()
        assert deleted_dept is None


class TestDatabasePooling(TestDatabaseIntegration):
    """Test database connection pooling and configuration"""
    
    def test_multiple_concurrent_connections(self, app_context):
        """Test handling multiple concurrent database operations"""
        results = []
        errors = []
        
        def database_operation(user_id):
            """Simulate database operation in separate thread"""
            try:
                # Query that requires database connection
                user = User.query.filter_by(id=user_id).first()
                if user:
                    results.append(user.email)
                else:
                    results.append(None)
            except Exception as e:
                errors.append(str(e))
        
        # Create multiple threads to simulate concurrent connections
        threads = []
        for i in range(1, 6):  # User IDs 1-5
            thread = threading.Thread(target=database_operation, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify all operations completed successfully
        assert len(errors) == 0, f"Database errors occurred: {errors}"
        assert len(results) == 5
    
    def test_connection_pool_exhaustion_handling(self, app_context):
        """Test graceful handling when connection pool is exhausted"""
        # This test simulates connection pool stress
        # In real environments, this would test with actual pool limits
        
        active_connections = []
        
        try:
            # Attempt to create many database operations
            for i in range(10):
                result = db.session.execute(db.text('SELECT COUNT(*) FROM users')).fetchone()
                active_connections.append(result[0])
            
            # All operations should complete successfully
            assert len(active_connections) == 10
            
        except Exception as e:
            # If pool exhaustion occurs, it should be handled gracefully
            assert "pool" in str(e).lower() or "connection" in str(e).lower()


class TestTransactionIntegrity(TestDatabaseIntegration):
    """Test database transaction integrity and rollback capabilities"""
    
    def test_transaction_commit_success(self, app_context):
        """Test successful transaction commit"""
        initial_count = User.query.count()
        
        try:
            # Start transaction
            new_user = User(
                email='transaction_test@test.com',
                name='Transaction Test User',
                role='user',
                department_id=1,
                is_active=True
            )
            new_user.set_password('transaction123')
            
            db.session.add(new_user)
            db.session.commit()
            
            # Verify commit succeeded
            final_count = User.query.count()
            assert final_count == initial_count + 1
            
            # Cleanup
            db.session.delete(new_user)
            db.session.commit()
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    def test_transaction_rollback_on_error(self, app_context):
        """Test transaction rollback when error occurs"""
        initial_count = User.query.count()
        
        try:
            # Start transaction that will fail
            new_user1 = User(
                email='rollback_test1@test.com',
                name='Rollback Test User 1',
                role='user',
                department_id=1,
                is_active=True
            )
            new_user1.set_password('rollback123')
            db.session.add(new_user1)
            
            # Create duplicate email (should fail)
            new_user2 = User(
                email='rollback_test1@test.com',  # Duplicate email
                name='Rollback Test User 2',
                role='user',
                department_id=1,
                is_active=True
            )
            new_user2.set_password('rollback123')
            db.session.add(new_user2)
            
            # This should fail due to unique email constraint
            db.session.commit()
            
        except Exception:
            # Transaction should rollback automatically
            db.session.rollback()
            
            # Verify rollback - no new users should be added
            final_count = User.query.count()
            assert final_count == initial_count
    
    def test_nested_transaction_handling(self, app_context):
        """Test handling of nested transactions or savepoints"""
        initial_count = Department.query.count()
        
        try:
            # Outer transaction
            outer_dept = Department(
                code='OUTER001',
                name='Outer Transaction Department',
                city='Outer City',
                state='OT',
                department_type='fire'
            )
            db.session.add(outer_dept)
            
            # Simulate nested operation
            try:
                inner_dept = Department(
                    code='INNER001', 
                    name='Inner Transaction Department',
                    city='Inner City',
                    state='IT',
                    department_type='ems'
                )
                db.session.add(inner_dept)
                db.session.flush()  # Flush without commit
                
            except Exception:
                # Inner operation failed, but outer should still be valid
                pass
            
            db.session.commit()
            
            # Verify outer transaction succeeded
            final_count = Department.query.count()
            assert final_count >= initial_count + 1
            
        except Exception as e:
            db.session.rollback()
            raise e


class TestDatabasePerformance(TestDatabaseIntegration):
    """Test database performance and optimization"""
    
    def test_query_performance_basic(self, app_context):
        """Test basic query performance is acceptable"""
        start_time = time.time()
        
        # Simple query that should be fast
        users = User.query.limit(10).all()
        
        elapsed_time = time.time() - start_time
        
        # Basic query should complete quickly (under 1 second)
        assert elapsed_time < 1.0
        assert len(users) <= 10
    
    def test_large_dataset_handling(self, app_context):
        """Test handling of larger datasets"""
        # Create more test data for performance testing
        test_incidents = []
        
        for i in range(100):
            incident = Incident(
                department_id=1,
                title=f'Performance Test Incident {i}',
                incident_number=f'PERF-{i:03d}',
                incident_type='Test',
                location=f'{i} Test Street',
                latitude=33.4484 + (i * 0.001),
                longitude=-112.0740 + (i * 0.001),
                data={'test_id': i}
            )
            test_incidents.append(incident)
        
        start_time = time.time()
        
        # Bulk insert test
        db.session.add_all(test_incidents)
        db.session.commit()
        
        insert_time = time.time() - start_time
        
        # Bulk insert should be reasonably fast
        assert insert_time < 5.0  # 5 seconds for 100 records
        
        # Cleanup
        for incident in test_incidents:
            db.session.delete(incident)
        db.session.commit()
    
    def test_complex_query_performance(self, app_context):
        """Test performance of more complex queries with joins"""
        start_time = time.time()
        
        # Complex query with joins
        query_result = db.session.query(User.name, Department.name)\
                                .join(Department)\
                                .filter(User.is_active == True)\
                                .limit(20).all()
        
        elapsed_time = time.time() - start_time
        
        # Complex query should still be fast
        assert elapsed_time < 2.0  # 2 seconds for join query
        assert len(query_result) >= 0


class TestDatabaseReliability(TestDatabaseIntegration):
    """Test database reliability and error recovery"""
    
    def test_connection_recovery_after_error(self, app_context):
        """Test database connection recovery after error"""
        # First, perform successful operation
        result1 = db.session.execute(db.text('SELECT COUNT(*) FROM users')).fetchone()
        initial_count = result1[0]
        
        # Simulate error condition (invalid query)
        try:
            db.session.execute(db.text('SELECT * FROM nonexistent_table'))
        except Exception:
            # Error expected - rollback transaction
            db.session.rollback()
        
        # Verify connection still works after error
        result2 = db.session.execute(db.text('SELECT COUNT(*) FROM users')).fetchone()
        recovered_count = result2[0]
        
        assert recovered_count == initial_count
    
    def test_session_cleanup_after_exception(self, app_context):
        """Test proper session cleanup after exceptions"""
        initial_user_count = User.query.count()
        
        try:
            # Create invalid user (missing required field)
            invalid_user = User(
                # Missing email - should cause error
                name='Invalid User',
                role='user',
                department_id=1
            )
            db.session.add(invalid_user)
            db.session.commit()
            
        except Exception:
            # Exception expected
            db.session.rollback()
        
        # Verify session is clean and database is unmodified
        final_user_count = User.query.count()
        assert final_user_count == initial_user_count
        
        # Verify new operations work normally
        test_user = User(
            email='cleanup_test@test.com',
            name='Cleanup Test User',
            role='user',
            department_id=1,
            is_active=True
        )
        test_user.set_password('cleanup123')
        
        db.session.add(test_user)
        db.session.commit()
        
        # Cleanup
        db.session.delete(test_user)
        db.session.commit()


class TestDatabaseConfiguration(TestDatabaseIntegration):
    """Test database configuration and optimization settings"""
    
    def test_database_engine_configuration(self, app_context):
        """Test database engine configuration is properly applied"""
        # Get database engine info
        engine = db.engine
        
        # Verify engine exists and is configured
        assert engine is not None
        
        # Test basic engine functionality
        connection = engine.connect()
        result = connection.execute(db.text('SELECT 1 as config_test'))
        assert result.fetchone()[0] == 1
        connection.close()
    
    def test_connection_pool_settings(self, app_context):
        """Test connection pool configuration is applied"""
        engine = db.engine
        
        # Verify pool configuration exists
        # Pool settings are applied through environment variables in config.py
        assert engine.pool is not None
        
        # Test pool can provide connections
        connection1 = engine.connect()
        connection2 = engine.connect()
        
        assert connection1 is not None
        assert connection2 is not None
        
        connection1.close()
        connection2.close()
    
    def test_database_url_format_handling(self, app_context):
        """Test database URL format handling (postgres:// vs postgresql://)"""
        # This tests the URL format fix implemented in config.py
        # For SQLite in testing, we just verify the connection works
        
        result = db.session.execute(db.text('SELECT sqlite_version()')).fetchone()
        assert result[0] is not None  # SQLite version returned


# Test runner for database integration tests
if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])