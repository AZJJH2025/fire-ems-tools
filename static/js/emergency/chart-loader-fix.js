/**
 * FireEMS.ai Chart Loading Fix
 * 
 * This script fixes Chart.js loading issues by preloading the library 
 * with retry logic and fallbacks.
 */

// Execute immediately
(function() {
  console.log("📊 Chart Loading Fix: Starting");
  
  // Track loading attempts
  let loadAttempts = 0;
  const maxAttempts = 3;
  let chartLoadingPromise = null;
  
  // Function to attempt Chart.js loading
  function loadChartJs() {
    console.log(`📊 Chart Loading Fix: Attempt ${loadAttempts + 1} of ${maxAttempts}`);
    
    // If Chart.js is already defined, no need to load it
    if (typeof Chart !== 'undefined') {
      console.log("📊 Chart Loading Fix: Chart.js already loaded");
      return Promise.resolve(Chart);
    }
    
    // Increment attempt counter
    loadAttempts++;
    
    return new Promise((resolve, reject) => {
      // Create script element
      const script = document.createElement('script');
      
      // Try different CDNs for each attempt
      if (loadAttempts === 1) {
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
      } else if (loadAttempts === 2) {
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
      } else {
        script.src = 'https://unpkg.com/chart.js@3.9.1/dist/chart.min.js';
      }
      
      // Set crossorigin but NO integrity (which causes blocking)
      script.crossOrigin = "anonymous";
      
      // Set timeout to detect loading failures that don't trigger error event
      const timeoutId = setTimeout(() => {
        console.log(`📊 Chart Loading Fix: Loading timed out for ${script.src}`);
        reject(new Error("Chart.js loading timed out"));
      }, 7000);
      
      // Handle successful load
      script.onload = function() {
        clearTimeout(timeoutId);
        console.log(`📊 Chart Loading Fix: Successfully loaded Chart.js from ${script.src}`);
        
        // Verify that Chart was actually defined
        if (typeof Chart !== 'undefined') {
          // Additional checks to ensure Chart.js is fully functional
          try {
            // Try to access some key Chart.js properties
            if (Chart && Chart.defaults) {
              console.log("📊 Chart Loading Fix: Chart.js appears to be working properly");
              resolve(Chart);
            } else {
              console.warn("📊 Chart Loading Fix: Chart loaded but appears incomplete");
              reject(new Error("Chart loaded but appears incomplete"));
            }
          } catch (e) {
            console.warn("📊 Chart Loading Fix: Error testing Chart.js", e);
            reject(e);
          }
        } else {
          console.warn("📊 Chart Loading Fix: Script loaded but Chart is undefined");
          reject(new Error("Script loaded but Chart is undefined"));
        }
      };
      
      // Handle loading errors
      script.onerror = function(error) {
        clearTimeout(timeoutId);
        console.warn(`📊 Chart Loading Fix: Failed to load Chart.js from ${script.src}`, error);
        reject(error);
      };
      
      // Add to document
      document.head.appendChild(script);
    });
  }
  
  // Function to handle retries with exponential backoff
  function loadChartJsWithRetry() {
    // If we already have a loading promise, return it
    if (chartLoadingPromise) {
      return chartLoadingPromise;
    }
    
    // Create a new loading promise
    chartLoadingPromise = loadChartJs()
      .catch(error => {
        console.warn("📊 Chart Loading Fix: Loading attempt failed:", error);
        
        // If we haven't reached max attempts, try again with backoff
        if (loadAttempts < maxAttempts) {
          const backoff = Math.pow(2, loadAttempts) * 300; // Exponential backoff
          console.log(`📊 Chart Loading Fix: Retrying in ${backoff}ms`);
          
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(loadChartJsWithRetry());
            }, backoff);
          });
        } else {
          console.error("📊 Chart Loading Fix: All loading attempts failed, activating fallback");
          
          // Activate fallback mechanism
          if (window.FireEMS && window.FireEMS.ChartFallback) {
            window.FireEMS.ChartFallback.installChartPolyfill();
            console.log("📊 Chart Loading Fix: Chart polyfill installed");
            return window.Chart; // Return the polyfill
          } else {
            // Load the fallback module if not already loaded
            return new Promise((resolve) => {
              const fallbackScript = document.createElement('script');
              fallbackScript.src = '/static/js/emergency/chart-fallback.js';
              fallbackScript.onload = function() {
                console.log("📊 Chart Loading Fix: Chart fallback loaded");
                
                // Small delay to ensure fallback is initialized
                setTimeout(() => {
                  if (window.FireEMS && window.FireEMS.ChartFallback) {
                    window.FireEMS.ChartFallback.installChartPolyfill();
                  }
                  resolve(window.Chart); // Return whatever we have now
                }, 100);
              };
              fallbackScript.onerror = function() {
                console.error("📊 Chart Loading Fix: Even fallback loading failed");
                resolve(null); // Resolve with null to prevent further errors
              };
              document.head.appendChild(fallbackScript);
            });
          }
        }
      });
    
    return chartLoadingPromise;
  }
  
  // Expose the loader to the global scope for other scripts to use
  window.ensureChartJsLoaded = loadChartJsWithRetry;
  
  // Start loading Chart.js right away
  loadChartJsWithRetry()
    .then(chart => {
      if (chart) {
        console.log("📊 Chart Loading Fix: Chart.js ready");
        
        // Create a global event for other scripts to know Chart.js is ready
        const event = new CustomEvent('chartjs:ready', { detail: { chart } });
        document.dispatchEvent(event);
      }
    })
    .catch(error => {
      console.error("📊 Chart Loading Fix: Final error:", error);
    });
  
  // Create a small UI indicator that our fix is active
  function createFixIndicator() {
    if (document.body) {
      // Only create if in debug mode or emergency mode
      if (window.location.search.includes('debug=true') || 
          window.location.search.includes('emergency')) {
        
        const indicator = document.createElement('div');
        indicator.style.cssText = "position: fixed; bottom: 0; left: 0; background: #2196f3; color: white; " +
                               "padding: 4px 8px; font-size: 11px; z-index: 9999; border-top-right-radius: 4px;";
        indicator.textContent = "📊 Chart Fix Active";
        
        document.body.appendChild(indicator);
      }
    } else {
      // If body not ready, try again later
      setTimeout(createFixIndicator, 100);
    }
  }
  
  // Create the indicator
  createFixIndicator();
})();