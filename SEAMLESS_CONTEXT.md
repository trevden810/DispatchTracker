# PepMove DispatchTracker - Seamless Context Handoff

## Immediate Project Context

**I'm working on PepMove DispatchTracker** - a production fleet management application at `C:\Projects\DispatchTracker` that correlates Samsara vehicle GPS data with FileMaker job assignments for real-time logistics operations.

## Current Status (Ready for Handoff)

**✅ COMPLETED FEATURES**
- **MVP Deployed**: https://www.pepmovetracker.info (51 vehicles tracked)
- **PepMove Branding**: Lime green (#84cc16) matching logo colors exactly
- **Vehicle Detail Cards**: Flip animations with comprehensive Samsara diagnostics
- **Triple Views**: Table view (/), Cards view (/cards), Job Assignments (/assignments)
- **Real-time APIs**: Samsara Fleet + FileMaker integration working
- **Job Assignments Dashboard**: Driver notes, status tracking, analytics

**⚠️ CURRENT ISSUE**
- **Deployment Error**: Missing `ClipboardList` import in cards/page.tsx
- **Fix Applied**: Added missing imports to both main and cards pages
- **Status**: Ready for redeployment after import fix

## Technical Stack

- **Framework**: Next.js 14 + TypeScript + Tailwind CSS
- **Deployment**: Vercel Project `prj_dfZJFBw99fDHGa2ij1IcPKddUoG4`
- **Repository**: `trevden810/DispatchTracker` (auto-deploy from master branch)
- **Development**: Port 3002, Aurora CO timezone

## API Configuration

**Samsara Fleet API** (Working)
```
Token: your_samsara_api_token_here
Base: https://api.samsara.com
Features: GPS coordinates, engine status, fuel levels
```

**FileMaker Data API** (Limited Access)
```
URL: https://modd.mainspringhost.com/fmi/data/vLatest
Database: PEP2_1, Layout: jobs_api
Auth: trevor_api:XcScS2yRoTtMo7
```

**Current Fields**: `_kp_job_id`, `job_date`, `job_status`, `job_type`, `*kf*trucks_id`, `_kf_notification_id`, `notes_call_ahead`, `notes_driver`, `_kf_client_code_id`, `_kf_disposition`

**Requested Fields**: `time_arival`, `time_complete`, `address_C1`, `due_date`, `customer_C1`

## Business Logic

**GPS Proximity**: 0.5-mile threshold using Haversine formula
**Status Levels**: at-location (≤0.5mi), nearby (≤1mi), en-route (≤10mi), far (>10mi)
**Vehicle-Job Correlation**: Match `*kf*trucks_id` with Samsara vehicle IDs
**Schedule Hygiene**: Flag jobs with arrival times but incomplete status (pending enhanced fields)

## File Structure
```
C:\Projects\DispatchTracker/
├── app/
│   ├── api/
│   │   ├── tracking/route.ts     # Main correlation logic
│   │   ├── vehicles/route.ts     # Samsara integration
│   │   ├── jobs/route.ts         # FileMaker integration
│   │   └── filemaker/route.ts    # Schema discovery
│   ├── cards/page.tsx            # Vehicle cards view
│   ├── assignments/page.tsx      # Job assignments dashboard
│   └── page.tsx                  # Main tracking dashboard
├── components/
│   └── VehicleCard.tsx           # Flip-card component
└── lib/
    └── gps-utils.ts              # Distance calculations
```

## Available MCP Tools

**Filesystem**: Complete project file management
**Analysis**: GPS calculations, performance testing
**Web Research**: API documentation, solutions
**Canva**: Professional presentations, diagrams
**PDF Processing**: Documentation handling

## Application Features

**1. Main Dashboard (/)** - Real-time vehicle tracking table
**2. Cards View (/cards)** - Diagnostic flip cards with Samsara data
**3. Job Assignments (/assignments)** - NEW! FileMaker integration featuring:
- Vehicle-job correlations with current FileMaker fields
- Driver communication notes (call-ahead and driver notes)
- Job status tracking and analytics
- Filter/search functionality (assigned/unassigned vehicles)
- Real-time assignment monitoring with auto-refresh

## Immediate Next Actions

1. **Deploy Fix**: Push missing import fix to resolve build error
2. **Test Job Assignments**: Verify new dashboard functionality
3. **FileMaker Request**: Send field access request to administrator
4. **Schedule Hygiene**: Implement monitoring once enhanced fields available

## User Profile

**Trevor** - Service Operations Manager, PepMove Logistics
**Location**: Aurora, Colorado (America/Denver timezone)  
**Style**: Clear, structured solutions with professional stakeholder communication
**Environment**: Windows PowerShell, VS Code, Git/GitHub

## Recent Context

Just completed Job Assignments Dashboard with FileMaker integration using available fields. Updated color scheme to match PepMove logo exactly (lime-500 #84cc16). Fixed deployment error with missing imports. Ready to deploy and test new vehicle-job correlation features.

**Use this context to immediately continue development without requiring project re-explanation.**