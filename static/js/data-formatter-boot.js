/**
 * Data Formatter Boot Script
 * This script loads all fix modules in the correct order
 */

(function() {
  // CRITICAL INITIALIZATION GUARD: Prevent multiple initialization
  if (window.dataFormatterBootInitialized) {
    console.log('[Boot] Already initialized, skipping duplicate initialization');
    return;
  }
  window.dataFormatterBootInitialized = true;
  
  console.log("✅ data-formatter-boot.js loaded successfully");

  // Configuration
  const CONFIG = {
    debug: true,
    loadTimeoutMs: 10000, // 10 seconds timeout for script loading
    scripts: [
      // New dependency loader for React components
      {
        name: 'Dependency Loader',
        path: '/static/js/data-formatter-dependency-loader.js',
        priority: 1,
        isRequired: true
      },
      // Field mapping fix with React component loading
      {
        name: 'Field Mapping Fix',
        path: '/static/js/data-formatter-field-mapping-fix-v2.js', 
        priority: 2,
        isRequired: true
      },
      // Button functionality fix
      {
        name: 'Buttons Fix',
        path: '/static/js/data-formatter-buttons-fix.js',
        priority: 3,
        isRequired: true
      }
    ]
  };

  // Logger
  const Logger = {
    log: function(message, type = 'info') {
      console[type](`[Boot] ${message}`);
      
      // Also append to log if the function exists
      if (window.appendLog && typeof window.appendLog === 'function') {
        window.appendLog(message, type);
      }
    },
    info: function(message) { this.log(message, 'info'); },
    warn: function(message) { this.log(message, 'warn'); },
    error: function(message) { this.log(message, 'error'); }
  };

  // Script loader
  const ScriptLoader = {
    loadedScripts: {},
    loadingPromises: {},
    
    // Load a script file
    loadScript: function(scriptConfig) {
      // Skip if already loaded
      if (this.loadedScripts[scriptConfig.name]) {
        return Promise.resolve();
      }
      
      // Return existing promise if already loading
      if (this.loadingPromises[scriptConfig.name]) {
        return this.loadingPromises[scriptConfig.name];
      }
      
      Logger.info(`Loading script: ${scriptConfig.name} (${scriptConfig.path})`);
      
      // Create a promise with timeout
      const loadPromise = new Promise((resolve, reject) => {
        // Create timeout
        const timeoutId = setTimeout(() => {
          reject(new Error(`Timeout loading ${scriptConfig.name}`));
        }, CONFIG.loadTimeoutMs);
        
        // Create script element
        const script = document.createElement('script');
        script.src = scriptConfig.path;
        script.async = false; // Maintain order
        
        // Handle success
        script.onload = () => {
          clearTimeout(timeoutId);
          Logger.info(`Successfully loaded: ${scriptConfig.name}`);
          this.loadedScripts[scriptConfig.name] = true;
          resolve();
        };
        
        // Handle error
        script.onerror = () => {
          clearTimeout(timeoutId);
          const error = new Error(`Failed to load: ${scriptConfig.name}`);
          Logger.error(error.message);
          
          if (scriptConfig.isRequired) {
            reject(error);
          } else {
            // For non-required scripts, resolve anyway
            Logger.warn(`Non-required script failed to load: ${scriptConfig.name}, continuing anyway`);
            resolve();
          }
        };
        
        // Add to document
        document.head.appendChild(script);
      });
      
      // Store promise
      this.loadingPromises[scriptConfig.name] = loadPromise;
      
      return loadPromise;
    },
    
    // Load all scripts in priority order
    loadAllScripts: function() {
      // Sort scripts by priority
      const sortedScripts = [...CONFIG.scripts].sort((a, b) => a.priority - b.priority);
      
      // Load each script in sequence
      return sortedScripts.reduce((promise, scriptConfig) => {
        return promise.then(() => this.loadScript(scriptConfig));
      }, Promise.resolve());
    }
  };

  // Boot process
  const Boot = {
    init: function() {
      Logger.info("Initializing Data Formatter Boot Process");
      
      // Load all scripts
      ScriptLoader.loadAllScripts()
        .then(() => {
          Logger.info("All fix scripts loaded successfully");
          
          // Dispatch event to notify that all components are ready
          window.dispatchEvent(new CustomEvent('dataFormatterReady'));
          
          // Log success
          Logger.info("Data Formatter Boot process completed successfully");
        })
        .catch(error => {
          Logger.error(`Failed to complete Data Formatter Boot process: ${error.message}`);
          
          // Show error message
          this.showErrorMessage(error);
        });
    },
    
    // Show error message in the UI
    showErrorMessage: function(error) {
      const errorContainer = document.createElement('div');
      errorContainer.className = 'boot-error';
      errorContainer.style.padding = '15px';
      errorContainer.style.margin = '10px 0';
      errorContainer.style.backgroundColor = '#f8d7da';
      errorContainer.style.color = '#721c24';
      errorContainer.style.borderRadius = '4px';
      errorContainer.style.border = '1px solid #f5c6cb';
      
      errorContainer.innerHTML = `
        <h3 style="margin-top: 0;">Data Formatter Error</h3>
        <p>There was an error initializing the Data Formatter components:</p>
        <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px;">${error.message}</pre>
        <p>Please refresh the page and try again. If the error persists, contact support.</p>
      `;
      
      // Find a good location to show the error
      const targetElement = document.querySelector('#formatter-container') || 
                           document.querySelector('#data-formatter') || 
                           document.querySelector('main') || 
                           document.body;
      
      if (targetElement) {
        // Insert at the beginning
        if (targetElement.firstChild) {
          targetElement.insertBefore(errorContainer, targetElement.firstChild);
        } else {
          targetElement.appendChild(errorContainer);
        }
      }
    }
  };

  // Initialize immediately if document is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    Boot.init();
  } else {
    // Otherwise wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
      Boot.init();
    });
  }

  // Expose globally
  window.DataFormatterBoot = Boot;
})();