// Simple test for enhanced FileMaker integration
// Bypasses PowerShell JSON escaping issues

const http = require('http');

async function testFieldAccess() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ testFieldAccess: true });
    
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/jobs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testJobsAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/jobs?limit=2&geocode=true',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Enhanced FileMaker Integration\n');
  
  try {
    // Test 1: Field Access
    console.log('1. Testing Field Access...');
    const fieldTest = await testFieldAccess();
    
    if (fieldTest.success) {
      console.log('✅ Field access test PASSED\n');
      
      console.log('📋 ENHANCED FIELDS STATUS:');
      Object.entries(fieldTest.field_status.enhanced_fields).forEach(([field, status]) => {
        console.log(`  ${field}: ${status}`);
      });
      
      console.log('\n📊 SAMPLE DATA:');
      Object.entries(fieldTest.field_status.sample_data).forEach(([field, value]) => {
        console.log(`  ${field}: ${value}`);
      });
    } else {
      console.log('❌ Field access test failed:', fieldTest.error);
    }
    
    // Test 2: Jobs API with Enhanced Data
    console.log('\n2. Testing Jobs API with Enhanced Data...');
    const jobsTest = await testJobsAPI();
    
    if (jobsTest.success && jobsTest.data) {
      console.log(`✅ Retrieved ${jobsTest.count} jobs with enhanced fields\n`);
      
      const sampleJob = jobsTest.data[0];
      if (sampleJob) {
        console.log('📋 SAMPLE ENHANCED JOB:');
        console.log(`  Job ID: ${sampleJob.id}`);
        console.log(`  Customer: ${sampleJob.customer || 'N/A'}`);
        console.log(`  Address: ${sampleJob.address || 'N/A'}`);
        console.log(`  Arrival Time: ${sampleJob.arrivalTime || 'N/A'}`);
        console.log(`  Completion Time: ${sampleJob.completionTime || 'N/A'}`);
        console.log(`  Due Date: ${sampleJob.dueDate || 'N/A'}`);
        
        if (sampleJob.location) {
          console.log(`  Geocoded: ${sampleJob.location.lat}, ${sampleJob.location.lng}`);
          console.log(`  Source: ${sampleJob.location.source}`);
        }
      }
    } else {
      console.log('❌ Jobs API test failed:', jobsTest.error || 'Unknown error');
    }
    
    console.log('\n🎉 Enhanced FileMaker Integration Tests Complete!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runTests();
