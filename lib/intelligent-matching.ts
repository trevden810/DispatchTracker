// DispatchTracker - Intelligent Vehicle-Job Matching
// Matches Samsara vehicles to FileMaker jobs without naming conventions

import { Job } from './types'

export interface Vehicle {
  id: string
  name: string
  lat: number
  lng: number
  speed: number
  status: string
}

export interface VehicleJobMatch {
  vehicleId: string
  vehicleName: string
  confidence: 'high' | 'medium' | 'low' | 'none'
  matchMethod: 'exact_number' | 'fuzzy_number' | 'location_proximity' | 'pattern_match' | 'no_match'
  assignedJobs: Job[]
  nextJob?: Job
  matchDetails: string
}

/**
 * INTELLIGENT MATCHING: Find best vehicle-job correlations without naming policies
 */
export function correlateVehiclesWithJobs(
  vehicles: Vehicle[],
  jobs: Job[]
): VehicleJobMatch[] {
  console.log('🧠 INTELLIGENT VEHICLE-JOB MATCHING (No naming conventions)')
  console.log(`📊 Input: ${vehicles.length} vehicles, ${jobs.length} jobs`)
  
  // Step 1: Extract all potential identifiers from vehicle names
  const vehicleIdentifiers = vehicles.map(vehicle => ({
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    extractedNumbers: extractAllNumbers(vehicle.name),
    cleanName: cleanVehicleName(vehicle.name),
    vehicle: vehicle
  }))
  
  // Step 2: Group jobs by truck ID and create lookup maps
  const jobsByTruckId = new Map<number, Job[]>()
  const allTruckIds = new Set<number>()
  
  jobs.forEach(job => {
    if (job.truckId && !isNaN(Number(job.truckId))) {
      const truckId = Number(job.truckId)
      allTruckIds.add(truckId)
      
      if (!jobsByTruckId.has(truckId)) {
        jobsByTruckId.set(truckId, [])
      }
      jobsByTruckId.get(truckId)!.push(job)
    } else {
      // DEBUG: Log jobs with no valid truck ID
      console.log(`⚠️  Job ${job.id} has invalid truckId: '${job.truckId}' (${typeof job.truckId})`)
    }
  })
  
  console.log(`📋 Available truck IDs (${allTruckIds.size}): ${Array.from(allTruckIds).sort((a,b) => a-b).join(', ')}`)
  
  // Debug: Log sample vehicle names and extracted numbers for troubleshooting
  console.log('🔍 SAMPLE VEHICLE ANALYSIS:')
  vehicleIdentifiers.slice(0, 5).forEach(v => {
    console.log(`   "${v.vehicleName}" → Numbers: [${v.extractedNumbers.join(', ')}]`)
  })
  
  // Step 3: Smart matching for each vehicle
  const matches: VehicleJobMatch[] = []
  
  vehicleIdentifiers.forEach(vehicleInfo => {
    console.log(`\\n🚛 Matching vehicle: "${vehicleInfo.vehicleName}"`)
    console.log(`   Extracted numbers: [${vehicleInfo.extractedNumbers.join(', ')}]`)
    console.log(`   Clean name: "${vehicleInfo.cleanName}"`)
    
    const match = findBestMatch(vehicleInfo, jobsByTruckId, allTruckIds)
    matches.push(match)
    
    console.log(`   🎯 Best match: ${match.confidence} confidence via ${match.matchMethod}`)
    console.log(`   📝 Details: ${match.matchDetails}`)
    console.log(`   📋 Jobs found: ${match.assignedJobs.length}`)
  })
  
  // Step 4: Summary and conflict resolution
  const summary = {
    totalVehicles: vehicles.length,
    highConfidenceMatches: matches.filter(m => m.confidence === 'high').length,
    mediumConfidenceMatches: matches.filter(m => m.confidence === 'medium').length,
    lowConfidenceMatches: matches.filter(m => m.confidence === 'low').length,
    noMatches: matches.filter(m => m.confidence === 'none').length
  }
  
  console.log(`\\n📊 MATCHING SUMMARY:`)
  console.log(`   High confidence: ${summary.highConfidenceMatches}`)
  console.log(`   Medium confidence: ${summary.mediumConfidenceMatches}`)
  console.log(`   Low confidence: ${summary.lowConfidenceMatches}`)
  console.log(`   No matches: ${summary.noMatches}`)
  
  return matches
}

