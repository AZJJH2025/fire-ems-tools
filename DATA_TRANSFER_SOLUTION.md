# Data Transfer Solution: Data Formatter to Response Time Analyzer

## Problem Overview

The Response Time Dashboard was experiencing issues with data transfer from the Data Formatter tool. The root issues were:

1. **Missing Server-Side Storage**: Data was stored in browser's sessionStorage but not in the server's Flask session
2. **Field Mapping Inconsistency**: Fields like "Incident ID" weren't being mapped to the dashboard's expected field names like "id"
3. **Date Format Inconsistency**: Various date formats weren't being properly standardized
4. **Missing Coordinate Mapping**: Location coordinates weren't being properly identified and transformed for map display
5. **Missing Essential Fields**: Important fields like response times, unit activity, and datetime were missing or not properly formatted

## Solution Implementation

### 1. Data Bridge Script (`/static/data-bridge.js`)

A JavaScript bridge that provides multiple data transfer mechanisms:

- Adds visual buttons for manual data transfer
- Intercepts React component click events
- Extracts data from browser storage and sends it to the server

```javascript
// Key functions in data-bridge.js:
function sendDataToServer(data, toolId) { ... }
function extractData() { ... }
function addManualTransferButton() { ... }
```

### 2. Enhanced Data Connector (`/data_connector.py`)

Improves the server-side data handling:

- Better field mapping through schema definitions
- Date format standardization (MM/DD/YYYY → YYYY-MM-DD)
- Robust error handling and data validation
- Enhanced session management

```python
# Key improvements in data_connector.py:
def store_data(data, tool_id=None):
    # Field mapping with schema
    schema_mapping = {
        'id': ['Incident ID', 'id', 'incident_id', ...],
        'date': ['Incident Date', 'date', 'incident_date', ...],
        'latitude': ['Latitude', 'latitude', 'lat', 'LAT', 'Y', 'y'],
        'longitude': ['Longitude', 'longitude', 'long', 'lng', 'LON', 'LONG', 'X', 'x'],
        'dispatch_time': ['Dispatch Time', 'dispatch_time', 'DispatchTime', ...],
        'en_route_time': ['En Route Time', 'en_route_time', 'EnRouteTime', ...],
        'arrival_time': ['Arrival Time', 'arrival_time', 'ArrivalTime', ...],
        'response_time_seconds': ['Response Time', 'response_time', 'ResponseTime', ...],
        'unit': ['Unit', 'unit', 'UnitID', 'Primary Unit', ...],
        # Additional mappings...
    }
    
    # Date standardization
    def standardize_date(date_str):
        # Convert various formats to YYYY-MM-DD
        
    # Coordinate parsing and validation
    def parse_coordinate(value):
        # Convert coordinate values to proper float format
        
    # Response time calculation
    if 'dispatch_time' in transformed and 'arrival_time' in transformed:
        # Calculate response time in seconds
        response_seconds = calculate_time_difference(dispatch_time, arrival_time)
        transformed['response_time_seconds'] = response_seconds
        
    # Create datetime from date and time
    if 'date' in transformed and 'time' in transformed:
        transformed['datetime'] = f"{transformed['date']}T{transformed['time']}"
```

### 3. Flask App Configuration (`/minimal_react_app_fixed.py`)

Improves session handling and persistence:

```python
app.config['SESSION_TYPE'] = 'filesystem'  # Use filesystem session for better persistence
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # Sessions last for 24 hours
app.config['SESSION_USE_SIGNER'] = True  # Sign the session cookies for security
```

## Data Flow

1. **Data Formatter Tool**
   - User uploads and formats data
   - Data is stored in browser's sessionStorage

2. **Data Bridge Intervention**
   - Bridge extracts data from sessionStorage 
   - Data is sent to server via API call to `/api/send-to-tool`

3. **Server Processing**
   - Data connector processes and transforms the data
   - Stores in Flask session with standardized fields

4. **Response Time Analyzer**
   - Retrieves data from Flask session
   - Displays properly formatted data in dashboard

## Usage Instructions

