/**
 * Material-UI Fix for Data Formatter
 * This script ensures proper initialization of Material-UI components
 */

(function() {
  console.log('[MaterialUIFix] Initializing Material-UI fix...');
  
  // Function to check if Material-UI is properly loaded
  function checkMaterialUI() {
    console.log('[MaterialUIFix] Checking MaterialUI...');
    
    // Check if Material-UI is available
    if (!window.MaterialUI) {
      console.error('[MaterialUIFix] Material-UI is not available!');
      loadMaterialUI();
      return false;
    }
    
    // Check if required components are available
    const requiredComponents = [
      'Box', 'Paper', 'Typography', 'Button', 'Grid', 
      'Chip', 'IconButton', 'Accordion', 'AccordionSummary', 'AccordionDetails'
    ];
    
    const missingComponents = requiredComponents.filter(comp => !window.MaterialUI[comp]);
    
    if (missingComponents.length > 0) {
      console.error('[MaterialUIFix] Missing Material-UI components:', missingComponents.join(', '));
      loadMaterialUI();
      return false;
    }
    
    console.log('[MaterialUIFix] Material-UI is properly loaded');
    return true;
  }
  
  // Function to load Material-UI
  function loadMaterialUI() {
    console.log('[MaterialUIFix] Loading Material-UI...');
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@material-ui/core@4.12.3/umd/material-ui.production.min.js';
    script.crossOrigin = 'anonymous';
    
    // Set up load handlers
    script.onload = function() {
      console.log('[MaterialUIFix] Material-UI loaded successfully');
      
      // Verify components
      if (window.MaterialUI) {
        console.log('[MaterialUIFix] Material-UI components available:', 
          Object.keys(window.MaterialUI).filter(key => typeof window.MaterialUI[key] === 'function').join(', '));
      } else {
        console.error('[MaterialUIFix] Material-UI was loaded but window.MaterialUI is still not available');
      }
    };
    
    script.onerror = function() {
      console.error('[MaterialUIFix] Failed to load Material-UI');
    };
    
    // Add to document
    document.head.appendChild(script);
  }

  // Function to check/load React Beautiful DND
  function checkReactBeautifulDnd() {
    console.log('[MaterialUIFix] Checking React Beautiful DND...');
    
    // Check if React Beautiful DND is available
    if (!window.ReactBeautifulDnD) {
      console.error('[MaterialUIFix] React Beautiful DND is not available!');
      loadReactBeautifulDnd();
      return false;
    }
    
    // Check if required components are available
    const requiredComponents = ['DragDropContext', 'Droppable', 'Draggable'];
    
    const missingComponents = requiredComponents.filter(comp => !window.ReactBeautifulDnD[comp]);
    
    if (missingComponents.length > 0) {
      console.error('[MaterialUIFix] Missing React Beautiful DND components:', missingComponents.join(', '));
      loadReactBeautifulDnd();
      return false;
    }
    
    console.log('[MaterialUIFix] React Beautiful DND is properly loaded');
    return true;
  }
  
  // Function to load React Beautiful DND
  function loadReactBeautifulDnd() {
    console.log('[MaterialUIFix] Loading React Beautiful DND...');
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/react-beautiful-dnd@13.1.0/dist/react-beautiful-dnd.min.js';
    script.crossOrigin = 'anonymous';
    
    // Set up load handlers
    script.onload = function() {
      console.log('[MaterialUIFix] React Beautiful DND loaded successfully');
      
      // Verify components
      if (window.ReactBeautifulDnD) {
        console.log('[MaterialUIFix] React Beautiful DND components available:', 
          Object.keys(window.ReactBeautifulDnD).filter(key => typeof window.ReactBeautifulDnD[key] === 'function').join(', '));
      } else {
        console.error('[MaterialUIFix] React Beautiful DND was loaded but window.ReactBeautifulDnD is still not available');
      }
    };
    
    script.onerror = function() {
      console.error('[MaterialUIFix] Failed to load React Beautiful DND');
    };
    
    // Add to document
    document.head.appendChild(script);
  }
  
  // Function to check all required libraries
  function checkAllLibraries() {
    console.log('[MaterialUIFix] Checking all required libraries...');
    
    // Check React
    if (!window.React) {
      console.error('[MaterialUIFix] React is not available!');
      return false;
    }
    
    // Check ReactDOM
    if (!window.ReactDOM) {
      console.error('[MaterialUIFix] ReactDOM is not available!');
      return false;
    }
    
    // Check Material-UI
    const materialUILoaded = checkMaterialUI();
    
    // Check React Beautiful DND
    const reactBeautifulDndLoaded = checkReactBeautifulDnd();
    
    return materialUILoaded && reactBeautifulDndLoaded;
  }
  
  // Function to initialize all required globals
  function initializeGlobals() {
    console.log('[MaterialUIFix] Initializing globals...');
    
    // Alias Material-UI global if needed
    if (window.MaterialUICore && !window.MaterialUI) {
      console.log('[MaterialUIFix] Using MaterialUICore as MaterialUI');
      window.MaterialUI = window.MaterialUICore;
    }
    
    // Ensure ReactBeautifulDnD aliases are consistent
    if (window.ReactBeautifulDnD && !window.ReactBeautifulDnd) {
      console.log('[MaterialUIFix] Creating ReactBeautifulDnd alias (lowercase)');
      window.ReactBeautifulDnd = window.ReactBeautifulDnD;
    } else if (window.ReactBeautifulDnd && !window.ReactBeautifulDnD) {
      console.log('[MaterialUIFix] Creating ReactBeautifulDnD alias (uppercase)');
      window.ReactBeautifulDnD = window.ReactBeautifulDnd;
    }
    
    // Create stubs for missing functions (last resort)
    if (!window.ReactBeautifulDnD) {
      console.warn('[MaterialUIFix] Creating stub for ReactBeautifulDnD');
      window.ReactBeautifulDnD = {
        DragDropContext: function() { return null; },
        Droppable: function() { return null; },
        Draggable: function() { return null; }
      };
    }
    
    // Create stubs for missing Material-UI components
    if (!window.MaterialUI) {
      console.warn('[MaterialUIFix] Creating stub for MaterialUI');
      window.MaterialUI = {
        Box: function() { return null; },
        Paper: function() { return null; },
        Typography: function() { return null; },
        Button: function() { return null; },
        Grid: function() { return null; }
      };
    }
  }
  
  // Function to ensure column mapping container and its styles
  function checkColumnMappingContainer() {
    console.log('[MaterialUIFix] Checking column mapping container...');
    
    const container = document.getElementById('column-mapping-container');
    if (!container) {
      console.error('[MaterialUIFix] Column mapping container not found!');
      return;
    }
    
    // Add inline styles to ensure visibility
    container.style.minHeight = '400px';
    container.style.width = '100%';
    
    // Add CSS class for ReactBeautifulDnd to work
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Essential styles for drag and drop to work */
      .column-mapping-container * {
        box-sizing: border-box;
      }
      
      /* Material-UI basics if styles are missing */
      .MuiBox-root {
        display: flex;
        flex-direction: column;
      }
      
      .MuiPaper-root {
        background-color: #fff;
        color: rgba(0, 0, 0, 0.87);
        box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);
        border-radius: 4px;
      }
      
      .MuiTypography-root {
        margin: 0;
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
      }
    `;
    
    document.head.appendChild(styleElement);
    console.log('[MaterialUIFix] Added essential styles for column mapping container');
  }
  
  // Add event listener to map fields button
  function attachEventListener() {
    console.log('[MaterialUIFix] Attaching event listener to map fields button...');
    
    const mapFieldsBtn = document.getElementById('map-fields-btn');
    if (!mapFieldsBtn) {
      console.error('[MaterialUIFix] Map fields button not found!');
      return;
    }
    
    mapFieldsBtn.addEventListener('click', function() {
      console.log('[MaterialUIFix] Map fields button clicked');
      
      setTimeout(function() {
        // Check all libraries
        initializeGlobals();
        checkAllLibraries();
        checkColumnMappingContainer();
      }, 100);
    });
    
    console.log('[MaterialUIFix] Event listener attached to map fields button');
  }
  
  // Check libraries immediately 
  initializeGlobals();
  checkAllLibraries();
  
  // Attach event listener once DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachEventListener);
  } else {
    attachEventListener();
  }
  
  console.log('[MaterialUIFix] Material-UI fix initialized');
})();