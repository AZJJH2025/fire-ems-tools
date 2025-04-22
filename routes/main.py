"""
Main routes for FireEMS.ai application.

This module defines the routes for the main pages of the application, including:
- Home page
- Basic tool pages
- Static pages
"""

from flask import Blueprint, render_template, redirect, url_for, request, session, current_app
import os
import json
import logging

logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('main', __name__)

@bp.route("/")
def index():
    """Home page route"""
    return render_template('index.html')

@bp.route('/fire-ems-dashboard')
def fire_ems_dashboard():
    """Response Time Analyzer dashboard route"""
    return render_template('fire-ems-dashboard.html')

@bp.route('/isochrone-map')
def isochrone_map():
    """Isochrone Map route"""
    return render_template('isochrone-map.html')

@bp.route('/call-density-heatmap')
def call_density_heatmap():
    """Call Density Heatmap route"""
    return render_template('call-density-heatmap.html')

@bp.route('/incident-logger')
def incident_logger():
    """Incident Logger route"""
    return render_template('incident-logger.html')
    
@bp.route('/coverage-gap-finder')
def coverage_gap_finder():
    """Coverage Gap Finder route"""
    return render_template('coverage-gap-finder.html')
    
@bp.route('/fire-map-pro')
def fire_map_pro():
    """FireMapPro route"""
    return render_template('fire-map-pro.html')
    
@bp.route('/data-formatter')
def data_formatter():
    """Data Formatter route"""
    try:
        template = render_template('data-formatter.html')
        current_app.logger.info("Successfully rendered data-formatter.html")
        return template
    except Exception as e:
        current_app.logger.error(f"Failed to render data-formatter: {str(e)}", exc_info=True)
        raise
    
@bp.route('/data-formatter-test')
def data_formatter_test():
    """Data Formatter Test route for debugging"""
    return render_template('data-formatter-test.html')
    
@bp.route('/static-test')
def static_test():
    """Test route for static file serving"""
    return render_template('static-test.html')
    
@bp.route('/style-test')
def style_test():
    """Style test page"""
    return render_template('style-test.html')

@bp.route('/css-debug')
def css_debug():
    """Debug route to test CSS loading"""
    with open('/Users/josephhester/Documents/fire-ems-tools/static/styles.css', 'r') as f:
        css_content = f.read()
    return f"""
    <html>
    <head>
        <title>CSS Debug</title>
        <style>{css_content}</style>
    </head>
    <body>
        <h1 style="color: red;">CSS Debug Page</h1>
        <p>This page loads the styles.css file directly to test if it works.</p>
        <div class="navbar">
            <div class="logo">Test Logo</div>
            <div class="nav-links">Test Links</div>
        </div>
    </body>
    </html>
    """
    
@bp.route('/station-overview')
def station_overview():
    """Station Overview route"""
    return render_template('station-overview.html')

@bp.route('/call-volume-forecaster')
def call_volume_forecaster():
    """Call Volume Forecaster route"""
    return render_template('call-volume-forecaster.html')

@bp.route('/quick-stats')
def quick_stats():
    """Quick Stats route"""
    return render_template('quick-stats.html')

@bp.route('/user-guide')
def user_guide():
    """User Guide route"""
    return render_template('user-guide.html')

@bp.route('/emergency-test')
def emergency_test():
    """Emergency Mode Test route"""
    return render_template('emergency-test.html')

@bp.route('/tests/module_testing_dashboard.html')
def module_testing_dashboard():
    """ES6 Module Testing Dashboard route"""
    return render_template('tests/module_testing_dashboard.html')

@bp.route('/admin')
def admin_dashboard():
    """Admin Dashboard route - redirects to the admin blueprint"""
    return redirect(url_for('admin.dashboard'))

@bp.route('/deployment-status')
def deployment_status():
    """Check deployment status"""
    from flask import jsonify
    from datetime import datetime
    from database import Department, User
    
    status = {
        "status": "ok",
        "fixes_applied": True,
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv('FLASK_ENV', 'development'),
        "features": {
            "user_api": hasattr(User, 'to_dict'),
            "webhooks": hasattr(Department, 'webhook_events') and hasattr(Department, 'webhooks_enabled')
        }
    }
    
    return jsonify(status)
    
