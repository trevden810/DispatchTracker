// GEOGRAPHIC CORRELATION SYSTEM
// Intelligent vehicle-job matching using GPS proximity and route analysis

import { Job, VehicleData } from './types'
import { calculateDistance, geocodeAddress } from './gps-utils'

export interface GeographicCorrelation {
  vehicleId: string
  jobId: number
  confidence: 'high' | 'medium' | 'low'
  distance: number
  matchingFactors: string[]
  correlationMethod: 'proximity' | 'route_pattern' | 'timing' | 'hybrid'
}

/**
 * INTELLIGENT GEOGRAPHIC CORRELATION SYSTEM
 * Matches vehicles to jobs without requiring direct truck ID assignments
 */
export class GeographicCorrelationEngine {
  private vehicleHistoryCache = new Map<string, Array<{lat: number, lng: number, timestamp: Date}>>()
  private jobLocationCache = new Map<number, {lat: number, lng: number, address: string}>()
  
  /**
   * Primary correlation method - matches vehicles to jobs using multiple factors
   */
  async correlateVehiclesWithJobs(vehicles: VehicleData[], jobs: Job[]): Promise<GeographicCorrelation[]> {
    console.log('🎯 Starting geographic correlation analysis...')
    const correlations: GeographicCorrelation[] = []
    
    // Prepare job locations (geocode addresses)
    await this.prepareJobLocations(jobs)
    
    for (const vehicle of vehicles) {
      const bestMatches = await this.findBestJobMatches(vehicle, jobs)
      correlations.push(...bestMatches)
    }
    
    // Sort by confidence and distance
    correlations.sort((a, b) => {
      const confidenceWeight = { high: 3, medium: 2, low: 1 }
      if (confidenceWeight[b.confidence] !== confidenceWeight[a.confidence]) {
        return confidenceWeight[b.confidence] - confidenceWeight[a.confidence]
      }
      return a.distance - b.distance
    })
    
    console.log(`✅ Generated ${correlations.length} geographic correlations`)
    return correlations
  }
  
  /**
   * Find best job matches for a specific vehicle
   */
  private async findBestJobMatches(vehicle: VehicleData, jobs: Job[]): Promise<GeographicCorrelation[]> {
    const matches: GeographicCorrelation[] = []
    const vehicleLocation = { lat: vehicle.location.latitude, lng: vehicle.location.longitude }
    
    // Filter jobs that are geographically relevant
    const relevantJobs = jobs.filter(job => 
      job.status !== 'Complete' && 
      job.status !== 'Canceled' &&
      this.jobLocationCache.has(job.id)
    )
    
    for (const job of relevantJobs) {
      const jobLocation = this.jobLocationCache.get(job.id)!
      const distance = calculateDistance(vehicleLocation, jobLocation)
      
      // Only consider jobs within reasonable range (50 miles)
      if (distance <= 50) {
        const correlation = await this.analyzeVehicleJobMatch(vehicle, job, distance)
        if (correlation) {
          matches.push(correlation)
        }
      }
    }
    
    // Return top 3 matches per vehicle to avoid overcrowding
    return matches.slice(0, 3)
  }
  
