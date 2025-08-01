"""
Authentication routes for Fire EMS Tools
Provides both API endpoints for React app and redirect routes for legacy URLs
"""

import logging
from flask import Blueprint, redirect, jsonify, request, session
from flask_login import login_user, logout_user, login_required, current_user
from database import db, User, Department
from datetime import datetime
from email_service import EmailService
from database_utils import retry_db_query, retry_db_write, check_database_health, get_connection_pool_stats

# Setup logger
logger = logging.getLogger(__name__)

# Initialize email service
email_service = EmailService()

# Create blueprint
bp = Blueprint('auth', __name__, url_prefix='/auth')

# API status endpoint for React app
@bp.route('/status', methods=['GET'])
def auth_status():
    """Check authentication status - API endpoint for React app"""
    try:
        if current_user.is_authenticated:
            return jsonify({
                'authenticated': True,
                'user': {
                    'id': current_user.id,
                    'username': current_user.username,
                    'email': current_user.email,
                    'role': current_user.role,
                    'department': current_user.department.name if current_user.department else None
                }
            })
        else:
            return jsonify({
                'authenticated': False,
                'user': None
            })
    except Exception as e:
        logger.error(f"Auth status check failed: {str(e)}")
        return jsonify({
            'authenticated': False,
            'user': None,
            'error': 'Authentication check failed'
        }), 500

# Legacy redirect routes (for backward compatibility)
@bp.route('/login')
def login():
    """Login route - redirect to React app"""
    return redirect('/login')

@bp.route('/register')
def register():
    """Register route - redirect to React app"""
    return redirect('/signup')

@bp.route('/logout')
def logout():
    """Logout route"""
    return redirect('/')

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

# Quick user password reset for troubleshooting
@bp.route('/reset-user-password/<email>')
def reset_user_password_simple(email):
    """Simple GET endpoint to reset any user password - for troubleshooting"""
    try:
        from database import db, User
        
        # Find the user
        user = User.query.filter_by(email=email.lower().strip()).first()
        
        if user:
            # Reset password to a simple value
            simple_password = 'TempPass123!'
            user.set_password(simple_password)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'User password reset successfully',
                'email': user.email,
                'new_password': simple_password,
                'note': 'You can now login with these credentials'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Emergency database migration endpoint (GET for browser access)
@bp.route('/emergency-migrate-database')
def emergency_migrate_database():
    """Emergency endpoint to migrate notification table schema"""
    try:
        from database import db
        from sqlalchemy import text
        
        # Manual database migration for notification table
        migration_results = []
        
        # Check if notifications table exists and get its current schema
        with db.engine.connect() as connection:
            result = connection.execute(text("PRAGMA table_info(notifications)"))
            existing_columns = [row[1] for row in result]
            migration_results.append(f"Existing columns: {existing_columns}")
            
            # Define required columns for notification table
            required_columns = {
                'user_id': 'INTEGER NOT NULL',
                'type': 'VARCHAR(50) NOT NULL',
                'title': 'VARCHAR(200) NOT NULL', 
                'message': 'TEXT NOT NULL',
                'is_read': 'BOOLEAN NOT NULL DEFAULT 0',
                'created_at': 'DATETIME NOT NULL',
                'action_url': 'VARCHAR(500)',
                'priority': 'VARCHAR(20) DEFAULT "normal"',
                'data': 'JSON'
            }
            
            # Add missing columns
            for column_name, column_def in required_columns.items():
                if column_name not in existing_columns:
                    try:
                        # Add the missing column
                        alter_sql = f"ALTER TABLE notifications ADD COLUMN {column_name} {column_def}"
                        connection.execute(text(alter_sql))
                        migration_results.append(f"Added column: {column_name}")
                    except Exception as e:
                        migration_results.append(f"Failed to add {column_name}: {str(e)}")
            
            # Create foreign key constraint for user_id if it doesn't exist
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications (user_id)"))
                migration_results.append("Created user_id index")
            except Exception as e:
                migration_results.append(f"Index creation warning: {str(e)}")
            
            # Commit the transaction
            connection.commit()
        
        return jsonify({
            'success': True,
            'message': 'Database migration completed',
            'migration_results': migration_results
        })
        
    except Exception as e:
        logger.error(f"Database migration error: {str(e)}")
        return jsonify({'error': str(e), 'message': 'Migration failed'}), 500

