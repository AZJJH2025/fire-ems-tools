"""
Admin routes for FireEMS.ai application.

This module defines the routes for the admin interface, including:
- Department management
- User management
- System settings
- Tool management
"""

from flask import Blueprint, render_template, redirect, url_for, request, flash, session
from flask_login import login_required, current_user
import logging
from database import db, Department, User, Incident, Station
from datetime import datetime

logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('admin', __name__, url_prefix='/admin')

# Admin authentication decorator
def admin_required(f):
    """Decorator to check if user is an admin"""
    def decorated_function(*args, **kwargs):
        # Check if user is logged in via Flask-Login
        if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
            if not hasattr(current_user, 'is_super_admin') or not current_user.is_super_admin():
                flash('You do not have permission to access this page', 'error')
                return redirect(url_for('main.index'))
        else:
            # Check session-based authentication
            user_id = session.get('user_id')
            if user_id:
                user = User.query.get(user_id)
                if not (user and user.role == 'super_admin'):
                    flash('You do not have permission to access this page', 'error')
                    return redirect(url_for('main.index'))
            else:
                flash('You must be logged in to access this page', 'error')
                return redirect(url_for('auth.login'))
        
        return f(*args, **kwargs)
    
    # Preserve the original function's metadata
    decorated_function.__name__ = f.__name__
    decorated_function.__doc__ = f.__doc__
    
    return decorated_function

# Dashboard (default admin page)
@bp.route('/')
@admin_required
def dashboard():
    """Admin dashboard"""
    # Get counts for dashboard
    try:
        departments_count = Department.query.count()
        users_count = User.query.count()
        incidents_count = Incident.query.count()
    except Exception as e:
        logger.error(f"Error querying data for admin dashboard: {str(e)}")
        flash('An error occurred while loading the admin dashboard data', 'error')
        departments_count = 0
        users_count = 0
        incidents_count = 0
    
    # Get current user (either from Flask-Login or session)
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
        user = current_user
    else:
        user_id = session.get('user_id')
        user = User.query.get(user_id) if user_id else None
    
    # Render the template with the required data
    return render_template('admin/dashboard.html', 
                          current_user=user,
                          departments_count=departments_count,
                          users_count=users_count,
                          incidents_count=incidents_count)

# Department routes
@bp.route('/departments')
@admin_required
def departments():
    """Department management page"""
    departments = Department.query.all()
    
    # Get current user (either from Flask-Login or session)
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
        user = current_user
    else:
        user_id = session.get('user_id')
        user = User.query.get(user_id) if user_id else None
    
    return render_template('admin/departments.html',
                          current_user=user,
                          departments=departments)

@bp.route('/departments/register', methods=['GET', 'POST'])
@admin_required
def department_register():
    """Register a new department"""
    if request.method == 'POST':
        name = request.form.get('name')
        code = request.form.get('code')
        address = request.form.get('address')
        city = request.form.get('city')
        state = request.form.get('state')
        zip_code = request.form.get('zip_code')
        
        # Basic validation
        if not name or not code:
            flash('Department name and code are required', 'error')
            return render_template('admin/department-register.html')
        
        # Check if department already exists
        existing_dept = Department.query.filter_by(code=code).first()
        if existing_dept:
            flash('Department with this code already exists', 'error')
            return render_template('admin/department-register.html')
        
        # Create new department
        department = Department(
            name=name,
            code=code,
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            is_active=True,
            created_at=datetime.utcnow(),
            setup_complete=False
        )
        
        # Save to database
        db.session.add(department)
        db.session.commit()
        
        flash('Department registered successfully', 'success')
        return redirect(url_for('admin.departments'))
    
    # Get current user (either from Flask-Login or session)
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
        user = current_user
    else:
        user_id = session.get('user_id')
        user = User.query.get(user_id) if user_id else None
    
    return render_template('admin/department-register.html', current_user=user)

