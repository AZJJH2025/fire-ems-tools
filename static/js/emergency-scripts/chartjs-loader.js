// Load Chart.js with better error handling
(function() {
  function loadChartJs() {
    // Only load if not already loaded
    if (typeof Chart !== 'undefined') {
      console.log("Chart.js already loaded, skipping dynamic load");
      return;
    }
    
    console.log("Loading Chart.js dynamically");
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
    // Remove integrity check which is causing resource blocking
    // script.integrity = "sha384-+uu/vNX0x7MJXcJo8fVf11iScFA6Ebjy5cmjbXsEVILpOj0pIg4G+no12tTxIL1Q";
    script.crossOrigin = "anonymous";
    
    script.onload = function() {
      console.log("Chart.js loaded successfully");
      // Broadcast an event for other scripts to know Chart.js is ready
      const event = new CustomEvent('chartjs:loaded');
      document.dispatchEvent(event);
    };
    
    script.onerror = function(error) {
      console.error("Failed to load Chart.js:", error);
      // Set a global indicator that Chart.js failed to load
      window.chartJsLoadFailed = true;
      
      // Broadcast failure event
      const event = new CustomEvent('chartjs:error', { detail: { error } });
      document.dispatchEvent(event);
    };
    
    document.head.appendChild(script);
  }
  
  // Try to load as soon as possible
  loadChartJs();
  
  // Also ensure it's loaded when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof Chart === 'undefined') {
        loadChartJs();
      }
    });
  }
  
  // Create a global fallback mechanism
  window.ensureChartJsLoaded = function() {
    return new Promise((resolve, reject) => {
      if (typeof Chart !== 'undefined') {
        resolve(Chart);
      } else if (window.chartJsLoadFailed) {
        reject(new Error("Chart.js failed to load"));
      } else {
        document.addEventListener('chartjs:loaded', function() {
          resolve(Chart);
        }, { once: true });
        document.addEventListener('chartjs:error', function(event) {
          reject(event.detail.error);
        }, { once: true });
        loadChartJs();
      }
    });
  };
})();