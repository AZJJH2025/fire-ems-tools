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
        logger.info(f"Transforming datetime value: '{value}', source_format: '{source_format}', timezone: '{default_local_tz}'")
        
        # Handle different input formats
        if isinstance(value, str):
            # First try to parse with provided source_format if available
            if source_format:
                try:
                    dt = datetime.strptime(value, source_format)
                    logger.info(f"Successfully parsed '{value}' with format '{source_format}'")
                except ValueError as e:
                    # If specific format fails, continue to fallbacks
                    logger.warning(f"Failed to parse '{value}' with format '{source_format}': {str(e)}")
                    dt = None
                    pass
                else:
                    # If source_format worked, use resulting datetime
                    if dt is not None:
                        # Localize if naive
                        if dt.tzinfo is None:
                            local_tz = pytz.timezone(default_local_tz)
                            dt = local_tz.localize(dt)
                            logger.info(f"Localized naive datetime to '{default_local_tz}'")
                        
                        # Convert to UTC
                        dt = dt.astimezone(pytz.UTC)
                        
                        # Format as ISO 8601 with Z suffix
                        iso_str = dt.strftime('%Y-%m-%dT%H:%M:%SZ')
                        logger.info(f"Converted to ISO 8601 UTC: '{iso_str}'")
                        return iso_str
            
            # If we get here, either no source_format was provided or it failed
            # Fallback: Try pandas to_datetime
            try:
                logger.info(f"Trying pandas to_datetime for '{value}'")
                dt = pd.to_datetime(value)
                logger.info(f"Successfully parsed with pandas: {dt}")
            except Exception as e:
                logger.warning(f"pandas to_datetime failed for '{value}': {str(e)}")
                # Try common formats
                formats = [
                    '%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%m/%d/%Y %H:%M:%S', 
                    '%m/%d/%Y', '%d/%m/%Y %H:%M:%S', '%d/%m/%Y',
                    '%H:%M:%S', '%I:%M:%S %p', '%H:%M', '%I:%M %p'
                ]
                
                dt = None
                for fmt in formats:
                    try:
                        dt = datetime.strptime(value, fmt)
                        logger.info(f"Matched format '{fmt}' for '{value}'")
                        break
                    except:
                        pass
                
                if dt is None:
                    # No format matched
                    logger.warning(f"Could not parse '{value}' with any common format")
                    return None
        elif isinstance(value, (datetime, pd.Timestamp)):
            dt = value
            logger.info(f"Using datetime object directly: {dt}")
        else:
            logger.warning(f"Unsupported value type: {type(value)}")
            return None
        
        # Convert to UTC if it's a datetime (not just a time)
        if hasattr(dt, 'date') and not pd.isna(dt.date()):
            # Check if it's just a time (no date component)
            is_time_only = False
            if isinstance(value, str) and ':' in value and '/' not in value and '-' not in value:
                is_time_only = True
                logger.info(f"Detected time-only value: '{value}'")
            
            if is_time_only:
                # For time-only values, don't apply timezone conversion
                time_str = dt.strftime('%H:%M:%S')
                logger.info(f"Formatted time-only value: '{time_str}'")
                return time_str
            else:
                # Localize if naive
                if dt.tzinfo is None:
                    local_tz = pytz.timezone(default_local_tz)
                    dt = local_tz.localize(dt)
                    logger.info(f"Localized naive datetime to '{default_local_tz}'")
                
                # Convert to UTC
                dt = dt.astimezone(pytz.UTC)
                
                # Format as ISO 8601 with Z suffix
                iso_str = dt.strftime('%Y-%m-%dT%H:%M:%SZ')
                logger.info(f"Converted to ISO 8601 UTC: '{iso_str}'")
                return iso_str
        
        logger.warning(f"Failed to convert '{value}' to datetime")
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
    
    # Log standard field mappings for debugging
    logger.info(f"Standard field mappings: {standard_field_mappings}")
    
    # Process each mapping from the request
    for field_id, mapping in mappings.items():
        # Skip if no source field is defined
        if not mapping.get('sourceId'):
            logger.warning(f"Skipping field '{field_id}' as it has no sourceId defined")
            continue
        
        source_field = mapping['sourceId']
        transformations = mapping.get('transformations', [])
        
        # Find the standard field name from the schema
        standard_field_name = None
        
        # First try to find exact match in schema
        for field in schema.get('requiredFields', []) + schema.get('optionalFields', []):
            if field['name'] == field_id:
                standard_field_name = field.get('fieldName')
                logger.info(f"Found exact schema match for '{field_id}': '{standard_field_name}'")
                break
        
        # If not found, use the standardization function
        if not standard_field_name:
            standard_field_name = get_standardized_field_name(field_id, schema)
            logger.info(f"Using standardized name for '{field_id}': '{standard_field_name}'")
        
        # Store the standardized name for reference
        standard_field_mappings[field_id] = standard_field_name
        
        # Log for debugging
        logger.info(f"Mapping source field '{source_field}' to standardized field '{standard_field_name}'")
        
        # Check if there are field aliases for auto-detection
        field_aliases = schema.get('fieldAliases', {}).get(standard_field_name, [])
        
        # Start with the source column
        if source_field in df.columns:
            result_df[standard_field_name] = df[source_field].copy()
            logger.info(f"Copied data from source field '{source_field}' to '{standard_field_name}'")
        else:
            # Skip if source field doesn't exist
            logger.warning(f"Source field '{source_field}' not found in dataframe. Available columns: {list(df.columns)}")
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
                if field.get('name') == field_id:
                    field_type = field.get('type')
                    logger.info(f"Found field type for '{field_id}': {field_type}")
                    break
        
        logger.info(f"Field '{standard_field_name}' detected type: {field_type}")
        
        # Apply transformations in order
        for transform in transformations:
            transform_type = transform.get('type')
            
            if transform_type == 'datetime' or field_type == 'datetime' or field_type == 'date' or field_type == 'time':
                # Extract source format if provided
                source_format = transform.get('sourceFormat')
                # Default timezone from transform or use America/Phoenix
                default_tz = transform.get('timezone', 'America/Phoenix')
                
                logger.info(f"Applying datetime transformation to '{standard_field_name}' with source_format: {source_format}, default_tz: {default_tz}")
                
                # Convert to ISO 8601 UTC datetime using the source format if available
                result_df[standard_field_name] = result_df[standard_field_name].apply(
                    lambda x: transform_datetime(x, source_format=source_format, default_local_tz=default_tz)
                )
                
                # Log a sample of the transformed values
                if not result_df.empty:
                    sample_vals = result_df[standard_field_name].head(2).tolist()
                    logger.info(f"Sample transformed values for '{standard_field_name}': {sample_vals}")
            
            elif transform_type == 'number' or field_type == 'number':
                # Convert to number
                logger.info(f"Converting '{standard_field_name}' to numeric")
                result_df[standard_field_name] = pd.to_numeric(result_df[standard_field_name], errors='coerce')
                
            elif transform_type == 'text':
                # Ensure text format
                logger.info(f"Converting '{standard_field_name}' to text")
                result_df[standard_field_name] = result_df[standard_field_name].astype(str)
                
            elif transform_type == 'boolean':
                # Convert to boolean
                logger.info(f"Converting '{standard_field_name}' to boolean")
                result_df[standard_field_name] = result_df[standard_field_name].map({
                    'true': True, 'True': True, '1': True, 1: True, 'yes': True, 'Yes': True,
                    'false': False, 'False': False, '0': False, 0: False, 'no': False, 'No': False
                })
                
            elif transform_type == 'replace':
                # Replace values
                old_value = transform.get('oldValue', '')
                new_value = transform.get('newValue', '')
                logger.info(f"Replacing '{old_value}' with '{new_value}' in '{standard_field_name}'")
                result_df[standard_field_name] = result_df[standard_field_name].replace(old_value, new_value)
                
            elif transform_type == 'extract':
                # Extract using regex
                pattern = transform.get('pattern', '')
                group = transform.get('group', 0)
                if pattern:
                    logger.info(f"Extracting from '{standard_field_name}' with pattern: {pattern}")
                    result_df[standard_field_name] = result_df[standard_field_name].str.extract(
                        pattern, expand=False
                    )
    
    # Auto-generate combined datetime fields where needed
    if 'incident_date' in result_df.columns and 'incident_time' in result_df.columns:
        # Create incident_datetime field by combining date and time
        logger.info("Generating incident_datetime from incident_date and incident_time")
        result_df['incident_datetime'] = result_df.apply(
            lambda row: combine_date_time(row['incident_date'], row['incident_time']),
            axis=1
        )
        
        # Log sample of the combined datetime field
        if not result_df.empty:
            sample_vals = result_df['incident_datetime'].head(2).tolist()
            logger.info(f"Sample incident_datetime values: {sample_vals}")
    
    # Ensure all required fields are present
    for field_name in required_fields:
        if field_name not in result_df.columns:
            logger.warning(f"Required field '{field_name}' not in result DataFrame. Adding as NULL.")
            result_df[field_name] = None
    
    # Handle special cases for latitude and longitude
    if 'location_latitude' in result_df.columns:
        logger.info("Converting location_latitude to standard latitude field")
        result_df['latitude'] = pd.to_numeric(result_df['location_latitude'], errors='coerce')
    
    if 'location_longitude' in result_df.columns:
        logger.info("Converting location_longitude to standard longitude field")
        result_df['longitude'] = pd.to_numeric(result_df['location_longitude'], errors='coerce')
    
    # Add metadata
    result_df['_processed_at'] = datetime.now(pytz.UTC).strftime('%Y-%m-%dT%H:%M:%SZ')
    
    # Log final column list for debugging
    logger.info(f"Final transformed columns: {list(result_df.columns)}")
    if not result_df.empty:
        logger.info(f"Sample transformed row: {result_df.iloc[0].to_dict()}")
    
    return result_df

