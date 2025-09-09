// FileMaker Schema Discovery API
import { NextResponse } from 'next/server'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function getFileMakerAuth() {
  const authUrl = 'https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/sessions'
  const credentials = Buffer.from(`trevor_api:${process.env.FILEMAKER_PASSWORD}`).toString('base64')
  
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Auth failed: ${response.status}`)
  }

  const data: any = await response.json()
  return data.response.token
}

export async function GET() {
  try {
    console.log('🔍 Discovering FileMaker job fields...')
    
    const token = await getFileMakerAuth()
    
    // Get detailed job records to examine all available fields
    const findUrl = 'https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/layouts/jobs_api/_find'
    
    const response = await fetch(findUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: [{ "_kp_job_id": "*" }],
        limit: 10 // Small sample to examine fields
      })
    })

    if (!response.ok) {
      throw new Error(`Query failed: ${response.status}`)
    }

    const data: any = await response.json()
    
    if (!data.response.data || data.response.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No job data found'
      })
    }

    // Analyze all available fields
    const sampleRecord = data.response.data[0]
    const allFields = Object.keys(sampleRecord.fieldData)
    
    // Categorize fields by type
    const fieldCategories: {
      identification: string[]
      scheduling: string[]
      status: string[]
      location: string[]
      vehicle: string[]
      customer: string[]
      notes: string[]
      other: string[]
    } = {
      identification: [],
      scheduling: [],
      status: [],
      location: [],
      vehicle: [],
      customer: [],
      notes: [],
      other: []
    }
    
    allFields.forEach((field: string) => {
      const fieldLower = field.toLowerCase()
      
      if (fieldLower.includes('id') || fieldLower.includes('_kp_') || fieldLower.includes('_kf_')) {
        fieldCategories.identification.push(field)
      } else if (fieldLower.includes('date') || fieldLower.includes('time') || fieldLower.includes('arrive') || fieldLower.includes('complete') || fieldLower.includes('schedule')) {
        fieldCategories.scheduling.push(field)
      } else if (fieldLower.includes('status') || fieldLower.includes('disposition')) {
        fieldCategories.status.push(field)
      } else if (fieldLower.includes('address') || fieldLower.includes('location') || fieldLower.includes('lat') || fieldLower.includes('lng')) {
        fieldCategories.location.push(field)
      } else if (fieldLower.includes('truck') || fieldLower.includes('vehicle') || fieldLower.includes('driver')) {
        fieldCategories.vehicle.push(field)
      } else if (fieldLower.includes('client') || fieldLower.includes('customer')) {
        fieldCategories.customer.push(field)
      } else if (fieldLower.includes('note') || fieldLower.includes('comment')) {
        fieldCategories.notes.push(field)
      } else {
        fieldCategories.other.push(field)
      }
    })
    
    // Get sample data for scheduling fields
    const sampleData = data.response.data.slice(0, 3).map((record: { fieldData: Record<string, any> }) => {
      const schedulingData: any = { jobId: record.fieldData._kp_job_id }
      
      fieldCategories.scheduling.forEach((field: string) => {
        schedulingData[field] = record.fieldData[field]
      })
      
      fieldCategories.status.forEach((field: string) => {
        schedulingData[field] = record.fieldData[field]
      })
      
      return schedulingData
    })
    
    // Check for potential schedule hygiene issues
    const scheduleHygieneFields = allFields.filter((field: string) => {
      const fieldLower = field.toLowerCase()
      return fieldLower.includes('arrive') || 
             fieldLower.includes('complete') || 
             fieldLower.includes('start') ||
             fieldLower.includes('finish') ||
             fieldLower.includes('actual') ||
             fieldLower.includes('estimated')
    })
    
    return NextResponse.json({
      success: true,
      schema: {
        totalFields: allFields.length,
        categories: fieldCategories,
        scheduleHygieneFields,
        allFields
      },
      sampleData,
      metadata: {
        totalRecords: data.response.dataInfo.totalRecordCount,
        database: data.response.dataInfo.database,
        layout: data.response.dataInfo.layout
      },
      completeStatuses: ['Complete', 'Re-scheduled', 'Attempted', 'Canceled', 'Done'],
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ FileMaker schema discovery error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to discover FileMaker schema',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}