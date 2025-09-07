// Schedule Hygiene Analysis API
import { NextResponse } from 'next/server'

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

  const data = await response.json()
  return data.response.token
}

export async function GET() {
  try {
    console.log('🔍 Analyzing FileMaker schedule hygiene...')
    
    const token = await getFileMakerAuth()
    
    // Get sample records to analyze available fields
    const findUrl = 'https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/layouts/jobs_api/_find'
    
    const response = await fetch(findUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: [{ "_kp_job_id": "*" }],
        limit: 20
      })
    })

    const data = await response.json()
    
    if (!data.response.data || data.response.data.length === 0) {
      throw new Error('No job data found')
    }

    // Analyze all available fields
    const sampleRecord = data.response.data[0]
    const allFields = Object.keys(sampleRecord.fieldData)
    
    // Categorize fields for schedule hygiene
    const fieldAnalysis = {
      scheduling: allFields.filter(f => {
        const fl = f.toLowerCase()
        return fl.includes('date') || fl.includes('time') || fl.includes('arrive') || 
               fl.includes('complete') || fl.includes('schedule') || fl.includes('start') ||
               fl.includes('finish') || fl.includes('actual') || fl.includes('estimated')
      }),
      status: allFields.filter(f => {
        const fl = f.toLowerCase()
        return fl.includes('status') || fl.includes('disposition')
      }),
      identification: allFields.filter(f => {
        const fl = f.toLowerCase()
        return fl.includes('id') || fl.includes('_kp_') || fl.includes('_kf_')
      }),
      vehicle: allFields.filter(f => {
        const fl = f.toLowerCase()
        return fl.includes('truck') || fl.includes('vehicle') || fl.includes('driver')
      })
    }
    
    // Sample data for first few jobs
    const sampleJobs = data.response.data.slice(0, 5).map(job => ({
      jobId: job.fieldData._kp_job_id,
      data: job.fieldData
    }))
    
    // Define complete statuses
    const completeStatuses = ['Complete', 'Re-scheduled', 'Attempted', 'Canceled', 'Done']
    
    // Look for schedule hygiene issues in sample data
    const hygieneIssues = []
    
    sampleJobs.forEach(job => {
      const status = job.data.job_status
      const hasTimeFields = fieldAnalysis.scheduling.some(field => job.data[field])
      
      if (hasTimeFields && status && !completeStatuses.includes(status)) {
        hygieneIssues.push({
          jobId: job.jobId,
          status: status,
          issue: 'Has time data but status not complete',
          timeFields: fieldAnalysis.scheduling.filter(field => job.data[field])
        })
      }
    })
    
    return NextResponse.json({
      success: true,
      analysis: {
        totalFields: allFields.length,
        totalRecords: data.response.dataInfo.totalRecordCount,
        fieldCategories: fieldAnalysis,
        allFields: allFields.sort()
      },
      scheduleHygiene: {
        completeStatuses,
        hygieneIssues,
        recommendedChecks: [
          'Jobs with arrive times but status still Active/Pending',
          'Jobs with complete times but status not updated to Complete',
          'Jobs past scheduled date without completion status',
          'Jobs assigned to trucks but no arrival recorded'
        ]
      },
      sampleData: sampleJobs.map(job => ({
        jobId: job.jobId,
        relevantFields: Object.fromEntries(
          [...fieldAnalysis.scheduling, ...fieldAnalysis.status]
            .filter(field => job.data[field])
            .map(field => [field, job.data[field]])
        )
      })),
      queryStrategies: {
        incompleteWithTimes: {
          description: 'Find jobs with time data but incomplete status',
          query: {
            "job_status": "!=Complete",
            "job_status": "!=Done"
          }
        },
        pastDueActive: {
          description: 'Find active jobs past their scheduled date',
          query: {
            "job_status": "Active",
            "job_date": `<${new Date().toISOString().split('T')[0]}`
          }
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Schedule hygiene analysis error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze schedule hygiene',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}