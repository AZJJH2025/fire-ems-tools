# ImageTrend Data Format Integration Testing Guide

This guide explains how to test the ImageTrend Fire Records Management System integration with the FireEMS.ai Data Formatter tool.

## Background

The Data Formatter tool has been updated to automatically detect and process data from ImageTrend's Fire Records Management System. This enhancement includes field mapping for:

- Response Time Analyzer
- Call Density Heatmap 
- Incident Logger
- Isochrone Map tools

## Test Data

A sample ImageTrend dataset is available at:
```
/data/incidents/imagetrend_incidents.csv
```

This file contains 30 sample incident records with all the typical fields found in an ImageTrend export.

## Testing the Data Formatter Integration

### Method 1: Manual Testing

1. Navigate to the Data Formatter tool at `/data-formatter`
2. Upload the `imagetrend_incidents.csv` file
3. Select one of the following target tools:
   - Response Time Analyzer
   - Call Density Heatmap
   - Incident Logger
4. Click "Transform Data"
5. Verify that the data is properly transformed according to the specific needs of the selected tool
6. Try the "Send to Tool" button to confirm that data transfers properly using sessionStorage

### Method 2: Automated Test Script

A JavaScript test script has been created to verify the ImageTrend integration:
```
/test_imagetrend_data_formatter.js
```

To run the automated tests:

1. Navigate to the Data Formatter tool at `/data-formatter`
2. Open the browser developer console (F12 or right-click → Inspect → Console)
3. Copy and paste the entire content of `test_imagetrend_data_formatter.js` into the console
4. Press Enter to run the tests
5. Review the test results to verify that:
   - The ImageTrend format is correctly detected
   - Field mappings are working for all supported tools
   - Latitude/Longitude values are properly converted to numeric values

## Key Fields and Mappings

The integration focuses on mapping the following ImageTrend fields to standardized fields:

### For Response Time Analyzer

| ImageTrend Field | Mapped To |
|------------------|-----------|
| IncidentPK | Incident ID, Run No |
| IncidentDate | Incident Date |
| IncidentTime | Incident Time, Reported |
| DispatchTime | Unit Dispatched |
| EnRouteTime | Unit Enroute |
| ArriveTime | Unit Onscene |
| Latitude/Longitude | Latitude/Longitude |
| IncidentTypeCode | Incident Type |
| NatureOfCall | Nature |
| VehicleID | Unit |
| StationID | Station |

### For Call Density Heatmap

| ImageTrend Field | Mapped To |
|------------------|-----------|
| IncidentPK | Incident ID |
| IncidentDate | Incident Date |
| IncidentTime | Incident Time |
| Latitude/Longitude | Latitude/Longitude |
| IncidentTypeCode | Incident Type |

### For Incident Logger

| ImageTrend Field | Mapped To |
|------------------|-----------|
| IncidentPK | Incident ID |
| IncidentDate | Incident Date |
| IncidentTime | Incident Time |
| IncidentTypeCode | Incident Type |
| StreetAddress | Address |
| VehicleID | Unit ID |
| PatientCount/Age/Gender | Patient Info (composite) |
| ActionsTaken + Related Fields | Notes (composite) |

## Testing SessionStorage Integration

The Data Formatter now uses sessionStorage instead of localStorage to pass transformed data to other tools. To verify this integration:

1. Upload the ImageTrend test data
2. Transform it for the Response Time Analyzer
3. Click "Send to Tool"
4. Verify that you are redirected to the Response Time Analyzer
5. Confirm that the data appears correctly in the Response Time Analyzer's visualizations

## Issues and Troubleshooting

If you encounter issues during testing, check the following:

1. Browser console for JavaScript errors
2. Verify that sessionStorage is not disabled in the browser
3. Check for mapping issues in the field mapping tables above
4. Verify that the test data contains all expected fields

Please report any issues or discrepancies with specific details about the error encountered and steps to reproduce.