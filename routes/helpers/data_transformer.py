"""
Data transformation helpers for the data formatter API endpoints.
"""

import pandas as pd
import numpy as np
import os
import json
from datetime import datetime
import pytz
import logging
import re

logger = logging.getLogger(__name__)

def transform_datetime(value, source_format=None, default_local_tz='America/Phoenix'):
    """Transform various date/time formats to ISO 8601 UTC."""
    if pd.isna(value) or value == '' or value is None:
        return None
    
    try:
        # Handle different input formats
        if isinstance(value, str):
            # First try to parse with provided source_format if available
            if source_format:
                try:
                    dt = datetime.strptime(value, source_format)
                except ValueError:
                    # If specific format fails, continue to fallbacks
                    pass
                else:
                    # If source_format worked, use resulting datetime
                    if dt is not None:
                        # Localize if naive
                        if dt.tzinfo is None:
                            local_tz = pytz.timezone(default_local_tz)
                            dt = local_tz.localize(dt)
                        
                        # Convert to UTC
                        dt = dt.astimezone(pytz.UTC)
                        
                        # Format as ISO 8601 with Z suffix
                        return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
            
            # Fallback: Try pandas to_datetime
            try:
                dt = pd.to_datetime(value)
            except:
                # Try common formats
                formats = [
                    '%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%m/%d/%Y %H:%M:%S', 
                    '%m/%d/%Y', '%d/%m/%Y %H:%M:%S', '%d/%m/%Y',
                    '%H:%M:%S', '%I:%M:%S %p'
                ]
                
                for fmt in formats:
                    try:
                        dt = datetime.strptime(value, fmt)
                        break
                    except:
                        continue
                else:
                    # No format matched
                    return None
        elif isinstance(value, (datetime, pd.Timestamp)):
            dt = value
        else:
            return None
        
        # Convert to UTC if it's a datetime (not just a time)
        if hasattr(dt, 'date') and not pd.isna(dt.date()):
            # Localize if naive
            if dt.tzinfo is None:
                local_tz = pytz.timezone(default_local_tz)
                dt = local_tz.localize(dt)
            
            # Convert to UTC
            dt = dt.astimezone(pytz.UTC)
            
            # Format as ISO 8601 with Z suffix
            return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
        
        return None
    except Exception as e:
        logger.error(f"Error transforming datetime: {str(e)}, value: {value}")
        return None

def load_schema(app_root_path):
    """Load the standardized schema file."""
    schema_path = os.path.join(app_root_path, 'static', 'standardized_incident_record_schema.json')
    try:
        if os.path.exists(schema_path):
            with open(schema_path, 'r') as f:
                return json.load(f)
        else:
            logger.error(f"Schema file not found at {schema_path}")
            return None
    except Exception as e:
        logger.error(f"Error loading schema: {str(e)}")
        return None

def get_standardized_field_name(field_id, schema=None):
    """Convert a field ID to a standardized field name."""
    # Field IDs can be in various formats, we need to standardize them
    
    # First check if the schema contains a fieldName mapping for this field
    if schema:
        # Check required fields
        for field in schema.get('requiredFields', []):
            if field_id == field.get('name'):
                return field.get('fieldName', field_id.lower().replace(' ', '_'))
            
        # Check optional fields
        for field in schema.get('optionalFields', []):
            if field_id == field.get('name'):
                return field.get('fieldName', field_id.lower().replace(' ', '_'))
    
    # Handle dot notation format (e.g., "incident.id")
    if '.' in field_id:
        category, field = field_id.split('.')
        return f"{category}_{field}"
    
    # Otherwise, just standardize the field name (lowercase, replace spaces with underscores)
    return field_id.lower().replace(' ', '_')

