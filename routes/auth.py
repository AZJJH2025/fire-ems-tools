"""
Authentication routes for Fire EMS Tools
Provides both API endpoints for React app and redirect routes for legacy URLs
"""

import logging
from flask import Blueprint, redirect, jsonify, request, session
from flask_login import login_user, logout_user, login_required, current_user
from database import db, User, Department
from datetime import datetime

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('auth', __name__, url_prefix='/auth')

# Legacy redirect routes (for backward compatibility)
@bp.route('/login')
def login():
    """Login route - redirect to React app"""
    return redirect('/app/login')

@bp.route('/register')
def register():
    """Register route - redirect to React app"""
    return redirect('/app/signup')

@bp.route('/logout')
def logout():
    """Logout route"""
    return redirect('/app/')

# Debug endpoint to check admin users (temporary)
@bp.route('/api/debug/admin-users', methods=['GET'])
def debug_admin_users():
    """Debug endpoint to check admin users in database"""
    try:
        # Only allow this in development or for debugging
        import os
        if os.environ.get('FLASK_ENV') == 'production':
            return jsonify({'error': 'Debug endpoint disabled in production'}), 403
            
        from database import User
        admin_users = User.query.filter((User.role == 'admin') | (User.role == 'super_admin')).all()
        
        result = []
        for user in admin_users:
            result.append({
                'email': user.email,
                'role': user.role,
                'is_active': user.is_active,
                'department_id': user.department_id,
                'created_at': user.created_at.isoformat() if user.created_at else None
            })
            
        return jsonify({
            'admin_users': result,
            'total_users': User.query.count(),
            'total_admin_users': len(result)
        })
    except Exception as e:
        logger.error(f"Debug admin users error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Simple password reset for admin (GET request for browser access)
@bp.route('/reset-admin-password')
def reset_admin_password():
    """Simple GET endpoint to reset admin password - for emergency access"""
    try:
        from database import db, User
        
        # Find the admin user
        admin_user = User.query.filter_by(email='admin@fireems.ai').first()
        
        if admin_user:
            # Reset password to a known value
            admin_user.set_password('FireEMS2025!')
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Admin password reset successfully',
                'email': 'admin@fireems.ai',
                'new_password': 'FireEMS2025!',
                'note': 'You can now login with these credentials'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Admin user not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Emergency database initialization endpoint
@bp.route('/api/emergency/init-database', methods=['POST'])
def emergency_init_database():
    """Emergency endpoint to initialize/fix database schema"""
    try:
        data = request.get_json()
        
        # Require a special emergency key for security
        if not data or data.get('emergency_key') != 'FireEMS_Emergency_2025':
            return jsonify({'error': 'Invalid emergency key'}), 403
        
        from database import db
        
        # Create all database tables
        db.create_all()
        
        return jsonify({
            'success': True,
            'message': 'Database schema initialized successfully',
            'tables_created': 'All missing tables and columns have been created'
        })
        
    except Exception as e:
        logger.error(f"Database initialization error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Emergency admin creation endpoint
@bp.route('/api/emergency/create-admin', methods=['POST'])
def emergency_create_admin():
    """Emergency endpoint to create or fix admin user"""
    try:
        data = request.get_json()
        
        # Require a special emergency key for security
        if not data or data.get('emergency_key') != 'FireEMS_Emergency_2025':
            return jsonify({'error': 'Invalid emergency key'}), 403
            
        from database import db, User, Department
        
        # Find or create a department
        dept = Department.query.first()
        if not dept:
            dept = Department(
                code='emergency',
                name='Emergency Department',
                department_type='combined',
                is_active=True,
                setup_complete=True
            )
            db.session.add(dept)
            db.session.commit()
        
        # Check if super admin exists
        admin_email = 'admin@fireems.ai'
        admin_user = User.query.filter_by(email=admin_email).first()
        
        if admin_user:
            # Update existing user
            admin_user.role = 'super_admin'
            admin_user.is_active = True
            admin_user.set_password('FireEMS2025!')
            message = 'Updated existing admin user'
        else:
            # Create new admin user
            admin_user = User(
                department_id=dept.id,
                email=admin_email,
                name='System Administrator',
                role='super_admin',
                is_active=True
            )
            admin_user.set_password('FireEMS2025!')
            db.session.add(admin_user)
            message = 'Created new admin user'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': message,
            'admin_email': admin_email,
            'admin_role': admin_user.role
        })
        
    except Exception as e:
        logger.error(f"Emergency admin creation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# API endpoints for React authentication
@bp.route('/api/login', methods=['POST'])
def api_login():
    """API endpoint for user login"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email'].lower().strip()).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        if not user.is_active:
            return jsonify({
                'success': False,
                'message': 'Account is inactive. Please contact your administrator.'
            }), 403
        
        # Log the user in
        login_user(user, remember=data.get('remember', False))
        user.update_last_login()
        db.session.commit()
        
        logger.info(f"User {user.email} logged in successfully")
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'department_id': user.department_id,
                'department_name': user.department.name if user.department else None
            }
        })
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during login'
        }), 500

@bp.route('/api/register', methods=['POST'])
def api_register():
    """API endpoint for user registration"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'name', 'departmentName']
        if not data or not all(field in data for field in required_fields):
            return jsonify({
                'success': False,
                'message': 'All fields are required: email, password, name, departmentName'
            }), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        name = data['name'].strip()
        department_name = data['departmentName'].strip()
        
        # Validate email format
        if '@' not in email or '.' not in email:
            return jsonify({
                'success': False,
                'message': 'Please enter a valid email address'
            }), 400
        
        # Validate password strength
        if len(password) < 8:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 8 characters long'
            }), 400
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({
                'success': False,
                'message': 'An account with this email already exists'
            }), 400
        
        # Create or find department
        department = Department.query.filter_by(name=department_name).first()
        if not department:
            # Create new department
            department = Department(
                name=department_name,
                code=department_name.upper().replace(' ', '_')[:10],
                department_type=data.get('departmentType', 'fire'),
                is_active=True
            )
            db.session.add(department)
            db.session.flush()  # Get department ID
        
        # Create new user
        user = User(
            email=email,
            name=name,
            department_id=department.id,
            role='user',  # Default role
            is_active=True
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        logger.info(f"New user registered: {email} for department {department_name}")
        
        return jsonify({
            'success': True,
            'message': 'Registration successful! You can now log in.',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'department_name': department.name
            }
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during registration'
        }), 500

@bp.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    """API endpoint for user logout"""
    try:
        logger.info(f"User {current_user.email} logged out")
        logout_user()
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        })
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during logout'
        }), 500

@bp.route('/api/me', methods=['GET'])
@login_required
def api_current_user():
    """API endpoint to get current user info"""
    try:
        return jsonify({
            'success': True,
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'name': current_user.name,
                'role': current_user.role,
                'department_id': current_user.department_id,
                'department_name': current_user.department.name if current_user.department else None,
                'last_login': current_user.last_login.isoformat() if current_user.last_login else None
            }
        })
    except Exception as e:
        logger.error(f"Current user error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred getting user info'
        }), 500