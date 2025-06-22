"""
Approval management routes for Fire EMS Tools
Handles department and user request approvals by admins
"""

import logging
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from database import db, Department, User
from datetime import datetime
from sqlalchemy import text
import secrets
import string

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('approval_management', __name__, url_prefix='/admin/api')

def require_super_admin(f):
    """Decorator to require super_admin role"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentication required'}), 401
        if not current_user.is_super_admin():
            return jsonify({'error': 'Super admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

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

def generate_temp_password(length=12):
    """Generate a temporary password for new users"""
    alphabet = string.ascii_letters + string.digits + "!@#$%&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

# Department request management (super admin only)
@bp.route('/department-requests', methods=['GET'])
@login_required
@require_super_admin
def get_department_requests():
    """Get all department requests for super admin review"""
    try:
        status_filter = request.args.get('status', 'pending')
        
        query = """
        SELECT 
            id, department_name, department_type, department_code,
            contact_name, contact_email, contact_phone, contact_title,
            service_area_description, population_served, number_of_stations,
            justification, status, requested_at, reviewed_at, review_notes
        FROM department_requests
        WHERE status = :status
        ORDER BY requested_at DESC
        """
        
        results = db.session.execute(text(query), {'status': status_filter}).fetchall()
        
        requests = []
        for row in results:
            requests.append({
                'id': row[0],
                'department_name': row[1],
                'department_type': row[2],
                'department_code': row[3],
                'contact_name': row[4],
                'contact_email': row[5],
                'contact_phone': row[6],
                'contact_title': row[7],
                'service_area_description': row[8],
                'population_served': row[9],
                'number_of_stations': row[10],
                'justification': row[11],
                'status': row[12],
                'requested_at': row[13],
                'reviewed_at': row[14],
                'review_notes': row[15]
            })
        
        return jsonify({
            'success': True,
            'requests': requests,
            'total': len(requests),
            'status_filter': status_filter
        })
    
    except Exception as e:
        logger.error(f"Error fetching department requests: {str(e)}")
        return jsonify({'error': 'Failed to fetch department requests'}), 500

@bp.route('/department-requests/<int:request_id>/approve', methods=['POST'])
@login_required
@require_super_admin
def approve_department_request(request_id):
    """Approve a department request and create the department"""
    try:
        data = request.get_json() or {}
        review_notes = data.get('review_notes', '').strip()
        
        # Get the request
        request_query = """
        SELECT 
            department_name, department_type, department_code,
            contact_name, contact_email, contact_phone, contact_title,
            service_area_description, status
        FROM department_requests
        WHERE id = :request_id
        """
        
        req_result = db.session.execute(text(request_query), {'request_id': request_id}).fetchone()
        
        if not req_result:
            return jsonify({'error': 'Department request not found'}), 404
        
        if req_result[8] != 'pending':  # status field
            return jsonify({'error': 'Request has already been processed'}), 400
        
        # Check if department name already exists
        existing_dept = Department.query.filter_by(name=req_result[0]).first()
        if existing_dept:
            return jsonify({'error': 'Department with this name already exists'}), 400
        
        # Create the department with default features
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
            name=req_result[0],  # department_name
            code=req_result[2],  # department_code
            department_type=req_result[1],  # department_type
            is_active=True,
            api_enabled=False,
            features_enabled=default_features,
            created_at=datetime.utcnow()
        )
        
        db.session.add(department)
        db.session.flush()  # Get the department ID
        
        # Create the primary contact as department admin
        temp_password = generate_temp_password()
        
        admin_user = User(
            email=req_result[4],  # contact_email
            name=req_result[3],   # contact_name
            role='admin',
            department_id=department.id,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        # Set temporary password
        admin_user.password_hash = admin_user.set_password(temp_password)
        
        db.session.add(admin_user)
        
        # Update the request status
        update_request_sql = """
        UPDATE department_requests 
        SET status = 'approved', 
            reviewed_at = :reviewed_at,
            reviewed_by = :reviewed_by,
            review_notes = :review_notes
        WHERE id = :request_id
        """
        
        db.session.execute(text(update_request_sql), {
            'reviewed_at': datetime.utcnow(),
            'reviewed_by': current_user.id,
            'review_notes': review_notes,
            'request_id': request_id
        })
        
        db.session.commit()
        
        logger.info(f"Department {department.name} approved and created by {current_user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Department request approved successfully',
            'department': {
                'id': department.id,
                'name': department.name,
                'code': department.code,
                'type': department.department_type
            },
            'admin_user': {
                'id': admin_user.id,
                'email': admin_user.email,
                'name': admin_user.name,
                'temp_password': temp_password  # For email notification
            }
        })
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error approving department request: {str(e)}")
        return jsonify({'error': 'Failed to approve department request'}), 500

@bp.route('/department-requests/<int:request_id>/deny', methods=['POST'])
@login_required
@require_super_admin
def deny_department_request(request_id):
    """Deny a department request"""
    try:
        data = request.get_json() or {}
        review_notes = data.get('review_notes', '').strip()
        
        if not review_notes:
            return jsonify({'error': 'Review notes are required when denying a request'}), 400
        
        # Check if request exists and is pending
        req_check = db.session.execute(
            text("SELECT status FROM department_requests WHERE id = :request_id"),
            {'request_id': request_id}
        ).fetchone()
        
        if not req_check:
            return jsonify({'error': 'Department request not found'}), 404
        
        if req_check[0] != 'pending':
            return jsonify({'error': 'Request has already been processed'}), 400
        
        # Update the request status
        update_request_sql = """
        UPDATE department_requests 
        SET status = 'denied', 
            reviewed_at = :reviewed_at,
            reviewed_by = :reviewed_by,
            review_notes = :review_notes
        WHERE id = :request_id
        """
        
        db.session.execute(text(update_request_sql), {
            'reviewed_at': datetime.utcnow(),
            'reviewed_by': current_user.id,
            'review_notes': review_notes,
            'request_id': request_id
        })
        
        db.session.commit()
        
        logger.info(f"Department request {request_id} denied by {current_user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Department request denied successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error denying department request: {str(e)}")
        return jsonify({'error': 'Failed to deny department request'}), 500

# User request management (department admin and super admin)
@bp.route('/user-requests', methods=['GET'])
@login_required
@require_admin
def get_user_requests():
    """Get user requests for admin review"""
    try:
        status_filter = request.args.get('status', 'pending')
        
        # Super admin sees all requests, department admin sees only their department
        if current_user.is_super_admin():
            query = """
            SELECT 
                ur.id, ur.department_id, d.name as department_name,
                ur.user_name, ur.user_email, ur.user_phone,
                ur.requested_role, ur.verification_info, ur.employee_id,
                ur.years_of_service, ur.current_position,
                ur.status, ur.requested_at, ur.reviewed_at, ur.review_notes
            FROM user_requests ur
            JOIN departments d ON ur.department_id = d.id
            WHERE ur.status = :status
            ORDER BY ur.requested_at DESC
            """
            params = {'status': status_filter}
        else:
            query = """
            SELECT 
                ur.id, ur.department_id, d.name as department_name,
                ur.user_name, ur.user_email, ur.user_phone,
                ur.requested_role, ur.verification_info, ur.employee_id,
                ur.years_of_service, ur.current_position,
                ur.status, ur.requested_at, ur.reviewed_at, ur.review_notes
            FROM user_requests ur
            JOIN departments d ON ur.department_id = d.id
            WHERE ur.status = :status AND ur.department_id = :dept_id
            ORDER BY ur.requested_at DESC
            """
            params = {'status': status_filter, 'dept_id': current_user.department_id}
        
        results = db.session.execute(text(query), params).fetchall()
        
        requests = []
        for row in results:
            requests.append({
                'id': row[0],
                'department_id': row[1],
                'department_name': row[2],
                'user_name': row[3],
                'user_email': row[4],
                'user_phone': row[5],
                'requested_role': row[6],
                'verification_info': row[7],
                'employee_id': row[8],
                'years_of_service': row[9],
                'current_position': row[10],
                'status': row[11],
                'requested_at': row[12],
                'reviewed_at': row[13],
                'review_notes': row[14]
            })
        
        return jsonify({
            'success': True,
            'requests': requests,
            'total': len(requests),
            'status_filter': status_filter
        })
    
    except Exception as e:
        logger.error(f"Error fetching user requests: {str(e)}")
        return jsonify({'error': 'Failed to fetch user requests'}), 500

@bp.route('/user-requests/<int:request_id>/approve', methods=['POST'])
@login_required
@require_admin
def approve_user_request(request_id):
    """Approve a user request and create the user account"""
    try:
        data = request.get_json() or {}
        review_notes = data.get('review_notes', '').strip()
        
        # Get the request
        request_query = """
        SELECT 
            ur.department_id, ur.user_name, ur.user_email,
            ur.requested_role, ur.status
        FROM user_requests ur
        WHERE ur.id = :request_id
        """
        
        req_result = db.session.execute(text(request_query), {'request_id': request_id}).fetchone()
        
        if not req_result:
            return jsonify({'error': 'User request not found'}), 404
        
        if req_result[4] != 'pending':  # status field
            return jsonify({'error': 'Request has already been processed'}), 400
        
        # Check permissions (department admin can only approve for their department)
        if not current_user.is_super_admin() and req_result[0] != current_user.department_id:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Check if user email already exists
        existing_user = User.query.filter_by(email=req_result[2]).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Create the user
        temp_password = generate_temp_password()
        
        new_user = User(
            email=req_result[2],  # user_email
            name=req_result[1],   # user_name
            role=req_result[3],   # requested_role
            department_id=req_result[0],  # department_id
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        # Set temporary password
        new_user.password_hash = new_user.set_password(temp_password)
        
        db.session.add(new_user)
        
        # Update the request status
        update_request_sql = """
        UPDATE user_requests 
        SET status = 'approved', 
            reviewed_at = :reviewed_at,
            reviewed_by = :reviewed_by,
            review_notes = :review_notes
        WHERE id = :request_id
        """
        
        db.session.execute(text(update_request_sql), {
            'reviewed_at': datetime.utcnow(),
            'reviewed_by': current_user.id,
            'review_notes': review_notes,
            'request_id': request_id
        })
        
        db.session.commit()
        
        logger.info(f"User {new_user.email} approved and created by {current_user.email}")
        
        return jsonify({
            'success': True,
            'message': 'User request approved successfully',
            'user': {
                'id': new_user.id,
                'email': new_user.email,
                'name': new_user.name,
                'role': new_user.role,
                'temp_password': temp_password  # For email notification
            }
        })
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error approving user request: {str(e)}")
        return jsonify({'error': 'Failed to approve user request'}), 500

@bp.route('/user-requests/<int:request_id>/deny', methods=['POST'])
@login_required
@require_admin
def deny_user_request(request_id):
    """Deny a user request"""
    try:
        data = request.get_json() or {}
        review_notes = data.get('review_notes', '').strip()
        
        if not review_notes:
            return jsonify({'error': 'Review notes are required when denying a request'}), 400
        
        # Check if request exists and permissions
        req_check = db.session.execute(
            text("SELECT department_id, status FROM user_requests WHERE id = :request_id"),
            {'request_id': request_id}
        ).fetchone()
        
        if not req_check:
            return jsonify({'error': 'User request not found'}), 404
        
        if req_check[1] != 'pending':
            return jsonify({'error': 'Request has already been processed'}), 400
        
        # Check permissions
        if not current_user.is_super_admin() and req_check[0] != current_user.department_id:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Update the request status
        update_request_sql = """
        UPDATE user_requests 
        SET status = 'denied', 
            reviewed_at = :reviewed_at,
            reviewed_by = :reviewed_by,
            review_notes = :review_notes
        WHERE id = :request_id
        """
        
        db.session.execute(text(update_request_sql), {
            'reviewed_at': datetime.utcnow(),
            'reviewed_by': current_user.id,
            'review_notes': review_notes,
            'request_id': request_id
        })
        
        db.session.commit()
        
        logger.info(f"User request {request_id} denied by {current_user.email}")
        
        return jsonify({
            'success': True,
            'message': 'User request denied successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error denying user request: {str(e)}")
        return jsonify({'error': 'Failed to deny user request'}), 500