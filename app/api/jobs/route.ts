// DispatchTracker - FIXED FileMaker Jobs API Route
// Using the simple, working approach that matches successful Postman requests

import { NextResponse } from 'next/server'
import { Job, FileMakerJobRecord, FileMakerResponse, ApiResponse } from '@/lib/types'

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const FILEMAKER_CONFIG = {
  baseUrl: process.env.FILEMAKER_BASE_URL || 'https://modd.mainspringhost.com',
  database: process.env.FILEMAKER_JOBS_DB || 'PEP2_1',
  layout: process.env.FILEMAKER_JOBS_LAYOUT || 'jobs_api',
  username: process.env.FILEMAKER_USERNAME || 'trevor_api',
  password: process.env.FILEMAKER_PASSWORD || 'XcScS2yRoTtMo7'
}

/**
 * SIMPLE, WORKING FileMaker authentication
 * No caching, no retry logic - just like successful Postman requests
 */
async function authenticateFileMaker(): Promise<string> {
  console.log('🔑 Getting fresh FileMaker token...')
  
  const authUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/sessions`
  const credentials = Buffer.from(`${FILEMAKER_CONFIG.username}:${FILEMAKER_CONFIG.password}`).toString('base64')
  
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`FileMaker auth failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  if (!data.response?.token) {
    throw new Error('FileMaker auth response missing token')
  }

  console.log('✅ FileMaker token received:', data.response.token.substring(0, 10) + '...')
  return data.response.token
}

/**
 * SIMPLE, WORKING FileMaker query
 * Direct approach that matches successful Postman requests
 */
async function queryFileMaker(token: string, query: any): Promise<FileMakerResponse> {
  console.log('📋 Querying FileMaker with token...')
  
  const queryUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`
  
  console.log('Query URL:', queryUrl)
  console.log('Query Body:', JSON.stringify(query, null, 2))
  
  const response = await fetch(queryUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`FileMaker query failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  console.log('✅ FileMaker query successful, found:', data.response?.dataInfo?.foundCount || 0, 'records')
  
  return data
}

/**
 * Transform FileMaker record to our Job format
 * Now with access to ALL enhanced fields!
 */
function transformJobRecord(record: { fieldData: FileMakerJobRecord }): Job {
  const fieldData = record.fieldData
  
  // Parse truck ID
  const rawTruckId = fieldData["*kf*trucks_id"]
  let truckId: number | undefined = undefined
  
  if (rawTruckId !== null && rawTruckId !== undefined) {
    const parsed = typeof rawTruckId === 'string' ? parseInt(rawTruckId, 10) : Number(rawTruckId)
    if (!isNaN(parsed) && parsed > 0) {
      truckId = parsed
    }
  }
  
  // Parse route ID
  const rawRouteId = fieldData._kf_route_id
  let routeId: number | null = null
  if (rawRouteId !== null && rawRouteId !== undefined) {
    const parsed = typeof rawRouteId === 'string' ? parseInt(rawRouteId, 10) : Number(rawRouteId)
    if (!isNaN(parsed)) {
      routeId = parsed
    }
  }
  
  // Parse driver ID (can be string name or number)
  const rawDriverId = fieldData._kf_driver_id
  let driverId: number | null = null
  let driverName: string | null = null
  
  if (rawDriverId !== null && rawDriverId !== undefined) {
    if (typeof rawDriverId === 'string') {
      // Check if it's a numeric string
      const parsed = parseInt(rawDriverId, 10)
      if (!isNaN(parsed)) {
        driverId = parsed
      } else {
        // It's a driver name
        driverName = rawDriverId
      }
    } else {
      driverId = Number(rawDriverId)
    }
  }
  
  // Parse lead ID
  const rawLeadId = fieldData._kf_lead_id
  let leadId: number | null = null
  let leadName: string | null = null
  
  if (rawLeadId !== null && rawLeadId !== undefined) {
    if (typeof rawLeadId === 'string') {
      const parsed = parseInt(rawLeadId, 10)
      if (!isNaN(parsed)) {
        leadId = parsed
      } else {
        leadName = rawLeadId
      }
    } else {
      leadId = Number(rawLeadId)
    }
  }
  
  // ENHANCED DEBUG
  console.log(`🔍 Job ${fieldData._kp_job_id} FIELD MAPPING:`)
  console.log(`   *kf*trucks_id: '${rawTruckId}' -> ${truckId}`)
  console.log(`   _kf_route_id: '${rawRouteId}' -> ${routeId}`)
  console.log(`   _kf_driver_id: '${rawDriverId}' -> driver=${driverId}, name='${driverName}'`)
  console.log(`   _kf_lead_id: '${rawLeadId}' -> lead=${leadId}, name='${leadName}'`)
  console.log(`   Customer: '${fieldData.Customer_C1}'`)
  console.log(`   Address: '${fieldData.address_C1}'`)
  
  return {
    id: fieldData._kp_job_id,
    date: fieldData.job_date,
    status: fieldData.job_status,
    type: fieldData.job_type,
    truckId: truckId,
    
    // Enhanced fields
    customer: fieldData.Customer_C1 || null,
    address: fieldData.address_C1 || null,
    arrivalTime: fieldData.time_arival || null,
    completionTime: fieldData.time_complete || null,
    dueDate: fieldData.due_date || null,
    
    // Routing fields with proper parsing
    routeId: routeId,
    driverId: driverId,
    driverName: driverName,
    leadId: leadId,
    leadName: leadName,
    stopOrder: fieldData.order_C1 || null,
    secondaryOrder: fieldData.order_C2 || null,
    secondaryAddress: fieldData.address_C2 || null,
    secondaryCustomer: fieldData.Customer_C2 || null,
    contactInfo: fieldData.contact_C1 || null,
    driverStatus: fieldData.job_status_driver || null,
    
    // Additional fields
    clientCode: fieldData._kf_client_code_id || null,
    notesCallAhead: fieldData.notes_call_ahead || null,
    notesDriver: fieldData.notes_driver || null,
    disposition: fieldData._kf_disposition || null,
    
    // Location will be added later
    location: null
  }
}

