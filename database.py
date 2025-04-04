from flask_sqlalchemy import SQLAlchemy
import json
from datetime import datetime

# Initialize SQLAlchemy without binding to an app yet
db = SQLAlchemy()

# Department model
class Department(db.Model):
    __tablename__ = 'departments'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    incidents = db.relationship('Incident', backref='department', lazy=True)
    
    def __repr__(self):
        return f"<Department {self.code}: {self.name}>"

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