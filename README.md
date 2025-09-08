# PepMove DispatchTracker

Professional fleet management application providing real-time GPS tracking correlated with FileMaker job assignments.

## 🚀 Live Application

- **Production**: [www.pepmovetracker.info](https://www.pepmovetracker.info)
- **Table View**: Real-time tracking dashboard
- **Cards View**: [/cards](https://www.pepmovetracker.info/cards) - Flip-card diagnostics
- **Job Assignments**: [/assignments](https://www.pepmovetracker.info/assignments) - Vehicle-job correlations

## 📊 Current Status

✅ **MVP Deployed** - 51 vehicles tracked  
✅ **PepMove Branding** - Lime green (#84cc16) matching logo colors  
✅ **Samsara Integration** - Real-time GPS & diagnostics  
✅ **FileMaker Integration** - Job assignments with current fields  
✅ **Vehicle Detail Cards** - Flip animations with comprehensive diagnostics  
✅ **Job Assignments Dashboard** - Driver notes, status tracking, analytics  
⏳ **Enhanced FileMaker Fields** - Pending admin approval for schedule hygiene  

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + PepMove brand system (lime-500/gray-700)
- **APIs**: Samsara Fleet + FileMaker Data
- **Deployment**: Vercel (auto-deploy from GitHub)
- **GPS Logic**: Haversine formula (0.5-mile proximity)

## 🏗 Architecture

```
DispatchTracker/
├── app/
│   ├── api/
│   │   ├── tracking/        # Vehicle-job correlation
│   │   ├── vehicles/        # Samsara Fleet API
│   │   ├── jobs/           # FileMaker Data API
│   │   ├── filemaker/      # Schema discovery
│   │   └── schedule-hygiene/ # Business logic alerts
│   ├── cards/              # Vehicle detail cards view
│   ├── assignments/        # Job assignments dashboard
│   └── page.tsx            # Main tracking dashboard
├── components/
│   └── VehicleCard.tsx     # Flip-card component
└── lib/
    └── gps-utils.ts        # Distance calculations
```

## 📋 Available Data

**Current FileMaker Fields**:
- `_kp_job_id`, `job_date`, `job_status`, `job_type`
- `*kf*trucks_id`, `_kf_notification_id`, `_kf_client_code_id`
- `notes_call_ahead`, `notes_driver`, `_kf_disposition`

**Requested Fields** (pending admin approval):
- `time_arival`, `time_complete` - Schedule hygiene monitoring
- `address_C1`, `customer_C1` - GPS correlation accuracy
- `due_date` - Deadline tracking and alerts

## 🔧 Development

```bash
# Setup
gh repo clone trevden810/DispatchTracker
cd DispatchTracker
npm install

# Environment
cp .env.example .env.local
# Add Samsara & FileMaker credentials

# Development
npm run dev  # Port 3002

# Deploy
git push origin master  # Auto-deploys to Vercel
```

## 🚗 Features

**Real-Time Tracking**
- 51+ vehicles with GPS coordinates
- 30-second auto-refresh intervals
- Status: at-location, nearby, en-route, far

**Vehicle Detail Cards**
- Flip animations (front: jobs, back: diagnostics)
- Engine status, fuel levels, maintenance alerts
- Driver information, performance metrics

**Job Assignments Dashboard** 🆕
- Vehicle-job correlations with FileMaker data
- Driver communication notes display
- Job status tracking and analytics
- Filter/search functionality
- Real-time assignment monitoring

**Schedule Hygiene** (pending enhanced fields)
- Flag jobs with arrival times but incomplete status
- Alert on overdue assignments
- Customer location accuracy validation

## 📍 Business Logic

```typescript
// GPS Proximity Detection
const isAtJob = calculateDistance(vehicleCoords, jobCoords) <= 0.5

// Vehicle-Job Correlation
const assignedJob = jobs.find(job => 
  job.truckId && job.truckId.toString() === vehicle.vehicleId
)

// Schedule Hygiene Rules (when fields available)
const hygieneIssues = jobs.filter(job => 
  job.time_arival && 
  !['Complete', 'Done', 'Re-scheduled', 'Attempted', 'Canceled'].includes(job.status)
)
```

## 🎯 Deployment Info

- **Vercel Project**: `prj_dfZJFBw99fDHGa2ij1IcPKddUoG4`
- **GitHub**: `trevden810/DispatchTracker` (master branch)
- **Domain**: www.pepmovetracker.info
- **Auto-Deploy**: master branch → production
- **Build**: Next.js 14 TypeScript compilation

## 🧪 Testing

**Immediate Test Features**:
1. **Main Dashboard** (`/`) - Vehicle tracking table
2. **Cards View** (`/cards`) - Diagnostic flip cards
3. **Job Assignments** (`/assignments`) - FileMaker integration
4. **Navigation** - Seamless between all views
5. **Real-time Updates** - Auto-refresh functionality
6. **Mobile Responsive** - Works on all devices

## 📞 Contact

**Trevor** - Service Operations Manager  
**Company**: PepMove Logistics  
**Location**: Aurora, Colorado (Mountain Time)  
**Environment**: Windows PowerShell, VS Code, Git/GitHub