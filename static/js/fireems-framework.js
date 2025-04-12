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
              // Ensure route doesn't have leading slashes
              const normalizedRoute = targetRoute.replace(/^\/+/, ''); // Remove leading slashes
              
              // Build the full URL with proper formatting
              const fullUrl = `${origin}/${normalizedRoute}?emergency_data=${encodeURIComponent(dataId)}&t=${timestamp}&source=framework`;
              
              console.log(`[FireEMS Framework] Navigating to: ${fullUrl}`);
                  
              // For debugging purposes, store the navigation info
              sessionStorage.setItem('last_framework_navigation', JSON.stringify({
                dataId,
                targetTool,
                targetRoute,
                timestamp: timestamp,
                encodedDataId: encodeURIComponent(dataId),
                fullUrl: fullUrl
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
                  
              window.location.href = fullUrl;
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
              
              // Get origin for absolute path
              const origin = window.location.origin || '';
              
              // Ensure we normalize the target tool to avoid path issues
              const normalizedTool = targetTool.replace(/^\/+/, '');
              
              // Build the URL with source parameter for debugging
              const directUrl = `${origin}/${normalizedTool}?emergency_data=${dataId}&t=${Date.now()}&source=direct_fallback`;
              
              console.log('[FireEMS Framework] Using last resort direct navigation:', directUrl);
              window.location.href = directUrl;
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
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.warn('[FireEMS Framework] Data is not an array, attempting to convert');
      if (typeof data === 'object') {
        // Try to extract an array from the object
        const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          // Use the largest array found
          data = possibleArrays.reduce((a, b) => a.length > b.length ? a : b);
          console.log('[FireEMS Framework] Extracted array with', data.length, 'items');
        } else {
          // Convert object to array with one element
          data = [data];
          console.log('[FireEMS Framework] Converted object to single-item array');
        }
      } else if (data === null || data === undefined) {
        console.error('[FireEMS Framework] Data is null or undefined');
        showEmergencyDataError('Emergency data is empty or invalid');
        return;
      } else {
        // Last resort - wrap primitive in array
        data = [data];
        console.log('[FireEMS Framework] Wrapped primitive in array');
      }
    }
    
    // Preprocess data to ensure proper format and data types
    const preprocessedData = preprocessEmergencyData(data);
    
    // Safely clean up any existing Chart.js instances to prevent reuse errors
    try {
      cleanupChartInstances();
    } catch (e) {
      console.warn('[FireEMS Framework] Error during chart cleanup:', e);
      // Continue anyway - this is just preparation
    }
    
    // Hide any existing file upload elements since we'll be displaying our own UI
    try {
      const uploadElements = document.querySelectorAll('.file-upload-container, .upload-section');
      uploadElements.forEach(el => {
        el.style.display = 'none';
      });
      
      // Also try to hide any result elements that might be showing error messages
      const resultElements = document.querySelectorAll('#result, .result');
      resultElements.forEach(el => {
        el.innerHTML = '';
      });
    } catch (e) {
      console.warn('[FireEMS Framework] Error hiding upload elements:', e);
    }
    
    // Create our emergency container that will display regardless of page JS errors
    const emergencyContainer = document.createElement('div');
    emergencyContainer.id = 'emergency-data-display';
    emergencyContainer.className = 'emergency-data-container';
    emergencyContainer.style.cssText = `
      margin: 20px; 
      padding: 20px; 
      border: 2px solid #4caf50; 
      border-radius: 8px; 
      background-color: #f1f8e9;
    `;
    
    // Add a header to the emergency container
    const header = document.createElement('div');
    header.innerHTML = `
      <h2 style="color: #2e7d32; margin-top: 0;">
        <span style="color: #f44336;">⚠️</span> 
        Emergency Data Loaded Successfully
      </h2>
      <p style="margin-bottom: 20px;">
        <strong>${preprocessedData.length}</strong> records were transferred from Data Formatter 
        in emergency mode and are displayed below.
      </p>
    `;
    emergencyContainer.appendChild(header);
    
    // Create tabs for different visualizations
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      margin-bottom: 16px;
      border-bottom: 1px solid #ddd;
    `;
    
    const tabs = [
      { id: 'summary-tab', label: 'Summary' },
      { id: 'table-tab', label: 'Data Table' },
      { id: 'charts-tab', label: 'Charts' }
    ];
    
    tabs.forEach((tab, index) => {
      const tabButton = document.createElement('button');
      tabButton.id = tab.id;
      tabButton.textContent = tab.label;
      tabButton.style.cssText = `
        padding: 10px 20px;
        background: ${index === 0 ? '#e8f5e9' : '#f5f5f5'};
        border: 1px solid #ddd;
        border-bottom: ${index === 0 ? '1px solid #e8f5e9' : '1px solid #ddd'};
        border-radius: 4px 4px 0 0;
        margin-right: 4px;
        margin-bottom: -1px;
        cursor: pointer;
        font-weight: ${index === 0 ? 'bold' : 'normal'};
      `;
      tabButton.onclick = function() {
        // Set all tabs to inactive style
        document.querySelectorAll('#emergency-data-display .tab-button').forEach(btn => {
          btn.style.background = '#f5f5f5';
          btn.style.fontWeight = 'normal';
          btn.style.borderBottom = '1px solid #ddd';
        });
        
        // Set this tab to active style
        this.style.background = '#e8f5e9';
        this.style.fontWeight = 'bold';
        this.style.borderBottom = '1px solid #e8f5e9';
        
        // Hide all tab content
        document.querySelectorAll('#emergency-data-display .tab-content').forEach(content => {
          content.style.display = 'none';
        });
        
        // Show the selected tab content
        const contentId = this.id.replace('-tab', '-content');
        const content = document.getElementById(contentId);
        if (content) {
          content.style.display = 'block';
        }
      };
      tabButton.className = 'tab-button';
      tabsContainer.appendChild(tabButton);
    });
    
    emergencyContainer.appendChild(tabsContainer);
    
    // Create content containers for each tab
    const tabContents = document.createElement('div');
    tabContents.className = 'tab-contents';
    
    // Summary tab content
    const summaryContent = document.createElement('div');
    summaryContent.id = 'summary-tab-content';
    summaryContent.className = 'tab-content';
    summaryContent.style.display = 'block'; // Show by default
    tabContents.appendChild(summaryContent);
    
    // Table tab content
    const tableContent = document.createElement('div');
    tableContent.id = 'table-tab-content';
    tableContent.className = 'tab-content';
    tableContent.style.display = 'none';
    tabContents.appendChild(tableContent);
    
    // Charts tab content
    const chartsContent = document.createElement('div');
    chartsContent.id = 'charts-tab-content';
    chartsContent.className = 'tab-content';
    chartsContent.style.display = 'none';
    
    // Add chart containers
    chartsContent.innerHTML = `
      <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1; min-width: 300px; background: white; padding: 15px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0;">Unit Response Times</h3>
          <canvas id="emergency-unit-chart" width="400" height="300"></canvas>
        </div>
        <div style="flex: 1; min-width: 300px; background: white; padding: 15px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0;">Incidents by Location</h3>
          <canvas id="emergency-location-chart" width="400" height="300"></canvas>
        </div>
      </div>
    `;
    tabContents.appendChild(chartsContent);
    
    emergencyContainer.appendChild(tabContents);
    
    // Add to document at the most visible location
    try {
      // Try to insert after the main navigation
      const navbar = document.querySelector('.navbar, header, .header');
      if (navbar && navbar.parentNode) {
        navbar.parentNode.insertBefore(emergencyContainer, navbar.nextSibling);
      } else {
        // Fallback - insert at the beginning of the body
        document.body.insertBefore(emergencyContainer, document.body.firstChild);
      }
    } catch (e) {
      console.warn('[FireEMS Framework] Error inserting emergency container:', e);
      // Last resort - append to body
      document.body.appendChild(emergencyContainer);
    }
    
    console.log('[FireEMS Framework] Created emergency data display container');
    
    // Now fill each tab with content
    try {
      renderDataSummary(preprocessedData, document.getElementById('summary-tab-content'));
      renderFallbackTable(preprocessedData, document.getElementById('table-tab-content'));
      
      // Then, try to create charts using our direct implementation
      try {
        // Create charts for emergency display
        if (window.Chart) {
          // Unit chart
          createDirectUnitChart(preprocessedData, 'emergency-unit-chart');
          
          // Location chart
          createDirectLocationChart(preprocessedData, 'emergency-location-chart');
        } else {
          // Try to load Chart.js
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
          script.onload = function() {
            createDirectUnitChart(preprocessedData, 'emergency-unit-chart');
            createDirectLocationChart(preprocessedData, 'emergency-location-chart');
          };
          document.head.appendChild(script);
          
          document.getElementById('charts-tab-content').innerHTML += `
            <p style="text-align: center; color: #f57c00; padding: 20px;">
              Loading Chart.js library... Charts will appear shortly.
            </p>
          `;
        }
      } catch (chartError) {
        console.warn('[FireEMS Framework] Error creating charts:', chartError);
        document.getElementById('charts-tab-content').innerHTML = `
          <p style="text-align: center; color: #f44336; padding: 20px;">
            Unable to create charts: ${chartError.message}<br>
            The data is still available in the Table tab.
          </p>
        `;
      }
      
      // Clean up storage if everything worked
      cleanupStorage(dataId);
      
      console.log('[FireEMS Framework] Emergency data display completed successfully');
      return true;
    } catch (error) {
      console.error('[FireEMS Framework] Error filling emergency data display:', error);
      
      // Still show some basic info even if details fail
      emergencyContainer.innerHTML = `
        <h2 style="color: #2e7d32; margin-top: 0;">
          <span style="color: #f44336;">⚠️</span> 
          Emergency Data Loaded
        </h2>
        <p>
          <strong>${preprocessedData.length}</strong> records were transferred from Data Formatter.
        </p>
        <p style="color: #f44336;">
          Error creating detailed view: ${error.message}
        </p>
        <p>
          Please refresh the page or try again.
        </p>
      `;
      
      cleanupStorage(dataId);
      return true;
    }
  }
  
  /**
   * Create a unit response time chart directly for emergency display
   */
  function createDirectUnitChart(data, canvasId) {
    try {
      // Get the canvas element
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        console.warn(`[FireEMS Framework] Canvas element not found: ${canvasId}`);
        return false;
      }
      
      // Group by unit
      const unitGroups = {};
      data.forEach(record => {
        const unit = record.Unit || 'Unknown';
        if (!unitGroups[unit]) {
          unitGroups[unit] = [];
        }
        unitGroups[unit].push(record);
      });
      
      // Calculate average response time per unit
      const unitData = [];
      const unitLabels = [];
      
      Object.entries(unitGroups).forEach(([unit, incidents]) => {
        const responseTimes = calculateResponseTimes(incidents);
        if (responseTimes.length > 0) {
          const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
          unitLabels.push(unit);
          unitData.push(avgResponseTime.toFixed(1));
        }
      });
      
      // Sort by response time (ascending)
      const sortedData = unitLabels.map((unit, i) => ({ unit, time: parseFloat(unitData[i]) }))
        .sort((a, b) => a.time - b.time)
        .slice(0, 10); // Only show top 10
        
      // Create chart
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: sortedData.map(d => d.unit),
          datasets: [{
            label: 'Avg. Response Time (min)',
            data: sortedData.map(d => d.time),
            backgroundColor: 'rgba(76, 175, 80, 0.6)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y', // Horizontal bar chart
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Minutes'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Average Response Time by Unit',
              font: {
                size: 14
              }
            },
            legend: {
              display: false
            }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });
      
      return true;
    } catch (error) {
      console.error('[FireEMS Framework] Error creating unit chart:', error);
      return false;
    }
  }
  
  /**
   * Create a location chart directly for emergency display
   */
  function createDirectLocationChart(data, canvasId) {
    try {
      // Get the canvas element
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        console.warn(`[FireEMS Framework] Canvas element not found: ${canvasId}`);
        return false;
      }
      
      // Try to get location data (city, address, etc.)
      const locationFields = [
        'Incident City', 'City', 'city', 'incident_city',
        'CITY', 'ADDRESS_CITY', 'EVENT_CITY'
      ];
      
      // Count incidents by location
      const locationCounts = {};
      
      data.forEach(record => {
        let location = null;
        
        // Try each field
        for (const field of locationFields) {
          if (record[field]) {
            location = record[field].toString().trim();
            break;
          }
        }
        
        // If no location found, try to get it from coordinates or use Unknown
        if (!location) {
          if (record.latitude && record.longitude) {
            location = `${parseFloat(record.latitude).toFixed(2)},${parseFloat(record.longitude).toFixed(2)}`;
          } else {
            location = 'Unknown';
          }
        }
        
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      });
      
      // Get top locations (by count)
      const topLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7); // Top 7 locations
        
      // Add "Other" category if there are more locations
      const totalEvents = data.length;
      const topEventsCount = topLocations.reduce((sum, [_, count]) => sum + count, 0);
      
      if (topEventsCount < totalEvents) {
        topLocations.push(['Other', totalEvents - topEventsCount]);
      }
      
      // Create chart
      new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: topLocations.map(([location, _]) => location),
          datasets: [{
            data: topLocations.map(([_, count]) => count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(199, 199, 199, 0.7)',
              'rgba(83, 129, 53, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Incidents by Location',
              font: {
                size: 14
              }
            },
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                font: {
                  size: 11
                }
              }
            }
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('[FireEMS Framework] Error creating location chart:', error);
      return false;
    }
  }
  
  /**
   * Direct implementation of Response Time Analyzer processing
   * This function implements the core Response Time Analyzer functionality
   * to handle the data without relying on external processor functions
   */
  function directProcessResponseTimeData(data) {
    try {
      console.log('[FireEMS Framework] Attempting direct Response Time processing');
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('[FireEMS Framework] No valid data for direct processing');
        return false;
      }
      
      // Get required canvas elements
      const unitChartEl = document.getElementById('unit-chart');
      const locationChartEl = document.getElementById('location-chart');
      
      if (!unitChartEl || !locationChartEl) {
        console.warn('[FireEMS Framework] Required chart canvases not found');
        return false;
      }
      
      // Reset canvases safely
      try {
        resetCanvas('unit-chart');
        resetCanvas('location-chart');
      } catch (e) {
        console.warn('[FireEMS Framework] Error resetting canvas:', e);
        // Continue anyway
      }
      
      // Check if Chart.js is available
      if (!window.Chart) {
        // Try to load Chart.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        document.head.appendChild(script);
        
        // Display a message to refresh after Chart.js loads
        showEmergencyDataSuccess('Loading Chart.js. Please refresh the page in a few seconds.');
        return false; // Chart.js isn't loaded yet
      }
      
      // Process the data to extract relevant information for charts
      // 1. Group by unit for the unit response time chart
      const unitGroups = groupBy(data, 'Unit');
      const unitLabels = Object.keys(unitGroups);
      const unitData = [];
      
      unitLabels.forEach(unit => {
        const incidents = unitGroups[unit];
        const responseTimes = calculateResponseTimes(incidents);
        const avgResponseTime = responseTimes.length > 0 
          ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
          : 0;
          
        unitData.push(avgResponseTime);
      });
      
      // 2. Extract location data if available
      const validLocationData = data.filter(incident => 
        incident.latitude && incident.longitude && 
        !isNaN(parseFloat(incident.latitude)) && 
        !isNaN(parseFloat(incident.longitude))
      );
      
      // Create the unit response time chart
      new Chart(unitChartEl, {
        type: 'bar',
        data: {
          labels: unitLabels,
          datasets: [{
            label: 'Average Response Time (minutes)',
            data: unitData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Response Time by Unit'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Minutes'
              }
            }
          }
        }
      });
      
      // Create a simple location data display
      if (validLocationData.length > 0) {
        // If we can't show a map, show a bar chart of incidents by location
        const locationCounts = {};
        validLocationData.forEach(incident => {
          // Round coordinates to create location bins
          const lat = parseFloat(incident.latitude).toFixed(2);
          const lng = parseFloat(incident.longitude).toFixed(2);
          const locKey = `${lat},${lng}`;
          
          locationCounts[locKey] = (locationCounts[locKey] || 0) + 1;
        });
        
        // Sort by count and take top 10
        const sortedLocations = Object.entries(locationCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);
          
        new Chart(locationChartEl, {
          type: 'bar',
          data: {
            labels: sortedLocations.map(([loc]) => loc),
            datasets: [{
              label: 'Incident Count',
              data: sortedLocations.map(([, count]) => count),
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Top Incident Locations'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Count'
                }
              }
            }
          }
        });
      }
      
      // Add a summary table to the page
      renderDataSummary(data);
      
      return true;
    } catch (error) {
      console.error('[FireEMS Framework] Error in direct Response Time processing:', error);
      return false;
    }
  }
  
  /**
   * Group an array of objects by a specific property
   */
  function groupBy(array, key) {
    return array.reduce((result, item) => {
      const groupKey = item[key] || 'Unknown';
      result[groupKey] = result[groupKey] || [];
      result[groupKey].push(item);
      return result;
    }, {});
  }
  
  /**
   * Calculate response times from incident data
   */
  function calculateResponseTimes(incidents) {
    return incidents.map(incident => {
      // Try various field name formats that could contain time data
      const dispatchTime = parseTimeField(incident['Unit Dispatched'] || 
                                        incident['Dispatched'] || 
                                        incident['dispatch_time'] || 
                                        incident['dispatch time'] ||
                                        '');
                                        
      const onSceneTime = parseTimeField(incident['Unit Onscene'] || 
                                       incident['On Scene'] || 
                                       incident['Arrived'] || 
                                       incident['on_scene_time'] || 
                                       incident['on scene time'] ||
                                       '');
      
      if (dispatchTime && onSceneTime) {
        // Calculate difference in minutes
        return (onSceneTime - dispatchTime) / (1000 * 60);
      }
      return null;
    }).filter(time => time !== null && !isNaN(time) && time >= 0 && time < 60); // Filter out invalid times
  }
  
  /**
   * Parse a time field into a Date object
   */
  function parseTimeField(timeStr) {
    if (!timeStr) return null;
    
    // Remove any non-numeric or colon characters
    timeStr = timeStr.toString().replace(/[^\d:]/g, '');
    
    try {
      // Handle various time formats
      if (timeStr.includes(':')) {
        // Format: HH:MM or HH:MM:SS
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parts.length > 2 ? parseInt(parts[2]) : 0;
        
        if (!isNaN(hours) && !isNaN(minutes)) {
          const date = new Date();
          date.setHours(hours, minutes, seconds, 0);
          return date;
        }
      } else if (timeStr.length >= 3) {
        // Format: HHMM or similar
        const hours = parseInt(timeStr.substring(0, 2));
        const minutes = parseInt(timeStr.substring(2, 4));
        
        if (!isNaN(hours) && !isNaN(minutes)) {
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          return date;
        }
      }
    } catch (e) {
      console.warn(`[FireEMS Framework] Error parsing time: ${timeStr}`, e);
    }
    
    return null;
  }
  
  /**
   * Reset a canvas element by replacing it with a new one
   */
  function resetCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    
    // Create a replacement canvas
    const newCanvas = document.createElement('canvas');
    newCanvas.id = id;
    
    // Copy attributes
    Array.from(canvas.attributes).forEach(attr => {
      if (attr.name !== 'id') {
        newCanvas.setAttribute(attr.name, attr.value);
      }
    });
    
    // Replace in the DOM
    if (canvas.parentNode) {
      canvas.parentNode.replaceChild(newCanvas, canvas);
    }
  }
  
  /**
   * Clean up storage after successful processing
   */
  function cleanupStorage(dataId) {
    setTimeout(() => {
      try {
        localStorage.removeItem(dataId);
        console.log(`[FireEMS Framework] Removed emergency data ${dataId} from storage`);
        
        // Also clean up our backup copies
        localStorage.removeItem('emergency_data_latest');
        sessionStorage.removeItem('emergency_data_latest');
        
        // And diagnostic info
        sessionStorage.removeItem('emergency_diagnostic');
      } catch (e) {
        console.warn(`[FireEMS Framework] Error removing data from storage:`, e);
      }
    }, 5000);
  }
  
  /**
   * Render a fallback table to display the data when charts fail
   */
  function renderFallbackTable(data) {
    // Find a container for the table
    const container = findNotificationContainer();
    if (!container) return;
    
    // Create a table element
    const tableContainer = document.createElement('div');
    tableContainer.className = 'emergency-data-table';
    tableContainer.style.cssText = 'margin: 20px 0; overflow-x: auto; max-height: 500px; overflow-y: auto;';
    
    // Limit to 100 records for performance
    const displayData = data.slice(0, 100);
    
    // Get column headers from the first record
    const headers = Object.keys(displayData[0] || {}).filter(h => h !== '_date_obj');
    
    // Create the table HTML
    let tableHtml = `
      <h3>Emergency Data (showing ${displayData.length} of ${data.length} records)</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
        <thead>
          <tr>
            ${headers.map(h => `<th style="padding: 8px; text-align: left; border: 1px solid #ddd; background-color: #f2f2f2;">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;
    
    // Add rows
    displayData.forEach((row, i) => {
      tableHtml += `
        <tr style="background-color: ${i % 2 === 0 ? '#fff' : '#f9f9f9'}">
          ${headers.map(h => `<td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${row[h] || ''}</td>`).join('')}
        </tr>
      `;
    });
    
    tableHtml += `
        </tbody>
      </table>
      <p style="margin-top: 10px; font-style: italic;">This is a fallback display when charts cannot be created.</p>
    `;
    
    tableContainer.innerHTML = tableHtml;
    container.appendChild(tableContainer);
  }
  
  /**
   * Render a summary of the data
   */
  function renderDataSummary(data) {
    // Find a container for the summary
    const container = findNotificationContainer();
    if (!container) return;
    
    // Calculate some basic stats
    const recordCount = data.length;
    const incidentTypes = {};
    const units = {};
    let earliestDate = null;
    let latestDate = null;
    
    data.forEach(incident => {
      // Count incident types
      const type = incident.incident_type || 'Unknown';
      incidentTypes[type] = (incidentTypes[type] || 0) + 1;
      
      // Count units
      const unit = incident.Unit || 'Unknown';
      units[unit] = (units[unit] || 0) + 1;
      
      // Track date range
      if (incident.incident_date) {
        const date = new Date(incident.incident_date);
        if (!isNaN(date.getTime())) {
          if (!earliestDate || date < earliestDate) earliestDate = date;
          if (!latestDate || date > latestDate) latestDate = date;
        }
      }
    });
    
    // Format date range
    const dateRange = earliestDate && latestDate 
      ? `${earliestDate.toLocaleDateString()} to ${latestDate.toLocaleDateString()}`
      : 'Unknown';
    
    // Get top incident types
    const topTypes = Object.entries(incidentTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Get top units
    const topUnits = Object.entries(units)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Create the summary HTML
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'emergency-data-summary';
    summaryContainer.style.cssText = 'margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;';
    
    summaryContainer.innerHTML = `
      <h3 style="margin-top: 0;">Data Summary</h3>
      <div style="display: flex; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px; margin-right: 20px;">
          <p><strong>Total Records:</strong> ${recordCount}</p>
          <p><strong>Date Range:</strong> ${dateRange}</p>
          <p><strong>Top Incident Types:</strong></p>
          <ul>
            ${topTypes.map(([type, count]) => `<li>${type}: ${count}</li>`).join('')}
          </ul>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <p><strong>Units Involved:</strong> ${Object.keys(units).length}</p>
          <p><strong>Top Units:</strong></p>
          <ul>
            ${topUnits.map(([unit, count]) => `<li>${unit}: ${count}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
    
    container.appendChild(summaryContainer);
  }
  
  // Clean up any existing Chart.js instances
  function cleanupChartInstances() {
    console.log('[FireEMS Framework] Cleaning up Chart.js instances');
    
    // Destroy all Chart.js instances if possible
    try {
      // Modern Chart.js (v2+)
      if (window.Chart && window.Chart.instances) {
        const instances = window.Chart.instances;
        // Make a copy of the keys to avoid modification during iteration
        const instanceIds = Object.keys(instances);
        
        instanceIds.forEach(id => {
          try {
            const chart = instances[id];
            if (chart && typeof chart.destroy === 'function') {
              chart.destroy();
              console.log(`[FireEMS Framework] Destroyed Chart.js instance with ID: ${id}`);
            }
          } catch (e) {
            console.warn(`[FireEMS Framework] Error destroying chart ${id}:`, e);
          }
        });
      }
      
      // Older Chart.js global charts
      if (window.Chart && window.Chart.charts) {
        const charts = window.Chart.charts;
        for (let i = 0; i < charts.length; i++) {
          if (charts[i]) {
            try {
              charts[i].destroy();
              console.log(`[FireEMS Framework] Destroyed global chart at index ${i}`);
            } catch (e) {
              console.warn(`[FireEMS Framework] Error destroying global chart at index ${i}:`, e);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[FireEMS Framework] Error accessing Chart.js instances:', e);
    }
    
    // Reset all canvas elements we might use
    const canvasIds = [
      'unit-chart', 'location-chart', 'time-chart', 'response-time-chart',
      'dispatch-chart', 'incident-chart', 'trend-chart', 'overview-chart',
      'chart-container', 'main-chart', 'secondary-chart'
    ];
    
    canvasIds.forEach(id => {
      try {
        resetCanvas(id);
      } catch (e) {
        console.warn(`[FireEMS Framework] Error resetting canvas ${id}:`, e);
      }
    });
    
    // Also look for any canvas elements with class 'chart-canvas'
    try {
      const chartCanvases = document.querySelectorAll('canvas.chart-canvas');
      chartCanvases.forEach((canvas, index) => {
        try {
          const id = canvas.id || `chart-canvas-${index}`;
          // If canvas has no ID, set one for reference
          if (!canvas.id) {
            canvas.id = id;
          }
          resetCanvas(id);
        } catch (e) {
          console.warn(`[FireEMS Framework] Error resetting dynamic canvas:`, e);
        }
      });
    } catch (e) {
      console.warn('[FireEMS Framework] Error finding chart canvases:', e);
    }
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