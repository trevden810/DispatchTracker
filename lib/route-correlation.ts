// DispatchTracker - FIXED Vehicle-Job Correlation
// Enhanced number extraction to handle all vehicle naming patterns

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
 * FIXED: Correlate vehicles to jobs using enhanced vehicle number extraction
 */
export function correlateVehiclesWithRouteAssignments(
  vehicles: Vehicle[],
  jobs: Job[]
): RouteAssignment[] {
  console.log('🚛 FIXED correlation: Enhanced vehicle number extraction')
  console.log(`📊 Input data: ${vehicles.length} vehicles, ${jobs.length} jobs`)
  
  // Debug: Log all vehicle names to understand patterns
  console.log('\n🚛 ALL VEHICLES:')
  vehicles.forEach((vehicle, index) => {
    const extractedNumber = extractVehicleNumber(vehicle.name)
    console.log(`  ${index + 1}. "${vehicle.name}" -> ${extractedNumber || 'FAILED'}`)
  })
  
  // Group jobs by truck ID
  const jobsByTruck = new Map<number, Job[]>()
  
  console.log('\n📋 ALL JOBS WITH TRUCK IDS:')
  jobs.forEach((job, index) => {
    console.log(`  ${index + 1}. Job ${job.id}: truckId=${job.truckId} (type: ${typeof job.truckId}), customer=${job.customer || 'N/A'}, status=${job.status}`)
    
    if (job.truckId !== null && job.truckId !== undefined) {
      const truckId = typeof job.truckId === 'number' ? job.truckId : parseInt(job.truckId.toString(), 10)
      if (!isNaN(truckId) && truckId > 0) {
        if (!jobsByTruck.has(truckId)) {
          jobsByTruck.set(truckId, [])
        }
        jobsByTruck.get(truckId)!.push(job)
        console.log(`    ✅ Added to truck ${truckId} group`)
      } else {
        console.log(`    ❌ Invalid truckId: ${job.truckId}`)
      }
    } else {
      console.log(`    ⚠️ No truckId for job ${job.id}`)
    }
  })
  
  console.log(`\n📊 Grouped ${jobsByTruck.size} truck assignments:`)
  jobsByTruck.forEach((truckJobs, truckId) => {
    console.log(`  Truck ${truckId}: ${truckJobs.length} jobs`)
  })
  
  const routeAssignments: RouteAssignment[] = []
  
  // Process each vehicle with enhanced matching
  console.log('\n🔍 VEHICLE-JOB MATCHING:')
  vehicles.forEach(vehicle => {
    const vehicleNumber = extractVehicleNumber(vehicle.name)
    console.log(`\n🚛 Vehicle: "${vehicle.name}"`)
    console.log(`   Extracted number: ${vehicleNumber || 'NONE'}`)
    
    if (vehicleNumber) {
      const assignedJobs = jobsByTruck.get(vehicleNumber) || []
      console.log(`   Jobs found: ${assignedJobs.length}`)
      
      if (assignedJobs.length > 0) {
        // Sort jobs by stop order
        const sortedJobs = assignedJobs
          .filter(job => job.stopOrder !== null && job.stopOrder !== undefined)
          .sort((a, b) => (a.stopOrder || 0) - (b.stopOrder || 0))
        
        console.log(`   Jobs with stop order: ${sortedJobs.length}`)
        
        // Find next incomplete job
        const nextJob = sortedJobs.find(job => {
          const isIncomplete = !(
            job.completionTime || 
            ['Complete', 'Done', 'Delivered', 'Completed'].includes(job.status)
          )
          return isIncomplete
        })
        
        const completedJobs = sortedJobs.filter(job => {
          const isComplete = !!(
            job.completionTime || 
            ['Complete', 'Done', 'Delivered', 'Completed'].includes(job.status)
          )
          return isComplete
        })
        
        const routeId = sortedJobs[0]?.routeId || vehicleNumber
        
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
        
        console.log(`   ✅ MATCH: Route ${routeId}, Next: ${nextJob?.customer || 'None'}, Progress: ${assignment.progress.percentComplete}%`)
      } else {
        console.log(`   ⚠️ No jobs found for truck ${vehicleNumber}`)
      }
    } else {
      console.log(`   ❌ Could not extract vehicle number`)
    }
  })
  
  console.log(`\n🎯 FINAL RESULTS: ${routeAssignments.length}/${vehicles.length} vehicles matched to jobs`)
  
  return routeAssignments
}

/**
 * ENHANCED: Extract numeric vehicle ID from any vehicle naming pattern
 * Handles: "Truck 96", "TRUCK 85", "V7", "V9", "OR 70", "901", etc.
 */
function extractVehicleNumber(vehicleName: string): number | null {
  if (!vehicleName) return null
  
  const clean = vehicleName.trim().toUpperCase()
  console.log(`    Analyzing: "${clean}"`)
  
  // Enhanced patterns in order of specificity
  const patterns = [
    // Explicit truck patterns
    { pattern: /^TRUCK\s+(\d+)$/i, desc: 'TRUCK ##' },
    { pattern: /^(\d+)$/, desc: 'Pure number' },
    
    // Vehicle with number patterns  
    { pattern: /^V(\d+)$/i, desc: 'V##' },
    { pattern: /^OR\s+(\d+)$/i, desc: 'OR ##' },
    { pattern: /^TRUCK\s+(\d+)\b/i, desc: 'TRUCK ## (with suffix)' },
    
    // General patterns
    { pattern: /(\d{2,3})/, desc: '2-3 digit number anywhere' },
    { pattern: /(\d+)/, desc: 'Any number' }
  ]
  
  for (const { pattern, desc } of patterns) {
    const match = clean.match(pattern)
    if (match) {
      const number = parseInt(match[1] || match[0], 10)
      if (!isNaN(number) && number > 0 && number < 10000) {
        console.log(`    ✅ Pattern "${desc}" matched -> ${number}`)
        return number
      }
    }
  }
  
  console.log(`    ❌ No valid patterns matched`)
  return null
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
  
  return {
    totalRoutes,
    activeVehicles,
    completedStops,
    totalStops,
    averageProgress,
    vehiclesAtLocation: 0
  }
}
