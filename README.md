# PepMove DispatchTracker

Professional fleet management application providing real-time GPS tracking correlated with FileMaker job assignments.

## 🚀 Live Application

- **Production**: [www.pepmovetracker.info](https://www.pepmovetracker.info)
- **Table View**: Real-time tracking dashboard
- **Cards View**: [/cards](https://www.pepmovetracker.info/cards) - Enhanced truck cards with flip diagnostics
- **Job Assignments**: [/assignments](https://www.pepmovetracker.info/assignments) - Vehicle-job correlations

## 📊 Current Status

✅ **MVP Deployed** - 51 vehicles tracked  
✅ **PepMove Branding** - Lime green (#84cc16) matching logo colors  
✅ **Samsara Integration** - Real-time GPS & diagnostics  
✅ **FileMaker Integration** - Job assignments with current fields  
✅ **Job Assignments Dashboard** - Driver notes, status tracking, analytics  
🚧 **Enhanced Truck Cards** - In development: flip cards with Samsara diagnostics + job proximity  
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
│   ├── cards/              # Enhanced truck cards view
│   ├── assignments/        # Job assignments dashboard
│   └── page.tsx            # Main tracking dashboard
├── components/
│   └── VehicleCard.tsx     # Flip-card component with diagnostics
└── lib/
    └── gps-utils.ts        # Distance calculations
```

## 🚗 Current Features

**✅ Job Assignments Dashboard**
- Vehicle-job correlations with FileMaker data
- Driver communication notes display
- Job status tracking and analytics
- Filter/search functionality
- Real-time assignment monitoring with 45-second auto-refresh

**✅ Real-Time Tracking**
- 51+ vehicles with GPS coordinates
- 30-second auto-refresh intervals
- Status: at-location, nearby, en-route, far
- Professional PepMove branding throughout

**✅ Three Dashboard Views**
- Main table view with comprehensive tracking
- Cards view for detailed vehicle information
- Job assignments view for operational management

## 🚧 Next Development Phase: Enhanced Truck Cards

**Planned Features**:
- **"Truck Info" Flip Button** - Card flips to reveal rich Samsara diagnostics
- **Job Proximity Display** - Replace "No Assignment" with proximity information
- **Job Information Integration**:
  - Proximity distance to assigned job
  - Job number and current status
  - Success/failure status indicators
  - Real-time job correlation updates

**Enhanced Card Layout**:
```
Front Side: Basic Info + Job Proximity
├── Vehicle name and ID
├── Job proximity information
├── Job number and status
├── Success/failure indicators
└── "Truck Info" flip button

Back Side: Samsara Diagnostics
├── Engine status and fuel levels
├── Performance metrics
├── Maintenance alerts
├── Driver information
└── Return to job view button
```

## 📋 Available Data

**Current FileMaker Fields**:
- `_kp_job_id`, `job_date`, `job_status`, `job_type`
- `*kf*trucks_id`, `_kf_notification_id`, `_kf_client_code_id`
- `notes_call_ahead`, `notes_driver`, `_kf_disposition`

**Samsara Diagnostics Available**:
- Engine status, fuel levels, speed, odometer
- Battery voltage, coolant temp, oil pressure
- Maintenance schedules, driver information
- Performance metrics and alerts

**Requested FileMaker Fields** (for future schedule hygiene):
- `time_arival`, `time_complete`, `address_C1`, `customer_C1`, `due_date`

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

## 📍 Business Logic

```typescript
// GPS Proximity Detection
const isAtJob = calculateDistance(vehicleCoords, jobCoords) <= 0.5

// Vehicle-Job Correlation
const assignedJob = jobs.find(job => 
  job.truckId && job.truckId.toString() === vehicle.vehicleId
)

// Job Success Determination
const isJobSuccessful = (job) => {
  const successStatuses = ['Complete', 'Done', 'Delivered', 'Successful']
  return successStatuses.includes(job.status)
}

// Proximity Status for Cards
const getProximityDisplay = (vehicle, assignedJob) => {
  if (!assignedJob) return 'No Assignment'
  
  const distance = calculateDistance(vehicle.location, job.location)
  return {
    proximity: distance <= 0.5 ? 'At Location' : `${distance} mi away`,
    jobNumber: assignedJob.id,
    status: assignedJob.status,
    isSuccessful: isJobSuccessful(assignedJob)
  }
}
```

## 🎯 Deployment Info

- **Vercel Project**: `prj_dfZJFBw99fDHGa2ij1IcPKddUoG4`
- **GitHub**: `trevden810/DispatchTracker` (master branch)
- **Domain**: www.pepmovetracker.info
- **Auto-Deploy**: master branch → production
- **Build**: Next.js 14 TypeScript compilation

## 🧪 Testing

**Current Features Working**:
1. **Main Dashboard** (`/`) - Vehicle tracking table ✅
2. **Cards View** (`/cards`) - Basic vehicle cards ✅
3. **Job Assignments** (`/assignments`) - FileMaker integration ✅
4. **Navigation** - Seamless between all views ✅
5. **Real-time Updates** - Auto-refresh functionality ✅
6. **Mobile Responsive** - Works on all devices ✅

**Next Phase Testing**:
- Enhanced truck card flip animations
- Samsara diagnostics display
- Job proximity calculations
- Success/failure status indicators

## 📞 Contact

**Trevor** - Service Operations Manager  
**Company**: PepMove Logistics  
**Location**: Aurora, Colorado (Mountain Time)  
**Environment**: Windows PowerShell, VS Code, Git/GitHub

---

**Version**: 1.2.0 - Job Assignments Dashboard Complete  
**Next**: Enhanced Truck Cards with Samsara Diagnostics + Job Proximity