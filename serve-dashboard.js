#!/usr/bin/env node

/**
 * Simple HTTP server to serve the query test dashboard
 * This resolves CORS issues when loading JSON files
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3002;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.css': 'text/css',
  '.js': 'application/javascript'
};

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  
  // Default to dashboard
  if (filePath === './') {
    filePath = './query-test-dashboard.html';
  }
  
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🌐 Query Test Dashboard Server running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log('');
  console.log('📊 Available endpoints:');
  console.log(`   http://localhost:${PORT}/query-test-dashboard.html - Interactive dashboard`);
  console.log(`   http://localhost:${PORT}/query-test-dashboard-embedded.html - Static summary`);
  console.log('');
  console.log('🔍 Available test results:');
  
  // List available test result files
  const files = fs.readdirSync('.').filter(f => f.startsWith('query-system-test-results-'));
  files.forEach(file => {
    console.log(`   http://localhost:${PORT}/${file}`);
  });
  
  console.log('');
  console.log('⏹️  Press Ctrl+C to stop the server');
  
  // Automatically open the dashboard
  const url = `http://localhost:${PORT}/query-test-dashboard.html`;
  
  // Detect OS and open browser
  const command = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'start' : 'xdg-open';
  
  exec(`${command} "${url}"`, (error) => {
    if (error) {
      console.log(`\n🔗 Manually open: ${url}`);
    } else {
      console.log(`\n🚀 Dashboard opened in your default browser`);
    }
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down dashboard server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});