@bp.route('/departments/<int:dept_id>/view')
@admin_required
def department_view(dept_id):
    """View department details"""
    department = Department.query.get_or_404(dept_id)
    
    # Get the department's stations
    stations = Station.query.filter_by(department_id=dept_id).all()
    
    # Get the department's users
    users = User.query.filter_by(department_id=dept_id).all()
    
    # Get the department's incidents
    incidents = Incident.query.filter_by(department_id=dept_id).all()
    
    # Get current user (either from Flask-Login or session)
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
        user = current_user
    else:
        user_id = session.get('user_id')
        user = User.query.get(user_id) if user_id else None
    
    return render_template('admin/department-view.html',
                          current_user=user,
                          department=department,
                          stations=stations,
                          users=users,
                          incidents=incidents)

@bp.route('/departments/<int:dept_id>/edit', methods=['GET', 'POST'])
@admin_required
def department_edit(dept_id):
    """Edit department details"""
    department = Department.query.get_or_404(dept_id)
    
    if request.method == 'POST':
        department.name = request.form.get('name')
        department.address = request.form.get('address')
        department.city = request.form.get('city')
        department.state = request.form.get('state')
        department.zip_code = request.form.get('zip_code')
        department.phone = request.form.get('phone')
        department.email = request.form.get('email')
        department.website = request.form.get('website')
        department.is_active = bool(request.form.get('is_active'))
        
        db.session.commit()
        
        flash('Department updated successfully', 'success')
        return redirect(url_for('admin.departments'))
    
    # Get current user (either from Flask-Login or session)
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
        user = current_user
    else:
        user_id = session.get('user_id')
        user = User.query.get(user_id) if user_id else None
    
    return render_template('admin/department-edit.html',
                          current_user=user,
                          department=department)

@bp.route('/departments/<int:dept_id>/delete', methods=['GET', 'POST'])
@admin_required
def department_delete(dept_id):
    """Delete a department"""
    department = Department.query.get_or_404(dept_id)
    
    # Special protection for the ADMIN department
    if department.code == 'ADMIN':
        flash('The System Administration department cannot be deleted', 'error')
        return redirect(url_for('admin.departments'))
    
    if request.method == 'POST':
        # Get confirmation
        confirm = request.form.get('confirm')
        
        if confirm == department.code:
            # Delete the department and all related data (cascade should handle this)
            db.session.delete(department)
            db.session.commit()
            
            flash('Department deleted successfully', 'success')
            return redirect(url_for('admin.departments'))
        else:
            flash('Confirmation code does not match department code', 'error')
    
    # Get current user (either from Flask-Login or session)
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
        user = current_user
    else:
        user_id = session.get('user_id')
        user = User.query.get(user_id) if user_id else None
    
    return render_template('admin/department-delete.html',
                          current_user=user,
                          department=department)

# User management routes
@bp.route('/users')
@admin_required
def users():
    """User management page"""
    users = User.query.all()
    
    # Get current user (either from Flask-Login or session)
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
        user = current_user
    else:
        user_id = session.get('user_id')
        user = User.query.get(user_id) if user_id else None
    
    return render_template('admin/users.html',
                          current_user=user,
                          users=users)

# Tools management routes
@bp.route('/tools')
@admin_required
def tools():
    """Tools management page"""
    
    # Get current user (either from Flask-Login or session)
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
        user = current_user
    else:
        user_id = session.get('user_id')
        user = User.query.get(user_id) if user_id else None
    
    return render_template('admin/tools.html',
                          current_user=user)

@bp.route('/tools/usage')
@admin_required
def tools_usage():
    """Tools usage statistics page"""
    
    # Get current user (either from Flask-Login or session)
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
        user = current_user
    else:
        user_id = session.get('user_id')
        user = User.query.get(user_id) if user_id else None
    
    return render_template('admin/tools-usage.html',
                          current_user=user)

# Settings page
@bp.route('/settings')
@admin_required
def settings():
    """System settings page"""
    
    # Get current user (either from Flask-Login or session)
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
        user = current_user
    else:
        user_id = session.get('user_id')
        user = User.query.get(user_id) if user_id else None
    
    return render_template('admin/settings.html',
                          current_user=user)