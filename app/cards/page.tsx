'use client'

import { useState, useEffect } from 'react'
import { Truck, AlertTriangle, RefreshCw, Grid3X3, List, Clipboard, Search, Filter } from 'lucide-react'
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
  } | null
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
  // 🚛 NEW: Route assignment information
  routeInfo?: {
    routeId: number
    currentStop?: number
    totalStops: number
    completedStops: number
    percentComplete: number
  } | null
}

export default function VehicleCards() {
  const [trackingData, setTrackingData] = useState<TrackingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all')

  const fetchTrackingData = async () => {
    try {
      // Fetch both vehicle data and correlation data in parallel
      const [vehicleResponse, trackingResponse] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/tracking')
      ])

      const vehicleData = await vehicleResponse.json()
      const trackingData = await trackingResponse.json()

      if (vehicleData.success && trackingData.success) {
        // Merge vehicle data with correlation data to create TrackingData format
        const mergedData: TrackingData[] = vehicleData.data.map((vehicle: any) => {
          // Find the correlation data for this vehicle
          const correlation = trackingData.data.find((corr: any) => corr.vehicleId === vehicle.id)

          return {
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            vehicleLocation: vehicle.location ? {
              lat: vehicle.location.latitude,
              lng: vehicle.location.longitude,
              address: vehicle.location.address
            } : null,
            assignedJob: correlation?.assignedJob || null,
            proximity: correlation?.proximity ? {
              isAtJob: correlation.proximity.isAtJobSite || false,
              distance: correlation.proximity.distance,
              status: correlation.proximity.status || 'no-location'
            } : null,
            lastUpdated: vehicle.lastUpdated,
            diagnostics: vehicle.diagnostics,
            routeInfo: correlation?.routeInfo || null
          }
        })

        console.log('🔍 VALIDATION LOG: Merged tracking data structure:', {
          mergedLength: mergedData.length,
          firstItem: mergedData[0],
          firstItemKeys: mergedData[0] ? Object.keys(mergedData[0]) : null
        })

        setTrackingData(mergedData)
        setError(null)
        setLastRefresh(new Date())

        console.log('🔍 CARDS PAGE LOCATION DEBUG: Final merged data:', mergedData.slice(0, 2).map(v => ({
          vehicleId: v.vehicleId,
          vehicleName: v.vehicleName,
          hasLocation: !!(v.vehicleLocation?.lat && v.vehicleLocation?.lng),
          hasJob: !!v.assignedJob
        })))
      } else {
        setError(vehicleData.error || trackingData.error || 'Failed to load tracking data')
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

  // Filter tracking data based on search and filter
  const filteredTrackingData = trackingData.filter(vehicle => {
    // Filter by assignment status
    if (filter === 'assigned' && !vehicle.assignedJob) return false
    if (filter === 'unassigned' && vehicle.assignedJob) return false
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const vehicleMatch = vehicle.vehicleName.toLowerCase().includes(searchLower)
      const jobMatch = vehicle.assignedJob ? (
        vehicle.assignedJob.id.toString().includes(searchLower) ||
        vehicle.assignedJob.type?.toLowerCase().includes(searchLower) ||
        vehicle.assignedJob.status?.toLowerCase().includes(searchLower)
      ) : false
      
      return vehicleMatch || jobMatch
    }
    
    return true
  })

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

  // Debug logging for proximity
  console.log('Tracking data proximity check:', trackingData.map(t => ({
    vehicleId: t.vehicleId,
    vehicleName: t.vehicleName,
    proximity: t.proximity
  })))

  const summary = {
    total: trackingData.length,
    withJobs: trackingData.filter(t => t.assignedJob).length,
    atJobs: trackingData.filter(t => t.proximity?.isAtJob).length, // Safe access
    withDiagnostics: trackingData.filter(t => t.diagnostics).length,
    // 🚛 NEW: Route metrics
    withRoutes: trackingData.filter(t => t.routeInfo).length,
    // Filtered results
    filtered: filteredTrackingData.length
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
                  PepMove DispatchTracker
                </h1>
                <p className="text-lime-100">Real-time fleet management • Enhanced vehicle diagnostics • Job assignments</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
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
            <div className="text-2xl font-bold text-purple-600">{summary.withRoutes}</div>
            <div className="text-sm text-gray-600">Route Assigned</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.withDiagnostics}</div>
            <div className="text-sm text-gray-600">With Diagnostics</div>
          </div>
        </div>

        {/* Enhanced Controls with Search and Filter */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Live Fleet Operations Dashboard
              </h2>
              <p className="text-gray-600 text-sm">
              Real-time vehicle tracking, job assignments, driver status, and comprehensive diagnostics
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles or jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>
              
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="all">All Vehicles</option>
                <option value="assigned">Assigned Only</option>
                <option value="unassigned">Unassigned Only</option>
              </select>
              
              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`btn-primary flex items-center space-x-2 ${
                  refreshing ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
          
          {/* Search Results Info */}
          {(searchTerm || filter !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {summary.filtered} of {summary.total} vehicles
                {searchTerm && (
                  <span>
                    {' '}matching "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-lime-600 hover:text-lime-700 underline"
                    >
                      clear search
                    </button>
                  </span>
                )}
                {filter !== 'all' && (
                  <span>
                    {' '}• Filter: {filter === 'assigned' ? 'Assigned vehicles only' : 'Unassigned vehicles only'}
                    <button
                      onClick={() => setFilter('all')}
                      className="ml-2 text-lime-600 hover:text-lime-700 underline"
                    >
                      show all
                    </button>
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTrackingData.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.vehicleId}
              vehicle={vehicle}
              className="animate-fade-in"
            />
          ))}
        </div>
        
        {filteredTrackingData.length === 0 && (
          <div className="glass-card p-12 text-center animate-fade-in">
            <Truck className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-500 mb-3">
              {searchTerm ? 'No Vehicles Found' : 'No Vehicles Available'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? 'No vehicles match your search criteria' 
                : 'Vehicle cards will appear here when tracking data is available'
              }
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="btn-secondary"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={handleRefresh}
                className="btn-primary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for Vehicles
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
