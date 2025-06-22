"""
Public registration routes for Fire EMS Tools
Handles department requests and user join requests with approval workflows
"""

import logging
from flask import Blueprint, jsonify, request
from database import db
from datetime import datetime
from sqlalchemy import text
import re

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('public_registration', __name__, url_prefix='/api/public')

def validate_email(email):
    """Basic email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_department_request(data):
    """Validate department request data"""
    required_fields = ['department_name', 'contact_name', 'contact_email']
    errors = []
    
    # Check required fields
    for field in required_fields:
        if not data.get(field):
            errors.append(f"{field.replace('_', ' ').title()} is required")
    
    # Validate email
    if data.get('contact_email') and not validate_email(data['contact_email']):
        errors.append("Valid email address is required")
    
    # Validate department type
    valid_types = ['fire', 'ems', 'combined']
    if data.get('department_type') and data['department_type'] not in valid_types:
        errors.append("Department type must be fire, ems, or combined")
    
    return errors

def validate_user_request(data):
    """Validate user join request data"""
    required_fields = ['department_id', 'user_name', 'user_email']
    errors = []
    
    # Check required fields
    for field in required_fields:
        if not data.get(field):
            errors.append(f"{field.replace('_', ' ').title()} is required")
    
    # Validate email
    if data.get('user_email') and not validate_email(data['user_email']):
        errors.append("Valid email address is required")
    
    # Validate role
    valid_roles = ['user', 'admin', 'manager']
    if data.get('requested_role') and data['requested_role'] not in valid_roles:
        errors.append("Invalid role requested")
    
    # Validate department exists
    if data.get('department_id'):
        try:
            dept_check = db.session.execute(
                text("SELECT id FROM departments WHERE id = :dept_id AND is_active = 1"),
                {'dept_id': data['department_id']}
            ).fetchone()
            if not dept_check:
                errors.append("Department not found or inactive")
        except Exception as e:
            logger.error(f"Error validating department: {e}")
            errors.append("Error validating department")
    
    return errors

# Public endpoints for registration
@bp.route('/departments/search', methods=['GET'])
def search_departments():
    """Search for active departments that users can join"""
    try:
        search_term = request.args.get('q', '').strip()
        
        # Build search query
        if search_term:
            query = """
            SELECT id, name, code, department_type, 
                   (SELECT COUNT(*) FROM users WHERE department_id = departments.id AND is_active = 1) as user_count
            FROM departments 
            WHERE is_active = 1 
            AND (name LIKE :search OR code LIKE :search OR department_type LIKE :search)
            ORDER BY name
            LIMIT 20
            """
            results = db.session.execute(text(query), {'search': f'%{search_term}%'}).fetchall()
        else:
            query = """
            SELECT id, name, code, department_type,
                   (SELECT COUNT(*) FROM users WHERE department_id = departments.id AND is_active = 1) as user_count
            FROM departments 
            WHERE is_active = 1 
            ORDER BY name
            LIMIT 20
            """
            results = db.session.execute(text(query)).fetchall()
        
        departments = []
        for row in results:
            departments.append({
                'id': row[0],
                'name': row[1],
                'code': row[2],
                'department_type': row[3],
                'user_count': row[4]
            })
        
        return jsonify({
            'success': True,
            'departments': departments,
            'total': len(departments)
        })
    
    except Exception as e:
        logger.error(f"Error searching departments: {str(e)}")
        return jsonify({'error': 'Failed to search departments'}), 500

@bp.route('/request-department', methods=['POST'])
def request_department():
    """Submit a request to create a new fire department"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate request data
        errors = validate_department_request(data)
        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        # Check for duplicate requests
        existing_request = db.session.execute(
            text("SELECT id FROM department_requests WHERE contact_email = :email AND status = 'pending'"),
            {'email': data['contact_email'].lower().strip()}
        ).fetchone()
        
        if existing_request:
            return jsonify({'error': 'A pending request already exists for this email address'}), 400
        
        # Generate department code if not provided
        department_code = data.get('department_code', '').strip()
        if not department_code:
            # Generate code from department name (first 3 letters + random number)
            name_part = ''.join(c for c in data['department_name'][:3] if c.isalpha()).upper()
            import random
            number_part = str(random.randint(100, 999))
            department_code = name_part + number_part
        
        # Create department request
        insert_sql = """
        INSERT INTO department_requests (
            department_name, department_type, department_code,
            contact_name, contact_email, contact_phone, contact_title,
            service_area_description, population_served, number_of_stations,
            justification, status, requested_at
        ) VALUES (
            :dept_name, :dept_type, :dept_code,
            :contact_name, :contact_email, :contact_phone, :contact_title,
            :service_area, :population, :stations,
            :justification, 'pending', :requested_at
        )
        """
        
        db.session.execute(text(insert_sql), {
            'dept_name': data['department_name'].strip(),
            'dept_type': data.get('department_type', 'combined'),
            'dept_code': department_code,
            'contact_name': data['contact_name'].strip(),
            'contact_email': data['contact_email'].lower().strip(),
            'contact_phone': data.get('contact_phone', '').strip(),
            'contact_title': data.get('contact_title', '').strip(),
            'service_area': data.get('service_area_description', '').strip(),
            'population': data.get('population_served'),
            'stations': data.get('number_of_stations'),
            'justification': data.get('justification', '').strip(),
            'requested_at': datetime.utcnow()
        })
        
        db.session.commit()
        
        logger.info(f"Department request submitted: {data['department_name']} by {data['contact_email']}")
        
        return jsonify({
            'success': True,
            'message': 'Department request submitted successfully',
            'next_steps': [
                'Your request has been submitted for review',
                'A system administrator will review your application',
                'You will be notified by email within 2-3 business days',
                'Upon approval, you will receive setup instructions'
            ]
        })
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error submitting department request: {str(e)}")
        return jsonify({'error': 'Failed to submit department request'}), 500

