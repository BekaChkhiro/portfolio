import { WebSocketServer } from 'ws';
import http from 'http';
import fs from 'fs';
import path from 'path';
import robot from 'robotjs';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 8080;

// Get network IP address
function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const networkIP = getNetworkIP();

// Create HTTP server to serve the phone control page
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  if (req.url === '/' || req.url === '/phone-control.html') {
    try {
      const htmlPath = path.join(__dirname, '..', 'public', 'phone-control.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(html);
    } catch (error) {
      console.error('Error serving HTML:', error);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Phone control page not found');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

// Create WebSocket server on the same HTTP server
const wss = new WebSocketServer({ server });

let connectedClients = 0;

wss.on('connection', (ws, req) => {
  connectedClients++;
  console.log(`📱 Phone connected (${connectedClients} total clients)`);
  console.log(`Client IP: ${req.socket.remoteAddress}`);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received: ${data.type}`);
      
      switch (data.type) {
        case 'move':
          const screenSize = robot.getScreenSize();
          const x = Math.round(data.x * screenSize.width);
          const y = Math.round(data.y * screenSize.height);
          robot.moveMouse(x, y);
          break;
          
        case 'click':
          robot.mouseClick();
          console.log('🖱️ Left click');
          break;
          
        case 'rightClick':
          robot.mouseClick('right');
          console.log('🖱️ Right click');
          break;
          
        case 'scroll':
          robot.scrollMouse(data.deltaX || 0, data.deltaY || 0);
          console.log(`🖱️ Scroll: ${data.deltaX}, ${data.deltaY}`);
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    connectedClients--;
    console.log(`📱 Phone disconnected (${connectedClients} remaining clients)`);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Remote Control Server running on:`);
  console.log(`   🖥️  Local: http://localhost:${port}`);
  console.log(`   📱 Network: http://${networkIP}:${port}`);
  console.log('');
  console.log('📱 Scan QR code or open network URL on your phone');
  console.log('🖥️  Make sure both devices are on the same WiFi network');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  wss.clients.forEach((client) => {
    client.close();
  });
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Log server info
console.log('📋 Remote Control Server Configuration:');
console.log(`   Port: ${port}`);
console.log(`   Network IP: ${networkIP}`);
console.log(`   Screen Size: ${robot.getScreenSize().width}x${robot.getScreenSize().height}`);

// Set mouse speed for smoother movement
robot.setMouseDelay(2);