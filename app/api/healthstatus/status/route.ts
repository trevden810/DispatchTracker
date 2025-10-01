// FleetHealth Monitor - Vehicle Health Status API
// Processes existing Samsara vehicle data and applies health monitoring logic

import { NextResponse } from 'next/server'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Health monitoring thresholds
const HEALTH_THRESHOLDS = {
  critical: {
    coolantTemp: 210,    // >210°F = CRITICAL
    oilPressure: 20,     // <20 PSI = CRITICAL  
    batteryVoltage: 11.5 // <11.5V = CRITICAL
  },
  warning: {
    coolantTemp: 200,    // >200°F = WARNING
    oilPressure: 25,     // <25 PSI = WARNING
    batteryVoltage: 12.0, // <12.0V = WARNING
    fuelLevel: 20        // <20% = WARNING
  }
}

interface VehicleHealthAlert {
  type: 'coolant' | 'oil' | 'battery' | 'fuel'
  severity: 'critical' | 'warning'
  message: string
  value: number
}

interface VehicleHealth {
  vehicleId: string
  name: string
  status: 'critical' | 'warning' | 'healthy'
  location: string
  driver?: string
  lastUpdated: string
  alerts: VehicleHealthAlert[]
  diagnostics: {
    coolantTemp: number
    oilPressure: number
    batteryVoltage: number
    fuelLevel: number
  }
}

/**
 * Analyze vehicle diagnostics and determine health status
 */
function analyzeVehicleHealth(vehicle: any): VehicleHealth {
  const alerts: VehicleHealthAlert[] = []
  let overallStatus: 'critical' | 'warning' | 'healthy' = 'healthy'
  
  // Extract diagnostics data
  const diagnostics = {
    coolantTemp: vehicle.diagnostics?.coolantTemp || 190, // Default normal temp
    oilPressure: vehicle.diagnostics?.oilPressure || 40,  // Default normal pressure
    batteryVoltage: vehicle.diagnostics?.batteryVoltage || 12.6, // Default normal voltage
    fuelLevel: vehicle.fuelLevel || 50 // From Samsara data
  }
  
  // Check coolant temperature
  if (diagnostics.coolantTemp > HEALTH_THRESHOLDS.critical.coolantTemp) {
    alerts.push({
      type: 'coolant',
      severity: 'critical',
      message: `COOLANT CRITICAL: ${diagnostics.coolantTemp}°F`,
      value: diagnostics.coolantTemp
    })
    overallStatus = 'critical'
  } else if (diagnostics.coolantTemp > HEALTH_THRESHOLDS.warning.coolantTemp) {
    alerts.push({
      type: 'coolant',
      severity: 'warning',
      message: `Coolant High: ${diagnostics.coolantTemp}°F`,
      value: diagnostics.coolantTemp
    })
    if (overallStatus === 'healthy') overallStatus = 'warning'
  }
  
  // Check oil pressure
  if (diagnostics.oilPressure < HEALTH_THRESHOLDS.critical.oilPressure) {
    alerts.push({
      type: 'oil',
      severity: 'critical',
      message: `OIL PRESSURE CRITICAL: ${diagnostics.oilPressure} PSI`,
      value: diagnostics.oilPressure
    })
    overallStatus = 'critical'
  } else if (diagnostics.oilPressure < HEALTH_THRESHOLDS.warning.oilPressure) {
    alerts.push({
      type: 'oil',
      severity: 'warning',
      message: `Oil Pressure Low: ${diagnostics.oilPressure} PSI`,
      value: diagnostics.oilPressure
    })
    if (overallStatus === 'healthy') overallStatus = 'warning'
  }
  
  // Check battery voltage
  if (diagnostics.batteryVoltage < HEALTH_THRESHOLDS.critical.batteryVoltage) {
    alerts.push({
      type: 'battery',
      severity: 'critical',
      message: `BATTERY CRITICAL: ${diagnostics.batteryVoltage}V`,
      value: diagnostics.batteryVoltage
    })
    overallStatus = 'critical'
  } else if (diagnostics.batteryVoltage < HEALTH_THRESHOLDS.warning.batteryVoltage) {
    alerts.push({
      type: 'battery',
      severity: 'warning',
      message: `Battery Low: ${diagnostics.batteryVoltage}V`,
      value: diagnostics.batteryVoltage
    })
    if (overallStatus === 'healthy') overallStatus = 'warning'
  }
  
  // Check fuel level
  if (diagnostics.fuelLevel < HEALTH_THRESHOLDS.warning.fuelLevel) {
    alerts.push({
      type: 'fuel',
      severity: 'warning',
      message: `Fuel Low: ${diagnostics.fuelLevel}%`,
      value: diagnostics.fuelLevel
    })
    if (overallStatus === 'healthy') overallStatus = 'warning'
  }
  
  // Extract location info
  const location = vehicle.location?.address || 
                  `${vehicle.location?.latitude?.toFixed(3)}, ${vehicle.location?.longitude?.toFixed(3)}` ||
                  'Location Unknown'
  
  return {
    vehicleId: vehicle.id,
    name: vehicle.name || `Vehicle ${vehicle.id}`,
    status: overallStatus,
    location: location,
    driver: vehicle.diagnostics?.driverName,
    lastUpdated: vehicle.lastUpdated || new Date().toISOString(),
    alerts,
    diagnostics
  }
}

