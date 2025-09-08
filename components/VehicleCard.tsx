'use client'

import { useState } from 'react'
import { 
  Truck, MapPin, Clock, CheckCircle, AlertTriangle, Navigation,
  Fuel, Gauge, Wrench, User, Calendar, Activity
} from 'lucide-react'

interface VehicleData {
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
  // Enhanced Samsara vehicle diagnostics
  diagnostics?: {
    engineStatus: 'on' | 'off' | 'idle' | 'unknown'
    fuelLevel: number // percentage
    speed: number // mph
    engineHours: number
    odometer: number // miles
    batteryVoltage: number
    coolantTemp: number // fahrenheit
    oilPressure: number // psi
    lastMaintenance?: string
    nextMaintenance?: string
    driverName?: string
    driverId?: string
    lastGpsTime?: string
    lastEngineTime?: string
    isEngineDataStale?: boolean
    isGpsDataStale?: boolean
    hasEngineData?: boolean
    hasGpsData?: boolean
  }
  // Enhanced driver behavior tracking
  driverBehavior?: {
    isDriving: boolean // speed > 5 mph
    isIdleAtNonJob: boolean // stopped at non-job location > 30 min
    idleTime?: number // minutes idle
    lastMovement?: string // timestamp of last movement
    isOffRoute?: boolean // significantly off expected route
  }
}

interface VehicleCardProps {
  vehicle: VehicleData
  className?: string
}

