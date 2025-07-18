#!/usr/bin/env python3
"""
Debug script to check admin user in production
"""
import os
import sys
sys.path.insert(0, '/Users/josephhester/fire-ems-tools')

from app import app
from database import db, User, Department
from werkzeug.security import check_password_hash

def debug_admin_user():
    """Debug admin user in production database"""
    
    with app.app_context():
        print("🔍 Debugging Admin User")
        print("=" * 40)
        
        # Check if admin user exists
        admin_user = User.query.filter_by(email='admin@fireems.ai').first()
        
        if admin_user:
            print(f"✅ Admin user found:")
            print(f"   → ID: {admin_user.id}")
            print(f"   → Email: {admin_user.email}")
            print(f"   → Name: {admin_user.name}")
            print(f"   → Role: {admin_user.role}")
            print(f"   → Active: {admin_user.is_active}")
            print(f"   → Department ID: {admin_user.department_id}")
            print(f"   → Has password hash: {bool(admin_user.password_hash)}")
            print(f"   → Password hash length: {len(admin_user.password_hash) if admin_user.password_hash else 0}")
            
            # Test password verification
            test_password = 'admin123'
            if admin_user.password_hash:
                password_correct = check_password_hash(admin_user.password_hash, test_password)
                print(f"   → Password 'admin123' correct: {password_correct}")
            else:
                print(f"   → ❌ No password hash set!")
                
            # Check department
            if admin_user.department:
                print(f"   → Department: {admin_user.department.name}")
            else:
                print(f"   → ❌ No department assigned!")
                
        else:
            print("❌ Admin user not found!")
            
            # Check if any users exist
            all_users = User.query.all()
            print(f"📊 Total users in database: {len(all_users)}")
            
            if all_users:
                print("👥 Existing users:")
                for user in all_users[:5]:  # Show first 5 users
                    print(f"   → {user.email} ({user.role})")
            else:
                print("❌ No users found in database!")
                
        # Check departments
        print("\n🏢 Departments:")
        departments = Department.query.all()
        print(f"📊 Total departments: {len(departments)}")
        
        for dept in departments:
            print(f"   → {dept.name} (ID: {dept.id})")

if __name__ == "__main__":
    debug_admin_user()