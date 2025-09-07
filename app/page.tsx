'use client'

import { useState, useEffect } from 'react'
import { Truck, MapPin, Clock, CheckCircle, AlertTriangle, RefreshCw, Navigation, Grid3X3 } from 'lucide-react'

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

export default function DispatchTracker() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-lime-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="loading-ring h-12 w-12 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading DispatchTracker</h2>
          <p className="text-gray-500">Connecting to fleet management systems...</p>
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
    atJobs: trackingData.filter(t => t.proximity.isAtJob).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-lime-50">
      {/* Header */}
      <div className="bg-gradient-pepmove shadow-lg">
        <div className="container-responsive py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white text-shadow-sm">
                  PepMove DispatchTracker
                </h1>
                <p className="text-lime-100">Real-time Fleet Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a 
                href="/cards"
                className="btn-secondary bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Cards View
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
                  Aurora, CO • Mountain Time
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="glass-card p-6 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-pepmove p-3 rounded-lg">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{summary.total}</div>
                  <div className="text-gray-600 font-medium">Fleet Vehicles</div>
                </div>
              </div>
              <div className="h-12 w-1 bg-gradient-pepmove rounded-full"></div>
            </div>
          </div>
          
          <div className="glass-card p-6 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{summary.withJobs}</div>
                  <div className="text-gray-600 font-medium">Active Jobs</div>
                </div>
              </div>
              <div className="h-12 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            </div>
          </div>
          
          <div className="glass-card p-6 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg relative">
                  <CheckCircle className="h-8 w-8 text-white" />
                  {summary.atJobs > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-400 rounded-full pulse-green"></div>
                  )}
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{summary.atJobs}</div>
                  <div className="text-gray-600 font-medium">On Location</div>
                </div>
              </div>
              <div className="h-12 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Live Driver Tracking
              </h2>
              <p className="text-gray-600 text-sm">
                Real-time vehicle locations and job correlations
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

        {/* Tracking Table */}
        <div className="table-modern animate-fade-in">
          <div className="table-header">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 px-6 py-4">
              <div className="font-semibold">Driver/Vehicle</div>
              <div className="font-semibold">Current Assignment</div>
              <div className="font-semibold">Location Status</div>
              <div className="font-semibold">Distance</div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {trackingData.map((item, index) => {
              const statusConfig = getStatusConfig(item.proximity.status)
              return (
                <div 
                  key={item.vehicleId} 
                  className="table-row grid grid-cols-1 lg:grid-cols-4 gap-4 px-6 py-4 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-pepgrey p-2 rounded-lg">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {item.vehicleName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {item.vehicleId}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {item.assignedJob ? (
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          Job #{item.assignedJob.id}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.assignedJob.type} • {item.assignedJob.status}
                        </div>
                        {item.assignedJob.estimatedLocation && (
                          <div className="text-xs text-gray-500 truncate">
                            {item.assignedJob.estimatedLocation.address}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        No assignment
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      {statusConfig.icon}
                      <span className="ml-2 capitalize">
                        {item.proximity.status.replace('-', ' ')}
                      </span>
                    </span>
                  </div>
                  
                  <div className="text-sm font-medium text-gray-700">
                    {item.proximity.distance ? (
                      formatDistance(item.proximity.distance)
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {trackingData.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                No Active Vehicles
              </h3>
              <p className="text-gray-400">
                Vehicles will appear here when tracking data is available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}