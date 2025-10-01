// FileMaker API Integration Test
// Tests authentication and job queries against production credentials

const FILEMAKER_CONFIG = {
  baseUrl: 'https://modd.mainspringhost.com',
  database: 'PEP2_1',
  layout: 'jobs_api',
  username: 'trevor_api',
  password: 'XcScS2yRoTtMo7'
}

async function testAuthentication() {
  console.log('\n🔑 Testing FileMaker Authentication...')
  
  const authUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/sessions`
  const credentials = Buffer.from(`${FILEMAKER_CONFIG.username}:${FILEMAKER_CONFIG.password}`).toString('base64')
  
  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Auth failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.response?.token) {
      throw new Error('No token in response')
    }

    console.log('✅ Authentication successful')
    console.log(`   Token: ${data.response.token.substring(0, 20)}...`)
    console.log(`   Messages: ${JSON.stringify(data.messages)}`)
    
    return data.response.token
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.message)
    return null
  }
}

async function testJobQuery(token, jobId = '603142') {
  console.log(`\n📋 Testing Job Query (ID: ${jobId})...`)
  
  const queryUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`
  
  try {
    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: [{ "_kp_job_id": jobId }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Query failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    console.log('✅ Query successful')
    console.log(`   Found: ${data.response.dataInfo.foundCount} records`)
    console.log(`   Total in DB: ${data.response.dataInfo.totalRecordCount}`)
    
    if (data.response.data && data.response.data.length > 0) {
      const job = data.response.data[0].fieldData
      console.log('\n📊 Job Details:')
      console.log(`   Job ID: ${job._kp_job_id}`)
      console.log(`   Date: ${job.job_date}`)
      console.log(`   Status: ${job.job_status}`)
      console.log(`   Type: ${job.job_type}`)
      console.log(`   Truck ID (*kf*trucks_id): ${job["*kf*trucks_id"] || 'null'}`)
      console.log(`   Customer: ${job.Customer_C1 || 'null'}`)
      console.log(`   Address: ${job.address_C1 || 'null'}`)
      console.log(`   Route ID: ${job._kf_route_id || 'null'}`)
      console.log(`   Driver ID: ${job._kf_driver_id || 'null'}`)
    }
    
    return data
    
  } catch (error) {
    console.error('❌ Query failed:', error.message)
    return null
  }
}

async function testRecentJobs(token) {
  console.log('\n📅 Testing Recent Jobs Query...')
  
  const queryUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`
  
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const dateFormat = (date) => 
    `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`
  
  try {
    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: [{ "job_date": `>=${dateFormat(yesterday)}` }],
        limit: 10,
        sort: [{ "fieldName": "job_date", "sortOrder": "descend" }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Query failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    console.log('✅ Recent jobs query successful')
    console.log(`   Found: ${data.response.dataInfo.foundCount} recent jobs`)
    console.log(`   Returned: ${data.response.data.length} jobs`)
    
    console.log('\n📋 Sample Jobs:')
    data.response.data.slice(0, 5).forEach((record, index) => {
      const job = record.fieldData
      console.log(`   ${index + 1}. Job ${job._kp_job_id} - ${job.job_status} - ${job.job_type}`)
      console.log(`      Truck: ${job["*kf*trucks_id"] || 'N/A'} | Route: ${job._kf_route_id || 'N/A'} | Driver: ${job._kf_driver_id || 'N/A'}`)
    })
    
    return data
    
  } catch (error) {
    console.error('❌ Recent jobs query failed:', error.message)
    return null
  }
}

async function testFieldAccess(token) {
  console.log('\n🔍 Testing Enhanced Field Access...')
  
  const queryUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`
  
  try {
    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: [{ "_kf_route_id": "*" }],  // Find jobs with route assignments
        limit: 5
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Query failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    console.log('✅ Enhanced fields accessible')
    console.log(`   Found ${data.response.dataInfo.foundCount} jobs with truck assignments`)
    
    if (data.response.data && data.response.data.length > 0) {
      console.log('\n📊 Field Access Test Results:')
      data.response.data.forEach((record, index) => {
        const job = record.fieldData
        console.log(`\n   Job ${index + 1} (ID: ${job._kp_job_id}):`)
        console.log(`   ├─ *kf*trucks_id: ${job["*kf*trucks_id"]}`)
        console.log(`   ├─ Customer_C1: ${job.Customer_C1 || 'null'}`)
        console.log(`   ├─ address_C1: ${job.address_C1 || 'null'}`)
        console.log(`   ├─ time_arival: ${job.time_arival || 'null'}`)
        console.log(`   ├─ time_complete: ${job.time_complete || 'null'}`)
        console.log(`   ├─ _kf_route_id: ${job._kf_route_id || 'null'}`)
        console.log(`   ├─ _kf_driver_id: ${job._kf_driver_id || 'null'}`)
        console.log(`   └─ order_C1: ${job.order_C1 || 'null'}`)
      })
    }
    
    return data
    
  } catch (error) {
    console.error('❌ Field access test failed:', error.message)
    return null
  }
}

// Run all tests
async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║         FileMaker API Integration Test Suite                ║')
  console.log('║         DispatchTracker Production Credentials              ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  
  console.log('\n📋 Configuration:')
  console.log(`   Base URL: ${FILEMAKER_CONFIG.baseUrl}`)
  console.log(`   Database: ${FILEMAKER_CONFIG.database}`)
  console.log(`   Layout: ${FILEMAKER_CONFIG.layout}`)
  console.log(`   Username: ${FILEMAKER_CONFIG.username}`)
  
  // Test 1: Authentication
  const token = await testAuthentication()
  if (!token) {
    console.log('\n❌ Tests aborted - authentication failed')
    return
  }
  
  // Test 2: Specific job query
  await testJobQuery(token, '603142')
  
  // Test 3: Recent jobs
  await testRecentJobs(token)
  
  // Test 4: Enhanced field access
  await testFieldAccess(token)
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║                    Test Suite Complete                      ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')
}

// Execute tests
runTests().catch(error => {
  console.error('\n💥 Test suite error:', error)
  process.exit(1)
})
