"""
Admin routes for Fire EMS Tools
Provides API endpoints for department and user management
"""

import logging
from flask import Blueprint, redirect, jsonify, request
from flask_login import login_required, current_user
from database import db, User, Department
from email_service import email_service
import secrets
from datetime import datetime
from sqlalchemy import func

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('admin', __name__, url_prefix='/admin')

def require_admin(f):
    """Decorator to require admin or super_admin role"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentication required'}), 401
        if not (current_user.is_admin() or current_user.is_super_admin()):
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Legacy redirect route
@bp.route('/')
def admin_index():
    """Admin index - redirect to React app"""
    return redirect('/app/admin')

# User Management API Endpoints
@bp.route('/api/users', methods=['GET'])
@login_required
@require_admin
def get_users():
    """Get all users for admin management"""
    try:
        # Super admin can see all users, department admin only sees their department
        if current_user.is_super_admin():
            users = User.query.all()
        else:
            users = User.query.filter_by(department_id=current_user.department_id).all()
        
        users_data = []
        for user in users:
            user_data = {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'department_id': user.department_id,
                'department_name': user.department.name if user.department else None
            }
            users_data.append(user_data)
        
        return jsonify({'success': True, 'users': users_data})
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({'error': 'Failed to fetch users'}), 500

@bp.route('/api/users', methods=['POST'])
@login_required
@require_admin
def create_user():
    """Create a new user (super admin only)"""
    try:
        # Only super admins can create users
        if not current_user.is_super_admin():
            return jsonify({'error': 'Super admin access required'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('email') or not data.get('name'):
            return jsonify({'error': 'Email and name are required'}), 400
        
        # Check if user email already exists
        existing_user = User.query.filter_by(email=data['email'].lower().strip()).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Validate role
        role = data.get('role', 'user')
        if role not in ['user', 'admin', 'manager', 'super_admin']:
            return jsonify({'error': 'Invalid role specified'}), 400
        
        # Only super admin can create other super admins
        if role == 'super_admin' and not current_user.is_super_admin():
            return jsonify({'error': 'Cannot assign super_admin role'}), 403
        
        # Validate department if provided
        department_id = data.get('department_id')
        if department_id:
            department = Department.query.get(department_id)
            if not department:
                return jsonify({'error': 'Department not found'}), 400
        
        # Create new user
        user = User(
            email=data['email'].lower().strip(),
            name=data['name'].strip(),
            role=role,
            department_id=department_id,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        # Generate a secure temporary password
        temp_password = secrets.token_urlsafe(12)
        user.password_hash = user.set_password(temp_password)
        
        db.session.add(user)
        db.session.commit()
        
        logger.info(f"User {user.email} created by super admin {current_user.email}")
        
        # Send welcome email with login credentials
        try:
            department_name = user.department.name if user.department else "FireEMS.ai"
            email_sent = email_service.send_user_approval_email(
                user_email=user.email,
                user_name=user.name,
                department_name=department_name,
                approved=True,
                temp_password=temp_password,
                login_url="https://www.fireems.ai/app/login"
            )
            
            if email_sent:
                logger.info(f"Welcome email sent successfully to {user.email}")
            else:
                logger.error(f"Failed to send welcome email to {user.email}")
                
        except Exception as e:
            logger.error(f"Error sending welcome email to {user.email}: {str(e)}")
        
        # Return the created user data
        user_data = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role,
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat(),
            'last_login': None,
            'department_id': user.department_id,
            'department_name': user.department.name if user.department else None
        }
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'user': user_data
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Failed to create user'}), 500

@bp.route('/api/users/<int:user_id>', methods=['PUT'])
@login_required
@require_admin
def update_user(user_id):
    """Update user details"""
    try:
        data = request.get_json()
        
        # Find user
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Department admins can only edit users in their department
        if not current_user.is_super_admin() and user.department_id != current_user.department_id:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Update user fields
        if 'name' in data:
            user.name = data['name'].strip()
        if 'email' in data:
            user.email = data['email'].lower().strip()
        if 'role' in data and data['role'] in ['user', 'admin', 'manager']:
            # Only super admin can create other super admins
            if data['role'] == 'super_admin' and not current_user.is_super_admin():
                return jsonify({'error': 'Cannot assign super_admin role'}), 403
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = bool(data['is_active'])
        
        db.session.commit()
        logger.info(f"User {user.email} updated by admin {current_user.email}")
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'is_active': user.is_active
            }
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating user: {str(e)}")
        return jsonify({'error': 'Failed to update user'}), 500

@bp.route('/api/users/<int:user_id>', methods=['DELETE'])
@login_required
@require_admin
def delete_user(user_id):
    """Delete a user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Department admins can only delete users in their department
        if not current_user.is_super_admin() and user.department_id != current_user.department_id:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Cannot delete self
        if user.id == current_user.id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # Cannot delete super admin unless you are super admin
        if user.is_super_admin() and not current_user.is_super_admin():
            return jsonify({'error': 'Cannot delete super admin'}), 403
        
        user_email = user.email
        db.session.delete(user)
        db.session.commit()
        
        logger.info(f"User {user_email} deleted by admin {current_user.email}")
        return jsonify({'success': True, 'message': 'User deleted successfully'})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting user: {str(e)}")
        return jsonify({'error': 'Failed to delete user'}), 500

