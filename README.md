# Testing the Data Formatter Integration

This document provides instructions for testing the Data Formatter with Column Mapping UI integration.

## Integration Overview

We've implemented a comprehensive integration between the React-based Column Mapping UI and the backend API endpoints. The key components are:

1. **Backend API Endpoints**:
   - `/api/data-formatter/upload`: Handles file uploads and returns a fileId
   - `/api/data-formatter/transform`: Processes data using mapping configurations
   - `/api/data-formatter/download/{transformId}`: Download transformed data
   - `/api/data-formatter/send-to-tool`: Send data to other tools

2. **Frontend Components**:
   - `ColumnMappingUI.jsx`: React component for field mapping
   - `data-formatter-api.js`: Client API for backend communication
   - `data-formatter-api-integration.js`: Integration with UI buttons

## Testing Instructions

1. Start the Flask server:
   ```
   python3 test_app.py
   ```

2. Access the Data Formatter in your browser:
   ```
   http://127.0.0.1:5000/data-formatter
   ```

3. Upload a test file (CSV, Excel, or JSON)

4. Click "Map Fields" to open the Column Mapping UI

5. Drag source columns to target fields

6. Configure transformations using the settings icon

7. Click "Apply & Preview Transformation"

8. Download the transformed data or send to another tool

## Testing Alternative

If you're having trouble with the browser access, you can test the API endpoints directly:

1. For file upload:
   ```
   POST http://127.0.0.1:5000/data-formatter/upload
   Content-Type: multipart/form-data
   Body: form-data with 'file' field containing your test file
   ```

2. For data transformation:
   ```
   POST http://127.0.0.1:5000/data-formatter/transform
   Content-Type: application/json
   Body: 
   {
     "fileId": "your-file-id-from-upload",
     "mappings": [
       {
         "sourceField": "source_column_name",
         "targetField": "target_field_name",
         "required": true,
         "transformConfig": {
           "type": "text",
           "textTransform": "uppercase"
         }
       }
     ]
   }
   ```

3. For downloading transformed data:
   ```
   GET http://127.0.0.1:5000/data-formatter/download/{transform_id}?format=csv
   ```

## Troubleshooting

If you encounter HTTP 403 errors:
- Try a different browser
- Check if your browser blocks localhost connections
- Try using 127.0.0.1 instead of localhost
- Check system firewall settings
- Try a different port (modify the port in test_app.py)