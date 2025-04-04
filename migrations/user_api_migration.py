"""
Migration script to ensure User model has proper APIs fields.

To run this migration:
1. Import this file in a Python shell
2. Call run_migration() with your SQLAlchemy db instance

Example:
    from migrations.user_api_migration import run_migration
    run_migration(db)
"""

def run_migration(db):
    """
    Ensure User model has proper fields for API.
    
    Args:
        db: SQLAlchemy db instance
    """
    # Check if we're using SQLite (development) or PostgreSQL (production)
    is_sqlite = db.engine.dialect.name == 'sqlite'
    
    # Get database table info
    users_table = db.metadata.tables.get('users')
    
    # If the table doesn't exist, no migration needed
    if not users_table:
        print("No existing users table found. No migration needed.")
        return
        
    # Check if preferences column exists
    if 'preferences' not in users_table.columns:
        print("Adding preferences column to users table...")
        
        with db.engine.begin() as conn:
            if is_sqlite:
                # SQLite uses TEXT for JSON
                conn.execute(
                    db.text("ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT '{}'")
                )
            else:
                # PostgreSQL uses JSONB
                conn.execute(
                    db.text("ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}'")
                )
            print("Added preferences column to users table.")
    else:
        print("preferences column already exists in users table.")
    
    # Verify the to_dict method exists in User model
    from database import User
    user = db.session.query(User).first()
    
    # Add the method if it's missing
    if user and not hasattr(user, 'to_dict'):
        print("Adding to_dict method to User model...")
        def add_to_dict_method():
            def to_dict(self):
                """Convert user to dictionary for API responses"""
                return {
                    'id': self.id,
                    'department_id': self.department_id,
                    'email': self.email,
                    'name': self.name,
                    'role': self.role,
                    'is_active': self.is_active,
                    'created_at': self.created_at.isoformat() if self.created_at else None,
                    'last_login': self.last_login.isoformat() if self.last_login else None
                }
            setattr(User, 'to_dict', to_dict)
        add_to_dict_method()
        print("Added to_dict method to User model.")
    
    print("User API migration complete!")
    return True