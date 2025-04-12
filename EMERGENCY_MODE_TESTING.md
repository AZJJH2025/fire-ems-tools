# Emergency Mode Testing Plan

## Overview

This testing plan outlines a comprehensive approach to verify the fix for the Emergency Mode "Send to Tool" functionality in the FireEMS.ai platform. The primary issue was in the `sendToTool` function of emergency-mode.js where `dataId` was incorrectly used instead of `queryParam` in the URL construction, resulting in 404 errors when transferring from Data Formatter to Response Time Analyzer.

## Test Utilities

We have two test utilities to help verify the fix:

1. **Emergency Data Test Utility** (`/diagnostic/emergency-data-test`): A comprehensive utility for testing all aspects of emergency mode data transfer.
2. **Emergency Mode URL Fix Test** (`/diagnostic/emergency`): A focused utility for specifically testing URL construction.

## Test Scenarios

### 1. Basic URL Construction Tests

**Using the Emergency Mode URL Fix Test utility:**

- Test with each target tool:
  - Response Time Analyzer (fire-ems-dashboard)
  - Call Density Heatmap (call-density-heatmap)
  - Isochrone Map (isochrone-map)
  - Incident Logger (incident-logger)
  
- Test with different URL input formats:
  - Normal tool name (fire-ems-dashboard)
  - Tool name with leading slash (/fire-ems-dashboard)
  - Tool name with double slashes (//fire-ems-dashboard)
  - Tool alias (response-time)

- Verify for each case:
  - URL is constructed correctly
  - No double slashes in the path
  - `emergency_data` parameter contains the correct value
  
### 2. End-to-End Data Transfer Tests

**Using the Emergency Data Test utility:**

- Test sending data from Data Formatter to Response Time Analyzer (fire-ems-dashboard):
  - Generate small test data (10 records)
  - Generate large test data (100+ records)
  - Verify data appears correctly in the target tool
  
- Test with various tool combinations:
  - Data Formatter to Call Density Heatmap
  - Data Formatter to Isochrone Map
  - Data Formatter to Incident Logger
  
- Test corner cases:
  - Data with special characters
  - Data with minimum required fields only
  - Data with all optional fields

### 3. Error Recovery Tests

- Test with invalid data IDs:
  - Manually modify the emergency_data parameter
  - Use an expired data ID
  - Use a data ID that does not exist
  
- Test with localStorage limitations:
  - Create data that approaches browser storage limits
  - Verify graceful handling when limits are exceeded

### 4. Cross-Browser Testing

Test in multiple browsers to ensure consistent behavior:

- Google Chrome (latest)
- Mozilla Firefox (latest)
- Microsoft Edge (latest)
- Safari (latest, if available)

For each browser, verify:
- URL construction works properly
- Data is successfully stored and retrieved
- Error messages are displayed appropriately
- No console errors related to emergency mode functionality

### 5. Edge Case Testing

- Test with network throttling enabled (simulating slow connections)
- Test with cache disabled
- Test with private/incognito mode
- Test emergency mode while regular data loading is in progress

## Test Documentation

For each test scenario, document:

1. The test environment (browser, version)
2. The steps followed
3. Expected result
4. Actual result
5. Any errors or warnings observed
6. Screenshots of the process

## Implementation Verification

To verify the specific fix was properly implemented:

1. Confirm line 480 in emergency-mode.js now uses `queryParam` instead of `dataId`
2. Verify this code is deployed to the environment being tested
3. Check if any log messages in the console indicate the fixed code is being executed

## Final Success Criteria

The emergency mode data transfer is considered fixed when:

1. URLs are correctly constructed with proper parameters in all browsers
2. Data successfully transfers from Data Formatter to all target tools
3. No 404 errors are observed during transfers
4. Storage mechanisms properly retain and retrieve emergency data
5. Proper error messages are shown when issues occur
6. The implementation is resilient against common edge cases

This testing plan will help ensure the emergency mode functionality is robust and reliable across all supported environments.