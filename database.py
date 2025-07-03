from flask_sqlalchemy import SQLAlchemy
import json
import secrets
import uuid
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize SQLAlchemy without binding to an app yet
db = SQLAlchemy()

# Department model
class Department(db.Model):
    __tablename__ = 'departments'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Department details
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(50))
    zip_code = db.Column(db.String(20))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    website = db.Column(db.String(255))
    
    # Department configuration
    logo_url = db.Column(db.String(255))
    primary_color = db.Column(db.String(20), default="#3498db")
    secondary_color = db.Column(db.String(20), default="#2c3e50")
    
    # Department details
    department_type = db.Column(db.String(20), default="combined") # fire, ems, combined
    num_stations = db.Column(db.Integer, default=1)
    num_personnel = db.Column(db.Integer, default=0)
    service_area = db.Column(db.Float) # in square miles
    population_served = db.Column(db.Integer)
    
    # API Access
    api_key = db.Column(db.String(64), unique=True, nullable=True)
    api_enabled = db.Column(db.Boolean, default=False)
    
    # Webhook Configuration
    webhooks_enabled = db.Column(db.Boolean, default=False)
    webhook_url = db.Column(db.String(255), nullable=True)
    webhook_secret = db.Column(db.String(64), nullable=True)
    webhook_events = db.Column(db.JSON, default=lambda: {
        "incident.created": True,
        "incident.updated": True,
        "station.created": False,
        "user.created": False
    })
    webhook_last_error = db.Column(db.Text, nullable=True)
    webhook_last_success = db.Column(db.DateTime, nullable=True)
    
    # Feature access & status
    is_active = db.Column(db.Boolean, default=True)
    setup_complete = db.Column(db.Boolean, default=False)
    features_enabled = db.Column(db.JSON, default=lambda: {
        "incident_logger": True,
        "call_density": True,
        "isochrone_map": True, 
        "dashboard": True
    })
    
    # Relationships with cascade delete
    incidents = db.relationship('Incident', backref='department', lazy=True, cascade="all, delete-orphan")
    stations = db.relationship('Station', backref='department', lazy=True, cascade="all, delete-orphan")
    users = db.relationship('User', backref='department', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Department {self.code}: {self.name}>"
        
    def to_dict(self):
        """Convert department to dictionary for API responses"""
        result = {
            'id': self.id,
            'code': self.code,
            'name': self.name
        }
        
        # Add optional fields that might not exist in older deployments
        for field in [
            'address', 'city', 'state', 'zip_code', 'phone', 'email', 'website',
            'logo_url', 'primary_color', 'secondary_color', 'department_type',
            'num_stations', 'num_personnel', 'service_area', 'population_served',
            'api_enabled', 'is_active', 'setup_complete', 'features_enabled'
        ]:
            if hasattr(self, field):
                result[field] = getattr(self, field)
        
        # Add date fields with proper formatting
        if hasattr(self, 'created_at') and self.created_at:
            result['created_at'] = self.created_at.isoformat()
        
        return result
        
    def to_dict_with_api_key(self):
        """Convert department to dictionary including API key (for admin use only)"""
        result = self.to_dict()
        result['api_key'] = self.api_key
        return result
        
    def to_dict_with_webhook(self):
        """Convert department to dictionary including webhook details (for admin use only)"""
        result = self.to_dict()
        result['webhook_url'] = self.webhook_url
        result['webhook_secret'] = self.webhook_secret
        result['webhook_events'] = self.webhook_events
        result['webhooks_enabled'] = self.webhooks_enabled
        result['webhook_last_error'] = self.webhook_last_error
        result['webhook_last_success'] = self.webhook_last_success.isoformat() if self.webhook_last_success else None
        return result
        
    def generate_api_key(self):
        """Generate a new API key for this department"""
        # Create a secure random token
        self.api_key = f"fems_{uuid.uuid4().hex}_{secrets.token_hex(8)}"
        self.api_enabled = True
        return self.api_key
        
    def disable_api(self):
        """Disable API access for this department"""
        self.api_enabled = False
        
    def enable_api(self):
        """Enable API access for this department"""
        if not self.api_key:
            self.generate_api_key()
        self.api_enabled = True
        
    def generate_webhook_secret(self):
        """Generate a new webhook secret for this department"""
        # Create a secure random token for webhook signature verification
        self.webhook_secret = secrets.token_hex(32)
        return self.webhook_secret
        
    def enable_webhooks(self):
        """Enable webhooks for this department"""
        if not self.webhook_secret:
            self.generate_webhook_secret()
        self.webhooks_enabled = True
        
    def disable_webhooks(self):
        """Disable webhooks for this department"""
        self.webhooks_enabled = False
        
    def update_webhook_success(self):
        """Update the last successful webhook delivery timestamp"""
        self.webhook_last_success = datetime.utcnow()
        
    def update_webhook_error(self, error_message):
        """Update the last webhook error message"""
        self.webhook_last_error = error_message

# Station model
class Station(db.Model):
    __tablename__ = 'stations'
    
    id = db.Column(db.Integer, primary_key=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    station_number = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(50))
    zip_code = db.Column(db.String(20))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Station details
    personnel_count = db.Column(db.Integer, default=0)
    apparatus = db.Column(db.JSON) # List of apparatus at this station
    
    def __repr__(self):
        return f"<Station {self.station_number}: {self.name}>"

# User model for department personnel
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200))
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='user')  # admin, manager, user
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    has_temp_password = db.Column(db.Boolean, default=False)  # Track if user has temporary password
    
    # Password reset fields
    reset_token_hash = db.Column(db.String(255), nullable=True)  # Hashed reset token
    reset_token_expires = db.Column(db.DateTime, nullable=True)  # Token expiration time
    
    # User preferences
    preferences = db.Column(db.JSON, default=dict)
    
    # Fields required by Flask-Login
    @property
    def is_authenticated(self):
        return True
        
    @property
    def is_anonymous(self):
        return False
    
    def get_id(self):
        return str(self.id)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        self.last_login = datetime.utcnow()
        
    def is_admin(self):
        return self.role == 'admin'
        
    def is_super_admin(self):
        """Super admin can access the admin interface"""
        return self.role == 'super_admin'
        
    def __repr__(self):
        return f"<User {self.email}: {self.name}>"
        
    def to_dict(self):
        """Convert user to dictionary for API responses"""
        result = {
            'id': self.id,
            'department_id': self.department_id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        # Add preferences if the field exists
        if hasattr(self, 'preferences'):
            result['preferences'] = self.preferences
            
        return result

# Incident model
class Incident(db.Model):
    __tablename__ = 'incidents'
    
    id = db.Column(db.Integer, primary_key=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    title = db.Column(db.String(255))
    incident_number = db.Column(db.String(50))
    incident_date = db.Column(db.DateTime)
    incident_type = db.Column(db.String(100))
    location = db.Column(db.String(255))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    data = db.Column(db.JSON)  # For storing all form data as JSON
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Incident {self.id}: {self.title or 'Untitled'}>"
    
    def to_dict(self):
        """Convert incident to dictionary for API responses"""
        return {
            'id': self.id,
            'department_id': self.department_id,
            'title': self.title,
            'incident_number': self.incident_number,
            'incident_date': self.incident_date.isoformat() if self.incident_date else None,
            'incident_type': self.incident_type,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'data': self.data,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_form_data(cls, form_data, department_id):
        """Create an incident from form data"""
        # Extract key fields for searchability
        title = form_data.get('incident_title', 'Untitled Incident')
        incident_number = form_data.get('incident_number')
        
        try:
            incident_date = datetime.fromisoformat(form_data.get('incident_date')) if form_data.get('incident_date') else None
        except (ValueError, TypeError):
            incident_date = None
            
        incident_type = form_data.get('incident_type')
        location = form_data.get('location')
        latitude = float(form_data.get('latitude')) if form_data.get('latitude') else None
        longitude = float(form_data.get('longitude')) if form_data.get('longitude') else None
        
        return cls(
            department_id=department_id,
            title=title,
            incident_number=incident_number,
            incident_date=incident_date,
            incident_type=incident_type,
            location=location,
            latitude=latitude,
            longitude=longitude,
            data=form_data
        )

# Notification model for admin notifications
class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'approval_request', 'user_approved', 'system_alert', 'department_approved'
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    action_url = db.Column(db.String(500))  # URL for notification action
    priority = db.Column(db.String(20), default='normal')  # 'low', 'normal', 'high', 'urgent'
    data = db.Column(db.JSON)  # Additional notification data
    
    # Relationships
    user = db.relationship('User', backref='notifications')
    
    def __repr__(self):
        return f"<Notification {self.id}: {self.title}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'action_url': self.action_url,
            'priority': self.priority,
            'data': self.data
        }
    
    @staticmethod
    def create_notification(user_id, notification_type, title, message, action_url=None, priority='normal', data=None):
        """Helper method to create notifications"""
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            action_url=action_url,
            priority=priority,
            data=data or {}
        )
        db.session.add(notification)
        return notification
    
    @staticmethod
    def notify_admins(notification_type, title, message, action_url=None, priority='normal', data=None, department_id=None):
        """Send notification to all relevant admins"""
        if department_id:
            # Notify department admins and super admins
            admins = User.query.filter(
                db.or_(
                    User.role == 'super_admin',
                    db.and_(User.role == 'admin', User.department_id == department_id)
                )
            ).filter(User.is_active == True).all()
        else:
            # Notify only super admins
            admins = User.query.filter(User.role == 'super_admin', User.is_active == True).all()
        
        notifications = []
        for admin in admins:
            notification = Notification.create_notification(
                user_id=admin.id,
                notification_type=notification_type,
                title=title,
                message=message,
                action_url=action_url,
                priority=priority,
                data=data
            )
            notifications.append(notification)
        
        return notifications


# Department Request model for new department applications
class DepartmentRequest(db.Model):
    __tablename__ = 'department_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Department information
    department_name = db.Column(db.String(100), nullable=False)
    department_type = db.Column(db.String(20), nullable=False)  # fire, ems, combined
    department_code = db.Column(db.String(50))
    
    # Contact information
    contact_name = db.Column(db.String(100), nullable=False)
    contact_email = db.Column(db.String(100), nullable=False)
    contact_phone = db.Column(db.String(20))
    contact_title = db.Column(db.String(100))
    
    # Department details
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(50))
    zip_code = db.Column(db.String(20))
    num_stations = db.Column(db.Integer)
    num_personnel = db.Column(db.Integer)
    service_area = db.Column(db.Float)  # in square miles
    population_served = db.Column(db.Integer)
    
    # Request status and workflow
    status = db.Column(db.String(20), default='pending')  # pending, approved, denied
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    review_notes = db.Column(db.Text)
    
    # Additional information
    website = db.Column(db.String(255))
    justification = db.Column(db.Text)  # Why they need the system
    special_requirements = db.Column(db.Text)
    data = db.Column(db.JSON)  # Additional request data
    
    # Relationships
    reviewer = db.relationship('User', backref='reviewed_department_requests')
    
    def __repr__(self):
        return f"<DepartmentRequest {self.id}: {self.department_name}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'department_name': self.department_name,
            'department_type': self.department_type,
            'department_code': self.department_code,
            'contact_name': self.contact_name,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone,
            'contact_title': self.contact_title,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'num_stations': self.num_stations,
            'num_personnel': self.num_personnel,
            'service_area': self.service_area,
            'population_served': self.population_served,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by': self.reviewed_by,
            'review_notes': self.review_notes,
            'website': self.website,
            'justification': self.justification,
            'special_requirements': self.special_requirements,
            'data': self.data
        }