# Department Management API Endpoints
@bp.route('/api/departments', methods=['GET'])
@login_required
@require_admin
def get_departments():
    """Get departments for admin management"""
    try:
        # Super admin can see all departments, department admin only sees their own
        if current_user.is_super_admin():
            departments = Department.query.all()
        else:
            departments = [current_user.department]
        
        departments_data = []
        for dept in departments:
            if dept:  # Check if department exists
                dept_data = {
                    'id': dept.id,
                    'name': dept.name,
                    'code': dept.code,
                    'department_type': dept.department_type,
                    'is_active': dept.is_active,
                    'created_at': dept.created_at.isoformat() if dept.created_at else None,
                    'user_count': len(dept.users),
                    'api_enabled': dept.api_enabled,
                    'features_enabled': dept.features_enabled
                }
                departments_data.append(dept_data)
        
        return jsonify({'success': True, 'departments': departments_data})
    except Exception as e:
        logger.error(f"Error fetching departments: {str(e)}")
        return jsonify({'error': 'Failed to fetch departments'}), 500

@bp.route('/api/departments', methods=['POST'])
@login_required
@require_admin
def create_department():
    """Create a new department (super admin only)"""
    try:
        # Only super admins can create departments
        if not current_user.is_super_admin():
            return jsonify({'error': 'Super admin access required'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('name') or not data.get('code'):
            return jsonify({'error': 'Department name and code are required'}), 400
        
        # Check if department code already exists
        existing_dept = Department.query.filter_by(code=data['code'].strip().lower()).first()
        if existing_dept:
            return jsonify({'error': 'Department code already exists'}), 400
        
        # Create new department with default features
        default_features = {
            'data-formatter': True,
            'response-time-analyzer': True,
            'fire-map-pro': True,
            'water-supply-coverage': True,
            'iso-credit-calculator': False,
            'station-coverage-optimizer': False,
            'admin-console': True,
            'call-density-heatmap': False,
            'coverage-gap-finder': False
        }
        
        department = Department(
            name=data['name'].strip(),
            code=data['code'].strip().lower(),
            department_type=data.get('department_type', 'combined'),
            is_active=True,
            api_enabled=False,
            features_enabled=default_features,
            created_at=datetime.utcnow()
        )
        
        db.session.add(department)
        db.session.commit()
        
        logger.info(f"Department {department.name} created by super admin {current_user.email}")
        
        # Return the created department data
        dept_data = {
            'id': department.id,
            'name': department.name,
            'code': department.code,
            'department_type': department.department_type,
            'is_active': department.is_active,
            'created_at': department.created_at.isoformat(),
            'user_count': 0,
            'api_enabled': department.api_enabled,
            'features_enabled': department.features_enabled
        }
        
        return jsonify({
            'success': True,
            'message': 'Department created successfully',
            'department': dept_data
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating department: {str(e)}")
        return jsonify({'error': 'Failed to create department'}), 500

@bp.route('/api/departments/<int:dept_id>', methods=['PUT'])
@login_required
@require_admin
def update_department(dept_id):
    """Update department details"""
    try:
        data = request.get_json()
        
        department = Department.query.get(dept_id)
        if not department:
            return jsonify({'error': 'Department not found'}), 404
        
        # Department admins can only edit their own department
        if not current_user.is_super_admin() and department.id != current_user.department_id:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Update department fields
        if 'name' in data:
            department.name = data['name'].strip()
        if 'department_type' in data and data['department_type'] in ['fire', 'ems', 'combined']:
            department.department_type = data['department_type']
        if 'is_active' in data and current_user.is_super_admin():
            department.is_active = bool(data['is_active'])
        if 'features_enabled' in data:
            department.features_enabled = data['features_enabled']
        
        db.session.commit()
        logger.info(f"Department {department.name} updated by admin {current_user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Department updated successfully',
            'department': department.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating department: {str(e)}")
        return jsonify({'error': 'Failed to update department'}), 500

# Analytics API Endpoints
@bp.route('/api/analytics/overview', methods=['GET'])
@login_required
@require_admin
def get_analytics_overview():
    """Get overview analytics for admin dashboard"""
    try:
        if current_user.is_super_admin():
            # System-wide analytics
            total_users = User.query.count()
            active_users = User.query.filter_by(is_active=True).count()
            total_departments = Department.query.count()
            active_departments = Department.query.filter_by(is_active=True).count()
            
            # Recent activity
            recent_users = User.query.filter(
                User.created_at >= datetime.utcnow().replace(day=1)
            ).count()
            
        else:
            # Department-specific analytics
            dept_users = User.query.filter_by(department_id=current_user.department_id)
            total_users = dept_users.count()
            active_users = dept_users.filter_by(is_active=True).count()
            total_departments = 1
            active_departments = 1 if current_user.department.is_active else 0
            
            # Recent activity in department
            recent_users = dept_users.filter(
                User.created_at >= datetime.utcnow().replace(day=1)
            ).count()
        
        analytics = {
            'total_users': total_users,
            'active_users': active_users,
            'total_departments': total_departments,
            'active_departments': active_departments,
            'recent_users_this_month': recent_users,
            'is_super_admin': current_user.is_super_admin()
        }
        
        return jsonify({'success': True, 'analytics': analytics})
    except Exception as e:
        logger.error(f"Error fetching analytics: {str(e)}")
        return jsonify({'error': 'Failed to fetch analytics'}), 500