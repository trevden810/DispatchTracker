# PepMove DispatchTracker - Seamless Context Handoff

## Immediate Project Context

**I'm working on PepMove DispatchTracker** - a production fleet management application at `C:\Projects\DispatchTracker` that correlates Samsara vehicle GPS data with FileMaker job assignments for real-time logistics operations.

## Current Status (Ready for Handoff)

**✅ COMPLETED FEATURES**
- **MVP Deployed**: https://www.pepmovetracker.info (51 vehicles tracked)
- **PepMove Branding**: Professional green/grey design system implemented
- **Vehicle Detail Cards**: Flip animations with comprehensive Samsara diagnostics
- **Dual Views**: Table view (/) and Cards view (/cards) with navigation
- **Real-time APIs**: Samsara Fleet + FileMaker integration working

**⏳ CURRENT ISSUE**
- **Deployment Error**: TypeScript compilation failure in `/app/api/filemaker/route.ts` 
- **Fix Applied**: Added proper type annotations to `fieldCategories` object
- **Status**: Ready for redeployment after fix

## Technical Stack

- **Framework**: Next.js 14 + TypeScript + Tailwind CSS
- **Deployment**: Vercel Project `prj_dfZJFBw99fDHGa2ij1IcPKddUoG4`
- **Repository**: `trevden810/DispatchTracker` (auto-deploy from main)
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
**Schedule Hygiene**: Flag jobs with arrival times but incomplete status

## File Structure
```
C:\Projects\DispatchTracker/
├── app/
│   ├── api/
│   │   ├── tracking/route.ts     # Main correlation logic
│   │   ├── vehicles/route.ts     # Samsara integration
│   │   ├── jobs/route.ts         # FileMaker integration
│   │   └── filemaker/route.ts    # Schema discovery (NEEDS FIX)
│   ├── cards/page.tsx            # Vehicle cards view
│   └── page.tsx                  # Main dashboard
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

## Immediate Next Actions

1. **Deploy Fix**: Push TypeScript fix to resolve build error
2. **FileMaker Request**: Send field access request to administrator
3. **Schedule Hygiene**: Implement monitoring once fields available
4. **Performance**: Optimize for 50+ concurrent vehicles

## User Profile

**Trevor** - Service Operations Manager, PepMove Logistics
**Location**: Aurora, Colorado (America/Denver timezone)  
**Style**: Clear, structured solutions with professional stakeholder communication
**Environment**: Windows PowerShell, VS Code, Git/GitHub

## Recent Context

Just completed vehicle detail cards implementation with 3D flip animations showing comprehensive diagnostics. Fixed deployment error in FileMaker route. Project ready for continued development or production troubleshooting.

**Use this context to immediately continue development without requiring project re-explanation.**