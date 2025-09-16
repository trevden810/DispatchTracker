// CRITICAL TEST: Verify truckId field fix
// Testing the asterisk notation fix for *kf*trucks_id

const FILEMAKER_CONFIG = {
  baseUrl: process.env.FILEMAKER_BASE_URL || 'https://modd.mainspringhost.com',
  database: 'PEP2_1',
  layout: 'jobs_api',
  username: 'trevor_api',
  password: 'XcScS2yRoTtMo7'
}

async function testFieldFix() {
  console.log('🚨 CRITICAL TEST: Testing truckId field mapping fix');
  console.log('=================================================');
  
  try {
    // Step 1: Authenticate
    console.log('🔑 Authenticating with FileMaker...');
    const authUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/sessions`;
    const credentials = Buffer.from(`${FILEMAKER_CONFIG.username}:${FILEMAKER_CONFIG.password}`).toString('base64');
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status}`);
    }
    
    const authData = await authResponse.json();
    const token = authData.response.token;
    console.log('✅ Token received:', token.substring(0, 10) + '...');
    
    // Step 2: Query for recent jobs
    console.log('\n📋 Querying for recent jobs...');
    const queryUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = `${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getDate().toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
    
    const queryBody = {
      query: [{ "job_date": `>=${dateStr}` }],
      limit: 5
    };
    
    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryBody)
    });
    
    if (!queryResponse.ok) {
      throw new Error(`Query failed: ${queryResponse.status}`);
    }
    
    const queryData = await queryResponse.json();
    console.log(`✅ Found ${queryData.response.dataInfo.foundCount} records`);
    
    // Step 3: Analyze field mapping
    console.log('\n🔍 FIELD MAPPING ANALYSIS:');
    console.log('==========================');
    
    if (queryData.response.data && queryData.response.data.length > 0) {
      queryData.response.data.forEach((record, index) => {
        const fieldData = record.fieldData;
        console.log(`\nJob ${index + 1} (ID: ${fieldData._kp_job_id}):`);
        
        // Test all possible field variations
        const fieldVariations = [
          '*kf*trucks_id',    // Our fix - asterisks
          '_kf_trucks_id',    // Old version - underscores  
          'trucks_id',        // Simple
          'truck_id',         // Common
          'TruckID',          // Pascal
          'TRUCK_ID'          // Upper
        ];
        
        let foundTruckId = false;
        fieldVariations.forEach(fieldName => {
          const value = fieldData[fieldName];
          if (value !== undefined && value !== null) {
            console.log(`  ✅ ${fieldName}: ${value} (${typeof value})`);
            foundTruckId = true;
          } else {
            console.log(`  ❌ ${fieldName}: ${value}`);
          }
        });
        
        if (!foundTruckId) {
          console.log('  ⚠️  NO TRUCK ID FOUND - showing all available fields:');
          Object.keys(fieldData).forEach(key => {
            if (key.toLowerCase().includes('truck') || key.toLowerCase().includes('kf')) {
              console.log(`    ${key}: ${fieldData[key]}`);
            }
          });
        }
      });
      
      // Summary
      const hasAnyTruckIds = queryData.response.data.some(record => {
        return record.fieldData['*kf*trucks_id'] !== undefined && 
               record.fieldData['*kf*trucks_id'] !== null;
      });
      
      console.log('\n🎯 SUMMARY:');
      console.log('===========');
      if (hasAnyTruckIds) {
        console.log('✅ SUCCESS: truckId field mapping is working!');
        console.log('✅ Vehicle-job correlation can now proceed');
        console.log('✅ Project unblocked for production deployment');
      } else {
        console.log('❌ STILL BLOCKED: truckId field not accessible');
        console.log('🔍 Need to investigate layout permissions or field availability');
        console.log('💡 May need to request jobs_api_fleet layout access');
      }
      
    } else {
      console.log('❌ No job records returned');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔍 TROUBLESHOOTING:');
    console.log('1. Check network connection');
    console.log('2. Verify API credentials');
    console.log('3. Confirm FileMaker server is accessible');
  }
}

// Run the test
testFieldFix().catch(console.error);
