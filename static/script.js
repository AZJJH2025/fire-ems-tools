<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>🚒🔥 Fire/EMS Data Analytics Dashboard 🚑🔥</title>
   <link rel="stylesheet" href="/static/styles.css">
   <!-- Leaflet CSS for maps -->
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
     crossorigin=""/>
   <!-- FIXED: Chart.js reference with specific version -->
   <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
</head>
<body>
   <header>
      <h1>🚒 Fire & EMS Data Analytics Dashboard 🚑</h1>
      <p>Upload your Fire/EMS data files for interactive visualization and analysis</p>
   </header>
   
   <!-- File Upload Section -->
   <div class="file-upload-container">
      <h2>Upload Data File</h2>
      <div class="file-input-wrapper">
         <input type="file" id="fileInput">
         <button onclick="uploadFile()">Upload & Analyze</button>
      </div>
      <p>Accepted formats: CSV, Excel (.xls, .xlsx)</p>
   </div>
   
   <div id="loading">⏳ Uploading and analyzing file... Please wait.</div>
   
   <div id="result">
      <!-- Results will be displayed here by the JavaScript -->
      <p>Upload a file to view analytics and visualizations.</p>
   </div>
   
   <!-- Dashboard Section - Initially Hidden -->
   <div id="dashboard" style="display: none;">
      <div class="dashboard-header">
         <h2>📊 Data Analysis Dashboard</h2>
         <div id="file-stats"></div>
      </div>
      
      <!-- First Row: Map and Time Heatmap -->
      <div class="dashboard-row">
         <!-- Map visualization -->
         <div class="dashboard-card">
            <h3>📍 Incident Map</h3>
            <div id="incident-map"></div>
         </div>
         
         <!-- Time patterns heatmap -->
         <div class="dashboard-card">
            <h3>⏰ Incidents by Time (Day/Hour)</h3>
            <div id="time-chart"></div>
         </div>
      </div>
      
      <!-- Second Row: Unit Activity and Location Charts -->
      <div class="dashboard-row">
         <!-- Unit activity chart -->
         <div class="dashboard-card">
            <h3>🚒 Unit Activity</h3>
            <div class="chart-container">
               <canvas id="unit-chart"></canvas>
            </div>
         </div>
         
         <!-- Location/city chart -->
         <div class="dashboard-card">
            <h3>🏙️ Incidents by Location</h3>
            <div class="chart-container">
               <canvas id="location-chart"></canvas>
            </div>
         </div>
      </div>
      
      <!-- Data table section -->
      <div class="dashboard-row">
         <div class="dashboard-card full-width">
            <h3>📋 Incident Data Table</h3>
            <div id="data-table"></div>
         </div>
      </div>
   </div>
   
   <!-- FIXED: Leaflet JS for maps -->
   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
     integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
     crossorigin=""></script>
   
   <!-- Load script.js AFTER Leaflet and Chart.js -->
   <script src="/static/script.js"></script>
</body>
</html>
