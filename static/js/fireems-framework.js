/**
 * FireEMS.ai Framework Initialization
 * 
 * This is the main entry point for the FireEMS.ai resilience framework.
 * It loads the core modules (core, resilience, state) in the correct order
 * and initializes them once the DOM is ready.
 * 
 * Version: 1.0.0
 */

(function() {
  // Configuration
  const CONFIG = {
    autoInitialize: true,
    coreModules: [
      '/static/js/fireems-core.js',
      '/static/js/fireems-resilience.js',
      '/static/js/fireems-state.js'
    ],
    fallbackPathPrefix: '/app-static/js/',
    directPathPrefix: '/direct-static/js/',
    loadTimeout: 5000
  };

  // For tracking loaded modules
  const loadedModules = {};
  
  // Script loading with multiple fallbacks
  function loadScript(url, onSuccess, onError) {
    // Generate fallback URLs
    const fallbackUrl = url.replace('/static/', CONFIG.directPathPrefix);
    const emergencyUrl = url.replace('/static/', CONFIG.fallbackPathPrefix);
    
    console.log(`[FireEMS Framework] Loading ${url}`);
    
    // Start a load timeout timer
    const timeoutId = setTimeout(() => {
      console.warn(`[FireEMS Framework] Timeout loading ${url}, trying fallback`);
      tryLoadFallback();
    }, CONFIG.loadTimeout);
    
    // First attempt - primary URL
    const script = document.createElement('script');
    script.src = url;
    
    script.onload = function() {
      console.log(`[FireEMS Framework] Successfully loaded ${url}`);
      clearTimeout(timeoutId);
      if (onSuccess) onSuccess();
    };
    
    script.onerror = function() {
      console.warn(`[FireEMS Framework] Failed to load ${url}, trying fallback`);
      tryLoadFallback();
    };
    
    document.head.appendChild(script);
    
    // Attempt to load from fallback path
    function tryLoadFallback() {
      clearTimeout(timeoutId);
      
      console.log(`[FireEMS Framework] Trying fallback: ${fallbackUrl}`);
      const fallbackScript = document.createElement('script');
      fallbackScript.src = fallbackUrl;
      
      fallbackScript.onload = function() {
        console.log(`[FireEMS Framework] Successfully loaded fallback ${fallbackUrl}`);
        if (onSuccess) onSuccess();
      };
      
      fallbackScript.onerror = function() {
        console.warn(`[FireEMS Framework] Fallback failed, trying emergency path: ${emergencyUrl}`);
        tryLoadEmergency();
      };
      
      document.head.appendChild(fallbackScript);
    }
    
    // Last attempt - emergency path
    function tryLoadEmergency() {
      console.log(`[FireEMS Framework] Trying emergency path: ${emergencyUrl}`);
      const emergencyScript = document.createElement('script');
      emergencyScript.src = emergencyUrl;
      
      emergencyScript.onload = function() {
        console.log(`[FireEMS Framework] Successfully loaded from emergency path ${emergencyUrl}`);
        if (onSuccess) onSuccess();
      };
      
      emergencyScript.onerror = function() {
        console.error(`[FireEMS Framework] All loading attempts failed for ${url}`);
        if (onError) onError();
      };
      
      document.head.appendChild(emergencyScript);
    }
  }
  
  // Load modules in sequence
  function loadModulesSequentially(modules, index = 0) {
    if (index >= modules.length) {
      // All modules loaded, initialize the framework
      initializeFramework();
      return;
    }
    
    const modulePath = modules[index];
    const moduleName = modulePath.split('/').pop().replace('.js', '');
    
    loadScript(modulePath, 
      // Success callback - load next module
      function() {
        loadedModules[moduleName] = true;
        loadModulesSequentially(modules, index + 1);
      },
      // Error callback - attempt to continue anyway
      function() {
        loadedModules[moduleName] = false;
        console.error(`[FireEMS Framework] Failed to load module: ${moduleName}`);
        // Continue to next module anyway
        loadModulesSequentially(modules, index + 1);
      }
    );
  }
  
  // Initialize the framework once modules are loaded
  function initializeFramework() {
    console.log('[FireEMS Framework] All modules loaded, initializing framework');
    
    if (window.FireEMS) {
      // Core was loaded successfully
      if (window.FireEMS.Core) {
        // Initialize core first
        window.FireEMS.Core.init()
          .then(() => {
            console.log('[FireEMS Framework] Core initialized, configuring application');
            
            // Configure tool-specific functionality based on current page
            configurePage();
          })
          .catch(error => {
            console.error('[FireEMS Framework] Error initializing Core:', error);
            enableEmergencyMode();
          });
      } else {
        console.error('[FireEMS Framework] Core module not available');
        enableEmergencyMode();
      }
    } else {
      console.error('[FireEMS Framework] FireEMS namespace not available');
      enableEmergencyMode();
    }
  }
  
  // Configure page-specific functionality
  function configurePage() {
    // Detect current page
    const path = window.location.pathname;
    const pageName = path.split('/').pop();
    
    console.log(`[FireEMS Framework] Configuring for: ${pageName || 'index'}`);
    
    // Configure based on page
    if (pageName === 'data-formatter.html' || path.includes('data-formatter')) {
      configureDataFormatter();
    } else if (pageName === 'fire-ems-dashboard.html' || path.includes('fire-ems-dashboard')) {
      configureResponseTimeAnalyzer();
    } else if (pageName === 'incident-logger.html' || path.includes('incident-logger')) {
      configureIncidentLogger();
    } else {
      // Default configuration for other pages
      console.log('[FireEMS Framework] Using default configuration for this page');
    }
    
    // Register common event listeners
    registerCommonEventListeners();
  }
  
  // Configure the Data Formatter page
  function configureDataFormatter() {
    console.log('[FireEMS Framework] Configuring Data Formatter');
    
    // Override the Send to Tool button if it exists
    const sendToToolBtn = document.getElementById('send-to-tool-btn');
    if (sendToToolBtn) {
      // Store original handler if it exists
      const originalOnClick = sendToToolBtn.onclick;
      
      // Set new handler
      sendToToolBtn.onclick = function(event) {
        // If original handler exists and we're not in emergency mode, call it first
        if (originalOnClick && window.FireEMS.mode !== 'emergency') {
          // Call original handler in its original context
          originalOnClick.call(this, event);
          
          // If the event was prevented by the original handler, respect that
          if (event.defaultPrevented) {
            return;
          }
        }
        
        // Get the data and target tool
        const data = window.formatterState?.transformedData;
        const targetTool = document.getElementById('target-tool')?.value || 'fire-ems-dashboard';
        
        if (!data) {
          console.error('[FireEMS Framework] No data available to send');
          alert('No data available to send. Please transform your data first.');
          return;
        }
        
        console.log(`[FireEMS Framework] Sending data to ${targetTool}`);
        
        // Use the state service for emergency data transfer
        if (window.FireEMS.StateService) {
          try {
            // Store the data with the state service
            const dataId = window.FireEMS.StateService.storeEmergencyData(data, {
              metadata: {
                source: 'data-formatter',
                timestamp: Date.now(),
                targetTool: targetTool
              }
            });
            
            if (dataId) {
              console.log(`[FireEMS Framework] Data stored with ID: ${dataId}`);
              
              // Map tool IDs to routes for consistency
              const toolRouteMap = {
                'response-time': 'fire-ems-dashboard',
                'response-time-analyzer': 'fire-ems-dashboard',
                'fire-ems-dashboard': 'fire-ems-dashboard',
                'call-density': 'call-density-heatmap',
                'call-density-heatmap': 'call-density-heatmap',
                'isochrone': 'isochrone-map',
                'isochrone-map': 'isochrone-map',
                'incident-logger': 'incident-logger'
              };
                
              // Get the correct route
              const targetRoute = toolRouteMap[targetTool] || targetTool;
              const origin = window.location.origin || '';
                  
              // Generate timestamp for cache busting
              const timestamp = Date.now();
              
              // Navigate to the target tool with the data ID
              console.log(`[FireEMS Framework] Navigating to: ${origin}/${targetRoute}?emergency_data=${encodeURIComponent(dataId)}&t=${timestamp}`);
                  
              // For debugging purposes, store the navigation info
              sessionStorage.setItem('last_framework_navigation', JSON.stringify({
                dataId,
                targetTool,
                targetRoute,
                timestamp: timestamp,
                encodedDataId: encodeURIComponent(dataId),
                fullUrl: `${origin}/${targetRoute}?emergency_data=${encodeURIComponent(dataId)}&t=${timestamp}`
              }));
              
              // Create backup copies for redundancy
              try {
                // Store a backup copy with standard key
                const backupDataId = 'emergency_data_latest';
                const serializedBackup = localStorage.getItem(dataId);
                
                if (serializedBackup) {
                  localStorage.setItem(backupDataId, serializedBackup);
                  sessionStorage.setItem(backupDataId, serializedBackup);
                  console.log(`[FireEMS Framework] Created backup copies with key: ${backupDataId}`);
                }
              } catch (e) {
                console.warn('[FireEMS Framework] Could not create backup copies:', e);
              }
                  
              window.location.href = `${origin}/${targetRoute}?emergency_data=${encodeURIComponent(dataId)}&t=${timestamp}`;
            } else {
              throw new Error('Failed to store data');
            }
          } catch (error) {
            console.error('[FireEMS Framework] Error sending data:', error);
            alert('Error sending data: ' + error.message);
            
            // Log extra debug info
            console.error('[FireEMS Framework] Debug info:', {
              targetTool,
              dataExists: !!data,
              dataLength: Array.isArray(data) ? data.length : 'not array',
              errorMessage: error.message,
              errorStack: error.stack
            });
          }
        } else {
          console.warn('[FireEMS Framework] StateService not available, using emergency mode library');
          
          // Fall back to emergency mode library if available
          if (window.FireEMS.EmergencyMode) {
            window.FireEMS.EmergencyMode.sendToTool(data, targetTool);
          } else {
            // Last resort - try to use localStorage directly
            try {
              const dataId = 'emergency_data_' + Date.now();
              localStorage.setItem(dataId, JSON.stringify(data));
              window.location.href = `/${targetTool}?emergency_data=${dataId}`;
            } catch (e) {
              alert('Failed to send data to tool: ' + e.message);
            }
          }
        }
      };
      
      console.log('[FireEMS Framework] Send to Tool button configured');
    }
    
    // Override Download button with resilient implementation
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
      // Store original handler if it exists
      const originalOnClick = downloadBtn.onclick;
      
      // Set new handler
      downloadBtn.onclick = function(event) {
        // If original handler exists and we're not in emergency mode, call it first
        if (originalOnClick && window.FireEMS.mode !== 'emergency') {
          // Call original handler in its original context
          originalOnClick.call(this, event);
          
          // If the event was prevented by the original handler, respect that
          if (event.defaultPrevented) {
            return;
          }
        }
        
        // Get the data
        const data = window.formatterState?.transformedData;
        if (!data) {
          console.error('[FireEMS Framework] No data available to download');
          alert('No data available to download. Please transform your data first.');
          return;
        }
        
        // Get output format
        const format = document.getElementById('output-format')?.value || 'csv';
        
        console.log(`[FireEMS Framework] Downloading data in ${format} format`);
        
        // Use emergency mode download if available
        if (window.FireEMS.EmergencyMode) {
          window.FireEMS.EmergencyMode.downloadData(data, {
            format: format,
            filename: 'fireems-formatted-data'
          });
        } else {
          // Fallback implementation
          downloadDataFallback(data, format);
        }
      };
      
      console.log('[FireEMS Framework] Download button configured');
    }
  }
  
  // Configure the Response Time Analyzer page
  function configureResponseTimeAnalyzer() {
    console.log('[FireEMS Framework] Configuring Response Time Analyzer');
    
    // Check for emergency data in URL
    const urlParams = new URLSearchParams(window.location.search);
    const emergencyDataId = urlParams.get('emergency_data');
    const timestamp = urlParams.get('t'); // Get timestamp parameter if available
    
    if (emergencyDataId) {
      console.log(`[FireEMS Framework] Found emergency data ID: ${emergencyDataId} (timestamp: ${timestamp || 'none'})`);
      
      // Create a list of data retrieval strategies to try in sequence
      const retrievalStrategies = [
        // Strategy 1: Use the StateService if available
        function tryStateService() {
          if (!window.FireEMS.StateService) return null;
          
          try {
            console.log('[FireEMS Framework] Trying StateService for data retrieval');
            return window.FireEMS.StateService.retrieveEmergencyData(emergencyDataId, false);
          } catch (e) {
            console.warn('[FireEMS Framework] StateService retrieval failed:', e);
            return null;
          }
        },
        
        // Strategy 2: Use EmergencyMode library if available
        function tryEmergencyMode() {
          if (!window.FireEMS.EmergencyMode) return null;
          
          try {
            console.log('[FireEMS Framework] Trying EmergencyMode.retrieveData');
            return window.FireEMS.EmergencyMode.retrieveData(emergencyDataId, false);
          } catch (e) {
            console.warn('[FireEMS Framework] EmergencyMode retrieval failed:', e);
            return null;
          }
        },
        
        // Strategy 3: Try direct localStorage with the provided ID
        function tryLocalStorage() {
          try {
            console.log('[FireEMS Framework] Trying direct localStorage access');
            const serialized = localStorage.getItem(emergencyDataId);
            if (!serialized) return null;
            
            const parsed = JSON.parse(serialized);
            return parsed.data || parsed; // Handle both wrapped and unwrapped formats
          } catch (e) {
            console.warn('[FireEMS Framework] Direct localStorage retrieval failed:', e);
            return null;
          }
        },
        
        // Strategy 4: Try sessionStorage with the provided ID
        function trySessionStorage() {
          try {
            console.log('[FireEMS Framework] Trying sessionStorage access');
            const serialized = sessionStorage.getItem(emergencyDataId);
            if (!serialized) return null;
            
            const parsed = JSON.parse(serialized);
            return parsed.data || parsed; // Handle both wrapped and unwrapped formats
          } catch (e) {
            console.warn('[FireEMS Framework] SessionStorage retrieval failed:', e);
            return null;
          }
        },
        
        // Strategy 5: Try the backup generic key in localStorage
        function tryBackupLocalStorage() {
          try {
            console.log('[FireEMS Framework] Trying backup localStorage key');
            const serialized = localStorage.getItem('emergency_data_latest');
            if (!serialized) return null;
            
            const parsed = JSON.parse(serialized);
            return parsed.data || parsed; // Handle both wrapped and unwrapped formats
          } catch (e) {
            console.warn('[FireEMS Framework] Backup localStorage retrieval failed:', e);
            return null;
          }
        },
        
        // Strategy 6: Try the backup generic key in sessionStorage
        function tryBackupSessionStorage() {
          try {
            console.log('[FireEMS Framework] Trying backup sessionStorage key');
            const serialized = sessionStorage.getItem('emergency_data_latest');
            if (!serialized) return null;
            
            const parsed = JSON.parse(serialized);
            return parsed.data || parsed; // Handle both wrapped and unwrapped formats
          } catch (e) {
            console.warn('[FireEMS Framework] Backup sessionStorage retrieval failed:', e);
            return null;
          }
        }
      ];
      
      // Try each strategy in sequence until one returns data
      let data = null;
      let dataSource = '';
      
      for (let i = 0; i < retrievalStrategies.length; i++) {
        data = retrievalStrategies[i]();
        if (data) {
          dataSource = `Strategy ${i+1}`;
          break;
        }
      }
      
      // Process the data if we found it from any strategy
      if (data) {
        console.log(`[FireEMS Framework] Successfully retrieved emergency data using ${dataSource}`);
        processEmergencyData(data, emergencyDataId);
      } else {
        console.error('[FireEMS Framework] All data retrieval strategies failed');
        
        // Display diagnostic info to help with troubleshooting
        let diagnosticInfo = '';
        try {
          const diagnostic = sessionStorage.getItem('emergency_diagnostic');
          if (diagnostic) {
            diagnosticInfo = JSON.parse(diagnostic);
            console.log('[FireEMS Framework] Found diagnostic info:', diagnosticInfo);
          }
        } catch (e) {
          console.warn('[FireEMS Framework] Could not retrieve diagnostic info:', e);
        }
        
        // Show error with more detailed info
        showEmergencyDataError(
          'Could not retrieve emergency data. The data may have expired or been lost during navigation. ' + 
          'Try returning to the Data Formatter and sending the data again.'
        );
      }
    }
  }
  
  // Configure the Incident Logger page
  function configureIncidentLogger() {
    console.log('[FireEMS Framework] Configuring Incident Logger');
    // Implement Incident Logger specific functionality
  }
  
  // Process emergency data received from another tool
  function processEmergencyData(data, dataId) {
    // First, check if data is wrapped in a metadata object
    if (data && data.metadata && data.data) {
      console.log('[FireEMS Framework] Processing data with metadata:', data.metadata);
      data = data.data;
    }
    
    // Preprocess data to ensure proper format and data types
    const preprocessedData = preprocessEmergencyData(data);
    
    // Clean up any existing Chart.js instances to prevent reuse errors
    cleanupChartInstances();
    
    // Then, try to find a suitable processor function
    const processorFunctions = [
      window.processEmergencyData,
      window.displayResponseTimeData,
      window.displayIncidentData,
      window.processIncidentData,
      window.loadData,
      window.processData,
      window.displayData
    ];
    
    // Try each function until one works
    let processed = false;
    for (const func of processorFunctions) {
      if (typeof func === 'function') {
        try {
          console.log(`[FireEMS Framework] Trying processor function: ${func.name}`);
          func(preprocessedData);
          processed = true;
          
          // Show success message
          showEmergencyDataSuccess('Data loaded successfully');
          
          // Clean up if successful
          setTimeout(() => {
            try {
              localStorage.removeItem(dataId);
              console.log(`[FireEMS Framework] Removed emergency data ${dataId} from storage`);
            } catch (e) {
              console.warn(`[FireEMS Framework] Error removing data from storage:`, e);
            }
          }, 5000);
          
          break;
        } catch (error) {
          console.warn(`[FireEMS Framework] Processor ${func.name} failed:`, error);
        }
      }
    }
    
    if (!processed) {
      console.error('[FireEMS Framework] All processor functions failed');
      showEmergencyDataError('Unable to process the emergency data');
    }
  }
  
  // Clean up any existing Chart.js instances
  function cleanupChartInstances() {
    console.log('[FireEMS Framework] Cleaning up Chart.js instances');
    
    // If Chart.js is available, destroy any existing charts
    if (window.Chart && window.Chart.instances) {
      Object.keys(window.Chart.instances).forEach(id => {
        try {
          const chart = window.Chart.instances[id];
          if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
            console.log(`[FireEMS Framework] Destroyed Chart.js instance with ID: ${id}`);
          }
        } catch (e) {
          console.warn(`[FireEMS Framework] Error destroying chart ${id}:`, e);
        }
      });
    }
    
    // Alternative approach for older Chart.js versions
    const canvases = ['unit-chart', 'location-chart', 'time-chart', 'response-time-chart'];
    canvases.forEach(id => {
      try {
        const canvas = document.getElementById(id);
        if (canvas) {
          // Clear the canvas
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          
          // Remove and re-add canvas to force a clean state
          const parent = canvas.parentNode;
          if (parent) {
            const newCanvas = document.createElement('canvas');
            newCanvas.id = id;
            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height;
            parent.replaceChild(newCanvas, canvas);
            console.log(`[FireEMS Framework] Reset canvas with ID: ${id}`);
          }
        }
      } catch (e) {
        console.warn(`[FireEMS Framework] Error resetting canvas ${id}:`, e);
      }
    });
  }
  
  // Preprocess emergency data to ensure proper formats and data types
  function preprocessEmergencyData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[FireEMS Framework] Invalid data format - expected non-empty array');
      return data;
    }
    
    console.log('[FireEMS Framework] Preprocessing emergency data:', data.length, 'records');
    
    // Process each record to ensure proper data types and formats
    return data.map(record => {
      const processed = {...record};
      
      // Process coordinates (ensure they're numbers and validate)
      if (processed.latitude !== undefined && processed.longitude !== undefined) {
        processed.latitude = parseFloat(processed.latitude);
        processed.longitude = parseFloat(processed.longitude);
        
        // Check if coordinates are valid
        processed.validCoordinates = (
          !isNaN(processed.latitude) && 
          !isNaN(processed.longitude) && 
          processed.latitude >= -90 && processed.latitude <= 90 && 
          processed.longitude >= -180 && processed.longitude <= 180
        );
      } else {
        processed.validCoordinates = false;
      }
      
      // Process incident_type if it looks like it contains an address
      if (processed.incident_type && 
          typeof processed.incident_type === 'string' && 
          processed.incident_type.includes(' ') && 
          !processed.address && 
          processed.incident_type.length > 10) {
        // This might be an address in the wrong field
        processed.address = processed.address || processed.incident_type;
        processed.incident_type = 'Unknown';
      }
      
      // Process date fields
      if (processed.incident_date && typeof processed.incident_date === 'string') {
        // Keep the original format but ensure it's a valid date
        try {
          const dateParts = processed.incident_date.split('/');
          if (dateParts.length === 3) {
            // Ensure year has 4 digits
            if (dateParts[2].length === 2) {
              dateParts[2] = '20' + dateParts[2];
            }
            // Reconstruct the date
            processed.incident_date = dateParts.join('/');
            
            // Add a JavaScript Date object for internal use
            const jsDate = new Date(
              parseInt(dateParts[2]), 
              parseInt(dateParts[0]) - 1, 
              parseInt(dateParts[1])
            );
            processed._date_obj = jsDate;
          }
        } catch (e) {
          console.warn('[FireEMS Framework] Error processing date:', e);
        }
      }
      
      // Process time fields
      ['incident_time', 'dispatch_time', 'en_route_time', 'on_scene_time'].forEach(timeField => {
        if (processed[timeField] && typeof processed[timeField] === 'string') {
          // Ensure consistent time format (HH:MM:SS)
          try {
            const timeParts = processed[timeField].split(':');
            if (timeParts.length === 2) {
              // Add seconds if missing
              processed[timeField] = processed[timeField] + ':00';
            } else if (timeParts.length === 1) {
              // If just a number, assume it's hours
              const hour = processed[timeField].substring(0, 2).padStart(2, '0');
              const minute = processed[timeField].length > 2 ? 
                processed[timeField].substring(2, 4).padStart(2, '0') : '00';
              processed[timeField] = `${hour}:${minute}:00`;
            }
          } catch (e) {
            console.warn(`[FireEMS Framework] Error processing time field ${timeField}:`, e);
          }
        }
      });
      
      return processed;
    });
  }
  
  // Show error message for emergency data
  function showEmergencyDataError(message) {
    // Try to find a container
    const container = findNotificationContainer();
    
    if (!container) {
      console.error('[FireEMS Framework] No container found for error message');
      alert(`Error: ${message}`);
      return;
    }
    
    // Create error element
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message emergency-data-error';
    errorEl.innerHTML = `
      <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #c62828;">Error Loading Emergency Data</h3>
        <p>${message}</p>
        <button class="close-btn" style="background: none; border: none; color: #c62828; cursor: pointer; margin-top: 10px;">Dismiss</button>
      </div>
    `;
    
    // Insert at beginning of container
    container.insertBefore(errorEl, container.firstChild);
    
    // Add close button handler
    const closeBtn = errorEl.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        errorEl.remove();
      });
    }
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorEl.parentNode) {
        errorEl.remove();
      }
    }, 10000);
  }
  
  // Show success message for emergency data
  function showEmergencyDataSuccess(message) {
    // Try to find a container
    const container = findNotificationContainer();
    
    if (!container) {
      console.error('[FireEMS Framework] No container found for success message');
      return;
    }
    
    // Create success element
    const successEl = document.createElement('div');
    successEl.className = 'success-message emergency-data-success';
    successEl.innerHTML = `
      <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #2e7d32;">Success</h3>
        <p>${message}</p>
      </div>
    `;
    
    // Insert at beginning of container
    container.insertBefore(successEl, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (successEl.parentNode) {
        successEl.remove();
      }
    }, 5000);
  }
  
  // Find a suitable container for notifications
  function findNotificationContainer() {
    return document.querySelector('.upload-section') || 
           document.querySelector('.tool-header') || 
           document.querySelector('main') ||
           document.body;
  }
  
  // Register common event listeners for all pages
  function registerCommonEventListeners() {
    // Mode change listener
    if (window.FireEMS && window.FireEMS.Core) {
      window.FireEMS.Core.addEventListener('mode:changed', function(event) {
        const { mode, capabilities } = event.detail;
        console.log(`[FireEMS Framework] Mode changed to ${mode}`, capabilities);
        
        // Update UI based on mode
        updateUIForMode(mode, capabilities);
      });
    }
  }
  
  // Update UI elements based on operation mode
  function updateUIForMode(mode, capabilities) {
    // Add mode-specific CSS class to body
    document.body.classList.remove('mode-normal', 'mode-degraded', 'mode-emergency', 'mode-offline');
    document.body.classList.add(`mode-${mode}`);
    
    // Disable network-dependent features in offline mode
    if (mode === 'offline') {
      document.querySelectorAll('[data-requires-network]').forEach(el => {
        el.disabled = true;
        el.classList.add('offline-disabled');
      });
    }
    
    // Show appropriate mode indicator
    showModeIndicator(mode, capabilities);
  }
  
  // Show mode indicator based on current mode
  function showModeIndicator(mode, capabilities) {
    // Remove any existing indicators
    const existingIndicator = document.getElementById('mode-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    // Only show indicators for non-normal modes
    if (mode === 'normal') return;
    
    // Define indicator properties based on mode
    const indicators = {
      offline: {
        icon: 'fa-wifi',
        title: 'Offline Mode',
        message: 'You are currently working offline',
        color: '#ff9800'
      },
      emergency: {
        icon: 'fa-exclamation-triangle',
        title: 'Emergency Mode',
        message: 'Using emergency fallback systems',
        color: '#f44336'
      },
      degraded: {
        icon: 'fa-exclamation-circle',
        title: 'Degraded Mode',
        message: 'Some features may be limited',
        color: '#ff9800'
      }
    };
    
    const indicator = indicators[mode];
    if (!indicator) return;
    
    // Create indicator element
    const indicatorEl = document.createElement('div');
    indicatorEl.id = 'mode-indicator';
    indicatorEl.className = `mode-indicator ${mode}-indicator`;
    indicatorEl.innerHTML = `
      <div style="position: fixed; bottom: 20px; right: 20px; background-color: ${indicator.color}; 
                  color: white; padding: 10px 15px; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                  display: flex; align-items: center; z-index: 9999; font-size: 14px;">
        <i class="fas ${indicator.icon}" style="margin-right: 10px;"></i>
        <div>
          <strong>${indicator.title}</strong>
          <div style="font-size: 12px;">${indicator.message}</div>
        </div>
        <button class="close-btn" style="background: none; border: none; color: white; margin-left: 15px; cursor: pointer;">×</button>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(indicatorEl);
    
    // Add close button handler
    const closeBtn = indicatorEl.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        indicatorEl.remove();
      });
    }
  }
  
  // Fallback download function when EmergencyMode is not available
  function downloadDataFallback(data, format) {
    try {
      if (!data || (Array.isArray(data) && data.length === 0)) {
        alert('No data to download');
        return;
      }
      
      let content = '';
      let mimeType = '';
      let extension = '';
      
      if (format === 'json') {
        // JSON format
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else if (format === 'excel' || format === 'csv') {
        // CSV format (fallback for Excel)
        if (Array.isArray(data) && data.length > 0) {
          // Get headers from first item
          const headers = Object.keys(data[0]);
          content = headers.join(',') + '\n';
          
          // Add each row
          data.forEach(row => {
            const values = headers.map(header => {
              const value = row[header] || '';
              // Handle values with commas by wrapping in quotes
              return value.toString().includes(',') ? `"${value}"` : value;
            });
            content += values.join(',') + '\n';
          });
        } else {
          content = 'No data available';
        }
        
        mimeType = 'text/csv';
        extension = 'csv';
      }
      
      // Create blob and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `fireems-formatted-data.${extension}`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('[FireEMS Framework] Error downloading data:', error);
      alert('Error creating download file: ' + error.message);
    }
  }
  
  // Enable emergency mode when framework fails to initialize
  function enableEmergencyMode() {
    console.warn('[FireEMS Framework] Enabling fallback emergency mode');
    
    // Set emergency mode flag
    window.FireEMS = window.FireEMS || {};
    window.FireEMS.mode = 'emergency';
    
    // Load emergency mode library directly
    const emergencyScript = document.createElement('script');
    emergencyScript.src = '/app-static/js/emergency-mode.js';
    emergencyScript.onload = function() {
      console.log('[FireEMS Framework] Loaded emergency mode library');
      
      // Configure page in emergency mode
      configurePage();
    };
    emergencyScript.onerror = function() {
      console.error('[FireEMS Framework] Failed to load emergency mode library');
      
      // Add basic emergency mode UI indicator
      const indicator = document.createElement('div');
      indicator.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: #f44336; color: white; padding: 10px; border-radius: 4px; z-index: 9999;';
      indicator.innerHTML = '<strong>Emergency Mode</strong> - Limited functionality available';
      document.body.appendChild(indicator);
    };
    document.head.appendChild(emergencyScript);
  }
  
  // Start loading framework when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (CONFIG.autoInitialize) {
        loadModulesSequentially(CONFIG.coreModules);
      }
    });
  } else {
    // DOM already loaded
    if (CONFIG.autoInitialize) {
      loadModulesSequentially(CONFIG.coreModules);
    }
  }
  
  // Export public API
  window.FireEMSFramework = {
    initialize: function() {
      loadModulesSequentially(CONFIG.coreModules);
    },
    version: '1.0.0'
  };
})();