/**
 * Extract all possible numbers from vehicle name
 */
function extractAllNumbers(vehicleName: string): number[] {
  if (!vehicleName) return []
  
  const numbers: number[] = []
  
  // Find all number sequences in the string
  const numberMatches = vehicleName.match(/\d+/g)
  if (numberMatches) {
    numberMatches.forEach(match => {
      const num = parseInt(match, 10)
      if (!isNaN(num) && num > 0 && num < 10000) {
        numbers.push(num)
      }
    })
  }
  
  return [...new Set(numbers)] // Remove duplicates
}

/**
 * Clean vehicle name for fuzzy matching
 */
function cleanVehicleName(vehicleName: string): string {
  if (!vehicleName) return ''
  
  return vehicleName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
}

/**
 * Find the best match for a vehicle using multiple strategies
 */
function findBestMatch(
  vehicleInfo: any,
  jobsByTruckId: Map<number, Job[]>,
  allTruckIds: Set<number>
): VehicleJobMatch {
  
  const { vehicleId, vehicleName, extractedNumbers, cleanName, vehicle } = vehicleInfo
  
  // Strategy 1: Exact number match
  for (const num of extractedNumbers) {
    if (jobsByTruckId.has(num)) {
      const jobs = jobsByTruckId.get(num)!
      const nextJob = findNextIncompleteJob(jobs)
      
      return {
        vehicleId,
        vehicleName,
        confidence: 'high',
        matchMethod: 'exact_number',
        assignedJobs: jobs,
        nextJob,
        matchDetails: `Vehicle number ${num} exactly matches truck ID ${num}`
      }
    }
  }
  
  // Strategy 2: Fuzzy number matching (TIGHTENED: ±1 difference only)
  for (const num of extractedNumbers) {
    const closeMatches = Array.from(allTruckIds).filter(truckId => {
      const diff = Math.abs(num - truckId)
      return diff === 1 // TIGHTENED: Only allow ±1 difference
    })
    
    if (closeMatches.length === 1) {
      const truckId = closeMatches[0]
      const jobs = jobsByTruckId.get(truckId)!
      const nextJob = findNextIncompleteJob(jobs)
      
      console.log(`⚠️  FUZZY MATCH: Vehicle ${num} matched to Truck ${truckId} (±1 difference)`)
      
      return {
        vehicleId,
        vehicleName,
        confidence: 'medium',
        matchMethod: 'fuzzy_number',
        assignedJobs: jobs,
        nextJob,
        matchDetails: `Vehicle number ${num} close to truck ID ${truckId} (diff: ${Math.abs(num - truckId)}) - VERIFY THIS ASSIGNMENT`
      }
    }
  }
  
  // Strategy 3: Pattern matching (last resort)
  const patternMatches = findPatternMatches(cleanName, allTruckIds)
  if (patternMatches.length === 1) {
    const truckId = patternMatches[0]
    const jobs = jobsByTruckId.get(truckId)!
    const nextJob = findNextIncompleteJob(jobs)
    
    return {
      vehicleId,
      vehicleName,
      confidence: 'low',
      matchMethod: 'pattern_match',
      assignedJobs: jobs,
      nextJob,
      matchDetails: `Pattern match found truck ID ${truckId} for vehicle name pattern`
    }
  }
  
  // Strategy 4: Location proximity (if GPS available and jobs have locations)
  if (vehicle.lat && vehicle.lng) {
    const locationMatch = findLocationBasedMatch(vehicle, jobsByTruckId)
    if (locationMatch) {
      return {
        vehicleId,
        vehicleName,
        confidence: 'low',
        matchMethod: 'location_proximity',
        assignedJobs: locationMatch.jobs,
        nextJob: locationMatch.nextJob,
        matchDetails: `Vehicle near job location (${locationMatch.distance.toFixed(2)} miles from ${locationMatch.customer})`
      }
    }
  }
  
  // No match found
  return {
    vehicleId,
    vehicleName,
    confidence: 'none',
    matchMethod: 'no_match',
    assignedJobs: [],
    nextJob: undefined,
    matchDetails: `No correlation found. Vehicle numbers [${extractedNumbers.join(', ')}] don't match any truck IDs.`
  }
}

