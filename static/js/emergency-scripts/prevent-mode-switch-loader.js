// Load prevent mode switch with multi-path support
(function() {
  function loadPreventModeScript() {
    console.log("Loading prevent mode switch script");
    const paths = [
      '/static/js/emergency/prevent-mode-switch.js',
      '/app-static/js/emergency/prevent-mode-switch.js',
      '/direct-static/js/emergency/prevent-mode-switch.js'
    ];
    
    function tryLoadFromPath(index) {
      if (index >= paths.length) {
        console.error("Failed to load prevent mode switch from all paths");
        return;
      }
      
      const script = document.createElement('script');
      script.src = paths[index];
      
      script.onload = function() {
        console.log("Prevent mode switch loaded successfully from " + paths[index]);
      };
      
      script.onerror = function() {
        console.warn("Failed to load prevent mode switch from " + paths[index] + ", trying next path");
        tryLoadFromPath(index + 1);
      };
      
      document.head.appendChild(script);
    }
    
    tryLoadFromPath(0);
  }
  
  // Load now
  loadPreventModeScript();
})();