// Route-based correlation without geocoding
// Uses FileMaker route assignments directly

import { Job, VehicleData } from './types'

export interface RouteCorrelation {
  vehicleId: string
  jobId: number
  matchType: 'route' | 'driver' | 'truck'
  confidence: 'high' | 'medium'
}

/**
 * Match vehicles to jobs using route/driver IDs
 * Enhanced with flexible matching and detailed logging
 */
export async function correlateByRoute(
  vehicles: VehicleData[],
  jobs: Job[]
): Promise<RouteCorrelation[]> {
  const correlations: RouteCorrelation[] = []
  const assignedJobIds = new Set<number>() // Prevent duplicate job assignments
  
  // Filter active jobs with route assignments
  const activeJobs = jobs.filter(j => 
    j.status !== 'Completed' && 
    j.status !== 'Complete' && 
    j.status !== 'Canceled' &&
    (j.routeId || j.driverId || j.truckId)
  )
  
  console.log(`🔍 Correlation: ${vehicles.length} vehicles vs ${activeJobs.length} assigned jobs`)
  
  for (const vehicle of vehicles) {
    // Extract identifiers
    const vehicleNumber = extractVehicleNumber(vehicle.name)
    const vehicleName = vehicle.name?.toLowerCase() || ''
    
    console.log(`  Checking ${vehicle.name} (number: ${vehicleNumber})`)
    
    // Try exact truck ID match - STRING COMPARISON
    const truckMatch = activeJobs.find(j => 
      j.truckId && j.truckId === vehicleNumber &&
      !assignedJobIds.has(j.id)
    )
    
    if (truckMatch) {
      console.log(`    ✅ Truck match: Job ${truckMatch.id}`)
      correlations.push({
        vehicleId: vehicle.id,
        jobId: truckMatch.id,
        matchType: 'truck',
        confidence: 'high'
      })
      assignedJobIds.add(truckMatch.id)
      continue
    }
    
    // Try STRICT route ID match - STRING COMPARISON
    const routeMatch = activeJobs.find(j => {
      if (!j.routeId || assignedJobIds.has(j.id)) return false
      
      // STRICT: Only match if vehicle number EXACTLY equals route ID
      // This prevents "TRUCK 81" from matching route "1"
      return vehicleNumber === j.routeId
    })
    
    if (routeMatch) {
      console.log(`    ✅ Route match: Job ${routeMatch.id} (route: ${routeMatch.routeId})`)
      correlations.push({
        vehicleId: vehicle.id,
        jobId: routeMatch.id,
        matchType: 'route',
        confidence: 'medium'
      })
      assignedJobIds.add(routeMatch.id)
      continue
    }
    
    // Try driver name match
    if (vehicle.diagnostics?.driverName) {
      const driverMatch = activeJobs.find(j =>
        j.driverName && 
        !assignedJobIds.has(j.id) &&
        fuzzyMatchDriver(vehicle.diagnostics!.driverName!, j.driverName)
      )
      
      if (driverMatch) {
        console.log(`    ✅ Driver match: Job ${driverMatch.id}`)
        correlations.push({
          vehicleId: vehicle.id,
          jobId: driverMatch.id,
          matchType: 'driver',
          confidence: 'medium'
        })
        assignedJobIds.add(driverMatch.id)
      }
    }
  }
  
  console.log(`✅ Correlation complete: ${correlations.length} matches found`)
  return correlations
}

function extractVehicleNumber(name: string | undefined): string | null {
  if (!name) return null
  const match = name.match(/\d+/)
  return match ? match[0] : null
}

function fuzzyMatchDriver(driverName: string, jobDriver: string): boolean {
  const normalize = (s: string) => s.toLowerCase().trim()
  const d1 = normalize(driverName)
  const d2 = normalize(jobDriver)
  
  // Check if last names match
  const lastName1 = d1.split(' ').pop()
  const lastName2 = d2.split(' ').pop()
  
  return d1.includes(d2) || d2.includes(d1) || lastName1 === lastName2
}
