// Load the framework initialization script
(function() {
  function loadFramework() {
    console.log("Loading FireEMS Framework");
    const script = document.createElement('script');
    script.src = '/static/js/fireems-framework.js';
    
    script.onerror = function() {
      console.warn("Failed to load framework from primary path, trying fallback...");
      const fallbackScript = document.createElement('script');
      fallbackScript.src = '/app-static/js/fireems-framework.js';
      
      fallbackScript.onerror = function() {
        console.error("Failed to load framework from all paths");
      };
      
      document.head.appendChild(fallbackScript);
    };
    
    document.head.appendChild(script);
  }
  
  // Load the framework when the document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFramework);
  } else {
    loadFramework();
  }
})();