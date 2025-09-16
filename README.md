# DispatchTracker - Fleet Management System

**CRITICAL STATUS UPDATE**: Field mapping issue RESOLVED ✅  
**Production Status**: Ready for deployment testing  
**Last Updated**: September 16, 2025  

## 🚨 Recent Critical Fix

**Issue**: FileMaker `truckId` field returned `undefined`, blocking all vehicle-job correlations  
**Root Cause**: Field name used underscores `_kf_trucks_id` instead of required asterisks `*kf*trucks_id`  
**Solution**: Updated field mapping to use original asterisk notation from FileMaker specification  
**Impact**: Unblocks 3-week development delay, enables vehicle tracking system  

## 🎯 Project Overview

**DispatchTracker** provides real-time GPS tracking of PepMove delivery vehicles correlated with FileMaker job assignments. Enables logistics specialists to monitor driver locations, detect job site arrivals, and maintain schedule hygiene.

### Core Functionality
- **Real-Time Vehicle Tracking**: 51 vehicles with GPS coordinates and diagnostics
- **Job Assignment Correlation**: FileMaker integration with truck ID matching
- **Proximity Detection**: 0.5-mile threshold for "at job site" status  
- **Schedule Hygiene**: Automated flagging of timing discrepancies

## 🛠️ Technical Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend**: Next.js API routes with intelligent caching
- **Integrations**: Samsara Fleet API + FileMaker Data API  
- **Deployment**: Vercel with auto-deployment
- **GPS Logic**: Haversine formula for distance calculations

## 🔧 Quick Start

### Prerequisites
- Node.js 18+
- Valid Samsara API token
- FileMaker Data API credentials

### Installation
```bash
git clone <repository>
cd DispatchTracker
npm install
cp .env.example .env.local  # Configure API credentials
npm run dev                 # Start development server
```

### Critical System Test
```bash
node CRITICAL_SYSTEM_VALIDATION.js
```
This validates FileMaker connectivity, field mapping, Samsara integration, and production readiness.

## 📊 API Configuration

### Samsara Fleet API
```
Base URL: https://api.samsara.com
Token: [Configured in .env.local]
Endpoints: /fleet/vehicles
Data: GPS coordinates, engine status, fuel levels
```

### FileMaker Data API  
```
Base URL: https://modd.mainspringhost.com/fmi/data/vLatest
Database: PEP2_1
Layout: jobs_api
Authentication: Basic Auth (trevor_api)
Critical Fields: *kf*trucks_id (note: asterisk notation required)
```

## 🎯 Core Features

### Vehicle Tracking
- Real-time GPS coordinates for 51 vehicles
- Engine status, fuel levels, diagnostics
- 30-second refresh intervals
- Gateway coverage analytics

### Job Correlation
- FileMaker job data integration
- Truck ID matching with `*kf*trucks_id` field
- Proximity-based job site detection
- Status correlation with arrival/completion times

### Schedule Hygiene  
- Flag jobs with arrival time but incomplete status
- Identify overdue assignments
- Alert on status lag after completion
- Generate actionable insights for dispatchers

## 🚀 Deployment

### Development
```bash
npm run dev          # Start dev server (localhost:3002)
npm run build        # Build for production
npm run start        # Start production server
```

### Production Testing
1. Run critical system validation: `node CRITICAL_SYSTEM_VALIDATION.js`
2. Verify API connectivity and field mapping
3. Test vehicle-job correlation accuracy
4. Deploy to Vercel staging environment

### Environment Variables
```bash
# Required in .env.local
SAMSARA_API_TOKEN=your_samsara_token
FILEMAKER_USERNAME=trevor_api
FILEMAKER_PASSWORD=your_password
FILEMAKER_BASE_URL=https://modd.mainspringhost.com
FILEMAKER_JOBS_DB=PEP2_1
FILEMAKER_JOBS_LAYOUT=jobs_api
```

## 📍 GPS Logic

### Distance Calculation
Uses Haversine formula for accurate distance between vehicle GPS and job site coordinates.

### Proximity Status Levels
- **at-location**: ≤ 0.5 miles (job site arrival)
- **nearby**: ≤ 1.0 miles (approaching)  
- **en-route**: ≤ 10 miles (traveling to job)
- **far**: > 10 miles (not assigned or distant)

