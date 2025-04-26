/**
 * Data Formatter Debugger Script
 * This script helps diagnose issues with the React components
 */

(function() {
  // Set up logging
  const debug = (message) => {
    console.log(`[Debugger] ${message}`);
  };
  
  // Store original functions
  const originalShowPanels = window.showFormatterPanels;
  let originalMountFunc = null;
  
  if (window.DataFormatterUI && window.DataFormatterUI.mount) {
    originalMountFunc = window.DataFormatterUI.mount;
  }
  
  // Add debugging when the document is loaded
  document.addEventListener('DOMContentLoaded', function() {
    debug('DOM loaded, setting up debugging');
    
    // Find the map fields button
    const mapFieldsBtn = document.getElementById('map-fields-btn');
    if (mapFieldsBtn) {
      debug('Found map fields button, adding debug handler');
      
      mapFieldsBtn.addEventListener('click', function() {
        debug('Map fields button clicked, will check React components');
        
        // Set timeout to inspect after rendering happens
        setTimeout(inspectReactState, 500);
      });
    }
    
    // Patch mount function if it exists
    if (window.DataFormatterUI && window.DataFormatterUI.mount) {
      debug('Patching DataFormatterUI.mount function');
      
      window.DataFormatterUI.mount = function(container, data, callback) {
        debug('Mount called with:');
        debug(`- Container: ${container.id || 'unknown'}`);
        debug(`- Source columns: ${(data.sourceColumns || []).length}`);
        debug(`- Sample data: ${(data.sampleData || []).length}`);
        debug(`- Selected tool: ${data.selectedTool || 'unknown'}`);
        
        try {
          // Call original with try/catch
          originalMountFunc(container, data, callback);
          
          debug('Mount call completed without errors');
          
          // Set timeout to inspect DOM after rendering
          setTimeout(() => {
            inspectRenderedComponent(container);
          }, 100);
        } catch (error) {
          debug(`ERROR in mount: ${error.message}`);
          console.error('Stack trace:', error.stack);
          
          // Create basic fallback UI
          createFallbackUI(container, data, callback);
        }
      };
    }
    
    debug('Debug setup complete');
  });
  
  // Function to inspect the current state of React
  function inspectReactState() {
    debug('Inspecting React state...');
    
    // Check for required libraries
    debug(`React available: ${!!window.React}`);
    debug(`ReactDOM available: ${!!window.ReactDOM}`);
    debug(`MaterialUI available: ${!!window.MaterialUI}`);
    debug(`ReactBeautifulDnD available: ${!!window.ReactBeautifulDnD}`);
    
    // Check for our component
    debug(`DataFormatterUI available: ${!!window.DataFormatterUI}`);
    debug(`DataFormatterUI.mount is function: ${!!(window.DataFormatterUI && typeof window.DataFormatterUI.mount === 'function')}`);
    
    // Check container
    const container = document.getElementById('column-mapping-container');
    if (container) {
      debug(`Container display: ${window.getComputedStyle(container).display}`);
      debug(`Container contents: ${container.childNodes.length} nodes`);
      
      // Look for React root
      const reactRoot = container.querySelector('[data-reactroot]');
      debug(`React root found: ${!!reactRoot}`);
      
      if (reactRoot) {
        debug(`React root children: ${reactRoot.childNodes.length}`);
      }
    } else {
      debug('Container not found!');
    }
    
    // Check for Material-UI components
    const muiComponents = document.querySelectorAll('.MuiBox-root, .MuiPaper-root, .MuiTypography-root');
    debug(`Material-UI components found: ${muiComponents.length}`);
    
    // Check for errors in formatter state
    if (window.formatterState && window.formatterState.lastError) {
      debug('Found error in formatterState:');
      debug(`- Message: ${window.formatterState.lastError.message}`);
      debug(`- Timestamp: ${window.formatterState.lastError.timestamp}`);
      
      console.error('Component stack:', window.formatterState.lastError.componentStack);
    }
  }
  
  // Function to inspect rendered component
  function inspectRenderedComponent(container) {
    debug('Inspecting rendered component in container...');
    
    if (!container) {
      debug('Container is null or undefined!');
      return;
    }
    
    debug(`Container tag: ${container.tagName}`);
    debug(`Container ID: ${container.id}`);
    debug(`Container display: ${window.getComputedStyle(container).display}`);
    debug(`Container visibility: ${window.getComputedStyle(container).visibility}`);
    debug(`Container height: ${window.getComputedStyle(container).height}`);
    debug(`Container children count: ${container.childNodes.length}`);
    
    // Check first level children
    for (let i = 0; i < container.childNodes.length; i++) {
      const child = container.childNodes[i];
      debug(`Child ${i} type: ${child.nodeType}, tag: ${child.tagName || 'text'}`);
      
      if (child.classList) {
        debug(`Child ${i} classes: ${Array.from(child.classList).join(', ')}`);
      }
    }
    
    // Check for Material-UI components inside
    const muiElements = container.querySelectorAll('.MuiBox-root, .MuiPaper-root');
    debug(`Material-UI elements found: ${muiElements.length}`);
    
    if (muiElements.length === 0) {
      debug('No Material-UI elements found, something is wrong with the rendering!');
    }
  }
  
  // Create a basic fallback UI if React fails
  function createFallbackUI(container, data, callback) {
    debug('Creating fallback UI due to React errors');
    
    if (!container) return;
    
    // Extract data
    const sourceColumns = data.sourceColumns || [];
    
    // Create a basic UI
    container.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>Field Mapping</h2>
        <p>The React component couldn't be rendered. Using basic mapping interface:</p>
        
        <div id="debug-info" style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 20px 0;">
          <h3>Debug Information</h3>
          <p>Source Columns: ${sourceColumns.length}</p>
          <p>Selected Tool: ${data.selectedTool || 'unknown'}</p>
        </div>
        
        <button id="back-to-formatter" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Return to Formatter
        </button>
      </div>
    `;
    
    // Add event listener to the back button
    const backButton = container.querySelector('#back-to-formatter');
    if (backButton) {
      backButton.addEventListener('click', function() {
        if (typeof window.showFormatterPanels === 'function') {
          window.showFormatterPanels();
        }
      });
    }
  }
  
  // Expose debugger functions
  window.DataFormatterDebugger = {
    inspect: inspectReactState,
    inspectDOM: inspectRenderedComponent
  };
  
  debug('Data Formatter Debugger initialized');
})();