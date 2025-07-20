#!/usr/bin/env python3
"""
Test CDN Caching Optimization

Simple test to verify that CDN caching headers are being applied correctly
to static assets in the Fire EMS Tools application.
"""

import sys
import os

# Add the project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

def test_caching_policies():
    """Test that different file types get appropriate caching policies."""
    print("Testing CDN Caching Policies...")
    print("=" * 50)
    
    try:
        from utils.cdn_caching import get_cache_policy_info, get_environment_config
        
        test_files = [
            # Immutable assets (should get 1 year cache)
            ('index-abc12345.js', 'immutable'),
            ('main-def67890.css', 'immutable'),
            ('logo-123abcde.png', 'immutable'),
            
            # Stable assets (should get 1 week cache)
            ('font.woff2', 'stable'),
            ('font.ttf', 'stable'),
            ('favicon.ico', 'stable'),
            ('manifest.json', 'stable'),
            
            # Dynamic assets (should get 1 hour cache)
            ('main.js', 'dynamic'),
            ('styles.css', 'dynamic'),
            ('image.png', 'dynamic'),
            
            # No cache assets
            ('index.html', 'no_cache'),
            ('api.json', 'no_cache'),
        ]
        
        success_count = 0
        total_count = len(test_files)
        
        for filename, expected_policy in test_files:
            policy_info = get_cache_policy_info(filename)
            actual_policy = policy_info['policy']
            max_age = policy_info['max_age']
            
            status = "✅ PASS" if actual_policy == expected_policy else "❌ FAIL"
            print(f"{filename:<25} → {actual_policy:<10} ({max_age:>8}s) {status}")
            
            if actual_policy == expected_policy:
                success_count += 1
            else:
                print(f"   Expected: {expected_policy}, Got: {actual_policy}")
        
        print(f"\nResults: {success_count}/{total_count} tests passed")
        
        if success_count == total_count:
            print("🎉 All caching policy tests passed!")
        else:
            print("⚠️  Some caching policy tests failed")
            
        return success_count == total_count
        
    except ImportError as e:
        print(f"❌ Could not import CDN caching module: {e}")
        return False
    except Exception as e:
        print(f"❌ Error testing caching policies: {e}")
        return False


def test_environment_config():
    """Test environment configuration detection."""
    print("\nTesting Environment Configuration...")
    print("=" * 40)
    
    try:
        from utils.cdn_caching import get_environment_config
        
        config = get_environment_config()
        
        print("Environment Configuration:")
        for key, value in config.items():
            print(f"  {key}: {value}")
        
        # Basic validation
        required_keys = ['enable_long_cache', 'enable_etags', 'enable_compression_hints', 
                        'debug_headers', 'cdn_provider']
        
        missing_keys = [key for key in required_keys if key not in config]
        
        if missing_keys:
            print(f"❌ Missing configuration keys: {missing_keys}")
            return False
        else:
            print("✅ All required configuration keys present")
            return True
            
    except Exception as e:
        print(f"❌ Error testing environment config: {e}")
        return False


def test_asset_classification():
    """Test asset type classification."""
    print("\nTesting Asset Classification...")
    print("=" * 35)
    
    try:
        from utils.cdn_caching import asset_optimizer
        
        test_assets = [
            ('script.js', 'script'),
            ('module.jsx', 'script'),
            ('styles.css', 'stylesheet'),
            ('logo.png', 'image'),
            ('icon.svg', 'image'),
            ('font.woff2', 'font'),
            ('page.html', 'document'),
            ('data.txt', 'other'),
        ]
        
        success_count = 0
        
        for filename, expected_type in test_assets:
            actual_type = asset_optimizer._classify_asset(filename)
            status = "✅ PASS" if actual_type == expected_type else "❌ FAIL"
            print(f"{filename:<15} → {actual_type:<10} {status}")
            
            if actual_type == expected_type:
                success_count += 1
        
        print(f"\nAsset classification: {success_count}/{len(test_assets)} passed")
        return success_count == len(test_assets)
        
    except Exception as e:
        print(f"❌ Error testing asset classification: {e}")
        return False


def main():
    """Run all CDN caching tests."""
    print("Fire EMS Tools - CDN Caching Test")
    print("=" * 60)
    
    tests = [
        ("Caching Policies", test_caching_policies),
        ("Environment Config", test_environment_config),
        ("Asset Classification", test_asset_classification),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name} test...")
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} test completed successfully")
            else:
                print(f"❌ {test_name} test failed")
        except Exception as e:
            print(f"💥 {test_name} test crashed: {e}")
    
    print(f"\n" + "=" * 60)
    print(f"Test Summary: {passed}/{total} test suites passed")
    
    if passed == total:
        print("🎉 All CDN caching tests passed! Optimization is working correctly.")
        return True
    else:
        print("⚠️  Some CDN caching tests failed. Check implementation.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)