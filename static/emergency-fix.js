/**
 * Emergency Fix for Fire-EMS Dashboard
 * Direct rendering approach that bypasses the complex framework
 * Version: 1.0
 */

(function() {
  // Create diagnostic data we can track through the process
  window.emergencyFixDiagnostic = {
    timestamp: Date.now(),
    version: "v1.0",
    url: window.location.href,
    loadTime: new Date().toISOString()
  };
  
  console.log("🚨 Emergency fix script loaded:", window.emergencyFixDiagnostic);
  
  // Ensure Chart.js is loaded
  function loadChartJS() {
    return new Promise((resolve, reject) => {
      if (window.Chart) {
        console.log("Chart.js already loaded");
        resolve(window.Chart);
        return;
      }
      
      console.log("Loading Chart.js from CDN");
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js";
      script.onload = () => {
        console.log("Chart.js loaded successfully");
        resolve(window.Chart);
      };
      script.onerror = (e) => {
        console.error("Failed to load Chart.js", e);
        reject(e);
      };
      document.head.appendChild(script);
    });
  }
  
  // Ensure Leaflet.js is loaded
  function loadLeaflet() {
    return new Promise((resolve, reject) => {
      if (window.L) {
        console.log("Leaflet already loaded");
        resolve(window.L);
        return;
      }
      
      // Check if the Leaflet CSS is loaded
      const cssLoaded = Array.from(document.styleSheets).some(sheet => 
        sheet.href && sheet.href.includes('leaflet'));
      
      if (!cssLoaded) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }
      
      console.log("Loading Leaflet from CDN");
      const script = document.createElement('script');
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        console.log("Leaflet loaded successfully");
        resolve(window.L);
      };
      script.onerror = (e) => {
        console.error("Failed to load Leaflet", e);
        reject(e);
      };
      document.head.appendChild(script);
    });
  }
  
  // Initialize the map
  function initMap(L, data) {
    console.log("Initializing map with", data ? data.length : 0, "records");
    
    const mapContainer = document.getElementById('incident-map');
    if (!mapContainer) {
      console.error("Map container not found");
      return null;
    }
    
    // Force container to be visible with minimum height
    mapContainer.style.display = 'block';
    mapContainer.style.height = '400px';
    mapContainer.style.width = '100%';
    
    // Create the map
    const map = L.map(mapContainer).setView([39.8283, -98.5795], 4); // Center on US
    
    // Add the tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // If we have data with coordinates, add markers and fit bounds
    if (data && data.length) {
      const markers = [];
      const bounds = L.latLngBounds();
      let validMarkers = 0;
      
      data.forEach(item => {
        // Check for valid coordinates
        const lat = parseFloat(item.Latitude || item.latitude);
        const lng = parseFloat(item.Longitude || item.longitude);
        
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          // Create marker with popup
          const marker = L.marker([lat, lng]).addTo(map);
          
          // Generate popup content
          const popupContent = `
            <strong>${item.Unit || 'Unknown Unit'}</strong><br>
            ${item.Type || item['Incident Type'] || 'Incident'}<br>
            ${new Date(item.Reported || item['Incident Date'] || '').toLocaleString()}
          `;
          
          marker.bindPopup(popupContent);
          markers.push(marker);
          bounds.extend([lat, lng]);
          validMarkers++;
        }
      });
      
      // If we have valid markers, fit bounds
      if (validMarkers > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
      
      console.log(`Added ${validMarkers} markers to map`);
    } else {
      // Add a message if no data
      const noDataDiv = document.createElement('div');
      noDataDiv.className = 'no-data-message';
      noDataDiv.innerHTML = 'No location data available to display on map';
      noDataDiv.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 10px; border-radius: 5px; z-index: 1000;';
      mapContainer.appendChild(noDataDiv);
    }
    
    return map;
  }
  
  // Create unit activity chart
  function createUnitChart(Chart, data) {
    console.log("Creating unit chart with", data ? data.length : 0, "records");
    
    const canvas = document.getElementById('unit-chart');
    if (!canvas) {
      console.error("Unit chart canvas not found");
      return null;
    }
    
    // Force container to be visible
    const container = canvas.closest('.chart-container');
    if (container) {
      container.style.display = 'block';
      container.style.height = '300px';
    }
    
    // Get the chart context
    const ctx = canvas.getContext('2d');
    
    // Check if we already have a chart instance
    if (canvas.chart) {
      canvas.chart.destroy();
    }
    
    // Process data for the chart
    let unitCounts = {};
    let chartData;
    
    if (data && data.length) {
      // Count incidents by unit with expanded field mappings and fallbacks
      data.forEach(item => {
        // Try all possible unit field names
        let unit = item.Unit || item.UnitID || item.unit || item.unit_id || 
                   item['Unit ID'] || item.UnitName || item.unit_name;
        
        // If no unit found, try to derive from incident_type or incident_id
        if (!unit) {
          if (item.incident_type) {
            // Use incident type as fallback (MED, ALM, 901, STRU)
            unit = `Type: ${item.incident_type}`;
            console.log(`Using incident_type as unit: ${unit}`);
          } else if (item.incident_id && item.incident_id.length > 4) {
            // Extract prefix from incident ID (e.g., "GY" from "GY250408001")
            const prefix = item.incident_id.substring(0, 2);
            unit = `Unit ${prefix}`;
            console.log(`Extracted unit from incident_id: ${unit}`);
          }
        }
        
        // Skip empty values
        if (unit && unit !== 'Unknown') {
          unitCounts[unit] = (unitCounts[unit] || 0) + 1;
          console.log(`Found unit: ${unit}, count: ${unitCounts[unit]}`);
        } else {
          // Use a generic fallback if truly nothing found
          unitCounts['Unspecified'] = (unitCounts['Unspecified'] || 0) + 1;
        }
      });
      
      // Sort and get top units
      const sortedUnits = Object.entries(unitCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      chartData = {
        labels: sortedUnits.map(u => u[0]),
        datasets: [{
          label: 'Incident Count',
          data: sortedUnits.map(u => u[1]),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(201, 203, 207, 0.6)',
            'rgba(100, 120, 140, 0.6)',
            'rgba(120, 140, 160, 0.6)',
            'rgba(140, 160, 180, 0.6)'
          ]
        }]
      };
    } else {
      // Example data if no real data is available
      chartData = {
        labels: ['Example Unit 1', 'Example Unit 2', 'Example Unit 3'],
        datasets: [{
          label: 'Example Data',
          data: [12, 19, 3],
          backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 159, 64, 0.6)']
        }]
      };
    }
    
    // Create the chart
    canvas.chart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: data && data.length ? 'Incidents by Unit' : 'Example Chart - No Data'
          },
          legend: {
            display: false
          }
        }
      }
    });
    
    console.log("Unit chart created successfully");
    return canvas.chart;
  }
  
  // Create location chart
  function createLocationChart(Chart, data) {
    console.log("Creating location chart with", data ? data.length : 0, "records");
    
    const canvas = document.getElementById('location-chart');
    if (!canvas) {
      console.error("Location chart canvas not found");
      return null;
    }
    
    // Force container to be visible
    const container = canvas.closest('.chart-container');
    if (container) {
      container.style.display = 'block';
      container.style.height = '300px';
    }
    
    // Get the chart context
    const ctx = canvas.getContext('2d');
    
    // Check if we already have a chart instance
    if (canvas.chart) {
      canvas.chart.destroy();
    }
    
    // Process data for the chart
    let locationCounts = {};
    let chartData;
    
    if (data && data.length) {
      // Count incidents by location with expanded field mappings and address extraction
      data.forEach(item => {
        // Try all possible location field names
        let location = item['Incident City'] || item.City || item.city || 
                        item.location || item.Location;
        
        // If no location found but we have an address, extract a simplified location
        if (!location && item.address) {
          try {
            // Try to extract a meaningful part from the address
            // First clean up the address - remove quotes and extra spaces
            const cleanAddress = item.address.replace(/['"]/g, '').trim();
            
            // Extract the first part of the address that looks like a street name
            // Use a reasonable approach based on actual data format
            if (cleanAddress.includes('/')) {
              // Handle intersection format "STREET1 / STREET2"
              location = cleanAddress.split('/')[1].trim() + " Area";
              console.log(`Extracted location from intersection: ${location}`);
            } else if (cleanAddress.includes(' ')) {
              // Get the last word as it might be a road type (RD, AVE, etc.)
              const parts = cleanAddress.split(' ');
              const lastWord = parts[parts.length - 1];
              
              if (['RD', 'AVE', 'ST', 'PKWY', 'DR', 'LN', 'BLVD'].includes(lastWord)) {
                // Use the last 2-3 words if it ends with a road type
                location = parts.slice(-2).join(' ') + " Area";
              } else {
                // Just use the first 3 words
                location = parts.slice(0, Math.min(3, parts.length)).join(' ') + " Area";
              }
              
              console.log(`Extracted location from address: ${location}`);
            } else {
              location = cleanAddress + " Area";
            }
          } catch(e) {
            console.error("Error extracting location from address:", e);
            location = "Address Area";
          }
        }
        
        // Skip empty or unknown values
        if (location && location !== 'Unknown') {
          locationCounts[location] = (locationCounts[location] || 0) + 1;
          console.log(`Found location: ${location}, count: ${locationCounts[location]}`);
        } else {
          // Use a generic fallback if truly nothing found
          locationCounts['Other Areas'] = (locationCounts['Other Areas'] || 0) + 1;
        }
      });
      
      // Sort and get top locations
      const sortedLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7);
      
      chartData = {
        labels: sortedLocations.map(l => l[0]),
        datasets: [{
          data: sortedLocations.map(l => l[1]),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(201, 203, 207, 0.6)'
          ]
        }]
      };
    } else {
      // Example data if no real data is available
      chartData = {
        labels: ['Example Location 1', 'Example Location 2', 'Example Location 3'],
        datasets: [{
          data: [5, 10, 3],
          backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 159, 64, 0.6)']
        }]
      };
    }
    
    // Create the chart
    canvas.chart = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: data && data.length ? 'Incidents by Location' : 'Example Chart - No Data'
          }
        }
      }
    });
    
    console.log("Location chart created successfully");
    return canvas.chart;
  }
  
  // Create time heatmap
  function createTimeHeatmap(data) {
    console.log("Creating time heatmap with", data ? data.length : 0, "records");
    
    const container = document.getElementById('time-chart');
    if (!container) {
      console.error("Time chart container not found");
      return;
    }
    
    // Force container to be visible
    container.style.display = 'block';
    container.style.height = '400px';
    
    // Clear existing content
    container.innerHTML = '';
    
    if (!data || !data.length) {
      container.innerHTML = '<div class="no-data-message" style="text-align: center; padding: 20px;">No time data available</div>';
      return;
    }
    
    // Create simple heatmap for day of week and hour
    const heatmapData = Array(7).fill().map(() => Array(24).fill(0)); // [day][hour]
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Process data with better time handling
    let validDates = 0;
    data.forEach(item => {
      // First get the date part (MM/DD/YYYY)
      const dateStr = item.incident_date || item['Incident Date'] || 
                      item.Date || item.date || item['reported_date'];
      
      // Then get the time part - prioritize these fields that typically have the incident time
      const timeStr = item.incident_time || item.dispatch_time || item.reported_time ||
                      item.Reported || item['Reported Time'];
      
      console.log("Date components:", { dateStr, timeStr });
      
      // We need at least a date to proceed
      if (dateStr) {
        let finalDateTime;
        
        // If we have both date and time, combine them
        if (timeStr) {
          // Check if timeStr is in HH:MM or HH:MM:SS format
          if (typeof timeStr === 'string' && timeStr.match(/^\d{1,2}:\d{1,2}(:\d{1,2})?$/)) {
            // Parse the time manually to get hours
            const timeParts = timeStr.split(':');
            const hours = parseInt(timeParts[0], 10);
            const minutes = parseInt(timeParts[1], 10);
            
            // Create a date object from date string
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
              // Set the hours and minutes
              dateObj.setHours(hours, minutes, 0);
              finalDateTime = dateObj;
              console.log(`Combined date ${dateStr} and time ${timeStr} -> ${dateObj.toString()}`);
            }
          } else {
            // Try standard combination
            finalDateTime = new Date(`${dateStr} ${timeStr}`);
          }
        } else {
          // If no time, try to see if we can extract it from other fields
          if (item.dispatch_time && typeof item.dispatch_time === 'string' && 
              item.dispatch_time.match(/^\d{1,2}:\d{1,2}(:\d{1,2})?$/)) {
            // Use dispatch time 
            const timeParts = item.dispatch_time.split(':');
            const hours = parseInt(timeParts[0], 10);
            const minutes = parseInt(timeParts[1], 10);
            
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
              dateObj.setHours(hours, minutes, 0);
              finalDateTime = dateObj;
              console.log(`Used dispatch_time: ${hours}:${minutes}`);
            }
          } else {
            // Just use the date at midnight
            finalDateTime = new Date(dateStr);
          }
        }
        
        // Now process the final date/time
        if (finalDateTime && !isNaN(finalDateTime.getTime())) {
          const day = finalDateTime.getDay();
          const hour = finalDateTime.getHours();
          console.log(`Adding incident on day ${day} at hour ${hour}`);
          heatmapData[day][hour]++;
          validDates++;
        } else {
          console.warn("Could not parse date/time:", { dateStr, timeStr });
        }
      }
    });
    
    if (validDates === 0) {
      container.innerHTML = '<div class="no-data-message" style="text-align: center; padding: 20px;">No valid date/time data found</div>';
      return;
    }
    
    // Find max value for color scaling
    const maxValue = Math.max(...heatmapData.flat());
    
    // Create the heatmap table
    const table = document.createElement('table');
    table.className = 'heatmap-table';
    table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 12px;';
    
    // Add header row with hours using 12-hour format
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // Empty corner cell
    for (let hour = 0; hour < 24; hour++) {
      const th = document.createElement('th');
      // Format hours in a more readable way
      if (hour === 0) {
        th.textContent = '12a';
      } else if (hour === 12) {
        th.textContent = '12p';
      } else if (hour < 12) {
        th.textContent = hour + 'a';
      } else {
        th.textContent = (hour - 12) + 'p';
      }
      th.style.cssText = 'padding: 2px; text-align: center; font-weight: normal;';
      headerRow.appendChild(th);
    }
    table.appendChild(headerRow);
    
    // Add data rows
    for (let day = 0; day < 7; day++) {
      const row = document.createElement('tr');
      
      // Add day label
      const dayCell = document.createElement('th');
      dayCell.textContent = dayNames[day].substring(0, 3);
      dayCell.style.cssText = 'padding: 2px; text-align: right; font-weight: normal;';
      row.appendChild(dayCell);
      
      // Add hour cells
      for (let hour = 0; hour < 24; hour++) {
        const cell = document.createElement('td');
        const value = heatmapData[day][hour];
        
        // Calculate color intensity (blue scale)
        const intensity = maxValue > 0 ? value / maxValue : 0;
        const r = Math.round(220 * (1 - intensity));
        const g = Math.round(220 * (1 - intensity));
        const b = 255;
        
        cell.textContent = value > 0 ? value : '';
        cell.style.cssText = `
          padding: 2px;
          text-align: center;
          background-color: rgba(${r}, ${g}, ${b}, ${0.1 + intensity * 0.9});
          color: ${intensity > 0.5 ? 'white' : 'black'};
          border: 1px solid #eee;
        `;
        row.appendChild(cell);
      }
      
      table.appendChild(row);
    }
    
    // Add legend
    const legend = document.createElement('div');
    legend.style.cssText = 'margin-top: 10px; text-align: center; font-size: 12px;';
    legend.innerHTML = `
      <div style="display: inline-block; margin-right: 20px;">
        <span style="display: inline-block; width: 15px; height: 15px; background-color: rgba(220, 220, 255, 0.5); margin-right: 5px;"></span>
        Few Incidents
      </div>
      <div style="display: inline-block;">
        <span style="display: inline-block; width: 15px; height: 15px; background-color: rgba(0, 0, 255, 0.8); margin-right: 5px;"></span>
        Many Incidents
      </div>
    `;
    
    // Add title and append elements
    const title = document.createElement('h4');
    title.textContent = 'Incidents by Day and Hour';
    title.style.cssText = 'margin-top: 0; text-align: center;';
    
    container.appendChild(title);
    container.appendChild(table);
    container.appendChild(legend);
    
    console.log(`Time heatmap created with ${validDates} valid dates`);
  }
  
  // Create incident data table with improved field mapping and display
  function createDataTable(data) {
    console.log("Creating data table with", data ? data.length : 0, "records");
    
    const container = document.getElementById('data-table');
    if (!container) {
      console.error("Data table container not found");
      return;
    }
    
    // Force container to be visible with better responsive styling
    container.style.display = 'block';
    container.style.maxHeight = '500px'; // Increased height
    container.style.overflowY = 'auto';
    container.style.marginTop = '15px';
    container.style.marginBottom = '25px';
    
    // Clear existing content
    container.innerHTML = '';
    
    if (!data || !data.length) {
      container.innerHTML = '<div class="no-data-message" style="text-align: center; padding: 20px;">No data available</div>';
      return;
    }
    
    // Define field mappings with better labeling and priority
    const fieldMappings = [
      { 
        label: 'Incident #', 
        keys: ['Incident ID', 'incident_id', 'Run No', 'run_no', 'CallNo', 'call_no', 'id'],
        formatter: (value) => value // No special formatting
      },
      { 
        label: 'Date', 
        keys: ['Incident Date', 'incident_date', 'Reported Date', 'Date', 'date', 'ReportedDate'],
        formatter: (value) => {
          try {
            // Format as MM/DD/YYYY
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString();
            }
          } catch (e) {}
          return value;
        }
      },
      { 
        label: 'Time', 
        keys: ['Incident Time', 'incident_time', 'Reported Time', 'Reported', 'Time', 'time', 'reported_time'],
        formatter: (value) => {
          try {
            // If it's a date object or date string with time
            if (value.includes(' ')) {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString();
              }
            }
            // If it's just a time string (HH:MM:SS), return as is
            return value;
          } catch (e) {}
          return value;
        }
      },
      { 
        label: 'Unit', 
        keys: ['Unit', 'UnitID', 'unit', 'unit_id', 'Unit ID', 'UnitName', 'unit_name'],
        formatter: (value) => value
      },
      { 
        label: 'Incident Type', 
        keys: ['Type', 'Incident Type', 'Call Type', 'incident_type', 'call_type', 'nature'],
        formatter: (value) => value
      },
      { 
        label: 'Response Time (min)', 
        keys: ['Response Time', 'response_time', 'ResponseTime', 'response'],
        formatter: (value) => {
          // Try to ensure it's a number with 1 decimal place
          const num = parseFloat(value);
          if (!isNaN(num)) {
            return num.toFixed(1);
          }
          return value;
        }
      },
      { 
        label: 'Address', 
        keys: ['Address', 'Location', 'Incident Location', 'address', 'location', 'incident_location', 'full_address'],
        formatter: (value) => value
      },
      { 
        label: 'City', 
        keys: ['City', 'Incident City', 'city', 'incident_city'],
        formatter: (value) => value
      },
      { 
        label: 'Dispatched', 
        keys: ['Dispatched', 'Unit Dispatched', 'Dispatch Time', 'dispatch_time', 'dispatched'],
        formatter: (value) => {
          try {
            // If it's a full date/time
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return date.toLocaleTimeString();
            }
          } catch (e) {}
          return value;
        }
      },
      { 
        label: 'Arrived', 
        keys: ['Onscene', 'Unit Onscene', 'Arrival Time', 'arrive_time', 'arrival', 'arrived'],
        formatter: (value) => {
          try {
            // If it's a full date/time
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return date.toLocaleTimeString();
            }
          } catch (e) {}
          return value;
        }
      },
      { 
        label: 'Coordinates', 
        keys: ['Latitude', 'Longitude', 'latitude', 'longitude', 'lat', 'lon', 'lng'],
        formatter: (value, key, item) => {
          // Special case - combine lat/lng if we have both
          if (key.toLowerCase().includes('lat')) {
            const lat = parseFloat(value);
            let lng = null;
            
            // Try to find the matching longitude
            for (const k of ['Longitude', 'longitude', 'lon', 'lng']) {
              if (item[k]) {
                lng = parseFloat(item[k]);
                break;
              }
            }
            
            if (!isNaN(lat) && !isNaN(lng)) {
              return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            }
          }
          return value;
        },
        specialCase: true // Flag this as requiring special handling
      }
    ];
    
    // Table header classes for styling
    const tableStyles = 'width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 10px;';
    const headerStyles = 'padding: 10px; text-align: left; border-bottom: 2px solid #ddd; position: sticky; top: 0; background-color: #f0f0f0; font-weight: bold; color: #333;';
    const cellStyles = 'padding: 8px; text-align: left; border-bottom: 1px solid #ddd;';
    const oddRowStyles = 'background-color: #f9f9f9;';
    
    // Create table and header row
    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.cssText = tableStyles;
    
    // Add the header row
    const headerRow = document.createElement('tr');
    
    // Collect mapped fields and actual columns to display
    const displayColumns = [];
    const foundFieldMappings = [];
    
    // Determine which fields we have in the data and map to our preferred labels
    fieldMappings.forEach(mapping => {
      // Skip coordinates if we're going to combine them
      if (mapping.specialCase && mapping.label === 'Coordinates') {
        // Check if we have both lat and lng
        let hasLat = false;
        let hasLng = false;
        
        for (const key of mapping.keys) {
          if (key.toLowerCase().includes('lat')) {
            hasLat = hasLat || data.some(item => item[key] !== undefined);
          } else if (key.toLowerCase().includes('lon') || key.toLowerCase().includes('lng')) {
            hasLng = hasLng || data.some(item => item[key] !== undefined);
          }
        }
        
        if (hasLat && hasLng) {
          displayColumns.push(mapping.label);
          foundFieldMappings.push(mapping);
        }
      } else {
        // Normal field mapping
        for (const key of mapping.keys) {
          if (data.some(item => item[key] !== undefined)) {
            displayColumns.push(mapping.label);
            // Store the mapping and the actual key found
            const mappingWithKey = {...mapping, matchedKey: key};
            foundFieldMappings.push(mappingWithKey);
            break; // Found a match, don't need to check other keys for this mapping
          }
        }
      }
    });
    
    // Add any other important fields we didn't already map (up to 5 extra)
    const additionalFields = new Set();
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        // Skip fields already covered by our mappings
        if (!fieldMappings.some(mapping => mapping.keys.includes(key))) {
          additionalFields.add(key);
        }
      });
    });
    
    // Add up to 5 other fields (prioritizing non-metadata fields)
    const extraFields = [...additionalFields]
      .filter(field => !field.startsWith('_')) // Skip metadata fields
      .sort() // Sort alphabetically 
      .slice(0, 5);
    
    // Add extra fields to our display columns
    extraFields.forEach(field => {
      displayColumns.push(field);
      foundFieldMappings.push({
        label: field,
        keys: [field],
        formatter: (value) => value,
        matchedKey: field
      });
    });
    
    // Create header cells
    displayColumns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column;
      th.style.cssText = headerStyles;
      headerRow.appendChild(th);
    });
    
    table.appendChild(headerRow);
    
    // Add data rows (paginate properly)
    const rowsPerPage = 100;
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const currentPage = 1;
    
    // Show the current page of data
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, data.length);
    const displayData = data.slice(startIdx, endIdx);
    
    // Create and add data rows
    displayData.forEach((item, index) => {
      const row = document.createElement('tr');
      row.style.cssText = index % 2 === 0 ? oddRowStyles : '';
      
      // Add cells for each column
      foundFieldMappings.forEach(mapping => {
        const cell = document.createElement('td');
        cell.style.cssText = cellStyles;
        
        // Handle special case for coordinates
        if (mapping.specialCase && mapping.label === 'Coordinates') {
          // Find lat/lng values
          let lat = null, lng = null;
          
          for (const key of mapping.keys) {
            if (key.toLowerCase().includes('lat') && item[key] !== undefined) {
              lat = parseFloat(item[key]);
            } else if ((key.toLowerCase().includes('lon') || key.toLowerCase().includes('lng')) && item[key] !== undefined) {
              lng = parseFloat(item[key]);
            }
          }
          
          if (!isNaN(lat) && !isNaN(lng)) {
            cell.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          } else {
            cell.textContent = '';
          }
        } else if (mapping.matchedKey) {
          // Normal field display with formatting
          const value = item[mapping.matchedKey];
          cell.textContent = value ? mapping.formatter(value, mapping.matchedKey, item) : '';
        } else {
          cell.textContent = '';
        }
        
        row.appendChild(cell);
      });
      
      table.appendChild(row);
    });
    
    // Add pagination and record count
    const paginationContainer = document.createElement('div');
    paginationContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 12px;';
    
    // Record count on the left
    const countInfo = document.createElement('div');
    countInfo.style.cssText = 'color: #666;';
    const recordCount = data.length;
    if (recordCount > rowsPerPage) {
      countInfo.textContent = `Showing ${startIdx + 1}-${endIdx} of ${recordCount} records`;
    } else {
      countInfo.textContent = `${recordCount} records total`;
    }
    
    // Add export button
    const exportButton = document.createElement('button');
    exportButton.textContent = '📥 Export Data';
    exportButton.style.cssText = 'background-color: #4CAF50; color: white; border: none; padding: 5px 10px; text-align: center; text-decoration: none; display: inline-block; font-size: 12px; margin: 0 10px; cursor: pointer; border-radius: 3px;';
    exportButton.onclick = function() {
      // Create CSV content
      let csv = displayColumns.join(',') + '\n';
      
      // Add all data rows
      data.forEach(item => {
        const row = foundFieldMappings.map(mapping => {
          if (mapping.specialCase && mapping.label === 'Coordinates') {
            // Handle coordinates special case
            let lat = null, lng = null;
            for (const key of mapping.keys) {
              if (key.toLowerCase().includes('lat') && item[key] !== undefined) {
                lat = parseFloat(item[key]);
              } else if ((key.toLowerCase().includes('lon') || key.toLowerCase().includes('lng')) && item[key] !== undefined) {
                lng = parseFloat(item[key]);
              }
            }
            return (!isNaN(lat) && !isNaN(lng)) ? `"${lat.toFixed(6)}, ${lng.toFixed(6)}"` : '""';
          } else if (mapping.matchedKey) {
            const value = item[mapping.matchedKey];
            // Wrap in quotes and escape any quotes in the value
            return value ? `"${value.toString().replace(/"/g, '""')}"` : '""';
          } else {
            return '""';
          }
        }).join(',');
        csv += row + '\n';
      });
      
      // Create and trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'incident_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    // Add filter input
    const filterContainer = document.createElement('div');
    filterContainer.style.cssText = 'margin-bottom: 10px; display: flex; align-items: center;';
    
    const filterLabel = document.createElement('label');
    filterLabel.textContent = 'Filter: ';
    filterLabel.style.cssText = 'margin-right: 8px; font-size: 12px;';
    
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Type to filter rows...';
    filterInput.style.cssText = 'padding: 5px; border: 1px solid #ddd; border-radius: 3px; width: 200px; font-size: 12px;';
    
    // Add filter functionality
    filterInput.addEventListener('input', function() {
      const filterText = this.value.toLowerCase();
      const rows = table.querySelectorAll('tr');
      
      // Skip header row (index 0)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');
        let showRow = false;
        
        cells.forEach(cell => {
          if (cell.textContent.toLowerCase().includes(filterText)) {
            showRow = true;
          }
        });
        
        row.style.display = showRow ? '' : 'none';
      }
      
      // Update count information based on visible rows
      const visibleRowCount = Array.from(rows).slice(1).filter(row => row.style.display !== 'none').length;
      countInfo.textContent = `Showing ${visibleRowCount} of ${recordCount} records ${filterText ? '(filtered)' : ''}`;
    });
    
    filterContainer.appendChild(filterLabel);
    filterContainer.appendChild(filterInput);
    
    // Add export button alongside count info
    paginationContainer.appendChild(countInfo);
    paginationContainer.appendChild(exportButton);
    
    // Append everything to container
    container.appendChild(filterContainer);
    container.appendChild(table);
    container.appendChild(paginationContainer);
    
    console.log(`Data table created with ${Math.min(rowsPerPage, recordCount)} of ${recordCount} records using ${displayColumns.length} columns`);
  }
  
  // Create file stats
  function updateFileStats(data) {
    console.log("Updating file stats with", data ? data.length : 0, "records");
    
    const container = document.getElementById('file-stats');
    if (!container) {
      console.error("File stats container not found");
      return;
    }
    
    // Force container to be visible
    container.style.display = 'block';
    
    if (!data || !data.length) {
      container.innerHTML = '<div class="stats-message">No data available</div>';
      return;
    }
    
    // Get date range
    let minDate = null;
    let maxDate = null;
    let validDates = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    
    data.forEach(item => {
      // Try to get date from various possible fields
      const dateStr = item.Reported || item['Reported Date'] || item['Incident Date'] || item.Date;
      if (dateStr) {
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            if (!minDate || date < minDate) minDate = date;
            if (!maxDate || date > maxDate) maxDate = date;
            validDates++;
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
      
      // Calculate response time stats if available
      if (item['Response Time'] && !isNaN(parseFloat(item['Response Time']))) {
        totalResponseTime += parseFloat(item['Response Time']);
        responseTimeCount++;
      }
    });
    
    // Format the stats HTML
    let statsHTML = `
      <div class="stats-container" style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px;">
        <div class="stat-card" style="background-color: #f0f7ff; padding: 10px; border-radius: 5px; min-width: 150px;">
          <div class="stat-value" style="font-size: 18px; font-weight: bold;">${data.length}</div>
          <div class="stat-label" style="font-size: 12px; color: #666;">Total Incidents</div>
        </div>
    `;
    
    // Add date range if available
    if (validDates > 0 && minDate && maxDate) {
      const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      statsHTML += `
        <div class="stat-card" style="background-color: #f0fff7; padding: 10px; border-radius: 5px; min-width: 150px;">
          <div class="stat-value" style="font-size: 18px; font-weight: bold;">${minDate.toLocaleDateString(undefined, dateOptions)} - ${maxDate.toLocaleDateString(undefined, dateOptions)}</div>
          <div class="stat-label" style="font-size: 12px; color: #666;">Date Range</div>
        </div>
      `;
    }
    
    // Add average response time if available
    if (responseTimeCount > 0) {
      const avgResponseTime = (totalResponseTime / responseTimeCount).toFixed(1);
      statsHTML += `
        <div class="stat-card" style="background-color: #fff7f0; padding: 10px; border-radius: 5px; min-width: 150px;">
          <div class="stat-value" style="font-size: 18px; font-weight: bold;">${avgResponseTime} min</div>
          <div class="stat-label" style="font-size: 12px; color: #666;">Avg Response Time</div>
        </div>
      `;
    }
    
    // Add data source info
    statsHTML += `
      <div class="stat-card" style="background-color: #f7f0ff; padding: 10px; border-radius: 5px; min-width: 150px;">
        <div class="stat-value" style="font-size: 18px; font-weight: bold;">Data Formatter</div>
        <div class="stat-label" style="font-size: 12px; color: #666;">Data Source</div>
      </div>
    `;
    
    statsHTML += `</div>`;
    
    container.innerHTML = statsHTML;
    
    console.log("File stats updated successfully");
  }
  
  // Main function to fetch data and render everything
  function renderDashboard() {
    console.log("🚀 Starting emergency fix dashboard render");
    
    // Prevent multiple initializations
    if (window.dashboardAlreadyRendered) {
      console.log("Dashboard already rendered, skipping duplicate initialization");
      return;
    }
    window.dashboardAlreadyRendered = true;
    
    // Force dashboard to be visible
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      dashboard.style.display = 'block';
    }
    
    // First check if we have formattedData in window from the main script
    const data = window.formattedData || [];
    console.log(`Using ${data.length} records from window.formattedData`);
    
    // Load required libraries
    Promise.all([loadChartJS(), loadLeaflet()])
      .then(([Chart, L]) => {
        console.log("Libraries loaded, rendering dashboard...");
        
        // Update file stats
        updateFileStats(data);
        
        // Create all visualizations
        initMap(L, data);
        createTimeHeatmap(data);
        createUnitChart(Chart, data);
        createLocationChart(Chart, data);
        createDataTable(data);
        
        console.log("Emergency fix dashboard rendering complete");
        
        // Add a success indicator
        const indicator = document.createElement('div');
        indicator.style.cssText = "position: fixed; bottom: 10px; right: 10px; background: rgba(40, 167, 69, 0.9); color: white; padding: 10px; font-size: 14px; z-index: 9999; border-radius: 4px;";
        indicator.innerHTML = `
          <strong>Emergency Fix v1.0</strong><br>
          Dashboard rendered successfully
        `;
        document.body.appendChild(indicator);
        setTimeout(() => indicator.style.opacity = "0.5", 5000);
        setTimeout(() => indicator.remove(), 7000);
      })
      .catch(error => {
        console.error("Failed to render dashboard:", error);
        
        // Add an error indicator
        const errorIndicator = document.createElement('div');
        errorIndicator.style.cssText = "position: fixed; bottom: 10px; right: 10px; background: rgba(220, 53, 69, 0.9); color: white; padding: 10px; font-size: 14px; z-index: 9999; border-radius: 4px;";
        errorIndicator.innerHTML = `
          <strong>Emergency Fix Error</strong><br>
          ${error.message || 'Failed to render dashboard'}
        `;
        document.body.appendChild(errorIndicator);
      });
  }
  
  // Data retrieval helper
  function getFormatterData() {
    console.log("Attempting to retrieve formatter data");
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const fromFormatter = urlParams.has('from_formatter');
    const formatterDataKey = urlParams.get('formatter_data');
    const storageMethod = urlParams.get('storage_method') || 'localStorage';
    
    console.log("URL params:", { fromFormatter, formatterDataKey, storageMethod });
    
    if (fromFormatter && formatterDataKey) {
      try {
        // Try to retrieve data from storage
        const rawData = window[storageMethod].getItem(formatterDataKey);
        if (rawData) {
          const parsedData = JSON.parse(rawData);
          
          if (parsedData && typeof parsedData === 'object') {
            // Handle both array and {data: [...]} formats
            const dataArray = Array.isArray(parsedData) ? parsedData : 
                              (parsedData.data && Array.isArray(parsedData.data) ? parsedData.data : []);
            
            console.log(`Retrieved ${dataArray.length} records from ${storageMethod}:${formatterDataKey}`);
            
            // Store in window for both direct and framework access
            window.formattedData = dataArray;
            
            return dataArray;
          }
        }
      } catch (error) {
        console.error("Error retrieving formatter data:", error);
      }
    }
    
    // If we already have data in window.formattedData, use that
    if (window.formattedData && Array.isArray(window.formattedData)) {
      console.log(`Using ${window.formattedData.length} records from existing window.formattedData`);
      return window.formattedData;
    }
    
    // Create empty array if nothing found
    console.log("No formatter data found, using empty array");
    window.formattedData = [];
    return [];
  }
  
  // Initialize everything when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM ready, initializing emergency fix...");
    
    // If we're continuing after a redirect (data already in URL)
    // wait a bit longer to let the other scripts load
    const urlParams = new URLSearchParams(window.location.search);
    const fromFormatter = urlParams.has('from_formatter');
    const formatterDataKey = urlParams.get('formatter_data');
    
    // If we're coming with data, show the fix is running
    if (fromFormatter && formatterDataKey) {
      const fixNotification = document.createElement('div');
      fixNotification.style.cssText = "position: fixed; bottom: 60px; right: 10px; background: rgba(25, 118, 210, 0.9); color: white; padding: 10px; font-size: 14px; z-index: 9999; border-radius: 4px;";
      fixNotification.innerHTML = `
        <strong>Emergency Fix Running</strong><br>
        Rendering data from formatter
      `;
      document.body.appendChild(fixNotification);
      setTimeout(() => fixNotification.style.opacity = "0.5", 5000);
      setTimeout(() => fixNotification.remove(), 7000);
    }
    
    // Get data first
    getFormatterData();
    
    // Render with a longer delay if we're coming from a redirect
    const renderDelay = fromFormatter ? 1500 : 500;
    console.log(`Will render dashboard after ${renderDelay}ms delay`);
    setTimeout(renderDashboard, renderDelay);
    
    // Add event listener for help modal
    const closeHelpButton = document.getElementById('close-help-modal');
    if (closeHelpButton) {
      closeHelpButton.addEventListener('click', function() {
        document.getElementById('data-transfer-help').style.display = 'none';
      });
    }
    
    const checkStorageButton = document.getElementById('check-storage-btn');
    if (checkStorageButton) {
      checkStorageButton.addEventListener('click', function() {
        // Create a storage status report
        const urlParams = new URLSearchParams(window.location.search);
        const formatterDataKey = urlParams.get('formatter_data');
        
        let report = "Storage Status Check:\n\n";
        
        // Check localStorage
        try {
          const testKey = 'emergency_fix_test_' + Date.now();
          localStorage.setItem(testKey, 'test');
          const testValue = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          
          report += `✅ localStorage: Working (${testValue === 'test' ? 'Verified' : 'Inconsistent'})\n`;
          
          if (formatterDataKey) {
            const hasData = localStorage.getItem(formatterDataKey) !== null;
            report += `${hasData ? '✅' : '❌'} Formatter data key "${formatterDataKey}": ${hasData ? 'Found' : 'Not found'} in localStorage\n`;
            
            if (hasData) {
              const rawData = localStorage.getItem(formatterDataKey);
              try {
                const parsedData = JSON.parse(rawData);
                const size = Math.round(rawData.length / 1024);
                const isArray = Array.isArray(parsedData);
                const hasDataProp = !isArray && parsedData && parsedData.data && Array.isArray(parsedData.data);
                const count = isArray ? parsedData.length : (hasDataProp ? parsedData.data.length : 0);
                
                report += `✅ Data structure: ${isArray ? 'Array' : (hasDataProp ? 'Object with data array' : 'Unknown')}\n`;
                report += `✅ Record count: ${count}\n`;
                report += `✅ Data size: ${size}KB\n`;
              } catch (e) {
                report += `❌ JSON Parse error: ${e.message}\n`;
              }
            }
          }
          
        } catch (e) {
          report += `❌ localStorage error: ${e.message}\n`;
        }
        
        // Check window.formattedData
        if (window.formattedData) {
          report += `✅ window.formattedData: ${Array.isArray(window.formattedData) ? `Array with ${window.formattedData.length} records` : 'Not an array'}\n`;
        } else {
          report += `❌ window.formattedData: Not found\n`;
        }
        
        alert(report);
      });
    }
  });
  
  // If window.formattedData changes, update the dashboard
  let lastDataCount = 0;
  
  setInterval(function() {
    if (window.formattedData && Array.isArray(window.formattedData) && window.formattedData.length !== lastDataCount) {
      console.log(`Data count changed: ${lastDataCount} -> ${window.formattedData.length}, updating dashboard`);
      lastDataCount = window.formattedData.length;
      renderDashboard();
    }
  }, 2000);
  
})();