// Quick Field Access Test - Using built-in Node.js modules
const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
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
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function quickFieldTest() {
  try {
    console.log('🧪 Testing Enhanced FileMaker Field Access...\n');
    
    // Test field access
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
    
    const result = await makeRequest(options, postData);
    
    if (result.success) {
      console.log('✅ Enhanced field access test PASSED\n');
      
      console.log('📋 ORIGINAL FIELDS:');
      Object.entries(result.field_status.original_fields).forEach(([field, status]) => {
        console.log(`  ${field}: ${status}`);
      });
      
      console.log('\n🆕 ENHANCED FIELDS:');
      Object.entries(result.field_status.enhanced_fields).forEach(([field, status]) => {
        console.log(`  ${field}: ${status}`);
      });
      
      console.log('\n📊 SAMPLE DATA:');
      Object.entries(result.field_status.sample_data).forEach(([field, value]) => {
        console.log(`  ${field}: ${value}`);
      });
      
    } else {
      console.log('❌ Enhanced field access test FAILED');
      console.log('Error:', result.error);
      console.log('Details:', result.details);
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
    }
  }
}

quickFieldTest();