def apply_transformations(df, mappings, schema, app_root_path):
    """Apply transformations based on mappings and schema."""
    result_df = pd.DataFrame()
    
    # Create a dictionary to track standard field name mappings
    # This will be used to ensure we have consistent field names in the output
    standard_field_mappings = {}
    required_fields = []
    
    # Process schema to extract field information
    if 'coreMappings' in schema:
        # New schema format with coreMappings
        for category, fields in schema['coreMappings'].items():
            for field_id, field_def in fields.items():
                field_path = f"{category}.{field_id}"
                standard_field_name = f"{category}_{field_id}"
                
                # Store the mapping from field_path to standard_field_name
                standard_field_mappings[field_path] = standard_field_name
                
                # Track required fields
                if field_def.get('required', False):
                    required_fields.append(standard_field_name)
    else:
        # Standard schema format with requiredFields/optionalFields
        # Process required fields
        for field in schema.get('requiredFields', []):
            # Use fieldName if available, otherwise derive from name
            if 'fieldName' in field:
                field_name = field['fieldName']
            else:
                field_name = field.get('name', '').lower().replace(' ', '_')
                
            standard_field_mappings[field['name']] = field_name
            required_fields.append(field_name)
        
        # Process optional fields
        for field in schema.get('optionalFields', []):
            # Use fieldName if available, otherwise derive from name
            if 'fieldName' in field:
                field_name = field['fieldName']
            else:
                field_name = field.get('name', '').lower().replace(' ', '_')
                
            standard_field_mappings[field['name']] = field_name
    
    # Process each mapping from the request
    for field_id, mapping in mappings.items():
        # Skip if no source field is defined
        if not mapping.get('sourceId'):
            continue
        
        source_field = mapping['sourceId']
        transformations = mapping.get('transformations', [])
        
        # Convert field_id to standardized field name
        standard_field_name = get_standardized_field_name(field_id, schema)
        
        # Store the standardized name for reference
        standard_field_mappings[field_id] = standard_field_name
        
        # Log for debugging
        logger.debug(f"Mapping field '{field_id}' to standardized name '{standard_field_name}'")
        
        # Check if there are field aliases for auto-detection
        field_aliases = schema.get('fieldAliases', {}).get(standard_field_name, [])
        
        # Start with the source column
        if source_field in df.columns:
            result_df[standard_field_name] = df[source_field].copy()
        else:
            # Skip if source field doesn't exist
            continue
        
        # Get field type from schema if available
        field_type = None
        
        # Check schema format and extract type
        if 'coreMappings' in schema:
            # CoreMappings schema format
            if '.' in field_id:
                category, field = field_id.split('.')
                if category in schema['coreMappings'] and field in schema['coreMappings'][category]:
                    field_type = schema['coreMappings'][category][field].get('type')
        else:
            # Standard schema format
            for field in schema.get('requiredFields', []) + schema.get('optionalFields', []):
                if field.get('fieldName') == standard_field_name or field.get('name').lower().replace(' ', '_') == standard_field_name:
                    field_type = field.get('type')
                    break
        
        logger.debug(f"Field '{standard_field_name}' detected type: {field_type}")
        
        # Apply transformations in order
        for transform in transformations:
            transform_type = transform.get('type')
            
            if transform_type == 'datetime' or field_type == 'date' or field_type == 'time':
                # Extract source format if provided
                source_format = transform.get('sourceFormat')
                # Default timezone from transform or use America/Phoenix
                default_tz = transform.get('timezone', 'America/Phoenix')
                
                # Convert to ISO 8601 UTC datetime using the source format if available
                result_df[standard_field_name] = result_df[standard_field_name].apply(
                    lambda x: transform_datetime(x, source_format=source_format, default_local_tz=default_tz)
                )
            
            elif transform_type == 'number' or field_type == 'number':
                # Convert to number
                result_df[standard_field_name] = pd.to_numeric(result_df[standard_field_name], errors='coerce')
                
            elif transform_type == 'text':
                # Ensure text format
                result_df[standard_field_name] = result_df[standard_field_name].astype(str)
                
            elif transform_type == 'boolean':
                # Convert to boolean
                result_df[standard_field_name] = result_df[standard_field_name].map({
                    'true': True, 'True': True, '1': True, 1: True, 'yes': True, 'Yes': True,
                    'false': False, 'False': False, '0': False, 0: False, 'no': False, 'No': False
                })
                
            elif transform_type == 'replace':
                # Replace values
                old_value = transform.get('oldValue', '')
                new_value = transform.get('newValue', '')
                result_df[standard_field_name] = result_df[standard_field_name].replace(old_value, new_value)
                
            elif transform_type == 'extract':
                # Extract using regex
                pattern = transform.get('pattern', '')
                group = transform.get('group', 0)
                if pattern:
                    result_df[standard_field_name] = result_df[standard_field_name].str.extract(
                        pattern, expand=False
                    )
    
    # Auto-generate combined datetime fields where needed
    if 'incident_date' in result_df.columns and 'incident_time' in result_df.columns:
        # Create incident_datetime field by combining date and time
        result_df['incident_datetime'] = result_df.apply(
            lambda row: combine_date_time(row['incident_date'], row['incident_time']),
            axis=1
        )
    
    # Ensure all required fields are present
    for field_name in required_fields:
        if field_name not in result_df.columns:
            result_df[field_name] = None
    
    # Handle special cases for latitude and longitude
    if 'location_latitude' in result_df.columns:
        result_df['latitude'] = pd.to_numeric(result_df['location_latitude'], errors='coerce')
    
    if 'location_longitude' in result_df.columns:
        result_df['longitude'] = pd.to_numeric(result_df['location_longitude'], errors='coerce')
    
    # Add metadata
    result_df['_processed_at'] = datetime.now(pytz.UTC).strftime('%Y-%m-%dT%H:%M:%SZ')
    
    return result_df

def combine_date_time(date_val, time_val):
    """Combine date and time into ISO 8601 UTC datetime string."""
    if pd.isna(date_val) or pd.isna(time_val):
        return None
    
    try:
        # Parse date and time strings
        if isinstance(date_val, str) and isinstance(time_val, str):
            # Try to combine date and time
            combined = f"{date_val} {time_val}"
            
            # Convert to datetime
            dt = pd.to_datetime(combined)
            
            # Localize if naive
            if dt.tzinfo is None:
                local_tz = pytz.timezone('America/Phoenix')  # Default timezone
                dt = local_tz.localize(dt)
            
            # Convert to UTC
            dt = dt.astimezone(pytz.UTC)
            
            # Format as ISO 8601 with Z suffix
            return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    except Exception as e:
        logger.error(f"Error combining date and time: {str(e)}, date: {date_val}, time: {time_val}")
    
    return None