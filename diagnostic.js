// Detailed diagnostic for FileMaker integration issues
const http = require('http');

function makeRequest(path, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, parseError: e.message });
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runDiagnostics() {
  console.log('🔍 FileMaker Integration Diagnostics\n');
  
  try {
    // Test 1: Basic server health
    console.log('1. Testing basic server response...');
    const healthTest = await makeRequest('/api/jobs?limit=1');
    console.log(`   Status: ${healthTest.status}`);
    if (healthTest.data.success === false) {
      console.log(`   Error: ${healthTest.data.error}`);
      console.log(`   Details: ${healthTest.data.details}`);
    } else {
      console.log('   ✅ Server responding');
    }
    
    // Test 2: Field access test with detailed error info
    console.log('\n2. Testing field access with error details...');
    const fieldTest = await makeRequest('/api/jobs', 'POST', JSON.stringify({ testFieldAccess: true }));
    console.log(`   Status: ${fieldTest.status}`);
    
    if (fieldTest.data.success) {
      console.log('   ✅ Field access working');
      console.log('   Enhanced fields:');
      Object.entries(fieldTest.data.field_status.enhanced_fields).forEach(([field, status]) => {
        console.log(`     ${field}: ${status}`);
      });
    } else {
      console.log(`   ❌ Field access failed: ${fieldTest.data.error}`);
      console.log(`   Details: ${fieldTest.data.details}`);
      if (fieldTest.data.receivedBody) {
        console.log(`   Received body: ${fieldTest.data.receivedBody}`);
      }
    }
    
    // Test 3: Basic jobs query without enhanced features
    console.log('\n3. Testing basic jobs query...');
    const basicJobsTest = await makeRequest('/api/jobs?limit=2&geocode=false&hygiene=false');
    console.log(`   Status: ${basicJobsTest.status}`);
    
    if (basicJobsTest.data.success) {
      console.log(`   ✅ Retrieved ${basicJobsTest.data.count} jobs`);
      if (basicJobsTest.data.data && basicJobsTest.data.data.length > 0) {
        const job = basicJobsTest.data.data[0];
        console.log(`   Sample job: ID ${job.id}, Status: ${job.status}`);
      }
    } else {
      console.log(`   ❌ Basic jobs failed: ${basicJobsTest.data.error}`);
      console.log(`   Details: ${basicJobsTest.data.details}`);
    }
    
    // Test 4: Enhanced jobs query
    console.log('\n4. Testing enhanced jobs query...');
    const enhancedJobsTest = await makeRequest('/api/jobs?limit=2&geocode=true&hygiene=true');
    console.log(`   Status: ${enhancedJobsTest.status}`);
    
    if (enhancedJobsTest.data.success) {
      console.log(`   ✅ Enhanced jobs working - ${enhancedJobsTest.data.count} jobs`);
      if (enhancedJobsTest.data.data && enhancedJobsTest.data.data.length > 0) {
        const job = enhancedJobsTest.data.data[0];
        console.log(`   Enhanced data: Customer: ${job.customer || 'N/A'}, Address: ${job.address || 'N/A'}`);
      }
    } else {
      console.log(`   ❌ Enhanced jobs failed: ${enhancedJobsTest.data.error}`);
      console.log(`   Details: ${enhancedJobsTest.data.details}`);
    }
    
  } catch (error) {
    console.log(`❌ Diagnostic failed: ${error.message}`);
  }
}

runDiagnostics();
