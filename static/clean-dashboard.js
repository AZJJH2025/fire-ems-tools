/**
 * Clean Dashboard Implementation for Fire-EMS Response Time Analyzer
 * 
 * This script handles data loading, processing, and visualization without complex
 * dependencies or emergency mode fallbacks.
 * 
 * Version: 1.0.0
 */

// Initialization function
document.addEventListener('DOMContentLoaded', function() {
  // Check if we have data from the Data Formatter
  const hasFormatterData = window.DataVizTransfer && window.DataVizTransfer.visualization.hasFormatterData();
  
  if (hasFormatterData) {
    console.log('[Dashboard] Data from formatter detected, processing...');
    processFormatterData();
  } else {
    console.log('[Dashboard] No formatter data detected, setting up file upload handler');
    setupFileUpload();
  }
  
  // Initialize tooltips or other UI elements
  initializeUI();
});

/**
 * Process data received from the Data Formatter
 */
function processFormatterData() {
  try {
    // Get data from the transfer module
    const data = window.DataVizTransfer.visualization.getFormatterData();
    
    if (!data || data.length === 0) {
      console.error('[Dashboard] No valid data found from formatter');
      showError('No valid data found from the Data Formatter. Try uploading a file directly.');
      return;
    }
    
    console.log(`[Dashboard] Processing ${data.length} records from formatter`);
    
    // Hide upload container and display a success message
    document.querySelector('.file-upload-container').style.display = 'none';
    
    const resultArea = document.getElementById('result');
    resultArea.innerHTML = `
      <div class="notice" style="background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <strong>📊 Data successfully received from Data Formatter</strong><br>
        ${data.length} records processed. File upload has been bypassed.
      </div>
    `;
    
    // Process the data
    processData(data);
    
  } catch (error) {
    console.error('[Dashboard] Error processing formatter data:', error);
    showError(`Error processing data: ${error.message}`);
  }
}

/**
 * Set up the file upload handler
 */
function setupFileUpload() {
  const dropzone = document.querySelector('.file-input-wrapper');
  const fileInput = document.getElementById('fileInput');
  
  // Set up drag and drop events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Highlight drop area when drag enters
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
      dropzone.classList.add('highlight');
    }, false);
  });
  
  // Remove highlight when drag leaves
  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
      dropzone.classList.remove('highlight');
    }, false);
  });
  
  // Handle dropped files
  dropzone.addEventListener('drop', function(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      fileInput.files = files;
      handleFiles(files);
    }
  }, false);
  
  // Handle file input change
  fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      handleFiles(this.files);
    }
  });
  
  // Set up the upload button
  document.querySelector('.file-input-wrapper button').addEventListener('click', function() {
    if (fileInput.files.length > 0) {
      handleFiles(fileInput.files);
    } else {
      fileInput.click();
    }
  });
}

/**
 * Handle file upload
 * @param {FileList} files - The uploaded files
 */
function handleFiles(files) {
  const file = files[0];
  
  if (!file) return;
  
  // Check file type
  const extension = file.name.split('.').pop().toLowerCase();
  const validExtensions = ['csv', 'xlsx', 'xls'];
  
  if (!validExtensions.includes(extension)) {
    showError(`Invalid file type. Please upload a ${validExtensions.join(', ')} file.`);
    return;
  }
  
  // Show loading indicator
  document.getElementById('loading').style.display = 'block';
  document.getElementById('result').innerHTML = '';
  
  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  
  // Upload file to server
  fetch('/api/upload-fire-ems-data', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    document.getElementById('loading').style.display = 'none';
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error processing file');
    }
    
    // Process the data
    processData(data.data);
  })
  .catch(error => {
    document.getElementById('loading').style.display = 'none';
    showError(`Error uploading file: ${error.message}`);
    console.error('[Dashboard] File upload error:', error);
  });
}

/**
 * Process data and create visualizations
 * @param {Array} data - The data to process
 */
function processData(data) {
  try {
    console.log('[Dashboard] Processing data:', data.length, 'records');
    
    // Format and normalize the data
    const formattedData = formatData(data);
    console.log('[Dashboard] Formatted data:', formattedData.length, 'records');
    
    // Calculate statistics
    const stats = calculateStatistics(formattedData);
    console.log('[Dashboard] Statistics:', stats);
    
    // Show the dashboard container
    document.getElementById('dashboard').style.display = 'block';
    
    // Display file statistics
    displayFileStats(stats);
    
    // Create visualizations
    createIncidentMap(formattedData);
    createTimeVisualization(formattedData);
    createUnitVisualization(formattedData, stats);
    createLocationVisualization(formattedData, stats);
    createDataTable(formattedData);
    
    // Scroll to dashboard
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('[Dashboard] Error processing data:', error);
    showError(`Error processing data: ${error.message}`);
  }
}

