// FileMaker API Debug Endpoint - Systematic Issue Isolation
// Created: September 15, 2025
// Purpose: Identify exact cause of error 952 "Invalid FileMaker Data API token"

import { NextResponse } from 'next/server'

const FILEMAKER_CONFIG = {
  baseUrl: 'https://modd.mainspringhost.com',
  database: 'PEP2_1',
  layout: 'jobs_api',
  username: 'trevor_api',
  password: 'XcScS2yRoTtMo7'
}

export async function GET() {
  console.log('🔍 Starting comprehensive FileMaker API debug session...')
  
  const results = {
    timestamp: new Date().toISOString(),
    authentication: null as any,
    queryTests: [] as any[],
    recommendations: [] as string[],
    config: {
      baseUrl: FILEMAKER_CONFIG.baseUrl,
      database: FILEMAKER_CONFIG.database,
      layout: FILEMAKER_CONFIG.layout,
      username: FILEMAKER_CONFIG.username
    }
  }
  
  try {
    // ===============================
    // STEP 1: Authentication Test
    // ===============================
    console.log('\n🔑 STEP 1: Testing Authentication')
    const authUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/sessions`
    console.log('Auth URL:', authUrl)
    
    const credentials = Buffer.from(`${FILEMAKER_CONFIG.username}:${FILEMAKER_CONFIG.password}`).toString('base64')
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Auth Status:', authResponse.status)
    console.log('Auth Headers:', Object.fromEntries(authResponse.headers.entries()))
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      results.authentication = {
        success: false,
        status: authResponse.status,
        error: errorText,
        headers: Object.fromEntries(authResponse.headers.entries())
      }
      console.log('❌ Authentication failed:', errorText)
      return NextResponse.json(results, { status: 500 })
    }
    
    const authData = await authResponse.json()
    const token = authData.response?.token
    
    results.authentication = {
      success: true,
      status: authResponse.status,
      token: token ? 'received' : 'missing',
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'N/A',
      fullResponse: authData
    }
    
    console.log('✅ Authentication successful')
    console.log('Token:', token ? `${token.substring(0, 10)}...` : 'MISSING')
    
    if (!token) {
      results.recommendations.push('Authentication succeeded but no token in response')
      return NextResponse.json(results, { status: 500 })
    }
    
    // ===============================
    // STEP 2: Immediate Query Test (EXACT from example)
    // ===============================
    console.log('\n📋 STEP 2: Testing Immediate Query (Example Format)')
    
    const queryUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`
    
    // Use EXACT format from the FileMaker JSON example
    const exactExampleQuery = {
      query: [{ "_kp_job_id": "603142" }]  // Specific job ID from example
    }
    
    console.log('Query URL:', queryUrl)
    console.log('Query Body:', JSON.stringify(exactExampleQuery, null, 2))
    
    const startTime = Date.now()
    const immediateResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exactExampleQuery),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })
    const responseTime = Date.now() - startTime
    
    console.log('Immediate Query Status:', immediateResponse.status)
    console.log('Response Time:', responseTime, 'ms')
    console.log('Response Headers:', Object.fromEntries(immediateResponse.headers.entries()))
    
    let immediateResult
    if (immediateResponse.ok) {
      immediateResult = await immediateResponse.json()
      console.log('✅ Immediate query successful')
      console.log('Found records:', immediateResult.response?.dataInfo?.foundCount || 0)
    } else {
      const errorText = await immediateResponse.text()
      console.log('❌ Immediate query failed:', errorText)
      immediateResult = { error: errorText, status: immediateResponse.status }
    }
    
    results.queryTests.push({
      test: 'immediate_exact_example',
      success: immediateResponse.ok,
      status: immediateResponse.status,
      responseTime,
      headers: Object.fromEntries(immediateResponse.headers.entries()),
      query: exactExampleQuery,
      response: immediateResult
    })
    
    // ===============================
    // STEP 3: Wildcard Query Test
    // ===============================
    console.log('\n🌟 STEP 3: Testing Wildcard Query')
    
    const wildcardQuery = {
      query: [{ "_kp_job_id": "*" }],
      limit: 1
    }
    
    console.log('Wildcard Query:', JSON.stringify(wildcardQuery, null, 2))
    
    const wildcardStartTime = Date.now()
    const wildcardResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(wildcardQuery),
      signal: AbortSignal.timeout(30000)
    })
    const wildcardResponseTime = Date.now() - wildcardStartTime
    
    console.log('Wildcard Query Status:', wildcardResponse.status)
    console.log('Wildcard Response Time:', wildcardResponseTime, 'ms')
    
    let wildcardResult
    if (wildcardResponse.ok) {
      wildcardResult = await wildcardResponse.json()
      console.log('✅ Wildcard query successful')
      console.log('Found records:', wildcardResult.response?.dataInfo?.foundCount || 0)
    } else {
      const errorText = await wildcardResponse.text()
      console.log('❌ Wildcard query failed:', errorText)
      wildcardResult = { error: errorText, status: wildcardResponse.status }
    }
    
    results.queryTests.push({
      test: 'wildcard_query',
      success: wildcardResponse.ok,
      status: wildcardResponse.status,
      responseTime: wildcardResponseTime,
      query: wildcardQuery,
      response: wildcardResult
    })
    
    // ===============================
    // STEP 4: Simple GET Records Test
    // ===============================
    console.log('\n📄 STEP 4: Testing Simple GET Records')
    
    const getRecordsUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/records?_limit=1`
    
    console.log('GET Records URL:', getRecordsUrl)
    
    const getStartTime = Date.now()
    const getResponse = await fetch(getRecordsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(30000)
    })
    const getResponseTime = Date.now() - getStartTime
    
    console.log('GET Records Status:', getResponse.status)
    console.log('GET Response Time:', getResponseTime, 'ms')
    
    let getResult
    if (getResponse.ok) {
      getResult = await getResponse.json()
      console.log('✅ GET records successful')
      console.log('Found records:', getResult.response?.data?.length || 0)
    } else {
      const errorText = await getResponse.text()
      console.log('❌ GET records failed:', errorText)
      getResult = { error: errorText, status: getResponse.status }
    }
    
    results.queryTests.push({
      test: 'get_records',
      success: getResponse.ok,
      status: getResponse.status,
      responseTime: getResponseTime,
      response: getResult
    })
    
    // ===============================
    // STEP 5: Today's Date Query Test
    // ===============================
    console.log('\n📅 STEP 5: Testing Today\'s Date Query')
    
    const today = new Date()
    const todayFormatted = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`
    
    const dateQuery = {
      query: [{ "job_date": todayFormatted }],
      limit: 3
    }
    
    console.log('Date Query:', JSON.stringify(dateQuery, null, 2))
    console.log('Today formatted:', todayFormatted)
    
    const dateStartTime = Date.now()
    const dateResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dateQuery),
      signal: AbortSignal.timeout(30000)
    })
    const dateResponseTime = Date.now() - dateStartTime
    
    console.log('Date Query Status:', dateResponse.status)
    console.log('Date Response Time:', dateResponseTime, 'ms')
    
    let dateResult
    if (dateResponse.ok) {
      dateResult = await dateResponse.json()
      console.log('✅ Date query successful')
      console.log('Found records:', dateResult.response?.dataInfo?.foundCount || 0)
    } else {
      const errorText = await dateResponse.text()
      console.log('❌ Date query failed:', errorText)
      dateResult = { error: errorText, status: dateResponse.status }
    }
    
    results.queryTests.push({
      test: 'todays_date_query',
      dateUsed: todayFormatted,
      success: dateResponse.ok,
      status: dateResponse.status,
      responseTime: dateResponseTime,
      query: dateQuery,
      response: dateResult
    })
    
    // ===============================
    // ANALYSIS & RECOMMENDATIONS
    // ===============================
    console.log('\n📊 ANALYSIS & RECOMMENDATIONS')
    
    const authWorked = results.authentication.success
    const anyQueryWorked = results.queryTests.some(test => test.success)
    const allQueriesFailed = results.queryTests.every(test => !test.success)
    const getRecordsWorked = results.queryTests.find(test => test.test === 'get_records')?.success
    
    if (authWorked && anyQueryWorked) {
      results.recommendations.push('✅ FileMaker API is working - issue is with specific query format')
      if (getRecordsWorked) {
        results.recommendations.push('✅ GET records works - layout is accessible')
        results.recommendations.push('🔧 Focus on _find endpoint query format')
      }
    } else if (authWorked && getRecordsWorked && allQueriesFailed) {
      results.recommendations.push('🔧 Layout access works via GET but _find queries fail')
      results.recommendations.push('🔧 Check _find query syntax and field names')
    } else if (authWorked && !getRecordsWorked) {
      results.recommendations.push('🔧 Authentication works but layout access fails')
      results.recommendations.push('🔧 Verify layout name "jobs_api" exists and user has permissions')
    } else if (authWorked && allQueriesFailed) {
      results.recommendations.push('🔧 Authentication works but all queries fail - check layout permissions')
      results.recommendations.push('🔧 Verify user has read permissions on jobs_api layout')
    } else if (!authWorked) {
      results.recommendations.push('❌ Authentication failed - check credentials and database name')
    }
    
    // Check for specific error patterns
    const tokenErrors = results.queryTests.filter(test => 
      test.response?.error?.includes('token') || 
      test.response?.error?.includes('952') ||
      test.status === 401 || 
      test.status === 403
    )
    
    if (tokenErrors.length > 0) {
      results.recommendations.push('🔐 Token-related errors detected (Error 952)')
      results.recommendations.push('🔐 Possible causes: token format, expired token, or insufficient permissions')
    }
    
    const timeoutErrors = results.queryTests.filter(test => 
      test.response?.error?.includes('timeout') || 
      test.response?.error?.includes('aborted') ||
      test.responseTime > 25000
    )
    
    if (timeoutErrors.length > 0) {
      results.recommendations.push('⏱️ Timeout errors detected - possible network or server performance issue')
    }
    
    // Check response times
    const avgResponseTime = results.queryTests.reduce((sum, test) => sum + (test.responseTime || 0), 0) / results.queryTests.length
    if (avgResponseTime > 10000) {
      results.recommendations.push(`⚠️ High average response time: ${avgResponseTime.toFixed(0)}ms`)
    }
    
    console.log('\nRecommendations:')
    results.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`)
    })
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('❌ Debug session failed:', error)
    results.recommendations.push(`Critical error: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json(results, { status: 500 })
  }
}
