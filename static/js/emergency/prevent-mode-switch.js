/**
 * FireEMS.ai Emergency Mode Lock
 * 
 * This script prevents automatic switching from emergency mode to normal mode
 * to ensure emergency fallbacks have time to activate and work properly.
 */

// Execute immediately when loaded
(function() {
  console.log("🔒 Emergency Mode Lock: Initializing");
  
  // Track if we've already applied the lock
  let lockApplied = false;
  
  // Framework integration helpers
  const Framework = {
    /**
     * Register a callback to be executed when a service becomes available
     */
    onServiceAvailable: function(serviceName, callback) {
      // Check if service exists immediately
      if (this.getService(serviceName)) {
        console.log(`🔒 Emergency Mode Lock: Service ${serviceName} already available`);
        callback(this.getService(serviceName));
        return;
      }
      
      // If framework has an event system, use it
      if (window.FireEMS && window.FireEMS.Core && typeof window.FireEMS.Core.addEventListener === 'function') {
        console.log(`🔒 Emergency Mode Lock: Registering for service:ready event for ${serviceName}`);
        window.FireEMS.Core.addEventListener('service:ready', function(event) {
          if (event.detail && event.detail.name === serviceName) {
            callback(event.detail.service);
          }
        });
        
        // Also register for generic framework ready event
        window.FireEMS.Core.addEventListener('ready', function() {
          const service = Framework.getService(serviceName);
          if (service) {
            callback(service);
          }
        });
      }
      
      // Set up a minimal one-time check as fallback
      setTimeout(function() {
        const service = Framework.getService(serviceName);
        if (service && !lockApplied) {
          console.log(`🔒 Emergency Mode Lock: Service ${serviceName} found during fallback check`);
          callback(service);
        }
      }, 1000);
    },
    
    /**
     * Get a service from the framework using any available method
     */
    getService: function(serviceName) {
      // Try standard service locator pattern
      if (window.FireEMS && window.FireEMS.Core && typeof window.FireEMS.Core.getService === 'function') {
        const service = window.FireEMS.Core.getService(serviceName);
        if (service) return service;
      }
      
      // Try direct property access on FireEMS
      if (window.FireEMS && window.FireEMS[serviceName]) {
        return window.FireEMS[serviceName];
      }
      
      // Try lowercase variations
      if (window.FireEMS && window.FireEMS[serviceName.toLowerCase()]) {
        return window.FireEMS[serviceName.toLowerCase()];
      }
      
      // Try legacy access
      if (window.fireems && window.fireems[serviceName.toLowerCase()]) {
        return window.fireems[serviceName.toLowerCase()];
      }
      
      return null;
    }
  };

  /**
   * Apply locks to prevent switching out of emergency mode
   */
  function lockEmergencyMode(resilienceService) {
    if (!resilienceService) {
      console.error("🔒 Emergency Mode Lock: Cannot apply lock - no resilience service provided");
      return;
    }
    
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
    
    // Create a visual indicator if emergency data is present
    if (window.location.search.indexOf('emergency_data=') !== -1) {
      createEmergencyIndicator();
    }
  }
  
  /**
   * Create a visual indicator for emergency mode
   */
  function createEmergencyIndicator() {
    if (document.body) {
      const indicator = document.createElement('div');
      indicator.style.cssText = "position: fixed; bottom: 0; right: 0; background: #ff9800; color: white; " +
                                "padding: 5px; font-size: 11px; z-index: 9999; border-top-left-radius: 4px;";
      indicator.textContent = "🔒 Emergency Mode Locked";
      document.body.appendChild(indicator);
    } else {
      setTimeout(createEmergencyIndicator, 100);
    }
  }
  
  // Initialize the locking mechanism
  function initialize() {
    console.log("🔒 Emergency Mode Lock: Starting initialization");
    
    // Check for existing service first
    const resilienceService = Framework.getService('Resilience');
    if (resilienceService) {
      console.log("🔒 Emergency Mode Lock: Resilience service available immediately");
      lockEmergencyMode(resilienceService);
    } else {
      // Wait for service using framework events
      console.log("🔒 Emergency Mode Lock: Waiting for Resilience service to become available");
      Framework.onServiceAvailable('Resilience', lockEmergencyMode);
    }
    
    // Force emergency mode activation via URL if not already set
    if (window.location.search.indexOf('emergency_mode=true') === -1 && 
        window.location.search.indexOf('emergency_data=') === -1) {
      
      console.log("🔒 Emergency Mode Lock: Adding emergency parameter to URL");
      
      // Add emergency mode parameter to URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.set('emergency_mode', 'true');
      window.history.replaceState({}, '', url);
    }
  }
  
  // Start initialization
  initialize();
  
  // Also ensure initialization when DOM is fully loaded (backup approach)
  document.addEventListener('DOMContentLoaded', function() {
    console.log("🔒 Emergency Mode Lock: DOM loaded, ensuring emergency mode");
    
    // Try initializing again if we didn't succeed yet
    if (!lockApplied) {
      initialize();
    }
    
    // Force emergency mode if available
    if (window.FireEMS && window.FireEMS.Core && window.FireEMS.Core.setMode) {
      window.FireEMS.Core.setMode('emergency');
    }
  });
})();