/**
 * FireEMS.ai Emergency Mode Lock
 * 
 * This script prevents automatic switching from emergency mode to normal mode
 * to ensure emergency fallbacks have time to activate and work properly.
 */

// Execute immediately when loaded
(function() {
  console.log("🔒 Emergency Mode Lock: Preventing automatic mode switching");
  
  // Function to override health checks to maintain emergency mode
  function lockEmergencyMode() {
    // Check if FireEMS framework is available
    if (window.FireEMS && window.FireEMS.Resilience) {
      console.log("🔒 Emergency Mode Lock: FireEMS.Resilience found, applying lock");
      
      // Override health evaluation function to always stay in emergency mode
      const originalEvaluateHealth = window.FireEMS.Resilience.evaluateHealth;
      window.FireEMS.Resilience.evaluateHealth = function() {
        console.log("🔒 Emergency Mode Lock: Intercepting health evaluation to maintain emergency mode");
        return "emergency"; // Always return emergency to prevent auto-switching to normal
      };
      
      // Register a custom event handler for mode changes
      if (window.FireEMS.Core && window.FireEMS.Core.addEventListener) {
        window.FireEMS.Core.addEventListener('mode:changed', function(event) {
          if (event.detail && event.detail.mode === 'normal') {
            console.log("🔒 Emergency Mode Lock: Detected attempt to switch to normal mode, forcing back to emergency");
            // Force back to emergency mode
            setTimeout(function() {
              if (window.FireEMS.Core.setMode) {
                window.FireEMS.Core.setMode('emergency');
              }
            }, 50);
          }
        });
      }
      
      console.log("🔒 Emergency Mode Lock: Successfully applied");
    } else {
      console.log("🔒 Emergency Mode Lock: FireEMS.Resilience not found yet, will retry");
      // Retry after a delay if framework isn't loaded yet
      setTimeout(lockEmergencyMode, 500);
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