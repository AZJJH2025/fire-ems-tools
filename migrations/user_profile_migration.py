"""
Migration script to add user profile fields to User model.

This migration adds the extended profile fields that were added to the User model
but are missing from the database schema.

To run this migration:
1. Import this file in a Python shell
2. Call run_migration() with your SQLAlchemy db instance

Example:
    from migrations.user_profile_migration import run_migration
    run_migration(db)
"""

def run_migration(db):
    """
    Add user profile fields to User model.
    
    Args:
        db: SQLAlchemy db instance
    """
    # Check if we're using SQLite (development) or PostgreSQL (production)
    is_sqlite = db.engine.dialect.name == 'sqlite'
    
    print(f"Running user profile migration on {db.engine.dialect.name}...")
    
    # List of new profile columns to add
    profile_columns = [
        ('phone', 'VARCHAR(20)', 'VARCHAR(20)'),
        ('title', 'VARCHAR(100)', 'VARCHAR(100)'),
        ('employee_id', 'VARCHAR(50)', 'VARCHAR(50)'),
        ('station_assignment', 'VARCHAR(100)', 'VARCHAR(100)'),
        ('shift', 'VARCHAR(20)', 'VARCHAR(20)'),
        ('rank', 'VARCHAR(50)', 'VARCHAR(50)'),
        ('timezone', 'VARCHAR(50)', 'VARCHAR(50) DEFAULT \'America/Phoenix\''),
        ('email_notifications', 'BOOLEAN', 'BOOLEAN DEFAULT 1'),
        ('report_notifications', 'BOOLEAN', 'BOOLEAN DEFAULT 1'),
        ('language', 'VARCHAR(10)', 'VARCHAR(10) DEFAULT \'en\''),
        ('date_format', 'VARCHAR(20)', 'VARCHAR(20) DEFAULT \'MM/DD/YYYY\''),
        ('preferences', 'TEXT', 'JSONB DEFAULT \'{}\''),
    ]
    
    # Check existing columns
    with db.engine.connect() as conn:
        if is_sqlite:
            result = conn.execute(db.text("PRAGMA table_info(users)"))
            existing_columns = [row[1] for row in result]
        else:
            result = conn.execute(db.text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users'
            """))
            existing_columns = [row[0] for row in result]
        
        print(f"Existing columns: {existing_columns}")
    
    # Add missing columns
    added_columns = []
    with db.engine.begin() as conn:
        for column_name, sqlite_type, postgres_type in profile_columns:
            if column_name not in existing_columns:
                try:
                    if is_sqlite:
                        # SQLite syntax
                        sql = f"ALTER TABLE users ADD COLUMN {column_name} {sqlite_type}"
                        if 'DEFAULT' in sqlite_type:
                            # SQLite doesn't support DEFAULT in ALTER TABLE, handle separately
                            base_type = sqlite_type.split(' DEFAULT')[0]
                            default_value = sqlite_type.split(' DEFAULT ')[1].strip("'")
                            sql = f"ALTER TABLE users ADD COLUMN {column_name} {base_type}"
                    else:
                        # PostgreSQL syntax
                        sql = f"ALTER TABLE users ADD COLUMN {column_name} {postgres_type}"
                    
                    conn.execute(db.text(sql))
                    added_columns.append(column_name)
                    print(f"✅ Added column: {column_name}")
                    
                    # Set default values for non-null columns if using SQLite
                    if is_sqlite and 'DEFAULT' in (sqlite_type if is_sqlite else postgres_type):
                        if column_name == 'timezone':
                            conn.execute(db.text("UPDATE users SET timezone = 'America/Phoenix' WHERE timezone IS NULL"))
                        elif column_name == 'email_notifications':
                            conn.execute(db.text("UPDATE users SET email_notifications = 1 WHERE email_notifications IS NULL"))
                        elif column_name == 'report_notifications':
                            conn.execute(db.text("UPDATE users SET report_notifications = 1 WHERE report_notifications IS NULL"))
                        elif column_name == 'language':
                            conn.execute(db.text("UPDATE users SET language = 'en' WHERE language IS NULL"))
                        elif column_name == 'date_format':
                            conn.execute(db.text("UPDATE users SET date_format = 'MM/DD/YYYY' WHERE date_format IS NULL"))
                        elif column_name == 'preferences':
                            conn.execute(db.text("UPDATE users SET preferences = '{}' WHERE preferences IS NULL"))
                            
                except Exception as e:
                    print(f"❌ Failed to add column {column_name}: {str(e)}")
            else:
                print(f"⏭️  Column {column_name} already exists")
    
    if added_columns:
        print(f"\n✅ Migration complete! Added {len(added_columns)} columns: {', '.join(added_columns)}")
    else:
        print(f"\n✅ Migration complete! All profile columns already exist.")
        
    return True

if __name__ == "__main__":
    # Allow running directly for testing
    from database import db
    run_migration(db)