/**
 * Format and normalize the data
 * @param {Array} data - The raw data
 * @returns {Array} - The formatted data
 */
function formatData(data) {
  // Create a copy to avoid modifying the original
  const formattedData = Array.isArray(data) ? [...data] : [];
  
  if (formattedData.length === 0) {
    console.warn('[Dashboard] No data to format');
    return [];
  }
  
  // Define field mappings for alternative names
  const fieldMappings = {
    'Unit': ['Unit ID', 'Responding Unit', 'Apparatus', 'UnitID', 'Unit_ID', 'UnitName'],
    'Reported': ['Incident Time', 'Reported Time', 'Time Reported', 'Call Time', 'Alarm Time', 'Incident_Time', 'Call_Time'],
    'Unit Dispatched': ['Dispatch Time', 'Dispatched', 'Time Dispatched', 'Dispatch', 'Dispatch_Time', 'TimeDispatched'],
    'Unit Enroute': ['En Route Time', 'Enroute', 'Time Enroute', 'Responding Time', 'EnRouteTime', 'TimeEnroute'],
    'Unit Onscene': ['On Scene Time', 'Onscene', 'Time Onscene', 'Arrival Time', 'Arrived', 'OnSceneTime', 'TimeOnScene', 'ArrivalTime']
  };
  
  // Process each record
  return formattedData.map(record => {
    // Create a new object to store the formatted record
    const formatted = { ...record };
    
    // Apply field mappings
    Object.entries(fieldMappings).forEach(([targetField, alternativeFields]) => {
      if (formatted[targetField] === undefined) {
        for (const altField of alternativeFields) {
          if (formatted[altField] !== undefined) {
            formatted[targetField] = formatted[altField];
            break;
          }
        }
      }
    });
    
    // Process date fields
    const dateFields = ['Reported', 'Unit Dispatched', 'Unit Enroute', 'Unit Onscene'];
    dateFields.forEach(field => {
      if (formatted[field]) {
        try {
          // Skip if already a Date object
          if (formatted[`${field}_obj`] instanceof Date) {
            return;
          }
          
          const date = new Date(formatted[field]);
          if (!isNaN(date.getTime())) {
            formatted[`${field}_obj`] = date;
            formatted[field] = formatDateTime(date);
          }
        } catch (e) {
          console.warn(`[Dashboard] Could not parse date for field ${field}:`, e);
        }
      }
    });
    
    // Process coordinates
    if (formatted.Latitude !== undefined && formatted.Longitude !== undefined) {
      // Ensure coordinates are numeric
      if (typeof formatted.Latitude !== 'number') {
        formatted.Latitude = parseFloat(formatted.Latitude);
      }
      if (typeof formatted.Longitude !== 'number') {
        formatted.Longitude = parseFloat(formatted.Longitude);
      }
      
      // Validate coordinates
      formatted.validCoordinates = 
        !isNaN(formatted.Latitude) && 
        !isNaN(formatted.Longitude) &&
        Math.abs(formatted.Latitude) <= 90 &&
        Math.abs(formatted.Longitude) <= 180;
    } else {
      formatted.validCoordinates = false;
    }
    
    // Calculate response time (in minutes) if not already present
    if (!formatted['Response Time (min)'] && 
        formatted['Unit Dispatched_obj'] && 
        formatted['Unit Onscene_obj']) {
      
      const dispatchTime = formatted['Unit Dispatched_obj'].getTime();
      const onSceneTime = formatted['Unit Onscene_obj'].getTime();
      
      if (onSceneTime >= dispatchTime) {
        const responseTimeMin = Math.round((onSceneTime - dispatchTime) / (1000 * 60));
        formatted['Response Time (min)'] = responseTimeMin;
      }
    }
    
    // Convert response time to number if it's a string
    if (formatted['Response Time (min)'] !== undefined && 
        typeof formatted['Response Time (min)'] === 'string') {
      formatted['Response Time (min)'] = parseFloat(formatted['Response Time (min)']);
    }
    
    // Normalize text fields
    if (formatted.Unit) {
      formatted.Unit = String(formatted.Unit).trim();
    }
    
    if (formatted['Incident City']) {
      formatted['Incident City'] = String(formatted['Incident City']).trim();
    }
    
    // Normalize incident ID field
    if (!formatted['Run No'] && formatted['Incident ID']) {
      formatted['Run No'] = formatted['Incident ID'];
    }
    
    // Ensure full address exists
    if (!formatted['Full Address'] && formatted.Address) {
      formatted['Full Address'] = formatted.Address;
    }
    
    return formatted;
  });
}

