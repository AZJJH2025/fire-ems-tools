# Emergency Mode "Send to Tool" Fixes

This document outlines the fixes implemented to resolve the 404 error occurring when using the "Send to Tool" functionality in emergency mode.

## Problem Description

When using the "Send to Tool" functionality in emergency mode (specifically when sending data from the Data Formatter to the Response Time Analyzer), users would encounter a 404 error. This occurred because:

1. The URL construction was not using an absolute path with the proper origin
2. The emergency data ID in the URL wasn't properly encoded
3. There was insufficient error handling and fallback mechanisms
4. The tool mapping was incomplete and didn't handle all variations
5. There was no cache-busting mechanism to prevent cached responses
6. The system lacked robust data retrieval strategies when retrieving the emergency data

## Implemented Fixes

### 1. Improved URL Construction in `emergency-mode.js`

- Added proper URL construction using `window.location.origin` to ensure absolute paths
- Added timestamp parameter for cache busting
- Improved encoding of the data ID parameter
- Enhanced error handling with a direct fallback navigation attempt

```javascript
// CRITICAL FIX: Uses window.location.origin to ensure absolute path
const origin = window.location.origin || '';
const queryParam = encodeURIComponent(dataId);
const targetUrl = `${origin}/${targetRoute}?emergency_data=${queryParam}&t=${timestamp}`;
```

### 2. Enhanced Tool Name Normalization and Mapping

- Added more comprehensive tool name normalization to handle various formats
- Expanded the mapping of tool IDs to routes with many more variations
- Added special handling of underscore/hyphen variations
- Improved fallback to original value if no mapping is found

```javascript
// Normalize underscore variations too (handle both - and _)
Object.keys(toolRouteMap).forEach(key => {
  const underscoreKey = key.replace(/-/g, '_');
  if (!toolRouteMap[underscoreKey]) {
    toolRouteMap[underscoreKey] = toolRouteMap[key];
  }
});
```

### 3. Multiple Data Storage Methods

- Implemented triple redundant storage using both localStorage and sessionStorage
- Added backup copies with standard keys for retrieval if the main key fails
- Added detailed diagnostic information storage for troubleshooting
- Enhanced error handling during storage operations

```javascript
// Store a backup copy of the data with a standard key as well
const backupDataId = 'emergency_data_latest';
const serializedBackup = localStorage.getItem(dataId);

if (serializedBackup) {
  localStorage.setItem(backupDataId, serializedBackup);
  sessionStorage.setItem(backupDataId, serializedBackup);
  log(`Created backup copies with key: ${backupDataId}`, 'info');
}
```

### 4. Improved Data Retrieval Strategies

- Implemented a sequence of data retrieval strategies for maximum resilience
- Added 6 different methods to attempt data retrieval from various sources
- Enhanced error handling and diagnostics for each retrieval strategy
- Added detailed logging for troubleshooting in production

```javascript
// Try each strategy in sequence until one returns data
let data = null;
let dataSource = '';

for (let i = 0; i < retrievalStrategies.length; i++) {
  data = retrievalStrategies[i]();
  if (data) {
    dataSource = `Strategy ${i+1}`;
    break;
  }
}
```

### 5. Updated fireems-framework.js URL Construction

- Synchronized the URL construction method in fireems-framework.js with emergency-mode.js
- Added parameter encoding and timestamp for cache busting
- Added backup data storage methods for redundancy
- Enhanced error handling for navigation failures

```javascript
// Generate timestamp for cache busting
const timestamp = Date.now();
window.location.href = `${origin}/${targetRoute}?emergency_data=${encodeURIComponent(dataId)}&t=${timestamp}`;
```

## Testing

To test these fixes:

1. Run the server with `./run_server.sh`
2. Navigate to http://localhost:5010/data-formatter
3. Use the "Test Emergency Send" button to verify direct functionality
4. Use the normal "Send to Tool" button with the Response Time Analyzer selected
5. Check browser console logs for detailed diagnostic information

## Ongoing Improvements

Future improvements to consider:

1. Add automated tests for emergency mode functionality
2. Implement monitoring for emergency mode activations in production
3. Add telemetry to track emergency mode usage patterns
4. Create a dedicated emergency mode dashboard for administrators

## Conclusion

These changes provide a highly robust solution for emergency data transfer between tools. By implementing multiple layers of redundancy, comprehensive error handling, and detailed diagnostics, the system should now reliably transfer data even under challenging conditions.