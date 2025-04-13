// Load dashboard script with multi-path support
(function() {
  function loadDashboardScript() {
    console.log("Loading dashboard script");
    const version = "v=20250413"; // Update version for cache busting
    const paths = [
      '/static/fire-ems-dashboard.js?' + version,
      '/app-static/fire-ems-dashboard.js?' + version,
      '/direct-static/fire-ems-dashboard.js?' + version
    ];
    
    function tryLoadFromPath(index) {
      if (index >= paths.length) {
        console.error("Failed to load dashboard script from all paths");
        // Add visual indicator for user
        const errorNote = document.createElement('div');
        errorNote.style.background = '#fff0f0';
        errorNote.style.color = '#cc0000';
        errorNote.style.padding = '15px';
        errorNote.style.margin = '15px 0';
        errorNote.style.borderRadius = '4px';
        errorNote.innerHTML = '<strong>Error:</strong> Failed to load essential scripts. ' + 
                              'Try refreshing the page or check your internet connection.';
        document.body.insertBefore(errorNote, document.body.firstChild);
        return;
      }
      
      const script = document.createElement('script');
      script.src = paths[index];
      
      script.onload = function() {
        console.log("Dashboard script loaded successfully from " + paths[index]);
      };
      
      script.onerror = function() {
        console.warn("Failed to load dashboard script from " + paths[index] + ", trying next path");
        tryLoadFromPath(index + 1);
      };
      
      document.head.appendChild(script);
    }
    
    tryLoadFromPath(0);
  }
  
  // Load now
  loadDashboardScript();
})();