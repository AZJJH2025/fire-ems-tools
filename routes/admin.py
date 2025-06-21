"""
Admin routes for Fire EMS Tools
Provides API endpoints for department and user management
"""

import logging
from flask import Blueprint, redirect, jsonify, request
from flask_login import login_required, current_user
from database import db, User, Department
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