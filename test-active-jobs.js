// Test for active jobs only - skip DELETED/Canceled
const https = require('https');

const FILEMAKER_CONFIG = {
  baseUrl: 'https://modd.mainspringhost.com',
  database: 'PEP2_1',
  layout: 'jobs_api',
  username: 'trevor_api',
  password: 'XcScS2yRoTtMo7'
};

async function testActiveJobsOnly() {
  console.log('🎯 Testing ACTIVE FileMaker jobs only (skip DELETED/Canceled)...');
  
  try {
    // Step 1: Get authentication token
    const authUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/sessions`;
    const credentials = Buffer.from(`${FILEMAKER_CONFIG.username}:${FILEMAKER_CONFIG.password}`).toString('base64');
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    const authData = await authResponse.json();
    const token = authData.response.token;
    console.log(`🎫 Token: ${token.substring(0, 10)}...`);

    // Step 2: Query for TODAY'S ACTIVE jobs only
    const today = new Date();
    const todayFormatted = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    console.log(`📅 Querying for today's jobs: ${todayFormatted}`);
    
    const queryUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`;
    
    const queryBody = {
      query: [
        { "job_date": todayFormatted },
        { "job_status": "!Canceled" },
        { "job_status": "!DELETED" },
        { "job_status": "!Complete" }
      ],
      limit: 10
    };

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
      console.error(`❌ Query failed: ${queryResponse.status} - ${errorText}`);
      return;
    }

    const queryData = await queryResponse.json();
    console.log(`📊 Found ${queryData.response?.dataInfo?.foundCount || 0} active jobs`);
    
    if (queryData.response?.data?.length > 0) {
      console.log('\\n🔍 ACTIVE JOBS FIELD ANALYSIS:');
      
      queryData.response.data.slice(0, 5).forEach((record, index) => {
        const fieldData = record.fieldData;
        console.log(`\\nActive Job ${index + 1} (ID: ${fieldData._kp_job_id}):`);
        console.log(`  *kf*trucks_id: '${fieldData['*kf*trucks_id']}'`);
        console.log(`  *kf*route_id: '${fieldData['*kf*route_id']}'`);
        console.log(`  *kf*driver_id: '${fieldData['*kf*driver_id']}'`);
        console.log(`  job_status: '${fieldData.job_status}'`);
        console.log(`  job_type: '${fieldData.job_type}'`);
        console.log(`  job_date: '${fieldData.job_date}'`);
        console.log(`  Customer_C1: '${fieldData.Customer_C1}'`);
        console.log(`  order_C1: '${fieldData.order_C1}'`);
        
        // Check ALL fields to see what's actually available
        console.log(`  ALL FIELDS:`, Object.keys(fieldData));
      });
      
      // Analyze active job truck data
      console.log('\\n🚛 ACTIVE JOBS TRUCK ANALYSIS:');
      const truckIds = [];
      const routeIds = [];
      const driverIds = [];
      
      queryData.response.data.forEach(record => {
        const fieldData = record.fieldData;
        if (fieldData['*kf*trucks_id'] !== undefined && fieldData['*kf*trucks_id'] !== null && fieldData['*kf*trucks_id'] !== '') {
          truckIds.push(fieldData['*kf*trucks_id']);
        }
        if (fieldData['*kf*route_id'] !== undefined && fieldData['*kf*route_id'] !== null && fieldData['*kf*route_id'] !== '') {
          routeIds.push(fieldData['*kf*route_id']);
        }
        if (fieldData['*kf*driver_id'] !== undefined && fieldData['*kf*driver_id'] !== null && fieldData['*kf*driver_id'] !== '') {
          driverIds.push(fieldData['*kf*driver_id']);
        }
      });
      
      console.log(`Active jobs with truck IDs: ${truckIds.length}/${queryData.response.data.length}`);
      console.log(`Active jobs with route IDs: ${routeIds.length}/${queryData.response.data.length}`);
      console.log(`Active jobs with driver IDs: ${driverIds.length}/${queryData.response.data.length}`);
      console.log(`Truck IDs: [${truckIds.join(', ')}]`);
      console.log(`Route IDs: [${routeIds.join(', ')}]`);
      console.log(`Driver IDs: [${driverIds.join(', ')}]`);
      
    } else {
      console.log('❌ No active job records returned');
      console.log('   This might mean:');
      console.log('   1. No jobs scheduled for today');
      console.log('   2. Different field names for status filtering');
      console.log('   3. Date format mismatch');
    }

  } catch (error) {
    console.error('❌ Active jobs test error:', error.message);
  }
}

testActiveJobsOnly();
