/**
 * Data Formatter Emergency Mode Test
 * 
 * This script tests the "Send to Tool" functionality with emergency data transfer
 * to validate the fixes for data serialization and URL construction.
 */

(function() {
  console.log("🔄 Data Formatter Emergency Mode Test loaded");
  
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
      
      // Test the three different methods:
      
      // 1. Directly use FireEMS.EmergencyMode.sendToTool
      if (window.FireEMS && window.FireEMS.EmergencyMode && typeof window.FireEMS.EmergencyMode.sendToTool === 'function') {
        log('Using FireEMS.EmergencyMode.sendToTool method', 'info');
        
        try {
          const targetTool = targetToolSelect ? targetToolSelect.value : 'fire-ems-dashboard';
          const success = window.FireEMS.EmergencyMode.sendToTool(testData, targetTool);
          
          if (success) {
            log(`Successfully initiated transfer to ${targetTool}`, 'success');
            return; // Stop here, we're navigating away
          } else {
            log('EmergencyMode.sendToTool failed, will try next method', 'warning');
          }
        } catch (error) {
          log(`Error using EmergencyMode.sendToTool: ${error.message}`, 'error');
        }
      } else {
        log('FireEMS.EmergencyMode.sendToTool not available', 'warning');
      }
      
      // 2. Use StateService if available
      if (window.FireEMS && window.FireEMS.StateService) {
        log('Using FireEMS.StateService for data transfer', 'info');
        
        try {
          const targetTool = targetToolSelect ? targetToolSelect.value : 'fire-ems-dashboard';
          
          // Store the data
          const dataId = window.FireEMS.StateService.storeEmergencyData(testData, {
            metadata: {
              source: 'data-formatter-emergency-test',
              timestamp: Date.now(),
              targetTool: targetTool
            }
          });
          
          if (dataId) {
            log(`Successfully stored data with ID: ${dataId}`, 'success');
            log(`Redirecting to /${targetTool}?emergency_data=${dataId}`, 'info');
            
            // Navigate
            window.location.href = `/${targetTool}?emergency_data=${dataId}`;
            return; // Stop here, we're navigating away
          } else {
            log('StateService.storeEmergencyData failed, will try direct method', 'warning');
          }
        } catch (error) {
          log(`Error using StateService: ${error.message}`, 'error');
        }
      } else {
        log('FireEMS.StateService not available', 'warning');
      }
      
      // 3. Last resort - direct localStorage method
      log('Using direct localStorage method', 'info');
      
      try {
        const targetTool = targetToolSelect ? targetToolSelect.value : 'fire-ems-dashboard';
        const dataId = 'emergency_data_test_' + Date.now();
        
        // Serialize the data with proper JSON conversion
        const serializedData = JSON.stringify({
          data: testData,
          metadata: {
            created: Date.now(),
            source: 'data-formatter-emergency-test',
            recordCount: testData.length
          }
        });
        
        localStorage.setItem(dataId, serializedData);
        log(`Successfully stored data in localStorage with ID: ${dataId}`, 'success');
        
        // Navigate to target tool
        log(`Redirecting to /${targetTool}?emergency_data=${dataId}`, 'info');
        window.location.href = `/${targetTool}?emergency_data=${dataId}`;
        
      } catch (error) {
        log(`Error using direct localStorage method: ${error.message}`, 'error');
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