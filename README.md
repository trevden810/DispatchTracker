# PepMove DispatchTracker

Professional fleet management application providing real-time GPS tracking correlated with FileMaker job assignments.

## 🚀 Live Application

- **Production**: [www.pepmovetracker.info](https://www.pepmovetracker.info)
- **Table View**: Real-time tracking dashboard
- **Cards View**: [/cards](https://www.pepmovetracker.info/cards) - Flip-card diagnostics

## 📊 Current Status

✅ **MVP Deployed** - 51 vehicles tracked  
✅ **PepMove Branding** - Professional green/grey design  
✅ **Samsara Integration** - Real-time GPS & diagnostics  
✅ **FileMaker Integration** - Job assignments  
✅ **Vehicle Detail Cards** - Flip animations with comprehensive diagnostics  
⏳ **Enhanced FileMaker Fields** - Pending admin approval  

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + PepMove brand system
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
│   │   └── schedule-hygiene/ # Business logic alerts
│   ├── cards/              # Vehicle detail cards view
│   └── page.tsx            # Main dashboard
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

**Requested Fields** (pending):
- `time_arival`, `time_complete` - Schedule hygiene
- `address_C1`, `customer_C1` - Location accuracy
- `due_date` - Deadline monitoring

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
git push origin main  # Auto-deploys to Vercel
```

## 🚗 Features

**Real-Time Tracking**
- 51+ vehicles with GPS coordinates
- 30-second auto-refresh
- Status: at-location, nearby, en-route, far

**Vehicle Detail Cards**
- Flip animations (front: jobs, back: diagnostics)
- Engine status, fuel levels, maintenance
- Driver information, performance metrics

**Schedule Hygiene** (pending enhanced fields)
- Flag jobs with arrival times but incomplete status
- Alert on overdue assignments
- Customer location accuracy

## 📍 Business Logic

```typescript
// GPS Proximity Detection
const isAtJob = calculateDistance(vehicleCoords, jobCoords) <= 0.5

// Schedule Hygiene Rules
const hygieneIssues = jobs.filter(job => 
  job.time_arival && 
  !['Complete', 'Done', 'Re-scheduled', 'Attempted', 'Canceled'].includes(job.status)
)
```

## 🎯 Deployment Info

- **Vercel Project**: `prj_dfZJFBw99fDHGa2ij1IcPKddUoG4`
- **GitHub**: `trevden810/DispatchTracker`
- **Domain**: Custom domain configured
- **Auto-Deploy**: main branch → production

## 📞 Contact

**Trevor** - Service Operations Manager  
**Company**: PepMove Logistics  
**Location**: Aurora, Colorado (Mountain Time)