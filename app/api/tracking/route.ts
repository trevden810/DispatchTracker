// Simplified Job-Vehicle Tracking API
import { NextResponse } from 'next/server'
import { getProximityStatus } from '../../../lib/gps-utils'

interface TrackingData {
  vehicleId: string
  vehicleName: string
  vehicleLocation: {
    lat: number
    lng: number
    address?: string
  } | null
  assignedJob: {
    id: number
    status: string
    type: string
    estimatedLocation?: {
      lat: number
      lng: number
      address: string
    }
  } | null
  proximity: {
    isAtJob: boolean
    distance?: number
    status: 'at-location' | 'nearby' | 'en-route' | 'far' | 'no-location'
  }
  lastUpdated: string
}

// Direct Samsara API call
async function fetchVehicles() {
  const response = await fetch('https://api.samsara.com/fleet/vehicles', {
    headers: {
      'Authorization': `Bearer ${process.env.SAMSARA_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    signal: AbortSignal.timeout(10000) // 10 second timeout
  })

  if (!response.ok) {
    throw new Error(`Samsara API error: ${response.status}`)
  }

  const data = await response.json()
  
  return data.data?.map((vehicle: any) => ({
    id: vehicle.id,
    name: vehicle.name || `Vehicle ${vehicle.id}`,
    status: vehicle.engineStates?.[0]?.value === 'On' ? 'active' : 'idle',
    location: vehicle.gpsLocation ? {
      lat: vehicle.gpsLocation.latitude,
      lng: vehicle.gpsLocation.longitude,
      address: vehicle.gpsLocation.reverseGeo?.formattedLocation
    } : null,
    last_updated: new Date().toISOString()
  })) || []
}

// Direct FileMaker API call
async function fetchJobs() {
  try {
    // Auth
    const authUrl = 'https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/sessions'
    const credentials = Buffer.from(`trevor_api:${process.env.FILEMAKER_PASSWORD}`).toString('base64')
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!authResponse.ok) return []

    const authData = await authResponse.json()
    const token = authData.response.token

    // Query jobs
    const findUrl = 'https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/layouts/jobs_api/_find'
    
    const queryResponse = await fetch(findUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: [{ "job_status": "active" }],
        limit: 100
      }),
      signal: AbortSignal.timeout(10000)
    })

    if (!queryResponse.ok) return []

    const queryData = await queryResponse.json()
    
    return queryData.response.data?.map((record: any) => {
      const fieldData = record.fieldData
      return {
        id: fieldData._kp_job_id,
        status: fieldData.job_status,
        type: fieldData.job_type,
        truckId: fieldData['*kf*trucks_id']
      }
    }) || []
    
  } catch (error) {
    console.warn('FileMaker fetch failed:', error)
    return []
  }
}

export async function GET() {
  try {
    console.log('🎯 Fetching tracking data...')
    
    // Fetch vehicles and jobs directly
    const [vehicles, jobs] = await Promise.all([
      fetchVehicles(),
      fetchJobs()
    ])
    
    // Create job lookup by truck ID
    const jobsByTruck = new Map()
    jobs.forEach((job: any) => {
      if (job.truckId) {
        jobsByTruck.set(job.truckId.toString(), job)
      }
    })
    
    // Mock job locations (replace with actual customer addresses)
    const mockJobLocations = new Map([
      [1, { lat: 39.7392, lng: -104.9903, address: 'Downtown Denver' }],
      [2, { lat: 39.7294, lng: -104.8319, address: 'Aurora City Center' }],
      [3, { lat: 40.0150, lng: -105.2705, address: 'Boulder Main St' }],
      [4, { lat: 38.8339, lng: -104.8214, address: 'Colorado Springs' }],
    ])
    
    // Correlate vehicles with jobs
    const trackingData: TrackingData[] = vehicles.map((vehicle: any) => {
      const assignedJob = jobsByTruck.get(vehicle.id)
      let proximity = { isAtJob: false, status: 'no-location' as const }
      
      if (vehicle.location && assignedJob) {
        const jobLocation = mockJobLocations.get(assignedJob.id)
        
        if (jobLocation) {
          const proximityData = getProximityStatus(
            vehicle.location,
            jobLocation,
            parseFloat(process.env.JOB_PROXIMITY_THRESHOLD_MILES || '0.5')
          )
          
          proximity = {
            isAtJob: proximityData.isAt,
            distance: proximityData.distance,
            status: proximityData.status
          }
          
          assignedJob.estimatedLocation = jobLocation
        }
      }
      
      return {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehicleLocation: vehicle.location,
        assignedJob: assignedJob || null,
        proximity,
        lastUpdated: vehicle.last_updated
      }
    })
    
    console.log(`✅ Processed ${trackingData.length} vehicles`)
    
    return NextResponse.json({
      success: true,
      data: trackingData,
      summary: {
        totalVehicles: vehicles.length,
        vehiclesWithJobs: trackingData.filter(t => t.assignedJob).length,
        vehiclesAtJobs: trackingData.filter(t => t.proximity.isAtJob).length
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Tracking error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load tracking data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}