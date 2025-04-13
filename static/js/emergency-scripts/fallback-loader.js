// Load emergency chart fallback with multi-path support
(function() {
  function loadFallbackScript() {
    console.log("Loading chart fallback script");
    const paths = [
      '/static/js/emergency/chart-fallback.js',
      '/app-static/js/emergency/chart-fallback.js',
      '/direct-static/js/emergency/chart-fallback.js'
    ];
    
    function tryLoadFromPath(index) {
      if (index >= paths.length) {
        console.error("Failed to load chart fallback from all paths");
        return;
      }
      
      const script = document.createElement('script');
      script.src = paths[index];
      
      script.onload = function() {
        console.log("Chart fallback loaded successfully from " + paths[index]);
      };
      
      script.onerror = function() {
        console.warn("Failed to load chart fallback from " + paths[index] + ", trying next path");
        tryLoadFromPath(index + 1);
      };
      
      document.head.appendChild(script);
    }
    
    tryLoadFromPath(0);
  }
  
  // Load now
  loadFallbackScript();
})();