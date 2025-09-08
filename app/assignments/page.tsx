'use client'

import { useState, useEffect } from 'react'
import { 
  Truck, Clipboard, Calendar, Package, Phone, MessageCircle, 
  RefreshCw, AlertTriangle, CheckCircle, Clock, Users, BarChart3,
  ArrowLeft, Filter, Search
} from 'lucide-react'

interface Job {
  id: number
  date: string
  status: string
  type: string
  truckId?: number
  clientCode?: string
  notesCallAhead?: string
  notesDriver?: string
  disposition?: string
}

interface Vehicle {
  vehicleId: string
  vehicleName: string
}

interface JobAssignment {
  vehicle: Vehicle
  job: Job | null
  hasNotes: boolean
}

export default function JobAssignments() {
  const [assignments, setAssignments] = useState<JobAssignment[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = async () => {
    try {
      // Fetch jobs and vehicles simultaneously
      const [jobsResponse, vehiclesResponse] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/vehicles')
      ])

      const [jobsData, vehiclesData] = await Promise.all([
        jobsResponse.json(),
        vehiclesResponse.json()
      ])

      if (!jobsData.success || !vehiclesData.success) {
        throw new Error('Failed to load data')
      }

      const jobsList: Job[] = jobsData.data
      const vehiclesList: Vehicle[] = vehiclesData.data.map((v: any) => ({
        vehicleId: v.id,
        vehicleName: v.name
      }))

      // Create vehicle-job assignments
      const assignmentsList: JobAssignment[] = vehiclesList.map(vehicle => {
        const assignedJob = jobsList.find(job => 
          job.truckId && job.truckId.toString() === vehicle.vehicleId
        )
        
        return {
          vehicle,
          job: assignedJob || null,
          hasNotes: Boolean(assignedJob?.notesCallAhead || assignedJob?.notesDriver)
        }
      })

      setAssignments(assignmentsList)
      setJobs(jobsList)
      setError(null)
      setLastRefresh(new Date())

    } catch (err) {
      setError('Failed to load assignment data')
      console.error('Assignment data error:', err)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setTimeout(() => setRefreshing(false), 500)
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchData()
      setLoading(false)
    }
    
    loadData()
    
    // Auto-refresh every 45 seconds
    const interval = setInterval(fetchData, 45000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status?: string) => {
    if (!status) return 'badge-no-location'
    
    switch (status.toLowerCase()) {
      case 'active':
      case 'in progress':
        return 'badge-at-location'
      case 'pending':
      case 'scheduled':
        return 'badge-nearby'
      case 'complete':
      case 'completed':
        return 'badge-at-location bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'cancelled':
      case 'canceled':
        return 'badge-far'
      default:
        return 'badge-en-route'
    }
  }

  const getJobTypeIcon = (type?: string) => {
    if (!type) return <Package className="h-4 w-4" />
    
    switch (type.toLowerCase()) {
      case 'delivery':
        return <Package className="h-4 w-4 text-blue-600" />
      case 'pickup':
        return <Truck className="h-4 w-4 text-lime-600" />
      default:
        return <Clipboard className="h-4 w-4 text-gray-600" />
    }
  }

  // Filter assignments based on current filter and search
  const filteredAssignments = assignments.filter(assignment => {
    // Filter by assignment status
    if (filter === 'assigned' && !assignment.job) return false
    if (filter === 'unassigned' && assignment.job) return false
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const vehicleMatch = assignment.vehicle.vehicleName.toLowerCase().includes(searchLower)
      const jobMatch = assignment.job ? (
        assignment.job.id.toString().includes(searchLower) ||
        assignment.job.type?.toLowerCase().includes(searchLower) ||
        assignment.job.status?.toLowerCase().includes(searchLower)
      ) : false
      
      return vehicleMatch || jobMatch
    }
    
    return true
  })

  // Calculate stats
  const stats = {
    totalVehicles: assignments.length,
    assignedVehicles: assignments.filter(a => a.job).length,
    activeJobs: jobs.filter(j => j.status?.toLowerCase() === 'active').length,
    jobTypes: jobs.reduce((acc, job) => {
      const type = job.type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-lime-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="loading-ring h-12 w-12 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Job Assignments</h2>
          <p className="text-gray-500">Correlating vehicles with FileMaker jobs...</p>
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
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-lime-50">
      {/* Header */}
      <div className="bg-gradient-pepmove shadow-lg">
        <div className="container-responsive py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a 
                href="/"
                className="bg-white/20 p-2 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-white" />
              </a>
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Clipboard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white text-shadow-sm">
                  Job Assignments
                </h1>
                <p className="text-lime-100">FileMaker job correlations and driver communication</p>
              </div>
            </div>
            
            <div className="text-right text-white">
              <div className="text-sm text-lime-100">
                {lastRefresh ? (
                  <>Last update: {lastRefresh.toLocaleTimeString()}</>
                ) : (
                  'Initializing...'
                )}
              </div>
              <div className="text-xs text-lime-200">
                {stats.assignedVehicles}/{stats.totalVehicles} vehicles assigned
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
          <div className="glass-card p-6 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-pepmove p-3 rounded-lg">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.assignedVehicles}</div>
                  <div className="text-gray-600 font-medium">Assigned</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                  <Clipboard className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.activeJobs}</div>
                  <div className="text-gray-600 font-medium">Active Jobs</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-lg">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.jobTypes.delivery || 0}</div>
                  <div className="text-gray-600 font-medium">Deliveries</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.jobTypes.pickup || 0}</div>
                  <div className="text-gray-600 font-medium">Pickups</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Vehicle-Job Assignments
              </h2>
              <p className="text-gray-600 text-sm">
                Real-time correlation of Samsara vehicles with FileMaker job assignments
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
        </div>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment, index) => (
            <div 
              key={assignment.vehicle.vehicleId}
              className="glass-card p-6 card-hover animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Vehicle Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-pepgrey p-2 rounded-lg">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {assignment.vehicle.vehicleName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {assignment.vehicle.vehicleId}
                    </p>
                  </div>
                </div>
                
                {assignment.hasNotes && (
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <MessageCircle className="h-4 w-4 text-amber-600" />
                  </div>
                )}
              </div>

              {/* Job Assignment */}
              {assignment.job ? (
                <div className="space-y-3">
                  <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getJobTypeIcon(assignment.job.type)}
                        <span className="font-semibold text-gray-900">
                          Job #{assignment.job.id}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.job.status)}`}>
                        {assignment.job.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium text-gray-900 capitalize">
                          {assignment.job.type || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {assignment.job.date || 'Not set'}
                        </span>
                      </div>
                      {assignment.job.clientCode && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Client:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {assignment.job.clientCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Driver Notes */}
                  {(assignment.job.notesCallAhead || assignment.job.notesDriver) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Driver Notes
                      </h4>
                      {assignment.job.notesCallAhead && (
                        <div className="mb-2">
                          <span className="text-xs text-blue-600 font-medium">Call Ahead:</span>
                          <p className="text-sm text-blue-700 mt-1">
                            {assignment.job.notesCallAhead}
                          </p>
                        </div>
                      )}
                      {assignment.job.notesDriver && (
                        <div>
                          <span className="text-xs text-blue-600 font-medium">Driver Notes:</span>
                          <p className="text-sm text-blue-700 mt-1">
                            {assignment.job.notesDriver}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Clock className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-gray-500 font-medium mb-1">No Assignment</h4>
                  <p className="text-sm text-gray-400">Vehicle available for dispatch</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {filteredAssignments.length === 0 && (
          <div className="glass-card p-12 text-center animate-fade-in">
            <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-500 mb-3">
              No Assignments Found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? 'No assignments match your search criteria' : 'No vehicle assignments available'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="btn-secondary"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}