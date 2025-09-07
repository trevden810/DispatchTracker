# PepMove DispatchTracker

Fleet management application providing real-time GPS tracking of vehicles correlated with FileMaker job assignments for logistics excellence.

## Quick Start

```bash
# Clone repository
gh repo clone trevden810/DispatchTracker
cd DispatchTracker

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Update .env.local with API credentials

# Run development server
npm run dev
```

Visit `http://localhost:3002` or `https://www.pepmovetracker.info`

## Project Information

- **Live Domain**: [www.pepmovetracker.info](https://www.pepmovetracker.info)
- **Vercel Project**: prj_dfZJFBw99fDHGa2ij1IcPKddUoG4
- **GitHub Repository**: trevden810/DispatchTracker
- **Location**: Aurora, Colorado (Mountain Time)

## Current Status

✅ **Functional MVP** - 51 vehicles tracked  
✅ **Samsara Integration** - Real-time GPS data  
✅ **FileMaker Integration** - Job assignments  
✅ **PepMove Branding** - Professional UI  
⏳ **Enhanced Fields** - Pending FileMaker access

## Features

### Real-Time Tracking
- 51+ vehicles with GPS coordinates
- 30-second refresh intervals  
- 0.5-mile proximity detection
- Status indicators: at-location, nearby, en-route, far

### API Integrations
- **Samsara Fleet API** - Vehicle GPS, engine status, fuel levels
- **FileMaker Data API** - Job assignments and scheduling

### Schedule Hygiene (Pending)
- Flag jobs with arrival times but incomplete status
- Alert on overdue assignments
- Customer location accuracy

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + PepMove brand colors
- **APIs**: Samsara Fleet + FileMaker Data
- **Deployment**: Vercel with auto-deployment
- **GPS Logic**: Haversine formula distance calculations

## Available Fields

### Current FileMaker Access
- `_kp_job_id`, `job_date`, `job_status`, `job_type`
- `*kf*trucks_id`, `_kf_notification_id`, `notes_call_ahead`
- `notes_driver`, `_kf_client_code_id`, `_kf_disposition`

### Requested Fields
- `time_arival`, `time_complete` - Schedule hygiene
- `address_C1`, `customer_C1` - Location accuracy  
- `due_date` - Deadline monitoring

## Development

```bash
# Start development
npm run dev

# Build for production
npm run build

# Deploy to Vercel
git push origin main  # Auto-deploys to pepmovetracker.info
```

## API Endpoints

- `/api/tracking` - Vehicle-job correlation with GPS proximity
- `/api/vehicles` - Samsara vehicle data
- `/api/jobs` - FileMaker job assignments
- `/api/schedule-hygiene` - Schedule discrepancy detection

## Environment Variables

```bash
# Samsara API
SAMSARA_API_TOKEN=your_samsara_api_token_here
SAMSARA_BASE_URL=https://api.samsara.com

# FileMaker API  
FILEMAKER_USERNAME=trevor_api
FILEMAKER_PASSWORD=XcScS2yRoTtMo7
FILEMAKER_BASE_URL=https://modd.mainspringhost.com
FILEMAKER_JOBS_DB=PEP2_1
FILEMAKER_JOBS_LAYOUT=jobs_api

# GPS Configuration
JOB_PROXIMITY_THRESHOLD_MILES=0.5
TRACKING_REFRESH_INTERVAL=30
```

## Business Logic

### GPS Proximity Detection
```typescript
// 0.5-mile threshold for "at job site"
const isAtJob = calculateDistance(vehicleCoords, jobCoords) <= 0.5

// Status levels based on distance
if (distance <= 0.5) status = 'at-location'
else if (distance <= 1.0) status = 'nearby'  
else if (distance <= 10) status = 'en-route'
else status = 'far'
```

### Schedule Hygiene Rules
```typescript
// Flag jobs with timing discrepancies
const hygieneIssues = jobs.filter(job => 
  job.time_arival && 
  !['Complete', 'Done', 'Re-scheduled', 'Attempted', 'Canceled'].includes(job.status)
)
```

## Deployment Info

- **Production URL**: https://www.pepmovetracker.info
- **Vercel Project ID**: prj_dfZJFBw99fDHGa2ij1IcPKddUoG4
- **Auto-deploy**: GitHub main branch → Vercel
- **Custom Domain**: Configured and active

## Contact

**Trevor** - Service Operations Manager  
**Company**: PepMove Logistics  
**Location**: Aurora, Colorado  
**Time Zone**: America/Denver (Mountain Time)