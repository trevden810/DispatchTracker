// DispatchTracker - Enhanced Type Definitions
// Complete FileMaker integration with all requested fields

export interface FileMakerJobRecord {
  // Original Fields
  _kp_job_id: number
  job_date: string
  job_status: string
  job_type: string
  '*kf*trucks_id': number

  // ✅ ENHANCED FIELDS NOW AVAILABLE
  time_arival?: string | null      // Driver arrival timestamp
  time_complete?: string | null    // Job completion timestamp
  address_C1?: string | null       // Customer service address
  due_date?: string | null         // Job deadline
  customer_C1?: string | null      // Customer identifier

  // Additional existing fields
  '_kf_client_code_id'?: string | null
  notes_call_ahead?: string | null
  notes_driver?: string | null
  _kf_disposition?: string | null
}

export interface Job {
  id: number
  date: string
  status: string
  type: string
  truckId?: number
  
  // ✅ ENHANCED PROPERTIES
  customer?: string | null         // From customer_C1
  address?: string | null          // From address_C1
  arrivalTime?: string | null      // From time_arival
  completionTime?: string | null   // From time_complete
  dueDate?: string | null          // From due_date
  
  // Location data (geocoded from address)
  location: {
    lat: number
    lng: number
    address: string
    source: 'geocoded' | 'mock' | 'unknown'
  } | null
  
  // Legacy fields
  clientCode?: string | null
  notesCallAhead?: string | null
  notesDriver?: string | null
  disposition?: string | null
}

export interface VehicleJobCorrelation {
  vehicleId: string
  assignedJob: Job | null
  proximity: {
    distance: number      // Miles
    status: 'at-location' | 'nearby' | 'en-route' | 'far'
    isAtJobSite: boolean  // Within 0.5 miles
  } | null
  scheduleStatus: {
    type: 'normal' | 'incomplete_after_arrival' | 'status_lag' | 'overdue' | 'missing_data'
    severity: 'info' | 'warning' | 'critical'
    message: string
    actionNeeded?: boolean
  }
}

export interface ScheduleHygieneIssue {
  jobId: number
  type: 'incomplete_after_arrival' | 'status_lag' | 'overdue' | 'missing_data' | 'long_idle'
  severity: 'info' | 'warning' | 'critical'
  message: string
  job: Job
  detectedAt: string
  actionNeeded: boolean
}

export interface FileMakerResponse {
  response: {
    data: Array<{
      fieldData: FileMakerJobRecord
      recordId: string
      modId: string
    }>
    dataInfo: {
      database: string
      layout: string
      table: string
      totalRecordCount: number
      foundCount: number
      returnedCount: number
    }
  }
  messages: Array<{
    code: string
    message: string
  }>
}

export interface GeocodingResult {
  lat: number
  lng: number
  address: string
  confidence: 'high' | 'medium' | 'low'
  source: 'google' | 'nominatim' | 'cache'
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string
  count?: number
  totalRecords?: number
  timestamp: string
}
