# FireEMS Emergency Mode Testing Guide

This document provides step-by-step instructions for testing the emergency mode functionality in the FireEMS.ai platform. The implementation resolves critical issues with Chart.js canvas reuse and improves the reliability of emergency data transfer between tools.

## Starting the Server

Run the following command in your terminal:

```bash
cd /Users/josephhester/Documents/fire-ems-tools
./run_server.sh
```

This will start the server on port 5010. You can then access the application at:

- Main URL: http://localhost:5010
- Emergency Test Page: http://localhost:5010/emergency-test
- Data Formatter: http://localhost:5010/data-formatter
- Response Time Analyzer: http://localhost:5010/fire-ems-dashboard

## What's Been Fixed

1. **Chart.js Canvas Reuse Errors**
   - Problem: Charts would fail to render in emergency mode with "Canvas is already in use" errors
   - Solution: Implemented a ChartManager service that handles canvas regeneration, cleanup, and lifecycle management

2. **Emergency Data Transfer**
   - Problem: Data was not being properly serialized when transferred between tools in emergency mode
   - Solution: Improved serialization and URL construction, with multiple fallback mechanisms

## Test Case 1: Emergency Test Page

1. Navigate to http://localhost:5010/emergency-test
2. The page should load with an "Emergency Data Transfer Test" control panel
3. Adjust the test data size if needed (default: 20 records)
4. Click "Test Data Storage" to verify localStorage functionality
   - This should show success messages in the log area
5. Click "Test Data Transfer" to send test data to the Response Time Analyzer
   - You will be redirected to the Response Time Analyzer
   - An emergency data notification should appear at the top
   - Click "Load Data" to process the data
   - Verify that charts render correctly without Canvas errors

**Expected Result**: Data is successfully transferred and charts render without errors.

## Test Case 2: Data Formatter Emergency Send

1. Navigate to http://localhost:5010/data-formatter
2. Scroll down to find the orange "Emergency Data Transfer Test" panel
   - If not visible, check that the data-formatter-emergency-test.js script loaded correctly
3. Click "Test Emergency Send" to test sending data to Response Time Analyzer
4. After the redirect, verify that:
   - An emergency data notification appears
   - Charts render correctly when you click "Load Data"
   - No "Canvas is already in use" errors appear in the console

**Expected Result**: Data is successfully transferred and charts render without errors.

## Test Case 3: Verify Canvas Regeneration

1. In the browser console, enter: `FireEMS.ChartManager.create('test-chart', 'bar', {labels: ['A', 'B'], datasets: [{data: [1, 2]}]}, {})` 
2. Then try to create another chart with the same ID:
   `FireEMS.ChartManager.create('test-chart', 'line', {labels: ['X', 'Y'], datasets: [{data: [3, 4]}]}, {})`
3. No errors should occur, as the ChartManager handles canvas regeneration

**Expected Result**: Both chart creation calls succeed without errors.

## Technical Implementation Details

### ChartManager Service (`static/js/chart-manager.js`)

The ChartManager service provides several key functions:

1. **Canvas Regeneration**:
   ```javascript
   // Create a fresh canvas to prevent reuse issues
   const parent = canvas.parentNode;
   const newCanvas = document.createElement('canvas');
   newCanvas.id = id;
   // Copy attributes and replace old canvas
   parent.replaceChild(newCanvas, canvas);
   ```

2. **Deep Copy of Chart Data**:
   ```javascript
   new Chart(canvas, {
     type: type,
     data: JSON.parse(JSON.stringify(data)), // Deep copy to prevent reference issues
     options: options
   })
   ```

3. **Robust Cleanup**:
   ```javascript
   function destroyChart(id) {
     if (_charts[id] && _charts[id].instance) {
       _charts[id].instance.destroy();
       delete _charts[id];
       
       // Force cleanup of canvas
       const canvas = document.getElementById(id);
       if (canvas && canvas.getContext) {
         canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
       }
     }
   }
   ```

### Emergency Data Transfer (`static/js/emergency-mode.js`)

The emergency data transfer functionality includes:

1. **Proper Data Serialization**:
   ```javascript
   const serializedData = JSON.stringify({
     data: data,
     metadata: {
       created: Date.now(),
       expires: Date.now() + opts.expiration,
       source: window.location.pathname
     }
   });
   localStorage.setItem(dataId, serializedData);
   ```

2. **Correct URL Construction**:
   ```javascript
   const targetUrl = `/${targetRoute}?emergency_data=${dataId}`;
   window.location.href = targetUrl;
   ```

3. **Multiple Retrieval Methods**:
   - Using FireEMS.StateService if available
   - Falling back to emergency-mode.js library
   - Direct localStorage as a last resort

## Troubleshooting

If you encounter issues:

1. **Check Browser Console** for any errors
2. **Verify localStorage** is working in your browser
3. **Clear localStorage** if there might be corrupted data:
   - In the console: `localStorage.clear()`
4. **Restart the server** if needed

## Next Steps

Further improvements to consider:

1. Implement additional test coverage for all tools
2. Add performance optimization for large datasets in emergency mode
3. Create a monitoring dashboard for emergency mode events
4. Add telemetry for chart creation/destruction events