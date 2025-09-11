// DispatchTracker - Enhanced Vehicle-Job Correlation with Route Logic
// Accurate job assignment using FileMaker route data

import { Job } from './types'

export interface Vehicle {
  id: string
  name: string
  lat: number
  lng: number
  speed: number
  status: string
}

export interface RouteAssignment {
  vehicleId: string
  routeId: number
  currentStop?: number
  assignedJobs: Job[]
  nextJob?: Job
  progress: {
    completedStops: number
    totalStops: number
    percentComplete: number
  }
}

/**
 * ENHANCED: Correlate vehicles to jobs using FileMaker route assignments
 * This fixes the issue where vehicles weren't showing proper job assignments
 */
export function correlateVehiclesWithRouteAssignments(
  vehicles: Vehicle[],
  jobs: Job[]
): RouteAssignment[] {
  console.log('🚛 Enhanced correlation: Using FileMaker route assignments')
  console.log(`📊 Input data: ${vehicles.length} vehicles, ${jobs.length} jobs`)
  
  // Group jobs by route ID and truck ID
  const jobsByRoute = new Map<number, Job[]>()
  const jobsByTruck = new Map<number, Job[]>()
  
  // Debug: Log all job data for analysis
  console.log('\n📋 ANALYZING ALL JOBS:')
  jobs.forEach((job, index) => {
    console.log(`Job ${index + 1}: ID=${job.id}, truckId=${job.truckId}, routeId=${job.routeId}, stopOrder=${job.stopOrder}, customer=${job.customer || 'N/A'}`)
    
    // Group by route ID (from *kf*route_id)
    if (job.routeId) {
      if (!jobsByRoute.has(job.routeId)) {
        jobsByRoute.set(job.routeId, [])
      }
      jobsByRoute.get(job.routeId)!.push(job)
    }
    
    // Group by truck ID (from *kf*trucks_id)
    if (job.truckId) {
      if (!jobsByTruck.has(job.truckId)) {
        jobsByTruck.set(job.truckId, [])
      }
      jobsByTruck.get(job.truckId)!.push(job)
    }
  })
  
  console.log(`\n📊 Grouped data: ${jobsByRoute.size} routes, ${jobsByTruck.size} truck assignments`)
  
  // Debug: Show truck assignment groups
  console.log('\n🚛 TRUCK ASSIGNMENTS:')
  for (const [truckId, truckJobs] of jobsByTruck) {
    console.log(`  Truck ${truckId}: ${truckJobs.length} jobs`)
  }
  
  const routeAssignments: RouteAssignment[] = []
  
  // Process each vehicle
  console.log('\n🔍 PROCESSING VEHICLES:')
  vehicles.forEach(vehicle => {
    // 🔧 CRITICAL FIX: Use vehicle.name instead of vehicle.id for extraction
    // The Samsara vehicle.name contains "Truck 77" while vehicle.id is a long numeric string
    const vehicleNumber = extractVehicleNumber(vehicle.name)
    console.log(`\nVehicle: ${vehicle.name} (ID: ${vehicle.id})`)
    console.log(`  Extracted number: ${vehicleNumber}`)
    
    if (vehicleNumber) {
      // Find jobs assigned to this truck
      const assignedJobs = jobsByTruck.get(vehicleNumber) || []
      console.log(`  Found ${assignedJobs.length} assigned jobs`)
      
      if (assignedJobs.length > 0) {
        // Sort jobs by stop order (order_C1)
        const sortedJobs = assignedJobs
          .filter(job => job.stopOrder !== null && job.stopOrder !== undefined)
          .sort((a, b) => (a.stopOrder || 0) - (b.stopOrder || 0))
        
        console.log(`  Jobs with stop order: ${sortedJobs.length}`)
        sortedJobs.forEach(job => {
          console.log(`    Stop ${job.stopOrder}: Job ${job.id} - ${job.customer || 'Unknown Customer'} (${job.status})`)
        })
        
        const routeId = sortedJobs[0]?.routeId || 0
        
        // Find current position in route - be more flexible with completion status
        const completedJobs = sortedJobs.filter(job => {
          const isCompleted = !!(job.completionTime || 
            job.driverStatus === 'Completed' ||
            ['Complete', 'Done', 'Delivered', 'Successful', 'Finished', 'Accomplished', 'Completed'].includes(job.status))
          return isCompleted
        })
        
        const nextJob = sortedJobs.find(job => {
          const isNotCompleted = !(job.completionTime || 
            job.driverStatus === 'Completed' ||
            ['Complete', 'Done', 'Delivered', 'Successful', 'Finished', 'Accomplished', 'Completed'].includes(job.status))
          return isNotCompleted
        })
        
        console.log(`  Completed jobs: ${completedJobs.length}`)
        console.log(`  Next job: ${nextJob ? `${nextJob.id} (${nextJob.customer})` : 'None'}`)
        
        const assignment: RouteAssignment = {
          vehicleId: vehicle.id,
          routeId,
          currentStop: nextJob?.stopOrder || undefined,
          assignedJobs: sortedJobs,
          nextJob,
          progress: {
            completedStops: completedJobs.length,
            totalStops: sortedJobs.length,
            percentComplete: sortedJobs.length > 0 
              ? Math.round((completedJobs.length / sortedJobs.length) * 100)
              : 0
          }
        }
        
        routeAssignments.push(assignment)
        
        console.log(`  ✅ Assignment created: Route ${routeId}, Stop ${nextJob?.stopOrder || 'N/A'}, Progress ${assignment.progress.percentComplete}%`)
      } else {
        console.log(`  ⚠️ No assigned jobs found for truck number ${vehicleNumber}`)
      }
    } else {
      console.log(`  ❌ Could not extract vehicle number from "${vehicle.id}"`)
    }
  })
  
  console.log(`\n🎯 CORRELATION RESULTS: ${routeAssignments.length} vehicles with route assignments`)
  
  return routeAssignments
}