/**
 * Calculate statistics from the data
 * @param {Array} data - The formatted data
 * @returns {Object} - The calculated statistics
 */
function calculateStatistics(data) {
  const stats = {
    total: data.length,
    withCoordinates: 0,
    withResponseTime: 0,
    averageResponseTime: 0,
    busiestUnits: [],
    busiestLocations: [],
    firstDate: null,
    lastDate: null,
    responseTimes: []
  };
  
  // Skip processing for empty data
  if (data.length === 0) {
    return stats;
  }
  
  // Count records with valid coordinates
  stats.withCoordinates = data.filter(record => record.validCoordinates).length;
  
  // Process response times
  const responseTimes = data
    .filter(record => 
      record['Response Time (min)'] !== undefined && 
      !isNaN(record['Response Time (min)']) &&
      record['Response Time (min)'] >= 0 &&
      record['Response Time (min)'] < 60 // Filter out outliers
    )
    .map(record => record['Response Time (min)']);
  
  stats.withResponseTime = responseTimes.length;
  stats.responseTimes = responseTimes;
  
  // Calculate average response time
  if (responseTimes.length > 0) {
    stats.averageResponseTime = (responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length).toFixed(1);
  }
  
  // Find busiest units
  const unitCounts = {};
  data.forEach(record => {
    if (record.Unit) {
      unitCounts[record.Unit] = (unitCounts[record.Unit] || 0) + 1;
    }
  });
  
  stats.busiestUnits = Object.entries(unitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([unit, count]) => ({ unit, count }));
  
  // Find busiest locations
  const locationCounts = {};
  data.forEach(record => {
    const location = record['Incident City'] || 'Unknown';
    if (location !== 'Unknown') {
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    }
  });
  
  stats.busiestLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));
  
  // Find date range
  const dates = data
    .filter(record => record.Reported_obj instanceof Date)
    .map(record => record.Reported_obj);
  
  if (dates.length > 0) {
    stats.firstDate = new Date(Math.min(...dates.map(date => date.getTime())));
    stats.lastDate = new Date(Math.max(...dates.map(date => date.getTime())));
  }
  
  return stats;
}

/**
 * Display file statistics
 * @param {Object} stats - The statistics object
 */
function displayFileStats(stats) {
  const fileStats = document.getElementById('file-stats');
  
  if (!fileStats) return;
  
  let dateRange = 'Unknown date range';
  if (stats.firstDate && stats.lastDate) {
    const firstDate = stats.firstDate.toLocaleDateString();
    const lastDate = stats.lastDate.toLocaleDateString();
    dateRange = firstDate === lastDate ? 
      `Date: ${firstDate}` : 
      `Date range: ${firstDate} to ${lastDate}`;
  }
  
  fileStats.innerHTML = `
    <div class="stat-box">
      <div class="stat-value">${stats.total}</div>
      <div class="stat-label">Total Incidents</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${stats.withCoordinates}</div>
      <div class="stat-label">With Coordinates</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${stats.averageResponseTime}</div>
      <div class="stat-label">Avg. Response (min)</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${stats.busiestUnits[0]?.unit || 'N/A'}</div>
      <div class="stat-label">Busiest Unit</div>
    </div>
    <div class="stat-text">${dateRange}</div>
  `;
}

/**
 * Create the incident map
 * @param {Array} data - The formatted data
 */
