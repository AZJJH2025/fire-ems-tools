from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import sqlite3
import logging
import os

beta_signup_bp = Blueprint('beta_signup', __name__)

def get_db_connection():
    """Get database connection"""
    try:
        db_path = current_app.config.get('DATABASE_PATH', 'instance/fire_ems.db')
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        current_app.logger.error(f"Database connection error: {e}")
        return None

def init_beta_signups_table():
    """Initialize beta signups table if it doesn't exist"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS beta_signups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                department_name TEXT NOT NULL,
                contact_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                state TEXT NOT NULL,
                phone TEXT,
                position TEXT,
                timestamp TEXT NOT NULL,
                source TEXT DEFAULT 'landing_page',
                user_agent TEXT,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to create beta_signups table: {e}")
        return False
    finally:
        conn.close()

@beta_signup_bp.route('/api/beta-signup', methods=['POST'])
def beta_signup():
    """Handle beta signup form submissions"""
    try:
        # Initialize table if needed
        if not init_beta_signups_table():
            return jsonify({'error': 'Database initialization failed'}), 500
        
        # Validate request data
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        
        # Required fields validation
        required_fields = ['departmentName', 'contactName', 'email', 'state']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing_fields': missing_fields
            }), 400
        
        # Email validation (basic)
        email = data.get('email', '').strip().lower()
        if '@' not in email or '.' not in email:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Get database connection
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        try:
            # Check if email already exists
            existing = conn.execute(
                'SELECT id FROM beta_signups WHERE email = ?', 
                (email,)
            ).fetchone()
            
            if existing:
                return jsonify({
                    'error': 'Email already registered for beta access',
                    'message': 'This email is already on our beta list. We\'ll be in touch soon!'
                }), 409
            
            # Insert new beta signup
            conn.execute('''
                INSERT INTO beta_signups 
                (department_name, contact_name, email, state, phone, position, timestamp, source, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('departmentName', '').strip(),
                data.get('contactName', '').strip(),
                email,
                data.get('state', '').strip(),
                data.get('phone', '').strip() if data.get('phone') else None,
                data.get('position', '').strip() if data.get('position') else None,
                data.get('timestamp', datetime.utcnow().isoformat()),
                data.get('source', 'landing_page'),
                data.get('userAgent', request.headers.get('User-Agent', ''))[:500]  # Truncate long user agents
            ))
            
            conn.commit()
            signup_id = conn.lastrowid
            
            # Log successful signup
            current_app.logger.info(f"New beta signup: {email} from {data.get('departmentName')} (ID: {signup_id})")
            
            # TODO: Send notification email to admin
            # TODO: Send welcome email to user
            # TODO: Add to marketing automation system
            
            return jsonify({
                'success': True,
                'message': 'Thank you for your interest! We\'ll be in touch soon with beta access details.',
                'signup_id': signup_id
            }), 201
            
        except sqlite3.IntegrityError as e:
            current_app.logger.warning(f"Duplicate beta signup attempt: {email}")
            return jsonify({
                'error': 'Email already registered',
                'message': 'This email is already on our beta list. We\'ll be in touch soon!'
            }), 409
            
        except Exception as e:
            current_app.logger.error(f"Beta signup database error: {e}")
            return jsonify({'error': 'Failed to save signup information'}), 500
            
        finally:
            conn.close()
    
    except Exception as e:
        current_app.logger.error(f"Beta signup error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@beta_signup_bp.route('/api/beta-signups', methods=['GET'])
def get_beta_signups():
    """Get beta signups (admin only)"""
    # TODO: Add authentication check for admin role
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        signups = conn.execute('''
            SELECT 
                id,
                department_name,
                contact_name,
                email,
                state,
                phone,
                position,
                timestamp,
                source,
                status,
                created_at
            FROM beta_signups 
            ORDER BY created_at DESC
        ''').fetchall()
        
        return jsonify({
            'signups': [dict(signup) for signup in signups],
            'total': len(signups)
        })
        
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve beta signups: {e}")
        return jsonify({'error': 'Failed to retrieve signups'}), 500
    finally:
        conn.close()

@beta_signup_bp.route('/api/beta-signup/<int:signup_id>/status', methods=['PUT'])
def update_signup_status(signup_id):
    """Update signup status (admin only)"""
    # TODO: Add authentication check for admin role
    
    if not request.is_json:
        return jsonify({'error': 'Content-Type must be application/json'}), 400
    
    data = request.get_json()
    new_status = data.get('status')
    
    if new_status not in ['pending', 'approved', 'rejected', 'contacted']:
        return jsonify({'error': 'Invalid status'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        conn.execute('''
            UPDATE beta_signups 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ''', (new_status, signup_id))
        
        if conn.total_changes == 0:
            return jsonify({'error': 'Signup not found'}), 404
        
        conn.commit()
        
        current_app.logger.info(f"Updated beta signup {signup_id} status to {new_status}")
        
        return jsonify({
            'success': True,
            'message': f'Status updated to {new_status}'
        })
        
    except Exception as e:
        current_app.logger.error(f"Failed to update signup status: {e}")
        return jsonify({'error': 'Failed to update status'}), 500
    finally:
        conn.close()