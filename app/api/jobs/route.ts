// DispatchTracker - Enhanced FileMaker Jobs API Route
// Complete integration with all requested FileMaker fields

import { NextResponse } from 'next/server'
import { Job, FileMakerJobRecord, FileMakerResponse, ApiResponse } from '@/lib/types'
import { geocodeAddress, batchGeocodeAddresses } from '@/lib/geocoding'
import { analyzeFleetScheduleHygiene } from '@/lib/schedule-hygiene'

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
 * Get FileMaker authentication token
 */
async function getAuthToken(): Promise<string> {
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

  return data.response.token
}

/**
 * Query FileMaker for jobs with all enhanced fields - OPTIMIZED FOR TIMEOUTS
 */
async function queryEnhancedJobs(limit = 100, activeOnly = false): Promise<FileMakerResponse> {
  const token = await getAuthToken()
  
  const findUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`
  
  // Production configuration - optimized for reliability
  const safeLimit = Math.min(limit, 50) // Production limit of 50 records
  
  // Simplest possible query
  const query = [{ "_kp_job_id": "*" }]
  
  const response = await fetch(findUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      limit: safeLimit // Production limit
    }),
    // Production timeout - 20 seconds
    signal: AbortSignal.timeout(20000)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`FileMaker query failed: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

/**
 * Transform FileMaker record to our enhanced Job format
 * MVP: Smart geocoding with performance optimization
 */
async function transformJobRecord(record: { fieldData: FileMakerJobRecord }, enableGeocode = false): Promise<Job> {
  const fieldData = record.fieldData
  
  // 🗺️ GEOCODING MVP - Smart address conversion
  let location = null
  if (enableGeocode && fieldData.address_C1) {
    try {
      const geocoded = await geocodeAddress(fieldData.address_C1)
      if (geocoded) {
        location = {
          lat: geocoded.lat,
          lng: geocoded.lng, 
          address: geocoded.address,
          source: 'geocoded' as const
        }
        console.log(`📍 Geocoded: ${fieldData.address_C1} → ${geocoded.lat.toFixed(4)}, ${geocoded.lng.toFixed(4)}`)
      }
    } catch (error) {
      console.warn(`⚠️ Geocoding failed for: ${fieldData.address_C1}`, error)
      // Continue without geocoding rather than failing entire request
    }
  }
  
  return {
    id: fieldData._kp_job_id,
    date: fieldData.job_date,
    status: fieldData.job_status,
    type: fieldData.job_type,
    truckId: fieldData['*kf*trucks_id'],
    
    // ✅ ENHANCED FIELDS FROM FILEMAKER
    customer: fieldData.Customer_C1 || null, // Note: Capital C in Customer_C1
    address: fieldData.address_C1 || null,
    arrivalTime: fieldData.time_arival || null,
    completionTime: fieldData.time_complete || null,
    dueDate: fieldData.due_date || null,
    
    // Geocoded location data (temporarily null)
    location,
    
    // Legacy fields
    clientCode: fieldData['_kf_client_code_id'] || null,
    notesCallAhead: fieldData.notes_call_ahead || null,
    notesDriver: fieldData.notes_driver || null,
    disposition: fieldData._kf_disposition || null
  }
}

export async function GET(request: Request) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500) // Cap at 500
    const activeOnly = searchParams.get('active') === 'true'
    const includeHygiene = searchParams.get('hygiene') === 'true'
    const geocodeAddresses = searchParams.get('geocode') === 'true' // 🗺️ MVP: Opt-in geocoding
    
    console.log('📋 Fetching enhanced jobs from FileMaker...', {
      limit,
      activeOnly,
      includeHygiene,
      geocodeAddresses // 🗺️ MVP: Now controllable via query parameter
    })
    
    // Query FileMaker with enhanced field access
    const response = await queryEnhancedJobs(limit, activeOnly)
    
    if (!response.response?.data) {
      throw new Error('No job data returned from FileMaker')
    }

    console.log(`📊 FileMaker returned ${response.response.data.length} records`)
    
    // 🗺️ GEOCODING MVP - Smart processing strategy
    let jobs: Job[] = []
    
    if (geocodeAddresses) {
      console.log(`🗺️ MVP: Geocoding ${response.response.data.length} addresses...`)
      
      // Batch geocoding with intelligent chunking
      const addresses = response.response.data
        .map(record => record.fieldData.address_C1)
        .filter(addr => addr && addr.trim().length > 0)
      
      console.log(`📍 Found ${addresses.length} addresses to geocode`)
      
      // Transform with geocoding enabled
      jobs = await Promise.all(
        response.response.data.map(record => transformJobRecord(record, true))
      )
      
      const geocodedCount = jobs.filter(job => job.location !== null).length
      console.log(`✅ Successfully geocoded ${geocodedCount}/${addresses.length} addresses`)
      
    } else {
      console.log(`🚀 MVP: Fast mode - skipping geocoding for performance`)
      
      // Transform without geocoding for maximum speed
      jobs = await Promise.all(
        response.response.data.map(record => transformJobRecord(record, false))
      )
    }

    console.log(`✅ Transformed ${jobs.length} jobs with enhanced fields`)

    // Analyze schedule hygiene if requested
    let hygieneAnalysis = null
    if (includeHygiene) {
      console.log('🔍 Analyzing schedule hygiene...')
      hygieneAnalysis = analyzeFleetScheduleHygiene(jobs)
      console.log(`📊 Schedule analysis: ${hygieneAnalysis.summary}`)
    }

    const processingTime = Date.now() - startTime
    console.log(`⚡ Enhanced job processing completed in ${processingTime}ms`)

    const responseData: ApiResponse<Job[]> & { hygiene?: any } = {
      success: true,
      data: jobs,
      count: jobs.length,
      totalRecords: response.response.dataInfo?.totalRecordCount || 0,
      timestamp: new Date().toISOString()
    }

    if (hygieneAnalysis) {
      responseData.hygiene = hygieneAnalysis
    }

    return NextResponse.json(responseData)

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ Enhanced FileMaker jobs error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch enhanced job data',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        processingTime
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}

