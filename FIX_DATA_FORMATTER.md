# Data Formatter Bug Fix Implementation Plan

## Issue Description

The Data Formatter tool is failing to properly transform data from various CAD system formats, particularly when:
1. Converting Central Square CAD data for the Response Time Analyzer
2. Stripping away essential fields during the transformation process
3. Not properly extracting coordinates from vendor-specific field names
4. Not handling date/time fields from different formats correctly

## Root Cause Analysis

1. **Limited Field Mapping**: The current field mapping is too narrow and doesn't consider all possible field names across different CAD systems
2. **Incorrect Field Transformation**: Date/time fields in vendor-specific formats aren't being properly extracted or converted
3. **No CAD System Detection**: The tool doesn't detect which CAD system format is being used, leading to incorrect field lookups
4. **Missing Coordinate Handling**: Coordinates need special handling to ensure they're properly converted to numeric values

## Fix Implementation

### Step 1: Replace the `prepareDataForTool` function

Replace the existing function with the enhanced version (provided in `static/data-formatter-fix.js`) that includes:

1. CAD system detection to apply vendor-specific field mappings
2. Expanded field mapping lists for all common CAD systems
3. Special handling for coordinates to ensure they're numeric
4. Improved timestamp processing for different date/time formats
5. Better handling of combined date/time fields (like REPORTED_DT)

### Step 2: Add Helper Functions

Add the helper functions that support the enhanced data preparation:

1. `detectCADSystem`: Analyzes field names to determine which CAD system generated the data
2. `processTimestamps`: Handles various timestamp formats and extracts date/time components

### Step 3: Update Field Mapping Lists

Update the field mapping lists to include the specific field names for:
- Motorola PremierOne CAD
- Tyler Technologies New World CAD
- Hexagon/Intergraph CAD
- Central Square CAD

### Step 4: Test with Sample Data

Test the updated code with sample data from all major CAD systems:
1. `/data/incidents/test_motorola_incidents.csv`
2. `/data/incidents/test_tyler_incidents.csv`
3. `/data/incidents/test_hexagon_incidents.csv`
4. `/data/incidents/test_centralsquare_incidents.csv`

Verify that each file is correctly processed and all required fields are preserved in the transformed data.

### Step 5: Add Debugging and Logging

Add more detailed logging to help diagnose any remaining issues:
1. Log the detected CAD system type
2. Log field mappings as they're applied
3. Log when timestamp fields are extracted and processed

## Implementation Notes

1. The function `standardizeDate` and `standardizeTime` are assumed to exist elsewhere in the code
2. The code includes additional logging statements that should help with future debugging
3. The enhanced field mapping provides fallbacks for when specific fields aren't found

## Testing Approach

Use the `test_data_formatter.js` script to verify all CAD system formats are correctly handled before and after the fix implementation. This script:

1. Loads test data for each CAD system format
2. Detects field mappings
3. Simulates the transformation process
4. Verifies required fields are present after transformation
5. Reports on any missing fields or issues

## Deployment

Once testing confirms the fix works for all CAD systems, update the production code with the enhanced version. Monitor initial usage to ensure no regressions occur with real-world data.