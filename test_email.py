#!/usr/bin/env python3
"""
Email Service Test Script
Test email functionality with current environment variables
"""

import os
import sys
from email_service import EmailService

def test_email_service():
    """Test email service configuration and functionality"""
    print("🧪 Testing Email Service Configuration...")
    
    # Check environment variables
    print("\n📧 Email Environment Variables:")
    email_vars = [
        'EMAIL_ENABLED',
        'SMTP_SERVER', 
        'SMTP_PORT',
        'SMTP_USE_TLS',
        'SMTP_USERNAME',
        'SMTP_PASSWORD',
        'EMAIL_FROM',
        'EMAIL_FROM_NAME'
    ]
    
    for var in email_vars:
        value = os.environ.get(var, 'NOT SET')
        # Hide password for security
        if 'PASSWORD' in var:
            value = '***HIDDEN***' if value != 'NOT SET' else 'NOT SET'
        print(f"  {var}: {value}")
    
    # Test email service
    print("\n🔧 Email Service Status:")
    email_enabled = os.environ.get('EMAIL_ENABLED', 'false').lower() == 'true'
    
    if email_enabled:
        print("  ✅ Email is ENABLED")
        smtp_server = os.environ.get('SMTP_SERVER')
        smtp_port = os.environ.get('SMTP_PORT')
        print(f"  📡 SMTP: {smtp_server}:{smtp_port}")
        
        # Test basic email functionality (won't send, just validate)
        try:
            from flask import Flask
            app = Flask(__name__)
            
            # Add email config to app
            app.config['EMAIL_ENABLED'] = email_enabled
            app.config['SMTP_SERVER'] = os.environ.get('SMTP_SERVER')
            app.config['SMTP_PORT'] = int(os.environ.get('SMTP_PORT', 587))
            app.config['SMTP_USE_TLS'] = os.environ.get('SMTP_USE_TLS', 'true').lower() == 'true'
            app.config['SMTP_USERNAME'] = os.environ.get('SMTP_USERNAME')
            app.config['SMTP_PASSWORD'] = os.environ.get('SMTP_PASSWORD')
            app.config['EMAIL_FROM'] = os.environ.get('EMAIL_FROM')
            app.config['EMAIL_FROM_NAME'] = os.environ.get('EMAIL_FROM_NAME')
            
            with app.app_context():
                email_service = EmailService()
                email_service.init_app(app)
                print("  ✅ Email service initialized successfully")
                
                # Test email (will be logged but not sent)
                result = email_service.send_email(
                    to_email="test@example.com",
                    subject="Test Email - FireEMS.ai Setup",
                    body="This is a test email to verify email service configuration."
                )
                
                if result:
                    print("  ✅ Test email processed successfully")
                else:
                    print("  ❌ Test email failed")
                    
        except Exception as e:
            print(f"  ❌ Email service error: {str(e)}")
            
    else:
        print("  ⚠️  Email is DISABLED")
        print("  💡 Set EMAIL_ENABLED=true to enable email functionality")
    
    print("\n🎯 Recommendations:")
    if not email_enabled:
        print("  1. Verify all email environment variables are set correctly")
        print("  2. Ensure Microsoft 365 mailbox is created and accessible")
        print("  3. Set EMAIL_ENABLED=true in Render environment variables")
    else:
        print("  1. Email appears to be configured correctly")
        print("  2. Test by creating a user or approving a department request")
        print("  3. Check admin console notifications for email status")

if __name__ == '__main__':
    test_email_service()