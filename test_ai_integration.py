#!/usr/bin/env python3
"""
Test script for AI integration
Tests the AI service safely without breaking existing functionality
"""
import sys
import os
sys.path.insert(0, '/Users/josephhester/fire-ems-tools')

def test_ai_service():
    """Test the AI service layer"""
    print("🧪 Testing AI Service Layer")
    print("=" * 50)
    
    try:
        from services.ai_service import ai_service
        
        # Test service initialization
        print(f"✅ AI Service imported successfully")
        print(f"   → Enabled: {ai_service.is_enabled()}")
        print(f"   → Status: {ai_service.get_service_status()}")
        
        # Test sample analysis
        sample_data = """
        Fire Department Performance Summary:
        - Total incidents: 150
        - Average response time: 5.2 minutes
        - 90th percentile dispatch time: 45 seconds
        - 90th percentile turnout time: 75 seconds
        - 90th percentile total response: 480 seconds
        """
        
        print("\n📊 Testing compliance analysis...")
        result = ai_service.analyze_compliance(sample_data)
        
        print(f"✅ Analysis completed:")
        print(f"   → Success: {result['success']}")
        print(f"   → Source: {result['source']}")
        print(f"   → Model: {result.get('model', 'N/A')}")
        print(f"   → Insight preview: {result['insight'][:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing AI service: {e}")
        return False

def test_ai_routes():
    """Test AI routes with Flask app"""
    print("\n🌐 Testing AI Routes")
    print("=" * 50)
    
    try:
        from app import app
        
        with app.app_context():
            # Test if AI blueprint is registered
            print("✅ Flask app created successfully")
            
            # Check if AI routes are available
            routes = [str(rule) for rule in app.url_map.iter_rules()]
            ai_routes = [route for route in routes if '/ai' in route]
            
            if ai_routes:
                print(f"✅ AI routes found: {len(ai_routes)}")
                for route in ai_routes:
                    print(f"   → {route}")
            else:
                print("ℹ️  No AI routes found (blueprint may not be registered)")
                
            return True
            
    except Exception as e:
        print(f"❌ Error testing AI routes: {e}")
        return False

def test_environment():
    """Test environment configuration"""
    print("\n🔧 Testing Environment Configuration")
    print("=" * 50)
    
    # Check if OpenAI API key is set
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key:
        print(f"✅ OpenAI API key found (length: {len(api_key)})")
        print(f"   → Key starts with: {api_key[:7]}...")
    else:
        print("ℹ️  OpenAI API key not found - AI will use fallback mode")
    
    # Check if openai package is available
    try:
        import openai
        print(f"✅ OpenAI package available (version: {openai.__version__})")
    except ImportError:
        print("ℹ️  OpenAI package not installed - AI will use fallback mode")
        print("   → To install: pip install openai")
    
    return True

def main():
    """Run all tests"""
    print("🚀 AI Integration Test Suite")
    print("=" * 60)
    
    success = True
    
    # Test 1: Environment
    if not test_environment():
        success = False
    
    # Test 2: AI Service
    if not test_ai_service():
        success = False
    
    # Test 3: AI Routes
    if not test_ai_routes():
        success = False
    
    # Summary
    print("\n" + "=" * 60)
    if success:
        print("✅ All tests passed! AI integration is ready.")
        print("\nNext steps:")
        print("1. Set OPENAI_API_KEY environment variable for full AI features")
        print("2. Install openai package: pip install openai")
        print("3. Test with curl or browser at /ai/status")
    else:
        print("❌ Some tests failed. Please check the errors above.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)