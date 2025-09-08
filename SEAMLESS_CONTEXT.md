# PepMove DispatchTracker - Seamless Context Handoff

## Immediate Project Context

**I'm working on PepMove DispatchTracker** - a production fleet management application at `C:\Projects\DispatchTracker` that correlates Samsara vehicle GPS data with FileMaker job assignments for real-time logistics operations.

## Current Status (Post-Successful Deployment)

**✅ PHASE 1 COMPLETED - Job Assignments Dashboard**
- **MVP Deployed**: https://www.pepmovetracker.info (51 vehicles tracked)
- **PepMove Branding**: Lime green (#84cc16) matching logo colors exactly
- **Three Dashboard Views**: Table view (/), Cards view (/cards), Job Assignments (/assignments)
- **Real-time APIs**: Samsara Fleet + FileMaker integration working perfectly
- **Job Assignments Dashboard**: Driver notes, status tracking, analytics, search/filter
- **Icon Fix Deployed**: Successfully replaced ClipboardList with Clipboard across all pages

**🚧 PHASE 2 IN DEVELOPMENT - Enhanced Truck Cards**
- **Current Cards**: Basic vehicle information with "No Assignment" placeholders
- **Target Enhancement**: Flip cards with Samsara diagnostics + job proximity information
- **Business Requirement**: Replace "No Assignment" with meaningful job proximity data

## Phase 2 Development Requirements

### Enhanced Truck Card Specifications

#### Front Side (Job-Focused View)
**Replace Current "No Assignment" Section With:**
- **Job Proximity**: Distance to assigned job location
- **Job Number**: Display job ID from FileMaker correlation
- **Job Status**: Current assignment status
- **Success Indicator**: Visual indicator if job status is successful/complete
- **"Truck Info" Button**: Triggers flip to diagnostics view

#### Back Side (Samsara Diagnostics View)
**Rich API Information Display:**
- **Engine Status**: On/off/idle with visual indicators
- **Fuel Level**: Percentage with gauge visualization
- **Performance Metrics**: Speed, odometer, engine hours
- **Maintenance Data**: Oil pressure, coolant temp, battery voltage
- **Driver Information**: Current driver name and ID
- **Maintenance Alerts**: Upcoming service requirements
- **Return Button**: Flip back to job view

### Business Logic Enhancements

#### Job Proximity Calculation
```typescript
// Enhanced proximity display for truck cards
const getJobProximityInfo = (vehicle, assignedJob) => {
  if (!assignedJob) {
    return {
      display: 'Available for Dispatch',
      status: 'unassigned',
      distance: null
    }
  }
  
  const distance = calculateDistance(vehicle.location, job.estimatedLocation)
  return {
    proximity: distance <= 0.5 ? 'At Job Location' : `${distance.toFixed(1)} mi away`,
    jobNumber: assignedJob.id,
    status: assignedJob.status,
    isSuccessful: ['Complete', 'Done', 'Delivered', 'Successful'].includes(assignedJob.status),
    distance: distance
  }
}
```

#### Success Status Determination
```typescript
const isJobSuccessful = (jobStatus) => {
  const successStatuses = [
    'Complete', 'Done', 'Delivered', 'Successful', 
    'Finished', 'Accomplished', 'Completed'
  ]
  return successStatuses.includes(jobStatus)
}
```

## Technical Stack

- **Framework**: Next.js 14 + TypeScript + Tailwind CSS
- **Deployment**: Vercel Project `prj_dfZJFBw99fDHGa2ij1IcPKddUoG4`
- **Repository**: `trevden810/DispatchTracker` (auto-deploy from master branch)
- **Development**: Port 3002, Aurora CO timezone

## API Configuration

**Samsara Fleet API** (Working Perfectly)
```
Token: your_samsara_api_token_here
Base: https://api.samsara.com
Features: GPS coordinates, engine status, fuel levels, diagnostics
Available Data: engineStates, fuelLevel, gpsLocation, maintenance, driver info
```

**FileMaker Data API** (Current Access)
```
URL: https://modd.mainspringhost.com/fmi/data/vLatest
Database: PEP2_1, Layout: jobs_api
Auth: trevor_api:XcScS2yRoTtMo7
```

**Current Fields**: `_kp_job_id`, `job_date`, `job_status`, `job_type`, `*kf*trucks_id`, `_kf_notification_id`, `notes_call_ahead`, `notes_driver`, `_kf_client_code_id`, `_kf_disposition`

**Pending Request**: `time_arival`, `time_complete`, `address_C1`, `due_date`, `customer_C1`

## File Structure
```
C:\Projects\DispatchTracker/
├── app/
│   ├── api/
│   │   ├── tracking/route.ts     # Main correlation logic
│   │   ├── vehicles/route.ts     # Samsara integration
│   │   ├── jobs/route.ts         # FileMaker integration
│   │   └── filemaker/route.ts    # Schema discovery
│   ├── cards/page.tsx            # Truck cards view (TARGET FOR ENHANCEMENT)
│   ├── assignments/page.tsx      # Job assignments dashboard (COMPLETE)
│   └── page.tsx                  # Main tracking dashboard (COMPLETE)
├── components/
│   └── VehicleCard.tsx           # Flip-card component (NEEDS ENHANCEMENT)
└── lib/
    └── gps-utils.ts              # Distance calculations
```

## Current Application Features

**✅ Main Dashboard (/)** - Real-time vehicle tracking table
**✅ Job Assignments (/assignments)** - FileMaker integration featuring:
- Vehicle-job correlations with current FileMaker fields
- Driver communication notes (call-ahead and driver notes)
- Job status tracking and analytics
- Filter/search functionality (assigned/unassigned vehicles)
- Real-time assignment monitoring with 45-second auto-refresh
- Professional PepMove branding (lime-500 green)

**🚧 Cards View (/cards)** - Vehicle diagnostic cards (ENHANCEMENT TARGET):
- Currently shows basic vehicle information
- "No Assignment" placeholder needs replacement with job proximity
- Flip animation exists but needs enhancement for Samsara diagnostics
- Target: Rich diagnostic information on card back

## Development Objectives - Phase 2

### Primary Goals
1. **Enhanced Job Proximity Display**: Replace "No Assignment" with meaningful proximity information
2. **Samsara Diagnostics Integration**: Full diagnostic data on card flip
3. **Success Status Indicators**: Visual feedback for job completion status
4. **Professional UI/UX**: Maintain PepMove branding standards

### Technical Implementation
1. **VehicleCard.tsx Enhancement**: Upgrade flip card component
2. **API Data Integration**: Combine Samsara diagnostics with job correlation
3. **Proximity Calculations**: Real-time distance calculations for job assignments
4. **Status Logic**: Business rules for success/failure determination

### User Experience Requirements
- **Intuitive Flip Interaction**: Clear "Truck Info" button for diagnostics view
- **Information Hierarchy**: Most important job info on front, detailed diagnostics on back
- **Visual Status Indicators**: Color-coded success/failure states
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Smooth transitions and data loading feedback

## Available MCP Tools

**Filesystem**: Complete project file management and code operations
**Analysis**: GPS calculations, performance testing, data validation
**Web Research**: API documentation, technical solutions
**Canva**: Professional presentations, diagrams
**PDF Processing**: Documentation handling

## User Profile

**Trevor** - Service Operations Manager, PepMove Logistics
**Location**: Aurora, Colorado (America/Denver timezone)  
**Style**: Clear, structured solutions with professional stakeholder communication
**Environment**: Windows PowerShell, VS Code, Git/GitHub

## Recent Accomplishments

**Successfully Deployed**: Job Assignments Dashboard with FileMaker integration using available fields. Fixed ClipboardList icon compatibility issues. Professional lime green branding matches PepMove logo exactly. Real-time vehicle-job correlation operational with 51 vehicles.

**Ready for**: Enhanced truck cards development with Samsara diagnostics integration and job proximity information display.

**Use this context to immediately continue Phase 2 development without requiring project re-explanation.**