/**
 * Find next incomplete job in a job list
 */
function findNextIncompleteJob(jobs: Job[]): Job | undefined {
  // Sort by stop order, then find first incomplete
  const sortedJobs = jobs
    .filter(job => job.stopOrder !== null && job.stopOrder !== undefined)
    .sort((a, b) => (a.stopOrder || 0) - (b.stopOrder || 0))
  
  return sortedJobs.find(job => {
    const isIncomplete = !(
      job.completionTime || 
      ['Complete', 'Done', 'Delivered', 'Completed'].includes(job.status)
    )
    return isIncomplete
  })
}

/**
 * Pattern-based matching for edge cases
 */
function findPatternMatches(cleanName: string, allTruckIds: Set<number>): number[] {
  const matches: number[] = []
  
  // Look for common patterns that might correlate
  const patterns = [
    { regex: /UNIT\s*(\d+)/, label: 'UNIT pattern' },
    { regex: /VEH\s*(\d+)/, label: 'VEH pattern' },
    { regex: /CAR\s*(\d+)/, label: 'CAR pattern' },
    { regex: /V\s*(\d+)/, label: 'V pattern' }, // Handles V7, V8, V9
    { regex: /OR\s+(\d+)/, label: 'OR pattern' }, // Handles OR 70
    { regex: /(\d+)\s*[A-Z]$/, label: 'Number with suffix' }
  ]
  
  for (const pattern of patterns) {
    const match = cleanName.match(pattern.regex)
    if (match) {
      const num = parseInt(match[1], 10)
      if (allTruckIds.has(num)) {
        matches.push(num)
      }
    }
  }
  
  return [...new Set(matches)]
}

/**
 * Location-based matching (fallback strategy)
 */
function findLocationBasedMatch(
  vehicle: Vehicle,
  jobsByTruckId: Map<number, Job[]>
): { jobs: Job[], nextJob: Job | undefined, distance: number, customer: string } | null {
  
  let closestMatch: { jobs: Job[], nextJob: Job | undefined, distance: number, customer: string } | null = null
  let shortestDistance = Infinity
  
  for (const [truckId, jobs] of jobsByTruckId.entries()) {
    const activeJob = findNextIncompleteJob(jobs)
    
    if (activeJob?.location) {
      const distance = calculateDistance(
        vehicle.lat,
        vehicle.lng,
        activeJob.location.lat,
        activeJob.location.lng
      )
      
      // Only consider if vehicle is very close (within 2 miles)
      if (distance < 2.0 && distance < shortestDistance) {
        shortestDistance = distance
        closestMatch = {
          jobs,
          nextJob: activeJob,
          distance,
          customer: activeJob.customer || 'Unknown'
        }
      }
    }
  }
  
  return closestMatch
}

/**
 * Haversine distance calculation
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
 * Get summary for dashboard
 */
export function getMatchingSummary(matches: VehicleJobMatch[]): {
  totalVehicles: number
  vehiclesWithJobs: number
  highConfidenceMatches: number
  mediumConfidenceMatches: number
  lowConfidenceMatches: number
  matchMethods: Record<string, number>
} {
  const vehiclesWithJobs = matches.filter(m => m.assignedJobs.length > 0).length
  const highConfidence = matches.filter(m => m.confidence === 'high').length
  const mediumConfidence = matches.filter(m => m.confidence === 'medium').length
  const lowConfidence = matches.filter(m => m.confidence === 'low').length
  
  const matchMethods: Record<string, number> = {}
  matches.forEach(match => {
    if (match.assignedJobs.length > 0) {
      matchMethods[match.matchMethod] = (matchMethods[match.matchMethod] || 0) + 1
    }
  })
  
  return {
    totalVehicles: matches.length,
    vehiclesWithJobs,
    highConfidenceMatches: highConfidence,
    mediumConfidenceMatches: mediumConfidence,
    lowConfidenceMatches: lowConfidence,
    matchMethods
  }
}
