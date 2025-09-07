// FileMaker Jobs API Route
import { NextResponse } from 'next/server'

interface Job {
  id: number
  date: string
  status: string
  type: string
  location: {
    lat: number
    lng: number
    address: string
  } | null
  truckId?: number
  clientCode?: string
  notes?: string
}

const FILEMAKER_CONFIG = {
  baseUrl: 'https://modd.mainspringhost.com/fmi/data/vLatest',
  database: 'PEP2_1',
  username: 'trevor_api',
  password: process.env.FILEMAKER_PASSWORD || 'XcScS2yRoTtMo7'
}

async function getAuthToken(): Promise<string> {
  const authUrl = `${FILEMAKER_CONFIG.baseUrl}/databases/${FILEMAKER_CONFIG.database}/sessions`
  const credentials = Buffer.from(`${FILEMAKER_CONFIG.username}:${FILEMAKER_CONFIG.password}`).toString('base64')
  
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`FileMaker auth failed: ${response.status}`)
  }

  const data = await response.json()
  return data.response.token
}

async function queryJobs(limit = 50): Promise<any> {
  const token = await getAuthToken()
  
  const findUrl = `${FILEMAKER_CONFIG.baseUrl}/databases/${FILEMAKER_CONFIG.database}/layouts/jobs_api/_find`
  
  const response = await fetch(findUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: [{ "_kp_job_id": "*" }],
      limit
    })
  })

  if (!response.ok) {
    throw new Error(`FileMaker query failed: ${response.status}`)
  }

  return await response.json()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const activeOnly = searchParams.get('active') === 'true'
    
    console.log('📋 Fetching jobs from FileMaker...')
    
    const response = await queryJobs(limit)
    
    if (!response.response.data) {
      throw new Error('No job data returned')
    }
    
    // Transform FileMaker records to our format
    const jobs: Job[] = response.response.data
      .map((record: any) => {
        const fieldData = record.fieldData
        
        // Filter for active jobs if requested
        if (activeOnly && fieldData.job_status?.toLowerCase() !== 'active') {
          return null
        }
        
        return {
          id: fieldData._kp_job_id,
          date: fieldData.job_date,
          status: fieldData.job_status,
          type: fieldData.job_type,
          location: null, // Jobs don't have GPS coordinates in FileMaker
          truckId: fieldData['*kf*trucks_id'],
          clientCode: fieldData['*kf*client_code_id'],
          notes: fieldData.notes_call_ahead || fieldData.notes_driver
        }
      })
      .filter(Boolean)

    console.log(`✅ Loaded ${jobs.length} jobs`)
    
    return NextResponse.json({
      success: true,
      data: jobs,
      count: jobs.length,
      totalRecords: response.response.dataInfo?.totalRecordCount || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ FileMaker jobs error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}