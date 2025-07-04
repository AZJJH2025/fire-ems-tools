import http from 'http';
import fs from 'fs';
import path from 'path';
import { networkInterfaces } from 'os';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  if (req.url === '/' || req.url === '/index.html') {
    // Serve a more useful test page
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fire-EMS Data Formatter Test</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #d32f2f; }
        h2 { color: #1976d2; margin-top: 30px; }
        .card { border: 1px solid #e0e0e0; border-radius: 4px; padding: 16px; margin-bottom: 20px; }
        button { background-color: #1976d2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #1565c0; }
        .file-display { border: 1px solid #e0e0e0; border-radius: 4px; padding: 16px; margin-top: 10px; background-color: #f5f5f5; }
        .status { padding: 8px; border-radius: 4px; margin-top: 10px; display: inline-block; }
        .success { background-color: #e8f5e9; color: #2e7d32; }
        .error { background-color: #ffebee; color: #c62828; }
      </style>
    </head>
    <body>
      <h1>Fire-EMS Data Formatter Test</h1>
      <p>This is a simple test page for the Fire-EMS Data Formatter tool. The Vite development server is not working, but this simple server is running correctly.</p>
      
      <div class="card">
        <h2>1. File Upload Test</h2>
        <p>Upload a CSV, Excel, or PDF file to test the file parsing functionality:</p>
        <input type="file" id="file-input" accept=".csv,.xlsx,.xls,.xlsm,.pdf,.txt">
        <button id="upload-btn">Upload</button>
        <div id="file-content" class="file-display"></div>
      </div>
      
      <div class="card">
        <h2>2. Field Mapping Test</h2>
        <p>Test the field mapping functionality with HTML5 drag and drop:</p>
        <div style="display: flex; gap: 20px;">
          <div style="flex: 1;">
            <h3>Source Fields</h3>
            <div id="source-fields" style="border: 1px solid #e0e0e0; min-height: 200px; padding: 10px;">
              <div class="field" draggable="true" data-field="incident_id">incident_id</div>
              <div class="field" draggable="true" data-field="incident_date">incident_date</div>
              <div class="field" draggable="true" data-field="incident_time">incident_time</div>
              <div class="field" draggable="true" data-field="incident_type">incident_type</div>
              <div class="field" draggable="true" data-field="latitude">latitude</div>
              <div class="field" draggable="true" data-field="longitude">longitude</div>
            </div>
          </div>
          <div style="flex: 1;">
            <h3>Target Fields</h3>
            <div id="target-fields" style="border: 1px solid #e0e0e0; min-height: 200px; padding: 10px;">
              <div class="target-field" data-field="id">id</div>
              <div class="target-field" data-field="date">date</div>
              <div class="target-field" data-field="time">time</div>
              <div class="target-field" data-field="type">type</div>
              <div class="target-field" data-field="lat">lat</div>
              <div class="target-field" data-field="lng">lng</div>
            </div>
          </div>
        </div>
        <div id="mapping-status"></div>
      </div>
      
      <div class="card">
        <h2>Server Status</h2>
        <p><strong>Simple Server:</strong> <span class="status success">ONLINE (Port 7777)</span></p>
        <p><strong>Vite Development Server:</strong> <span class="status error">OFFLINE (Port 5173)</span></p>
      </div>
      
      <script>
        // File upload functionality
        document.getElementById('upload-btn').addEventListener('click', function() {
          const fileInput = document.getElementById('file-input');
          const file = fileInput.files[0];
          
          if (!file) {
            alert('Please select a file');
            return;
          }
          
          const reader = new FileReader();
          
          reader.onload = function(e) {
            const content = e.target.result;
            const contentDisplay = document.getElementById('file-content');
            
            contentDisplay.innerHTML = '<h4>File Preview:</h4>';
            
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
              // Simple CSV parsing
              const lines = content.split('\\n');
              const headers = lines[0].split(',');
              
              let html = '<table border="1" cellpadding="5" style="border-collapse: collapse;">';
              html += '<tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr>';
              
              for (let i = 1; i < Math.min(6, lines.length); i++) {
                const cells = lines[i].split(',');
                html += '<tr>' + cells.map(c => '<td>' + c + '</td>').join('') + '</tr>';
              }
              
              html += '</table>';
              contentDisplay.innerHTML += html;
            } else {
              // Simple preview for other file types
              contentDisplay.innerHTML += '<pre>' + content.substring(0, 500) + '...</pre>';
            }
          };
          
          if (file.type === 'text/csv' || file.name.endsWith('.csv') || file.type === 'text/plain') {
            reader.readAsText(file);
          } else {
            reader.readAsText(file);
          }
        });
        
        // Drag and drop functionality
        document.querySelectorAll('.field').forEach(field => {
          field.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.dataset.field);
          });
        });
        
        document.querySelectorAll('.target-field').forEach(field => {
          field.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.backgroundColor = '#e3f2fd';
          });
          
          field.addEventListener('dragleave', function() {
            this.style.backgroundColor = '';
          });
          
          field.addEventListener('drop', function(e) {
            e.preventDefault();
            const sourceField = e.dataTransfer.getData('text/plain');
            const targetField = this.dataset.field;
            
            this.innerHTML = targetField + ' ← <strong>' + sourceField + '</strong>';
            this.style.backgroundColor = '#e8f5e9';
            
            document.getElementById('mapping-status').innerHTML = 
              '<div class="status success">Mapped ' + sourceField + ' to ' + targetField + '</div>';
          });
        });
      </script>
    </body>
    </html>
    `;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Try a different port
const PORT = 7777;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Also try: http://127.0.0.1:${PORT}/`);
  console.log(`And your network IP addresses:`);
  
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over internal and non-IPv4 addresses
      if (!net.internal && net.family === 'IPv4') {
        console.log(`http://${net.address}:${PORT}/`);
      }
    }
  }
});