# User Request model for users requesting to join departments
class UserRequest(db.Model):
    __tablename__ = 'user_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # User information
    user_name = db.Column(db.String(100), nullable=False)
    user_email = db.Column(db.String(100), nullable=False)
    user_phone = db.Column(db.String(20))
    user_title = db.Column(db.String(100))
    
    # Department they want to join
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    requested_role = db.Column(db.String(20), default='user')  # user, manager, admin
    
    # Request information
    justification = db.Column(db.Text)  # Why they need access
    supervisor_name = db.Column(db.String(100))  # Their supervisor for verification
    supervisor_email = db.Column(db.String(100))
    employee_id = db.Column(db.String(50))  # Department employee ID
    
    # Request status and workflow
    status = db.Column(db.String(20), default='pending')  # pending, approved, denied
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    review_notes = db.Column(db.Text)
    
    # Generated credentials (when approved)
    temp_password = db.Column(db.String(255))  # Temporary password hash
    password_expires_at = db.Column(db.DateTime)
    
    # Additional information
    data = db.Column(db.JSON)  # Additional request data
    
    # Relationships
    department = db.relationship('Department', backref='user_requests')
    reviewer = db.relationship('User', backref='reviewed_user_requests')
    
    def __repr__(self):
        return f"<UserRequest {self.id}: {self.user_name} -> {self.department.name if self.department else 'Unknown'}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_name': self.user_name,
            'user_email': self.user_email,
            'user_phone': self.user_phone,
            'user_title': self.user_title,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'requested_role': self.requested_role,
            'justification': self.justification,
            'supervisor_name': self.supervisor_name,
            'supervisor_email': self.supervisor_email,
            'employee_id': self.employee_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by': self.reviewed_by,
            'review_notes': self.review_notes,
            'temp_password': self.temp_password,
            'password_expires_at': self.password_expires_at.isoformat() if self.password_expires_at else None,
            'data': self.data
        }