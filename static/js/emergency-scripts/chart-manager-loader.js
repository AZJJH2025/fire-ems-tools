// Load chart manager with multi-path support
(function() {
  function loadChartManager() {
    console.log("Loading chart manager script");
    const paths = [
      '/static/js/chart-manager.js',
      '/app-static/js/chart-manager.js',
      '/direct-static/js/chart-manager.js'
    ];
    
    function tryLoadFromPath(index) {
      if (index >= paths.length) {
        console.error("Failed to load chart manager from all paths");
        return;
      }
      
      const script = document.createElement('script');
      script.src = paths[index];
      
      script.onload = function() {
        console.log("Chart manager loaded successfully from " + paths[index]);
      };
      
      script.onerror = function() {
        console.warn("Failed to load chart manager from " + paths[index] + ", trying next path");
        tryLoadFromPath(index + 1);
      };
      
      document.head.appendChild(script);
    }
    
    tryLoadFromPath(0);
  }
  
  // Load now
  loadChartManager();
})();