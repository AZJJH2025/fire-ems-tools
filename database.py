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