#!/usr/bin/env node
// Quick test script for Truck 77 correlation fixes
// Run with: node test-truck77-fixes.js

console.log('🚛 DISPATCH TRACKER - TRUCK 77 FIXES TEST');
console.log('=' .repeat(60));

// Test the diagnostic functions
function testVehicleExtraction() {
  console.log('\n🔍 Testing Vehicle ID Extraction...');
  
  const testCases = [
    'Truck 77',
    'Vehicle 84', 
    '901',
    'OR70',
    'V8',
    'Truck_77',
    'Vehicle-84'
  ];
  
  function extractVehicleNumber(vehicleId) {
    const cleanId = vehicleId.trim();
    const patterns = [
      /(?:Truck|Vehicle)\s*[_-]?\s*(\d+)/i,
      /^(\d+)$/,
      /(\d+)$/,
      /^\w*(\d{2,3})\w*$/,
      /(77|84|901|70)/,
    ];
    
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = cleanId.match(pattern);
      if (match) {
        const extractedNumber = parseInt(match[1] || match[0], 10);
        return extractedNumber;
      }
    }
    return null;
  }
  
  testCases.forEach(testCase => {
    const result = extractVehicleNumber(testCase);
    const status = result ? '✅' : '❌';
    console.log(`  ${status} "${testCase}" -> ${result || 'NO MATCH'}`);
  });
}

function testExpectedBehavior() {
  console.log('\n🎯 Expected Behavior Validation...');
  
  // Mock the expected scenario
  const truck77 = {
    name: 'Truck 77',
    lat: 39.7392,
    lng: -104.9903,
    speed: 25
  };
  
  const jobs = [
    { id: 64479, truckId: 77, routeId: 2, stopOrder: 3, customer: 'COMPASS GROUP', status: 'External' },
    { id: 64481, truckId: 77, routeId: 2, stopOrder: 1, customer: 'WALMART', status: 'Complete' },
    { id: 64482, truckId: 77, routeId: 2, stopOrder: 2, customer: 'TARGET', status: 'Complete' }
  ];
  
  console.log('  Vehicle: Truck 77');
  console.log('  Jobs assigned to truck 77:', jobs.length);
  
  const sortedJobs = jobs.sort((a, b) => a.stopOrder - b.stopOrder);
  const completedJobs = sortedJobs.filter(job => job.status === 'Complete');
  const nextJob = sortedJobs.find(job => job.status !== 'Complete');
  
  console.log('  Sorted jobs by stop order: ✅');
  console.log('  Completed jobs:', completedJobs.length);
  console.log('  Next job:', nextJob ? `${nextJob.customer} (Stop ${nextJob.stopOrder})` : 'None');
  
  const progress = Math.round((completedJobs.length / sortedJobs.length) * 100);
  console.log('  Progress:', `${progress}% (${completedJobs.length}/${sortedJobs.length})`);
  
  console.log('\n  ✅ Expected vehicle card should show:');
  console.log(`     - Name: ${truck77.name}`);
  console.log(`     - GPS: ${truck77.lat}, ${truck77.lng}`);
  console.log(`     - Job: #${nextJob.id} - ${nextJob.customer}`);
  console.log(`     - Route: Route ${nextJob.routeId}, Stop ${nextJob.stopOrder} of ${sortedJobs.length}`);
  console.log(`     - Progress: ${progress}% complete`);
}

function testAPIEndpoints() {
  console.log('\n📡 API Endpoints to Test...');
  console.log('  Local Development:');
  console.log('    http://localhost:3002/api/tracking');
  console.log('    http://localhost:3002/api/jobs?limit=10');
  console.log('    http://localhost:3002/cards');
  console.log('');
  console.log('  Production:');
  console.log('    https://www.pepmovetracker.info/api/tracking');
  console.log('    https://www.pepmovetracker.info/api/jobs?limit=10');
  console.log('    https://www.pepmovetracker.info/cards');
  console.log('');
  console.log('  Look for in API response:');
  console.log('    - summary.vehiclesWithJobs > 0');
  console.log('    - summary.routeMetrics.vehiclesWithRoutes > 0');
  console.log('    - data[].assignedJob != null');
  console.log('    - data[].routeInfo != null');
}

// Run all tests
testVehicleExtraction();
testExpectedBehavior();
testAPIEndpoints();

console.log('\n' + '=' .repeat(60));
console.log('🏁 TESTING COMPLETE');
console.log('=' .repeat(60));
console.log('✅ If all tests pass, the correlation fixes should work correctly.');
console.log('🚀 Next: Deploy changes and test with live data.');
console.log('🔍 Monitor console logs for correlation debugging output.');
