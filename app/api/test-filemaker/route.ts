// Simple FileMaker connectivity test
import { NextResponse } from 'next/server'

const FILEMAKER_CONFIG = {
  baseUrl: process.env.FILEMAKER_BASE_URL || 'https://modd.mainspringhost.com',
  database: process.env.FILEMAKER_JOBS_DB || 'PEP2_1',
  layout: process.env.FILEMAKER_JOBS_LAYOUT || 'jobs_api',
  username: process.env.FILEMAKER_USERNAME || 'trevor_api',
  password: process.env.FILEMAKER_PASSWORD || 'XcScS2yRoTtMo7'
}

export async function GET() {
  const startTime = Date.now()
  
  try {
    console.log('🧪 Testing FileMaker connectivity...')
    
    // Step 1: Test authentication
    console.log('Step 1: Testing authentication...')
    const authUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/sessions`
    const credentials = Buffer.from(`${FILEMAKER_CONFIG.username}:${FILEMAKER_CONFIG.password}`).toString('base64')
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    console.log(`Auth response status: ${authResponse.status}`)
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      return NextResponse.json({
        success: false,
        step: 'authentication',
        error: `Auth failed: ${authResponse.status}`,
        details: errorText,
        config: {
          baseUrl: FILEMAKER_CONFIG.baseUrl,
          database: FILEMAKER_CONFIG.database,
          username: FILEMAKER_CONFIG.username
        },
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    const authData = await authResponse.json()
    const token = authData.response?.token
    
    if (!token) {
      return NextResponse.json({
        success: false,
        step: 'authentication',
        error: 'No token in auth response',
        authResponse: authData,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }
    
    console.log('✅ Authentication successful, token received')
    
    // Step 2: Test simple query
    console.log('Step 2: Testing simple query...')
    const findUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`
    
    const queryResponse = await fetch(findUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: [{ "_kp_job_id": "*" }],
        limit: 1  // Just get 1 record for testing
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    console.log(`Query response status: ${queryResponse.status}`)
    
    if (!queryResponse.ok) {
      const errorText = await queryResponse.text()
      return NextResponse.json({
        success: false,
        step: 'query',
        error: `Query failed: ${queryResponse.status}`,
        details: errorText,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    const queryData = await queryResponse.json()
    
    console.log('✅ Query successful')
    console.log('Query response:', JSON.stringify(queryData, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'FileMaker connectivity test successful',
      steps: [
        { step: 'authentication', status: 'success', token: token ? 'received' : 'missing' },
        { step: 'query', status: 'success', foundCount: queryData.response?.dataInfo?.foundCount }
      ],
      sampleData: queryData.response?.data?.[0] || null,
      config: {
        baseUrl: FILEMAKER_CONFIG.baseUrl,
        database: FILEMAKER_CONFIG.database,
        layout: FILEMAKER_CONFIG.layout
      },
      processingTime: Date.now() - startTime
    })

  } catch (error) {
    console.error('❌ FileMaker test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'FileMaker connectivity test failed',
      details: error instanceof Error ? error.message : String(error),
      config: {
        baseUrl: FILEMAKER_CONFIG.baseUrl,
        database: FILEMAKER_CONFIG.database,
        layout: FILEMAKER_CONFIG.layout
      },
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}
