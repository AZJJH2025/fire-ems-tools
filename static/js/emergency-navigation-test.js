/**
 * Emergency Navigation Test Script
 * 
 * This script helps verify the URL construction fixes for emergency mode
 * navigation between tools. Run this on any page to test the URL construction
 * without actually navigating away.
 */

(function() {
  console.log("🧪 Emergency Navigation Test - URL Construction Validator");
  
  // Create test UI on document ready
  document.addEventListener('DOMContentLoaded', function() {
    createTestUI();
  });
  
  // Create and inject test UI into the page
  function createTestUI() {
    const testPanel = document.createElement('div');
    testPanel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 9999;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    testPanel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; font-size: 16px;">🧪 Emergency URL Construction Test</h3>
        <button id="close-test-panel" style="background: none; border: none; cursor: pointer; font-size: 16px;">×</button>
      </div>
      
      <p style="margin: 0 0 10px; font-size: 13px; color: #666;">
        Test the URL construction for emergency mode navigation between tools.
      </p>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-size: 14px; font-weight: bold;">Target Tool:</label>
        <select id="test-target-tool" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ced4da;">
          <option value="fire-ems-dashboard">Response Time Analyzer</option>
          <option value="call-density-heatmap">Call Density Heatmap</option>
          <option value="isochrone-map">Isochrone Map</option>
          <option value="incident-logger">Incident Logger</option>
          <option value="/fire-ems-dashboard">Response Time (with leading slash)</option>
          <option value="//fire-ems-dashboard">Response Time (with double slash)</option>
        </select>
      </div>
      
      <div style="margin-bottom: 15px;">
        <button id="test-emergency-mode" class="test-btn" style="background: #fd7e14; color: white; border: none; padding: 8px 12px; border-radius: 4px; margin-right: 10px; cursor: pointer;">
          Test EmergencyMode
        </button>
        
        <button id="test-framework" class="test-btn" style="background: #20c997; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
          Test Framework
        </button>
      </div>
      
      <div id="test-results" style="margin-top: 15px; padding: 10px; background: #f1f3f5; border-radius: 4px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto;">
        Results will appear here...
      </div>
    `;
    
    document.body.appendChild(testPanel);
    
    // Add event listeners
    document.getElementById('close-test-panel').addEventListener('click', function() {
      testPanel.remove();
    });
    
    document.getElementById('test-emergency-mode').addEventListener('click', function() {
      testEmergencyMode();
    });
    
    document.getElementById('test-framework').addEventListener('click', function() {
      testFramework();
    });
  }
  
  // Test EmergencyMode URL construction
  function testEmergencyMode() {
    const resultsEl = document.getElementById('test-results');
    const targetTool = document.getElementById('test-target-tool').value;
    
    resultsEl.innerHTML = '<div style="color: #fd7e14; font-weight: bold;">Testing EmergencyMode.sendToTool()...</div>';
    
    try {
      // Mock the EmergencyMode's sendToTool function
      const testData = { test: true, timestamp: Date.now() };
      const dataId = 'emergency_data_test_' + Date.now();
      const timestamp = Date.now();
      
      // Build URL the exact same way as emergency-mode.js sendToTool function
      const origin = window.location.origin || '';
      
      // Normalization process from emergency-mode.js
      const normalizedTargetTool = (targetTool || '')
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Tool route mapping (simplified for test)
      const toolRouteMap = {
        'response-time': 'fire-ems-dashboard',
        'response-time-analyzer': 'fire-ems-dashboard',
        'fire-ems-dashboard': 'fire-ems-dashboard',
        'call-density': 'call-density-heatmap',
        'call-density-heatmap': 'call-density-heatmap',
        'isochrone': 'isochrone-map',
        'isochrone-map': 'isochrone-map',
        'incident-logger': 'incident-logger'
      };
      
      const targetRoute = toolRouteMap[targetTool] || 
                       toolRouteMap[normalizedTargetTool] || 
                       targetTool;
      
      // Remove leading slashes as per the fixed version
      const normalizedRoute = targetRoute.replace(/^\/+/, '');
      
      // Create the URL as per the fixed version
      const targetUrl = `${origin}/${normalizedRoute}?emergency_data=${encodeURIComponent(dataId)}&t=${timestamp}&source=emergency_mode`;
      
      // Display results
      resultsEl.innerHTML += `
        <div style="margin-top: 10px; border-left: 3px solid #fd7e14; padding-left: 10px;">
          <div><strong>Original:</strong> ${targetTool}</div>
          <div><strong>Normalized:</strong> ${normalizedTargetTool}</div>
          <div><strong>Mapped:</strong> ${targetRoute}</div>
          <div><strong>Final path:</strong> ${normalizedRoute}</div>
          <div style="margin-top: 10px; word-break: break-all;"><strong>URL:</strong> ${targetUrl}</div>
        </div>
      `;
      
      // Validate URL
      const urlObj = new URL(targetUrl);
      let validationResults = '<div style="margin-top: 10px; color: green;">✓ URL is valid</div>';
      
      // Additional checks
      if (urlObj.pathname.includes('//')) {
        validationResults = '<div style="margin-top: 10px; color: red;">✗ URL contains double slashes in path</div>';
      }
      
      resultsEl.innerHTML += validationResults;
      
    } catch (error) {
      resultsEl.innerHTML += `
        <div style="margin-top: 10px; color: red;">
          Error: ${error.message}
        </div>
      `;
    }
  }
  
  // Test Framework URL construction
  function testFramework() {
    const resultsEl = document.getElementById('test-results');
    const targetTool = document.getElementById('test-target-tool').value;
    
    resultsEl.innerHTML = '<div style="color: #20c997; font-weight: bold;">Testing Framework navigation...</div>';
    
    try {
      // Mock the Framework's URL construction
      const dataId = 'emergency_data_test_' + Date.now();
      const timestamp = Date.now();
      
      // Mapping as per framework.js
      const toolRouteMap = {
        'response-time': 'fire-ems-dashboard',
        'response-time-analyzer': 'fire-ems-dashboard',
        'fire-ems-dashboard': 'fire-ems-dashboard',
        'call-density': 'call-density-heatmap',
        'call-density-heatmap': 'call-density-heatmap',
        'isochrone': 'isochrone-map',
        'isochrone-map': 'isochrone-map',
        'incident-logger': 'incident-logger'
      };
      
      const targetRoute = toolRouteMap[targetTool] || targetTool;
      const origin = window.location.origin || '';
      
      // Use the normalized route per fixed version
      const normalizedRoute = targetRoute.replace(/^\/+/, '');
      
      // Build URL as per fixed version
      const fullUrl = `${origin}/${normalizedRoute}?emergency_data=${encodeURIComponent(dataId)}&t=${timestamp}&source=framework`;
      
      // Display results
      resultsEl.innerHTML += `
        <div style="margin-top: 10px; border-left: 3px solid #20c997; padding-left: 10px;">
          <div><strong>Original:</strong> ${targetTool}</div>
          <div><strong>Mapped:</strong> ${targetRoute}</div>
          <div><strong>Final path:</strong> ${normalizedRoute}</div>
          <div style="margin-top: 10px; word-break: break-all;"><strong>URL:</strong> ${fullUrl}</div>
        </div>
      `;
      
      // Validate URL
      const urlObj = new URL(fullUrl);
      let validationResults = '<div style="margin-top: 10px; color: green;">✓ URL is valid</div>';
      
      // Additional checks
      if (urlObj.pathname.includes('//')) {
        validationResults = '<div style="margin-top: 10px; color: red;">✗ URL contains double slashes in path</div>';
      }
      
      resultsEl.innerHTML += validationResults;
      
    } catch (error) {
      resultsEl.innerHTML += `
        <div style="margin-top: 10px; color: red;">
          Error: ${error.message}
        </div>
      `;
    }
  }
})();