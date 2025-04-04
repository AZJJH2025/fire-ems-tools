"""
Migration script to add webhook fields to Department model.

To run this migration:
1. Import this file in a Python shell
2. Call run_migration() with your SQLAlchemy db instance

Example:
    from migrations.webhook_migration import run_migration
    run_migration(db)
"""

from sqlalchemy import Column, Boolean, String, Text, DateTime, JSON
import json
import secrets

def run_migration(db):
    """
    Add webhook fields to Department table.
    
    Args:
        db: SQLAlchemy db instance
    """
    # Get the department table
    department_table = db.metadata.tables.get('departments')
    
    # If the table doesn't exist, it's a new installation
    if not department_table:
        print("No existing departments table found. No migration needed.")
        return
        
    # Check if webhooks_enabled column already exists
    if 'webhooks_enabled' in department_table.columns:
        print("Webhook columns already exist. No migration needed.")
        return
    
    # Add the new columns
    with db.engine.begin() as conn:
        # Add webhooks_enabled column
        conn.execute(
            db.text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS webhooks_enabled BOOLEAN DEFAULT FALSE")
        )
        
        # Add webhook_url column
        conn.execute(
            db.text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS webhook_url VARCHAR(255)")
        )
        
        # Add webhook_secret column
        conn.execute(
            db.text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS webhook_secret VARCHAR(64)")
        )
        
        # Add webhook_events column as JSON
        # SQLite doesn't have a native JSON type, so we'll use TEXT
        db_type = db.engine.dialect.name
        if db_type == 'sqlite':
            conn.execute(
                db.text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS webhook_events TEXT")
            )
            
            # Set default value for webhook_events in SQLite
            conn.execute(
                db.text("""
                UPDATE departments 
                SET webhook_events = '{"incident.created": true, "incident.updated": true, 
                                      "station.created": false, "user.created": false}'
                WHERE webhook_events IS NULL
                """)
            )
        else:
            # PostgreSQL or other databases with native JSON support
            conn.execute(
                db.text("""
                ALTER TABLE departments ADD COLUMN IF NOT EXISTS webhook_events JSONB 
                DEFAULT '{"incident.created": true, "incident.updated": true, 
                         "station.created": false, "user.created": false}'
                """)
            )
        
        # Add webhook_last_error column
        conn.execute(
            db.text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS webhook_last_error TEXT")
        )
        
        # Add webhook_last_success column
        conn.execute(
            db.text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS webhook_last_success TIMESTAMP")
        )
        
    print("Migration successful! Webhook columns added to departments table.")
    
    # Initialize webhook secrets for departments with API keys
    from database import Department
    departments_with_api = Department.query.filter_by(api_enabled=True).all()
    
    for dept in departments_with_api:
        if not dept.webhook_secret:
            dept.webhook_secret = secrets.token_hex(32)
            
    if departments_with_api:
        db.session.commit()
        print(f"Generated webhook secrets for {len(departments_with_api)} departments with API enabled.")
        
    return True