@bp.route('/setup-admin')
def setup_admin():
    """Setup admin user and test credentials"""
    from database import db, Department, User
    import logging
    from werkzeug.security import generate_password_hash, check_password_hash
    import traceback
    
    logger = logging.getLogger(__name__)
    
    try:
        # Check if admin department exists
        dept = Department.query.filter_by(code='ADMIN').first()
        if not dept:
            dept = Department(
                code='ADMIN',
                name='System Administration',
                is_active=True,
                setup_complete=True
            )
            db.session.add(dept)
            db.session.commit()
            dept_msg = f"Created admin department with ID {dept.id}"
        else:
            dept_msg = f"Admin department exists with ID {dept.id}"
            
        # Check if admin user exists
        admin = User.query.filter_by(email='admin@fireems.ai').first()
        if not admin:
            admin = User(
                email='admin@fireems.ai',
                name='System Administrator',
                department_id=dept.id,
                role='super_admin',
                is_active=True
            )
            # Set password directly with low complexity for testing
            admin.password_hash = generate_password_hash('admin123')
            db.session.add(admin)
            db.session.commit()
            user_msg = f"Created admin user with ID {admin.id}"
        else:
            # Reset password for existing admin - directly set the hash
            admin.password_hash = generate_password_hash('admin123')
            db.session.commit()
            user_msg = f"Reset password for existing admin user (ID: {admin.id})"
            
        # Check password
        pw_direct_check = check_password_hash(admin.password_hash, 'admin123')
        pw_method_check = admin.check_password('admin123') if hasattr(admin, 'check_password') else 'Method not available'
        
        # Get all users for diagnostics
        all_users = User.query.all()
        users_list = [f"ID: {u.id}, Email: {u.email}, Role: {u.role}" for u in all_users]
        
        # Check if our admin user is actually in the database after commit
        admin_in_db = User.query.filter_by(email='admin@fireems.ai').first()
        admin_check = "Admin verified in database" if admin_in_db else "CRITICAL: Admin not found in database after commit"
        
        # Return detailed status
        return f"""
        <h1>Admin Setup Complete</h1>
        <p>{dept_msg}</p>
        <p>{user_msg}</p>
        <p>{admin_check}</p>
        <p>Direct password check: {'succeeded' if pw_direct_check else 'failed'}</p>
        <p>Method password check: {pw_method_check}</p>
        <p>Password hash: {admin.password_hash[:20]}...</p>
        <p>
            <strong>Credentials:</strong><br>
            Email: admin@fireems.ai<br>
            Password: admin123
        </p>
        <p><a href="{url_for('auth.login')}">Go to login page</a></p>
        <p><a href="/direct-login">Try Direct Login</a></p>
        <h2>All Users in Database:</h2>
        <ul>
            {"".join(f"<li>{user}</li>" for user in users_list)}
        </ul>
        """
    except Exception as e:
        logger.error(f"Admin setup error: {str(e)}")
        logger.error(traceback.format_exc())
        return f"<h1>Error during admin setup</h1><p>Error: {str(e)}</p><pre>{traceback.format_exc()}</pre>"

@bp.route('/direct-login', methods=['GET', 'POST'])
def direct_login():
    """Direct login without Flask-Login for testing"""
    from flask import request, redirect, flash, session
    from database import db, User
    import logging
    from werkzeug.security import check_password_hash
    
    logger = logging.getLogger(__name__)
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        logger.info(f"Direct login attempt for: {email}")
        
        # Find the user
        user = User.query.filter_by(email=email).first()
        
        if not user:
            logger.warning(f"No user found with email: {email}")
            return f"""
            <h1>Login Failed</h1>
            <p>No user found with email: {email}</p>
            <p><a href="/direct-login">Try Again</a></p>
            """
            
        # Check password directly
        if check_password_hash(user.password_hash, password):
            logger.info(f"Password correct for {email}")
            
            # Set session variables manually
            session['user_id'] = user.id
            session['user_email'] = user.email
            session['user_role'] = user.role
            
            return redirect(url_for('admin.dashboard'))
        else:
            logger.warning(f"Password incorrect for {email}")
            return f"""
            <h1>Login Failed</h1>
            <p>Password incorrect for: {email}</p>
            <p>Password hash in DB: {user.password_hash[:20]}...</p>
            <p><a href="/direct-login">Try Again</a></p>
            """
    
    # GET request - show login form
    return """
    <h1>Direct Login Test</h1>
    <form method="POST">
        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
        </div>
        <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
        </div>
        <button type="submit">Login</button>
    </form>
    """