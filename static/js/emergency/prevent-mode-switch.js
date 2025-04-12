/**
 * FireEMS.ai Emergency Mode Lock
 * 
 * This script prevents automatic switching from emergency mode to normal mode
 * to ensure emergency fallbacks have time to activate and work properly.
 */

// Execute immediately when loaded
(function() {
  console.log("🔒 Emergency Mode Lock: Preventing automatic mode switching");
  
  // Track if we've already applied the lock
  let lockApplied = false;
  let retryCount = 0;
  const MAX_RETRIES = 10;
  
  // Function to override health checks to maintain emergency mode
  function lockEmergencyMode() {
    // Stop retrying after max attempts
    if (retryCount > MAX_RETRIES) {
      console.log("🔒 Emergency Mode Lock: Giving up after max retries");
      return;
    }
    
    retryCount++;
    
    // Check if FireEMS framework is available using multiple paths
    const resilienceService = 
      (window.FireEMS && window.FireEMS.Resilience) || 
      (window.FireEMS && window.FireEMS.Core && window.FireEMS.Core.getService && window.FireEMS.Core.getService('resilience')) ||
      (window.fireems && window.fireems.resilience);
      
    if (resilienceService) {
      // Don't apply twice
      if (lockApplied) {
        return;
      }
      
      console.log("🔒 Emergency Mode Lock: Resilience service found, applying lock");
      lockApplied = true;
      
      // Direct approach - override evaluateHealth
      if (typeof resilienceService.evaluateHealth === 'function') {
        const originalEvaluateHealth = resilienceService.evaluateHealth;
        resilienceService.evaluateHealth = function() {
          console.log("🔒 Emergency Mode Lock: Intercepting health evaluation");
          return "emergency"; // Always return emergency mode
        };
        console.log("🔒 Emergency Mode Lock: Applied evaluateHealth override");
      }
      
      // Alternative approach - override evaluateHealthStatus
      if (typeof resilienceService.evaluateHealthStatus === 'function') {
        const originalEvaluateStatus = resilienceService.evaluateHealthStatus;
        resilienceService.evaluateHealthStatus = function() {
          console.log("🔒 Emergency Mode Lock: Intercepting health status evaluation");
          return "emergency"; // Always return emergency mode
        };
        console.log("🔒 Emergency Mode Lock: Applied evaluateHealthStatus override");
      }
      
      // Alternative approach - override enterMode to do nothing for normal mode
      if (typeof resilienceService.enterMode === 'function') {
        const originalEnterMode = resilienceService.enterMode;
        resilienceService.enterMode = function(mode) {
          console.log("🔒 Emergency Mode Lock: Intercepting mode change to: " + mode);
          if (mode === 'normal') {
            console.log("🔒 Emergency Mode Lock: Blocked switch to normal mode");
            return false; // Block switching to normal mode
          }
          return originalEnterMode.apply(this, arguments);
        };
        console.log("🔒 Emergency Mode Lock: Applied enterMode override");
      }
      
      // Also intercept core mode changes if possible
      if (window.FireEMS && window.FireEMS.Core) {
        const core = window.FireEMS.Core;
        
        // Register mode change event listener
        if (typeof core.addEventListener === 'function') {
          core.addEventListener('mode:changed', function(event) {
            if (event.detail && event.detail.mode === 'normal') {
              console.log("🔒 Emergency Mode Lock: Detected attempt to switch to normal mode, forcing back to emergency");
              // Force back to emergency mode
              setTimeout(function() {
                if (core.setMode) {
                  core.setMode('emergency');
                }
              }, 50);
            }
          });
          console.log("🔒 Emergency Mode Lock: Added mode change listener");
        }
        
        // Override setMode function if possible
        if (typeof core.setMode === 'function' && !core._originalSetMode) {
          core._originalSetMode = core.setMode;
          core.setMode = function(mode) {
            if (mode === 'normal') {
              console.log("🔒 Emergency Mode Lock: Blocked attempt to set normal mode");
              return false; // Block normal mode
            }
            return core._originalSetMode.apply(this, arguments);
          };
          console.log("🔒 Emergency Mode Lock: Applied Core.setMode override");
        }
      }
      
      console.log("🔒 Emergency Mode Lock: Successfully applied all locks");
      
      // Force emergency mode one more time for good measure
      if (window.FireEMS && window.FireEMS.Core && window.FireEMS.Core.setMode) {
        window.FireEMS.Core.setMode('emergency');
      }
    } else {
      console.log(`🔒 Emergency Mode Lock: Resilience service not found yet (attempt ${retryCount}/${MAX_RETRIES}), will retry`);
      // Retry with increasing delay
      setTimeout(lockEmergencyMode, 200 * Math.pow(1.5, retryCount));
    }
  }
  
  // Start the lock process
  lockEmergencyMode();
  
  // Also apply lock when DOM is fully loaded (backup approach)
  document.addEventListener('DOMContentLoaded', function() {
    console.log("🔒 Emergency Mode Lock: DOM loaded, applying backup lock");
    lockEmergencyMode();
    
    // Force emergency mode activation via URL if not already set
    if (window.location.search.indexOf('emergency_mode=true') === -1 && 
        window.location.search.indexOf('emergency_data=') === -1) {
      
      console.log("🔒 Emergency Mode Lock: Adding emergency parameter to URL");
      
      // Add emergency mode parameter to URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.set('emergency_mode', 'true');
      window.history.replaceState({}, '', url);
      
      // Force emergency mode if available
      if (window.FireEMS && window.FireEMS.Core && window.FireEMS.Core.setMode) {
        window.FireEMS.Core.setMode('emergency');
      }
    }
  });
  
  // Check if emergency data is present - if yes, ensure the emergency mode stays active
  if (window.location.search.indexOf('emergency_data=') !== -1) {
    // Create a visual indicator that emergency mode is locked
    const createIndicator = function() {
      if (document.body) {
        const indicator = document.createElement('div');
        indicator.style.cssText = "position: fixed; bottom: 0; right: 0; background: #ff9800; color: white; " +
                                  "padding: 5px; font-size: 11px; z-index: 9999; border-top-left-radius: 4px;";
        indicator.textContent = "🔒 Emergency Mode Locked";
        document.body.appendChild(indicator);
      } else {
        setTimeout(createIndicator, 100);
      }
    };
    createIndicator();
  }
})();