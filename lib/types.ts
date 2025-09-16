// DispatchTracker - Enhanced Type Definitions
// Complete FileMaker integration with all requested fields

export interface VehicleData {
  id: string
  name: string
  status: 'active' | 'idle' | 'offline'
  location: {
    latitude: number
    longitude: number
    address?: string
  }
  engineState?: 'On' | 'Off' | 'Idle' | string
  speed?: number
  fuelLevel?: number
  lastUpdated: string
  externalIds?: Record<string, string>
  diagnostics?: any
}

export interface FileMakerJobRecord {
  // Original Fields
  _kp_job_id: number
  job_date: string
  job_status: string
  job_type: string
  "*kf*trucks_id": string | number | null  // CRITICAL FIX: Original asterisk notation

  // ✅ ENHANCED FIELDS NOW AVAILABLE
  time_arival?: string | null      // Driver arrival timestamp
  time_complete?: string | null    // Job completion timestamp
  address_C1?: string | null       // Customer service address
  due_date?: string | null         // Job deadline
  Customer_C1?: string | null      // Customer identifier (Note: Capital C)

  // 🚛 CRITICAL ROUTING FIELDS (CORRECTED FIELD NAMES)
  _kf_route_id?: number | null     // Route assignment ID (underscore pattern)
  _kf_driver_id?: number | null    // Driver assignment ID (underscore pattern) 
  _kf_lead_id?: number | null      // Lead driver ID
  order_C1?: number | null         // Stop sequence number (C1 in your screenshot)
  order_C2?: number | null         // Secondary order field
  address_C2?: string | null       // Secondary/return address
  Customer_C2?: string | null      // Secondary customer
  contact_C1?: string | null       // Primary contact info
  job_status_driver?: string | null // Driver-specific status

  // Additional existing fields
  _kf_client_code_id?: string | null
  notes_call_ahead?: string | null
  notes_driver?: string | null
  _kf_disposition?: string | null
  _kf_notification_id?: string | null
}

export interface Job {
  id: number
  date: string
  status: string
  type: string
  truckId?: number
  
  // ✅ ENHANCED PROPERTIES
  customer?: string | null         // From Customer_C1 (Capital C)
  address?: string | null          // From address_C1
  arrivalTime?: string | null      // From time_arival
  completionTime?: string | null   // From time_complete
  dueDate?: string | null          // From due_date
  
  // 🚛 ROUTING PROPERTIES (CORRECTLY MAPPED)
  routeId?: number | null          // From '_kf_route_id' (FIXED: correct FileMaker field name)
  driverId?: number | null         // From '_kf_driver_id' (FIXED: correct FileMaker field name)
  leadId?: number | null           // From '_kf_lead_id' (FIXED: lead driver ID)
  stopOrder?: number | null        // From order_C1 (sequence in route)
  secondaryOrder?: number | null   // From order_C2
  secondaryAddress?: string | null // From address_C2 (return location)
  secondaryCustomer?: string | null // From Customer_C2
  contactInfo?: string | null      // From contact_C1
  driverStatus?: string | null     // From job_status_driver
  
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
    type: 'normal' | 'incomplete_after_arrival' | 'status_lag' | 'overdue' | 'missing_data' | 'long_idle'
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
  processingTime?: number  // Time taken to process request in milliseconds
}
