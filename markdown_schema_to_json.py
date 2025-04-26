#!/usr/bin/env python3
"""
Convert a Markdown schema definition to a standardized JSON schema file.
This script parses the Markdown table format and outputs a structured JSON
with requiredFields and optionalFields arrays according to FireEMS.ai specifications.
"""

import re
import json
import sys
import os
from datetime import datetime

def determine_category(field_name):
    """Determine the category of a field based on its name prefix."""
    field_name = field_name.lower()
    categories = {
        "incident_": "incident",
        "call_": "call",
        "unit_": "unit",
        "station_": "station",
        "location_": "location",
        "address_": "address",
        "patient_": "patient",
        "fire_": "fire",
        "apparatus_": "apparatus",
        "personnel_": "personnel",
        "ems_": "ems",
        "hazmat_": "hazmat",
        "wildland_": "wildland"
    }
    
    for prefix, category in categories.items():
        if field_name.startswith(prefix):
            return category
    
    # Special case handling
    if "latitude" in field_name or "longitude" in field_name:
        return "location"
        
    return "general"

def parse_tools_list(tools_text):
    """Parse a comma-separated list of tools from the Markdown table cell."""
    if not tools_text or tools_text.strip() == '-':
        return []
        
    # Split by commas and clean up each tool name
    return [tool.strip() for tool in tools_text.split(',')]

def parse_final_markdown_schema(markdown_text):
    """Parse the finalized markdown schema with 5-column tables into a structured dictionary."""
    schema = {
        "schemaVersion": "3.0",
        "schemaName": "Standardized Incident Record",
        "lastUpdated": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "requiredFields": [],
        "optionalFields": [],
        "implementationNotes": []
    }
    
    # Extract implementation notes
    implementation_notes_section = re.search(r'## Implementation Notes\n\n(.*?)(?:\n\n##|\Z)', 
                                            markdown_text, re.DOTALL)
    if implementation_notes_section:
        # Split the notes by bullet points and clean them up
        notes_text = implementation_notes_section.group(1)
        notes = [note.strip('- \n') for note in notes_text.split('\n-') if note.strip()]
        schema["implementationNotes"] = notes
    
    # Extract the required fields section
    required_section = re.search(r'## Required Fields.*?\n\n.*?\n\|.*?\n\|(.*?)(?:\n\n##|\Z)', 
                                markdown_text, re.DOTALL)
    
    # Extract the optional fields section
    optional_section = re.search(r'## Optional Fields.*?\n\n.*?\n\|.*?\n\|(.*?)(?:\n\n##|\Z)', 
                                markdown_text, re.DOTALL)
    
    # Regular expression for parsing table rows - matching 5 columns
    row_pattern = r'\| `([^`]+)`\s*\| ([^|]*)\| ([^|]*)\| ([^|]*)\| ([^|]*)\|'
    
    # Parse required fields
    if required_section:
        required_rows = re.findall(row_pattern, required_section.group(1))
        for row in required_rows:
            field_name = row[0].strip()
            data_type = row[1].strip()
            format_notes = row[2].strip()
            required_by_tools = parse_tools_list(row[3])
            optional_for_tools = parse_tools_list(row[4])
            
            # Create field definition
            field_def = {
                "fieldName": field_name,
                "dataType": data_type,
                "formatNotes": format_notes,
                "category": determine_category(field_name),
                "requiredByTools": required_by_tools,
                "optionalForTools": optional_for_tools
            }
            
            schema["requiredFields"].append(field_def)
    
    # Parse optional fields
    if optional_section:
        optional_rows = re.findall(row_pattern, optional_section.group(1))
        for row in optional_rows:
            field_name = row[0].strip()
            data_type = row[1].strip()
            format_notes = row[2].strip()
            required_by_tools = parse_tools_list(row[3])
            optional_for_tools = parse_tools_list(row[4])
            
            # Create field definition
            field_def = {
                "fieldName": field_name,
                "dataType": data_type,
                "formatNotes": format_notes,
                "category": determine_category(field_name),
                "requiredByTools": required_by_tools,
                "optionalForTools": optional_for_tools
            }
            
            schema["optionalFields"].append(field_def)
    
    # Extract Isochrone Map schemas
    # Station Location Schema
    station_schema_section = re.search(r'### 1\. Station Location Schema.*?\n\n.*?\n\|.*?\n\|(.*?)(?:\n\n###|\Z)', 
                                      markdown_text, re.DOTALL)
    
    station_fields = []
    if station_schema_section:
        # Pattern for station schema - 4 columns
        station_pattern = r'\| `([^`]+)`\s*\| ([^|]*)\| ([^|]*)\| ([^|]*)\|'
        station_rows = re.findall(station_pattern, station_schema_section.group(1))
        
        for row in station_rows:
            field_name = row[0].strip()
            data_type = row[1].strip()
            format_notes = row[2].strip()
            required = row[3].strip().lower() == "required"
            
            # Create field definition
            field_def = {
                "fieldName": field_name,
                "dataType": data_type,
                "formatNotes": format_notes,
                "required": required
            }
            
            station_fields.append(field_def)
    
    # Incident Overlay Schema
    incident_schema_section = re.search(r'### 2\. Incident Overlay Schema.*?\n\n.*?\n\|.*?\n\|(.*?)(?:\n\n##|\Z)', 
                                       markdown_text, re.DOTALL)
    
    incident_fields = []
    if incident_schema_section:
        # Pattern for incident schema - 4 columns
        incident_pattern = r'\| `([^`]+)`\s*\| ([^|]*)\| ([^|]*)\| ([^|]*)\|'
        incident_rows = re.findall(incident_pattern, incident_schema_section.group(1))
        
        for row in incident_rows:
            field_name = row[0].strip()
            data_type = row[1].strip()
            format_notes = row[2].strip()
            required = row[3].strip().lower() == "required"
            
            # Create field definition
            field_def = {
                "fieldName": field_name,
                "dataType": data_type,
                "formatNotes": format_notes,
                "required": required
            }
            
            incident_fields.append(field_def)
    
    # Add special schemas if they were found
    if station_fields or incident_fields:
        schema["specialSchemas"] = {}
        
        if station_fields:
            schema["specialSchemas"]["stationLocationSchema"] = station_fields
            
        if incident_fields:
            schema["specialSchemas"]["incidentOverlaySchema"] = incident_fields
    
    return schema

def main():
    """Main function to parse Markdown schema and output JSON."""
    if len(sys.argv) != 3:
        print("Usage: python markdown_schema_to_json.py <input_markdown_file> <output_json_file>")
        sys.exit(1)
    
    input_markdown_file = sys.argv[1]
    output_json_file = sys.argv[2]
    
    # Check if input file exists
    if not os.path.exists(input_markdown_file):
        print(f"Error: Input file {input_markdown_file} not found.")
        sys.exit(1)
    
    # Read the markdown content
    try:
        with open(input_markdown_file, 'r') as f:
            markdown_text = f.read()
    except Exception as e:
        print(f"Error reading input file: {str(e)}")
        sys.exit(1)
    
    # Parse the markdown to generate the schema
    schema = parse_final_markdown_schema(markdown_text)
    
    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(output_json_file)
    if output_dir and not os.path.exists(output_dir):
        try:
            os.makedirs(output_dir)
        except Exception as e:
            print(f"Error creating output directory: {str(e)}")
            sys.exit(1)
    
    # Write the schema to the output file
    try:
        with open(output_json_file, 'w') as f:
            json.dump(schema, f, indent=2)
        print(f"Schema successfully written to {output_json_file}")
    except Exception as e:
        print(f"Error writing output file: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()