def combine_date_time(date_val, time_val):
    """Combine date and time into ISO 8601 UTC datetime string."""
    if pd.isna(date_val) or pd.isna(time_val):
        logger.warning(f"Cannot combine date/time - null values: date={date_val}, time={time_val}")
        return None
    
    try:
        logger.info(f"Combining date '{date_val}' and time '{time_val}'")
        
        # Parse date and time strings
        if isinstance(date_val, str) and isinstance(time_val, str):
            # Try to combine date and time
            combined = f"{date_val} {time_val}"
            logger.info(f"Combined date and time: '{combined}'")
            
            # Convert to datetime
            try:
                dt = pd.to_datetime(combined)
                logger.info(f"Parsed combined datetime: {dt}")
            except Exception as e:
                logger.error(f"Failed to parse combined date/time '{combined}': {str(e)}")
                # Try individual parsing and combining
                try:
                    date_obj = pd.to_datetime(date_val).date()
                    time_obj = pd.to_datetime(time_val).time()
                    dt = datetime.combine(date_obj, time_obj)
                    logger.info(f"Successfully combined individual date/time objects: {dt}")
                except Exception as inner_e:
                    logger.error(f"Failed to combine individual date/time objects: {str(inner_e)}")
                    return None
            
            # Localize if naive
            if dt.tzinfo is None:
                local_tz = pytz.timezone('America/Phoenix')  # Default timezone
                dt = local_tz.localize(dt)
                logger.info(f"Localized naive datetime to 'America/Phoenix'")
            
            # Convert to UTC
            dt = dt.astimezone(pytz.UTC)
            
            # Format as ISO 8601 with Z suffix
            iso_string = dt.strftime('%Y-%m-%dT%H:%M:%SZ')
            logger.info(f"Final ISO 8601 UTC datetime: '{iso_string}'")
            return iso_string
        else:
            # Try to handle non-string inputs
            logger.warning(f"Non-string inputs: date={type(date_val)}, time={type(time_val)}")
            
            # Convert to datetime objects if they aren't already
            if not isinstance(date_val, (datetime, pd.Timestamp)):
                date_obj = pd.to_datetime(date_val).date()
            else:
                date_obj = date_val.date()
                
            if not isinstance(time_val, (datetime, pd.Timestamp)):
                time_obj = pd.to_datetime(time_val).time()
            else:
                time_obj = time_val.time()
                
            # Combine date and time
            dt = datetime.combine(date_obj, time_obj)
            logger.info(f"Combined from non-string inputs: {dt}")
            
            # Localize if naive
            if dt.tzinfo is None:
                local_tz = pytz.timezone('America/Phoenix')  # Default timezone
                dt = local_tz.localize(dt)
            
            # Convert to UTC
            dt = dt.astimezone(pytz.UTC)
            
            # Format as ISO 8601 with Z suffix
            iso_string = dt.strftime('%Y-%m-%dT%H:%M:%SZ')
            logger.info(f"Final ISO 8601 UTC datetime: '{iso_string}'")
            return iso_string
            
    except Exception as e:
        logger.error(f"Error combining date and time: {str(e)}, date: {date_val}, time: {time_val}")
    
    return None