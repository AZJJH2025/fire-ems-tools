"""
Authentication routes for FireEMS.ai application.

This module defines authentication-related routes, including:
- Login
- Logout
- Registration
- Password reset
"""

from flask import Blueprint, render_template, redirect, url_for, request, flash, session
from flask_login import login_user, logout_user, login_required, current_user
import logging

from database import db, User, Department

logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/login', methods=['GET', 'POST'])
def login():
    """User login page"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = bool(request.form.get('remember'))
        
        logger.info(f"Login attempt for email: {email}")
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        # Log debugging information
        if not user:
            logger.warning(f"Login failed: No user found with email {email}")
            flash('Invalid email or password', 'error')
            return render_template('auth/login.html')
            
        # Check if password check method exists
        if not hasattr(user, 'check_password'):
            logger.error("User model missing check_password method")
            flash('System error: Authentication method unavailable', 'error')
            return render_template('auth/login.html')
        
        # Check if password is correct
        password_correct = False
        try:
            password_correct = user.check_password(password)
        except Exception as e:
            logger.error(f"Password check error: {str(e)}")
            flash('System error during authentication', 'error')
            return render_template('auth/login.html')
            
        if not password_correct:
            logger.warning(f"Login failed: Incorrect password for {email}")
            flash('Invalid email or password', 'error')
            return render_template('auth/login.html')
        
        # Password is correct, login the user
        try:
            login_user(user, remember=remember)
            logger.info(f"User {email} logged in successfully")
            
            # Update last login timestamp
            if hasattr(user, 'last_login'):
                from datetime import datetime
                user.last_login = datetime.utcnow()
                db.session.commit()
                logger.info(f"Updated last login for {email}")
            
            # Redirect to appropriate page
            next_page = request.args.get('next')
            if not next_page or not next_page.startswith('/'):
                next_page = url_for('main.index')
            
            return redirect(next_page)
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            flash('Error during login process', 'error')
    
    return render_template('auth/login.html')

@bp.route('/logout')
@login_required
def logout():
    """User logout"""
    logout_user()
    return redirect(url_for('main.index'))

@bp.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        name = request.form.get('name')
        password = request.form.get('password')
        department_code = request.form.get('department_code')
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email already registered', 'error')
            return render_template('auth/register.html')
            
        # Find department by code
        department = Department.query.filter_by(code=department_code).first()
        if not department:
            flash('Invalid department code', 'error')
            return render_template('auth/register.html')
            
        # Create new user
        new_user = User(
            email=email,
            name=name,
            department_id=department.id,
            role='user'
        )
        new_user.set_password(password)
        
        # Save to database
        db.session.add(new_user)
        db.session.commit()
        
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('auth.login'))
        
    return render_template('auth/register.html')