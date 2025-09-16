// Debug FileMaker Connection - Test with original fields only
// This will help us determine if it's a field access issue or data issue

const FILEMAKER_CONFIG = {
  baseUrl: 'https://modd.mainspringhost.com',
  database: 'PEP2_1',
  layout: 'jobs_api',
  username: 'trevor_api', 
  password: process.env.FILEMAKER_PASSWORD || 'XcScS2yRoTtMo7'
}

async function debugFileMakerConnection() {
  console.log('🔍 Debugging FileMaker Connection...\n')
  
  try {
    // Step 1: Test Authentication
    console.log('1. Testing FileMaker Authentication...')
    const authUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/sessions`
    const credentials = Buffer.from(`${FILEMAKER_CONFIG.username}:${FILEMAKER_CONFIG.password}`).toString('base64')
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!authResponse.ok) {
      console.log('❌ Authentication failed:', authResponse.status)
      const errorText = await authResponse.text()
      console.log('Error details:', errorText)
      return
    }
    
    const authData = await authResponse.json()
    console.log('✅ Authentication successful')
    console.log('Token:', authData.response.token.substring(0, 10) + '...')
    
    // Step 2: Test Basic Query (All Jobs)
    console.log('\n2. Testing Basic Query (All Jobs)...')
    const token = authData.response.token
    const findUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`
    
    const basicQuery = {
      query: [{ "_kp_job_id": "*" }],
      limit: 5
    }
    
    const queryResponse = await fetch(findUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(basicQuery)
    })
    
    const queryData = await queryResponse.json()
    console.log('Query response status:', queryResponse.status)
    console.log('Query response:', JSON.stringify(queryData, null, 2))
    
    if (queryData.response?.data) {
      console.log(`✅ Found ${queryData.response.data.length} total jobs`)
      
      // Step 3: Test Active Jobs Query
      console.log('\n3. Testing Active Jobs Query...')
      const activeQuery = {
        query: [{ "job_status": "Active" }],
        limit: 5
      }
      
      const activeResponse = await fetch(findUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activeQuery)
      })
      
      const activeData = await activeResponse.json()
      console.log('Active query response:', JSON.stringify(activeData, null, 2))
      
      if (activeData.response?.data) {
        console.log(`✅ Found ${activeData.response.data.length} active jobs`)
      } else {
        console.log('⚠️ No active jobs found')
      }
      
      // Step 4: Check Available Fields
      console.log('\n4. Checking Available Fields...')
      if (queryData.response.data[0]) {
        const sampleRecord = queryData.response.data[0].fieldData
        console.log('Available fields in sample record:')
        Object.keys(sampleRecord).forEach(field => {
          console.log(`  ${field}: ${sampleRecord[field]}`)
        })
      }
      
    } else {
      console.log('❌ No job data returned')
      console.log('FileMaker response:', queryData)
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message)
  }
}

debugFileMakerConnection()
