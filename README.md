# PepMove DispatchTracker

Professional fleet management application with animated driver status indicators and comprehensive diagnostics.

## 🚀 Live Application

- **Production**: [www.pepmovetracker.info](https://www.pepmovetracker.info) → **Automatically redirects to enhanced interface**
- **Primary Interface**: [/cards](https://www.pepmovetracker.info/cards) - **Consolidated fleet management interface** 🎯
- **All Routes**: All URLs (/, /assignments) now redirect to the enhanced cards interface

## 📊 Current Status - Phase 3 Complete ✅

✅ **Enhanced Vehicle Cards** - Animated status borders with driver behavior analysis  
✅ **Flip Card Diagnostics** - Working animation with comprehensive Samsara data  
✅ **Intelligent Status Detection** - Real-time driver behavior monitoring  
✅ **Professional Search & Filtering** - Advanced fleet management controls  
✅ **Route Consolidation** - All URLs redirect to enhanced cards interface  
✅ **Single Interface Excellence** - Streamlined user experience around proven solution  

## 🌈 Driver Status System

### **Visual Status Indicators**
- 🟢 **Driving** - Lime green pulsing borders (En Route)
- 💚 **On Job Site** - Emerald green glowing borders (Productive) 
- 🔴 **Idle Alert** - Red flashing borders (>30min non-productive)
- 🟡 **Stopped** - Amber steady borders (Monitoring required)
- 🔵 **Available** - Blue breathing borders (Ready for dispatch)
- ⚫ **Offline** - Gray static borders (No connection)

### **Business Intelligence**
- **Real-time Analysis**: Speed + location + job assignment correlation
- **Idle Time Tracking**: Automated detection of non-productive stops
- **Assignment Optimization**: Visual indicators for available vehicles
- **Performance Monitoring**: Immediate status recognition for dispatchers

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom animated borders
- **APIs**: Samsara Fleet + FileMaker Data
- **Deployment**: Vercel (auto-deploy from GitHub)
- **GPS Logic**: Haversine formula (0.5-mile proximity)
- **Animations**: CSS3 with hardware acceleration

## 🏗 Primary Architecture (Consolidated)

```
DispatchTracker/
├── app/
│   ├── cards/page.tsx           # 🎯 MAIN APPLICATION INTERFACE
│   ├── api/
│   │   ├── tracking/route.ts    # Enhanced with full Samsara diagnostics
│   │   ├── vehicles/route.ts    # Samsara Fleet API
│   │   └── jobs/route.ts        # FileMaker Data API
│   ├── assignments/page.tsx     # Legacy (being deprecated)
│   └── page.tsx                 # Legacy (being deprecated)
├── components/
│   └── VehicleCard.tsx          # Enhanced with animated status borders
└── lib/
    └── gps-utils.ts             # Distance calculations
```

## 🎯 Primary Features (/cards)

**✅ Enhanced Vehicle Cards**
- **Animated Status Borders**: Real-time driver behavior visualization
- **Flip Card Diagnostics**: Comprehensive Samsara vehicle data
- **Job Assignment Integration**: Professional "Available for Dispatch" messaging  
- **Search & Filter Controls**: Advanced fleet management tools
- **Status Badges**: Top-left indicators with descriptive text

**✅ Intelligent Driver Analysis**
- **Speed-based Detection**: Driving vs. stopped vs. idle states
- **Location Correlation**: Job site proximity with assignment status
- **Idle Time Monitoring**: Automated alerts for non-productive stops
- **Assignment Intelligence**: Visual availability indicators

**✅ Professional Interface**
- **Search Functionality**: Filter by vehicle name, job ID, or status
- **Assignment Filters**: All vehicles, assigned only, unassigned only
- **Real-time Updates**: 30-second refresh with live status changes
- **Responsive Design**: Works seamlessly across all devices

## 🚧 Phase 3: Interface Consolidation

### **Objectives**
- **Deprecate Legacy Views**: Remove `/` and `/assignments` interfaces
- **Redirect All Traffic**: Point all URLs to enhanced `/cards` interface
- **Migrate Best Features**: Integrate search/filter controls from assignments page
- **Single Source of Truth**: One powerful interface for all fleet management

### **Migration Plan**
1. ✅ **Enhanced Cards Interface** - Add search and filter controls
2. ✅ **Route Consolidation** - Redirect legacy URLs to `/cards`
3. ✅ **Feature Integration** - Ensure all functionality available in main interface
4. ✅ **Documentation Update** - Reflect new consolidated architecture

## 📋 Available Data

**Samsara Fleet Data** (Fully Integrated):
- Engine status, fuel levels, speed, odometer readings
- Battery voltage, coolant temperature, oil pressure
- Maintenance schedules and service alerts
- Driver information and performance metrics

**FileMaker Job Data** (Current Access):
- Job ID, date, status, type, truck assignments
- Client codes and disposition information
- Driver communication notes (call-ahead, driver notes)

**Enhanced Analytics**:
- Real-time proximity calculations to job sites
- Driver behavior pattern analysis
- Idle time tracking and productivity metrics
- Assignment optimization recommendations

## 🔧 Development

```bash
# Setup
git clone https://github.com/trevden810/DispatchTracker
cd DispatchTracker
npm install

# Environment
cp .env.example .env.local
# Add Samsara & FileMaker credentials

# Development
npm run dev  # Port 3002
# Primary interface: http://localhost:3002/cards

# Deploy
git push origin master  # Auto-deploys to Vercel
```

## 🎨 Enhanced Business Logic

```typescript
// Driver Behavior Analysis
const getDriverBehaviorStatus = (vehicle) => {
  const speed = vehicle.diagnostics?.speed || 0
  const engineStatus = vehicle.diagnostics?.engineStatus
  const isAtJob = vehicle.proximity.isAtJob
  const hasJob = !!vehicle.assignedJob
  
  // Intelligent status determination
  if (speed > 5 && engineStatus === 'on') {
    return { status: 'driving', color: 'lime', animation: 'pulse' }
  }
  
  if (isAtJob && hasJob) {
    return { status: 'at-job', color: 'emerald', animation: 'glow' }
  }
  
  // Idle time monitoring (>30 minutes)
  if (speed <= 5 && !isAtJob && hasJob && idleTime > 30) {
    return { status: 'idle-alert', color: 'red', animation: 'flash' }
  }
  
  return { status: 'available', color: 'blue', animation: 'breathe' }
}

// Enhanced Border Animations
const getBorderClasses = (status) => {
  const animations = {
    driving: 'border-lime-400 border-animate-pulse',
    'at-job': 'border-emerald-500 border-animate-glow', 
    'idle-alert': 'border-red-500 border-animate-flash',
    available: 'border-blue-400 border-animate-breathe'
  }
  return `border-2 transition-all duration-500 ${animations[status]}`
}
```

## 🎯 Deployment Info

- **Vercel Project**: `prj_dfZJFBw99fDHGa2ij1IcPKddUoG4`
- **GitHub**: `trevden810/DispatchTracker` (master branch)
- **Domain**: www.pepmovetracker.info
- **Primary URL**: https://www.pepmovetracker.info/cards
- **Auto-Deploy**: master branch → production

## 🧪 Testing Enhanced Features

**Phase 2 Completed**:
1. ✅ **Animated Status Borders** - Driver behavior visualization
2. ✅ **Flip Card Diagnostics** - Comprehensive Samsara data display
3. ✅ **Search & Filter Controls** - Advanced fleet management
4. ✅ **Professional UI/UX** - PepMove branding with lime green accents
5. ✅ **Real-time Updates** - 30-second refresh with status changes

**Phase 3 Completed**:
- ✅ Interface consolidation and route optimization
- ✅ Legacy view deprecation with automatic redirects
- ✅ Enhanced documentation and user guidance

## 📞 Contact & Development Context

**Trevor** - Service Operations Manager  
**Company**: PepMove Logistics  
**Location**: Aurora, Colorado (Mountain Time)  
**Environment**: Windows PowerShell, VS Code, Git/GitHub  
**Development Philosophy**: Professional, clean, efficient solutions

## 🚀 Next Steps - Phase 3

### **Phase 3 Completed ✅**
1. ✅ **Route Consolidation**: All URLs redirect to `/cards` automatically
2. ✅ **Feature Verification**: All functionality consolidated in enhanced interface
3. ✅ **Documentation Updates**: README and architecture documentation updated
4. → **User Training**: Guide logistics team to use consolidated interface

### **Success Metrics**
- **Single Interface**: All fleet management through enhanced cards view
- **Improved Efficiency**: Reduced clicks and navigation complexity  
- **Enhanced Visibility**: Better driver status recognition and response
- **Operational Excellence**: Streamlined dispatcher workflow

---

**Version**: 2.0.0 - Enhanced Driver Status with Animated Borders Complete  
**Phase**: 3.0 - Interface Consolidation & Route Optimization  
**Primary Interface**: https://www.pepmovetracker.info/cards 🎯
