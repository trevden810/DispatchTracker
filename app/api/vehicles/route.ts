// Samsara Vehicles API Route
import { NextResponse } from 'next/server'

interface Vehicle {
  id: string
  name: string
  status: 'active' | 'idle' | 'offline'
  location: {
    lat: number
    lng: number
    address?: string
  } | null
  fuel_level_percent: number
  speed_mph: number
  last_updated: string
}

const SAMSARA_CONFIG = {
  baseUrl: 'https://api.samsara.com',
  token: process.env.SAMSARA_API_TOKEN
}

export async function GET() {
  try {
    console.log('🚗 Fetching vehicles from Samsara API...')
    
    const response = await fetch(`${SAMSARA_CONFIG.baseUrl}/fleet/vehicles`, {
      headers: {
        'Authorization': `Bearer ${SAMSARA_CONFIG.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Samsara API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform Samsara data to our format
    const vehicles: Vehicle[] = data.data?.map((vehicle: any) => ({
      id: vehicle.id,
      name: vehicle.name || `Vehicle ${vehicle.id}`,
      status: vehicle.engineStates?.[0]?.value === 'On' ? 'active' : 'idle',
      location: vehicle.gpsLocation ? {
        lat: vehicle.gpsLocation.latitude,
        lng: vehicle.gpsLocation.longitude,
        address: vehicle.gpsLocation.reverseGeo?.formattedLocation
      } : null,
      fuel_level_percent: vehicle.fuelPercents?.[0]?.value || 0,
      speed_mph: vehicle.speeds?.[0]?.value || 0,
      last_updated: new Date().toISOString()
    })) || []

    console.log(`✅ Loaded ${vehicles.length} vehicles`)
    
    return NextResponse.json({
      success: true,
      data: vehicles,
      count: vehicles.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Samsara vehicles error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch vehicles',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}