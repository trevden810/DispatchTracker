'use client'

import { useState, useEffect } from 'react'
import { Truck, AlertTriangle, RefreshCw, Grid3X3, List } from 'lucide-react'
import VehicleCard from '../../components/VehicleCard'

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
  diagnostics?: {
    engineStatus: 'on' | 'off' | 'idle'
    fuelLevel: number
    speed: number
    engineHours: number
    odometer: number
    batteryVoltage: number
    coolantTemp: number
    oilPressure: number
    lastMaintenance?: string
    nextMaintenance?: string
    driverName?: string
    driverId?: string
  }
}

export default function VehicleCards() {
  const [trackingData, setTrackingData] = useState<TrackingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTrackingData = async () => {
    try {
      const response = await fetch('/api/tracking')
      const data = await response.json()
      
      if (data.success) {
        setTrackingData(data.data)
        setError(null)
        setLastRefresh(new Date())
      } else {
        setError(data.error || 'Failed to load tracking data')
      }
    } catch (err) {
      setError('Network error loading tracking data')
      console.error('Tracking data error:', err)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTrackingData()
    setTimeout(() => setRefreshing(false), 500)
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchTrackingData()
      setLoading(false)
    }
    
    loadData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTrackingData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-lime-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="loading-ring h-12 w-12 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Vehicle Fleet</h2>
          <p className="text-gray-500">Fetching diagnostics and tracking data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center mobile-padding">
        <div className="glass-card p-8 max-w-md w-full text-center animate-slide-up">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={handleRefresh}
            className="btn-primary w-full"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Reconnect
          </button>
        </div>
      </div>
    )
  }

  const summary = {
    total: trackingData.length,
    withJobs: trackingData.filter(t => t.assignedJob).length,
    atJobs: trackingData.filter(t => t.proximity.isAtJob).length,
    withDiagnostics: trackingData.filter(t => t.diagnostics).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-lime-50">
      {/* Header */}
      <div className="bg-gradient-pepmove shadow-lg">
        <div className="container-responsive py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Grid3X3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white text-shadow-sm">
                  Fleet Vehicle Cards
                </h1>
                <p className="text-lime-100">Detailed diagnostics and real-time tracking</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a 
                href="/"
                className="btn-secondary bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <List className="h-4 w-4 mr-2" />
                Table View
              </a>
              <div className="text-right text-white">
                <div className="text-sm text-lime-100">
                  {lastRefresh ? (
                    <>Last update: {lastRefresh.toLocaleTimeString()}</>
                  ) : (
                    'Initializing...'
                  )}
                </div>
                <div className="text-xs text-lime-200">
                  {summary.withDiagnostics}/{summary.total} with diagnostics
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            <div className="text-sm text-gray-600">Total Vehicles</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-lime-600">{summary.withJobs}</div>
            <div className="text-sm text-gray-600">With Jobs</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{summary.atJobs}</div>
            <div className="text-sm text-gray-600">On Location</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.withDiagnostics}</div>
            <div className="text-sm text-gray-600">With Diagnostics</div>
          </div>
        </div>

        {/* Controls */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Vehicle Diagnostics Dashboard
              </h2>
              <p className="text-gray-600 text-sm">
                Click any card to flip and view detailed diagnostics • Auto-refresh every 30 seconds
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`btn-primary flex items-center space-x-2 ${
                refreshing ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Updating...' : 'Refresh Now'}</span>
            </button>
          </div>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {trackingData.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.vehicleId}
              vehicle={vehicle}
              className="animate-fade-in"
            />
          ))}
        </div>
        
        {trackingData.length === 0 && (
          <div className="glass-card p-12 text-center animate-fade-in">
            <Truck className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-500 mb-3">
              No Vehicles Available
            </h3>
            <p className="text-gray-400 mb-6">
              Vehicle cards will appear here when tracking data is available
            </p>
            <button
              onClick={handleRefresh}
              className="btn-primary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Vehicles
            </button>
          </div>
        )}
      </div>
    </div>
  )
}