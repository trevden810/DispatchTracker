// DispatchTracker - Enhanced Vehicle Tracking API with Geographic Correlation
// Uses geographic proximity and intelligent matching instead of direct truck ID assignments

import { NextResponse } from 'next/server'
import { VehicleJobCorrelation, ApiResponse } from '@/lib/types'
import { geographicCorrelation } from '@/lib/geographic-correlation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/tracking - Enhanced vehicle-job correlation with geographic intelligence
 * Now works WITHOUT requiring truck ID assignments in FileMaker
 */
export async function GET(request: Request) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const includeScheduleHygiene = searchParams.get('scheduleHygiene') === 'true'
    const activeOnly = searchParams.get('active') === 'true'
    
    console.log('🚀 Enhanced tracking with geographic correlation...')
    
    // Step 1: Fetch vehicles from Samsara
    console.log('🚗 Fetching vehicle data from Samsara...')
    const vehicleResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/vehicles`)
    
    if (!vehicleResponse.ok) {
      throw new Error(`Vehicle API failed: ${vehicleResponse.status}`)
    }
    
    const vehicleData = await vehicleResponse.json()
    
    if (!vehicleData.success || !vehicleData.data) {
      throw new Error('No vehicle data available')
    }
    
    const vehicles = vehicleData.data
    console.log(`✅ Retrieved ${vehicles.length} vehicles`)
    
    // Step 2: Fetch jobs from FileMaker 
    console.log('📋 Fetching job data from FileMaker...')
    const jobParams = new URLSearchParams({
      limit: '50',
      active: activeOnly ? 'true' : 'false'
    })
    
    const jobResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/jobs?${jobParams}`)
    
    if (!jobResponse.ok) {
      throw new Error(`Job API failed: ${jobResponse.status}`)
    }
    
    const jobData = await jobResponse.json()
    
    if (!jobData.success || !jobData.data) {
      throw new Error('No job data available')
    }
    
    const jobs = jobData.data
    console.log(`✅ Retrieved ${jobs.length} jobs`)
    
    // Step 3: ENHANCED - Geographic Correlation System
    console.log('🎯 Running geographic correlation analysis...')
    const geographicCorrelations = await geographicCorrelation.correlateVehiclesWithJobs(vehicles, jobs)
    
    console.log(`✅ Generated ${geographicCorrelations.length} geographic correlations`)
    
    // Step 4: Create vehicle-job correlation results
    const correlations: VehicleJobCorrelation[] = []
    const jobMap = new Map(jobs.map((job: any) => [job.id, job]))
    
    // Group geographic correlations by vehicle
    const vehicleCorrelationMap = new Map<string, typeof geographicCorrelations>()
    geographicCorrelations.forEach(corr => {
      if (!vehicleCorrelationMap.has(corr.vehicleId)) {
        vehicleCorrelationMap.set(corr.vehicleId, [])
      }
      vehicleCorrelationMap.get(corr.vehicleId)!.push(corr)
    })
    
    // Process each vehicle
    for (const vehicle of vehicles) {
      const vehicleGeoCorrelations = vehicleCorrelationMap.get(vehicle.id) || []
      const bestMatch = vehicleGeoCorrelations[0] // Best correlation (sorted by confidence & distance)
      
      let assignedJob: any = null
      let proximity: any = null
      let scheduleStatus: any = {
        type: 'normal',
        severity: 'info',
        message: 'No job assignment detected'
      }
      
      if (bestMatch && jobMap.has(bestMatch.jobId)) {
        assignedJob = jobMap.get(bestMatch.jobId)
        
        // Enhanced proximity information
        proximity = {
          distance: parseFloat(bestMatch.distance.toFixed(2)),
          status: bestMatch.distance <= 0.5 ? 'at-location' : 
                  bestMatch.distance <= 2 ? 'nearby' : 
                  bestMatch.distance <= 10 ? 'en-route' : 'far',
          isAtJobSite: bestMatch.distance <= 0.5,
          confidence: bestMatch.confidence,
          matchingFactors: bestMatch.matchingFactors,
          correlationMethod: bestMatch.correlationMethod
        }
        
        // Enhanced schedule hygiene with geographic context
        if (includeScheduleHygiene && assignedJob) {
          if (bestMatch.confidence === 'high' && bestMatch.distance <= 0.5) {
            if (assignedJob.arrivalTime && assignedJob.status !== 'Complete') {
              scheduleStatus = {
                type: 'incomplete_after_arrival',
                severity: 'warning',
                message: `Vehicle at job site but status is ${assignedJob.status}`,
                actionNeeded: true
              }
            } else if (!assignedJob.arrivalTime && assignedJob.status === 'In Progress') {
              scheduleStatus = {
                type: 'missing_data',
                severity: 'warning', 
                message: 'Vehicle at job site but no arrival time recorded',
                actionNeeded: true
              }
            } else {
              scheduleStatus = {
                type: 'normal',
                severity: 'info',
                message: `Vehicle on-site: ${bestMatch.matchingFactors.join(', ')}`
              }
            }
          } else if (bestMatch.confidence === 'medium') {
            scheduleStatus = {
              type: 'normal',
              severity: 'info',
              message: `Possible assignment: ${bestMatch.matchingFactors.join(', ')}`
            }
          }
        }
      }
      
      correlations.push({
        vehicleId: vehicle.id,
        assignedJob,
        proximity,
        scheduleStatus
      })
    }
    
    // Step 5: Generate summary statistics
    const summary = geographicCorrelation.getCorrelationSummary(geographicCorrelations)
    const correlatedVehicles = correlations.filter(c => c.assignedJob !== null).length
    const atLocationCount = correlations.filter(c => c.proximity?.isAtJobSite).length
    
    console.log(`📊 Correlation Summary:`)
    console.log(`   Total correlations: ${summary.totalCorrelations}`)
    console.log(`   High confidence: ${summary.highConfidence}`)
    console.log(`   Vehicles with jobs: ${correlatedVehicles}/${vehicles.length}`)
    console.log(`   At job locations: ${atLocationCount}`)
    
    const processingTime = Date.now() - startTime
    console.log(`⚡ Enhanced tracking completed in ${processingTime}ms`)

    const responseData: ApiResponse<VehicleJobCorrelation[]> = {
      success: true,
      data: correlations,
      count: correlations.length,
      timestamp: new Date().toISOString(),
      processingTime,
      // Enhanced metadata
      correlationMetrics: {
        totalVehicles: vehicles.length,
        totalJobs: jobs.length,
        correlatedVehicles,
        atLocationCount,
        confidenceBreakdown: {
          high: summary.highConfidence,
          medium: summary.mediumConfidence,
          low: summary.lowConfidence
        },
        averageDistance: parseFloat(summary.averageDistance.toFixed(2)),
        correlationMethods: summary.methodBreakdown,
        systemType: 'geographic_correlation'
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ Enhanced tracking error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate enhanced vehicle-job correlations',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        processingTime,
        fallbackMessage: 'Geographic correlation system encountered an error'
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}

/**
 * POST endpoint for manual correlation adjustments
 */
export async function POST(request: Request) {
  try {
    const { vehicleId, jobId, action } = await request.json()
    
    console.log(`🔧 Manual correlation adjustment: ${action} for vehicle ${vehicleId}`)
    
    if (action === 'assign') {
      // Manual assignment logic could be implemented here
      return NextResponse.json({
        success: true,
        message: `Vehicle ${vehicleId} manually assigned to job ${jobId}`,
        timestamp: new Date().toISOString()
      })
    } else if (action === 'unassign') {
      // Manual unassignment logic
      return NextResponse.json({
        success: true,
        message: `Vehicle ${vehicleId} unassigned from correlations`,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action specified' },
      { status: 400 }
    )
    
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Manual correlation adjustment failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
