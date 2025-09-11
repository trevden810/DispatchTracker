#!/usr/bin/env node

/**
 * DispatchTracker Debug Session Starter
 * Comprehensive debugging for Truck 77 (Mykiel James) focus
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚛 DispatchTracker Debug Session Starting...');
console.log('🎯 Focus: Truck 77 - Mykiel James');
console.log('📋 Target: Complete GPS + Job + Route data display');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Start Next.js development server
console.log('\n🚀 Starting Next.js development server...');
const server = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

// Log server output
const logFile = path.join(logsDir, `debug-session-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`);
const logStream = fs.createWriteStream(logFile);

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  logStream.write(`[STDOUT] ${new Date().toISOString()}: ${output}`);
  
  // Check for server ready
  if (output.includes('Ready') || output.includes('started server on')) {
    console.log('\n✅ Server is ready! Starting API tests...');
    setTimeout(runAPITests, 3000);
  }
});

server.stderr.on('data', (data) => {
  const output = data.toString();
  console.error(output);
  logStream.write(`[STDERR] ${new Date().toISOString()}: ${output}`);
});

server.on('close', (code) => {
  console.log(`\n🛑 Server process exited with code ${code}`);
  logStream.end();
});

// API test function
async function runAPITests() {
  console.log('\n🔍 TESTING LOCAL APIs...');
  
  const tests = [
    { name: 'Vehicles API', url: 'http://localhost:3002/api/vehicles' },
    { name: 'Jobs API', url: 'http://localhost:3002/api/jobs' },
    { name: 'Tracking API', url: 'http://localhost:3002/api/tracking' }
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n📡 Testing ${test.name}...`);
      const response = await fetch(test.url);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Success: ${data.success}`);
        console.log(`   Data count: ${data.data ? data.data.length : 'No data'}`);
        
        // Special Truck 77 check for tracking API
        if (test.url.includes('tracking') && data.data) {
          const truck77 = data.data.find(v => v.vehicleName && v.vehicleName.includes('77'));
          console.log(`   🚛 Truck 77 found: ${!!truck77}`);
          if (truck77) {
            console.log(`   🗂️ Has GPS: ${!!truck77.vehicleLocation}`);
            console.log(`   🗂️ Has Job: ${!!truck77.assignedJob}`);
            console.log(`   🗂️ Has Route: ${!!truck77.routeInfo}`);
          }
        }
      } else {
        console.log(`   ❌ Error: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n📊 API Testing Complete');
  console.log('\n🌐 Dashboard available at: http://localhost:3002/cards');
  console.log('📋 Logs saved to:', logFile);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down debug session...');
  server.kill('SIGINT');
  logStream.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating debug session...');
  server.kill('SIGTERM');
  logStream.end();
  process.exit(0);
});