  /**
   * Analyze individual vehicle-job match
   */
  private async analyzeVehicleJobMatch(
    vehicle: VehicleData, 
    job: Job, 
    distance: number
  ): Promise<GeographicCorrelation | null> {
    const matchingFactors: string[] = []
    let confidence: 'high' | 'medium' | 'low' = 'low'
    let correlationMethod: 'proximity' | 'route_pattern' | 'timing' | 'hybrid' = 'proximity'
    
    // Factor 1: Geographic Proximity
    if (distance <= 0.5) {
      matchingFactors.push('At job location')
      confidence = 'high'
    } else if (distance <= 2) {
      matchingFactors.push('Very close proximity')
      confidence = confidence === 'low' ? 'medium' : confidence
    } else if (distance <= 5) {
      matchingFactors.push('Nearby location')
    }
    
    // Factor 2: Vehicle Movement Pattern
    if (vehicle.engineState === 'On' && vehicle.speed && vehicle.speed > 0) {
      if (distance <= 5) {
        matchingFactors.push('Moving toward location')
        confidence = confidence === 'low' ? 'medium' : confidence
        correlationMethod = 'route_pattern'
      }
    } else if (vehicle.engineState === 'Off' && distance <= 1) {
      matchingFactors.push('Parked at/near location')
      confidence = 'high'
    }
    
    // Factor 3: Job Timing Correlation
    if (job.date) {
      const jobDate = new Date(job.date)
      const today = new Date()
      const daysDiff = Math.abs((today.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff <= 1) {
        matchingFactors.push('Scheduled for today/tomorrow')
        confidence = confidence === 'low' ? 'medium' : confidence
        correlationMethod = correlationMethod === 'proximity' ? 'timing' : 'hybrid'
      }
    }
    
    // Factor 4: Vehicle Type Matching
    if (job.type && vehicle.name) {
      if (job.type.toLowerCase().includes('delivery') && 
          vehicle.name.toLowerCase().includes('truck')) {
        matchingFactors.push('Vehicle type matches job')
        confidence = confidence === 'low' ? 'medium' : confidence
      }
    }
    
    // Factor 5: Route ID or Driver ID correlation (if available)
    if (job.routeId || job.driverId) {
      // Extract potential route/driver info from vehicle name or external IDs
      const vehicleIdString = this.extractVehicleIdentifier(vehicle)
      if (vehicleIdString && (vehicleIdString === job.routeId?.toString() || vehicleIdString === job.driverId?.toString())) {
        matchingFactors.push('Route/Driver ID match')
        confidence = 'high'
        correlationMethod = 'hybrid'
      }
    }
    
    // Only return correlations with at least one matching factor
    if (matchingFactors.length === 0) {
      return null
    }
    
    return {
      vehicleId: vehicle.id,
      jobId: job.id,
      confidence,
      distance,
      matchingFactors,
      correlationMethod
    }
  }
  
  /**
   * Prepare job locations by geocoding addresses
   */
  private async prepareJobLocations(jobs: Job[]): Promise<void> {
    console.log(`📍 Geocoding ${jobs.length} job addresses...`)
    
    for (const job of jobs) {
      if (job.address && !this.jobLocationCache.has(job.id)) {
        try {
          const geocoded = await geocodeAddress(job.address)
          if (geocoded) {
            this.jobLocationCache.set(job.id, {
              lat: geocoded.lat,
              lng: geocoded.lng,
              address: job.address
            })
          }
        } catch (error) {
          console.warn(`⚠️ Could not geocode address for job ${job.id}: ${job.address}`)
        }
      }
    }
    
    console.log(`✅ Successfully geocoded ${this.jobLocationCache.size} job locations`)
  }
  
  /**
   * Extract vehicle identifier from name or external IDs
   */
  private extractVehicleIdentifier(vehicle: VehicleData): string | null {
    // Try to extract number from vehicle name
    const nameMatch = vehicle.name?.match(/(\d+)/)
    if (nameMatch) {
      return nameMatch[1]
    }
    
    // Try external IDs
    if (vehicle.externalIds) {
      const truckNumber = vehicle.externalIds['Truck Number'] || 
                         vehicle.externalIds['truck_number'] ||
                         vehicle.externalIds['TruckId']
      if (truckNumber) {
        return truckNumber.toString()
      }
    }
    
    return null
  }
  
  /**
   * Get correlation summary for dashboard display
   */
  getCorrelationSummary(correlations: GeographicCorrelation[]): {
    totalCorrelations: number
    highConfidence: number
    mediumConfidence: number
    lowConfidence: number
    averageDistance: number
    methodBreakdown: Record<string, number>
  } {
    const summary = {
      totalCorrelations: correlations.length,
      highConfidence: correlations.filter(c => c.confidence === 'high').length,
      mediumConfidence: correlations.filter(c => c.confidence === 'medium').length,
      lowConfidence: correlations.filter(c => c.confidence === 'low').length,
      averageDistance: correlations.length > 0 
        ? correlations.reduce((sum, c) => sum + c.distance, 0) / correlations.length 
        : 0,
      methodBreakdown: {
        proximity: correlations.filter(c => c.correlationMethod === 'proximity').length,
        route_pattern: correlations.filter(c => c.correlationMethod === 'route_pattern').length,
        timing: correlations.filter(c => c.correlationMethod === 'timing').length,
        hybrid: correlations.filter(c => c.correlationMethod === 'hybrid').length
      }
    }
    
    return summary
  }
}

// Export default instance
export const geographicCorrelation = new GeographicCorrelationEngine()

/**
 * Simplified interface for existing correlation system
 * Maintains backward compatibility while using geographic correlation
 */
export async function intelligentVehicleJobMatching(
  vehicles: VehicleData[], 
  jobs: Job[]
): Promise<Array<{ vehicleId: string; assignedJob: Job | null; proximity: any }>> {
  const geoCorrrelations = await geographicCorrelation.correlateVehiclesWithJobs(vehicles, jobs)
  
  // Convert to existing format
  const jobMap = new Map(jobs.map(job => [job.id, job]))
  const results = []
  
  // Group correlations by vehicle
  const vehicleGroups = new Map<string, GeographicCorrelation[]>()
  geoCorrrelations.forEach(corr => {
    if (!vehicleGroups.has(corr.vehicleId)) {
      vehicleGroups.set(corr.vehicleId, [])
    }
    vehicleGroups.get(corr.vehicleId)!.push(corr)
  })
  
  // Create results for each vehicle
  for (const vehicle of vehicles) {
    const vehicleCorrelations = vehicleGroups.get(vehicle.id) || []
    const bestMatch = vehicleCorrelations[0] // Highest confidence, closest distance
    
    results.push({
      vehicleId: vehicle.id,
      assignedJob: bestMatch ? jobMap.get(bestMatch.jobId) || null : null,
      proximity: bestMatch ? {
        distance: bestMatch.distance,
        status: bestMatch.distance <= 0.5 ? 'at-location' : 
                bestMatch.distance <= 2 ? 'nearby' : 
                bestMatch.distance <= 10 ? 'en-route' : 'far',
        isAtJobSite: bestMatch.distance <= 0.5,
        confidence: bestMatch.confidence,
        matchingFactors: bestMatch.matchingFactors,
        correlationMethod: bestMatch.correlationMethod
      } : null
    })
  }
  
  return results
}