# Emergency database initialization endpoint (GET for browser access)
@bp.route('/emergency-init-database')
def emergency_init_database_get():
    """Emergency GET endpoint to initialize database schema - for browser access"""
    try:
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
        
        # Find user by email with retry logic
        @retry_db_query
        def find_user_by_email(email):
            return User.query.filter_by(email=email.lower().strip()).first()
        
        user = find_user_by_email(data['email'])
        
        # Debug logging to understand login failure
        if not user:
            logger.error(f"❌ LOGIN DEBUG: User not found for email: {data['email']}")
        else:
            logger.info(f"✅ LOGIN DEBUG: User found - ID: {user.id}, Email: {user.email}, Active: {user.is_active}")
            logger.info(f"🔐 LOGIN DEBUG: Password hash exists: {user.password_hash is not None}")
            if user.password_hash:
                logger.info(f"🔐 LOGIN DEBUG: Password hash length: {len(user.password_hash)}")
                # Test password check
                password_valid = user.check_password(data['password'])
                logger.info(f"🔐 LOGIN DEBUG: Password check result: {password_valid}")
                logger.info(f"🔐 LOGIN DEBUG: Attempted password: '{data['password']}'")
                logger.info(f"🔐 LOGIN DEBUG: Password length: {len(data['password'])}")
            else:
                logger.error(f"❌ LOGIN DEBUG: Password hash is None for user {user.email}")
        
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
        
        # Log the user in with retry logic for database write
        @retry_db_write
        def update_user_login(user, remember=False):
            login_user(user, remember=remember)
            user.update_last_login()
            db.session.commit()
        
        update_user_login(user, data.get('remember', False))
        
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
def api_current_user():
    """API endpoint to get current user info - returns JSON for both authenticated and unauthenticated users"""
    try:
        if current_user.is_authenticated:
            return jsonify({
                'success': True,
                'user': {
                    'id': current_user.id,
                    'email': current_user.email,
                    'name': current_user.name,
                    'role': current_user.role,
                    'department_id': current_user.department_id,
                    'department_name': current_user.department.name if current_user.department else None,
                    'last_login': current_user.last_login.isoformat() if current_user.last_login else None,
                    'has_temp_password': getattr(current_user, 'has_temp_password', False)
                }
            })
        else:
            # Return JSON response for unauthenticated users instead of redirecting
            return jsonify({
                'success': False,
                'user': None,
                'message': 'Not authenticated'
            }), 401
    except Exception as e:
        logger.error(f"Current user error: {str(e)}")
        return jsonify({
            'success': False,
            'user': None,
            'message': 'An error occurred getting user info'
        }), 500

