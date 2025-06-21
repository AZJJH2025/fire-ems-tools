import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  const url = req.url === '/' ? '/basic-test.html' : req.url;
  const filePath = path.join(__dirname, url);
  
  // Attempt to read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err.message);
      
      // If the file doesn't exist, return 404
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`File not found: ${url}`);
        return;
      }
      
      // For other errors, return 500
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Server error: ${err.message}`);
      return;
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'text/plain';
    
    switch (ext) {
      case '.html':
        contentType = 'text/html';
        break;
      case '.js':
        contentType = 'application/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
    }
    
    // Set response headers and send content
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    console.log(`Served ${url} with content type ${contentType}`);
  });
});

// Use port 7777 since it's known to work
const PORT = 7777;

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
  console.log(`Try also http://127.0.0.1:${PORT}/`);
  
  // Print all IP addresses the server is available on
  const nets = networkInterfaces();
  console.log('Available on network at:');
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (!net.internal && net.family === 'IPv4') {
        console.log(`  http://${net.address}:${PORT}/`);
      }
    }
  }
  
  console.log('\nAvailable resources:');
  console.log(`  http://localhost:${PORT}/basic-test.html (minimal test)`);
  console.log(`  http://localhost:${PORT}/index.html (React app, may not work)`);
});