'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface VehicleHealth {
  vehicleId: string
  name: string
  status: 'critical' | 'warning' | 'healthy'
  location: string
  driver?: string
  lastUpdated: string
  alerts: Array<{
    type: string
    severity: 'critical' | 'warning'
    message: string
    value: number
  }>
  diagnostics: {
    coolantTemp: number
    oilPressure: number
    batteryVoltage: number
    fuelLevel: number
  }
}

export default function FleetHealthDashboard() {
  const [vehicles, setVehicles] = useState<VehicleHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'healthy'>('all')

  // Fetch vehicle health data
  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health/status')
      const data = await response.json()
      
      if (data.success) {
        setVehicles(data.vehicles)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchHealthData()
    const interval = setInterval(fetchHealthData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Filter vehicles by status
  const filteredVehicles = vehicles.filter(vehicle => 
    filter === 'all' ? true : vehicle.status === filter
  )

  // Count vehicles by status
  const statusCounts = {
    healthy: vehicles.filter(v => v.status === 'healthy').length,
    warning: vehicles.filter(v => v.status === 'warning').length,
    critical: vehicles.filter(v => v.status === 'critical').length
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'warning': return 'border-yellow-500 bg-yellow-50'
      case 'healthy': return 'border-green-500 bg-green-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-700">Loading Fleet Health Data...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FleetHealth Monitor</h1>
              <p className="text-gray-600">Real-time vehicle health monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchHealthData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <div className="text-sm text-gray-500">
                Updated: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-800">{statusCounts.healthy}</div>
                <div className="text-green-600">Healthy Vehicles</div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-100 rounded-lg p-6 border border-yellow-200">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-yellow-800">{statusCounts.warning}</div>
                <div className="text-yellow-600">Warning Status</div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-100 rounded-lg p-6 border border-red-200">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-red-800">{statusCounts.critical}</div>
                <div className="text-red-600">Critical Alerts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {['all', 'critical', 'warning', 'healthy'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {status === 'all' ? 'All Vehicles' : `${status.charAt(0).toUpperCase() + status.slice(1)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.vehicleId}
              className={`bg-white rounded-lg border-2 p-6 shadow-sm hover:shadow-md transition-shadow ${getStatusColor(vehicle.status)}`}
            >
              {/* Vehicle Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(vehicle.status)}
                  <h3 className="font-bold text-lg text-gray-900">{vehicle.name}</h3>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(vehicle.lastUpdated).toLocaleTimeString()}
                </div>
              </div>

              {/* Alerts */}
              {vehicle.alerts.length > 0 && (
                <div className="mb-4">
                  {vehicle.alerts.map((alert, index) => (
                    <div key={index} className={`text-sm p-2 rounded mb-2 ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-xs opacity-75">{alert.type}: {alert.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Diagnostics */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Coolant:</span>
                  <span className={vehicle.diagnostics.coolantTemp > 210 ? 'text-red-600 font-bold' : 'text-gray-600'}>
                    {vehicle.diagnostics.coolantTemp}°F
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Oil Pressure:</span>
                  <span className={vehicle.diagnostics.oilPressure < 20 ? 'text-red-600 font-bold' : 'text-gray-600'}>
                    {vehicle.diagnostics.oilPressure} PSI
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Battery:</span>
                  <span className={vehicle.diagnostics.batteryVoltage < 12.0 ? 'text-yellow-600 font-bold' : 'text-gray-600'}>
                    {vehicle.diagnostics.batteryVoltage}V
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fuel:</span>
                  <span className={vehicle.diagnostics.fuelLevel < 20 ? 'text-yellow-600 font-bold' : 'text-gray-600'}>
                    {vehicle.diagnostics.fuelLevel}%
                  </span>
                </div>
              </div>

              {/* Location & Driver */}
              <div className="border-t pt-3 text-sm text-gray-600">
                <div>📍 {vehicle.location}</div>
                {vehicle.driver && <div>👤 {vehicle.driver}</div>}
              </div>

              {/* Quick Actions */}
              {vehicle.status !== 'healthy' && (
                <div className="mt-4 pt-3 border-t space-y-2">
                  {vehicle.status === 'critical' && (
                    <button className="w-full bg-red-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-red-700 transition-colors">
                      🚨 Emergency Alert
                    </button>
                  )}
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                    📋 Schedule Service
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No vehicles found for the selected filter</div>
          </div>
        )}
      </div>
    </div>
  )
}