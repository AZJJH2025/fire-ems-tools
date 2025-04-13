/**
 * FireEMS.ai Chart Fallback Module
 * 
 * This module provides fallback rendering for charts when Chart.js is unavailable
 * in emergency mode or degraded operations.
 *
 * @version 1.0.0
 */

// Create namespace if it doesn't exist
window.FireEMS = window.FireEMS || {};

/**
 * Chart Fallback Utilities
 */
FireEMS.ChartFallback = (function() {
  
  /**
   * Render a table-based fallback for a bar chart
   * 
   * @param {string|HTMLElement} container - The container element or ID
   * @param {Array} labels - Array of labels
   * @param {Array} data - Array of data values
   * @param {Object} options - Additional options for rendering
   * @returns {HTMLElement} The fallback element
   */
  function renderBarChartFallback(container, labels, data, options = {}) {
    const containerElement = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    if (!containerElement) {
      console.error("Container not found for bar chart fallback");
      return null;
    }
    
    // Clear the container
    containerElement.innerHTML = '';
    
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'chart-fallback';
    fallbackDiv.style.padding = '15px';
    fallbackDiv.style.backgroundColor = '#f8f9fa';
    fallbackDiv.style.borderRadius = '4px';
    fallbackDiv.style.margin = '10px 0';
    
    // Add a header
    const header = document.createElement('h3');
    header.textContent = options.title || 'Chart Data';
    header.style.marginTop = '0';
    header.style.marginBottom = '15px';
    header.style.fontSize = '16px';
    fallbackDiv.appendChild(header);
    
    // Create a simple note about fallback mode
    const note = document.createElement('p');
    note.textContent = 'Chart visualization unavailable in emergency mode. Displaying data in table format:';
    note.style.fontSize = '14px';
    note.style.marginBottom = '15px';
    fallbackDiv.appendChild(note);
    
    // Create a table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '14px';
    
    // Add header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const labelHeader = document.createElement('th');
    labelHeader.textContent = options.labelHeader || 'Category';
    labelHeader.style.border = '1px solid #ddd';
    labelHeader.style.padding = '8px';
    labelHeader.style.textAlign = 'left';
    labelHeader.style.backgroundColor = '#f2f2f2';
    headerRow.appendChild(labelHeader);
    
    const valueHeader = document.createElement('th');
    valueHeader.textContent = options.valueHeader || 'Value';
    valueHeader.style.border = '1px solid #ddd';
    valueHeader.style.padding = '8px';
    valueHeader.style.textAlign = 'left';
    valueHeader.style.backgroundColor = '#f2f2f2';
    headerRow.appendChild(valueHeader);
    
    // Add percentages column if needed
    if (options.showPercentages) {
      const percentHeader = document.createElement('th');
      percentHeader.textContent = 'Percentage';
      percentHeader.style.border = '1px solid #ddd';
      percentHeader.style.padding = '8px';
      percentHeader.style.textAlign = 'left';
      percentHeader.style.backgroundColor = '#f2f2f2';
      headerRow.appendChild(percentHeader);
    }
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Add data rows
    const tbody = document.createElement('tbody');
    
    // Calculate total for percentages if needed
    const total = options.showPercentages 
      ? data.reduce((sum, value) => sum + (parseFloat(value) || 0), 0) 
      : 0;
    
    // Add each data row
    labels.forEach((label, index) => {
      const row = document.createElement('tr');
      row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
      
      const labelCell = document.createElement('td');
      labelCell.textContent = label;
      labelCell.style.border = '1px solid #ddd';
      labelCell.style.padding = '8px';
      row.appendChild(labelCell);
      
      const valueCell = document.createElement('td');
      valueCell.textContent = data[index];
      valueCell.style.border = '1px solid #ddd';
      valueCell.style.padding = '8px';
      row.appendChild(valueCell);
      
      if (options.showPercentages && total > 0) {
        const percentCell = document.createElement('td');
        const percentage = ((parseFloat(data[index]) || 0) / total * 100).toFixed(1);
        percentCell.textContent = `${percentage}%`;
        percentCell.style.border = '1px solid #ddd';
        percentCell.style.padding = '8px';
        row.appendChild(percentCell);
      }
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    fallbackDiv.appendChild(table);
    
    // Add to container
    containerElement.appendChild(fallbackDiv);
    
    return fallbackDiv;
  }
  
  /**
   * Render a table-based fallback for a pie/doughnut chart
   * 
   * @param {string|HTMLElement} container - The container element or ID
   * @param {Array} labels - Array of labels
   * @param {Array} data - Array of data values
   * @param {Object} options - Additional options for rendering
   * @returns {HTMLElement} The fallback element
   */
  function renderPieChartFallback(container, labels, data, options = {}) {
    // Implementation is actually the same as bar chart but with percentages
    options.showPercentages = true;
    return renderBarChartFallback(container, labels, data, options);
  }
  
  /**
   * Check if a chart type is supported by this fallback module
   * 
   * @param {string} chartType - The chart type to check
   * @returns {boolean} Whether the chart type is supported
   */
  function isChartTypeSupported(chartType) {
    const supportedTypes = ['bar', 'horizontalBar', 'pie', 'doughnut', 'line'];
    return supportedTypes.includes(chartType.toLowerCase());
  }
  
  /**
   * Create a fallback chart
   * 
   * @param {string|HTMLElement} container - The container element or ID
   * @param {string} type - Chart type
   * @param {Object} data - Chart data with labels and datasets
   * @param {Object} options - Chart options
   * @returns {HTMLElement|null} The fallback element or null if not supported
   */
  function createFallbackChart(container, type, data, options = {}) {
    if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
      console.error("Invalid data format for fallback chart");
      return null;
    }
    
    const chartType = type.toLowerCase();
    const labels = data.labels;
    const chartData = data.datasets[0].data;
    const chartLabel = data.datasets[0].label || 'Data';
    
    if (chartType === 'bar' || chartType === 'horizontalbar') {
      return renderBarChartFallback(container, labels, chartData, {
        title: options.title || 'Bar Chart',
        labelHeader: 'Category',
        valueHeader: chartLabel,
        showPercentages: false
      });
    } else if (chartType === 'pie' || chartType === 'doughnut') {
      return renderPieChartFallback(container, labels, chartData, {
        title: options.title || 'Distribution Chart',
        labelHeader: 'Category',
        valueHeader: 'Count',
        showPercentages: true
      });
    } else if (chartType === 'line') {
      return renderBarChartFallback(container, labels, chartData, {
        title: options.title || 'Line Chart Data',
        labelHeader: 'X Axis',
        valueHeader: chartLabel,
        showPercentages: false
      });
    } else {
      console.warn(`Unsupported chart type for fallback: ${chartType}`);
      return null;
    }
  }
  
  /**
   * Replace a canvas with a fallback chart
   * 
   * @param {string} canvasId - ID of the canvas element
   * @param {string} type - Chart type
   * @param {Object} data - Chart data (labels and datasets)
   * @param {Object} options - Chart options
   * @returns {HTMLElement|null} The fallback element or null if failed
   */
  function replaceCanvasWithFallback(canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error(`Canvas #${canvasId} not found for fallback`);
      return null;
    }
    
    // Get the parent container
    const parent = canvas.parentNode;
    if (!parent) {
      console.error(`Canvas #${canvasId} has no parent element`);
      return null;
    }
    
    // Create a container to replace the canvas
    const fallbackContainer = document.createElement('div');
    fallbackContainer.id = `${canvasId}-fallback`;
    
    // Replace the canvas with the container
    parent.replaceChild(fallbackContainer, canvas);
    
    // Create the fallback chart
    return createFallbackChart(fallbackContainer, type, data, options);
  }
  
  /**
   * Create a Chart.js compatible API that uses fallbacks
   * This allows code that expects Chart.js to work with minimal changes
   * 
   * @returns {Object} A simplified Chart constructor
   */
  function createChartPolyfill() {
    // Create a constructor that mimics Chart.js
    function ChartPolyfill(canvasOrContext, config) {
      if (!config || !config.type || !config.data) {
        throw new Error("Invalid chart configuration");
      }
      
      this.id = canvasOrContext.id || 'chart-fallback';
      this.canvas = canvasOrContext;
      this.data = config.data;
      this.type = config.type;
      this.options = config.options || {};
      
      // Store on the instance for reference
      this._fallbackElement = replaceCanvasWithFallback(
        this.canvas.id,
        this.type,
        this.data, 
        this.options
      );
      
      return this;
    }
    
    // Add necessary methods to the prototype
    ChartPolyfill.prototype.update = function() {
      // Re-render the fallback with current data
      this._fallbackElement = replaceCanvasWithFallback(
        this.canvas.id,
        this.type,
        this.data,
        this.options
      );
      return this;
    };
    
    ChartPolyfill.prototype.destroy = function() {
      // Remove the fallback element
      if (this._fallbackElement && this._fallbackElement.parentNode) {
        this._fallbackElement.parentNode.removeChild(this._fallbackElement);
      }
      return this;
    };
    
    return {
      // Main constructor
      Chart: ChartPolyfill,
      
      // Register function is a no-op
      register: function() { 
        console.log("Chart fallback: register called (no-op)"); 
      }
    };
  }
  
  /**
   * Install a Chart.js polyfill when Chart.js is not available
   * This replaces window.Chart with our fallback implementation
   */
  function installChartPolyfill() {
    if (typeof Chart !== 'undefined') {
      console.log("Chart.js is already defined, not installing polyfill");
      return false;
    }
    
    console.log("Installing Chart.js polyfill for fallback rendering");
    const polyfill = createChartPolyfill();
    window.Chart = polyfill.Chart;
    window.Chart.register = polyfill.register;
    
    // Also create a fake registerables to avoid errors when code tries to use Chart.register()
    window.Chart.registerables = [];
    
    // Set a flag to indicate we're using the polyfill
    window.Chart.isFallback = true;
    
    return true;
  }
  
  // Public API
  return {
    createBarChartFallback: renderBarChartFallback,
    createPieChartFallback: renderPieChartFallback,
    replaceCanvasWithFallback: replaceCanvasWithFallback,
    installChartPolyfill: installChartPolyfill,
    isChartTypeSupported: isChartTypeSupported
  };
})();

