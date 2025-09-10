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
  
  // Group jobs by route ID and truck ID
  const jobsByRoute = new Map<number, Job[]>()
  const jobsByTruck = new Map<number, Job[]>()
  
  jobs.forEach(job => {
    // Group by route ID (from _kf_route_id)
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
  
  console.log(`📊 Found ${jobsByRoute.size} routes and ${jobsByTruck.size} truck assignments`)
  
  const routeAssignments: RouteAssignment[] = []
  
  // Process each vehicle
  vehicles.forEach(vehicle => {
    const vehicleNumber = extractVehicleNumber(vehicle.id)
    
    if (vehicleNumber) {
      // Find jobs assigned to this truck
      const assignedJobs = jobsByTruck.get(vehicleNumber) || []
      
      if (assignedJobs.length > 0) {
        // Sort jobs by stop order (order_C1)
        const sortedJobs = assignedJobs
          .filter(job => job.stopOrder !== null)
          .sort((a, b) => (a.stopOrder || 0) - (b.stopOrder || 0))
        
        const routeId = sortedJobs[0]?.routeId || 0
        
        // Find current position in route
        const completedJobs = sortedJobs.filter(job => 
          job.completionTime || 
          job.driverStatus === 'Completed' ||
          job.status === 'Complete' ||
          job.status === 'Done'
        )
        
        const nextJob = sortedJobs.find(job => 
          !job.completionTime && 
          job.driverStatus !== 'Completed' &&
          job.status !== 'Complete' &&
          job.status !== 'Done'
        )
        
        const assignment: RouteAssignment = {\n          vehicleId: vehicle.id,\n          routeId,\n          currentStop: nextJob?.stopOrder || undefined,\n          assignedJobs: sortedJobs,\n          nextJob,\n          progress: {\n            completedStops: completedJobs.length,\n            totalStops: sortedJobs.length,\n            percentComplete: sortedJobs.length > 0 \n              ? Math.round((completedJobs.length / sortedJobs.length) * 100)\n              : 0\n          }\n        }\n        \n        routeAssignments.push(assignment)\n        \n        console.log(`🎯 Vehicle ${vehicle.id}: Route ${routeId}, Stop ${nextJob?.stopOrder || 'N/A'}, Progress ${assignment.progress.percentComplete}%`)\n      } else {\n        console.log(`⚠️ Vehicle ${vehicle.id}: No assigned jobs found`)\n      }\n    }\n  })\n  \n  return routeAssignments\n}\n\n/**\n * Extract numeric vehicle ID from vehicle identifier\n * Examples: \"Truck 77\" -> 77, \"901\" -> 901\n */\nfunction extractVehicleNumber(vehicleId: string): number | null {\n  // Try to extract number from various formats\n  const patterns = [\n    /Truck\\s+(\\d+)/i,    // \"Truck 77\"\n    /Vehicle\\s+(\\d+)/i,  // \"Vehicle 77\"\n    /^(\\d+)$/,           // \"901\"\n    /^\\w+(\\d+)$/         // \"V8\" -> 8, \"OR70\" -> 70\n  ]\n  \n  for (const pattern of patterns) {\n    const match = vehicleId.match(pattern)\n    if (match) {\n      return parseInt(match[1] || match[0], 10)\n    }\n  }\n  \n  return null\n}\n\n/**\n * Calculate proximity status for route-assigned jobs\n */\nexport function calculateRouteProximity(\n  vehicle: Vehicle,\n  assignment: RouteAssignment\n): {\n  currentJobProximity?: {\n    distance: number\n    status: 'at-location' | 'nearby' | 'en-route' | 'far'\n    isAtJobSite: boolean\n  }\n  nextJobDistance?: number\n} {\n  if (!assignment.nextJob?.location) {\n    return {}\n  }\n  \n  const distance = calculateDistance(\n    vehicle.lat,\n    vehicle.lng,\n    assignment.nextJob.location.lat,\n    assignment.nextJob.location.lng\n  )\n  \n  let status: 'at-location' | 'nearby' | 'en-route' | 'far'\n  \n  if (distance <= 0.5) {\n    status = 'at-location'\n  } else if (distance <= 1.0) {\n    status = 'nearby'\n  } else if (distance <= 10.0) {\n    status = 'en-route'\n  } else {\n    status = 'far'\n  }\n  \n  return {\n    currentJobProximity: {\n      distance,\n      status,\n      isAtJobSite: distance <= 0.5\n    },\n    nextJobDistance: distance\n  }\n}\n\n/**\n * Haversine formula for calculating distance between two GPS points\n */\nfunction calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {\n  const R = 3959 // Earth's radius in miles\n  const dLat = toRadians(lat2 - lat1)\n  const dLng = toRadians(lng2 - lng1)\n  \n  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +\n    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *\n    Math.sin(dLng / 2) * Math.sin(dLng / 2)\n  \n  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))\n  \n  return R * c\n}\n\nfunction toRadians(degrees: number): number {\n  return degrees * (Math.PI / 180)\n}\n\n/**\n * Get route summary for dispatchers\n */\nexport function getRouteSummary(assignments: RouteAssignment[]): {\n  totalRoutes: number\n  activeVehicles: number\n  completedStops: number\n  totalStops: number\n  averageProgress: number\n  vehiclesAtLocation: number\n} {\n  const totalRoutes = new Set(assignments.map(a => a.routeId)).size\n  const activeVehicles = assignments.length\n  const completedStops = assignments.reduce((sum, a) => sum + a.progress.completedStops, 0)\n  const totalStops = assignments.reduce((sum, a) => sum + a.progress.totalStops, 0)\n  const averageProgress = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0\n  \n  // Count vehicles currently at job locations (would need proximity calculation)\n  const vehiclesAtLocation = 0 // Placeholder - requires proximity data\n  \n  return {\n    totalRoutes,\n    activeVehicles,\n    completedStops,\n    totalStops,\n    averageProgress,\n    vehiclesAtLocation\n  }\n}\n