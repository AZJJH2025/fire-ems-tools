/**
 * Data Formatter Emergency Mode Test
 * 
 * This script tests the "Send to Tool" functionality with emergency data transfer
 * to validate the fixes for data serialization and URL construction.
 */

(function() {
  console.log("🔄 Data Formatter Emergency Mode Test loaded");
  
  // Skip emergency mode if formatterState is already initialized
  if (window.formatterState && window.formatterState.initialized) {
    console.log("Skipping emergency mode: formatterState initialized");
    return;
  }
  
  // Wait for DOM and framework to load
  document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the Data Formatter page
    if (!window.location.pathname.includes('data-formatter')) {
      console.log("Not on data formatter page, exiting");
      return;
    }
    
    console.log("Setting up emergency mode test on Data Formatter");
    setTimeout(setupTest, 1500); // Give framework time to initialize
  });
  
  function setupTest() {
    // Only show emergency test panel when emergency mode is forced
    if (!window.emergencyModeForced) {
      console.log("Emergency test panel hidden - not in forced emergency mode");
      return;
    }
    
    // Find the Send to Tool button to modify/test
    const sendBtn = document.getElementById('send-to-tool-btn');
    if (!sendBtn) {
      console.warn("Send to Tool button not found, cannot set up test");
      return;
    }
    
    // Add test controls
    const controlPanel = document.createElement('div');
    controlPanel.className = 'emergency-test-panel';
    controlPanel.style.cssText = 'background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin-top: 20px; border-radius: 4px;';
    
    controlPanel.innerHTML = `
      <h3 style="margin-top: 0; color: #e65100;">Emergency Data Transfer Test</h3>
      <p>Test the emergency data transfer functionality between Data Formatter and other tools.</p>
      
      <div style="margin-top: 15px;">
        <button id="test-emergency-send" style="background-color: #ff9800; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Test Emergency Send
        </button>
        
        <button id="check-storage" style="background-color: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Check Storage
        </button>
      </div>
      
      <div id="test-log" style="margin-top: 15px; padding: 10px; background: #f5f5f5; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px;"></div>
    `;
    
    // Find the tool panel and add our test panel after it
    const toolPanel = document.querySelector('.tool-panel') || 
                     document.querySelector('.upload-section') || 
                     document.querySelector('.header');
                     
    if (toolPanel) {
      if (toolPanel.nextSibling) {
        toolPanel.parentNode.insertBefore(controlPanel, toolPanel.nextSibling);
      } else {
        toolPanel.parentNode.appendChild(controlPanel);
      }
      
      console.log("Added emergency test panel to page");
    } else {
      console.warn("No suitable container found for test panel");
      // Try to add to body as last resort
      document.body.appendChild(controlPanel);
    }
    
    // Add test functionality
    const logEl = document.getElementById('test-log');
    
    function log(message, type = 'info') {
      console.log(`[Test] ${message}`);
      if (logEl) {
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.innerHTML = `<span class="timestamp">[${new Date().toLocaleTimeString()}]</span> ${message}`;
        logEl.appendChild(entry);
        logEl.scrollTop = logEl.scrollHeight;
      }
    }
    
    // Test Button: Emergency Send
    document.getElementById('test-emergency-send').addEventListener('click', function() {
      log('Testing emergency "Send to Tool" functionality...', 'info');
      
      // Create a small test dataset
      const testData = [];
      const now = new Date();
      
      for (let i = 1; i <= 5; i++) {
        testData.push({
          incident_id: `TEST-${i}`,
          incident_date: now.toISOString().split('T')[0],
          incident_time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          latitude: (Math.random() * 10 + 30).toFixed(6),
          longitude: (Math.random() * 10 - 90).toFixed(6),
          Unit: `Engine-${Math.floor(Math.random() * 10) + 1}`,
          'Unit Dispatched': `${now.getHours()}:${now.getMinutes()}`,
          'Unit Enroute': `${now.getHours()}:${now.getMinutes() + 2}`,
          'Unit Onscene': `${now.getHours()}:${now.getMinutes() + 6}`,
          incident_type: 'TEST'
        });
      }
      
      log(`Created ${testData.length} test records`, 'success');
      
      // Select Response Time Analyzer tool
      const targetToolSelect = document.getElementById('target-tool');
      if (targetToolSelect) {
        // Find the option for Response Time Analyzer
        const rtOption = Array.from(targetToolSelect.options).find(option => 
          option.value === 'fire-ems-dashboard' || 
          option.value === 'response-time' ||
          option.text.includes('Response Time')
        );
        
        if (rtOption) {
          targetToolSelect.value = rtOption.value;
          log(`Selected target tool: ${rtOption.text} (${rtOption.value})`, 'info');
        } else {
          log('Could not find Response Time Analyzer in target tool dropdown', 'warning');
        }
      }
      
      // Add the super-robust emergency send method - this WILL work
      log('Using robust emergency send method', 'info');
      
      // Get target tool from dropdown or use default
      const targetTool = targetToolSelect ? targetToolSelect.value : 'fire-ems-dashboard';
      
      // Log detailed debug info for troubleshooting
      log(`Target tool: ${targetTool}`, 'info');
      log(`Current URL: ${window.location.href}`, 'info');
      log(`Window origin: ${window.location.origin}`, 'info');
      
      // Map tool names to routes with comprehensive fallbacks
      const toolRouteMap = {
        'response-time': 'fire-ems-dashboard',
        'response-time-analyzer': 'fire-ems-dashboard',
        'response_time': 'fire-ems-dashboard',
        'response_time_analyzer': 'fire-ems-dashboard',
        'fire-ems-dashboard': 'fire-ems-dashboard',
        'fire_ems_dashboard': 'fire-ems-dashboard',
        'call-density': 'call-density-heatmap',
        'call-density-heatmap': 'call-density-heatmap',
        'isochrone': 'isochrone-map',
        'isochrone-map': 'isochrone-map',
        'incident-logger': 'incident-logger',
        'incident_logger': 'incident-logger',
      };
      
      // Find the best route match
      const targetRoute = toolRouteMap[targetTool] || targetTool;
      log(`Mapped to route: ${targetRoute}`, 'info');
      
      // Create a unique data ID with timestamp
      const timestamp = Date.now();
      const dataId = 'emergency_data_test_' + timestamp;
      
      // Store the test data in 3 different ways to maximize chances of success
      try {
        // 1. Store in localStorage (primary storage method)
        const serializedData = JSON.stringify({
          data: testData,
          metadata: {
            created: timestamp,
            source: 'robust-emergency-test',
            recordCount: testData.length,
            targetTool: targetTool,
            targetRoute: targetRoute
          }
        });
        
        localStorage.setItem(dataId, serializedData);
        log(`1. Stored in localStorage as: ${dataId}`, 'success');
        
        // 2. Also store as a general emergency data key
        localStorage.setItem('emergency_data_latest', serializedData);
        log(`2. Stored backup copy as 'emergency_data_latest'`, 'success');
        
        // 3. Store a copy in sessionStorage too
        sessionStorage.setItem(dataId, serializedData);
        sessionStorage.setItem('emergency_data_latest', serializedData);
        log(`3. Created sessionStorage backup copies`, 'success');
        
        // Use the most reliable URL format with origin for absolute path
        const origin = window.location.origin;
        
        // Ensure route doesn't have leading slashes
        const normalizedRoute = targetRoute.replace(/^\/+/, ''); // Remove leading slashes
        
        // Create the final URL, ensuring we're using absolute path
        // IMPORTANT: Use encodeURIComponent to properly format the data ID as a query parameter
        const targetUrl = `${origin}/${normalizedRoute}?emergency_data=${encodeURIComponent(dataId)}&timestamp=${timestamp}&source=test`;
        log(`Navigating to: ${targetUrl}`, 'info');
        
        // Add a small delay to ensure logging completes
        setTimeout(() => {
          // Navigate to the target
          window.location.href = targetUrl;
        }, 200);
        
      } catch (error) {
        log(`❌ Emergency data storage failed: ${error.message}`, 'error');
        
        // Still try the direct navigation as last resort
        try {
          // Ensure route doesn't have leading slashes even in fallback
          const normalizedFallbackRoute = targetRoute.replace(/^\/+/, '');
          const fallbackUrl = `${window.location.origin}/${normalizedFallbackRoute}?emergency_fallback=true&timestamp=${timestamp}&source=test_fallback`;
          log(`⚠️ Attempting fallback navigation to: ${fallbackUrl}`, 'warning');
          
          setTimeout(() => {
            window.location.href = fallbackUrl;
          }, 100);
        } catch (navError) {
          log(`❌ All navigation attempts failed: ${navError.message}`, 'error');
          alert(`Failed to navigate to ${targetRoute}. See error log for details.`);
        }
      }
    });
    
    // Test Button: Check Storage
    document.getElementById('check-storage').addEventListener('click', function() {
      log('Checking localStorage for emergency data...', 'info');
      
      try {
        // Find all emergency data entries
        const emergencyKeys = [];
        let totalSize = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          if (key && key.startsWith('emergency_data_')) {
            const item = localStorage.getItem(key);
            const size = item ? item.length : 0;
            totalSize += size;
            
            emergencyKeys.push({
              key: key,
              size: size,
              created: key.replace('emergency_data_', '')
            });
          }
        }
        
        if (emergencyKeys.length === 0) {
          log('No emergency data found in localStorage', 'info');
        } else {
          log(`Found ${emergencyKeys.length} emergency data entries (${Math.round(totalSize / 1024)} KB total)`, 'info');
          
          // Log details of each entry
          emergencyKeys.forEach(item => {
            const date = new Date(parseInt(item.created));
            log(`- ${item.key}: ${Math.round(item.size / 1024)} KB, created on ${date.toLocaleString()}`, 'info');
            
            // Add clear button
            const clearBtn = document.createElement('button');
            clearBtn.textContent = 'Clear';
            clearBtn.style.cssText = 'font-size: 10px; padding: 2px 6px; margin-left: 10px; cursor: pointer;';
            clearBtn.onclick = function() {
              localStorage.removeItem(item.key);
              log(`Cleared ${item.key}`, 'success');
              this.parentNode.style.textDecoration = 'line-through';
              this.disabled = true;
            };
            
            // Add it to the last log entry
            const lastEntry = logEl.lastChild;
            if (lastEntry) {
              lastEntry.appendChild(clearBtn);
            }
          });
          
          // Add clear all button
          const clearAllBtn = document.createElement('button');
          clearAllBtn.textContent = 'Clear All Emergency Data';
          clearAllBtn.style.cssText = 'margin-top: 10px; padding: 5px 10px; cursor: pointer;';
          clearAllBtn.onclick = function() {
            // Remove all emergency data
            emergencyKeys.forEach(item => {
              localStorage.removeItem(item.key);
            });
            log(`Cleared all ${emergencyKeys.length} emergency data entries`, 'success');
            this.disabled = true;
          };
          
          logEl.appendChild(clearAllBtn);
        }
        
      } catch (error) {
        log(`Error checking localStorage: ${error.message}`, 'error');
      }
    });
    
    log('Emergency mode test initialized', 'success');
  }
})();