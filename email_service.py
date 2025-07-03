"""
Email Service Module for FireEMS Tools
Handles sending transactional emails for notifications, approvals, and user management
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app
import os
from typing import Optional, List

logger = logging.getLogger(__name__)

class EmailService:
    """
    Email service for sending transactional emails
    Supports SMTP configuration and email templates
    """
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize email service with Flask app"""
        # Default email configuration
        app.config.setdefault('EMAIL_ENABLED', os.environ.get('EMAIL_ENABLED', 'false').lower() == 'true')
        app.config.setdefault('SMTP_SERVER', os.environ.get('SMTP_SERVER', 'localhost'))
        app.config.setdefault('SMTP_PORT', int(os.environ.get('SMTP_PORT', 587)))
        app.config.setdefault('SMTP_USE_TLS', os.environ.get('SMTP_USE_TLS', 'true').lower() == 'true')
        app.config.setdefault('SMTP_USERNAME', os.environ.get('SMTP_USERNAME'))
        app.config.setdefault('SMTP_PASSWORD', os.environ.get('SMTP_PASSWORD'))
        app.config.setdefault('EMAIL_FROM', os.environ.get('EMAIL_FROM', 'noreply@fireems.ai'))
        app.config.setdefault('EMAIL_FROM_NAME', os.environ.get('EMAIL_FROM_NAME', 'FireEMS.ai'))
    
    def send_email(self, to_email: str, subject: str, body: str, 
                   html_body: Optional[str] = None, 
                   from_email: Optional[str] = None,
                   from_name: Optional[str] = None) -> bool:
        """
        Send an email
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Plain text body
            html_body: Optional HTML body
            from_email: Optional custom from email
            from_name: Optional custom from name
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not current_app.config.get('EMAIL_ENABLED', False):
            logger.info(f"Email disabled - would send to {to_email}: {subject}")
            return True
        
        try:
            # Email configuration
            smtp_server = current_app.config['SMTP_SERVER']
            smtp_port = current_app.config['SMTP_PORT']
            smtp_use_tls = current_app.config['SMTP_USE_TLS']
            smtp_username = current_app.config['SMTP_USERNAME']
            smtp_password = current_app.config['SMTP_PASSWORD']
            
            from_email = from_email or current_app.config['EMAIL_FROM']
            from_name = from_name or current_app.config['EMAIL_FROM_NAME']
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{from_name} <{from_email}>"
            msg['To'] = to_email
            
            # Add plain text part
            text_part = MIMEText(body, 'plain', 'utf-8')
            msg.attach(text_part)
            
            # Add HTML part if provided
            if html_body:
                html_part = MIMEText(html_body, 'html', 'utf-8')
                msg.attach(html_part)
            
            # Send email
            server = smtplib.SMTP(smtp_server, smtp_port)
            if smtp_use_tls:
                server.starttls()
            
            if smtp_username and smtp_password:
                server.login(smtp_username, smtp_password)
            
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent successfully to {to_email}: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_department_approval_email(self, contact_email: str, department_name: str, 
                                     contact_name: str, approved: bool, 
                                     review_notes: Optional[str] = None,
                                     login_url: Optional[str] = None,
                                     username: Optional[str] = None,
                                     temp_password: Optional[str] = None) -> bool:
        """Send department approval/denial notification email"""
        
        if approved:
            subject = f"Department Approved - Welcome to FireEMS.ai"
            body = f"""
Hello {contact_name},

Great news! Your department "{department_name}" has been approved for FireEMS.ai access.

Your department is now set up and ready to use. You can access the system at:
{login_url or 'https://www.fireems.ai/app/login'}

Your login credentials:
Username: {username or contact_email}
Temporary Password: {temp_password}

Please log in and change your password on first login.

If you have any questions, please contact our support team.

Best regards,
The FireEMS.ai Team
"""
            
            html_body = f"""
<html>
<body>
<h2>Department Approved - Welcome to FireEMS.ai</h2>

<p>Hello {contact_name},</p>

<p><strong>Great news!</strong> Your department "{department_name}" has been approved for FireEMS.ai access.</p>

<p>Your department is now set up and ready to use. You can access the system at:<br>
<a href="{login_url or 'https://www.fireems.ai/app/login'}">{login_url or 'https://www.fireems.ai/app/login'}</a></p>

<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
<strong>Your login credentials:</strong><br>
Username: {username or contact_email}<br>
Temporary Password: {temp_password}
</div>

<p><strong>Important:</strong> Please log in and change your password on first login.</p>