### Schedule Hygiene Detection
```typescript
// Example: Flag incomplete jobs after arrival
const hygieneIssues = jobs.filter(job => 
  job.time_arival && 
  !['Complete', 'Done', 'Re-scheduled', 'Attempted', 'Canceled'].includes(job.status)
);
```

## 🏗️ Architecture

### File Structure
```
DispatchTracker/
├── app/
│   ├── api/
│   │   ├── vehicles/route.ts      # Samsara integration
│   │   ├── jobs/route.ts          # FileMaker integration (*kf*trucks_id fix)
│   │   ├── tracking/route.ts      # Vehicle-job correlation
│   │   └── schedule-hygiene/route.ts
│   ├── page.tsx                   # Main dashboard
│   └── layout.tsx
├── lib/
│   ├── types.ts                   # Type definitions (*kf*trucks_id field)
│   ├── gps-utils.ts              # Distance calculations
│   └── intelligent-matching.ts   # Correlation algorithms
└── components/                    # React components
```

### Key Integration Points
- **FileMaker Field Mapping**: `*kf*trucks_id` (asterisk notation required)
- **Vehicle ID Correlation**: Match FileMaker truck IDs to Samsara vehicle names/external IDs
- **Real-Time Updates**: 30-second refresh for GPS, 2-minute for job status
- **Error Handling**: Graceful degradation when APIs unavailable

## 🔍 Troubleshooting

### Common Issues

**No vehicle-job correlations showing**
- Verify FileMaker field mapping uses `*kf*trucks_id` (asterisks, not underscores)
- Check API credentials in `.env.local`
- Run critical system validation test

**GPS tracking not updating**
- Confirm Samsara API token is valid
- Check vehicle gateway connectivity
- Verify 30-second refresh interval

**Schedule hygiene alerts not working**
- Ensure FileMaker enhanced fields are accessible
- Verify time field parsing (arrival/completion times)
- Check job status matching logic

### Debug Commands
```bash
# Test FileMaker connectivity and field mapping
node CRITICAL_SYSTEM_VALIDATION.js

# Check Samsara API response
curl -H "Authorization: Bearer $SAMSARA_TOKEN" https://api.samsara.com/fleet/vehicles

# Verify environment configuration  
npm run build && npm run start
```

## 📈 Performance Metrics

- **API Response Time**: <200ms target
- **Vehicle Tracking**: 51 vehicles, 30-second updates
- **Job Correlation Rate**: Target >50% with valid truck assignments
- **Schedule Hygiene Detection**: Real-time flagging of discrepancies

## 🎯 Development Roadmap

### ✅ Phase 1: Core Integration (COMPLETE)
- Samsara Fleet API integration
- FileMaker Data API connection  
- Critical field mapping fix (`*kf*trucks_id`)
- Basic vehicle-job correlation

### 🚧 Phase 2: Enhanced Features (IN PROGRESS)
- Advanced vehicle detail cards with flip animations
- Comprehensive schedule hygiene dashboard
- Real-time notifications and alerts
- Mobile optimization for field supervisors  

### 📋 Phase 3: Analytics & Intelligence (PLANNED)
- Predictive arrival time algorithms
- Route optimization suggestions  
- Performance analytics and reporting
- Advanced correlation refinements

## 🤝 Team & Support

**Lead Developer**: Technical implementation and system architecture  
**Business Analyst**: Requirements gathering and FileMaker liaison  
**Database Administrator**: FileMaker layout and field access management  
**Logistics Team**: End-user testing and operational requirements  

**Location**: Aurora, Colorado (Mountain Time - America/Denver)  
**Development Environment**: Windows, VS Code, Git/GitHub, PowerShell  

## 📞 Contact & Documentation

For technical issues or deployment questions, reference:
- `CRITICAL_SYSTEM_VALIDATION.js` - End-to-end system testing
- `SEAMLESS_CONTEXT.md` - Complete project context and MCP integration
- `/archive/docs/` - Historical documentation and testing guides

**Critical Field Mapping Note**: Always use `*kf*trucks_id` with asterisks, not underscores, when accessing FileMaker truck ID field. This was the root cause of the 3-week development delay.

---

**Project Status**: READY FOR PRODUCTION TESTING ✅  
**Last Critical Fix**: September 16, 2025 - FileMaker field mapping resolved  
**Next Milestone**: Production deployment and logistics team training
