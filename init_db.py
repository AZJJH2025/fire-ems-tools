"""
Database initialization script

This script creates all database tables and adds initial data.
Run this script once when setting up your application:

python init_db.py

Use --recreate flag to drop and recreate all tables:
python init_db.py --recreate
"""

import os
import sys
from app import create_app
from database import db, Department, User, Station, Incident

def init_database(recreate=False):
    """Initialize the database with tables and sample data"""
    # Use production config if on Render, otherwise development
    config_name = 'production' if os.environ.get('RENDER') else 'development'
    app = create_app(config_name)
    
    with app.app_context():
        if recreate:
            print("Dropping all tables...")
            db.drop_all()
            print("Tables dropped successfully")
            
        print("Creating database tables...")
        db.create_all()
        
        # Run migrations if needed
        try:
            from migrations.webhook_migration import run_migration
            print("Running webhook migration...")
            run_migration(db)
        except Exception as e:
            print(f"Warning: Webhook migration not run - {str(e)}")
        
        # Check if we need to create initial departments
        if Department.query.count() == 0:
            print("Adding initial departments...")
            demo_dept = Department(
                code='demo', 
                name='Demo Fire Department',
                department_type='combined',
                email='demo@example.com',
                phone='555-123-4567',
                website='https://example.com',
                address='123 Main St',
                city='Anytown',
                state='CA',
                zip_code='12345',
                num_stations=3,
                num_personnel=45,
                service_area=150.5,
                population_served=75000,
                logo_url='https://via.placeholder.com/150',
                primary_color='#3498db',
                secondary_color='#2c3e50',
                is_active=True,
                setup_complete=True,
                features_enabled={
                    'incident_logger': True,
                    'call_density': True,
                    'isochrone_map': True,
                    'dashboard': True
                },
                # Webhook settings
                webhooks_enabled=False,
                webhook_url=None,
                webhook_secret=None,
                webhook_events={
                    'incident.created': True,
                    'incident.updated': True,
                    'station.created': False,
                    'user.created': False
                }
            )
            db.session.add(demo_dept)
            db.session.flush()  # Get the ID assigned to the department
            
            # Create admin user for demo department
            admin_user = User(
                department_id=demo_dept.id,
                name='Demo Admin',
                email='admin@demo.example.com',
                role='admin'
            )
            admin_user.set_password('password123')  # Never do this in production!
            db.session.add(admin_user)
            
            # Add some stations for the demo department
            stations = [
                Station(
                    department_id=demo_dept.id,
                    name='Central Fire Station',
                    station_number='1',
                    address='123 Main St',
                    city='Anytown',
                    state='CA',
                    zip_code='12345',
                    latitude=37.7749,
                    longitude=-122.4194,
                    personnel_count=15,
                    apparatus={'engine': 2, 'ladder': 1, 'ambulance': 2}
                ),
                Station(
                    department_id=demo_dept.id,
                    name='North Side Station',
                    station_number='2',
                    address='456 North Ave',
                    city='Anytown',
                    state='CA',
                    zip_code='12345',
                    latitude=37.7850,
                    longitude=-122.4300,
                    personnel_count=12,
                    apparatus={'engine': 1, 'ambulance': 1}
                ),
                Station(
                    department_id=demo_dept.id,
                    name='East Valley Station',
                    station_number='3',
                    address='789 East Blvd',
                    city='Anytown',
                    state='CA',
                    zip_code='12346',
                    latitude=37.7650,
                    longitude=-122.4050,
                    personnel_count=18,
                    apparatus={'engine': 1, 'ladder': 1, 'ambulance': 1, 'rescue': 1}
                )
            ]
            db.session.add_all(stations)
            
            # Add a second department for testing
            test_dept = Department(
                code='test', 
                name='Test County EMS',
                department_type='ems',
                email='info@testems.example.com',
                phone='555-987-6543',
                address='456 Test Ave',
                city='Testville',
                state='NY',
                zip_code='54321',
                num_stations=1,
                service_area=75.0,
                population_served=40000,
                is_active=True,
                # Webhook settings
                webhooks_enabled=False,
                webhook_url=None,
                webhook_secret=None,
                webhook_events={
                    'incident.created': True,
                    'incident.updated': True,
                    'station.created': False,
                    'user.created': False
                }
            )
            db.session.add(test_dept)
            
            # Create a super admin user (not associated with any department)
            # This is a special user that can access the admin interface
            super_admin = User(
                department_id=demo_dept.id,  # Assign to demo department for now (could create a system department instead)
                name='System Administrator',
                email='admin@fireems.ai',
                role='super_admin'
            )
            super_admin.set_password('adminpassword')  # Never do this in production!
            db.session.add(super_admin)
            
            db.session.commit()
            print("Added demo departments and users successfully")
        else:
            print(f"Departments already exist, found {Department.query.count()} departments")
            
        print("Database initialization complete")
        
if __name__ == "__main__":
    recreate = "--recreate" in sys.argv
    init_database(recreate)