/**
 * Test endpoint to verify new field access
 */
export async function POST(request: Request) {
  try {
    const requestBody = await request.text()
    console.log('📥 Received POST body:', requestBody)
    
    let parsedBody
    try {
      parsedBody = JSON.parse(requestBody)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : String(parseError),
        receivedBody: requestBody,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }
    
    const { testFieldAccess } = parsedBody
    
    if (!testFieldAccess) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    console.log('🧪 Testing enhanced FileMaker field access...')
    
    // Query single record to test new fields
    const response = await queryEnhancedJobs(1, false)
    
    if (response.response?.data?.[0]) {
      const sampleRecord = response.response.data[0].fieldData
      
      const fieldStatus = {
        original_fields: {
          _kp_job_id: sampleRecord._kp_job_id ? '✅ Available' : '❌ Missing',
          job_date: sampleRecord.job_date ? '✅ Available' : '❌ Missing',
          job_status: sampleRecord.job_status ? '✅ Available' : '❌ Missing',
          job_type: sampleRecord.job_type ? '✅ Available' : '❌ Missing',
          trucks_id: sampleRecord['*kf*trucks_id'] ? '✅ Available' : '❌ Missing'
        },
        enhanced_fields: {
          time_arival: sampleRecord.time_arival !== undefined ? '✅ Available' : '❌ Missing',
          time_complete: sampleRecord.time_complete !== undefined ? '✅ Available' : '❌ Missing',
          address_C1: sampleRecord.address_C1 !== undefined ? '✅ Available' : '❌ Missing',
          due_date: sampleRecord.due_date !== undefined ? '✅ Available' : '❌ Missing',
          Customer_C1: sampleRecord.Customer_C1 !== undefined ? '✅ Available' : '❌ Missing' // Capital C
        },
        sample_data: {
          job_id: sampleRecord._kp_job_id,
          status: sampleRecord.job_status,
          customer: sampleRecord.Customer_C1 || 'N/A', // Capital C
          address: sampleRecord.address_C1 || 'N/A',
          arrival_time: sampleRecord.time_arival || 'N/A',
          completion_time: sampleRecord.time_complete || 'N/A',
          due_date: sampleRecord.due_date || 'N/A'
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Enhanced field access test completed',
        field_status: fieldStatus,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'No sample record available for testing',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

  } catch (error) {
    console.error('❌ Field access test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test field access',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