function createIncidentMap(data) {
  const mapContainer = document.getElementById('incident-map');
  
  if (!mapContainer) return;
  
  // Check if we have valid coordinates
  const validRecords = data.filter(record => record.validCoordinates);
  
  if (validRecords.length === 0) {
    mapContainer.innerHTML = '<div class="no-data">No valid coordinates for mapping</div>';
    return;
  }
  
  // Create the map
  const map = L.map(mapContainer).setView([0, 0], 2);
  
  // Add the tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Add markers for each incident
  const markers = [];
  
  validRecords.forEach(record => {
    const marker = L.marker([record.Latitude, record.Longitude]);
    
    // Create popup content
    let popupContent = `<div class="map-popup">`;
    
    if (record['Run No'] || record['Incident ID']) {
      popupContent += `<div><strong>Incident:</strong> ${record['Run No'] || record['Incident ID']}</div>`;
    }
    
    if (record.Reported) {
      popupContent += `<div><strong>Time:</strong> ${record.Reported}</div>`;
    }
    
    if (record.Unit) {
      popupContent += `<div><strong>Unit:</strong> ${record.Unit}</div>`;
    }
    
    if (record['Response Time (min)'] !== undefined) {
      popupContent += `<div><strong>Response Time:</strong> ${record['Response Time (min)']} min</div>`;
    }
    
    if (record['Full Address'] || record.Address) {
      popupContent += `<div><strong>Location:</strong> ${record['Full Address'] || record.Address}</div>`;
    }
    
    popupContent += `</div>`;
    
    marker.bindPopup(popupContent);
    markers.push(marker);
  });
  
  // Create a marker group and add it to the map
  const group = L.featureGroup(markers).addTo(map);
  
  // Fit the map to the markers
  map.fitBounds(group.getBounds(), { padding: [20, 20] });
}

/**
 * Create the time visualization
 * @param {Array} data - The formatted data
 */
function createTimeVisualization(data) {
  // Extract time data
  const timeData = data
    .filter(record => record.Reported_obj instanceof Date)
    .map(record => ({
      timestamp: record.Reported_obj,
      unit: record.Unit,
      responseTime: record['Response Time (min)']
    }));
  
  if (timeData.length === 0) {
    document.getElementById('time-chart').innerHTML = '<div class="no-data">No valid time data available</div>';
    return;
  }
  
  // Use SimpleChartManager to create the heatmap
  if (window.SimpleChartManager) {
    window.SimpleChartManager.createTimeHeatmap('time-chart', timeData, {
      title: 'Incidents by Day and Hour',
      showLegend: true
    });
  } else {
    // Create a basic version if SimpleChartManager is not available
    const timeChart = document.getElementById('time-chart');
    timeChart.innerHTML = '<div class="error">Chart manager not available. Try refreshing the page.</div>';
  }
}

/**
 * Create the unit visualization
 * @param {Array} data - The formatted data
 * @param {Object} stats - The statistics object
 */
function createUnitVisualization(data, stats) {
  const unitData = stats.busiestUnits;
  
  if (unitData.length === 0) {
    document.getElementById('unit-chart').parentElement.innerHTML = '<div class="no-data">No valid unit data available</div>';
    return;
  }
  
  // Use SimpleChartManager to create the bar chart
  if (window.SimpleChartManager) {
    window.SimpleChartManager.createBarChart('unit-chart', 
      unitData.map(item => item.unit),
      unitData.map(item => item.count),
      {
        title: 'Incident Count by Unit',
        yAxisLabel: 'Incident Count',
        maintainAspectRatio: false
      }
    );
  } else {
    // Create a basic version if SimpleChartManager is not available
    const unitChart = document.getElementById('unit-chart').parentElement;
    unitChart.innerHTML = '<div class="error">Chart manager not available. Try refreshing the page.</div>';
  }
}

/**
 * Create the location visualization
 * @param {Array} data - The formatted data
 * @param {Object} stats - The statistics object
 */
function createLocationVisualization(data, stats) {
  const locationData = stats.busiestLocations;
  
  if (locationData.length === 0) {
    document.getElementById('location-chart').parentElement.innerHTML = '<div class="no-data">No valid location data available</div>';
    return;
  }
  
  // Use SimpleChartManager to create the pie chart
  if (window.SimpleChartManager) {
    window.SimpleChartManager.createPieChart('location-chart', 
      locationData.map(item => item.location),
      locationData.map(item => item.count),
      {
        title: 'Incidents by Location',
        maintainAspectRatio: false
      }
    );
  } else {
    // Create a basic version if SimpleChartManager is not available
    const locationChart = document.getElementById('location-chart').parentElement;
    locationChart.innerHTML = '<div class="error">Chart manager not available. Try refreshing the page.</div>';
  }
}

/**
 * Create the data table
 * @param {Array} data - The formatted data
 */
