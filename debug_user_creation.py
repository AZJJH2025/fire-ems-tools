#!/usr/bin/env python3
"""
Debug script to test user creation API
"""
import requests
import json
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def test_user_creation():
    """Test the admin user creation API"""
    
    # Create a session with retry strategy
    session = requests.Session()
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    
    base_url = "http://127.0.0.1:5000"
    
    print("🔧 Testing Admin User Creation API")
    print("=" * 50)
    
    # Step 1: Test basic connectivity
    try:
        response = session.get(f"{base_url}/")
        print(f"✅ Server connectivity: {response.status_code}")
    except Exception as e:
        print(f"❌ Server not reachable: {e}")
        return
    
    # Step 2: Test admin API without auth
    try:
        response = session.get(f"{base_url}/admin/api/users")
        print(f"📋 Admin API (no auth): {response.status_code}")
        if response.status_code == 401:
            print("   → Authentication required (expected)")
        elif response.status_code == 403:
            print("   → Forbidden (expected without proper auth)")
    except Exception as e:
        print(f"❌ Admin API error: {e}")
    
    # Step 3: Try to login first
    print("\n🔐 Testing Authentication")
    login_data = {
        "email": "admin@fireems.ai",
        "password": "admin123"
    }
    
    try:
        response = session.post(f"{base_url}/auth/api/login", json=login_data)
        print(f"🔐 Login attempt: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            login_result = response.json()
            print(f"   → User: {login_result.get('user', {}).get('email', 'unknown')}")
            print(f"   → Role: {login_result.get('user', {}).get('role', 'unknown')}")
            
            # Step 4: Test user creation with authenticated session
            print("\n👤 Testing User Creation")
            user_data = {
                "name": "Debug Test User",
                "email": "debug@test.com",
                "role": "user",
                "department_id": 1,
                "send_invite": True
            }
            
            response = session.post(f"{base_url}/admin/api/users", json=user_data)
            print(f"👤 User creation: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ User creation successful!")
                print(f"   → Response: {json.dumps(result, indent=2)}")
            else:
                print(f"❌ User creation failed")
                print(f"   → Response: {response.text}")
                
        else:
            print(f"❌ Login failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Authentication error: {e}")
    
    # Step 5: Test user listing
    print("\n📋 Testing User List")
    try:
        response = session.get(f"{base_url}/admin/api/users")
        print(f"📋 User list: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Found {len(result.get('users', []))} users")
        else:
            print(f"❌ User list failed: {response.text}")
            
    except Exception as e:
        print(f"❌ User list error: {e}")

if __name__ == "__main__":
    test_user_creation()