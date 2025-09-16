#!/usr/bin/env node

// CRITICAL SYSTEM VALIDATION: End-to-End Test
// Tests the complete pipeline: FileMaker → Vehicle Correlation → Production Ready

const FILEMAKER_CONFIG = {
  baseUrl: 'https://modd.mainspringhost.com',
  database: 'PEP2_1', 
  layout: 'jobs_api',
  username: 'trevor_api',
  password: 'XcScS2yRoTtMo7'
}

const SAMSARA_CONFIG = {
  token: 'samsara_api_VXKWxiewMU9DvBoEH1ttkHmHHOT1q8',
  baseUrl: 'https://api.samsara.com'
}

async function runCriticalSystemTest() {
  console.log('🚨 CRITICAL SYSTEM VALIDATION TEST');
  console.log('===================================');
  console.log('Testing complete pipeline after truckId field fix\n');
  
  let testResults = {
    fileMakerAuth: false,
    fileMakerQuery: false,
    truckIdMapping: false,
    samsaraAuth: false,
    vehicleData: false,
    correlation: false,
    productionReady: false
  };
  
  try {
    // === TEST 1: FileMaker Authentication ===
    console.log('🔑 TEST 1: FileMaker Authentication');
    console.log('-----------------------------------');
    
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
      throw new Error(`FileMaker auth failed: ${authResponse.status}`);
    }
    
    const authData = await authResponse.json();
    const token = authData.response.token;
    
    console.log('✅ FileMaker authentication successful');
    console.log(`   Token: ${token.substring(0, 10)}...`);
    testResults.fileMakerAuth = true;
    
    // === TEST 2: FileMaker Job Query ===
    console.log('\n📋 TEST 2: FileMaker Job Query');
    console.log('-------------------------------');
    
    const queryUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`;
    
    // Query for recent jobs
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 2); // Last 2 days
    const dateStr = `${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getDate().toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
    
    const queryBody = {
      query: [{ "job_date": `>=${dateStr}` }],
      limit: 10
    };
    
    console.log(`   Querying jobs from ${dateStr} onwards...`);
    
    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryBody)
    });
    
    if (!queryResponse.ok) {
      throw new Error(`FileMaker query failed: ${queryResponse.status}`);
    }
    
    const queryData = await queryResponse.json();
    const jobCount = queryData.response?.dataInfo?.foundCount || 0;
    
    console.log(`✅ FileMaker query successful`);
    console.log(`   Found ${jobCount} jobs`);
    console.log(`   Returned ${queryData.response?.data?.length || 0} records`);
    testResults.fileMakerQuery = true;
    
    // === TEST 3: CRITICAL - TruckId Field Mapping ===
    console.log('\n🚛 TEST 3: CRITICAL TruckId Field Mapping');
    console.log('------------------------------------------');
    
    let truckIdSuccessCount = 0;
    let totalJobs = 0;
    const truckIdResults = [];
    
    if (queryData.response?.data && queryData.response.data.length > 0) {
      queryData.response.data.forEach((record, index) => {
        const fieldData = record.fieldData;
        totalJobs++;
        
        // Test the FIXED field mapping: "*kf*trucks_id"
        const rawTruckId = fieldData["*kf*trucks_id"];
        let parsedTruckId = undefined;
        
        if (rawTruckId !== null && rawTruckId !== undefined) {
          const parsed = typeof rawTruckId === 'string' ? parseInt(rawTruckId, 10) : Number(rawTruckId);
          if (!isNaN(parsed) && parsed > 0) {
            parsedTruckId = parsed;
            truckIdSuccessCount++;
          }
        }
        
        truckIdResults.push({
          jobId: fieldData._kp_job_id,
          rawTruckId: rawTruckId,
          parsedTruckId: parsedTruckId,
          status: fieldData.job_status,
          date: fieldData.job_date
        });
        
        console.log(`   Job ${fieldData._kp_job_id}: truckId=${parsedTruckId} (raw: "${rawTruckId}")`);
      });
      
      const successRate = totalJobs > 0 ? (truckIdSuccessCount / totalJobs * 100).toFixed(1) : 0;
      
      console.log(`\n📊 TruckId Mapping Results:`);
      console.log(`   Total jobs analyzed: ${totalJobs}`);
      console.log(`   Jobs with valid truckId: ${truckIdSuccessCount}`);
      console.log(`   Success rate: ${successRate}%`);
      
      if (truckIdSuccessCount > 0) {
        console.log('✅ CRITICAL FIX SUCCESSFUL: TruckId field mapping is working!');
        testResults.truckIdMapping = true;
      } else {
        console.log('❌ CRITICAL FIX FAILED: TruckId field still not accessible');
        
        // Show all available fields for debugging
        console.log('\n🔍 Available fields in first record:');
        if (queryData.response.data[0]) {
          Object.keys(queryData.response.data[0].fieldData).forEach(key => {
            const value = queryData.response.data[0].fieldData[key];
            console.log(`   ${key}: ${value} (${typeof value})`);
          });
        }
      }
    } else {
      console.log('❌ No job records returned for analysis');
    }
    
    // === TEST 4: Samsara Vehicle Data ===
    console.log('\n🚗 TEST 4: Samsara Vehicle Data');
    console.log('--------------------------------');
    
    const samsaraResponse = await fetch(`${SAMSARA_CONFIG.baseUrl}/fleet/vehicles`, {
      headers: {
        'Authorization': `Bearer ${SAMSARA_CONFIG.token}`,
        'Accept': 'application/json'
      }
    });
    
    if (!samsaraResponse.ok) {
      throw new Error(`Samsara API failed: ${samsaraResponse.status}`);
    }
    
    const samsaraData = await samsaraResponse.json();
    const vehicleCount = samsaraData.data?.length || 0;
    
    console.log('✅ Samsara API successful');
    console.log(`   Retrieved ${vehicleCount} vehicles`);
    testResults.samsaraAuth = true;
    testResults.vehicleData = true;
    
    // === TEST 5: Vehicle-Job Correlation Potential ===
    console.log('\n🔗 TEST 5: Vehicle-Job Correlation Potential');
    console.log('---------------------------------------------');
    
    if (testResults.truckIdMapping && testResults.vehicleData) {
      // Check if any vehicles match the truck IDs from jobs
      const jobTruckIds = truckIdResults
        .filter(result => result.parsedTruckId !== undefined)
        .map(result => result.parsedTruckId);
      
      const vehicleIds = samsaraData.data
        .map(vehicle => {
          // Extract numeric ID from Samsara vehicle name or external ID
          const name = vehicle.name || '';
          const externalId = vehicle.externalIds?.['Truck Number'] || vehicle.externalIds?.['truck_number'] || '';
          
          // Try to extract truck number from name or external ID
          const nameMatch = name.match(/(\d+)/);
          const extMatch = externalId.match(/(\d+)/);
          
          return nameMatch ? parseInt(nameMatch[1]) : (extMatch ? parseInt(extMatch[1]) : null);
        })
        .filter(id => id !== null);
      
      const matchingTrucks = jobTruckIds.filter(jobId => vehicleIds.includes(jobId));
      
      console.log(`   Job truck IDs: [${jobTruckIds.join(', ')}]`);
      console.log(`   Samsara vehicle IDs: [${vehicleIds.slice(0, 10).join(', ')}${vehicleIds.length > 10 ? '...' : ''}]`);
      console.log(`   Potential correlations: ${matchingTrucks.length}`);
      
      if (matchingTrucks.length > 0) {
        console.log('✅ Vehicle-job correlation system is viable');
        console.log(`   Matching trucks: [${matchingTrucks.join(', ')}]`);
        testResults.correlation = true;
      } else {
        console.log('⚠️  No immediate correlations found (may need ID mapping refinement)');
      }
    } else {
      console.log('❌ Cannot test correlation - missing truckId mapping or vehicle data');
    }
    
    // === TEST 6: Production Readiness Assessment ===
    console.log('\n🚀 TEST 6: Production Readiness Assessment');
    console.log('-------------------------------------------');
    
    const criticalTests = [
      { name: 'FileMaker Authentication', passed: testResults.fileMakerAuth },
      { name: 'FileMaker Data Query', passed: testResults.fileMakerQuery },
      { name: 'TruckId Field Mapping', passed: testResults.truckIdMapping },
      { name: 'Samsara API Access', passed: testResults.samsaraAuth },
      { name: 'Vehicle Data Retrieval', passed: testResults.vehicleData }
    ];
    
    const passedCritical = criticalTests.filter(test => test.passed).length;
    const productionReady = passedCritical === criticalTests.length;
    
    console.log('Critical System Tests:');
    criticalTests.forEach(test => {
      console.log(`   ${test.passed ? '✅' : '❌'} ${test.name}`);
    });
    
    console.log(`\nOptional Enhancement Tests:`);
    console.log(`   ${testResults.correlation ? '✅' : '⚠️ '} Vehicle-Job Correlation`);
    
    if (productionReady) {
      console.log('\n🎉 SYSTEM READY FOR PRODUCTION DEPLOYMENT!');
      console.log('   All critical tests passed');
      console.log('   3-week blocker resolved');
      console.log('   Vehicle tracking system operational');
      testResults.productionReady = true;
    } else {
      console.log('\n⚠️  PRODUCTION DEPLOYMENT BLOCKED');
      console.log('   Critical issues remain');
      console.log('   Further development required');
    }
    
  } catch (error) {
    console.error('\n❌ CRITICAL SYSTEM TEST FAILED');
    console.error(`   Error: ${error.message}`);
    console.log('\n🔍 Troubleshooting Required:');
    console.log('   1. Check network connectivity');
    console.log('   2. Verify API credentials');
    console.log('   3. Confirm server accessibility');
    console.log('   4. Review field mapping logic');
  }
  
  // === FINAL SUMMARY ===
  console.log('\n' + '='.repeat(50));
  console.log('FINAL TEST SUMMARY');
  console.log('='.repeat(50));
  
  console.log('System Status:', testResults.productionReady ? '🚀 READY FOR PRODUCTION' : '⚠️  NEEDS DEVELOPMENT');
  console.log('Critical Fix Status:', testResults.truckIdMapping ? '✅ RESOLVED' : '❌ STILL BLOCKED');
  console.log('Deployment Readiness:', testResults.productionReady ? '✅ GO' : '❌ NO-GO');
  
  if (testResults.productionReady) {
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Complete project cleanup');
    console.log('2. Deploy to production environment');
    console.log('3. Train logistics team');
    console.log('4. Monitor system performance');
  } else {
    console.log('\n🔧 REQUIRED FIXES:');
    if (!testResults.truckIdMapping) {
      console.log('- CRITICAL: Fix truckId field mapping');
      console.log('- Test alternative field names or layouts');
      console.log('- Contact database administrator');
    }
  }
  
  console.log('\nTest completed:', new Date().toISOString());
  
  return testResults;
}

// Execute the critical test
if (require.main === module) {
  runCriticalSystemTest()
    .then(results => {
      process.exit(results.productionReady ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(2);
    });
}

module.exports = runCriticalSystemTest;
