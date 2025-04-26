# Phoenix Fire Department Test Dataset

## Overview

This guide provides information about the Phoenix Fire Department test dataset created for use with the Data Formatter tool. The dataset simulates realistic fire and EMS incident data in Motorola PremierOne CAD format, specifically designed to test the enhanced CAD system detection and processing capabilities.

## Dataset Details

- **Format**: Motorola PremierOne CAD
- **Records**: 5,000 incidents (approximately 42,500 unit status records)
- **Time Period**: Feb 28, 2025 - Mar 30, 2025 (30 days)
- **Geographic Coverage**: Phoenix, AZ (8 fire districts)
- **File Size**: Approximately 8 MB

## Data Format

The dataset follows the standard Motorola PremierOne CAD format with these fields:

- `INCIDENT_NO`: Unique incident identifier in PFD-YYYYMMDD-XXXX format
- `CALL_RECEIVED_DATE`: Date the call was received (YYYY-MM-DD)
- `CALL_RECEIVED_TIME`: Time the call was received (HH:MM:SS)
- `DISPATCH_DATE`: Date units were dispatched (YYYY-MM-DD)
- `DISPATCH_TIME`: Time units were dispatched (HH:MM:SS)
- `ARRIVAL_DATE`: Date of first unit arrival (YYYY-MM-DD)
- `ARRIVAL_TIME`: Time of first unit arrival (HH:MM:SS)
- `INCIDENT_TYPE_CD`: Incident type code (e.g., 321, 100)
- `INCIDENT_TYPE_DESC`: Incident type description (e.g., EMS-DIFFICULTY BREATHING)
- `PRIORITY_CD`: Priority code (1-3, with 1 being highest)
- `LOCATION_ADDR`: Incident address
- `LOCATION_CITY`: City (Phoenix)
- `LOCATION_ST`: State (AZ)
- `LAT`: Latitude
- `LON`: Longitude
- `UNIT_ID`: Unit identifier (e.g., E9, R11, BC1)
- `UNIT_STATUS_CD`: Unit status code (D, ER, OS, AH, AQ)
- `STATUS_DTTM`: Date and time of status change (YYYY-MM-DD HH:MM:SS)
- `DISPOSITION_CD`: Disposition code (CMP)
- `DISPOSITION_DESC`: Disposition description (Completed)
- `DISTRICT_CD`: Phoenix fire district (1-8)
- `CALL_TAKER_ID`: Call taker identifier
- `RESPONSE_TIME_SEC`: Response time in seconds

## Dataset Features

### 1. Realistic Incident Distribution

The dataset models real-world emergency service patterns:
- **Medical Incidents**: ~65% of calls (breathing problems, chest pain, falls, etc.)
- **Fire Incidents**: ~15% of calls (structure, brush, vehicle fires)
- **Service Calls**: ~8% of calls
- **Vehicle Accidents**: ~10% of calls
- **Special Incidents**: ~2% (hazmat, etc.)

### 2. Geographic Distribution

Incidents are distributed across Phoenix's 8 fire districts with:
- Realistic coordinates within each district's boundaries
- Actual Phoenix street addresses
- Proper district assignment of responding units

### 3. Unit Status Progression

Each incident includes complete unit status progressions:
- **D** (Dispatched) → **ER** (En Route) → **OS** (On Scene) → **AQ** (Available in Quarters)
- Rescue units may include **AH** (At Hospital) status before returning to quarters

### 4. Realistic Response Patterns

- Multiple units responding based on incident type (e.g., engine + rescue for EMS, multiple engines + ladder + BC for structure fires)
- Unit types appropriate to incident (e.g., HM units for hazmat)
- Response times vary based on:
  - District (outer districts have longer response times)
  - Time of day (rush hour delays)
  - Unit type (first-arriving vs. supporting units)

### 5. Timestamp Patterns

- Realistic time progression (call → dispatch → en route → on scene → available)
- Time intervals based on real-world expectations:
  - 45-75 seconds from call to dispatch
  - 30-60 seconds from dispatch to en route
  - 3-6 minutes from en route to on scene (varies by district)
  - 20-60 minutes on scene before available
  - 15-30 minutes at hospital for transporting units

## How to Use This Dataset

### With the Data Formatter Tool

1. Open the Data Formatter tool in FireEMS.ai
2. Select "Upload File" and choose `phoenix_motorola_cad_incidents.csv`
3. Select "Auto-detect" for input format
4. Choose your target tool (Response Time Analyzer, Call Density, etc.)
5. Click "Transform Data"
6. Verify the CAD system is correctly identified as Motorola PremierOne
7. Check that all required fields are properly mapped

### Regenerating or Customizing the Dataset

If you need to regenerate or customize the dataset:

1. Navigate to the scripts directory: `cd /Users/josephhester/Documents/fire-ems-tools/scripts`
2. Run the generator with a specific number of incidents: `node generate_phoenix_data_node.js 1000`
3. To modify parameters (date range, incident types, etc.), edit the variables at the top of the script.

## Field Mapping Validation

When using this dataset with the enhanced Data Formatter, the following field mappings should be detected:

- `INCIDENT_NO` → Incident ID
- `CALL_RECEIVED_DATE` + `CALL_RECEIVED_TIME` → Call Received Time
- `DISPATCH_DATE` + `DISPATCH_TIME` → Dispatch Time
- `ARRIVAL_DATE` + `ARRIVAL_TIME` → Arrival Time
- `INCIDENT_TYPE_CD` → Incident Type Code
- `INCIDENT_TYPE_DESC` → Incident Type Description
- `LOCATION_ADDR` → Address
- `LAT` → Latitude
- `LON` → Longitude
- `UNIT_ID` → Unit ID
- `UNIT_STATUS_CD` → Unit Status
- `STATUS_DTTM` → Status Timestamp
- `DISTRICT_CD` → District

## Conclusion

This dataset provides a comprehensive test case for the enhanced Data Formatter's ability to detect and process Motorola PremierOne CAD data. It contains all essential fields and patterns that would be found in real-world data from this system, allowing for thorough testing of the CAD system detection, field mapping, and transformation functions.

The dataset's realistic incident patterns, unit status progressions, and geographic distribution also make it valuable for testing other FireEMS.ai tools after transformation.