// DispatchTracker Debug API
// Add this to your Next.js app to diagnose the real API data

import { NextResponse } from 'next/server'

interface SamsaraTestResult {
  success: boolean;
  vehicleCount?: number;
  sampleVehicleNames?: string[];
  extractedNumbers?: (number | null)[];
  error?: string;
}

interface FilemakerTestResult {
  success: boolean;
  totalJobs?: number;
  jobsWithTruckIds?: number;
  sampleTruckIds?: any[];
  truckIdTypes?: string[];
  jobSample?: any[];
  error?: string;
}

interface CorrelationTestResult {
  vehicleNumbers: number[];
  truckIds: number[];
  potentialMatches: number[];
  matchCount: number;
  diagnosis: string;
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: {
    timestamp: string;
    samsaraTest: SamsaraTestResult | null;
    filemakerTest: FilemakerTestResult | null;
    correlationTest: CorrelationTestResult | null;
  } = {
    timestamp: new Date().toISOString(),
    samsaraTest: null,
    filemakerTest: null,
    correlationTest: null
  }
  
  try {
    // Test 1: Check Samsara vehicle names
    console.log('🔍 Testing Samsara API...')
    
    const samsaraResponse = await fetch('https://api.samsara.com/fleet/vehicles/stats?types=gps', {
      headers: {
        'Authorization': `Bearer ${process.env.SAMSARA_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    })
    
    if (samsaraResponse.ok) {
      const samsaraData = await samsaraResponse.json()
      const vehicles = samsaraData.data || []
      
      results.samsaraTest = {
        success: true,
        vehicleCount: vehicles.length,
        sampleVehicleNames: vehicles.slice(0, 5).map((v: any) => v.name),
        extractedNumbers: vehicles.slice(0, 5).map((v: any) => {
          const name = v.name
          // Test extraction
          const patterns = [
            /^TRUCK\s+(\d+)$/i,
            /^(\d+)$/,
            /^V(\d+)$/i,
            /^OR\s+(\d+)$/i
          ]

          for (const pattern of patterns) {
            const match = name?.match(pattern)
            if (match) {
              const num = parseInt(match[1] || match[0], 10)
              if (!isNaN(num) && num > 0) return num
            }
          }
          return null
        })
      }
    } else {
      results.samsaraTest = {
        success: false,
        error: `HTTP ${samsaraResponse.status}`
      }
    }
    
  } catch (error) {
    results.samsaraTest = {
      success: false,
      error: (error as Error).message
    }
  }
  
  try {
    // Test 2: Check FileMaker truck assignments
    console.log('🔍 Testing FileMaker API...')
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
    const jobsResponse = await fetch(`${baseUrl}/api/jobs?limit=10`, {
      signal: AbortSignal.timeout(15000)
    })
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json()
      const jobs = jobsData.data || []
      
      const jobsWithTrucks = jobs.filter((job: any) => job.truckId !== null && job.truckId !== undefined && job.truckId !== '')
      const truckIds = jobsWithTrucks.map((job: any) => job.truckId)

      results.filemakerTest = {
        success: true,
        totalJobs: jobs.length,
        jobsWithTruckIds: jobsWithTrucks.length,
        sampleTruckIds: truckIds.slice(0, 5),
        truckIdTypes: truckIds.slice(0, 5).map((id: any) => typeof id),
        jobSample: jobs.slice(0, 3).map((job: any) => ({
          id: job.id,
          truckId: job.truckId,
          customer: job.customer,
          status: job.status
        }))
      }
    } else {
      results.filemakerTest = {
        success: false,
        error: `HTTP ${jobsResponse.status}`
      }
    }
    
  } catch (error) {
    results.filemakerTest = {
      success: false,
      error: (error as Error).message
    }
  }
  
  // Test 3: Correlation analysis
  if (results.samsaraTest?.success && results.filemakerTest?.success) {
    const vehicleNumbers = results.samsaraTest.extractedNumbers?.filter((n: number | null) => n !== null) || []
    const truckIds = results.filemakerTest.sampleTruckIds?.map((id: any) =>
      typeof id === 'number' ? id : parseInt(id?.toString() || '0', 10)
    ).filter((id: number) => !isNaN(id) && id > 0) || []
    
    const matches = vehicleNumbers.filter(vNum => truckIds.includes(vNum))
    
    results.correlationTest = {
      vehicleNumbers: vehicleNumbers,
      truckIds: truckIds,
      potentialMatches: matches,
      matchCount: matches.length,
      diagnosis: matches.length === 0 ?
        'NO MATCHES: Vehicle numbers and truck IDs don\'t overlap' :
        `${matches.length} potential matches found`
    }
  }
  
  return NextResponse.json({
    success: true,
    message: 'DispatchTracker API Diagnostics',
    results,
    recommendations: {
      samsara: results.samsaraTest?.success ? 
        'Samsara API working - check vehicle name patterns' :
        'Fix Samsara API connection first',
      filemaker: results.filemakerTest?.success ?
        `${results.filemakerTest.jobsWithTruckIds} of ${results.filemakerTest.totalJobs} jobs have truck assignments` :
        'Fix FileMaker API connection first',
      correlation: (results.correlationTest?.matchCount || 0) > 0 ?
        'Vehicle-job correlation should work with current data' :
        'No overlap between vehicle numbers and job truck IDs - check data consistency'
    }
  })
}
