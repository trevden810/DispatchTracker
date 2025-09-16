// Direct FileMaker API test - bypassing Next.js
const https = require('https');

const FILEMAKER_CONFIG = {
  baseUrl: 'https://modd.mainspringhost.com',
  database: 'PEP2_1',
  layout: 'jobs_api',
  username: 'trevor_api',
  password: 'XcScS2yRoTtMo7'
};

async function testFileMakerDirect() {
  console.log('🔑 Testing direct FileMaker connection...');
  
  try {
    // Step 1: Get authentication token
    console.log('Step 1: Getting FileMaker token...');
    const authUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/sessions`;
    const credentials = Buffer.from(`${FILEMAKER_CONFIG.username}:${FILEMAKER_CONFIG.password}`).toString('base64');
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Auth response status: ${authResponse.status}`);
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error(`❌ FileMaker auth failed: ${authResponse.status} - ${errorText}`);
      return;
    }

    const authData = await authResponse.json();
    console.log('✅ Auth successful');
    
    if (!authData.response?.token) {
      console.error('❌ No token in auth response:', authData);
      return;
    }

    const token = authData.response.token;
    console.log(`🎫 Token received: ${token.substring(0, 10)}...`);

    // Step 2: Query for jobs
    console.log('\\nStep 2: Querying FileMaker jobs...');
    const queryUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`;
    
    const queryBody = {
      query: [{ "_kp_job_id": "*" }],
      limit: 5
    };

    console.log('Query URL:', queryUrl);
    console.log('Query Body:', JSON.stringify(queryBody, null, 2));

    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryBody)
    });

    console.log(`Query response status: ${queryResponse.status}`);

    if (!queryResponse.ok) {
      const errorText = await queryResponse.text();
      console.error(`❌ FileMaker query failed: ${queryResponse.status} - ${errorText}`);
      return;
    }

    const queryData = await queryResponse.json();
    console.log('✅ Query successful!');
    console.log(`📊 Found ${queryData.response?.dataInfo?.foundCount || 0} records`);
    
    if (queryData.response?.data?.length > 0) {
      console.log('\\n🔍 SAMPLE JOB DATA ANALYSIS:');
      
      queryData.response.data.slice(0, 3).forEach((record, index) => {
        const fieldData = record.fieldData;
        console.log(`\\nJob ${index + 1} (ID: ${fieldData._kp_job_id}):`);
        console.log(`  *kf*trucks_id: '${fieldData['*kf*trucks_id']}'`);
        console.log(`  *kf*route_id: '${fieldData['*kf*route_id']}'`);
        console.log(`  *kf*driver_id: '${fieldData['*kf*driver_id']}'`);
        console.log(`  job_status: '${fieldData.job_status}'`);
        console.log(`  Customer_C1: '${fieldData.Customer_C1}'`);
        console.log(`  order_C1: '${fieldData.order_C1}'`);
      });
      
      // Analyze truck IDs
      console.log('\\n🚛 TRUCK ID ANALYSIS:');
      const truckIds = [];
      queryData.response.data.forEach(record => {
        const truckId = record.fieldData['*kf*trucks_id'];
        if (truckId !== null && truckId !== undefined && truckId !== '') {
          truckIds.push(truckId);
        }
      });
      
      console.log(`Jobs with truck IDs: ${truckIds.length}/${queryData.response.data.length}`);
      console.log(`Truck IDs found: [${truckIds.join(', ')}]`);
      console.log(`Unique truck IDs: [${[...new Set(truckIds)].join(', ')}]`);
      
    } else {
      console.log('❌ No job records returned');
    }

  } catch (error) {
    console.error('❌ Direct FileMaker test error:', error.message);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
  }
}

testFileMakerDirect();
