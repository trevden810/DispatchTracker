// Check raw FileMaker response
// Run: node tests/debug-raw-filemaker.js

async function checkRawFileMaker() {
  // Test credentials
  const baseUrl = 'https://modd.mainspringhost.com'
  const database = 'PEP2_1'
  const layout = 'jobs_api'
  const username = 'trevor_api'
  const password = 'XcScS2yRoTtMo7'
  
  console.log('🔑 Authenticating with FileMaker...')
  const authUrl = `${baseUrl}/fmi/data/vLatest/databases/${database}/sessions`
  const credentials = Buffer.from(`${username}:${password}`).toString('base64')
  
  const authResponse = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    }
  })
  
  const authData = await authResponse.json()
  const token = authData.response.token
  console.log('✅ Token received\n')
  
  // Get today's jobs
  const today = new Date()
  const todayFormatted = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`
  
  console.log(`📋 Querying jobs for: ${todayFormatted}\n`)
  
  const queryUrl = `${baseUrl}/fmi/data/vLatest/databases/${database}/layouts/${layout}/_find`
  const queryResponse = await fetch(queryUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: [{ "job_date": todayFormatted }],
      limit: 5
    })
  })
  
  const queryData = await queryResponse.json()
  
  console.log('📊 RAW FileMaker Response:\n')
  console.log(JSON.stringify(queryData, null, 2))
  
  if (queryData.response?.data?.[0]) {
    console.log('\n📋 First Record Field Names:')
    console.log(Object.keys(queryData.response.data[0].fieldData).sort().join('\n'))
  }
}

checkRawFileMaker().catch(console.error)