<p>If you have any questions, please contact our support team.</p>

<p>Best regards,<br>
The FireEMS.ai Team</p>
</body>
</html>
"""
        else:
            subject = f"Department Application Update - {department_name}"
            body = f"""
Hello {contact_name},

Thank you for your interest in FireEMS.ai for "{department_name}".

Unfortunately, we are unable to approve your department application at this time.

{f"Reason: {review_notes}" if review_notes else ""}

If you have any questions or would like to discuss this further, please contact our support team.

Best regards,
The FireEMS.ai Team
"""
            
            html_body = f"""
<html>
<body>
<h2>Department Application Update</h2>

<p>Hello {contact_name},</p>

<p>Thank you for your interest in FireEMS.ai for "{department_name}".</p>

<p>Unfortunately, we are unable to approve your department application at this time.</p>

{f"<p><strong>Reason:</strong> {review_notes}</p>" if review_notes else ""}

<p>If you have any questions or would like to discuss this further, please contact our support team.</p>

<p>Best regards,<br>
The FireEMS.ai Team</p>
</body>
</html>
"""
        
        return self.send_email(contact_email, subject, body, html_body)
    
    def send_user_approval_email(self, user_email: str, user_name: str, 
                               department_name: str, approved: bool,
                               temp_password: Optional[str] = None,
                               login_url: Optional[str] = None,
                               review_notes: Optional[str] = None) -> bool:
        """Send user approval/denial notification email"""
        
        if approved:
            subject = f"Access Approved - Welcome to {department_name} on FireEMS.ai"
            body = f"""
Hello {user_name},

Your request to join "{department_name}" on FireEMS.ai has been approved!

You can now access the system at:
{login_url or 'https://www.fireems.ai/app/login'}

Your login credentials:
Username: {user_email}
Temporary Password: {temp_password}

Please log in and change your password on first login.

Welcome to the team!

Best regards,
The FireEMS.ai Team
"""
            
            html_body = f"""
<html>
<body>
<h2>Access Approved - Welcome to FireEMS.ai</h2>

<p>Hello {user_name},</p>

<p>Your request to join "<strong>{department_name}</strong>" on FireEMS.ai has been approved!</p>

<p>You can now access the system at:<br>
<a href="{login_url or 'https://www.fireems.ai/app/login'}">{login_url or 'https://www.fireems.ai/app/login'}</a></p>

<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
<strong>Your login credentials:</strong><br>
Username: {user_email}<br>
Temporary Password: {temp_password}
</div>

<p><strong>Important:</strong> Please log in and change your password on first login.</p>

<p>Welcome to the team!</p>

<p>Best regards,<br>
The FireEMS.ai Team</p>
</body>
</html>
"""
        else:
            subject = f"Access Request Update - {department_name}"
            body = f"""
Hello {user_name},

Thank you for your interest in joining "{department_name}" on FireEMS.ai.

Unfortunately, your access request has not been approved at this time.

{f"Reason: {review_notes}" if review_notes else ""}

If you have any questions, please contact your department administrator.

Best regards,
The FireEMS.ai Team
"""
            
            html_body = f"""
<html>
<body>
<h2>Access Request Update</h2>

<p>Hello {user_name},</p>

<p>Thank you for your interest in joining "<strong>{department_name}</strong>" on FireEMS.ai.</p>

<p>Unfortunately, your access request has not been approved at this time.</p>

{f"<p><strong>Reason:</strong> {review_notes}</p>" if review_notes else ""}

<p>If you have any questions, please contact your department administrator.</p>

<p>Best regards,<br>
The FireEMS.ai Team</p>
</body>
</html>
"""
        
        return self.send_email(user_email, subject, body, html_body)
    
    def send_notification_email(self, to_email: str, notification_title: str, 
                              notification_message: str, action_url: Optional[str] = None) -> bool:
        """Send a general notification email"""
        
        subject = f"FireEMS.ai Notification - {notification_title}"
        body = f"""
{notification_message}

{f"Action required: {action_url}" if action_url else ""}

Best regards,
The FireEMS.ai Team
"""
        
        html_body = f"""
<html>
<body>
<h2>FireEMS.ai Notification</h2>

<h3>{notification_title}</h3>

<p>{notification_message}</p>

{f'<p><a href="{action_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Take Action</a></p>' if action_url else ""}

<p>Best regards,<br>
The FireEMS.ai Team</p>
</body>
</html>
"""
        
        return self.send_email(to_email, subject, body, html_body)

# Global email service instance
email_service = EmailService()