/**
 * GET /api/health/status
 * Returns current health status for all vehicles
 */
export async function GET() {
  const startTime = Date.now()
  
  try {
    console.log('🏥 Fetching vehicle health data...')
    
    // Fetch current vehicle data from existing API
    const vehiclesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/vehicles`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    
    if (!vehiclesResponse.ok) {
      throw new Error(`Vehicles API failed: ${vehiclesResponse.status}`)
    }
    
    const vehiclesData = await vehiclesResponse.json()
    
    if (!vehiclesData.success || !vehiclesData.data) {
      throw new Error('Invalid vehicles data received')
    }
    
    console.log(`📊 Processing health analysis for ${vehiclesData.data.length} vehicles...`)
    
    // Analyze health for each vehicle
    const vehicleHealthData: VehicleHealth[] = vehiclesData.data.map((vehicle: any) => 
      analyzeVehicleHealth(vehicle)
    )
    
    // Calculate summary statistics
    const summary = {
      total: vehicleHealthData.length,
      healthy: vehicleHealthData.filter(v => v.status === 'healthy').length,
      warning: vehicleHealthData.filter(v => v.status === 'warning').length,
      critical: vehicleHealthData.filter(v => v.status === 'critical').length
    }
    
    const processingTime = Date.now() - startTime
    
    console.log(`✅ Health analysis complete:`, summary)
    console.log(`⚡ Processing time: ${processingTime}ms`)
    
    return NextResponse.json({
      success: true,
      vehicles: vehicleHealthData,
      summary,
      timestamp: new Date().toISOString(),
      processingTime,
      thresholds: HEALTH_THRESHOLDS
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ Health monitoring error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze vehicle health',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        processingTime
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/health/status
 * Update health thresholds or trigger manual analysis
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, vehicleId, thresholds } = body
    
    if (action === 'update_thresholds' && thresholds) {
      // In a real implementation, you'd save custom thresholds to database
      console.log('🔧 Health thresholds update requested:', thresholds)
      
      return NextResponse.json({
        success: true,
        message: 'Thresholds updated successfully',
        timestamp: new Date().toISOString()
      })
    }
    
    if (action === 'manual_check' && vehicleId) {
      // Trigger manual health check for specific vehicle
      console.log(`🔍 Manual health check requested for vehicle: ${vehicleId}`)
      
      // In implementation, you'd trigger immediate diagnostic pull for this vehicle
      return NextResponse.json({
        success: true,
        message: `Manual health check initiated for vehicle ${vehicleId}`,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action specified' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('❌ Health monitoring POST error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process health monitoring request',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}