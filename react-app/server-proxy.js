import http from 'http';
import httpProxy from 'http-proxy';
import { spawn } from 'child_process';
import { networkInterfaces } from 'os';

// Get createProxyServer function from httpProxy
const { createProxyServer } = httpProxy;

// Create a proxy server instance
const proxy = createProxyServer({});

// Create the proxy server
const server = http.createServer((req, res) => {
  // Proxy to Vite server
  proxy.web(req, res, { 
    target: 'http://localhost:5173',
    ws: true,
    changeOrigin: true
  }, (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + err.message);
  });
});

// Start Vite in development mode
const viteProcess = spawn('npx', ['vite', '--strictPort'], {
  shell: true,
  stdio: 'inherit'
});

// Handle errors
viteProcess.on('error', (err) => {
  console.error('Failed to start Vite:', err);
});

// Listen on port 3000
const port = 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Proxy server running at http://localhost:${port}/`);
  console.log(`Forwarding to Vite at http://localhost:5173/`);
  
  // Log all available network addresses
  const nets = networkInterfaces();
  console.log('Available on network at:');
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (!net.internal && net.family === 'IPv4') {
        console.log(`  http://${net.address}:${port}/`);
      }
    }
  }
});