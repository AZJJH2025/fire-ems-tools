/**
 * Emergency Data Transfer Test Script
 * 
 * This script tests the emergency data transfer functionality of the FireEMS framework
 * with a focus on the Chart.js canvas reuse fix and improved data serialization.
 */

(function() {
  // Configuration
  const config = {
    testDataSize: 20, // Number of test records to create
    targetTool: 'fire-ems-dashboard', // Default target tool
    logElementId: 'test-log', // Element to log to (will be created if doesn't exist)
    debug: true
  };
  
  // Logging utility
  function log(message, type = 'info') {
    if (config.debug) {
      console.log(`[Emergency Test] ${message}`);
    }
    
    // Try to log to UI element if available
    const logElement = document.getElementById(config.logElementId);
    if (logElement) {
      const entry = document.createElement('div');
      entry.className = `log-entry log-${type}`;
      entry.innerHTML = `<span class="timestamp">${new Date().toLocaleTimeString()}</span> ${message}`;
      logElement.appendChild(entry);
      
      // Auto-scroll to bottom
      logElement.scrollTop = logElement.scrollHeight;
    }
  }
  
  // Create test data
  function createTestData(size = config.testDataSize) {
    log(`Generating ${size} test records...`);
    
    const testData = [];
    const now = new Date();
    
    for (let i = 1; i <= size; i++) {
      // Random date within the last 30 days
      const randomDate = new Date(now);
      randomDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
      
      // Random time
      const hours = Math.floor(Math.random() * 24);
      const minutes = Math.floor(Math.random() * 60);
      
      testData.push({
        incident_id: `TEST-${i.toString().padStart(4, '0')}`,
        incident_date: randomDate.toISOString().split('T')[0],
        incident_time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        Unit: `Engine-${Math.floor(Math.random() * 10) + 1}`,
        'Unit Dispatched': `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        'Unit Enroute': `${hours.toString().padStart(2, '0')}:${(minutes + 2).toString().padStart(2, '0')}`,
        'Unit Onscene': `${hours.toString().padStart(2, '0')}:${(minutes + 6).toString().padStart(2, '0')}`,
        latitude: (Math.random() * 10 + 35).toFixed(6),
        longitude: (Math.random() * 10 - 80).toFixed(6),
        'Incident City': ['Springfield', 'Lakeside', 'Rivertown', 'Hillcrest', 'Oakdale'][Math.floor(Math.random() * 5)],
        'Incident Type': ['Fire', 'Medical', 'HazMat', 'Rescue', 'Other'][Math.floor(Math.random() * 5)],
        priority: Math.floor(Math.random() * 3) + 1,
        'Response Time (min)': Math.floor(Math.random() * 15) + 2,
        Reported: randomDate.toLocaleString()
      });
    }
    
    log(`Generated ${testData.length} test records`);
    return testData;
  }
  
  // Store emergency data using different methods
  function storeEmergencyData(data) {
    log('Testing data storage...');
    
    try {
      // Method 1: Use FireEMS.EmergencyMode if available
      if (window.FireEMS && window.FireEMS.EmergencyMode) {
        log('Using FireEMS.EmergencyMode.storeData');
        const dataId = window.FireEMS.EmergencyMode.storeData(data, {
          expiration: 1 * 60 * 60 * 1000 // 1 hour
        });
        
        if (dataId) {
          log(`Successfully stored data using EmergencyMode: ${dataId}`, 'success');
          return dataId;
        } else {
          log('Failed to store data using EmergencyMode, trying fallback', 'warning');
        }
      } else {
        log('FireEMS.EmergencyMode not available, trying fallback', 'warning');
      }
      
      // Method 2: Use localStorage directly as fallback
      const dataId = 'emergency_data_test_' + Date.now();
      const serializedData = JSON.stringify({
        data: data,
        metadata: {
          created: Date.now(),
          source: 'emergency-data-test.js',
          recordCount: data.length
        }
      });
      
      localStorage.setItem(dataId, serializedData);
      log(`Successfully stored data directly in localStorage: ${dataId}`, 'success');
      return dataId;
      
    } catch (error) {
      log(`Error storing emergency data: ${error.message}`, 'error');
      return null;
    }
  }
  
  // Test sending data to another tool
  function testSendToTool(data, targetTool = config.targetTool) {
    log(`Testing send to tool: ${targetTool}...`);
    
    try {
      if (window.FireEMS && window.FireEMS.EmergencyMode && window.FireEMS.EmergencyMode.sendToTool) {
        // Use framework method if available
        log('Using FireEMS.EmergencyMode.sendToTool');
        const success = window.FireEMS.EmergencyMode.sendToTool(data, targetTool);
        
        if (success) {
          log(`Successfully initiated transfer to ${targetTool}`, 'success');
          return true;
        } else {
          log('Framework method failed, trying direct method', 'warning');
        }
      } else {
        log('FireEMS.EmergencyMode.sendToTool not available, using direct method', 'warning');
      }
      
      // Fallback: Direct method
      const dataId = storeEmergencyData(data);
      if (!dataId) {
        log('Failed to store data for transfer', 'error');
        return false;
      }
      
      // Build target URL
      const targetUrl = `/${targetTool}?emergency_data=${dataId}`;
      log(`Redirecting to: ${targetUrl}`);
      
      // Navigate to target
      window.location.href = targetUrl;
      return true;
      
    } catch (error) {
      log(`Error sending to tool: ${error.message}`, 'error');
      return false;
    }
  }
  
  // Start test
  function runTest() {
    log('Starting emergency data transfer test...', 'info');
    
    // Create UI for test logs if needed
    if (!document.getElementById(config.logElementId)) {
      const logContainer = document.createElement('div');
      logContainer.id = config.logElementId;
      logContainer.className = 'test-log-container';
      logContainer.style.cssText = 'background: #f5f5f5; border: 1px solid #ddd; padding: 10px; margin: 20px 0; height: 300px; overflow-y: auto; font-family: monospace; font-size: 12px;';
      
      // Add to document - try to find a suitable container
      const container = document.querySelector('.container') || document.querySelector('main') || document.body;
      container.appendChild(logContainer);
      
      // Add styles for log entries
      const style = document.createElement('style');
      style.textContent = `
        .log-entry { margin-bottom: 5px; line-height: 1.4; }
        .log-info { color: #333; }
        .log-success { color: green; }
        .log-warning { color: orange; }
        .log-error { color: red; }
        .timestamp { color: #666; margin-right: 8px; }
      `;
      document.head.appendChild(style);
    }
    
    // Generate test data
    const testData = createTestData();
    
    // Create test UI controls
    const controlPanel = document.createElement('div');
    controlPanel.className = 'test-control-panel';
    controlPanel.style.cssText = 'background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;';
    
    controlPanel.innerHTML = `
      <h3>Emergency Data Transfer Test</h3>
      <p>This panel allows you to test the emergency data transfer functionality.</p>
      
      <div style="margin-top: 15px;">
        <label for="data-size">Test Data Size:</label>
        <input type="number" id="data-size" value="${config.testDataSize}" min="1" max="1000" style="width: 80px; margin-right: 15px;">
        
        <label for="target-tool-select">Target Tool:</label>
        <select id="target-tool-select">
          <option value="fire-ems-dashboard" ${config.targetTool === 'fire-ems-dashboard' ? 'selected' : ''}>Response Time Analyzer</option>
          <option value="call-density-heatmap" ${config.targetTool === 'call-density-heatmap' ? 'selected' : ''}>Call Density</option>
          <option value="isochrone-map" ${config.targetTool === 'isochrone-map' ? 'selected' : ''}>Isochrone Map</option>
          <option value="incident-logger" ${config.targetTool === 'incident-logger' ? 'selected' : ''}>Incident Logger</option>
        </select>
      </div>
      
      <div style="margin-top: 15px;">
        <button id="test-storage-btn" style="background-color: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 10px;">
          Test Data Storage
        </button>
        
        <button id="test-transfer-btn" style="background-color: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 10px;">
          Test Data Transfer
        </button>
        
        <button id="clear-log-btn" style="background-color: #f5f5f5; color: #333; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px;">
          Clear Log
        </button>
      </div>
    `;
    
    // Insert control panel before log
    const logElement = document.getElementById(config.logElementId);
    logElement.parentNode.insertBefore(controlPanel, logElement);
    
    // Add event listeners
    document.getElementById('test-storage-btn').addEventListener('click', function() {
      const dataSize = parseInt(document.getElementById('data-size').value, 10) || config.testDataSize;
      const newData = createTestData(dataSize);
      storeEmergencyData(newData);
    });
    
    document.getElementById('test-transfer-btn').addEventListener('click', function() {
      const dataSize = parseInt(document.getElementById('data-size').value, 10) || config.testDataSize;
      const targetTool = document.getElementById('target-tool-select').value;
      const newData = createTestData(dataSize);
      testSendToTool(newData, targetTool);
    });
    
    document.getElementById('clear-log-btn').addEventListener('click', function() {
      const logElement = document.getElementById(config.logElementId);
      logElement.innerHTML = '';
      log('Log cleared');
    });
    
    log('Test UI initialized', 'success');
  }
  
  // Initialize when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTest);
  } else {
    runTest();
  }
})();