"""
Test script to check database connectivity

This script tests the connection to your Render Postgres database.
Run it with:

python test_db.py
"""

import os
from dotenv import load_dotenv
import psycopg2
import sys

# Load environment variables
load_dotenv()

def test_connection():
    """Test database connection"""
    # Get the DATABASE_URL from environment
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        print("❌ Error: DATABASE_URL environment variable is not set.")
        print("Make sure to update your .env file with the correct DATABASE_URL from Render.")
        return False
    
    # Extract connection parameters from the URL
    if database_url.startswith('postgres://'):
        # Render uses this format: postgres://user:password@host:port/dbname
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    # Test connection
    try:
        print(f"🔍 Testing connection to database...")
        # Use the connection string directly
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        cursor.execute('SELECT version();')
        db_version = cursor.fetchone()
        
        print(f"✅ Connection successful!")
        print(f"Database version: {db_version[0]}")
        
        # Try to create a test table
        print(f"🔍 Testing table creation...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS connection_test (
                id SERIAL PRIMARY KEY,
                test_name VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        
        # Insert a test record
        cursor.execute('''
            INSERT INTO connection_test (test_name) VALUES ('Connection test successful')
        ''')
        conn.commit()
        
        # Check if the record was inserted
        cursor.execute('SELECT COUNT(*) FROM connection_test')
        count = cursor.fetchone()[0]
        
        print(f"✅ Table creation and data insertion successful. {count} test records in table.")
        
        # Clean up
        print(f"🧹 Cleaning up test data...")
        cursor.execute('DROP TABLE connection_test')
        conn.commit()
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error connecting to database: {str(e)}")
        print("\nCheck your DATABASE_URL in the .env file. It should look like:")
        print("DATABASE_URL=postgres://username:password@host:port/dbname")
        return False

if __name__ == "__main__":
    print("\n=== Database Connection Test ===\n")
    success = test_connection()
    print("\n================================\n")
    
    if success:
        print("✅ All database tests passed! Your connection to Render PostgreSQL is working.")
        print("You can now run the init_db.py script to initialize your database.")
        sys.exit(0)
    else:
        print("❌ Database test failed. Please check the error messages above.")
        sys.exit(1)