// Load Chart.js using the centralized ScriptLoader service
// Only install polyfill if loading fails
document.addEventListener('DOMContentLoaded', function() {
  // Check if Chart.js is already available
  if (typeof Chart !== 'undefined' && Chart.defaults) {
    console.log("Chart.js is already loaded, no need to load again");
    return;
  }
  
  // Check if ScriptLoader is available
  if (!window.FireEMS || !window.FireEMS.ScriptLoader) {
    console.warn("FireEMS.ScriptLoader not available, falling back to polyfill");
    FireEMS.ChartFallback.installChartPolyfill();
    return;
  }
  
  // Use FireEMS.ScriptLoader to load Chart.js with fallbacks
  FireEMS.ScriptLoader.loadScript({ library: 'chart.js' })
    .then(function(result) {
      console.log("Chart.js loaded successfully from: " + result.source);
    })
    .catch(function(error) {
      console.warn("Chart.js loading failed, installing polyfill", error);
      
      // Install polyfill since Chart.js loading failed
      FireEMS.ChartFallback.installChartPolyfill();
      
      // Add a visual indicator for developers
      if (window.location.search.includes('debug=true')) {
        const indicator = document.createElement('div');
        indicator.style.position = 'fixed';
        indicator.style.top = '0';
        indicator.style.right = '0';
        indicator.style.backgroundColor = '#ff9800';
        indicator.style.color = 'white';
        indicator.style.padding = '5px 10px';
        indicator.style.fontSize = '12px';
        indicator.style.zIndex = '9999';
        indicator.textContent = 'Using Chart Fallbacks';
        document.body.appendChild(indicator);
      }
    });
});