### Method 1: Transfer Button

1. Go to http://127.0.0.1:5006/data-formatter
2. Upload and format your data as usual
3. Click the green "Transfer Data (Server)" button in the bottom-right
4. You'll be redirected to the Response Time Analyzer with your data

### Method 2: Standard Workflow

1. Go to http://127.0.0.1:5006/data-formatter
2. Upload and format your data
3. Click the standard "Send to Tool" button
4. The data bridge will intercept this action and send data to the server
5. You'll be redirected to the Response Time Analyzer with your data

## Troubleshooting

### If data doesn't appear in the dashboard:

1. **Check Browser Console**
   - Look for messages prefixed with 🔄
   - Verify that data was extracted and sent successfully

2. **Check Server Logs**
   - Verify that `/api/send-to-tool` was called
   - Check for any warnings about data format or processing

3. **Check Data Format**
   - Ensure uploaded data has expected fields (like "Incident ID", "Incident Date")
   - Verify data is properly transformed in the formatter

4. **Fallback Method**
   - Use the blue "Go to Analyzer (Direct)" button
   - This skips the server storage but maintains browser sessionStorage

5. **Map Not Displaying Locations**
   - Check server logs for "Valid coordinates found" messages
   - Ensure coordinate fields are properly named (Latitude/Longitude)
   - Verify coordinate values are in decimal format (e.g., 37.7749, -122.4194)
   - Open browser console and look for warnings about missing coordinates

## Technical Architecture

```
┌────────────────────┐      ┌────────────────────┐
│                    │      │                    │
│   Data Formatter   │      │  Response Time     │
│   (React App)      │      │  Dashboard         │
│                    │      │                    │
└────────┬───────────┘      └────────┬───────────┘
         │                           │
         │                           │
┌────────▼───────────┐      ┌────────▼───────────┐
│                    │      │                    │
│  Browser Storage   │      │  Data Adapter      │
│  (sessionStorage)  │      │  (schema.js)       │
│                    │      │                    │
└────────┬───────────┘      └────────┬───────────┘
         │                           │
         │                           │
┌────────▼───────────┐      ┌────────▼───────────┐
│                    │      │                    │
│  Data Bridge       │◄─────┤  Flask Session     │
│  (data-bridge.js)  │      │  (server-side)     │
│                    │      │                    │
└────────┬───────────┘      └────────▲───────────┘
         │                           │
         │                           │
┌────────▼───────────┐      ┌────────┴───────────┐
│                    │      │                    │
│  API Endpoint      │─────►│  Data Connector    │
│  (/api/send-to-tool)│      │  (data_connector.py)│
│                    │      │                    │
└────────────────────┘      └────────────────────┘
```

## Maintenance Notes

When making changes to the system, keep in mind:

1. **Data Format Consistency**
   - Maintain the field mapping schema in `data_connector.py`
   - Add new field mappings as needed for new data sources
   - Ensure coordinates are properly mapped and formatted as nested objects:
     ```python
     transformed['coordinates'] = {
         'lat': float(latitude),
         'lng': float(longitude)
     }
     ```

2. **Coordinate Handling**
   - The system now parses and validates coordinates from various formats
   - Latitude values must be between -90 and 90
   - Longitude values must be between -180 and 180
   - Coordinates are stored as a nested object with `lat` and `lng` properties

3. **Session Management**
   - The Flask session is configured to persist for 24 hours
   - Files are stored in the filesystem session backend

4. **Script Dependencies**
   - `data-bridge.js` must be loaded after the Data Formatter's main scripts
   - Both tools need access to schema definitions for consistent mapping

5. **Testing Process**
   - Always test with various date formats (MM/DD/YYYY, YYYY-MM-DD, etc.)
   - Test with different field naming conventions
   - Verify coordinate mapping with different formats (decimal degrees, degrees/minutes/seconds)
   - Test both latitude/longitude pairs and coordinates entered in other formats
   - Check map rendering in the Response Time Analyzer to verify coordinates are correctly displayed
   - Verify both the API and direct transfer methods work properly