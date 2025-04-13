/**
 * Simple Chart Manager
 * A minimal chart creation manager without complex dependencies
 * 
 * Version: 1.0.0
 */

(function() {
  // Create a namespace for our module
  window.SimpleChartManager = {
    // Configuration
    config: {
      debug: true,
      version: '1.0.0',
      defaultColors: [
        '#4285F4', '#EA4335', '#FBBC05', '#34A853', // Google colors
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', // Flat UI colors
        '#9b59b6', '#1abc9c', '#d35400', '#c0392b', // More Flat UI
        '#7F7F7F', '#BCBD22', '#8C564B', '#17BECF'  // Additional colors
      ]
    },
    
    // State
    state: {
      initialized: false,
      chartInstances: {}
    },
    
    /**
     * Initialize the chart manager
     * @returns {boolean} - Success status
     */
    initialize: function() {
      try {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
          console.error('[SimpleChartManager] Chart.js is not loaded');
          return this.loadChartJs();
        }
        
        // Set up global Chart.js defaults
        Chart.defaults.font.family = "'Open Sans', sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.plugins.title.display = true;
        Chart.defaults.plugins.title.font.size = 16;
        Chart.defaults.plugins.tooltip.cornerRadius = 4;
        Chart.defaults.plugins.legend.position = 'bottom';
        
        if (this.config.debug) {
          console.log(`[SimpleChartManager] Initialized. Chart.js version: ${Chart.version}`);
        }
        
        this.state.initialized = true;
        return true;
      } catch (error) {
        console.error('[SimpleChartManager] Error initializing:', error);
        return false;
      }
    },
    
    /**
     * Load Chart.js dynamically if not already loaded
     * @returns {Promise<boolean>} - Success status
     */
    loadChartJs: function() {
      return new Promise((resolve, reject) => {
        try {
          if (typeof Chart !== 'undefined') {
            if (this.config.debug) {
              console.log('[SimpleChartManager] Chart.js already loaded');
            }
            resolve(true);
            return;
          }
          
          if (this.config.debug) {
            console.log('[SimpleChartManager] Loading Chart.js dynamically');
          }
          
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
          script.integrity = 'sha256-/2fnF+0/vcAblXJ+bHRCmFmUxrWWh6zLV9Pq9KMNHAQ=';
          script.crossOrigin = 'anonymous';
          
          script.onload = () => {
            if (this.config.debug) {
              console.log('[SimpleChartManager] Chart.js loaded successfully');
            }
            this.initialize();
            resolve(true);
          };
          
          script.onerror = (error) => {
            console.error('[SimpleChartManager] Failed to load Chart.js:', error);
            reject(error);
          };
          
          document.head.appendChild(script);
        } catch (error) {
          console.error('[SimpleChartManager] Error loading Chart.js:', error);
          reject(error);
        }
      });
    },
    
    /**
     * Create a bar chart
     * @param {string} elementId - The ID of the canvas element
     * @param {string[]} labels - The labels for the chart
     * @param {number[]} data - The data values
     * @param {Object} options - Additional options
     * @returns {Chart|null} - The Chart.js instance or null on error
     */
    createBarChart: function(elementId, labels, data, options = {}) {
      try {
        if (!this.state.initialized) {
          this.initialize();
        }
        
        const canvas = document.getElementById(elementId);
        if (!canvas) {
          console.error(`[SimpleChartManager] Element with ID '${elementId}' not found`);
          return null;
        }
        
        // Destroy existing chart if it exists
        if (this.state.chartInstances[elementId]) {
          this.state.chartInstances[elementId].destroy();
        }
        
        const ctx = canvas.getContext('2d');
        
        // Set up chart configuration
        const chartConfig = {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: options.label || 'Data',
              data: data,
              backgroundColor: options.colors || this.config.defaultColors,
              borderColor: options.borderColors || 'rgba(255, 255, 255, 0.7)',
              borderWidth: options.borderWidth || 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: options.maintainAspectRatio !== undefined ? options.maintainAspectRatio : true,
            plugins: {
              title: {
                display: true,
                text: options.title || 'Bar Chart'
              },
              legend: {
                display: options.showLegend !== undefined ? options.showLegend : false
              },
              tooltip: {
                enabled: true
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: !!options.yAxisLabel,
                  text: options.yAxisLabel
                }
              },
              x: {
                title: {
                  display: !!options.xAxisLabel,
                  text: options.xAxisLabel
                }
              }
            }
          }
        };
        
        // Create the chart
        const chart = new Chart(ctx, chartConfig);
        
        // Store the chart instance
        this.state.chartInstances[elementId] = chart;
        
        if (this.config.debug) {
          console.log(`[SimpleChartManager] Bar chart created with ID: ${elementId}`);
        }
        
        return chart;
      } catch (error) {
        console.error('[SimpleChartManager] Error creating bar chart:', error);
        return null;
      }
    },
    
    /**
     * Create a pie chart
     * @param {string} elementId - The ID of the canvas element
     * @param {string[]} labels - The labels for the chart
     * @param {number[]} data - The data values
     * @param {Object} options - Additional options
     * @returns {Chart|null} - The Chart.js instance or null on error
     */
    createPieChart: function(elementId, labels, data, options = {}) {
      try {
        if (!this.state.initialized) {
          this.initialize();
        }
        
        const canvas = document.getElementById(elementId);
        if (!canvas) {
          console.error(`[SimpleChartManager] Element with ID '${elementId}' not found`);
          return null;
        }
        
        // Destroy existing chart if it exists
        if (this.state.chartInstances[elementId]) {
          this.state.chartInstances[elementId].destroy();
        }
        
        const ctx = canvas.getContext('2d');
        
        // Set up chart configuration
        const chartConfig = {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: options.colors || this.config.defaultColors,
              borderColor: options.borderColors || 'rgba(255, 255, 255, 0.7)',
              borderWidth: options.borderWidth || 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: options.maintainAspectRatio !== undefined ? options.maintainAspectRatio : true,
            plugins: {
              title: {
                display: true,
                text: options.title || 'Pie Chart'
              },
              legend: {
                display: options.showLegend !== undefined ? options.showLegend : true,
                position: options.legendPosition || 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        };
        
        // Create the chart
        const chart = new Chart(ctx, chartConfig);
        
        // Store the chart instance
        this.state.chartInstances[elementId] = chart;
        
        if (this.config.debug) {
          console.log(`[SimpleChartManager] Pie chart created with ID: ${elementId}`);
        }
        
        return chart;
      } catch (error) {
        console.error('[SimpleChartManager] Error creating pie chart:', error);
        return null;
      }
    },
    
    /**
     * Create a time chart (heatmap style)
     * @param {string} elementId - The ID of the element to render the chart in
     * @param {Array} data - The time data array
     * @param {Object} options - Additional options
     * @returns {Object|null} - A reference to the created chart or null on error
     */
    createTimeHeatmap: function(elementId, data, options = {}) {
      try {
        const container = document.getElementById(elementId);
        if (!container) {
          console.error(`[SimpleChartManager] Element with ID '${elementId}' not found`);
          return null;
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Process the data to create a time heatmap (day of week x hour of day)
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const hours = Array.from({ length: 24 }, (_, i) => i);
        
        // Initialize heatmap data
        const heatmapData = days.map(() => Array(24).fill(0));
        
        // Fill the heatmap data
        data.forEach(item => {
          if (item.timestamp instanceof Date) {
            const day = item.timestamp.getDay();
            const hour = item.timestamp.getHours();
            heatmapData[day][hour]++;
          }
        });
        
        // Create the heatmap container
        const heatmapContainer = document.createElement('div');
        heatmapContainer.className = 'time-heatmap';
        heatmapContainer.style.display = 'grid';
        heatmapContainer.style.gridTemplateColumns = 'auto repeat(24, 1fr)';
        heatmapContainer.style.gap = '2px';
        heatmapContainer.style.fontFamily = "'Open Sans', sans-serif";
        heatmapContainer.style.fontSize = '12px';
        
        // Add title if specified
        if (options.title) {
          const title = document.createElement('div');
          title.textContent = options.title;
          title.style.gridColumn = '1 / span 25';
          title.style.textAlign = 'center';
          title.style.fontWeight = 'bold';
          title.style.marginBottom = '10px';
          title.style.fontSize = '16px';
          heatmapContainer.appendChild(title);
        }
        
        // Add hour labels
        heatmapContainer.appendChild(document.createElement('div')); // Empty corner cell
        hours.forEach(hour => {
          const hourLabel = document.createElement('div');
          hourLabel.textContent = hour;
          hourLabel.style.textAlign = 'center';
          hourLabel.style.fontWeight = 'bold';
          hourLabel.style.fontSize = '10px';
          heatmapContainer.appendChild(hourLabel);
        });
        
        // Find the maximum value for scaling
        const maxValue = Math.max(...heatmapData.flat());
        
        // Add day rows with heatmap cells
        days.forEach((day, dayIndex) => {
          // Add day label
          const dayLabel = document.createElement('div');
          dayLabel.textContent = dayAbbr[dayIndex];
          dayLabel.style.fontWeight = 'bold';
          dayLabel.style.paddingRight = '5px';
          dayLabel.style.display = 'flex';
          dayLabel.style.alignItems = 'center';
          heatmapContainer.appendChild(dayLabel);
          
          // Add hour cells for the day
          hours.forEach(hour => {
            const count = heatmapData[dayIndex][hour];
            const cell = document.createElement('div');
            
            // Calculate color intensity based on the value
            const intensity = maxValue > 0 ? count / maxValue : 0;
            const hue = 200; // Blue
            const saturation = 90;
            const lightness = 100 - (intensity * 50); // 50% to 100% lightness
            
            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            cell.style.height = '20px';
            cell.style.position = 'relative';
            cell.style.borderRadius = '2px';
            
            // Add count as tooltip
            cell.title = `${day} ${hour}:00 - ${count} incidents`;
            
            // Add count as text for cells with data
            if (count > 0) {
              const countText = document.createElement('span');
              countText.textContent = count;
              countText.style.position = 'absolute';
              countText.style.top = '50%';
              countText.style.left = '50%';
              countText.style.transform = 'translate(-50%, -50%)';
              countText.style.fontSize = '9px';
              countText.style.color = lightness < 60 ? 'white' : 'black';
              cell.appendChild(countText);
            }
            
            heatmapContainer.appendChild(cell);
          });
        });
        
        // Add legend
        if (options.showLegend !== false) {
          const legend = document.createElement('div');
          legend.style.display = 'flex';
          legend.style.justifyContent = 'center';
          legend.style.alignItems = 'center';
          legend.style.marginTop = '15px';
          legend.style.gridColumn = '1 / span 25';
          
          const legendText1 = document.createElement('span');
          legendText1.textContent = 'Low';
          legendText1.style.marginRight = '5px';
          
          const gradient = document.createElement('div');
          gradient.style.width = '150px';
          gradient.style.height = '15px';
          gradient.style.background = 'linear-gradient(to right, hsl(200, 90%, 95%), hsl(200, 90%, 50%))';
          gradient.style.margin = '0 5px';
          gradient.style.borderRadius = '2px';
          
          const legendText2 = document.createElement('span');
          legendText2.textContent = 'High';
          legendText2.style.marginLeft = '5px';
          
          legend.appendChild(legendText1);
          legend.appendChild(gradient);
          legend.appendChild(legendText2);
          
          heatmapContainer.appendChild(legend);
        }
        
        // Add the heatmap to the container
        container.appendChild(heatmapContainer);
        
        if (this.config.debug) {
          console.log(`[SimpleChartManager] Time heatmap created with ID: ${elementId}`);
        }
        
        return {
          id: elementId,
          type: 'timeHeatmap',
          data: heatmapData
        };
      } catch (error) {
        console.error('[SimpleChartManager] Error creating time heatmap:', error);
        return null;
      }
    },
    
    /**
     * Update an existing chart with new data
     * @param {string} elementId - The ID of the canvas element
     * @param {Array} labels - The new labels
     * @param {Array} data - The new data
     * @returns {boolean} - Success status
     */
    updateChart: function(elementId, labels, data) {
      try {
        const chart = this.state.chartInstances[elementId];
        if (!chart) {
          console.error(`[SimpleChartManager] No chart found with ID: ${elementId}`);
          return false;
        }
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
        
        if (this.config.debug) {
          console.log(`[SimpleChartManager] Chart updated with ID: ${elementId}`);
        }
        
        return true;
      } catch (error) {
        console.error('[SimpleChartManager] Error updating chart:', error);
        return false;
      }
    },
    
    /**
     * Destroy a chart instance
     * @param {string} elementId - The ID of the canvas element
     * @returns {boolean} - Success status
     */
    destroyChart: function(elementId) {
      try {
        const chart = this.state.chartInstances[elementId];
        if (!chart) {
          console.error(`[SimpleChartManager] No chart found with ID: ${elementId}`);
          return false;
        }
        
        chart.destroy();
        delete this.state.chartInstances[elementId];
        
        if (this.config.debug) {
          console.log(`[SimpleChartManager] Chart destroyed with ID: ${elementId}`);
        }
        
        return true;
      } catch (error) {
        console.error('[SimpleChartManager] Error destroying chart:', error);
        return false;
      }
    }
  };
  
  // Auto-initialize
  document.addEventListener('DOMContentLoaded', function() {
    window.SimpleChartManager.initialize();
  });
})();