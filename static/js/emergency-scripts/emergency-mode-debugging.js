console.log("EMERGENCY INIT: Starting emergency mode checks");

// Immediately check for emergency data in URL
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const emergencyData = urlParams.get('emergency_data');
  if (emergencyData) {
    console.log("EMERGENCY DATA DETECTED IN URL: " + emergencyData);
    // Add visual indicator that we've detected emergency data in URL
    setTimeout(function() {
      const body = document.body;
      const indicator = document.createElement('div');
      indicator.style.cssText = "position: fixed; top: 0; left: 0; background: #ff9800; color: white; padding: 5px; z-index: 9999;";
      indicator.textContent = "Emergency data detected: " + emergencyData;
      body.appendChild(indicator);
      
      // Try immediate retrieval from localStorage
      try {
        const storedData = localStorage.getItem(emergencyData);
        if (storedData) {
          console.log("EMERGENCY DATA FOUND IN STORAGE: " + emergencyData.substring(0, 20) + "...");
          indicator.style.background = "#4caf50";
          indicator.textContent = "Emergency data ready: " + emergencyData;
        } else {
          console.error("EMERGENCY DATA NOT FOUND IN STORAGE");
          indicator.style.background = "#f44336";
          indicator.textContent = "Emergency data missing: " + emergencyData;
        }
      } catch (e) {
        console.error("EMERGENCY STORAGE ERROR:", e);
      }
    }, 500);
    
    // Load diagnostic tools for emergency mode with path fallbacks
    setTimeout(function() {
      console.log("Loading emergency diagnostic tools...");
      
      function loadDiagnosticTools() {
        const paths = [
          '/static/js/emergency-diagnostic.js',
          '/app-static/js/emergency-diagnostic.js',
          '/direct-static/js/emergency-diagnostic.js'
        ];
        
        function tryNextPath(index) {
          if (index >= paths.length) {
            console.error("Failed to load emergency diagnostic tools from all paths");
            return;
          }
          
          const script = document.createElement('script');
          script.src = paths[index];
          
          script.onload = function() {
            console.log("Diagnostic tools loaded successfully from " + paths[index]);
          };
          
          script.onerror = function() {
            console.warn("Failed to load diagnostic tools from " + paths[index] + ", trying next path");
            tryNextPath(index + 1);
          };
          
          document.head.appendChild(script);
        }
        
        tryNextPath(0);
      }
      
      loadDiagnosticTools();
    }, 1000);
  }
})();