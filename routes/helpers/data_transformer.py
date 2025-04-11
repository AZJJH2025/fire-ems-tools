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

def apply_transformations(df, mappings, schema, app_root_path):
    """Apply transformations based on mappings and schema."""
    result_df = pd.DataFrame()
    
    # Process each mapping
    for field_name, mapping in mappings.items():
        # Check for the correct key - use sourceId (which matches the frontend state)
        if not mapping.get('sourceId'):
            continue
            
        source_field = mapping['sourceId']
        transformations = mapping.get('transformations', [])
        
        # Start with the source column
        if source_field in df.columns:
            result_df[field_name] = df[source_field].copy()
        else:
            # Skip if source field doesn't exist
            continue
            
        # Apply transformations in order
        for transform in transformations:
            transform_type = transform.get('type')
            
            if transform_type == 'datetime':
                # Extract source format if provided
                source_format = transform.get('sourceFormat')
                # Default timezone from transform or use America/Phoenix
                default_tz = transform.get('timezone', 'America/Phoenix')
                
                # Convert to ISO 8601 UTC datetime using the source format if available
                result_df[field_name] = result_df[field_name].apply(
                    lambda x: transform_datetime(x, source_format=source_format, default_local_tz=default_tz)
                )
            
            elif transform_type == 'number':
                # Convert to number
                result_df[field_name] = pd.to_numeric(result_df[field_name], errors='coerce')
                
            elif transform_type == 'text':
                # Ensure text format
                result_df[field_name] = result_df[field_name].astype(str)
                
            elif transform_type == 'boolean':
                # Convert to boolean
                result_df[field_name] = result_df[field_name].map({
                    'true': True, 'True': True, '1': True, 1: True, 'yes': True, 'Yes': True,
                    'false': False, 'False': False, '0': False, 0: False, 'no': False, 'No': False
                })
                
            elif transform_type == 'replace':
                # Replace values
                old_value = transform.get('oldValue', '')
                new_value = transform.get('newValue', '')
                result_df[field_name] = result_df[field_name].replace(old_value, new_value)
                
            elif transform_type == 'extract':
                # Extract using regex
                pattern = transform.get('pattern', '')
                group = transform.get('group', 0)
                if pattern:
                    result_df[field_name] = result_df[field_name].str.extract(
                        pattern, expand=False
                    )
    
    # Get all valid field names from both required and optional fields in the schema
    schema_fields = []
    
    # Add required fields
    for field in schema.get('requiredFields', []):
        field_name = field.get('fieldName')
        if field_name:
            schema_fields.append(field_name)
    
    # Add optional fields
    for field in schema.get('optionalFields', []):
        field_name = field.get('fieldName')
        if field_name:
            schema_fields.append(field_name)
    
    # If using coreMappings structure, extract field names from there
    if 'coreMappings' in schema:
        for category, fields in schema['coreMappings'].items():
            for field_key, field_def in fields.items():
                if 'name' in field_def:
                    schema_fields.append(field_def['name'])
    
    # Ensure all fields in the schema are present
    for field_name in schema_fields:
        if field_name not in result_df.columns:
            result_df[field_name] = None
    
    # Filter to only include fields defined in the schema
    # Add metadata field(s) to the list of allowed columns
    allowed_columns = schema_fields + ['_processed_at']
    result_df = result_df[[col for col in result_df.columns if col in allowed_columns]]
    
    # Add metadata
    result_df['_processed_at'] = datetime.now(pytz.UTC).strftime('%Y-%m-%dT%H:%M:%SZ')
    
    return result_df