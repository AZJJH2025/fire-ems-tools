#!/usr/bin/env python3
"""
Test script for the data-formatter transformation endpoint.
"""

import requests
import json
import sys
import os
import pandas as pd
from datetime import datetime
import pprint

# Base URL for the API
BASE_URL = "http://localhost:5000/api"  # Change this if your server is running on a different port

def upload_test_file():
    """Upload a test CSV file to the data formatter."""
    upload_url = f"{BASE_URL}/data-formatter/upload"
    
    # Create a simple test dataframe
    test_data = {
        "Inc_ID": ["INC-001", "INC-002", "INC-003"],
        "Call_Date": ["2023-01-01", "2023-01-02", "2023-01-03"],
        "Call_Time": ["14:30:00", "15:45:00", "16:20:00"],
        "GPS_Lat": [33.4484, 33.4500, 33.4522],
        "GPS_Lon": [-112.0740, -112.0730, -112.0710],
        "Call_Type": ["Medical", "Fire", "Medical"],
        "Units": ["E12", "L18", "E9"],
        "Disp_Time": ["14:32:00", "15:47:00", "16:22:00"],
        "Arriv_Time": ["14:38:00", "15:55:00", "16:30:00"],
        "Address_Full": ["123 Main St", "456 Oak Ave", "789 Pine Rd"],
        "Priority": ["1", "2", "1"]
    }
    
    # Create a CSV file
    test_df = pd.DataFrame(test_data)
    test_file_path = os.path.join(os.getcwd(), "test_data.csv")
    test_df.to_csv(test_file_path, index=False)
    
    # Upload the file
    with open(test_file_path, "rb") as file:
        files = {"file": file}
        response = requests.post(upload_url, files=files)
    
    # Clean up the file
    os.remove(test_file_path)
    
    if response.status_code != 200:
        print(f"Upload failed with status {response.status_code}")
        print(response.text)
        return None
    
    response_data = response.json()
    file_id = response_data.get("fileId")
    print(f"File uploaded successfully with ID: {file_id}")
    return file_id

def transform_data(file_id):
    """Transform the uploaded data."""
    transform_url = f"{BASE_URL}/data-formatter/transform"
    
    # Define mappings
    mappings = {
        "Incident ID": {"sourceId": "Inc_ID"},
        "Incident Date": {"sourceId": "Call_Date"},
        "Incident Time": {"sourceId": "Call_Time"},
        "Latitude": {"sourceId": "GPS_Lat"},
        "Longitude": {"sourceId": "GPS_Lon"},
        "Incident Type": {"sourceId": "Call_Type"},
        "Unit": {"sourceId": "Units"},
        "Unit Dispatched": {"sourceId": "Disp_Time", "transformations": [{"type": "datetime"}]},
        "Unit Onscene": {"sourceId": "Arriv_Time", "transformations": [{"type": "datetime"}]},
        "Address": {"sourceId": "Address_Full"},
        "Priority": {"sourceId": "Priority"}
    }
    
    # Prepare request data
    data = {
        "fileId": file_id,
        "mappings": mappings,
        "targetTool": "response-time"
    }
    
    # Send request
    response = requests.post(transform_url, json=data)
    
    if response.status_code != 200:
        print(f"Transform failed with status {response.status_code}")
        print(response.text)
        return None
    
    response_data = response.json()
    
    # Print transformation results
    print("\nTransformation Results:")
    print(f"  Success: {response_data.get('success', False)}")
    print(f"  Transform ID: {response_data.get('transformId', 'N/A')}")
    print(f"  Row Count: {response_data.get('rowCount', 0)}")
    print(f"  Column Count: {response_data.get('columnCount', 0)}")
    
    if response_data.get('transformationLog'):
        print("\nTransformation Log:")
        for log in response_data.get('transformationLog'):
            print(f"  - {log}")
    
    if response_data.get('errors'):
        print("\nErrors:")
        for error in response_data.get('errors'):
            print(f"  - {error}")
    
    if response_data.get('missingRequiredFields'):
        print("\nMissing Required Fields:")
        for field in response_data.get('missingRequiredFields'):
            print(f"  - {field}")
    
    # Print preview data
    preview = response_data.get('preview', [])
    if preview:
        print("\nPreview Data (First Record):")
        pp = pprint.PrettyPrinter(indent=2)
        pp.pprint(preview[0])
        
        # Check if we have standardized field names
        first_record = preview[0]
        found_standardized = False
        for field in ["incident_id", "latitude", "longitude", "incident_datetime"]:
            if field in first_record:
                found_standardized = True
                break
                
        if found_standardized:
            print("\n✅ SUCCESS: Standardized field names found in output")
        else:
            print("\n❌ ERROR: No standardized field names found in output")
            
        # Check if we have ISO 8601 datetime formats
        has_iso_format = False
        for field_value in first_record.values():
            if isinstance(field_value, str) and 'T' in field_value and field_value.endswith('Z'):
                has_iso_format = True
                break
                
        if has_iso_format:
            print("✅ SUCCESS: ISO 8601 UTC datetime formats found in output")
        else:
            print("❌ ERROR: No ISO 8601 UTC datetime formats found in output")
    
    return response_data.get('transformId')

def main():
    """Main function to run the test."""
    print("Testing data-formatter transformation endpoint...")
    
    # Upload a test file
    file_id = upload_test_file()
    if not file_id:
        sys.exit(1)
    
    # Transform the data
    transform_id = transform_data(file_id)
    if not transform_id:
        sys.exit(1)
    
    print("\nTest completed successfully!")

if __name__ == "__main__":
    main()