/**
 * Emergency Mode Debugging Helper
 * 
 * This script adds detailed logging and monitoring for emergency mode operations,
 * helping to diagnose issues with the emergency mode activation and field mapping.
 */

console.log("EMERGENCY INIT: Starting enhanced emergency mode checks");

// Add a visual debugging overlay for emergency mode
function addEmergencyDebugOverlay() {
  if (document.getElementById('emergency-debug-overlay')) {
    return; // Already added
  }
  
  // Create debug overlay
  const overlay = document.createElement('div');
  overlay.id = 'emergency-debug-overlay';
  overlay.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    width: 300px;
    max-height: 300px;
    overflow: auto;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    display: none;
  `;
  
  // Add header
  overlay.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h3 style="margin: 0; color: #ff9800;">Emergency Mode Debug</h3>
      <div>
        <button id="close-debug-overlay" style="background: none; border: none; color: white; cursor: pointer;">✕</button>
      </div>
    </div>
    <div id="emergency-debug-log" style="margin-bottom: 10px;"></div>
    <div id="emergency-debug-status"></div>
  `;
  
  document.body.appendChild(overlay);
  
  // Add event listeners
  document.getElementById('close-debug-overlay').addEventListener('click', function() {
    overlay.style.display = 'none';
  });
  
  // Return the overlay for later use
  return overlay;
}

