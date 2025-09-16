// Exact Postman Replication Test
// This will replicate your successful Postman requests exactly
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪 Testing EXACT Postman replication...')
  
  const config = {
    baseUrl: 'https://modd.mainspringhost.com',
    database: 'PEP2_1',
    layout: 'jobs_api',
    username: 'trevor_api',
    password: 'XcScS2yRoTtMo7'
  }
  
  try {
    // Step 1: Authentication (exactly like Postman)
    console.log('🔑 Step 1: Authenticating...')
    
    const authUrl = `${config.baseUrl}/fmi/data/vLatest/databases/${config.database}/sessions`
    console.log('Auth URL:', authUrl)
    
    const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64')
    console.log('Credentials (base64):', credentials)
    
    const authHeaders = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    }
    console.log('Auth Headers:', authHeaders)
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: authHeaders
    })
    
    console.log('Auth Response Status:', authResponse.status)
    console.log('Auth Response Headers:', Object.fromEntries(authResponse.headers.entries()))
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.log('❌ Auth failed:', errorText)
      return NextResponse.json({ 
        success: false, 
        step: 'authentication',
        error: errorText,
        status: authResponse.status
      }, { status: 500 })
    }
    
    const authData = await authResponse.json()
    const token = authData.response?.token
    
    console.log('✅ Auth successful')
    console.log('Token received:', token ? `${token.substring(0, 10)}...` : 'NONE')
    console.log('Full auth response:', JSON.stringify(authData, null, 2))
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No token received',
        authResponse: authData
      }, { status: 500 })
    }
    
    // Step 2: Immediate query test (exactly like Postman)
    console.log('\n📋 Step 2: Testing immediate query...')
    
    // Use the EXACT same delay as your Postman test
    console.log('Waiting 1 second before query (like Postman)...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const queryUrl = `${config.baseUrl}/fmi/data/vLatest/databases/${config.database}/layouts/${config.layout}/_find`
    console.log('Query URL:', queryUrl)
    
    // Use EXACT same query as your Postman test
    const queryBody = {
      "query": [{"_kp_job_id": "603142"}]
    }
    console.log('Query Body:', JSON.stringify(queryBody, null, 2))
    
    const queryHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    console.log('Query Headers:', queryHeaders)
    
    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: queryHeaders,
      body: JSON.stringify(queryBody)
    })
    
    console.log('Query Response Status:', queryResponse.status)
    console.log('Query Response Headers:', Object.fromEntries(queryResponse.headers.entries()))
    
    if (!queryResponse.ok) {
      const errorText = await queryResponse.text()
      console.log('❌ Query failed:', errorText)
      
      return NextResponse.json({
        success: false,
        step: 'query',
        authentication: {
          success: true,
          token: `${token.substring(0, 10)}...`,
          fullToken: token
        },
        query: {
          success: false,
          status: queryResponse.status,
          error: errorText,
          url: queryUrl,
          headers: queryHeaders,
          body: queryBody
        }
      }, { status: 500 })
    }
    
    const queryData = await queryResponse.json()
    console.log('✅ Query successful!')
    console.log('Query response:', JSON.stringify(queryData, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Both authentication and query successful!',
      authentication: {
        success: true,
        status: authResponse.status,
        token: `${token.substring(0, 10)}...`
      },
      query: {
        success: true,
        status: queryResponse.status,
        foundRecords: queryData.response?.dataInfo?.foundCount || 0,
        data: queryData.response?.data || []
      },
      comparison: {
        message: 'This test exactly replicates your successful Postman requests',
        postmanWorked: true,
        nextjsWorked: true
      }
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Test failed with exception',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST() {
  // Test with different timing
  console.log('🧪 Testing IMMEDIATE token usage (no delay)...')
  
  const config = {
    baseUrl: 'https://modd.mainspringhost.com',
    database: 'PEP2_1',
    layout: 'jobs_api',
    username: 'trevor_api',
    password: 'XcScS2yRoTtMo7'
  }
  
  try {
    // Authentication
    const authUrl = `${config.baseUrl}/fmi/data/vLatest/databases/${config.database}/sessions`
    const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64')
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    })
    
    const authData = await authResponse.json()
    const token = authData.response?.token
    
    // Immediate query (no delay)
    const queryUrl = `${config.baseUrl}/fmi/data/vLatest/databases/${config.database}/layouts/${config.layout}/_find`
    const queryBody = { "query": [{"_kp_job_id": "*"}], "limit": 1 }
    
    console.log('Using token IMMEDIATELY after auth...')
    const immediateStart = Date.now()
    
    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryBody)
    })
    
    const immediateTime = Date.now() - immediateStart
    console.log(`Immediate query time: ${immediateTime}ms`)
    
    if (queryResponse.ok) {
      const queryData = await queryResponse.json()
      return NextResponse.json({
        success: true,
        message: 'IMMEDIATE token usage works!',
        timing: `${immediateTime}ms`,
        foundRecords: queryData.response?.dataInfo?.foundCount || 0
      })
    } else {
      const errorText = await queryResponse.text()
      return NextResponse.json({
        success: false,
        message: 'IMMEDIATE token usage failed',
        timing: `${immediateTime}ms`,
        error: errorText,
        status: queryResponse.status
      }, { status: 500 })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
