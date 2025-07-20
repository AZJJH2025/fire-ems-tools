"""
Rollback Manager for Fire EMS Tools

This module provides comprehensive rollback procedures for the Fire EMS Tools
application, enabling safe recovery from backups and system issues.

This is a zero-risk additive improvement that provides rollback capabilities
without modifying core application functionality.
"""

import os
import json
import shutil
import sqlite3
import logging
import zipfile
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

class RollbackManager:
    """
    Comprehensive rollback manager for Fire EMS Tools application.
    
    Handles database restoration, file system rollbacks, and configuration
    restoration with validation and safety checks.
    """
    
    def __init__(self, backup_root: str = None):
        """
        Initialize the rollback manager.
        
        Args:
            backup_root: Root directory containing backups
        """
        self.backup_root = Path(backup_root or os.path.join(os.getcwd(), 'backups'))
        
        if not self.backup_root.exists():
            raise FileNotFoundError(f"Backup directory not found: {self.backup_root}")
        
        # Backup directories
        self.db_backup_dir = self.backup_root / 'database'
        self.files_backup_dir = self.backup_root / 'files'
        self.config_backup_dir = self.backup_root / 'configuration'
        self.full_backup_dir = self.backup_root / 'full_system'
        
        # Rollback staging directory
        self.staging_dir = Path(tempfile.mkdtemp(prefix='fireems_rollback_'))
        logger.info(f"Rollback staging directory: {self.staging_dir}")
    
    def list_available_backups(self, backup_category: str = None) -> List[Dict]:
        """
        List available backups for rollback.
        
        Args:
            backup_category: Filter by category (database, files, configuration, full_system)
            
        Returns:
            list: List of backup information dictionaries
        """
        backups = []
        
        # Determine which directories to scan
        if backup_category:
            backup_dirs = [self.backup_root / backup_category]
        else:
            backup_dirs = [self.db_backup_dir, self.files_backup_dir, 
                          self.config_backup_dir, self.full_backup_dir]
        
        for backup_dir in backup_dirs:
            if not backup_dir.exists():
                continue
                
            for metadata_file in backup_dir.glob('*.json'):
                if metadata_file.name.endswith('.metadata.json'):
                    continue  # Skip metadata files for metadata files
                
                try:
                    with open(metadata_file, 'r') as f:
                        backup_info = json.load(f)
                    
                    # Add directory info
                    backup_info['category'] = backup_dir.name
                    backup_info['metadata_file'] = str(metadata_file)
                    
                    # Verify backup file exists
                    backup_path = Path(backup_info['backup_path'])
                    if backup_path.exists():
                        backup_info['backup_exists'] = True
                        backup_info['current_size'] = backup_path.stat().st_size
                    else:
                        backup_info['backup_exists'] = False
                        logger.warning(f"Backup file missing: {backup_path}")
                    
                    backups.append(backup_info)
                        
                except Exception as e:
                    logger.warning(f"Could not read backup metadata {metadata_file}: {e}")
        
        # Sort by timestamp (newest first)
        backups.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return backups
    
    def validate_backup(self, backup_info: Dict) -> Dict:
        """
        Validate a backup before attempting rollback.
        
        Args:
            backup_info: Backup information dictionary
            
        Returns:
            dict: Validation results
        """
        validation = {
            'valid': True,
            'issues': [],
            'warnings': []
        }
        
        try:
            backup_path = Path(backup_info['backup_path'])
            
            # Check if backup file exists
            if not backup_path.exists():
                validation['valid'] = False
                validation['issues'].append(f"Backup file not found: {backup_path}")
                return validation
            
            # Check file size
            current_size = backup_path.stat().st_size
            expected_size = backup_info.get('size_bytes', 0)
            
            if current_size != expected_size:
                validation['valid'] = False
                validation['issues'].append(f"Size mismatch: expected {expected_size}, got {current_size}")
            
            # Verify checksum if available
            if 'checksum' in backup_info:
                current_checksum = self._calculate_file_checksum(str(backup_path))
                expected_checksum = backup_info['checksum']
                
                if current_checksum != expected_checksum:
                    validation['valid'] = False
                    validation['issues'].append(f"Checksum mismatch: backup may be corrupted")
            
            # Category-specific validation
            category = backup_info.get('category', '')
            
            if category == 'database':
                db_validation = self._validate_database_backup(str(backup_path))
                if not db_validation['valid']:
                    validation['valid'] = False
                    validation['issues'].extend(db_validation['issues'])
            
            elif category == 'files':
                files_validation = self._validate_files_backup(str(backup_path))
                if not files_validation['valid']:
                    validation['valid'] = False
                    validation['issues'].extend(files_validation['issues'])
            
            elif category == 'full_system':
                full_validation = self._validate_full_backup(str(backup_path))
                if not full_validation['valid']:
                    validation['valid'] = False
                    validation['issues'].extend(full_validation['issues'])
            
            logger.info(f"Backup validation completed: {validation}")
            
        except Exception as e:
            validation['valid'] = False
            validation['issues'].append(f"Validation error: {e}")
            logger.error(f"Backup validation failed: {e}")
        
        return validation
    
    def rollback_database(self, backup_info: Dict, target_path: str = None, 
                         create_current_backup: bool = True) -> Dict:
        """
        Rollback database from a backup.
        
        Args:
            backup_info: Database backup information
            target_path: Target database path (auto-detected if None)
            create_current_backup: Whether to backup current database first
            
        Returns:
            dict: Rollback results
        """
        rollback_result = {
            'success': False,
            'backup_created': None,
            'restored_from': backup_info['backup_path'],
            'target_path': target_path,
            'warnings': [],
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            # Validate backup first
            validation = self.validate_backup(backup_info)
            if not validation['valid']:
                raise Exception(f"Backup validation failed: {validation['issues']}")
            
            # Auto-detect target path if not provided
            if not target_path:
                target_path = self._find_current_database_path()
                if not target_path:
                    raise FileNotFoundError("Could not locate current database")
            
            rollback_result['target_path'] = target_path
            
            # Create backup of current database before rollback
            if create_current_backup and os.path.exists(target_path):
                try:
                    from utils.backup_manager import BackupManager
                    backup_manager = BackupManager()
                    current_backup = backup_manager.create_database_backup(
                        db_path=target_path, 
                        backup_type='pre_rollback'
                    )
                    rollback_result['backup_created'] = current_backup['backup_path']
                    logger.info(f"Created pre-rollback backup: {current_backup['backup_path']}")
                except Exception as e:
                    rollback_result['warnings'].append(f"Could not create pre-rollback backup: {e}")
            
            # Stage the rollback
            backup_path = Path(backup_info['backup_path'])
            staging_path = self.staging_dir / f"database_rollback_{datetime.now().strftime('%H%M%S')}.db"
            
            # Copy backup to staging area
            shutil.copy2(backup_path, staging_path)
            logger.info(f"Staged database rollback: {staging_path}")
            
            # Verify staged database
            if not self._verify_database_backup(str(staging_path)):
                raise Exception("Staged database verification failed")
            
            # Perform the rollback
            if os.path.exists(target_path):
                # Create a temporary backup of current file
                temp_current = target_path + '.rollback_temp'
                shutil.move(target_path, temp_current)
                
                try:
                    # Move staged database to target location
                    shutil.move(staging_path, target_path)
                    
                    # Remove temporary backup
                    os.remove(temp_current)
                    
                    rollback_result['success'] = True
                    logger.info(f"Database rollback completed successfully: {target_path}")
                    
                except Exception as e:
                    # Restore original database if rollback failed
                    if os.path.exists(temp_current):
                        shutil.move(temp_current, target_path)
                    raise e
            else:
                # No existing database, just move staged database
                shutil.move(staging_path, target_path)
                rollback_result['success'] = True
                logger.info(f"Database restored to: {target_path}")
            
        except Exception as e:
            rollback_result['error'] = str(e)
            logger.error(f"Database rollback failed: {e}")
        
        return rollback_result
    
    def rollback_files(self, backup_info: Dict, target_root: str = None,
                      create_current_backup: bool = True) -> Dict:
        """
        Rollback files from a backup.
        
        Args:
            backup_info: Files backup information
            target_root: Target root directory (current directory if None)
            create_current_backup: Whether to backup current files first
            
        Returns:
            dict: Rollback results
        """
        rollback_result = {
            'success': False,
            'backup_created': None,
            'restored_from': backup_info['backup_path'],
            'target_root': target_root or os.getcwd(),
            'files_restored': 0,
            'warnings': [],
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            # Validate backup first
            validation = self.validate_backup(backup_info)
            if not validation['valid']:
                raise Exception(f"Backup validation failed: {validation['issues']}")
            
            target_root = target_root or os.getcwd()
            
            # Create backup of current files before rollback
            if create_current_backup:
                try:
                    from utils.backup_manager import BackupManager
                    backup_manager = BackupManager()
                    current_backup = backup_manager.create_files_backup(backup_type='pre_rollback')
                    rollback_result['backup_created'] = current_backup['backup_path']
                    logger.info(f"Created pre-rollback backup: {current_backup['backup_path']}")
                except Exception as e:
                    rollback_result['warnings'].append(f"Could not create pre-rollback backup: {e}")
            
            # Extract backup to staging area
            backup_path = Path(backup_info['backup_path'])
            staging_extract_dir = self.staging_dir / f"files_rollback_{datetime.now().strftime('%H%M%S')}"
            staging_extract_dir.mkdir()
            
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(staging_extract_dir)
            
            logger.info(f"Extracted files backup to staging: {staging_extract_dir}")
            
            # Copy files from staging to target locations
            files_restored = 0
            
            for root, dirs, files in os.walk(staging_extract_dir):
                for file in files:
                    source_file = os.path.join(root, file)
                    
                    # Calculate relative path from staging directory
                    relative_path = os.path.relpath(source_file, staging_extract_dir)
                    target_file = os.path.join(target_root, relative_path)
                    
                    # Create target directory if it doesn't exist
                    target_dir = os.path.dirname(target_file)
                    os.makedirs(target_dir, exist_ok=True)
                    
                    # Copy file
                    shutil.copy2(source_file, target_file)
                    files_restored += 1
            
            rollback_result['files_restored'] = files_restored
            rollback_result['success'] = True
            logger.info(f"Files rollback completed: {files_restored} files restored")
            
        except Exception as e:
            rollback_result['error'] = str(e)
            logger.error(f"Files rollback failed: {e}")
        
        return rollback_result
    
    def rollback_configuration(self, backup_info: Dict) -> Dict:
        """
        Rollback configuration from a backup.
        
        Note: This is informational only - actual configuration changes
        require manual review and application.
        
        Args:
            backup_info: Configuration backup information
            
        Returns:
            dict: Configuration comparison and rollback information
        """
        rollback_result = {
            'success': False,
            'configuration_loaded': False,
            'differences': [],
            'manual_steps_required': [],
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            # Validate backup first
            validation = self.validate_backup(backup_info)
            if not validation['valid']:
                raise Exception(f"Backup validation failed: {validation['issues']}")
            
            # Load configuration backup
            backup_path = Path(backup_info['backup_path'])
            
            with open(backup_path, 'r') as f:
                backup_config = json.load(f)
            
            rollback_result['configuration_loaded'] = True
            
            # Compare with current configuration
            current_env = dict(os.environ)
            backup_env = backup_config.get('environment_variables', {})
            
            # Find differences
            differences = []
            manual_steps = []
            
            for key, backup_value in backup_env.items():
                if backup_value == '***REDACTED***':
                    manual_steps.append(f"Review and set {key} (was redacted in backup)")
                    continue
                
                current_value = current_env.get(key)
                
                if current_value != backup_value:
                    differences.append({
                        'variable': key,
                        'current': current_value,
                        'backup': backup_value,
                        'action': 'update' if current_value else 'add'
                    })
            
            # Check for variables that exist now but not in backup
            for key in current_env:
                if key not in backup_env:
                    differences.append({
                        'variable': key,
                        'current': current_env[key],
                        'backup': None,
                        'action': 'remove'
                    })
            
            rollback_result['differences'] = differences
            rollback_result['manual_steps_required'] = manual_steps
            rollback_result['success'] = True
            
            # Add guidance for manual configuration restoration
            if differences or manual_steps:
                rollback_result['guidance'] = [
                    "Configuration rollback requires manual review and application",
                    "Review each difference carefully before applying changes",
                    "Backup current environment variables before making changes",
                    "Restart the application after configuration changes"
                ]
            
            logger.info(f"Configuration rollback analysis completed: {len(differences)} differences found")
            
        except Exception as e:
            rollback_result['error'] = str(e)
            logger.error(f"Configuration rollback analysis failed: {e}")
        
        return rollback_result
    
    def rollback_full_system(self, backup_info: Dict, 
                           create_current_backup: bool = True) -> Dict:
        """
        Rollback entire system from a full backup.
        
        Args:
            backup_info: Full system backup information
            create_current_backup: Whether to backup current system first
            
        Returns:
            dict: Rollback results
        """
        rollback_result = {
            'success': False,
            'components_restored': {},
            'backup_created': None,
            'warnings': [],
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            # Validate backup first
            validation = self.validate_backup(backup_info)
            if not validation['valid']:
                raise Exception(f"Backup validation failed: {validation['issues']}")
            
            # Create current system backup before rollback
            if create_current_backup:
                try:
                    from utils.backup_manager import BackupManager
                    backup_manager = BackupManager()
                    current_backup = backup_manager.create_full_system_backup('pre_rollback')
                    rollback_result['backup_created'] = current_backup['backup_path']
                    logger.info(f"Created pre-rollback backup: {current_backup['backup_path']}")
                except Exception as e:
                    rollback_result['warnings'].append(f"Could not create pre-rollback backup: {e}")
            
            # Extract full backup to staging area
            backup_path = Path(backup_info['backup_path'])
            staging_extract_dir = self.staging_dir / f"full_rollback_{datetime.now().strftime('%H%M%S')}"
            staging_extract_dir.mkdir()
            
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(staging_extract_dir)
            
            logger.info(f"Extracted full backup to staging: {staging_extract_dir}")
            
            # Restore components
            components_result = {}
            
            # 1. Restore database
            db_backup_path = staging_extract_dir / 'database'
            if db_backup_path.exists():
                db_files = list(db_backup_path.glob('*.sqlite'))
                if db_files:
                    # Create temporary backup info for database component
                    db_backup_info = {
                        'backup_path': str(db_files[0]),
                        'category': 'database'
                    }
                    
                    db_result = self.rollback_database(db_backup_info, create_current_backup=False)
                    components_result['database'] = db_result
            
            # 2. Restore files
            files_backup_path = staging_extract_dir / 'files'
            if files_backup_path.exists():
                files_files = list(files_backup_path.glob('*.zip'))
                if files_files:
                    # Create temporary backup info for files component
                    files_backup_info = {
                        'backup_path': str(files_files[0]),
                        'category': 'files'
                    }
                    
                    files_result = self.rollback_files(files_backup_info, create_current_backup=False)
                    components_result['files'] = files_result
            
            # 3. Analyze configuration
            config_backup_path = staging_extract_dir / 'configuration'
            if config_backup_path.exists():
                config_files = list(config_backup_path.glob('*.json'))
                if config_files:
                    # Create temporary backup info for configuration component
                    config_backup_info = {
                        'backup_path': str(config_files[0]),
                        'category': 'configuration'
                    }
                    
                    config_result = self.rollback_configuration(config_backup_info)
                    components_result['configuration'] = config_result
            
            rollback_result['components_restored'] = components_result
            
            # Determine overall success
            success_count = sum(1 for result in components_result.values() 
                              if result.get('success', False))
            total_components = len(components_result)
            
            if success_count == total_components:
                rollback_result['success'] = True
                logger.info("Full system rollback completed successfully")
            elif success_count > 0:
                rollback_result['success'] = True
                rollback_result['warnings'].append(f"Partial success: {success_count}/{total_components} components restored")
                logger.warning(f"Partial rollback success: {success_count}/{total_components}")
            else:
                raise Exception("All component rollbacks failed")
            
        except Exception as e:
            rollback_result['error'] = str(e)
            logger.error(f"Full system rollback failed: {e}")
        
        return rollback_result
    
    def cleanup(self):
        """Clean up rollback staging directory."""
        try:
            if self.staging_dir.exists():
                shutil.rmtree(self.staging_dir)
                logger.info(f"Cleaned up rollback staging directory: {self.staging_dir}")
        except Exception as e:
            logger.warning(f"Could not clean up staging directory: {e}")
    
    def _find_current_database_path(self) -> Optional[str]:
        """Find the current database file."""
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
    
    def _validate_database_backup(self, backup_path: str) -> Dict:
        """Validate a database backup file."""
        validation = {'valid': True, 'issues': []}
        
        try:
            if not self._verify_database_backup(backup_path):
                validation['valid'] = False
                validation['issues'].append("Database backup verification failed")
        except Exception as e:
            validation['valid'] = False
            validation['issues'].append(f"Database validation error: {e}")
        
        return validation
    
    def _validate_files_backup(self, backup_path: str) -> Dict:
        """Validate a files backup (ZIP) file."""
        validation = {'valid': True, 'issues': []}
        
        try:
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                # Check if ZIP file is valid
                zipf.testzip()
                
                # Check if ZIP has content
                file_list = zipf.namelist()
                if not file_list:
                    validation['valid'] = False
                    validation['issues'].append("Files backup is empty")
                    
        except zipfile.BadZipFile:
            validation['valid'] = False
            validation['issues'].append("Invalid ZIP file")
        except Exception as e:
            validation['valid'] = False
            validation['issues'].append(f"Files validation error: {e}")
        
        return validation
    
    def _validate_full_backup(self, backup_path: str) -> Dict:
        """Validate a full system backup file."""
        validation = {'valid': True, 'issues': []}
        
        try:
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                # Check if ZIP file is valid
                zipf.testzip()
                
                # Check for required components
                file_list = zipf.namelist()
                
                required_components = ['database/', 'files/', 'configuration/']
                for component in required_components:
                    if not any(path.startswith(component) for path in file_list):
                        validation['issues'].append(f"Missing component: {component}")
                
                if validation['issues']:
                    validation['valid'] = False
                    
        except zipfile.BadZipFile:
            validation['valid'] = False
            validation['issues'].append("Invalid ZIP file")
        except Exception as e:
            validation['valid'] = False
            validation['issues'].append(f"Full backup validation error: {e}")
        
        return validation
    
    def _calculate_file_checksum(self, file_path: str) -> str:
        """Calculate SHA256 checksum of a file."""
        import hashlib
        
        hash_sha256 = hashlib.sha256()
        
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        
        return hash_sha256.hexdigest()


# Convenience functions for easy use
def list_rollback_options(category: str = None) -> List[Dict]:
    """
    List available backups for rollback.
    
    Args:
        category: Filter by category (database, files, configuration, full_system)
        
    Returns:
        list: List of backup information dictionaries
    """
    rollback_manager = RollbackManager()
    try:
        return rollback_manager.list_available_backups(category)
    finally:
        rollback_manager.cleanup()


def perform_rollback(backup_info: Dict, rollback_type: str = None) -> Dict:
    """
    Perform a rollback from the specified backup.
    
    Args:
        backup_info: Backup information dictionary
        rollback_type: Type of rollback (auto-detected if None)
        
    Returns:
        dict: Rollback results
    """
    rollback_manager = RollbackManager()
    
    try:
        # Auto-detect rollback type
        category = rollback_type or backup_info.get('category', '')
        
        if category == 'database':
            return rollback_manager.rollback_database(backup_info)
        elif category == 'files':
            return rollback_manager.rollback_files(backup_info)
        elif category == 'configuration':
            return rollback_manager.rollback_configuration(backup_info)
        elif category == 'full_system':
            return rollback_manager.rollback_full_system(backup_info)
        else:
            raise ValueError(f"Unknown rollback type: {category}")
    
    finally:
        rollback_manager.cleanup()


if __name__ == "__main__":
    # Demo/test the rollback system
    print("Fire EMS Tools - Rollback Manager Demo")
    print("=" * 50)
    
    try:
        # List available backups
        print("Available backups for rollback:")
        backups = list_rollback_options()
        
        if not backups:
            print("  No backups found. Create some backups first using backup_manager.py")
        else:
            for i, backup in enumerate(backups[:5]):  # Show first 5
                status = "✅" if backup.get('backup_exists', False) else "❌"
                print(f"  {i+1}. {status} {backup['created_at']}: {backup['type']} ({backup['category']})")
        
        print(f"\nTotal backups available: {len(backups)}")
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")