// Debug tracking endpoint - logs correlation details to console
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('\n🔍 DEBUGGING CORRELATION ISSUE')
    console.log('=' * 50)
    
    // Step 1: Test jobs API directly
    console.log('\n1️⃣ Testing Jobs API:')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
    const jobsResponse = await fetch(`${baseUrl}/api/jobs?active=true&limit=10`, {
      headers: { 'Cache-Control': 'no-cache' }
    })
    
    if (!jobsResponse.ok) {
      const errorText = await jobsResponse.text()
      console.log(`❌ Jobs API failed: ${jobsResponse.status} - ${errorText}`)
      return NextResponse.json({ 
        error: 'Jobs API failed', 
        details: errorText,
        status: jobsResponse.status 
      }, { status: 500 })
    }
    
    const jobsData = await jobsResponse.json()
    console.log(`✅ Jobs API success: ${jobsData.data?.length || 0} jobs retrieved`)
    
    if (!jobsData.success || !jobsData.data) {
      console.log('❌ Jobs data missing or invalid')
      return NextResponse.json({ 
        error: 'No jobs data', 
        jobsResponse: jobsData 
      }, { status: 500 })
    }
    
    // Step 2: Analyze job truck assignments
    console.log('\n2️⃣ Analyzing Job Truck Assignments:')
    const jobs = jobsData.data
    const jobsWithTrucks = jobs.filter(job => job.truckId)
    
    console.log(`Total jobs: ${jobs.length}`)
    console.log(`Jobs with truckId: ${jobsWithTrucks.length}`)
    
    if (jobsWithTrucks.length === 0) {
      console.log('❌ PROBLEM FOUND: No jobs have truckId field populated!')
      console.log('\nFirst 3 jobs structure:')
      jobs.slice(0, 3).forEach((job, i) => {
        console.log(`Job ${i + 1}:`, {
          id: job.id,
          truckId: job.truckId,
          customer: job.customer,
          status: job.status,
          routeId: job.routeId,
          driverId: job.driverId
        })
      })
    } else {
      console.log('✅ Jobs have truck assignments')
      console.log('\nJobs with trucks:')
      jobsWithTrucks.slice(0, 5).forEach((job, i) => {
        console.log(`  ${i + 1}. Job ${job.id}: truckId="${job.truckId}", customer="${job.customer}"`)
      })
      
      const truckIds = [...new Set(jobsWithTrucks.map(job => job.truckId))].sort()
      console.log(`\nUnique truck IDs: [${truckIds.join(', ')}]`)
    }
    
    // Step 3: Test vehicle name extraction
    console.log('\n3️⃣ Testing Vehicle Name Extraction:')
    const sampleVehicleNames = [
      "Truck 96", "Truck 66", "TRUCK 81", "TRUCK 85", "TRUCK 74", 
      "V7", "V9", "OR 70", "901", "903", "truck 705"
    ]
    
    sampleVehicleNames.forEach(name => {
      const extractedNumber = extractVehicleNumber(name)
      console.log(`  "${name}" -> ${extractedNumber || 'FAILED'}`)
    })
    
    // Step 4: Test matching
    if (jobsWithTrucks.length > 0) {
      console.log('\n4️⃣ Testing Vehicle-Job Matching:')
      const truckIds = [...new Set(jobsWithTrucks.map(job => job.truckId))]
      
      sampleVehicleNames.forEach(name => {
        const extractedNumber = extractVehicleNumber(name)
        if (extractedNumber) {
          const hasJobs = truckIds.includes(extractedNumber.toString())
          console.log(`  "${name}" (${extractedNumber}) -> ${hasJobs ? '✅ HAS JOBS' : '❌ No jobs'}`)
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        totalJobs: jobs.length,
        jobsWithTrucks: jobsWithTrucks.length,
        truckIds: jobsWithTrucks.length > 0 ? [...new Set(jobsWithTrucks.map(job => job.truckId))].sort() : [],
        sampleJobs: jobs.slice(0, 3).map(job => ({
          id: job.id,
          truckId: job.truckId,
          customer: job.customer,
          status: job.status
        })),
        vehicleExtractionTest: sampleVehicleNames.map(name => ({
          name,
          extracted: extractVehicleNumber(name)
        }))
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Enhanced vehicle number extraction function
function extractVehicleNumber(vehicleName: string): number | null {
  if (!vehicleName) return null
  
  const clean = vehicleName.trim().toUpperCase()
  
  // Enhanced patterns in order of specificity
  const patterns = [
    { pattern: /^TRUCK\s+(\d+)$/i, desc: 'TRUCK ##' },
    { pattern: /^(\d+)$/, desc: 'Pure number' },
    { pattern: /^V(\d+)$/i, desc: 'V##' },
    { pattern: /^OR\s+(\d+)$/i, desc: 'OR ##' },
    { pattern: /^TRUCK\s+(\d+)\b/i, desc: 'TRUCK ## (with suffix)' },
    { pattern: /(\d{2,3})/, desc: '2-3 digit number anywhere' },
    { pattern: /(\d+)/, desc: 'Any number' }
  ]
  
  for (const { pattern } of patterns) {
    const match = clean.match(pattern)
    if (match) {
      const number = parseInt(match[1] || match[0], 10)
      if (!isNaN(number) && number > 0 && number < 10000) {
        return number
      }
    }
  }
  
  return null
}