export default function VehicleCard({ vehicle, className = '' }: VehicleCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  
  // Debug logging
  console.log(`Vehicle ${vehicle.vehicleName} flip state:`, isFlipped)

  // Enhanced driver behavior analysis based on REAL Samsara data
  const getDriverBehaviorStatus = () => {
    const speed = vehicle.diagnostics?.speed || 0
    const engineStatus = vehicle.diagnostics?.engineStatus || 'unknown'
    const isAtJob = vehicle.proximity.isAtJob
    const hasJob = !!vehicle.assignedJob
    
    // Debug logging for real data
    console.log(`🚛 ${vehicle.vehicleName} Status Analysis:`, {
      speed,
      engineStatus,
      isAtJob,
      hasJob,
      lastUpdated: vehicle.lastUpdated,
      hasEngineData: engineStatus !== 'unknown',
      isEngineDataStale: vehicle.diagnostics?.isEngineDataStale,
      isGpsDataStale: vehicle.diagnostics?.isGpsDataStale,
      lastEngineTime: vehicle.diagnostics?.lastEngineTime,
      lastGpsTime: vehicle.diagnostics?.lastGpsTime
    })
    
    // Mock idle time calculation (replace with real backend calculation)
    const mockIdleTime = speed <= 5 ? Math.floor(Math.random() * 120) + 5 : 0
    
    // Priority-based status determination with explicit engine status handling
    
    // Handle stale GPS data - very important!
    if (vehicle.diagnostics?.isGpsDataStale) {
      if (hasJob) {
        return {
          status: 'stale-data-job',
          label: 'Last Known Location',
          color: 'gray',
          animation: 'none',
          priority: 5
        }
      } else {
        return {
          status: 'stale-data',
          label: 'GPS Data Stale',
          color: 'gray',
          animation: 'none',
          priority: 5
        }
      }
    }
    
    // Handle driving state (check for stale engine data)
    if (speed > 5 && engineStatus === 'on' && !vehicle.diagnostics?.isEngineDataStale) {
      return {
        status: 'driving',
        label: hasJob ? 'En Route to Job' : 'Driving',
        color: 'lime',
        animation: 'pulse',
        priority: 1
      }
    }
    
    // Handle GPS-based driving fallback (engine data unknown or stale)
    if (speed > 5 && (engineStatus === 'unknown' || engineStatus === 'off' || vehicle.diagnostics?.isEngineDataStale)) {
      return {
        status: 'driving',
        label: hasJob ? 'En Route (GPS)' : 'Moving (GPS)',
        color: 'lime',
        animation: 'pulse',
        priority: 1
      }
    }
    
    // Handle at job site
    if (isAtJob && hasJob) {
      return {
        status: 'at-job',
        label: 'On Job Site',
        color: 'emerald',
        animation: 'glow',
        priority: 1
      }
    }
    
    // Handle idle alerts (engine on, not at job, long idle time)
    if (speed <= 5 && (engineStatus === 'on' || engineStatus === 'idle') && !isAtJob && hasJob && mockIdleTime > 30) {
      return {
        status: 'idle-non-job',
        label: `Idle Alert ${mockIdleTime}m`,
        color: 'red',
        animation: 'flash',
        priority: 3,
        idleTime: mockIdleTime
      }
    }
    
    // Handle stopped with job (engine on/idle)
    if (speed <= 5 && (engineStatus === 'on' || engineStatus === 'idle') && hasJob) {
      return {
        status: 'stopped-with-job',
        label: 'Stopped (Job)',
        color: 'amber',
        animation: 'steady',
        priority: 2
      }
    }
    
    // Handle engine off with job
    if (engineStatus === 'off' && hasJob) {
      return {
        status: 'offline-with-job',
        label: 'Engine Off',
        color: 'gray',
        animation: 'none',
        priority: 4
      }
    }
    
    // Handle unknown status with job
    if (engineStatus === 'unknown' && hasJob) {
      return {
        status: 'stationary',
        label: 'Stationary (Job)',
        color: 'gray',
        animation: 'none',
        priority: 4
      }
    }
    
    // Handle available vehicles (no job)
    if (!hasJob && (engineStatus === 'on' || engineStatus === 'idle')) {
      return {
        status: 'available',
        label: 'Available',
        color: 'blue',
        animation: 'breathe',
        priority: 0
      }
    }
    
    // Handle slow GPS movement
    if (speed > 0 && speed <= 5 && (engineStatus === 'unknown' || engineStatus === 'off')) {
      return {
        status: 'slow-moving',
        label: 'Slow Speed',
        color: 'amber',
        animation: 'steady',
        priority: 2
      }
    }
    
    // Default state - parked/offline
    return {
      status: 'offline',
      label: hasJob ? 'Parked (Job)' : 'Parked',
      color: 'gray',
      animation: 'none',
      priority: 4
    }
  }
  
  const driverStatus = getDriverBehaviorStatus()
  
  const getBorderClasses = () => {
    const base = 'border-2 transition-all duration-500'
    
    switch (driverStatus.status) {
      case 'driving':
        return `${base} border-lime-400 shadow-lime-200 border-animate-pulse`
      case 'at-job':
        return `${base} border-emerald-500 shadow-emerald-300 border-animate-glow`
      case 'idle-non-job':
        return `${base} border-red-500 shadow-red-300 border-animate-flash`
      case 'stopped-with-job':
        return `${base} border-amber-400 shadow-amber-200`
      case 'available':
        return `${base} border-blue-400 shadow-blue-200 border-animate-breathe`
      default:
        return `${base} border-gray-300`
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'at-location': 
        return {
          color: 'badge-at-location',
          icon: <CheckCircle className="h-4 w-4" />,
          pulse: 'pulse-green'
        }
      case 'nearby': 
        return {
          color: 'badge-nearby',
          icon: <MapPin className="h-4 w-4" />,
          pulse: 'pulse-blue'
        }
      case 'en-route': 
        return {
          color: 'badge-en-route',
          icon: <Navigation className="h-4 w-4" />,
          pulse: 'pulse-amber'
        }
      case 'far': 
        return {
          color: 'badge-far',
          icon: <AlertTriangle className="h-4 w-4" />,
          pulse: 'pulse-red'
        }
      default: 
        return {
          color: 'badge-no-location',
          icon: <Clock className="h-4 w-4" />,
          pulse: ''
        }
    }
  }

  const formatDistance = (miles?: number) => {
    if (!miles) return ''
    if (miles < 0.1) return `${Math.round(miles * 5280)} ft`
    return `${Math.round(miles * 10) / 10} mi`
  }

  const getEngineStatusColor = (status: string) => {
    switch (status) {
      case 'on': return 'text-lime-600'
      case 'idle': return 'text-amber-600'
      case 'off': return 'text-gray-400'
      case 'unknown': return 'text-gray-500'
      default: return 'text-gray-400'
    }
  }

  const getFuelLevelColor = (level: number) => {
    if (level > 50) return 'text-lime-600'
    if (level > 25) return 'text-amber-600'
    return 'text-red-600'
  }

  const statusConfig = getStatusConfig(vehicle.proximity.status)

  return (
    <div className={`vehicle-card-container ${className}`}>
      <div className={`vehicle-card ${isFlipped ? 'flipped' : ''}`}>
        {/* FRONT SIDE - Main Vehicle Info */}
        <div className={`vehicle-card-front glass-card p-6 card-hover relative ${getBorderClasses()}`}>
          {/* Driver Status Indicator */}
          <div className="absolute top-2 left-2 z-10">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
              driverStatus.color === 'lime' ? 'bg-lime-100 text-lime-800 border border-lime-300' :
              driverStatus.color === 'emerald' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              driverStatus.color === 'red' ? 'bg-red-100 text-red-800 border border-red-300' :
              driverStatus.color === 'amber' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              driverStatus.color === 'blue' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
              'bg-gray-100 text-gray-800 border border-gray-300'
            }`}>
              {driverStatus.color === 'lime' && <span className="h-2 w-2 bg-lime-500 rounded-full animate-pulse"></span>}
              {driverStatus.color === 'emerald' && <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>}
              {driverStatus.color === 'red' && <span className="h-2 w-2 bg-red-500 rounded-full animate-ping"></span>}
              {driverStatus.color === 'amber' && <span className="h-2 w-2 bg-amber-500 rounded-full"></span>}
              {driverStatus.color === 'blue' && <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>}
              <span>{driverStatus.label}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4 mt-8">{/* Added mt-8 for status indicator spacing */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-pepmove p-3 rounded-lg relative">
                <Truck className="h-6 w-6 text-white" />
                {vehicle.proximity.isAtJob && (
                  <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${statusConfig.pulse}`}></div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {vehicle.vehicleName}
                </h3>
                <p className="text-sm text-gray-500">ID: {vehicle.vehicleId}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                console.log('Gauge button clicked, flipping to diagnostics')
                setIsFlipped(true)
              }}
              className="flip-button bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-3 rounded-lg transition-colors cursor-pointer flex items-center space-x-2"
              title="View diagnostics"
            >
              <Gauge className="h-5 w-5" />
              <span className="text-sm font-medium">Diagnostics</span>
            </button>
          </div>

          {/* Job Assignment */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Assignment</h4>
            {vehicle.assignedJob ? (
              <div className={`border rounded-lg p-3 ${
                ['Complete', 'Done', 'Delivered', 'Successful', 'Finished', 'Accomplished', 'Completed'].includes(vehicle.assignedJob.status)
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-lime-50 border-lime-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 flex items-center">
                    Job #{vehicle.assignedJob.id}
                    {['Complete', 'Done', 'Delivered', 'Successful', 'Finished', 'Accomplished', 'Completed'].includes(vehicle.assignedJob.status) && (
                      <CheckCircle className="h-4 w-4 ml-2 text-emerald-600" />
                    )}
                  </span>
                  <span className="text-sm text-gray-600">
                    {vehicle.assignedJob.type}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">
                    Status: <span className={`font-medium ${
                      ['Complete', 'Done', 'Delivered', 'Successful', 'Finished', 'Accomplished', 'Completed'].includes(vehicle.assignedJob.status)
                        ? 'text-emerald-700' 
                        : 'text-lime-700'
                    }`}>{vehicle.assignedJob.status}</span>
                  </span>
                  {vehicle.proximity.distance !== undefined && (
                    <span className={`text-sm font-medium ${
                      vehicle.proximity.isAtJob ? 'text-emerald-600' : 'text-gray-600'
                    }`}>
                      {vehicle.proximity.isAtJob ? '📍 On Location' : `${formatDistance(vehicle.proximity.distance)} away`}
                    </span>
                  )}
                </div>
                {vehicle.assignedJob.estimatedLocation && (
                  <p className="text-xs text-gray-500 truncate">
                    📍 {vehicle.assignedJob.estimatedLocation.address}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Navigation className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-blue-700 font-medium text-sm">Available for Dispatch</span>
                </div>
                <p className="text-blue-600 text-xs">Ready for new assignment</p>
              </div>
            )}
          </div>

          {/* Location Status */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Location Status</h4>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                {statusConfig.icon}
                <span className="ml-2 capitalize">
                  {vehicle.proximity.status.replace('-', ' ')}
                </span>
              </span>
              <span className="text-sm font-medium text-gray-700">
                {vehicle.proximity.distance ? formatDistance(vehicle.proximity.distance) : '—'}
              </span>
            </div>
          </div>

          {/* Quick Diagnostics */}
          {vehicle.diagnostics && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Activity className={`h-4 w-4 ${getEngineStatusColor(vehicle.diagnostics.engineStatus)}`} />
                <span className="text-sm text-gray-700">
                  {vehicle.diagnostics.engineStatus === 'unknown' ? (
                    <span className="text-gray-500">Engine: No data</span>
                  ) : (
                    <span className="capitalize">Engine: {vehicle.diagnostics.engineStatus}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Fuel className={`h-4 w-4 ${getFuelLevelColor(vehicle.diagnostics.fuelLevel)}`} />
                <span className="text-sm text-gray-700">
                  {vehicle.diagnostics.fuelLevel > 0 ? (
                    `${vehicle.diagnostics.fuelLevel}% fuel`
                  ) : (
                    <span className="text-gray-500">Fuel: No data</span>
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(vehicle.lastUpdated).toLocaleTimeString()}
              </p>
              <div className="text-xs text-gray-400">
                {vehicle.diagnostics?.isGpsDataStale ? (
                  <span className="text-red-600">⚠️ GPS data stale (over 30min)</span>
                ) : vehicle.diagnostics?.isEngineDataStale ? (
                  <span className="text-amber-600">⚠️ Engine data stale</span>
                ) : vehicle.diagnostics?.engineStatus === 'unknown' ? (
                  <span>GPS data only</span>
                ) : (
                  <span>Live engine + GPS</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BACK SIDE - Detailed Diagnostics */}
        <div className={`vehicle-card-back glass-card p-6 relative ${getBorderClasses()}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-3 rounded-lg">
                <Gauge className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Vehicle Diagnostics
                </h3>
                <p className="text-sm text-gray-500">{vehicle.vehicleName}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                console.log('Truck button clicked, flipping to main view')
                setIsFlipped(false)
              }}
              className="flip-button bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors cursor-pointer flex items-center space-x-2"
              title="Back to main view"
            >
              <Truck className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          {vehicle.diagnostics ? (
            <div className="space-y-4">
              {/* Engine & Performance */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Engine & Performance
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium capitalize ${getEngineStatusColor(vehicle.diagnostics.engineStatus)}`}>
                        {vehicle.diagnostics.engineStatus === 'unknown' ? (
                          <span className="text-gray-500 text-xs">No engine data</span>
                        ) : (
                          vehicle.diagnostics.engineStatus
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Speed:</span>
                      <span className="font-medium text-gray-900">
                        {vehicle.diagnostics.speed} mph
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engine Hours:</span>
                      <span className="font-medium text-gray-900">
                        {vehicle.diagnostics.engineHours.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Odometer:</span>
                      <span className="font-medium text-gray-900">
                        {vehicle.diagnostics.odometer.toLocaleString()} mi
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fluid Levels & Vitals */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Fuel className="h-4 w-4 mr-2" />
                  Fluid Levels & Vitals
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel Level:</span>
                      <span className={`font-medium ${getFuelLevelColor(vehicle.diagnostics.fuelLevel)}`}>
                        {vehicle.diagnostics.fuelLevel > 0 ? (
                          `${vehicle.diagnostics.fuelLevel}%`
                        ) : (
                          <span className="text-gray-500 text-xs">No fuel data</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Battery:</span>
                      <span className="font-medium text-gray-900">
                        {vehicle.diagnostics.batteryVoltage}V
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coolant:</span>
                      <span className="font-medium text-gray-900">
                        {vehicle.diagnostics.coolantTemp}°F
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Oil Pressure:</span>
                      <span className="font-medium text-gray-900">
                        {vehicle.diagnostics.oilPressure} psi
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver & Maintenance */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Driver & Maintenance
                </h4>
                <div className="space-y-3">
                  {vehicle.diagnostics.driverName && (
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Driver:</span>
                        <span className="font-medium text-gray-900">
                          {vehicle.diagnostics.driverName}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-3">
                    {vehicle.diagnostics.lastMaintenance && (
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center">
                            <Wrench className="h-3 w-3 mr-1" />
                            Last Service:
                          </span>
                          <span className="font-medium text-gray-900 text-sm">
                            {vehicle.diagnostics.lastMaintenance}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {vehicle.diagnostics.nextMaintenance && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-700 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Next Service:
                          </span>
                          <span className="font-medium text-amber-800 text-sm">
                            {vehicle.diagnostics.nextMaintenance}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Gauge className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                No Diagnostics Available
              </h3>
              <p className="text-gray-400">
                Diagnostic data not available for this vehicle
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}