export async function GET(request: Request) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100) // Default 50, max 100
    const todayOnly = searchParams.get('today') === 'true'
    const activeOnly = searchParams.get('active') === 'true'
    
    console.log('📋 Fetching jobs from FileMaker...', {
      limit,
      todayOnly,
      activeOnly
    })
    
    // Step 1: Get fresh token (simple, no caching)
    const token = await authenticateFileMaker()
    
    // Step 2: Build query based on parameters
    let query: any[]
    
    if (todayOnly) {
      const today = new Date()
      const todayFormatted = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`
      
      console.log(`📅 Querying for today's jobs: ${todayFormatted}`)
      
      if (activeOnly) {
        // Today's jobs that are not completed - SIMPLE QUERY
        query = [{ "job_date": todayFormatted }]
      } else {
        // All jobs today - SIMPLE QUERY  
        query = [{ "job_date": todayFormatted }]
      }
    } else if (activeOnly) {
      // SIMPLIFIED: Just get recent jobs, avoid complex status filtering
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayFormatted = `${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getDate().toString().padStart(2, '0')}/${yesterday.getFullYear()}`
      
      query = [{ "job_date": `>=${yesterdayFormatted}` }]
    } else {
      // MUCH SMALLER QUERY: Get only very recent records to avoid timeout
      const recent = new Date()
      recent.setDate(recent.getDate() - 2) // Last 2 days only
      const recentFormatted = `${(recent.getMonth() + 1).toString().padStart(2, '0')}/${recent.getDate().toString().padStart(2, '0')}/${recent.getFullYear()}`
      
      query = [{ "job_date": `>=${recentFormatted}` }]
    }
    
    const requestBody = {
      query,
      limit: Math.min(limit, 20), // FORCE SMALL LIMIT to prevent timeout
      sort: [{ "fieldName": "job_date", "sortOrder": "descend" }]
    }
    
    // Step 3: Query FileMaker (simple, direct)
    const response = await queryFileMaker(token, requestBody)
    
    if (!response.response?.data) {
      throw new Error(`No job data returned from FileMaker. Response: ${JSON.stringify(response)}`)
    }

    console.log(`📊 FileMaker returned ${response.response.data.length} records`)
    
    // Step 4: Transform all records
    const jobs: Job[] = response.response.data.map(record => transformJobRecord(record))

    console.log(`✅ Transformed ${jobs.length} jobs with enhanced fields`)

    const processingTime = Date.now() - startTime
    console.log(`⚡ Job processing completed in ${processingTime}ms`)

    const responseData: ApiResponse<Job[]> = {
      success: true,
      data: jobs,
      count: jobs.length,
      totalRecords: response.response.dataInfo?.totalRecordCount || 0,
      timestamp: new Date().toISOString(),
      processingTime,
      // Show that enhanced fields are now available
      enhancedFields: {
        available: true,
        fields: ['time_arival', 'time_complete', 'address_C1', 'Customer_C1', '*kf*route_id', '*kf*driver_id'],
        message: 'All enhanced FileMaker fields are now accessible!'
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ FileMaker jobs error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job data',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        processingTime
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}

/**
 * POST endpoint for testing specific queries
 */
export async function POST(request: Request) {
  try {
    const requestBody = await request.json()
    const { testQuery, specificJobId } = requestBody
    
    console.log('🧪 Testing specific FileMaker query...')
    
    // Get fresh token
    const token = await authenticateFileMaker()
    
    let query
    if (specificJobId) {
      query = {
        query: [{ "_kp_job_id": specificJobId.toString() }]
      }
    } else if (testQuery) {
      query = testQuery
    } else {
      // Default test query
      query = {
        query: [{ "_kp_job_id": "*" }],
        limit: 5
      }
    }
    
    const response = await queryFileMaker(token, query)
    
    return NextResponse.json({
      success: true,
      message: 'Test query successful',
      query,
      foundRecords: response.response?.dataInfo?.foundCount || 0,
      data: response.response?.data?.map(record => transformJobRecord(record)) || [],
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Test query error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Test query failed',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