@bp.route('/api/forgot-password', methods=['POST'])
def api_forgot_password():
    """API endpoint for password reset request"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email'):
            return jsonify({
                'success': False,
                'message': 'Email address is required'
            }), 400
        
        email = data['email'].lower().strip()
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        # Always return success to prevent email enumeration attacks
        # But only send email if user exists
        if user and user.is_active:
            # Generate secure reset token
            import secrets
            import hashlib
            from datetime import datetime, timedelta
            
            # Create reset token (32 bytes = 256 bits of entropy)
            reset_token = secrets.token_urlsafe(32)
            reset_token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
            
            # Set token expiration (24 hours)
            reset_expires = datetime.utcnow() + timedelta(hours=24)
            
            # Store token hash and expiration in user record
            user.reset_token_hash = reset_token_hash
            user.reset_token_expires = reset_expires
            user.has_temp_password = True  # Force password change after reset
            db.session.commit()
            
            # Send password reset email
            try:
                department_name = user.department.name if user.department else "FireEMS.ai"
                # Use dynamic URL generation instead of hardcoded domain
                base_url = request.host_url.rstrip('/')
                reset_url = f"{base_url}/reset-password?token={reset_token}&email={email}"
                
                email_sent = email_service.send_password_reset_email(
                    user_email=user.email,
                    user_name=user.name,
                    department_name=department_name,
                    reset_url=reset_url,
                    expires_hours=24
                )
                
                if email_sent:
                    logger.info(f"Password reset email sent successfully to {user.email}")
                else:
                    logger.error(f"Failed to send password reset email to {user.email}")
                    
            except Exception as e:
                logger.error(f"Error sending password reset email to {user.email}: {str(e)}")
        
        # Always return success message (security best practice)
        return jsonify({
            'success': True,
            'message': 'If an account with that email exists, a password reset link has been sent.'
        })
        
    except Exception as e:
        logger.error(f"Forgot password error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while processing your request'
        }), 500

@bp.route('/api/reset-password', methods=['POST'])
def api_reset_password():
    """API endpoint for password reset with token"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'token', 'newPassword', 'confirmPassword']
        if not data or not all(field in data for field in required_fields):
            return jsonify({
                'success': False,
                'message': 'All fields are required'
            }), 400
        
        email = data['email'].lower().strip()
        token = data['token']
        new_password = data['newPassword']
        confirm_password = data['confirmPassword']
        
        # Validate password confirmation
        if new_password != confirm_password:
            return jsonify({
                'success': False,
                'message': 'Passwords do not match'
            }), 400
        
        # Validate password strength
        if len(new_password) < 8:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 8 characters long'
            }), 400
        
        # Find user and validate token
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.is_active:
            return jsonify({
                'success': False,
                'message': 'Invalid reset token or expired link'
            }), 400
        
        # Check if token exists and hasn't expired
        if not user.reset_token_hash or not user.reset_token_expires:
            return jsonify({
                'success': False,
                'message': 'Invalid reset token or expired link'
            }), 400
        
        # Check token expiration
        from datetime import datetime
        if datetime.utcnow() > user.reset_token_expires:
            # Clear expired token
            user.reset_token_hash = None
            user.reset_token_expires = None
            db.session.commit()
            
            return jsonify({
                'success': False,
                'message': 'Reset link has expired. Please request a new one.'
            }), 400
        
        # Validate token
        import hashlib
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        if token_hash != user.reset_token_hash:
            return jsonify({
                'success': False,
                'message': 'Invalid reset token'
            }), 400
        
        # Reset password
        user.set_password(new_password)
        user.reset_token_hash = None  # Clear token
        user.reset_token_expires = None
        user.has_temp_password = False  # Password is now user-set
        user.update_last_login()
        db.session.commit()
        
        logger.info(f"Password reset successfully for user {user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Password reset successfully. You can now log in with your new password.'
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Password reset error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while resetting your password'
        }), 500

@bp.route('/api/change-password', methods=['POST'])
@login_required
def api_change_password():
    """API endpoint for user to change their password"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('currentPassword') or not data.get('newPassword'):
            return jsonify({
                'success': False,
                'message': 'Current password and new password are required'
            }), 400
        
        current_password = data['currentPassword']
        new_password = data['newPassword']
        confirm_password = data.get('confirmPassword')
        
        # Validate new password confirmation
        if confirm_password and new_password != confirm_password:
            return jsonify({
                'success': False,
                'message': 'New password and confirmation do not match'
            }), 400
        
        # Verify current password
        if not current_user.check_password(current_password):
            return jsonify({
                'success': False,
                'message': 'Current password is incorrect'
            }), 401
        
        # Validate new password strength
        if len(new_password) < 8:
            return jsonify({
                'success': False,
                'message': 'New password must be at least 8 characters long'
            }), 400
        
        # Check if new password is different from current
        if current_user.check_password(new_password):
            return jsonify({
                'success': False,
                'message': 'New password must be different from current password'
            }), 400
        
        # Update password and clear temporary password flag
        current_user.set_password(new_password)
        current_user.has_temp_password = False  # Clear temporary password flag
        current_user.update_last_login()  # Update last activity
        db.session.commit()
        
        logger.info(f"Password changed successfully for user {current_user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Password change error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while changing password'
        }), 500

# Database health check endpoint
@bp.route('/api/health/database', methods=['GET'])
def database_health_check():
    """Database health check endpoint for monitoring"""
    try:
        # Check basic database connectivity
        health_status = check_database_health(db)
        
        # Get connection pool statistics
        pool_stats = get_connection_pool_stats(db)
        
        # Test a simple database operation
        @retry_db_query
        def test_user_query():
            return User.query.count()
        
        try:
            user_count = test_user_query()
            query_test = True
        except Exception as e:
            logger.warning(f"Database query test failed: {str(e)}")
            user_count = None
            query_test = False
        
        return jsonify({
            'status': 'healthy' if health_status and query_test else 'degraded',
            'database_connection': health_status,
            'query_test': query_test,
            'user_count': user_count,
            'connection_pool': pool_stats,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 503