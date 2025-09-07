'use client'

import { useState } from 'react'
import { 
  Truck, MapPin, Clock, CheckCircle, AlertTriangle, Navigation,
  Fuel, Gauge, Wrench, User, Calendar, Activity, RotateCcw
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
    engineStatus: 'on' | 'off' | 'idle'
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
  }
}

interface VehicleCardProps {
  vehicle: VehicleData
  className?: string
}

export default function VehicleCard({ vehicle, className = '' }: VehicleCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

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
        <div className="vehicle-card-front glass-card p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
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
              onClick={() => setIsFlipped(true)}
              className="btn-secondary p-2 hover:bg-gray-200 transition-colors"
              title="View diagnostics"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Job Assignment */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Assignment</h4>
            {vehicle.assignedJob ? (
              <div className="bg-lime-50 border border-lime-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    Job #{vehicle.assignedJob.id}
                  </span>
                  <span className="text-sm text-gray-600">
                    {vehicle.assignedJob.type}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Status: {vehicle.assignedJob.status}
                </p>
                {vehicle.assignedJob.estimatedLocation && (
                  <p className="text-xs text-gray-500 truncate">
                    📍 {vehicle.assignedJob.estimatedLocation.address}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-gray-400 italic text-sm">No assignment</p>
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
                <span className="text-sm text-gray-700 capitalize">
                  {vehicle.diagnostics.engineStatus}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Fuel className={`h-4 w-4 ${getFuelLevelColor(vehicle.diagnostics.fuelLevel)}`} />
                <span className="text-sm text-gray-700">
                  {vehicle.diagnostics.fuelLevel}% fuel
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(vehicle.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* BACK SIDE - Detailed Diagnostics */}
        <div className="vehicle-card-back glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-pepgrey p-3 rounded-lg">
                <Gauge className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-pepgrey-900">
                  Vehicle Diagnostics
                </h3>
                <p className="text-sm text-pepgrey-500">{vehicle.vehicleName}</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsFlipped(false)}
              className="btn-secondary p-2 hover:bg-pepgrey-200 transition-colors"
              title="Back to main view"
            >
              <RotateCcw className="h-4 w-4 rotate-180" />
            </button>
          </div>

          {vehicle.diagnostics ? (
            <div className="space-y-4">
              {/* Engine & Performance */}
              <div>
                <h4 className="text-sm font-semibold text-pepgrey-700 mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Engine & Performance
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-pepgrey-600">Status:</span>
                      <span className={`font-medium capitalize ${getEngineStatusColor(vehicle.diagnostics.engineStatus)}`}>
                        {vehicle.diagnostics.engineStatus}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-pepgrey-600">Speed:</span>
                      <span className="font-medium text-pepgrey-900">
                        {vehicle.diagnostics.speed} mph
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-pepgrey-600">Engine Hours:</span>
                      <span className="font-medium text-pepgrey-900">
                        {vehicle.diagnostics.engineHours.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-pepgrey-600">Odometer:</span>
                      <span className="font-medium text-pepgrey-900">
                        {vehicle.diagnostics.odometer.toLocaleString()} mi
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fluid Levels & Vitals */}
              <div>
                <h4 className="text-sm font-semibold text-pepgrey-700 mb-3 flex items-center">
                  <Fuel className="h-4 w-4 mr-2" />
                  Fluid Levels & Vitals
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-pepgrey-600">Fuel Level:</span>
                      <span className={`font-medium ${getFuelLevelColor(vehicle.diagnostics.fuelLevel)}`}>
                        {vehicle.diagnostics.fuelLevel}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-pepgrey-600">Battery:</span>
                      <span className="font-medium text-pepgrey-900">
                        {vehicle.diagnostics.batteryVoltage}V
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-pepgrey-600">Coolant:</span>
                      <span className="font-medium text-pepgrey-900">
                        {vehicle.diagnostics.coolantTemp}°F
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-pepgrey-600">Oil Pressure:</span>
                      <span className="font-medium text-pepgrey-900">
                        {vehicle.diagnostics.oilPressure} psi
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver & Maintenance */}
              <div>
                <h4 className="text-sm font-semibold text-pepgrey-700 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Driver & Maintenance
                </h4>
                <div className="space-y-3">
                  {vehicle.diagnostics.driverName && (
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-pepgrey-600">Current Driver:</span>
                        <span className="font-medium text-pepgrey-900">
                          {vehicle.diagnostics.driverName}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-3">
                    {vehicle.diagnostics.lastMaintenance && (
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-pepgrey-600 flex items-center">
                            <Wrench className="h-3 w-3 mr-1" />
                            Last Service:
                          </span>
                          <span className="font-medium text-pepgrey-900 text-sm">
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
              <Gauge className="h-12 w-12 text-pepgrey-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-pepgrey-500 mb-2">
                No Diagnostics Available
              </h3>
              <p className="text-pepgrey-400">
                Diagnostic data not available for this vehicle
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}