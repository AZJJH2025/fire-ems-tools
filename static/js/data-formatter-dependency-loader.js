/**
 * Data Formatter Dependency Loader
 * Handles proper loading of all React-related dependencies in the correct order
 */

(function() {
  // CRITICAL INITIALIZATION GUARD: Prevent multiple initialization
  if (window.dependencyLoaderInitialized) {
    console.log('[DependencyLoader] Already initialized, skipping duplicate initialization');
    return;
  }
  window.dependencyLoaderInitialized = true;
  
  console.log("✅ data-formatter-dependency-loader.js loaded successfully");
  
  // Configuration
  const DEPENDENCIES = {
    react: {
      url: 'https://unpkg.com/react@17/umd/react.production.min.js',
      global: 'React',
      priority: 1
    },
    reactDom: {
      url: 'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
      global: 'ReactDOM',
      priority: 2,
      requires: ['react']
    },
    materialUI: {
      url: 'https://unpkg.com/@material-ui/core@4.12.3/umd/material-ui.production.min.js',
      global: 'MaterialUI',
      priority: 3,
      requires: ['react', 'reactDom']
    },
    reactBeautifulDnd: {
      url: 'https://unpkg.com/react-beautiful-dnd@13.1.0/dist/react-beautiful-dnd.min.js',
      global: 'ReactBeautifulDnD',
      priority: 4,
      requires: ['react', 'reactDom']
    },
    dataFormatter: {
      url: '/static/js/react-data-formatter/dist/data-formatter.js', 
      global: 'DataFormatterUI',
      priority: 5,
      requires: ['react', 'reactDom', 'materialUI', 'reactBeautifulDnd']
    }
  };
  
  // Logger
  const Logger = {
    log: function(message, type = 'info') {
      console[type](`[DependencyLoader] ${message}`);
      // Also append to log if the function exists
      if (window.appendLog && typeof window.appendLog === 'function') {
        window.appendLog(message);
      }
    },
    info: function(message) { this.log(message, 'info'); },
    warn: function(message) { this.log(message, 'warn'); },
    error: function(message) { this.log(message, 'error'); }
  };
  
  // Dependency loader
  const DependencyLoader = {
    // Keep track of loaded dependencies
    loaded: {},
    loading: {},
    
    // Initialization
    init: function() {
      Logger.info("Initializing dependency loader");
      
      // Check which dependencies are already available
      Object.keys(DEPENDENCIES).forEach(key => {
        const dep = DEPENDENCIES[key];
        if (window[dep.global]) {
          Logger.info(`Dependency ${key} (${dep.global}) already available`);
          this.loaded[key] = true;
        }
      });
      
      // Dispatch custom event when loading completes
      this.loadAllDependencies().then(() => {
        Logger.info("All dependencies loaded successfully");
        window.dispatchEvent(new CustomEvent('dataFormatterDependenciesLoaded'));
      }).catch(error => {
        Logger.error(`Failed to load dependencies: ${error.message}`);
      });
    },
    
    // Load all dependencies in the correct order
    loadAllDependencies: function() {
      // Create a priority-ordered list of dependencies to load
      const toLoad = Object.keys(DEPENDENCIES)
        .filter(key => !this.loaded[key])
        .sort((a, b) => DEPENDENCIES[a].priority - DEPENDENCIES[b].priority);
      
      // Load dependencies sequentially to ensure proper order
      return toLoad.reduce((promise, key) => {
        return promise.then(() => this.loadDependency(key));
      }, Promise.resolve());
    },
    
    // Load a single dependency
    loadDependency: function(key) {
      const dep = DEPENDENCIES[key];
      
      // Skip if already loaded
      if (this.loaded[key]) {
        return Promise.resolve();
      }
      
      // Skip if currently loading
      if (this.loading[key]) {
        return this.loading[key];
      }
      
      Logger.info(`Loading dependency: ${key} from ${dep.url}`);
      
      // Check if all required dependencies are loaded
      if (dep.requires && dep.requires.length > 0) {
        const missingDeps = dep.requires.filter(req => !this.loaded[req]);
        if (missingDeps.length > 0) {
          Logger.warn(`Cannot load ${key} yet, missing dependencies: ${missingDeps.join(', ')}`);
          const error = new Error(`Missing dependencies for ${key}: ${missingDeps.join(', ')}`);
          return Promise.reject(error);
        }
      }
      
      // Create a promise to load the script
      const loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = dep.url;
        script.async = false; // Important: maintain loading order
        
        script.onload = () => {
          // Check if the global variable is now available
          if (!window[dep.global]) {
            const error = new Error(`Dependency ${key} loaded but global ${dep.global} not found`);
            Logger.error(error.message);
            reject(error);
            return;
          }
          
          Logger.info(`Successfully loaded dependency: ${key} (${dep.global})`);
          this.loaded[key] = true;
          delete this.loading[key];
          resolve();
        };
        
        script.onerror = () => {
          const error = new Error(`Failed to load dependency: ${key} from ${dep.url}`);
          Logger.error(error.message);
          delete this.loading[key];
          reject(error);
        };
        
        document.head.appendChild(script);
      });
      
      this.loading[key] = loadPromise;
      return loadPromise;
    },
    
    // Check if all dependencies are loaded
    allDependenciesLoaded: function() {
      return Object.keys(DEPENDENCIES).every(key => this.loaded[key]);
    }
  };
  
  // Initialize the loader
  DependencyLoader.init();
  
  // Expose the dependency loader globally
  window.DependencyLoader = DependencyLoader;
})();