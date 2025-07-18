#!/usr/bin/env python3
"""
Debug script to test production admin API specifically
"""
import requests
import json
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import sys

def test_production_admin_api():
    """Test the production admin API exactly like the frontend does"""
    
    # Create a session
    session = requests.Session()
    
    # Test production URL
    base_url = "https://fireems.ai"
    
    print("🔧 Testing Production Admin API")
    print("=" * 50)
    print(f"Base URL: {base_url}")
    print()
    
    # Step 1: Test basic connectivity
    try:
        response = session.get(f"{base_url}/")
        print(f"✅ Production server connectivity: {response.status_code}")
        print(f"   → Response headers: {dict(response.headers)}")
    except Exception as e:
        print(f"❌ Production server not reachable: {e}")
        return
    
    # Step 2: Test authentication like the frontend does
    print("\n🔐 Testing Authentication (like frontend)")
    login_data = {
        "email": "admin@fireems.ai",
        "password": "admin123"
    }
    
    try:
        response = session.post(f"{base_url}/auth/api/login", 
                              json=login_data,
                              headers={
                                  'Content-Type': 'application/json',
                                  'Accept': 'application/json'
                              })
        print(f"🔐 Login attempt: {response.status_code}")
        print(f"   → Response headers: {dict(response.headers)}")
        
        # Check if response is HTML instead of JSON
        content_type = response.headers.get('content-type', '')
        print(f"   → Content-Type: {content_type}")
        
        if 'text/html' in content_type:
            print("   → ⚠️  Response is HTML, not JSON!")
            print(f"   → Response content (first 200 chars): {response.text[:200]}")
        elif 'application/json' in content_type:
            print("   → ✅ Response is JSON")
            try:
                result = response.json()
                print(f"   → Login result: {result}")
            except Exception as e:
                print(f"   → ❌ Failed to parse JSON: {e}")
                print(f"   → Response content: {response.text[:200]}")
        else:
            print(f"   → ❌ Unexpected content type: {content_type}")
            print(f"   → Response content: {response.text[:200]}")
        
        # Step 3: Test admin API access
        print("\n👤 Testing Admin API Access")
        
        # Test GET first
        response = session.get(f"{base_url}/admin/api/users",
                             headers={
                                 'Accept': 'application/json'
                             })
        print(f"📋 GET /admin/api/users: {response.status_code}")
        print(f"   → Content-Type: {response.headers.get('content-type', 'unknown')}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"   → ✅ GET successful: {len(result.get('users', []))} users")
            except Exception as e:
                print(f"   → ❌ Failed to parse JSON: {e}")
                print(f"   → Response: {response.text[:200]}")
        else:
            print(f"   → Response: {response.text[:200]}")
        
        # Test POST (user creation)
        print("\n👤 Testing User Creation")
        user_data = {
            "name": "Debug Test User",
            "email": f"debug-{abs(hash('test'))}@test.com",  # Unique email
            "role": "user", 
            "department_id": 1,
            "send_invite": True
        }
        
        response = session.post(f"{base_url}/admin/api/users",
                              json=user_data,
                              headers={
                                  'Content-Type': 'application/json',
                                  'Accept': 'application/json'
                              })
        print(f"👤 POST /admin/api/users: {response.status_code}")
        print(f"   → Content-Type: {response.headers.get('content-type', 'unknown')}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"   → ✅ User creation successful!")
                print(f"   → Response: {json.dumps(result, indent=2)}")
            except Exception as e:
                print(f"   → ❌ Failed to parse JSON: {e}")
                print(f"   → Response: {response.text[:200]}")
        else:
            print(f"   → ❌ User creation failed")
            print(f"   → Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_production_admin_api()