@bp.route('/request-join-department', methods=['POST'])
def request_join_department():
    """Submit a request to join an existing department"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate request data
        errors = validate_user_request(data)
        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        # Check for duplicate requests
        existing_request = db.session.execute(
            text("""
            SELECT id FROM user_requests 
            WHERE user_email = :email AND department_id = :dept_id AND status = 'pending'
            """),
            {
                'email': data['user_email'].lower().strip(),
                'dept_id': data['department_id']
            }
        ).fetchone()
        
        if existing_request:
            return jsonify({'error': 'A pending request already exists for this email and department'}), 400
        
        # Get department info for response
        dept_info = db.session.execute(
            text("SELECT name FROM departments WHERE id = :dept_id"),
            {'dept_id': data['department_id']}
        ).fetchone()
        
        if not dept_info:
            return jsonify({'error': 'Department not found'}), 404
        
        # Create user request
        insert_sql = """
        INSERT INTO user_requests (
            department_id, user_name, user_email, user_phone,
            requested_role, verification_info, employee_id,
            years_of_service, current_position, status, requested_at
        ) VALUES (
            :dept_id, :user_name, :user_email, :user_phone,
            :role, :verification, :employee_id,
            :years_service, :position, 'pending', :requested_at
        )
        """
        
        db.session.execute(text(insert_sql), {
            'dept_id': data['department_id'],
            'user_name': data['user_name'].strip(),
            'user_email': data['user_email'].lower().strip(),
            'user_phone': data.get('user_phone', '').strip(),
            'role': data.get('requested_role', 'user'),
            'verification': data.get('verification_info', '').strip(),
            'employee_id': data.get('employee_id', '').strip(),
            'years_service': data.get('years_of_service'),
            'position': data.get('current_position', '').strip(),
            'requested_at': datetime.utcnow()
        })
        
        db.session.commit()
        
        logger.info(f"User join request submitted: {data['user_name']} to {dept_info[0]}")
        
        return jsonify({
            'success': True,
            'message': f'Join request submitted successfully for {dept_info[0]}',
            'next_steps': [
                f'Your request to join {dept_info[0]} has been submitted',
                'A department administrator will review your application',
                'You will be notified by email when a decision is made',
                'Please ensure the provided contact information is accurate'
            ]
        })
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error submitting user join request: {str(e)}")
        return jsonify({'error': 'Failed to submit join request'}), 500

# Health check endpoint
@bp.route('/health', methods=['GET'])
def health_check():
    """Health check for public registration endpoints"""
    try:
        # Test database connection
        db.session.execute(text("SELECT 1")).fetchone()
        
        return jsonify({
            'status': 'healthy',
            'service': 'public_registration',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500