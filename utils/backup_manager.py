"""
Backup and Rollback Manager for Fire EMS Tools

This module provides comprehensive backup and rollback procedures for the Fire EMS Tools
application, ensuring data safety and system reliability.

This is a zero-risk additive improvement that provides backup capabilities
without modifying core application functionality.
"""

import os
import json
import shutil
import sqlite3
import logging
import subprocess
import zipfile
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import hashlib

logger = logging.getLogger(__name__)

class BackupManager:
    """
    Comprehensive backup manager for Fire EMS Tools application.
    
    Handles database backups, file system backups, and configuration backups
    with automatic retention policies and integrity verification.
    """
    
    def __init__(self, backup_root: str = None):
        """
        Initialize the backup manager.
        
        Args:
            backup_root: Root directory for storing backups
        """
        self.backup_root = Path(backup_root or os.path.join(os.getcwd(), 'backups'))
        self.backup_root.mkdir(exist_ok=True)
        
        # Backup directories
        self.db_backup_dir = self.backup_root / 'database'
        self.files_backup_dir = self.backup_root / 'files'
        self.config_backup_dir = self.backup_root / 'configuration'
        self.full_backup_dir = self.backup_root / 'full_system'
        
        # Create backup directories
        for directory in [self.db_backup_dir, self.files_backup_dir, 
                         self.config_backup_dir, self.full_backup_dir]:
            directory.mkdir(exist_ok=True)
        
        # Retention policies (days)
        self.retention_policies = {
            'daily': 7,      # Keep daily backups for 7 days
            'weekly': 30,    # Keep weekly backups for 30 days
            'monthly': 365,  # Keep monthly backups for 1 year
            'critical': -1   # Keep critical backups indefinitely
        }
    
    def create_database_backup(self, db_path: str = None, backup_type: str = 'daily') -> Dict:
        """
        Create a backup of the database.
        
        Args:
            db_path: Path to database file (auto-detected if None)
            backup_type: Type of backup (daily, weekly, monthly, critical)
            
        Returns:
            dict: Backup information including path and metadata
        """
        try:
            # Auto-detect database path if not provided
            if not db_path:
                db_path = self._find_database_path()
            
            if not db_path or not os.path.exists(db_path):
                raise FileNotFoundError(f"Database not found at {db_path}")
            
            # Generate backup filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_filename = f"fireems_db_{backup_type}_{timestamp}.sqlite"
            backup_path = self.db_backup_dir / backup_filename
            
            # Create backup
            logger.info(f"Creating database backup: {backup_path}")
            
            if db_path.endswith('.sqlite') or db_path.endswith('.db'):
                # SQLite backup using built-in backup API
                self._backup_sqlite_database(db_path, str(backup_path))
            else:
                # For other databases, use file copy as fallback
                shutil.copy2(db_path, backup_path)
            
            # Verify backup integrity
            backup_valid = self._verify_database_backup(str(backup_path))
            
            if not backup_valid:
                raise Exception("Backup verification failed")
            
            # Generate backup metadata
            backup_info = {
                'timestamp': timestamp,
                'type': backup_type,
                'source_path': db_path,
                'backup_path': str(backup_path),
                'size_bytes': backup_path.stat().st_size,
                'checksum': self._calculate_file_checksum(str(backup_path)),
                'verified': backup_valid,
                'created_at': datetime.now().isoformat()
            }
            
            # Save backup metadata
            metadata_file = backup_path.with_suffix('.json')
            with open(metadata_file, 'w') as f:
                json.dump(backup_info, f, indent=2)
            
            logger.info(f"Database backup created successfully: {backup_path}")
            return backup_info
            
        except Exception as e:
            logger.error(f"Failed to create database backup: {e}")
            raise
    
    def create_files_backup(self, paths: List[str] = None, backup_type: str = 'daily') -> Dict:
        """
        Create a backup of critical application files.
        
        Args:
            paths: List of paths to backup (auto-detected if None)
            backup_type: Type of backup (daily, weekly, monthly, critical)
            
        Returns:
            dict: Backup information including path and metadata
        """
        try:
            # Auto-detect critical paths if not provided
            if not paths:
                paths = self._get_critical_file_paths()
            
            # Generate backup filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_filename = f"fireems_files_{backup_type}_{timestamp}.zip"
            backup_path = self.files_backup_dir / backup_filename
            
            logger.info(f"Creating files backup: {backup_path}")
            
            # Create ZIP backup
            with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for path in paths:
                    if os.path.exists(path):
                        if os.path.isfile(path):
                            # Add single file
                            arcname = os.path.relpath(path, os.getcwd())
                            zipf.write(path, arcname)
                        elif os.path.isdir(path):
                            # Add directory recursively
                            for root, dirs, files in os.walk(path):
                                for file in files:
                                    file_path = os.path.join(root, file)
                                    arcname = os.path.relpath(file_path, os.getcwd())
                                    zipf.write(file_path, arcname)
                    else:
                        logger.warning(f"Path not found for backup: {path}")
            
            # Generate backup metadata
            backup_info = {
                'timestamp': timestamp,
                'type': backup_type,
                'paths': paths,
                'backup_path': str(backup_path),
                'size_bytes': backup_path.stat().st_size,
                'checksum': self._calculate_file_checksum(str(backup_path)),
                'file_count': self._count_files_in_zip(str(backup_path)),
                'created_at': datetime.now().isoformat()
            }
            
            # Save backup metadata
            metadata_file = backup_path.with_suffix('.json')
            with open(metadata_file, 'w') as f:
                json.dump(backup_info, f, indent=2)
            
            logger.info(f"Files backup created successfully: {backup_path}")
            return backup_info
            
        except Exception as e:
            logger.error(f"Failed to create files backup: {e}")
            raise
    
    def create_configuration_backup(self, backup_type: str = 'daily') -> Dict:
        """
        Create a backup of application configuration.
        
        Args:
            backup_type: Type of backup (daily, weekly, monthly, critical)
            
        Returns:
            dict: Backup information including path and metadata
        """
        try:
            # Generate backup filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_filename = f"fireems_config_{backup_type}_{timestamp}.json"
            backup_path = self.config_backup_dir / backup_filename
            
            logger.info(f"Creating configuration backup: {backup_path}")
            
            # Collect configuration data
            config_data = {
                'environment_variables': self._get_safe_environment_variables(),
                'application_config': self._get_application_config(),
                'system_info': self._get_system_info(),
                'backup_timestamp': datetime.now().isoformat(),
                'backup_type': backup_type
            }
            
            # Save configuration backup
            with open(backup_path, 'w') as f:
                json.dump(config_data, f, indent=2)
            
            # Generate backup metadata
            backup_info = {
                'timestamp': timestamp,
                'type': backup_type,
                'backup_path': str(backup_path),
                'size_bytes': backup_path.stat().st_size,
                'checksum': self._calculate_file_checksum(str(backup_path)),
                'created_at': datetime.now().isoformat()
            }
            
            # Save backup metadata
            metadata_file = backup_path.with_suffix('.metadata.json')
            with open(metadata_file, 'w') as f:
                json.dump(backup_info, f, indent=2)
            
            logger.info(f"Configuration backup created successfully: {backup_path}")
            return backup_info
            
        except Exception as e:
            logger.error(f"Failed to create configuration backup: {e}")
            raise
    
    def create_full_system_backup(self, backup_type: str = 'weekly') -> Dict:
        """
        Create a comprehensive backup of the entire system.
        
        Args:
            backup_type: Type of backup (weekly, monthly, critical)
            
        Returns:
            dict: Backup information including path and metadata
        """
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            logger.info(f"Starting full system backup: {timestamp}")
            
            # Create individual backups
            db_backup = self.create_database_backup(backup_type=f"{backup_type}_full")
            files_backup = self.create_files_backup(backup_type=f"{backup_type}_full")
            config_backup = self.create_configuration_backup(backup_type=f"{backup_type}_full")
            
            # Create combined backup archive
            backup_filename = f"fireems_full_{backup_type}_{timestamp}.zip"
            backup_path = self.full_backup_dir / backup_filename
            
            with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Add database backup
                zipf.write(db_backup['backup_path'], f"database/{os.path.basename(db_backup['backup_path'])}")
                
                # Add files backup
                zipf.write(files_backup['backup_path'], f"files/{os.path.basename(files_backup['backup_path'])}")
                
                # Add configuration backup
                zipf.write(config_backup['backup_path'], f"configuration/{os.path.basename(config_backup['backup_path'])}")
            
            # Generate full backup metadata
            full_backup_info = {
                'timestamp': timestamp,
                'type': backup_type,
                'backup_path': str(backup_path),
                'size_bytes': backup_path.stat().st_size,
                'checksum': self._calculate_file_checksum(str(backup_path)),
                'components': {
                    'database': db_backup,
                    'files': files_backup,
                    'configuration': config_backup
                },
                'created_at': datetime.now().isoformat()
            }
            
            # Save full backup metadata
            metadata_file = backup_path.with_suffix('.json')
            with open(metadata_file, 'w') as f:
                json.dump(full_backup_info, f, indent=2)
            
            logger.info(f"Full system backup created successfully: {backup_path}")
            return full_backup_info
            
        except Exception as e:
            logger.error(f"Failed to create full system backup: {e}")
            raise
    
    def list_backups(self, backup_type: str = None) -> List[Dict]:
        """
        List available backups with metadata.
        
        Args:
            backup_type: Filter by backup type (None for all)
            
        Returns:
            list: List of backup information dictionaries
        """
        backups = []
        
        # Scan all backup directories
        for backup_dir in [self.db_backup_dir, self.files_backup_dir, 
                          self.config_backup_dir, self.full_backup_dir]:
            
            for metadata_file in backup_dir.glob('*.json'):
                if metadata_file.name.endswith('.metadata.json'):
                    continue  # Skip metadata files for metadata files
                
                try:
                    with open(metadata_file, 'r') as f:
                        backup_info = json.load(f)
                    
                    # Add directory info
                    backup_info['category'] = backup_dir.name
                    
                    # Filter by type if specified
                    if backup_type is None or backup_info.get('type') == backup_type:
                        backups.append(backup_info)
                        
                except Exception as e:
                    logger.warning(f"Could not read backup metadata {metadata_file}: {e}")
        
        # Sort by timestamp (newest first)
        backups.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return backups
    
    def cleanup_old_backups(self) -> Dict:
        """
        Clean up old backups according to retention policies.
        
        Returns:
            dict: Cleanup summary including files removed
        """
        cleanup_summary = {
            'files_removed': 0,
            'bytes_freed': 0,
            'errors': []
        }
        
        try:
            current_time = datetime.now()
            backups = self.list_backups()
            
            for backup in backups:
                try:
                    backup_time = datetime.fromisoformat(backup['created_at'])
                    backup_type = backup.get('type', 'daily')
                    
                    # Extract base type (remove _full suffix)
                    base_type = backup_type.replace('_full', '')
                    
                    # Get retention period
                    retention_days = self.retention_policies.get(base_type, 
                                                               self.retention_policies['daily'])
                    
                    # Skip if retention is unlimited
                    if retention_days < 0:
                        continue
                    
                    # Check if backup is older than retention period
                    age = (current_time - backup_time).days
                    
                    if age > retention_days:
                        # Remove backup and metadata
                        backup_path = Path(backup['backup_path'])
                        metadata_path = backup_path.with_suffix('.json')
                        
                        if backup_path.exists():
                            size = backup_path.stat().st_size
                            backup_path.unlink()
                            cleanup_summary['files_removed'] += 1
                            cleanup_summary['bytes_freed'] += size
                            
                            logger.info(f"Removed old backup: {backup_path}")
                        
                        if metadata_path.exists():
                            metadata_path.unlink()
                            
                except Exception as e:
                    error_msg = f"Error cleaning up backup {backup.get('backup_path', 'unknown')}: {e}"
                    cleanup_summary['errors'].append(error_msg)
                    logger.error(error_msg)
            
            logger.info(f"Backup cleanup completed: {cleanup_summary['files_removed']} files removed, "
                       f"{cleanup_summary['bytes_freed']} bytes freed")
            
        except Exception as e:
            error_msg = f"Backup cleanup failed: {e}"
            cleanup_summary['errors'].append(error_msg)
            logger.error(error_msg)
        
        return cleanup_summary
    
    def _find_database_path(self) -> Optional[str]:
        """Find the database file automatically."""
        possible_paths = [
            'fireems.db',
            'database.db',
            'app.db',
            'fire-ems-tools.db',
            os.path.join('instance', 'fireems.db'),
            os.path.join('instance', 'database.db')
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                return path
        
        return None
    
    def _backup_sqlite_database(self, source_path: str, backup_path: str):
        """Create SQLite backup using the backup API."""
        source_conn = sqlite3.connect(source_path)
        backup_conn = sqlite3.connect(backup_path)
        
        try:
            source_conn.backup(backup_conn)
        finally:
            source_conn.close()
            backup_conn.close()
    
    def _verify_database_backup(self, backup_path: str) -> bool:
        """Verify that a database backup is valid."""
        try:
            conn = sqlite3.connect(backup_path)
            cursor = conn.cursor()
            
            # Try to execute a simple query
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            
            conn.close()
            
            # Consider backup valid if it has at least one table
            return len(tables) > 0
            
        except Exception as e:
            logger.error(f"Database backup verification failed: {e}")
            return False
    
    def _calculate_file_checksum(self, file_path: str) -> str:
        """Calculate SHA256 checksum of a file."""
        hash_sha256 = hashlib.sha256()
        
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        
        return hash_sha256.hexdigest()
    
    def _count_files_in_zip(self, zip_path: str) -> int:
        """Count the number of files in a ZIP archive."""
        try:
            with zipfile.ZipFile(zip_path, 'r') as zipf:
                return len(zipf.namelist())
        except Exception:
            return 0
    
    def _get_critical_file_paths(self) -> List[str]:
        """Get list of critical application files to backup."""
        critical_paths = [
            'app.py',
            'config.py',
            'requirements.txt',
            '.env',
            'routes/',
            'utils/',
            'templates/',
            'static/',
            'migrations/',
            'docs/',
            'tests/'
        ]
        
        # Filter to only include existing paths
        existing_paths = [path for path in critical_paths if os.path.exists(path)]
        
        return existing_paths
    
    def _get_safe_environment_variables(self) -> Dict:
        """Get environment variables, excluding sensitive ones."""
        sensitive_vars = {
            'SECRET_KEY', 'DATABASE_PASSWORD', 'DATABASE_URL', 'API_KEY',
            'SMTP_PASSWORD', 'REDIS_PASSWORD', 'JWT_SECRET'
        }
        
        safe_env = {}
        
        for key, value in os.environ.items():
            # Include non-sensitive variables
            if not any(sensitive in key.upper() for sensitive in sensitive_vars):
                safe_env[key] = value
            else:
                safe_env[key] = '***REDACTED***'
        
        return safe_env
    
    def _get_application_config(self) -> Dict:
        """Get application configuration information."""
        return {
            'python_version': f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
            'working_directory': os.getcwd(),
            'backup_root': str(self.backup_root),
            'retention_policies': self.retention_policies
        }
    
    def _get_system_info(self) -> Dict:
        """Get system information for backup context."""
        import platform
        
        return {
            'platform': platform.platform(),
            'system': platform.system(),
            'release': platform.release(),
            'machine': platform.machine(),
            'hostname': platform.node()
        }


# Convenience functions for easy use
def create_quick_backup(backup_type: str = 'manual') -> Dict:
    """
    Create a quick full system backup.
    
    Args:
        backup_type: Type of backup to create
        
    Returns:
        dict: Backup information
    """
    backup_manager = BackupManager()
    return backup_manager.create_full_system_backup(backup_type)


def list_all_backups() -> List[Dict]:
    """
    List all available backups.
    
    Returns:
        list: List of backup information dictionaries
    """
    backup_manager = BackupManager()
    return backup_manager.list_backups()


def cleanup_backups() -> Dict:
    """
    Clean up old backups according to retention policies.
    
    Returns:
        dict: Cleanup summary
    """
    backup_manager = BackupManager()
    return backup_manager.cleanup_old_backups()


if __name__ == "__main__":
    # Demo/test the backup system
    print("Fire EMS Tools - Backup Manager Demo")
    print("=" * 50)
    
    backup_manager = BackupManager()
    
    # Create a test backup
    try:
        print("Creating test configuration backup...")
        config_backup = backup_manager.create_configuration_backup('test')
        print(f"✅ Configuration backup created: {config_backup['backup_path']}")
        
        print("\nListing all backups...")
        backups = backup_manager.list_backups()
        for backup in backups[:3]:  # Show first 3
            print(f"  {backup['created_at']}: {backup['type']} ({backup['category']})")
        
        print(f"\nTotal backups found: {len(backups)}")
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")