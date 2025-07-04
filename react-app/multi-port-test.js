import http from 'http';

// Create a super simple server that just responds with text
const createServer = (port) => {
  const server = http.createServer((req, res) => {
    console.log(`[Port ${port}] Request received: ${req.method} ${req.url}`);
    
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Hello from server on port ${port}!\nRequest path: ${req.url}\nTimestamp: ${new Date().toISOString()}`);
  });
  
  server.on('error', (err) => {
    console.error(`[Port ${port}] Server error:`, err.message);
  });
  
  return server;
};

// Try multiple ports
const ports = [3000, 5173, 7777, 8000, 8080, 9000];

// Start servers on all ports
ports.forEach(port => {
  const server = createServer(port);
  
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${port}/`);
  });
});