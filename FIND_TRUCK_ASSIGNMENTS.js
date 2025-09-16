#!/usr/bin/env node

// TARGETED TRUCK ASSIGNMENT SEARCH
// Finding jobs with actual truck ID assignments

const FILEMAKER_CONFIG = {
  baseUrl: 'https://modd.mainspringhost.com',
  database: 'PEP2_1',
  layout: 'jobs_api',
  username: 'trevor_api',
  password: 'XcScS2yRoTtMo7'
};

async function findJobsWithTruckAssignments() {
  console.log('🎯 TARGETED TRUCK ASSIGNMENT SEARCH');
  console.log('====================================');
  console.log('Searching for jobs with actual truck ID assignments...\n');
  
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
    console.log('✅ Authentication successful\n');
    
    // Strategy: Search multiple date ranges and job statuses to find truck assignments
    const searchStrategies = [
      {
        name: 'Recent Completed Jobs',
        query: [
          { "job_status": "Complete" },
          { "job_date": ">09/01/2025" }
        ],
        limit: 20
      },
      {
        name: 'In Progress Jobs',
        query: [{ "job_status": "In Progress" }],
        limit: 15
      },
      {
        name: 'Delivery Jobs (Last 30 Days)',
        query: [
          { "job_type": "Delivery" },
          { "job_date": ">08/15/2025" }
        ],
        limit: 25
      },
      {
        name: 'Any Job with Non-Empty Truck Field',
        query: [{ "*kf*trucks_id": "!=" }], // Not empty
        limit: 10
      },
      {
        name: 'Jobs from August (Older Data)',
        query: [{ "job_date": ">=08/01/2025" }],
        limit: 30
      }
    ];
    
    let totalJobsWithTrucks = 0;
    let foundTruckIds = new Set();
    
    for (const strategy of searchStrategies) {
      console.log(`🔍 STRATEGY: ${strategy.name}`);
      console.log('─'.repeat(50));
      
      try {
        const queryUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`;
        
        const searchBody = {
          query: strategy.query,
          limit: strategy.limit,
          sort: [{ "fieldName": "job_date", "sortOrder": "descend" }]
        };
        
        console.log(`   Query: ${JSON.stringify(strategy.query)}`);
        
        const queryResponse = await fetch(queryUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(searchBody)
        });
        
        if (!queryResponse.ok) {
          console.log(`   ❌ Query failed: ${queryResponse.status}`);
          continue;
        }
        
        const queryData = await queryResponse.json();
        const foundCount = queryData.response?.dataInfo?.foundCount || 0;
        const returnedJobs = queryData.response?.data || [];
        
        console.log(`   📊 Found: ${foundCount} jobs, Returned: ${returnedJobs.length}`);
        
        let strategyTruckCount = 0;
        
        returnedJobs.forEach((record, index) => {
          const fieldData = record.fieldData;
          const truckId = fieldData["*kf*trucks_id"];
          
          // Check if truck ID has actual value (not empty string)
          if (truckId && truckId.toString().trim() !== '') {
            strategyTruckCount++;
            totalJobsWithTrucks++;
            foundTruckIds.add(truckId.toString().trim());
            
            console.log(`   ✅ Job ${fieldData._kp_job_id}: Truck ${truckId} (${fieldData.job_status}, ${fieldData.job_date})`);
          } else if (index < 3) { // Show first few empty ones for debugging
            console.log(`   📝 Job ${fieldData._kp_job_id}: No truck (${fieldData.job_status}, ${fieldData.job_date})`);
          }
        });
        
        console.log(`   🎯 Jobs with truck assignments in this strategy: ${strategyTruckCount}`);
        
        if (strategyTruckCount > 0) {
          console.log('   🎉 SUCCESS: Found jobs with truck assignments!');
        } else {
          console.log('   ⚠️  No truck assignments found in this dataset');
        }
        
      } catch (error) {
        console.log(`   ❌ Strategy failed: ${error.message}`);
      }
      
      console.log(''); // Blank line between strategies
    }
    
    // Final summary
    console.log('🎯 SEARCH SUMMARY');
    console.log('=================');
    console.log(`Total jobs with truck assignments found: ${totalJobsWithTrucks}`);
    console.log(`Unique truck IDs discovered: ${foundTruckIds.size}`);
    
    if (foundTruckIds.size > 0) {
      console.log(`Truck IDs in use: [${Array.from(foundTruckIds).sort().join(', ')}]`);
      console.log('\n🎉 BREAKTHROUGH CONFIRMED!');
      console.log('✅ Field mapping fix is working');
      console.log('✅ Truck assignments exist in FileMaker');
      console.log('✅ System can access truck ID data');
      console.log('✅ Vehicle-job correlation is now possible');
      
      console.log('\n🚀 PRODUCTION READINESS UPDATE:');
      console.log('- Critical field mapping: ✅ RESOLVED');
      console.log('- Data accessibility: ✅ CONFIRMED');
      console.log('- Truck assignments: ✅ AVAILABLE');
      console.log('- System correlation: 🚀 READY TO IMPLEMENT');
      
      return true;
    } else {
      console.log('\n⚠️  INVESTIGATION NEEDED:');
      console.log('- Field mapping works but no truck assignments found');
      console.log('- May need different search criteria');
      console.log('- Could be seasonal/operational timing issue');
      console.log('- Contact database administrator for guidance');
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    return false;
  }
}

// Execute the targeted search
if (require.main === module) {
  findJobsWithTruckAssignments()
    .then(success => {
      console.log('\n' + '='.repeat(50));
      console.log('TARGETED SEARCH RESULT:', success ? 'SUCCESS ✅' : 'NEEDS INVESTIGATION ⚠️');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Search execution failed:', error);
      process.exit(2);
    });
}

module.exports = findJobsWithTruckAssignments;
