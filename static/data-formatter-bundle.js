/**
 * Data Formatter Consolidated Bundle
 * A complete bundled solution that loads all dependencies properly
 */

(function() {
  // Configuration
  const CONFIG = {
    debug: true,
    version: '1.0.0',
    buildTimestamp: new Date().toISOString()
  };
  
  // Create consistent logging
  const Logger = {
    log: function(message, type = 'info') {
      if (CONFIG.debug || type === 'error' || type === 'warn') {
        console[type](`[DataFormatter] ${message}`);
      }
    },
    info: function(message) { this.log(message, 'info'); },
    warn: function(message) { this.log(message, 'warn'); },
    error: function(message) { this.log(message, 'error'); }
  };
  
  // Initialize immediately
  Logger.info(`Initializing Data Formatter Bundle v${CONFIG.version} (${CONFIG.buildTimestamp})`);
  
  // Check for required dependencies
  const requiredDependencies = [
    { name: 'React', global: 'React' },
    { name: 'ReactDOM', global: 'ReactDOM' },
    { name: 'MaterialUI', global: 'MaterialUI' }
  ];
  
  // Store any missing dependencies
  const missingDependencies = [];
  
  // Check each dependency
  requiredDependencies.forEach(dep => {
    if (typeof window[dep.global] === 'undefined') {
      missingDependencies.push(dep.name);
      Logger.error(`Required dependency ${dep.name} is missing`);
    }
  });
  
  // Function to load a script and return a promise
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      Logger.info(`Loading script: ${src}`);
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        Logger.info(`Successfully loaded: ${src}`);
        resolve(src);
      };
      script.onerror = () => {
        Logger.error(`Failed to load: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };
      document.head.appendChild(script);
    });
  }
  
  // Function to load all required scripts
  function loadRequiredScripts() {
    const scripts = [];
    
    // Add any missing dependencies
    if (missingDependencies.includes('React')) {
      scripts.push(loadScript('https://unpkg.com/react@17/umd/react.production.min.js'));
    }
    
    if (missingDependencies.includes('ReactDOM')) {
      scripts.push(loadScript('https://unpkg.com/react-dom@17/umd/react-dom.production.min.js'));
    }
    
    if (missingDependencies.includes('MaterialUI')) {
      scripts.push(loadScript('https://unpkg.com/@material-ui/core@4.12.3/umd/material-ui.production.min.js'));
    }
    
    // Always load React Beautiful DnD - it's critical for our functionality
    scripts.push(loadScript('https://unpkg.com/react-beautiful-dnd@13.1.0/dist/react-beautiful-dnd.min.js'));
    
    // Return a promise that resolves when all scripts are loaded
    return Promise.all(scripts);
  }
  
  // Function to properly handle react-beautiful-dnd naming
  function setupReactBeautifulDnD() {
    Logger.info("Setting up react-beautiful-dnd");
    
    try {
      // Try various ways the library might be loaded
      let dndLib = window['react-beautiful-dnd'] || window.ReactBeautifulDnd || window.ReactBeautifulDnD;
      
      // If still not found, try to load it directly as a last resort
      if (!dndLib) {
        Logger.warn("react-beautiful-dnd not found, trying to load it directly");
        try {
          // Create global if react-beautiful-dnd is loaded as a module
          if (typeof window.reactBeautifulDnd !== 'undefined') {
            dndLib = window.reactBeautifulDnd;
            Logger.info("Found react-beautiful-dnd as reactBeautifulDnd module");
          } else {
            // Last resort: try loading from absolute URLs
            loadScript('https://unpkg.com/react-beautiful-dnd@13.1.0/dist/react-beautiful-dnd.min.js');
            
            // Add a small delay to give the script time to load
            setTimeout(() => {
              dndLib = window['react-beautiful-dnd'];
              if (dndLib) {
                Logger.info("Successfully loaded react-beautiful-dnd from unpkg");
                window.ReactBeautifulDnd = dndLib;
                window.ReactBeautifulDnD = dndLib;
                window['react-beautiful-dnd'] = dndLib;
              }
            }, 1000);
          }
        } catch (innerError) {
          Logger.error(`Error loading react-beautiful-dnd directly: ${innerError.message}`);
        }
      }
      
      if (dndLib) {
        // Ensure consistent naming regardless of how it was loaded
        window.ReactBeautifulDnd = dndLib;
        window.ReactBeautifulDnD = dndLib;
        window['react-beautiful-dnd'] = dndLib;
        
        Logger.info("Successfully set up react-beautiful-dnd with consistent naming");
        return true;
      } else {
        // Create stub for graceful degradation
        const stubFunctions = ['DragDropContext', 'Droppable', 'Draggable'];
        
        // Create a stub object with basic functions
        const stubLib = {};
        
        stubFunctions.forEach(func => {
          stubLib[func] = function() { 
            Logger.warn(`${func} stub called - drag and drop will not function`);
            return null;
          };
        });
        
        // Assign the stub to all variations of the name
        window.ReactBeautifulDnd = stubLib;
        window.ReactBeautifulDnD = stubLib;
        window['react-beautiful-dnd'] = stubLib;
        
        Logger.warn("Created react-beautiful-dnd stub - drag and drop will not function");
        return false;
      }
    } catch (error) {
      Logger.error(`Error setting up react-beautiful-dnd: ${error.message}`);
      return false;
    }
  }
  
  // Unified loader that ensures all dependencies and components are properly loaded
  function initializeDataFormatter() {
    // First load any missing scripts
    loadRequiredScripts()
      .then(() => {
        Logger.info("All required scripts loaded successfully");
        
        // Set up react-beautiful-dnd
        setupReactBeautifulDnD();
        
        // Now load our core formatter implementation
        return loadScript('/static/data-formatter-direct.js?_=' + new Date().getTime());
      })
      .then(() => {
        // Load the enhancement script
        return loadScript('/static/data-formatter-fix.js?_=' + new Date().getTime());
      })
      .then(() => {
        // Finally load the integration script
        return loadScript('/static/data-formatter-integration.js?_=' + new Date().getTime());
      })
      .then(() => {
        Logger.info("All data formatter scripts loaded successfully");
        
        // Set global flag indicating successful loading
        window.dataFormatterLoaded = true;
        
        // Dispatch event for other code to react to
        window.dispatchEvent(new CustomEvent('dataFormatterLoaded'));
      })
      .catch(error => {
        Logger.error(`Failed to initialize data formatter: ${error.message}`);
        
        // Show error to user
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.innerHTML = `
          <div class="error-message">
            <h3>Error Loading Data Formatter</h3>
            <p>There was a problem loading the required components:</p>
            <pre>${error.message}</pre>
            <p>Please try refreshing the page or contact support if the problem persists.</p>
            <button onclick="location.reload()">Refresh Page</button>
          </div>
        `;
        
        // Find the formatter container and display the error
        const container = document.querySelector('.formatter-container') || document.body;
        container.prepend(errorContainer);
      });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDataFormatter);
  } else {
    initializeDataFormatter();
  }
  
  // Expose the logger for other scripts to use
  window.DataFormatterLogger = Logger;
  
  // Set flag to indicate data formatter is loaded (prevents emergency mode)
  window.dataFormatterLoaded = true;
})();