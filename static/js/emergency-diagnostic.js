/**
 * Emergency Mode Diagnostic Tool
 * 
 * This script provides diagnostic information and debugging tools for the
 * emergency mode functionality in the Response Time Analyzer and other tools.
 */

(function() {
  console.log("📊 Emergency Mode Diagnostic - Starting diagnostics...");
  
  // Configuration
  const config = {
    debug: true,
    showUI: true,  // Whether to show the diagnostic UI
    runAutoTests: true, // Whether to run automatic tests
  };
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log("📊 Emergency Mode Diagnostic - DOM loaded");
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const emergencyData = urlParams.get('emergency_data');
    const source = urlParams.get('source');
    const timestamp = urlParams.get('t') || urlParams.get('timestamp');
    
    // DEBUG FIX: Log emergency data format for troubleshooting
    if (emergencyData) {
      console.log("📊 Emergency Mode Diagnostic - emergency_data param:", {
        raw: emergencyData,
        decoded: decodeURIComponent(emergencyData),
        type: typeof emergencyData,
        isArray: Array.isArray(emergencyData),
        isObject: typeof emergencyData === 'object' && emergencyData !== null,
        length: emergencyData.length
      });
    }
    
    // If emergency data is in URL, run diagnostics
    if (emergencyData) {
      collectDiagnostics(emergencyData, source, timestamp);
      
      if (config.showUI) {
        createDiagnosticUI(emergencyData, source, timestamp);
      }
    } else {
      console.log("📊 Emergency Mode Diagnostic - No emergency data in URL");
    }
  });
  
  // Collect diagnostic information
  function collectDiagnostics(dataId, source, timestamp) {
    const diagnostics = {
      url: window.location.href,
      path: window.location.pathname,
      dataId: dataId,
      source: source || 'unknown',
      timestamp: timestamp,
      storage: {
        localStorage: checkStorage('localStorage', dataId),
        sessionStorage: checkStorage('sessionStorage', dataId),
        backupLocalStorage: checkStorage('localStorage', 'emergency_data_latest'),
        backupSessionStorage: checkStorage('sessionStorage', 'emergency_data_latest')
      },
      navigationInfo: getNavigationInfo(),
      userAgent: navigator.userAgent,
      time: new Date().toISOString()
    };
    
    console.log("📊 Emergency Mode Diagnostic - Collected diagnostics:", diagnostics);
    
    // Save for potential submission
    window._emergencyDiagnostics = diagnostics;
    
    return diagnostics;
  }
  
  // Check if data exists in the specified storage
  function checkStorage(storageType, key) {
    try {
      const storage = window[storageType];
      if (!storage) return { available: false, error: "Storage not available" };
      
      const data = storage.getItem(key);
      if (!data) return { available: false, found: false, error: "Key not found" };
      
      try {
        // Try to parse as JSON to validate
        const parsed = JSON.parse(data);
        const size = data.length;
        
        return { 
          available: true, 
          found: true, 
          valid: true, 
          size: size,
          isArray: Array.isArray(parsed),
          itemCount: Array.isArray(parsed) ? parsed.length : 
                     (parsed && typeof parsed === 'object' && parsed.data && Array.isArray(parsed.data)) ? 
                     parsed.data.length : 'not an array'
        };
      } catch (parseError) {
        return { 
          available: true, 
          found: true, 
          valid: false, 
          size: data.length,
          error: "Invalid JSON: " + parseError.message
        };
      }
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
  
  // Get navigation info from sessionStorage
  function getNavigationInfo() {
    try {
      const navInfo = sessionStorage.getItem('last_framework_navigation');
      if (!navInfo) return null;
      
      return JSON.parse(navInfo);
    } catch (error) {
      return { error: error.message };
    }
  }
  
  // Create diagnostic UI
  function createDiagnosticUI(dataId, source, timestamp) {
    const diagnostics = window._emergencyDiagnostics || 
      collectDiagnostics(dataId, source, timestamp);
    
    // Create panel
    const panel = document.createElement('div');
    panel.id = 'emergency-diagnostics-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 9999;
      max-width: 300px;
      max-height: 200px;
      overflow: auto;
      opacity: 0.7;
      transition: opacity 0.3s;
      cursor: pointer;
    `;
    
    panel.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">📊 Emergency Diagnostics</div>
      <div>Source: ${diagnostics.source}</div>
      <div>Data ID: ${diagnostics.dataId.substring(0, 20)}...</div>
      <div>Path: ${diagnostics.path}</div>
      <div>
        Storage: ${diagnostics.storage.localStorage.found ? '✅' : '❌'} 
        Backup: ${diagnostics.storage.backupLocalStorage.found ? '✅' : '❌'}
      </div>
      <div style="font-size: 10px; margin-top: 5px;">Click to expand</div>
    `;
    
    document.body.appendChild(panel);
    
    // Make expandable
    panel.addEventListener('click', function() {
      expandDiagnostics(diagnostics);
    });
    
    // Hover effect
    panel.addEventListener('mouseenter', function() {
      panel.style.opacity = '1';
    });
    
    panel.addEventListener('mouseleave', function() {
      panel.style.opacity = '0.7';
    });
  }
  
  // Expand diagnostic panel with full details
  function expandDiagnostics(diagnostics) {
    // Remove small panel
    const smallPanel = document.getElementById('emergency-diagnostics-panel');
    if (smallPanel) smallPanel.remove();
    
    // Create full panel
    const fullPanel = document.createElement('div');
    fullPanel.id = 'emergency-diagnostics-full';
    fullPanel.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      font-family: monospace;
      font-size: 14px;
      padding: 20px;
      border-radius: 5px;
      z-index: 9999;
      overflow: auto;
      display: flex;
      flex-direction: column;
    `;
    
    // Storage status indicators
    const localStorage = diagnostics.storage.localStorage;
    const sessionStorage = diagnostics.storage.sessionStorage;
    const backupLocal = diagnostics.storage.backupLocalStorage;
    const backupSession = diagnostics.storage.backupSessionStorage;
    
    const storageStatus = `
      <div style="margin-bottom: 20px;">
        <h3 style="color: white; margin: 0 0 10px 0;">Storage Status</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #333;">Storage</th>
            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #333;">Status</th>
            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #333;">Size</th>
            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #333;">Items</th>
          </tr>
          <tr>
            <td style="padding: 5px; border-bottom: 1px solid #333;">Primary (localStorage)</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${localStorage.found ? '✅ Found' : '❌ Missing'}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${localStorage.size || 'N/A'}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${localStorage.itemCount || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border-bottom: 1px solid #333;">Session (sessionStorage)</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${sessionStorage.found ? '✅ Found' : '❌ Missing'}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${sessionStorage.size || 'N/A'}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${sessionStorage.itemCount || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border-bottom: 1px solid #333;">Backup (localStorage)</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${backupLocal.found ? '✅ Found' : '❌ Missing'}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${backupLocal.size || 'N/A'}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${backupLocal.itemCount || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border-bottom: 1px solid #333;">Backup (sessionStorage)</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${backupSession.found ? '✅ Found' : '❌ Missing'}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${backupSession.size || 'N/A'}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${backupSession.itemCount || 'N/A'}</td>
          </tr>
        </table>
      </div>
    `;
    
    // Navigation info
    let navigationInfo = '<div>No navigation info available</div>';
    if (diagnostics.navigationInfo) {
      navigationInfo = `
        <div style="margin-bottom: 20px;">
          <h3 style="color: white; margin: 0 0 10px 0;">Navigation Info</h3>
          <div style="margin-bottom: 5px;"><strong>Data ID:</strong> ${diagnostics.navigationInfo.dataId || 'N/A'}</div>
          <div style="margin-bottom: 5px;"><strong>Target Tool:</strong> ${diagnostics.navigationInfo.targetTool || 'N/A'}</div>
          <div style="margin-bottom: 5px;"><strong>Target Route:</strong> ${diagnostics.navigationInfo.targetRoute || 'N/A'}</div>
          <div style="margin-bottom: 5px;"><strong>Timestamp:</strong> ${diagnostics.navigationInfo.timestamp || 'N/A'}</div>
          <div style="margin-bottom: 5px; word-break: break-all;"><strong>Full URL:</strong> ${diagnostics.navigationInfo.fullUrl || 'N/A'}</div>
        </div>
      `;
    }
    
    // URL analysis
    const url = new URL(window.location.href);
    const urlAnalysis = `
      <div style="margin-bottom: 20px;">
        <h3 style="color: white; margin: 0 0 10px 0;">URL Analysis</h3>
        <div style="margin-bottom: 5px;"><strong>Origin:</strong> ${url.origin}</div>
        <div style="margin-bottom: 5px;"><strong>Pathname:</strong> ${url.pathname}</div>
        <div style="margin-bottom: 5px;"><strong>emergency_data:</strong> ${url.searchParams.get('emergency_data') || 'N/A'}</div>
        <div style="margin-bottom: 5px;"><strong>source:</strong> ${url.searchParams.get('source') || 'N/A'}</div>
        <div style="margin-bottom: 5px;"><strong>timestamp:</strong> ${url.searchParams.get('t') || url.searchParams.get('timestamp') || 'N/A'}</div>
        <div style="margin-bottom: 5px;"><strong>emergency_fallback:</strong> ${url.searchParams.get('emergency_fallback') || 'N/A'}</div>
      </div>
    `;
    
    // Actions
    const actions = `
      <div style="margin-bottom: 20px;">
        <h3 style="color: white; margin: 0 0 10px 0;">Actions</h3>
        <button id="copy-diagnostics" style="background: #0066ff; color: white; border: none; padding: 8px 12px; border-radius: 4px; margin-right: 10px; cursor: pointer;">
          Copy Diagnostics
        </button>
        <button id="run-tests" style="background: #00cc66; color: white; border: none; padding: 8px 12px; border-radius: 4px; margin-right: 10px; cursor: pointer;">
          Test URL Construction
        </button>
        <button id="close-diagnostics" style="background: #ff3333; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
          Close
        </button>
      </div>
    `;
    
    // Build the panel content
    fullPanel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: white; margin: 0;">📊 Emergency Mode Diagnostics</h2>
        <button id="close-full-diagnostics" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="margin-bottom: 5px;"><strong>Data ID:</strong> ${diagnostics.dataId}</div>
        <div style="margin-bottom: 5px;"><strong>Source:</strong> ${diagnostics.source}</div>
        <div style="margin-bottom: 5px;"><strong>Timestamp:</strong> ${diagnostics.timestamp || 'N/A'}</div>
        <div style="margin-bottom: 5px;"><strong>Time:</strong> ${diagnostics.time}</div>
        <div style="margin-bottom: 5px;"><strong>User Agent:</strong> ${diagnostics.userAgent}</div>
      </div>
      
      ${storageStatus}
      ${navigationInfo}
      ${urlAnalysis}
      ${actions}
      
      <div id="test-results-container" style="display: none; margin-top: 20px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
        <h3 style="color: white; margin: 0 0 10px 0;">Test Results</h3>
        <div id="test-results"></div>
      </div>
    `;
    
    document.body.appendChild(fullPanel);
    
    // Add event listeners
    document.getElementById('close-full-diagnostics').addEventListener('click', function() {
      fullPanel.remove();
      createDiagnosticUI(diagnostics.dataId, diagnostics.source, diagnostics.timestamp);
    });
    
    document.getElementById('copy-diagnostics').addEventListener('click', function() {
      const diagnosticsText = JSON.stringify(diagnostics, null, 2);
      navigator.clipboard.writeText(diagnosticsText)
        .then(() => alert('Diagnostics copied to clipboard!'))
        .catch(() => {
          const textarea = document.createElement('textarea');
          textarea.value = diagnosticsText;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          alert('Diagnostics copied to clipboard!');
        });
    });
    
    document.getElementById('run-tests').addEventListener('click', function() {
      runURLConstructionTests();
    });
    
    document.getElementById('close-diagnostics').addEventListener('click', function() {
      fullPanel.remove();
    });
  }
  
  // Run URL construction tests
  function runURLConstructionTests() {
    const resultsContainer = document.getElementById('test-results-container');
    const resultsEl = document.getElementById('test-results');
    
    if (!resultsContainer || !resultsEl) return;
    
    resultsContainer.style.display = 'block';
    resultsEl.innerHTML = '<div>Running tests...</div>';
    
    // Test cases for URL construction
    const testCases = [
      { 
        name: 'Standard route', 
        targetTool: 'fire-ems-dashboard',
        description: 'Normal route name without leading slashes'
      },
      { 
        name: 'Route with leading slash', 
        targetTool: '/fire-ems-dashboard',
        description: 'Route with a leading slash that should be normalized'
      },
      { 
        name: 'Route with double slash', 
        targetTool: '//fire-ems-dashboard',
        description: 'Route with double leading slashes that should be normalized'
      },
      { 
        name: 'Mapped route (alias)', 
        targetTool: 'response-time',
        description: 'Route that should be mapped to fire-ems-dashboard'
      },
      { 
        name: 'Route with underscores', 
        targetTool: 'fire_ems_dashboard',
        description: 'Route using underscores instead of hyphens'
      }
    ];
    
    // Results table
    let resultsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <th style="text-align: left; padding: 5px; border-bottom: 1px solid #333; color: white;">Test Case</th>
          <th style="text-align: left; padding: 5px; border-bottom: 1px solid #333; color: white;">Input</th>
          <th style="text-align: left; padding: 5px; border-bottom: 1px solid #333; color: white;">Output Path</th>
          <th style="text-align: left; padding: 5px; border-bottom: 1px solid #333; color: white;">Status</th>
        </tr>
    `;
    
    // Run each test case
    testCases.forEach(testCase => {
      try {
        // Common test setup
        const dataId = 'emergency_data_test';
        const timestamp = Date.now();
        const origin = window.location.origin || '';
        
        // EmergencyMode URL construction simulation
        const normalizedTargetTool = (testCase.targetTool || '')
          .toString()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-|-$/g, '');
        
        // Simplified tool route map
        const toolRouteMap = {
          'response-time': 'fire-ems-dashboard',
          'response-time-analyzer': 'fire-ems-dashboard',
          'fire-ems-dashboard': 'fire-ems-dashboard',
          'fire_ems_dashboard': 'fire-ems-dashboard'
        };
        
        const targetRoute = toolRouteMap[testCase.targetTool] || 
                         toolRouteMap[normalizedTargetTool] || 
                         testCase.targetTool;
        
        // Remove leading slashes
        const normalizedRoute = targetRoute.replace(/^\/+/, '');
        
        // Final path part of the URL
        const finalPath = '/' + normalizedRoute;
        
        // Validate no double slashes
        const valid = !finalPath.includes('//');
        
        // Add to results table
        resultsHtml += `
          <tr>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${testCase.name}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${testCase.targetTool}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${finalPath}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333; color: ${valid ? '#00cc66' : '#ff3333'}">
              ${valid ? '✅ Valid' : '❌ Invalid'}
            </td>
          </tr>
        `;
      } catch (error) {
        resultsHtml += `
          <tr>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${testCase.name}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">${testCase.targetTool}</td>
            <td style="padding: 5px; border-bottom: 1px solid #333;">Error</td>
            <td style="padding: 5px; border-bottom: 1px solid #333; color: #ff3333;">
              ❌ Error: ${error.message}
            </td>
          </tr>
        `;
      }
    });
    
    resultsHtml += '</table>';
    resultsEl.innerHTML = resultsHtml;
  }
  
  // Auto-run the URL construction tests if configured
  if (config.runAutoTests) {
    setTimeout(function() {
      const urlParams = new URLSearchParams(window.location.search);
      const emergencyData = urlParams.get('emergency_data');
      
      if (emergencyData) {
        // Create a minimal UI for test results
        const testResultsDiv = document.createElement('div');
        testResultsDiv.id = 'auto-test-results';
        testResultsDiv.style.cssText = `
          position: fixed;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: #00ff00;
          font-family: monospace;
          font-size: 12px;
          padding: 10px;
          border-radius: 5px;
          z-index: 9999;
          max-width: 300px;
          max-height: 150px;
          overflow: auto;
          opacity: 0.7;
        `;
        
        testResultsDiv.innerHTML = 'Running URL construction tests...';
        document.body.appendChild(testResultsDiv);
        
        // Get current URL
        const url = new URL(window.location.href);
        const pathname = url.pathname;
        
        // Check for double slashes in pathname
        const hasDoubleSlashes = pathname.includes('//');
        
        // Display results
        testResultsDiv.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 5px;">URL Test Results</div>
          <div>Path: ${pathname}</div>
          <div style="color: ${hasDoubleSlashes ? '#ff3333' : '#00cc66'}">
            ${hasDoubleSlashes ? '❌ Double slashes detected' : '✅ No double slashes'}
          </div>
          <div style="font-size: 10px; margin-top: 5px;">Click to dismiss</div>
        `;
        
        // Click to dismiss
        testResultsDiv.addEventListener('click', function() {
          testResultsDiv.remove();
        });
        
        // Auto-remove after 10 seconds
        setTimeout(function() {
          if (testResultsDiv.parentNode) {
            testResultsDiv.remove();
          }
        }, 10000);
      }
    }, 2000); // Wait for page to be fully loaded
  }
})();