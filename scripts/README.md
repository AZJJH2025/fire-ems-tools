# Phoenix Fire Department Data Generator

This directory contains scripts to generate realistic Phoenix Fire Department incident data in Motorola PremierOne CAD format.

## Available Scripts

### `generate_phoenix_data_node.js`

A Node.js script that generates a large dataset (default: 5000 incidents) of Phoenix Fire Department incidents with realistic:

- Incident numbers in PFD-YYYYMMDD-XXXX format
- Timestamps for call received, dispatch, and arrival times
- Response times based on district and time of day
- Phoenix locations and districts
- Unit status progressions (D→ER→OS→AQ/AH)

#### Usage:

```bash
# Generate default 5000 incidents
node generate_phoenix_data_node.js

# Generate a custom number of incidents
node generate_phoenix_data_node.js 1000
```

The script will create a CSV file at `../data/incidents/phoenix_motorola_cad_incidents.csv`.

### `generate_phoenix_data.js`

A browser-compatible version of the generator for use in the web console. This can be used to preview how the data would look before generating a full dataset.

## Data Format

The generated data follows the Motorola PremierOne CAD format with the following fields:

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

## Unit Status Codes

- `D`: Dispatched
- `ER`: En Route
- `OS`: On Scene
- `AH`: At Hospital (rescue units only)
- `AQ`: Available in Quarters

## Incident Type Distribution

The generator creates a realistic distribution of incident types based on typical urban fire department patterns:

- Medical calls (60-70%)
- Service calls (10-15%)
- Fire alarms (5-10%)
- Vehicle accidents (10-15%)
- Structure fires (2-5%)
- Hazardous materials calls (1-2%)

## Geographic Distribution

Incidents are distributed across Phoenix's 8 fire districts with realistic street addresses and coordinates.