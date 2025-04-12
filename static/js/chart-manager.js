/**
 * Chart Manager
 * A centralized service for managing Chart.js instances
 * to prevent canvas reuse errors and ensure proper cleanup
 */
window.FireEMS = window.FireEMS || {};

FireEMS.ChartManager = (function() {
  // Store all chart instances
  const _charts = {};
  
  /**
   * Create or update a Chart.js instance
   * @param {string} id - Canvas element ID
   * @param {string} type - Chart type
   * @param {Object} data - Chart data
   * @param {Object} options - Chart options
   * @returns {Chart} Chart instance
   */
  function createChart(id, type, data, options) {
    // Clean up existing chart if it exists
    destroyChart(id);
    
    // Get canvas element
    let canvas = document.getElementById(id);
    if (!canvas) {
      console.error(`Canvas with ID ${id} not found`);
      return null;
    }
    
    // Create a fresh canvas to prevent any potential reuse issues
    const parent = canvas.parentNode;
    const newCanvas = document.createElement('canvas');
    newCanvas.id = id;
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    newCanvas.className = canvas.className;
    
    // Replace old canvas with new one
    parent.replaceChild(newCanvas, canvas);
    canvas = newCanvas;
    
    // Create new chart
    _charts[id] = new Chart(canvas, {
      type: type,
      data: data,
      options: options
    });
    
    return _charts[id];
  }

  /**
   * Destroy a specific chart instance
   * @param {string} id - Canvas element ID
   */
  function destroyChart(id) {
    if (_charts[id] && typeof _charts[id].destroy === 'function') {
      _charts[id].destroy();
      delete _charts[id];
      console.log(`Chart ${id} destroyed`);
    }
  }

  /**
   * Destroy all chart instances
   */
  function destroyAllCharts() {
    Object.keys(_charts).forEach(id => {
      destroyChart(id);
    });
  }

  /**
   * Get a chart instance
   * @param {string} id - Canvas element ID
   * @returns {Chart} Chart instance
   */
  function getChart(id) {
    return _charts[id] || null;
  }

  /**
   * Get all chart instances
   * @returns {Object} All chart instances
   */
  function getAllCharts() {
    return _charts;
  }

  // Setup cleanup on page unload
  window.addEventListener('beforeunload', destroyAllCharts);

  // Public API
  return {
    create: createChart,
    destroy: destroyChart,
    destroyAll: destroyAllCharts,
    get: getChart,
    getAll: getAllCharts
  };
})();