function createDataTable(data) {
  const tableContainer = document.getElementById('data-table');
  
  if (!tableContainer) return;
  
  if (data.length === 0) {
    tableContainer.innerHTML = '<div class="no-data">No data available</div>';
    return;
  }
  
  // Define columns to display
  const columns = [
    { field: 'Run No', label: 'Incident ID' },
    { field: 'Reported', label: 'Reported Time' },
    { field: 'Unit', label: 'Unit' },
    { field: 'Response Time (min)', label: 'Response Time (min)' },
    { field: 'Full Address', label: 'Location' },
    { field: 'Incident City', label: 'City' }
  ];
  
  // Create table HTML
  let tableHTML = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
  `;
  
  // Add table headers
  columns.forEach(column => {
    tableHTML += `<th>${column.label}</th>`;
  });
  
  tableHTML += `
          </tr>
        </thead>
        <tbody>
  `;
  
  // Add table rows (limit to 100 for performance)
  const displayData = data.slice(0, 100);
  
  displayData.forEach(record => {
    tableHTML += '<tr>';
    
    columns.forEach(column => {
      const value = record[column.field] !== undefined ? record[column.field] : '';
      tableHTML += `<td>${value}</td>`;
    });
    
    tableHTML += '</tr>';
  });
  
  tableHTML += `
        </tbody>
      </table>
    </div>
  `;
  
  // Add a note if we limited the data
  if (data.length > 100) {
    tableHTML += `<div class="table-note">Showing 100 of ${data.length} records</div>`;
  }
  
  tableContainer.innerHTML = tableHTML;
}

/**
 * Initialize UI elements
 */
function initializeUI() {
  // Add event listeners for any UI elements
  
  // Close help modal if present
  const closeModalButton = document.getElementById('close-help-modal');
  const helpModal = document.getElementById('data-transfer-help');
  
  if (closeModalButton && helpModal) {
    closeModalButton.addEventListener('click', function() {
      helpModal.style.display = 'none';
    });
  }
  
  // Add check storage button functionality
  const checkStorageButton = document.getElementById('check-storage-btn');
  
  if (checkStorageButton) {
    checkStorageButton.addEventListener('click', function() {
      checkStorageStatus();
    });
  }
}

/**
 * Check storage status
 */
function checkStorageStatus() {
  const storageInfo = {
    localStorage: {
      available: false,
      size: 0,
      error: null
    },
    sessionStorage: {
      available: false,
      size: 0,
      error: null
    }
  };
  
  // Check localStorage
  try {
    const testKey = 'test_' + Date.now();
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    storageInfo.localStorage.available = true;
    
    // Estimate size
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      size += key.length + (value ? value.length : 0);
    }
    
    storageInfo.localStorage.size = Math.round(size / 1024);
  } catch (error) {
    storageInfo.localStorage.error = error.message;
  }
  
  // Check sessionStorage
  try {
    const testKey = 'test_' + Date.now();
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
    storageInfo.sessionStorage.available = true;
    
    // Estimate size
    let size = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      size += key.length + (value ? value.length : 0);
    }
    
    storageInfo.sessionStorage.size = Math.round(size / 1024);
  } catch (error) {
    storageInfo.sessionStorage.error = error.message;
  }
  
  // Create a message
  alert(`Storage Status:
  
localStorage:
- Available: ${storageInfo.localStorage.available ? 'Yes' : 'No'}
- Current Usage: ${storageInfo.localStorage.size} KB
${storageInfo.localStorage.error ? '- Error: ' + storageInfo.localStorage.error : ''}

sessionStorage:
- Available: ${storageInfo.sessionStorage.available ? 'Yes' : 'No'}
- Current Usage: ${storageInfo.sessionStorage.size} KB
${storageInfo.sessionStorage.error ? '- Error: ' + storageInfo.sessionStorage.error : ''}
`);
}

/**
 * Format a Date object to a readable string
 * @param {Date} date - The date to format
 * @returns {string} - The formatted date string
 */
function formatDateTime(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) return '';
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Show an error message
 * @param {string} message - The error message
 */
function showError(message) {
  const resultArea = document.getElementById('result');
  
  if (!resultArea) return;
  
  resultArea.innerHTML = `
    <div class="notice error" style="background-color: #ffebee; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #f44336;">
      <strong>⚠️ Error</strong><br>
      ${message}
    </div>
  `;
}