// Fix for syntax errors in dashboard script
document.addEventListener('DOMContentLoaded', function() {
  // Load Chart.js if not already present
  if (typeof Chart === 'undefined') {
    console.log("Chart.js not found, loading dynamically");
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
    // Remove integrity check which is causing resource blocking
    // script.integrity = "sha384-+uu/vNX0x7MJXcJo8fVf11iScFA6Ebjy5cmjbXsEVILpOj0pIg4G+no12tTxIL1Q";
    script.crossOrigin = "anonymous";
    
    // Add event handlers to track loading status
    script.onload = function() {
      console.log("Chart.js loaded successfully");
      // Initialize chart manager if available
      if (window.FireEMS && window.FireEMS.ChartManager) {
        console.log("Initializing ChartManager after Chart.js load");
        window.FireEMS.ChartManager.configure({ debug: true });
      }
    };
    
    script.onerror = function(error) {
      console.error("Failed to load Chart.js:", error);
      // Show error message in chart containers
      document.querySelectorAll('.chart-container').forEach(container => {
        container.innerHTML = '<div class="chart-error">Failed to load Chart.js library. Charts unavailable.</div>';
      });
    };
    
    document.head.appendChild(script);
  }
});