#!/usr/bin/env node

// DispatchTracker Debug Script
// Tests the field mapping issue directly

const https = require('https');

console.log('🔍 DispatchTracker Field Mapping Debug Script');
console.log('================================================');

// Test FileMaker authentication and field access
async function testFileMakerFieldMapping() {
  console.log('\n🔑 Testing FileMaker authentication...');
  
  const authUrl = 'https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/sessions';
  const credentials = Buffer.from('trevor_api:XcScS2yRoTtMo7').toString('base64');
  
  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status}`);
    }
    
    const authData = await response.json();
    const token = authData.response?.token;
    
    if (!token) {
      throw new Error('No token received');
    }
    
    console.log('✅ Authentication successful');
    console.log('🔑 Token:', token.substring(0, 10) + '...');
    
    // Test query with specific focus on truckId field
    console.log('\n📋 Testing job query with truck field focus...');
    
    const queryUrl = 'https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/layouts/jobs_api/_find';
    const queryBody = {
      query: [{ "_kp_job_id": "*" }],
      limit: 10
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
    console.log('✅ Query successful');
    console.log('📊 Found records:', queryData.response?.dataInfo?.foundCount || 0);
    
    // Analyze the first few records for field structure
    if (queryData.response?.data?.length > 0) {
      console.log('\n🔍 FIELD ANALYSIS:');
      console.log('===================');
      
      queryData.response.data.slice(0, 5).forEach((record, index) => {
        const fieldData = record.fieldData;
        console.log(`\nRecord ${index + 1}:`);
        console.log(`  Job ID: ${fieldData._kp_job_id}`);
        console.log(`  Customer: ${fieldData.Customer_C1 || 'N/A'}`);
        console.log(`  Status: ${fieldData.job_status}`);
        
        // Focus on the truck field
        const truckField = fieldData['*kf*trucks_id'];
        console.log(`  🚛 Truck Field (*kf*trucks_id): "${truckField}" (type: ${typeof truckField})`);
        
        if (truckField !== null && truckField !== undefined) {
          const parsed = parseInt(truckField.toString(), 10);
          console.log(`  🚛 Parsed as number: ${parsed} (valid: ${!isNaN(parsed)})`);
        } else {
          console.log(`  🚛 Truck field is null/undefined`);
        }
        
        // Check other fields that might contain truck info
        console.log(`  🔍 Other relevant fields:`);
        Object.keys(fieldData).forEach(key => {
          if (key.toLowerCase().includes('truck') || key.includes('kf')) {
            console.log(`    - ${key}: "${fieldData[key]}" (${typeof fieldData[key]})`);
          }
        });
      });
      
      // Summary of truck assignments
      console.log('\n📊 TRUCK ASSIGNMENT SUMMARY:');
      console.log('============================');
      
      const truckCounts = new Map();
      let recordsWithTrucks = 0;
      let totalRecords = queryData.response.data.length;
      
      queryData.response.data.forEach(record => {
        const truckField = record.fieldData['*kf*trucks_id'];
        if (truckField !== null && truckField !== undefined && truckField !== '') {
          recordsWithTrucks++;
          const truckId = parseInt(truckField.toString(), 10);
          if (!isNaN(truckId)) {
            truckCounts.set(truckId, (truckCounts.get(truckId) || 0) + 1);
          }
        }
      });
      
      console.log(`Records with truck assignments: ${recordsWithTrucks}/${totalRecords}`);
      console.log(`Unique trucks found: ${truckCounts.size}`);
      
      if (truckCounts.size > 0) {
        console.log('Truck assignment distribution:');
        Array.from(truckCounts.entries())
          .sort(([a], [b]) => a - b)
          .forEach(([truckId, count]) => {
            console.log(`  Truck ${truckId}: ${count} jobs`);
          });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testFileMakerFieldMapping()
  .then(() => {
    console.log('\n✅ Debug script completed');
  })
  .catch(error => {
    console.error('\n❌ Debug script failed:', error);
  });