// Logging to debug overlay
function logToDebug(message, type = 'info') {
  const overlay = document.getElementById('emergency-debug-overlay') || addEmergencyDebugOverlay();
  const log = document.getElementById('emergency-debug-log');
  
  if (!log) return;
  
  // Show the overlay
  overlay.style.display = 'block';
  
  // Create log entry
  const entry = document.createElement('div');
  entry.style.cssText = `
    margin-bottom: 4px;
    border-left: 3px solid ${type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
    padding-left: 8px;
  `;
  
  // Add timestamp
  const time = new Date();
  const timeStr = `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
  
  entry.innerHTML = `<span style="color: #aaa;">${timeStr}</span> ${message}`;
  
  // Add to log
  log.appendChild(entry);
  
  // Also log to console
  console.log(`EMERGENCY DEBUG [${timeStr}]: ${message}`);
  
  // Scroll to bottom
  log.scrollTop = log.scrollHeight;
}

// Check MapFieldsManager availability
function checkMapFieldsManagerAvailability() {
  logToDebug('Checking MapFieldsManager availability...', 'info');
  
  // 1. Check for the feature flag (added in MapFieldsManager.js)
  if (window.FireEMS && 
      window.FireEMS.features && 
      window.FireEMS.features.mapFieldsManagerAvailable === true) {
    logToDebug('✅ Feature flag is set: FireEMS.features.mapFieldsManagerAvailable = true', 'info');
    return true;
  } else {
    logToDebug('❌ Feature flag not set: FireEMS.features.mapFieldsManagerAvailable is not true', 'warning');
  }
  
  // 2. Check for the direct utility check function
  if (typeof window.checkMapFieldsManager === 'function') {
    try {
      const status = window.checkMapFieldsManager();
      if (status && status.available === true) {
        logToDebug(`✅ Check function reports available: ${JSON.stringify(status)}`, 'info');
        return true;
      } else {
        logToDebug(`❌ Check function reports unavailable: ${JSON.stringify(status)}`, 'warning');
      }
    } catch (e) {
      logToDebug(`❌ Error checking MapFieldsManager: ${e.message}`, 'error');
    }
  } else {
    logToDebug('❌ checkMapFieldsManager() function not found', 'warning');
  }
  
  // 3. Check for the utility directly
  if (window.FireEMS && 
      window.FireEMS.Utils && 
      window.FireEMS.Utils.MapFieldsManager &&
      typeof window.FireEMS.Utils.MapFieldsManager.applyMappings === 'function') {
    logToDebug('✅ MapFieldsManager utility is directly available', 'info');
    return true;
  } else {
    logToDebug('❌ MapFieldsManager utility is not directly available', 'warning');
  }
  
  // 4. Check for older flag
  if (window.FireEMS && 
      window.FireEMS.Utils && 
      window.FireEMS.Utils.mapFieldsAvailable === true) {
    logToDebug('✅ Legacy flag is set: FireEMS.Utils.mapFieldsAvailable = true', 'info');
    return true;
  } else {
    logToDebug('❌ Legacy flag not set: FireEMS.Utils.mapFieldsAvailable is not true', 'warning');
  }
  
  logToDebug('❌ All availability checks failed, emergency mode is appropriate', 'warning');
  return false;
}

// Override emergency data processing function if it exists
function monitorEmergencyData() {
  // Look for the emergency data processing function
  if (window.processEmergencyData && typeof window.processEmergencyData === 'function') {
    logToDebug('Found processEmergencyData function, adding monitoring wrapper', 'info');
    
    // Save the original function
    const originalFn = window.processEmergencyData;
    
    // Override with monitored version
    window.processEmergencyData = function(data) {
      logToDebug(`Emergency data processing requested with ${Array.isArray(data) ? data.length : 'unknown'} records`, 'info');
      
      // Check if we should actually be in emergency mode
      const shouldUseEmergencyMode = !checkMapFieldsManagerAvailability();
      
      if (!shouldUseEmergencyMode) {
        logToDebug('⚠️ Emergency mode attempted while MapFieldsManager is available!', 'warning');
        
        // Update status with detailed information
        const statusDiv = document.getElementById('emergency-debug-status');
        if (statusDiv) {
          statusDiv.innerHTML = `
            <div style="background: #ff9800; padding: 5px; margin-top: 5px; border-radius: 3px;">
              <strong>Emergency Mode Warning</strong><br>
              Emergency mode processing was attempted even though MapFieldsManager is available.
              <br><br>
              <strong>URL parameters:</strong> ${window.location.search}
            </div>
          `;
        }
      }
      
      // Call the original function with detailed logging
      try {
        logToDebug('Calling original processEmergencyData function...', 'info');
        const result = originalFn(data);
        logToDebug(`Emergency data processing ${result ? 'succeeded' : 'failed'}`, result ? 'info' : 'error');
        return result;
      } catch (e) {
        logToDebug(`Error in emergency data processing: ${e.message}`, 'error');
        throw e;
      }
    };
    
    logToDebug('Successfully added monitoring to emergency data processing', 'info');
  } else {
    logToDebug('processEmergencyData function not found, waiting...', 'warning');
    
    // Try again later
    setTimeout(monitorEmergencyData, 1000);
  }
}

// Immediately check for emergency data in URL
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const emergencyData = urlParams.get('emergency_data');
  if (emergencyData) {
    console.log("ENHANCED EMERGENCY DATA DETECTED IN URL: " + emergencyData);
    
    // Add visual indicator that we've detected emergency data in URL
    setTimeout(function() {
      const body = document.body;
      const indicator = document.createElement('div');
      indicator.style.cssText = "position: fixed; top: 0; left: 0; background: #ff9800; color: white; padding: 5px; z-index: 9999;";
      indicator.textContent = "Emergency data detected: " + emergencyData;
      body.appendChild(indicator);
      
      // Add debug overlay and monitor availability
      addEmergencyDebugOverlay();
      
      // Add debug button
      const debugButton = document.createElement('button');
      debugButton.style.cssText = "position: fixed; top: 30px; left: 0; background: #333; color: white; border: none; padding: 5px; z-index: 9999; cursor: pointer;";
      debugButton.textContent = "Debug";
      debugButton.addEventListener('click', function() {
        const overlay = document.getElementById('emergency-debug-overlay');
        if (overlay) {
          overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
        }
      });
      body.appendChild(debugButton);
      
      // Try immediate retrieval from localStorage
      try {
        const storedData = localStorage.getItem(emergencyData);
        if (storedData) {
          console.log("EMERGENCY DATA FOUND IN STORAGE: " + emergencyData.substring(0, 20) + "...");
          indicator.style.background = "#4caf50";
          indicator.textContent = "Emergency data ready: " + emergencyData;
          logToDebug("Emergency data found in localStorage", "info");
          
          // Check MapFieldsManager availability
          const available = checkMapFieldsManagerAvailability();
          if (available) {
            logToDebug("⚠️ MapFieldsManager is available - emergency mode shouldn't be necessary!", "warning");
            indicator.textContent += " - MapFieldsManager available!";
            indicator.style.background = "#ff9800";
          } else {
            logToDebug("MapFieldsManager not available, emergency mode is appropriate", "info");
          }
        } else {
          console.error("EMERGENCY DATA NOT FOUND IN STORAGE");
          indicator.style.background = "#f44336";
          indicator.textContent = "Emergency data missing: " + emergencyData;
          logToDebug("Emergency data ID not found in localStorage", "error");
        }
      } catch (e) {
        console.error("EMERGENCY STORAGE ERROR:", e);
        logToDebug(`Error accessing localStorage: ${e.message}`, "error");
      }
    }, 500);
    
    // Load diagnostic tools for emergency mode with path fallbacks
    setTimeout(function() {
      console.log("Loading emergency diagnostic tools...");
      logToDebug("Loading emergency diagnostic tools...", "info");
      
      function loadDiagnosticTools() {
        const paths = [
          '/static/js/emergency-diagnostic.js',
          '/app-static/js/emergency-diagnostic.js',
          '/direct-static/js/emergency-diagnostic.js'
        ];
        
        function tryNextPath(index) {
          if (index >= paths.length) {
            console.error("Failed to load emergency diagnostic tools from all paths");
            logToDebug("Failed to load diagnostic tools from any path", "error");
            return;
          }
          
          const script = document.createElement('script');
          script.src = paths[index];
          
          script.onload = function() {
            console.log("Diagnostic tools loaded successfully from " + paths[index]);
            logToDebug(`Diagnostic tools loaded from ${paths[index]}`, "info");
            
            // Monitor emergency data processing after tools are loaded
            monitorEmergencyData();
          };
          
          script.onerror = function() {
            console.warn("Failed to load diagnostic tools from " + paths[index] + ", trying next path");
            logToDebug(`Failed to load from ${paths[index]}, trying next path`, "warning");
            tryNextPath(index + 1);
          };
          
          document.head.appendChild(script);
        }
        
        tryNextPath(0);
      }
      
      loadDiagnosticTools();
    }, 1000);
  } else {
    // No emergency data in URL
    console.log("No emergency data parameter detected in URL");
  }
})();

// Initialize debugging tools
document.addEventListener('DOMContentLoaded', function() {
  // Add debug overlay if emergency parameter is present
  const urlParams = new URLSearchParams(window.location.search);
  
  // IMPORTANT: Skip emergency mode if we're coming from the formatter but NOT in emergency mode
  if (urlParams.has('from_formatter') && !urlParams.has('emergency_data') && !urlParams.has('emergency_mode')) {
    console.log("IMPORTANT: Data coming from formatter, skipping emergency mode debugging");
    return; // Exit early, don't initialize emergency debugging
  }
  
  if (urlParams.has('emergency_data') || urlParams.has('emergency_mode')) {
    console.log("Initializing emergency debug tools on DOMContentLoaded");
    
    // Add debug overlay
    addEmergencyDebugOverlay();
    
    // Log initialization
    logToDebug('Emergency mode debugging initialized', 'info');
    
    // Check MapFieldsManager availability
    setTimeout(checkMapFieldsManagerAvailability, 500);
    
    // Monitor emergency data processing
    setTimeout(monitorEmergencyData, 1000);
  }
});

// Expose debug functions globally
window.FireEMS = window.FireEMS || {};
window.FireEMS.debug = {
  log: logToDebug,
  checkMapFieldsManager: checkMapFieldsManagerAvailability,
  showOverlay: function() {
    const overlay = document.getElementById('emergency-debug-overlay') || addEmergencyDebugOverlay();
    overlay.style.display = 'block';
  }
};