/**
 * Extract numeric vehicle ID from vehicle identifier
 * Examples: "Truck 77" -> 77, "901" -> 901
 */
function extractVehicleNumber(vehicleId: string): number | null {
  // Try to extract number from various formats
  const patterns = [
    /Truck\s+(\d+)/i,    // "Truck 77"
    /Vehicle\s+(\d+)/i,  // "Vehicle 77"
    /^(\d+)$/,           // "901"
    /^\w+(\d+)$/         // "V8" -> 8, "OR70" -> 70
  ]
  
  for (const pattern of patterns) {
    const match = vehicleId.match(pattern)
    if (match) {
      return parseInt(match[1] || match[0], 10)
    }
  }
  
  console.log(`  ❌ No patterns matched for: "${cleanId}"`);
  return null;
}

/**
 * Calculate proximity status for route-assigned jobs
 */
export function calculateRouteProximity(
  vehicle: Vehicle,
  assignment: RouteAssignment
): {
  currentJobProximity?: {
    distance: number
    status: 'at-location' | 'nearby' | 'en-route' | 'far'
    isAtJobSite: boolean
  }
  nextJobDistance?: number
} {
  if (!assignment.nextJob?.location) {
    return {}
  }
  
  const distance = calculateDistance(
    vehicle.lat,
    vehicle.lng,
    assignment.nextJob.location.lat,
    assignment.nextJob.location.lng
  )
  
  let status: 'at-location' | 'nearby' | 'en-route' | 'far'
  
  if (distance <= 0.5) {
    status = 'at-location'
  } else if (distance <= 1.0) {
    status = 'nearby'
  } else if (distance <= 10.0) {
    status = 'en-route'
  } else {
    status = 'far'
  }
  
  return {
    currentJobProximity: {
      distance,
      status,
      isAtJobSite: distance <= 0.5
    },
    nextJobDistance: distance
  }
}

/**
 * Haversine formula for calculating distance between two GPS points
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Get route summary for dispatchers
 */
export function getRouteSummary(assignments: RouteAssignment[]): {
  totalRoutes: number
  activeVehicles: number
  completedStops: number
  totalStops: number
  averageProgress: number
  vehiclesAtLocation: number
} {
  const totalRoutes = new Set(assignments.map(a => a.routeId)).size
  const activeVehicles = assignments.length
  const completedStops = assignments.reduce((sum, a) => sum + a.progress.completedStops, 0)
  const totalStops = assignments.reduce((sum, a) => sum + a.progress.totalStops, 0)
  const averageProgress = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0
  
  // Count vehicles currently at job locations (would need proximity calculation)
  const vehiclesAtLocation = 0 // Placeholder - requires proximity data
  
  return {
    totalRoutes,
    activeVehicles,
    completedStops,
    totalStops,
    averageProgress,
    vehiclesAtLocation
  }
}
