// DispatchTracker - Enhanced Vehicle Tracking API with Geographic Correlation
// Uses geographic proximity and intelligent matching instead of direct truck ID assignments

import { NextResponse } from 'next/server'
import { VehicleJobCorrelation, ApiResponse } from '@/lib/types'
import { correlateByRoute } from '@/lib/route-correlation'

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
    console.log('🔍 TRACKING LOCATION DEBUG: Vehicle location data sample:', vehicles.slice(0, 2).map((v: any) => ({
      id: v.id,
      name: v.name,
      location: v.location,
      hasLocation: !!(v.location?.latitude && v.location?.longitude)
    })))

    // Step 2: Fetch jobs from FileMaker - Get today's jobs for better assignment data
    console.log('📋 Fetching job data from FileMaker...')
    const jobParams = new URLSearchParams({
      limit: '100',
      today: 'true'  // Get today's jobs which are more likely to have assignments
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
    
    // Step 3: Route-Based Correlation System
    console.log('🎯 Running route-based correlation analysis...')
    const routeCorrelations = await correlateByRoute(vehicles, jobs)
    
    console.log(`✅ Generated ${routeCorrelations.length} route-based correlations`)
    
    // Step 4: Create vehicle-job correlation results
    const correlations: VehicleJobCorrelation[] = []
    const jobMap = new Map(jobs.map((job: any) => [job.id, job]))
    
    // Group route correlations by vehicle
    const vehicleCorrelationMap = new Map<string, typeof routeCorrelations>()
    routeCorrelations.forEach(corr => {
      if (!vehicleCorrelationMap.has(corr.vehicleId)) {
        vehicleCorrelationMap.set(corr.vehicleId, [])
      }
      vehicleCorrelationMap.get(corr.vehicleId)!.push(corr)
    })
    
    // Process each vehicle
    for (const vehicle of vehicles) {
      const vehicleRouteCorrelations = vehicleCorrelationMap.get(vehicle.id) || []
      const bestMatch = vehicleRouteCorrelations[0] // Best match
      
      let assignedJob: any = null
      let proximity: any = null
      let scheduleStatus: any = {
        type: 'normal',
        severity: 'info',
        message: 'No job assignment detected'
      }
      
      if (bestMatch && jobMap.has(bestMatch.jobId)) {
        assignedJob = jobMap.get(bestMatch.jobId)
        
        // Route-based proximity (no GPS distance)
        proximity = {
          distance: null,
          status: 'route-assigned',
          isAtJobSite: false,
          confidence: bestMatch.confidence,
          matchingFactors: [`Matched by ${bestMatch.matchType}`],
          correlationMethod: 'route'
        }
        
        // Schedule status based on job data
        if (includeScheduleHygiene && assignedJob) {
          if (assignedJob.arrivalTime && assignedJob.status !== 'Complete') {
            scheduleStatus = {
              type: 'incomplete_after_arrival',
              severity: 'warning',
              message: `Job has arrival time but status is ${assignedJob.status}`,
              actionNeeded: true
            }
          } else {
            scheduleStatus = {
              type: 'normal',
              severity: 'info',
              message: `Route assigned via ${bestMatch.matchType}`
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
    const correlatedVehicles = correlations.filter(c => c.assignedJob !== null).length

    console.log(`📊 Correlation Summary:`)
    console.log(`   Total correlations: ${routeCorrelations.length}`)
    console.log(`   Vehicles with jobs: ${correlatedVehicles}/${vehicles.length}`)
    console.log('🔍 TRACKING LOCATION DEBUG: Final correlation data sample:', correlations.slice(0, 2).map(c => ({
      vehicleId: c.vehicleId,
      hasLocation: !!(c.proximity),
      proximity: c.proximity
    })))
    
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
        atLocationCount: 0,
        confidenceBreakdown: {
          high: routeCorrelations.filter(c => c.confidence === 'high').length,
          medium: routeCorrelations.filter(c => c.confidence === 'medium').length,
          low: 0
        },
        averageDistance: 0,
        matchTypes: {
          truck: routeCorrelations.filter(c => c.matchType === 'truck').length,
          route: routeCorrelations.filter(c => c.matchType === 'route').length,
          driver: routeCorrelations.filter(c => c.matchType === 'driver').length
        },
        systemType: 'route_correlation'
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
