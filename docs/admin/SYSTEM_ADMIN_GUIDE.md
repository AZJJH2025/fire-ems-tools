# System Administrator Guide - Fire EMS Tools

Complete deployment, configuration, and maintenance guide for system administrators managing Fire EMS Tools installations.

## 📋 **Table of Contents**

1. [System Requirements](#system-requirements)
2. [Installation and Deployment](#installation-and-deployment)
3. [Database Setup and Management](#database-setup-and-management)
4. [User and Department Management](#user-and-department-management)
5. [Security Configuration](#security-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Backup and Recovery](#backup-and-recovery)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)
10. [Updates and Upgrades](#updates-and-upgrades)

---

## 💻 **System Requirements**

### **Production Environment**

#### **Server Specifications**:
- **OS**: Linux (Ubuntu 20.04+ recommended) or Windows Server 2019+
- **CPU**: 2+ cores (4+ cores recommended for multiple departments)
- **RAM**: 4GB minimum (8GB+ recommended for 10+ departments)
- **Storage**: 50GB minimum (SSD recommended)
- **Network**: 100Mbps+ internet connection

#### **Software Dependencies**:
- **Python**: 3.8+ (3.10+ recommended)
- **Node.js**: 16+ (for React build process)
- **Database**: SQLite (included) or PostgreSQL 12+ (production recommended)
- **Web Server**: Built-in Flask server or reverse proxy (nginx/Apache)

### **Development Environment**

#### **Developer Workstation**:
- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 8GB minimum
- **Storage**: 20GB for development environment
- **Tools**: Git, Python 3.8+, Node.js 16+, code editor

### **Browser Compatibility**
- **Chrome**: 90+ (recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Android Chrome 90+

---

## 🚀 **Installation and Deployment**

### **Quick Start Deployment**

#### **1. Clone Repository**
```bash
# Clone the repository
git clone https://github.com/AZJJH2025/fire-ems-tools.git
cd fire-ems-tools

# Verify Python version
python3 --version  # Should be 3.8+

# Install Python dependencies
pip3 install -r requirements.txt
```

#### **2. Build React Application**
```bash
# Install Node.js dependencies
cd react-app
npm install

# Build React application for production
npm run build

# Verify build completed
ls -la dist/  # Should contain index.html and assets/

# Return to root directory
cd ..
```

#### **3. Initialize Database**
```bash
# Create database and tables
python3 -c "from database import db; db.create_all()"

# Run database migrations
python3 add_approval_tables.py

# Verify database created
ls -la instance/  # Should contain fire_ems.db
```

#### **4. Create Initial Admin User**
```bash
# Create super admin user
python3 create_admin.py
# Follow prompts to create admin account
```

#### **5. Start Server**
```bash
# Development server (testing)
python3 app.py

# Production server (with gunicorn)
pip3 install gunicorn
gunicorn -w 4 -b 0.0.0.0:5006 app:app
```

#### **6. Verify Installation**
```bash
# Test server response
curl -I http://localhost:5006/

# Test admin console
curl -I http://localhost:5006/admin

# Test API endpoints
curl -I http://localhost:5006/api/public/health
```

### **Production Deployment with nginx**

#### **1. Install nginx**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### **2. Configure nginx**
```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/fire-ems-tools
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Static files
    location /static/ {
        alias /path/to/fire-ems-tools/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React app assets
    location /app/assets/ {
        alias /path/to/fire-ems-tools/react-app/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React app routes
    location /app/ {
        alias /path/to/fire-ems-tools/react-app/dist/;
        try_files $uri $uri/ /index.html;
    }
    
    # Flask API
    location / {
        proxy_pass http://127.0.0.1:5006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### **3. Enable Site and Restart nginx**
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/fire-ems-tools /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

#### **4. SSL Configuration with Let's Encrypt**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### **Docker Deployment**

#### **Create Dockerfile**
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy and build React app
COPY react-app/ ./react-app/
RUN cd react-app && npm install && npm run build

# Copy Python application
COPY . .

# Initialize database
RUN python -c "from database import db; db.create_all()"
RUN python add_approval_tables.py

EXPOSE 5006

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5006", "app:app"]
```

#### **Build and Run Container**
```bash
# Build Docker image
docker build -t fire-ems-tools .

# Run container
docker run -d \
  --name fire-ems-tools \
  -p 5006:5006 \
  -v /path/to/data:/app/instance \
  fire-ems-tools

# Check logs
docker logs fire-ems-tools
```

---

## 🗄️ **Database Setup and Management**

### **Database Schema Overview**

#### **Core Tables**:
- **users**: User accounts and authentication
- **departments**: Fire department configurations  
- **incidents**: Imported incident data
- **stations**: Fire station information

#### **Admin Workflow Tables**:
- **department_requests**: New department applications
- **user_requests**: User join requests
- **notifications**: Admin notification system

#### **Configuration Tables**:
- **field_mappings**: Saved field mapping templates
- **user_sessions**: Session management
- **audit_logs**: System activity logging

### **Initial Database Setup**

#### **Create Tables**
```bash
# Create all tables
python3 -c "
from database import db
from database import Department, User, Incident, Station
db.create_all()
print('Core tables created successfully')
"

# Create approval workflow tables
python3 add_approval_tables.py
```

#### **Create Initial Admin User**
```python
# create_admin.py
from database import db, User
from werkzeug.security import generate_password_hash
import getpass

def create_admin():
    email = input("Admin email: ")
    password = getpass.getpass("Password: ")
    name = input("Admin name: ")
    
    # Check if user exists
    if User.query.filter_by(email=email).first():
        print("User already exists!")
        return
    
    # Create admin user
    admin = User(
        email=email,
        name=name,
        role='super_admin',
        is_active=True
    )
    admin.password_hash = generate_password_hash(password)
    
    db.session.add(admin)
    db.session.commit()
    
    print(f"Admin user {email} created successfully!")

if __name__ == "__main__":
    create_admin()
```

### **Database Migrations**

#### **Migration Script Template**
```python
# migrations/add_new_feature.py
from database import db
from sqlalchemy import text

def upgrade():
    """Apply migration"""
    # Add new columns
    db.session.execute(text("""
        ALTER TABLE departments 
        ADD COLUMN new_feature_enabled BOOLEAN DEFAULT FALSE
    """))
    
    # Create new tables
    db.session.execute(text("""
        CREATE TABLE IF NOT EXISTS new_feature_data (
            id INTEGER PRIMARY KEY,
            department_id INTEGER REFERENCES departments(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))
    
    db.session.commit()
    print("Migration applied successfully")

def downgrade():
    """Reverse migration"""
    db.session.execute(text("DROP TABLE IF EXISTS new_feature_data"))
    # Note: SQLite doesn't support DROP COLUMN
    db.session.commit()
    print("Migration reversed successfully")

if __name__ == "__main__":
    upgrade()
```

### **Database Maintenance**

#### **Backup Script**
```bash
#!/bin/bash
# backup_database.sh

DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/path/to/fire-ems-tools/instance/fire_ems.db"
BACKUP_DIR="/path/to/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# SQLite backup
sqlite3 $DB_PATH ".backup $BACKUP_DIR/fire_ems_backup_$DATE.db"

# Compress backup
gzip "$BACKUP_DIR/fire_ems_backup_$DATE.db"

# Remove backups older than 30 days
find $BACKUP_DIR -name "fire_ems_backup_*.db.gz" -mtime +30 -delete

echo "Database backup completed: fire_ems_backup_$DATE.db.gz"
```

#### **PostgreSQL Production Setup**
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE fire_ems_tools;
CREATE USER fire_ems_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE fire_ems_tools TO fire_ems_user;
\q
```

```python
# config.py - PostgreSQL configuration
import os

class ProductionConfig:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://fire_ems_user:secure_password@localhost/fire_ems_tools'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'production-secret-key'
```

---

## 👥 **User and Department Management**

### **Department Management**

#### **Create New Department**
```python
# create_department.py
from database import db, Department

def create_department(name, code, dept_type):
    # Default features for new departments
    default_features = {
        'data-formatter': True,
        'response-time-analyzer': True, 
        'fire-map-pro': True,
        'admin-console': True,
        'water-supply-coverage': False,
        'iso-credit-calculator': False
    }
    
    department = Department(
        name=name,
        code=code,
        department_type=dept_type,
        is_active=True,
        api_enabled=False,
        features_enabled=default_features
    )
    
    db.session.add(department)
    db.session.commit()
    
    print(f"Department {name} created with ID: {department.id}")
    return department

# Usage
create_department("Houston Fire Department", "HFD", "combined")
```

#### **Manage Department Features**
```python
# update_department_features.py
from database import db, Department

def update_features(dept_id, features):
    dept = Department.query.get(dept_id)
    if dept:
        dept.features_enabled.update(features)
        db.session.commit()
        print(f"Updated features for {dept.name}")
    else:
        print("Department not found")

# Enable ISO Credit Calculator for department
update_features(1, {'iso-credit-calculator': True})
```

### **User Management**

#### **Create Admin User for Department**
```python
# create_dept_admin.py
from database import db, User, Department
from werkzeug.security import generate_password_hash
import secrets
import string

def create_dept_admin(email, name, department_id):
    # Generate temporary password
    temp_password = ''.join(secrets.choice(
        string.ascii_letters + string.digits
    ) for _ in range(12))
    
    user = User(
        email=email,
        name=name,
        role='admin',
        department_id=department_id,
        is_active=True
    )
    user.password_hash = generate_password_hash(temp_password)
    
    db.session.add(user)
    db.session.commit()
    
    print(f"Admin user created:")
    print(f"Email: {email}")
    print(f"Temporary Password: {temp_password}")
    print("User should change password on first login")

# Usage
create_dept_admin("chief@houstonfireDept.gov", "Fire Chief Smith", 1)
```

#### **User Role Management**
```python
# manage_user_roles.py
from database import db, User

def update_user_role(user_id, new_role):
    """Update user role: 'user', 'admin', 'super_admin'"""
    valid_roles = ['user', 'admin', 'super_admin']
    
    if new_role not in valid_roles:
        print(f"Invalid role. Must be one of: {valid_roles}")
        return
    
    user = User.query.get(user_id)
    if user:
        old_role = user.role
        user.role = new_role
        db.session.commit()
        print(f"Updated {user.email}: {old_role} → {new_role}")
    else:
        print("User not found")

def deactivate_user(user_id):
    """Deactivate user account"""
    user = User.query.get(user_id)
    if user:
        user.is_active = False
        db.session.commit()
        print(f"Deactivated user: {user.email}")
```

### **Bulk User Operations**

#### **Import Users from CSV**
```python
# import_users.py
import csv
from database import db, User, Department
from werkzeug.security import generate_password_hash

def import_users_from_csv(csv_file):
    with open(csv_file, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Check if user exists
            if User.query.filter_by(email=row['email']).first():
                print(f"User {row['email']} already exists, skipping")
                continue
            
            # Find department
            dept = Department.query.filter_by(code=row['dept_code']).first()
            if not dept:
                print(f"Department {row['dept_code']} not found, skipping {row['email']}")
                continue
            
            # Create user
            user = User(
                email=row['email'],
                name=row['name'],
                role=row.get('role', 'user'),
                department_id=dept.id,
                is_active=True
            )
            user.password_hash = generate_password_hash(row['temp_password'])
            
            db.session.add(user)
            print(f"Created user: {row['email']}")
    
    db.session.commit()
    print("User import completed")
```

---

## 🔒 **Security Configuration**

### **Authentication Security**

#### **Session Configuration**
```python
# config.py - Security settings
from datetime import timedelta
import os

class Config:
    # Session security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'change-in-production'
    SESSION_COOKIE_SECURE = True  # HTTPS only
    SESSION_COOKIE_HTTPONLY = True  # No JavaScript access
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=8)
    
    # CSRF protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = 3600
    
    # Content Security Policy
    CSP_DEFAULT_SRC = "'self'"
    CSP_SCRIPT_SRC = "'self' 'unsafe-inline' 'unsafe-eval'"
    CSP_STYLE_SRC = "'self' 'unsafe-inline'"
```

#### **Password Policy**
```python
# password_policy.py
import re
from werkzeug.security import check_password_hash

def validate_password(password):
    """Validate password strength"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one number")
    
    return errors

def force_password_change(user_id):
    """Force user to change password on next login"""
    user = User.query.get(user_id)
    if user:
        user.force_password_change = True
        db.session.commit()
```

### **Access Control**

#### **Role-Based Permissions**
```python
# permissions.py
from functools import wraps
from flask import abort
from flask_login import current_user

def require_role(role):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                abort(401)
            
            if role == 'super_admin' and not current_user.is_super_admin():
                abort(403)
            elif role == 'admin' and not (current_user.is_admin() or current_user.is_super_admin()):
                abort(403)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Usage in routes
@app.route('/admin/super-admin-only')
@require_role('super_admin')
def super_admin_only():
    return "Super admin content"
```

#### **Department Data Isolation**
```python
# data_isolation.py
def get_user_department_filter():
    """Get department filter for current user"""
    if current_user.is_super_admin():
        return None  # See all departments
    else:
        return current_user.department_id

def filter_by_department(query, model):
    """Apply department filter to query"""
    dept_filter = get_user_department_filter()
    if dept_filter is not None:
        return query.filter(model.department_id == dept_filter)
    return query

# Usage
incidents = filter_by_department(
    Incident.query, 
    Incident
).all()
```

### **API Security**

#### **Rate Limiting**
```python
# rate_limiting.py
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["1000 per hour"]
)

# Apply to routes
@app.route('/api/public/request-department', methods=['POST'])
@limiter.limit("5 per minute")
def request_department():
    # Handle department request
    pass
```

#### **Input Validation**
```python
# validation.py
from flask import request, jsonify
import re

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_department_request(data):
    errors = []
    
    required_fields = ['department_name', 'contact_name', 'contact_email']
    for field in required_fields:
        if not data.get(field):
            errors.append(f"{field} is required")
    
    if data.get('contact_email') and not validate_email(data['contact_email']):
        errors.append("Invalid email format")
    
    return errors
```

---

## 📊 **Monitoring and Maintenance**

### **System Monitoring**

#### **Health Check Endpoints**
```python
# health_checks.py
from flask import jsonify
from database import db
import psutil
import os

@app.route('/health')
def health_check():
    """Basic health check"""
    try:
        # Test database connection
        db.session.execute('SELECT 1')
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/health/detailed')
@require_role('super_admin')
def detailed_health():
    """Detailed system health"""
    return jsonify({
        'database': check_database_health(),
        'disk_space': check_disk_space(),
        'memory': check_memory_usage(),
        'active_users': count_active_users()
    })

def check_disk_space():
    """Check available disk space"""
    statvfs = os.statvfs('.')
    available_gb = (statvfs.f_bavail * statvfs.f_frsize) / (1024**3)
    return {
        'available_gb': round(available_gb, 2),
        'warning': available_gb < 5.0
    }
```

#### **Performance Monitoring**
```python
# performance_monitoring.py
import time
from functools import wraps

def monitor_performance(f):
    """Decorator to monitor route performance"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        result = f(*args, **kwargs)
        end_time = time.time()
        
        # Log slow requests
        if end_time - start_time > 5.0:
            logger.warning(f"Slow request: {request.endpoint} took {end_time - start_time:.2f}s")
        
        return result
    return decorated_function

# Usage
@app.route('/api/data/upload')
@monitor_performance
def upload_data():
    # Handle data upload
    pass
```

### **Logging Configuration**

#### **Comprehensive Logging Setup**
```python
# logging_config.py
import logging
from logging.handlers import RotatingFileHandler
import os

def setup_logging(app):
    if not app.debug:
        # Create logs directory
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        # Application logs
        file_handler = RotatingFileHandler(
            'logs/fire_ems_tools.log', 
            maxBytes=10240000, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        # Security logs
        security_handler = RotatingFileHandler(
            'logs/security.log',
            maxBytes=10240000,
            backupCount=10
        )
        security_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s'
        ))
        
        # Create security logger
        security_logger = logging.getLogger('security')
        security_logger.addHandler(security_handler)
        security_logger.setLevel(logging.INFO)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('Fire EMS Tools startup')

# Usage in security events
def log_security_event(event_type, user_id, details):
    security_logger = logging.getLogger('security')
    security_logger.info(f"{event_type}: user_id={user_id}, details={details}")
```

### **Automated Maintenance**

#### **Cleanup Script**
```bash
#!/bin/bash
# maintenance.sh - Daily maintenance tasks

LOG_DIR="/path/to/fire-ems-tools/logs"
TEMP_DIR="/path/to/fire-ems-tools/temp"
DB_PATH="/path/to/fire-ems-tools/instance/fire_ems.db"

echo "Starting daily maintenance - $(date)"

# Clean old log files
find $LOG_DIR -name "*.log.*" -mtime +30 -delete
echo "Cleaned old log files"

# Clean temporary files
find $TEMP_DIR -type f -mtime +1 -delete
echo "Cleaned temporary files"

# Vacuum SQLite database
sqlite3 $DB_PATH "VACUUM;"
echo "Vacuumed database"

# Clean old sessions
python3 -c "
from database import db
from datetime import datetime, timedelta
# Clean sessions older than 24 hours
cutoff = datetime.utcnow() - timedelta(hours=24)
# Add session cleanup logic here
print('Cleaned old sessions')
"

echo "Daily maintenance completed - $(date)"
```

---

## 💾 **Backup and Recovery**

### **Backup Strategies**

#### **SQLite Backup Script**
```bash
#!/bin/bash
# backup_sqlite.sh

SOURCE_DB="/path/to/fire-ems-tools/instance/fire_ems.db"
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR/daily $BACKUP_DIR/weekly $BACKUP_DIR/monthly

# Daily backup
sqlite3 $SOURCE_DB ".backup $BACKUP_DIR/daily/fire_ems_$DATE.db"
gzip "$BACKUP_DIR/daily/fire_ems_$DATE.db"

# Weekly backup (Sundays)
if [ $(date +%u) -eq 7 ]; then
    cp "$BACKUP_DIR/daily/fire_ems_$DATE.db.gz" "$BACKUP_DIR/weekly/"
fi

# Monthly backup (1st of month)
if [ $(date +%d) -eq 01 ]; then
    cp "$BACKUP_DIR/daily/fire_ems_$DATE.db.gz" "$BACKUP_DIR/monthly/"
fi

# Cleanup old backups
find $BACKUP_DIR/daily -name "*.db.gz" -mtime +7 -delete
find $BACKUP_DIR/weekly -name "*.db.gz" -mtime +30 -delete
find $BACKUP_DIR/monthly -name "*.db.gz" -mtime +365 -delete

echo "Backup completed: fire_ems_$DATE.db.gz"
```

#### **PostgreSQL Backup**
```bash
#!/bin/bash
# backup_postgresql.sh

DB_NAME="fire_ems_tools"
DB_USER="fire_ems_user"
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup with pg_dump
pg_dump -U $DB_USER -h localhost -f "$BACKUP_DIR/fire_ems_$DATE.sql" $DB_NAME

# Compress backup
gzip "$BACKUP_DIR/fire_ems_$DATE.sql"

echo "PostgreSQL backup completed: fire_ems_$DATE.sql.gz"
```

### **Recovery Procedures**

#### **SQLite Recovery**
```bash
#!/bin/bash
# restore_sqlite.sh

BACKUP_FILE="$1"
DB_PATH="/path/to/fire-ems-tools/instance/fire_ems.db"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.db.gz>"
    exit 1
fi

# Stop application
sudo systemctl stop fire-ems-tools

# Backup current database
cp $DB_PATH "${DB_PATH}.backup.$(date +%Y%m%d_%H%M%S)"

# Restore from backup
gunzip -c $BACKUP_FILE > $DB_PATH

# Start application
sudo systemctl start fire-ems-tools

echo "Database restored from $BACKUP_FILE"
```

#### **Disaster Recovery Checklist**
```markdown
## Disaster Recovery Steps

### 1. Assess Situation
- [ ] Identify type of failure (hardware, software, data corruption)
- [ ] Determine scope of impact (single user, department, system-wide)
- [ ] Estimate data loss window

### 2. System Recovery
- [ ] Stop application services
- [ ] Restore from most recent clean backup
- [ ] Verify database integrity
- [ ] Test critical functionality

### 3. Data Recovery
- [ ] Identify any lost data since last backup
- [ ] Attempt recovery from transaction logs (PostgreSQL)
- [ ] Contact departments for recent data re-import if needed

### 4. Validation and Restart
- [ ] Run database consistency checks
- [ ] Test user authentication
- [ ] Verify data integrity with sample queries
- [ ] Restart application services
- [ ] Monitor for issues

### 5. Post-Recovery
- [ ] Document incident and recovery process
- [ ] Update backup procedures if needed
- [ ] Communicate status to users
- [ ] Schedule additional monitoring
```

---

## ⚡ **Performance Optimization**

### **Database Optimization**

#### **SQLite Performance Tuning**
```python
# sqlite_optimization.py
from database import db

def optimize_sqlite():
    """Apply SQLite performance optimizations"""
    
    # Performance settings
    db.session.execute('PRAGMA journal_mode=WAL')  # Better concurrency
    db.session.execute('PRAGMA synchronous=NORMAL')  # Balance safety/speed
    db.session.execute('PRAGMA cache_size=10000')  # Larger cache
    db.session.execute('PRAGMA temp_store=MEMORY')  # Memory temp storage
    
    # Create indexes for common queries
    db.session.execute('''
        CREATE INDEX IF NOT EXISTS idx_incidents_department_date 
        ON incidents(department_id, incident_date)
    ''')
    
    db.session.execute('''
        CREATE INDEX IF NOT EXISTS idx_users_department_active 
        ON users(department_id, is_active)
    ''')
    
    db.session.commit()
    print("SQLite optimization completed")
```

#### **Query Optimization**
```python
# query_optimization.py
from sqlalchemy import and_, or_
from database import Incident, Department

def get_recent_incidents_optimized(department_id, days=30):
    """Optimized query for recent incidents"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    return Incident.query.filter(
        and_(
            Incident.department_id == department_id,
            Incident.incident_date >= cutoff_date
        )
    ).order_by(Incident.incident_date.desc()).limit(1000).all()

def get_department_stats_batch(department_ids):
    """Get stats for multiple departments in single query"""
    from sqlalchemy import func
    
    stats = db.session.query(
        Incident.department_id,
        func.count(Incident.id).label('incident_count'),
        func.avg(Incident.total_response_time).label('avg_response_time')
    ).filter(
        Incident.department_id.in_(department_ids)
    ).group_by(Incident.department_id).all()
    
    return {stat.department_id: {
        'incident_count': stat.incident_count,
        'avg_response_time': stat.avg_response_time
    } for stat in stats}
```

### **Application Performance**

#### **Caching Implementation**
```python
# caching.py
from flask_caching import Cache
from functools import wraps

cache = Cache(app, config={
    'CACHE_TYPE': 'simple',
    'CACHE_DEFAULT_TIMEOUT': 300
})

def cache_key_generator(*args, **kwargs):
    """Generate cache key including user context"""
    user_context = f"user_{current_user.id}_dept_{current_user.department_id}"
    return f"{user_context}_{hash(str(args) + str(kwargs))}"

@cache.memoize(timeout=300, make_name=cache_key_generator)
def get_department_stats(department_id):
    """Cached department statistics"""
    # Expensive calculation here
    return calculate_department_stats(department_id)

# Cache invalidation
def invalidate_department_cache(department_id):
    cache.delete_memoized(get_department_stats, department_id)
```

#### **Async Processing**
```python
# async_processing.py
from celery import Celery
import os

# Configure Celery for background tasks
celery = Celery('fire_ems_tools')
celery.conf.broker_url = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379')
celery.conf.result_backend = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379')

@celery.task
def process_large_dataset(file_path, user_id):
    """Process large datasets in background"""
    try:
        # Process file
        result = process_incident_data(file_path)
        
        # Notify user of completion
        send_notification(user_id, "Data processing completed", result)
        
        return result
    except Exception as e:
        send_notification(user_id, "Data processing failed", str(e))
        raise

# Usage in Flask route
@app.route('/api/data/upload', methods=['POST'])
def upload_large_dataset():
    file = request.files['file']
    file_path = save_uploaded_file(file)
    
    # Queue background task
    task = process_large_dataset.delay(file_path, current_user.id)
    
    return jsonify({
        'status': 'processing',
        'task_id': task.id
    })
```

---

## 🚨 **Troubleshooting**

### **Common Issues and Solutions**

#### **Database Issues**

**"Database is locked" (SQLite)**
```bash
# Check for processes using database
lsof /path/to/fire_ems.db

# If found, kill processes or restart application
sudo systemctl restart fire-ems-tools

# If corruption suspected, check integrity
sqlite3 fire_ems.db "PRAGMA integrity_check;"
```

**"Connection pool exhausted" (PostgreSQL)**
```python
# Update connection pool settings
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_size': 20,
    'max_overflow': 30,
    'pool_pre_ping': True,
    'pool_recycle': 300
}
```

#### **Performance Issues**

**"Slow response times"**
```bash
# Check system resources
htop
df -h
iostat 1 5

# Check application logs for slow queries
grep "Slow request" logs/fire_ems_tools.log

# Analyze database performance
sqlite3 fire_ems.db ".timer on" "EXPLAIN QUERY PLAN SELECT..."
```

**"High memory usage"**
```python
# Add memory monitoring
import psutil
import gc

def check_memory_usage():
    process = psutil.Process()
    memory_info = process.memory_info()
    print(f"Memory usage: {memory_info.rss / 1024 / 1024:.2f} MB")
    
    # Force garbage collection if memory high
    if memory_info.rss > 1024 * 1024 * 1024:  # 1GB
        gc.collect()
```

#### **Authentication Issues**

**"Users can't login"**
```python
# Check user account status
from database import User
user = User.query.filter_by(email='user@example.com').first()
print(f"User active: {user.is_active}")
print(f"User role: {user.role}")

# Reset password
from werkzeug.security import generate_password_hash
user.password_hash = generate_password_hash('new_password')
db.session.commit()
```

**"Session issues"**
```bash
# Clear session data
rm -rf instance/flask_session_*

# Check session configuration
grep -i session config.py

# Restart application
sudo systemctl restart fire-ems-tools
```

### **Diagnostic Tools**

#### **System Health Check Script**
```python
#!/usr/bin/env python3
# system_check.py

import sqlite3
import requests
import psutil
import os
from datetime import datetime

def check_database():
    """Check database connectivity and integrity"""
    try:
        conn = sqlite3.connect('instance/fire_ems.db')
        cursor = conn.cursor()
        
        # Basic connectivity
        cursor.execute('SELECT COUNT(*) FROM users')
        user_count = cursor.fetchone()[0]
        
        # Integrity check
        cursor.execute('PRAGMA integrity_check')
        integrity = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'status': 'OK' if integrity == 'ok' else 'ERROR',
            'user_count': user_count,
            'integrity': integrity
        }
    except Exception as e:
        return {
            'status': 'ERROR',
            'error': str(e)
        }

def check_web_server():
    """Check web server responsiveness"""
    try:
        response = requests.get('http://localhost:5006/health', timeout=10)
        return {
            'status': 'OK' if response.status_code == 200 else 'ERROR',
            'status_code': response.status_code,
            'response_time': response.elapsed.total_seconds()
        }
    except Exception as e:
        return {
            'status': 'ERROR',
            'error': str(e)
        }

def check_system_resources():
    """Check system resource usage"""
    return {
        'cpu_percent': psutil.cpu_percent(interval=1),
        'memory_percent': psutil.virtual_memory().percent,
        'disk_percent': psutil.disk_usage('/').percent,
        'load_average': psutil.getloadavg() if hasattr(psutil, 'getloadavg') else None
    }

def main():
    print(f"Fire EMS Tools System Check - {datetime.now()}")
    print("=" * 50)
    
    # Database check
    db_status = check_database()
    print(f"Database: {db_status['status']}")
    if db_status['status'] == 'OK':
        print(f"  Users: {db_status['user_count']}")
    else:
        print(f"  Error: {db_status.get('error', 'Unknown')}")
    
    # Web server check
    web_status = check_web_server()
    print(f"Web Server: {web_status['status']}")
    if web_status['status'] == 'OK':
        print(f"  Response Time: {web_status['response_time']:.2f}s")
    else:
        print(f"  Error: {web_status.get('error', 'Unknown')}")
    
    # System resources
    resources = check_system_resources()
    print(f"System Resources:")
    print(f"  CPU: {resources['cpu_percent']:.1f}%")
    print(f"  Memory: {resources['memory_percent']:.1f}%")
    print(f"  Disk: {resources['disk_percent']:.1f}%")
    
    print("=" * 50)
    print("Check completed")

if __name__ == "__main__":
    main()
```

---

## 🔄 **Updates and Upgrades**

### **Update Process**

#### **Standard Update Procedure**
```bash
#!/bin/bash
# update_system.sh

# Backup before update
./backup_database.sh

# Stop application
sudo systemctl stop fire-ems-tools

# Update code
git fetch origin
git checkout main
git pull origin main

# Update Python dependencies
pip3 install -r requirements.txt --upgrade

# Update React application
cd react-app
npm install
npm run build
cd ..

# Run database migrations
python3 migrate_database.py

# Restart application
sudo systemctl start fire-ems-tools

# Verify update
curl -I http://localhost:5006/health

echo "Update completed successfully"
```

#### **Zero-Downtime Deployment**
```bash
#!/bin/bash
# zero_downtime_deploy.sh

# Build new version in separate directory
git clone https://github.com/AZJJH2025/fire-ems-tools.git fire-ems-tools-new
cd fire-ems-tools-new

# Build application
pip3 install -r requirements.txt
cd react-app && npm install && npm run build && cd ..

# Run migrations on live database
python3 migrate_database.py

# Switch to new version
sudo systemctl stop fire-ems-tools
mv /path/to/fire-ems-tools /path/to/fire-ems-tools-old
mv fire-ems-tools-new /path/to/fire-ems-tools
sudo systemctl start fire-ems-tools

# Verify deployment
sleep 10
if curl -f http://localhost:5006/health; then
    echo "Deployment successful"
    rm -rf /path/to/fire-ems-tools-old
else
    echo "Deployment failed, rolling back"
    sudo systemctl stop fire-ems-tools
    mv /path/to/fire-ems-tools /path/to/fire-ems-tools-failed
    mv /path/to/fire-ems-tools-old /path/to/fire-ems-tools
    sudo systemctl start fire-ems-tools
fi
```

### **Version Management**

#### **Track Installed Version**
```python
# version_info.py
VERSION = "1.0.0"
BUILD_DATE = "2025-06-22"
GIT_COMMIT = "678a6db2"

def get_version_info():
    return {
        'version': VERSION,
        'build_date': BUILD_DATE,
        'git_commit': GIT_COMMIT
    }

# Add to health check endpoint
@app.route('/version')
def version_info():
    return jsonify(get_version_info())
```

#### **Migration Management**
```python
# migration_manager.py
import os
import sqlite3
from datetime import datetime

class MigrationManager:
    def __init__(self, db_path):
        self.db_path = db_path
        self.ensure_migration_table()
    
    def ensure_migration_table(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute('''
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY,
                migration_name TEXT UNIQUE,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
    
    def is_applied(self, migration_name):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            'SELECT COUNT(*) FROM migrations WHERE migration_name = ?',
            (migration_name,)
        )
        count = cursor.fetchone()[0]
        conn.close()
        return count > 0
    
    def apply_migration(self, migration_name, migration_sql):
        if self.is_applied(migration_name):
            print(f"Migration {migration_name} already applied")
            return
        
        conn = sqlite3.connect(self.db_path)
        try:
            conn.executescript(migration_sql)
            conn.execute(
                'INSERT INTO migrations (migration_name) VALUES (?)',
                (migration_name,)
            )
            conn.commit()
            print(f"Applied migration: {migration_name}")
        except Exception as e:
            conn.rollback()
            print(f"Failed to apply migration {migration_name}: {e}")
            raise
        finally:
            conn.close()

# Usage
manager = MigrationManager('instance/fire_ems.db')
manager.apply_migration('add_approval_tables', '''
    CREATE TABLE IF NOT EXISTS department_requests (
        id INTEGER PRIMARY KEY,
        department_name VARCHAR(100) NOT NULL,
        -- ... rest of schema
    );
''')
```

---

**Last Updated**: June 2025  
**Version**: 1.0.0  
**Maintained By**: Fire EMS Tools Development Team

*This guide provides comprehensive system administration procedures for Fire EMS Tools. For specific technical issues not covered here, consult the troubleshooting section or contact technical support.*