// Gateway Coverage Analytics
// Tracks which vehicles have Samsara telemetry gateways vs GPS-only

export interface GatewayStatus {
  vehicleId: string
  vehicleName: string
  hasGateway: boolean
  hasEngineData: boolean
  hasGpsData: boolean
  lastEngineDataTime?: string
  lastGpsTime?: string
  gatewayType: 'full-telemetry' | 'gps-only' | 'no-data'
  dataFreshness: {
    engineDataAge?: number // minutes
    gpsDataAge?: number // minutes
    isEngineDataStale: boolean
    isGpsDataStale: boolean
  }
  capabilities: {
    fuelLevel: boolean
    engineHours: boolean
    diagnostics: boolean
    realTimeTracking: boolean
  }
}

export interface GatewayCoverage {
  totalVehicles: number
  vehiclesWithGateways: number
  vehiclesGpsOnly: number
  vehiclesNoData: number
  gatewayPenetration: number // percentage
  freshDataVehicles: number
  staleDataVehicles: number
  offlineVehicles: number
  capabilities: {
    fuelMonitoring: number
    engineDiagnostics: number
    realTimeTracking: number
  }
}

/**
 * Analyze gateway coverage for fleet
 */
export function analyzeGatewayCoverage(vehicleData: any[]): {
  coverage: GatewayCoverage
  vehicleStatuses: GatewayStatus[]
} {
  const now = new Date()
  const vehicleStatuses: GatewayStatus[] = []
  
  let vehiclesWithGateways = 0
  let vehiclesGpsOnly = 0
  let vehiclesNoData = 0
  let freshDataVehicles = 0
  let staleDataVehicles = 0
  let offlineVehicles = 0
  
  const capabilities = {
    fuelMonitoring: 0,
    engineDiagnostics: 0,
    realTimeTracking: 0
  }
  
  vehicleData.forEach(vehicle => {
    const diagnostics = vehicle.diagnostics
    const hasEngineData = diagnostics?.hasEngineData || false
    const hasGpsData = diagnostics?.hasGpsData || false
    const isEngineDataStale = diagnostics?.isEngineDataStale || false
    const isGpsDataStale = diagnostics?.isGpsDataStale || false
    
    // Calculate data age
    let engineDataAge: number | undefined
    let gpsDataAge: number | undefined
    
    if (diagnostics?.lastEngineTime) {
      engineDataAge = Math.floor((now.getTime() - new Date(diagnostics.lastEngineTime).getTime()) / (1000 * 60))
    }
    
    if (diagnostics?.lastGpsTime) {
      gpsDataAge = Math.floor((now.getTime() - new Date(diagnostics.lastGpsTime).getTime()) / (1000 * 60))
    }
    
    // Determine gateway type
    let gatewayType: 'full-telemetry' | 'gps-only' | 'no-data'
    let hasGateway = false
    
    if (hasEngineData && hasGpsData) {
      gatewayType = 'full-telemetry'
      hasGateway = true
      vehiclesWithGateways++
    } else if (hasGpsData) {
      gatewayType = 'gps-only'
      vehiclesGpsOnly++
    } else {
      gatewayType = 'no-data'
      vehiclesNoData++
    }
    
    // Track data freshness
    const hasFreshData = (!isEngineDataStale && hasEngineData) || (!isGpsDataStale && hasGpsData)
    if (hasFreshData) {
      freshDataVehicles++
    } else if (hasGpsData || hasEngineData) {
      staleDataVehicles++
    } else {
      offlineVehicles++
    }
    
    // Track capabilities
    if (diagnostics?.fuelLevel !== undefined && diagnostics.fuelLevel > 0) {
      capabilities.fuelMonitoring++
    }
    if (hasEngineData && !isEngineDataStale) {
      capabilities.engineDiagnostics++
    }
    if (hasGpsData && !isGpsDataStale) {
      capabilities.realTimeTracking++
    }
    
    const status: GatewayStatus = {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      hasGateway,
      hasEngineData,
      hasGpsData,
      lastEngineDataTime: diagnostics?.lastEngineTime,
      lastGpsTime: diagnostics?.lastGpsTime,
      gatewayType,
      dataFreshness: {
        engineDataAge,
        gpsDataAge,
        isEngineDataStale,
        isGpsDataStale
      },
      capabilities: {
        fuelLevel: diagnostics?.fuelLevel !== undefined && diagnostics.fuelLevel > 0,
        engineHours: diagnostics?.engineHours !== undefined,
        diagnostics: hasEngineData && !isEngineDataStale,
        realTimeTracking: hasGpsData && !isGpsDataStale
      }
    }
    
    vehicleStatuses.push(status)
  })
  
  const coverage: GatewayCoverage = {
    totalVehicles: vehicleData.length,
    vehiclesWithGateways,
    vehiclesGpsOnly,
    vehiclesNoData,
    gatewayPenetration: vehicleData.length > 0 ? Math.round((vehiclesWithGateways / vehicleData.length) * 100) : 0,
    freshDataVehicles,
    staleDataVehicles,
    offlineVehicles,
    capabilities
  }
  
  return { coverage, vehicleStatuses }
}

/**
 * Get gateway coverage summary for dashboard
 */
export function getGatewaySummary(coverage: GatewayCoverage): string {
  const { totalVehicles, vehiclesWithGateways, gatewayPenetration } = coverage
  
  if (totalVehicles === 0) {
    return "No vehicle data available"
  }
  
  return `${vehiclesWithGateways}/${totalVehicles} vehicles (${gatewayPenetration}%) have full telemetry gateways`
}

/**
 * Categorize vehicles by gateway capability
 */
export function categorizeVehiclesByGateway(vehicleStatuses: GatewayStatus[]): {
  fullTelemetry: GatewayStatus[]
  gpsOnly: GatewayStatus[]
  noData: GatewayStatus[]
} {
  return {
    fullTelemetry: vehicleStatuses.filter(v => v.gatewayType === 'full-telemetry'),
    gpsOnly: vehicleStatuses.filter(v => v.gatewayType === 'gps-only'),
    noData: vehicleStatuses.filter(v => v.gatewayType === 'no-data')
  }
}

/**
 * Get vehicles needing gateway upgrades
 */
export function getVehiclesNeedingGateways(vehicleStatuses: GatewayStatus[]): GatewayStatus[] {
  return vehicleStatuses.filter(v => v.gatewayType !== 'full-telemetry')
}