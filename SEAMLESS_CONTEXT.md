# DispatchTracker - Critical Issues Debug Session

**Date**: September 11, 2025  
**Status**: 🚨 CRITICAL BUGS DETECTED - Methodical MVP rebuild required  
**Priority**: Debug and fix core functionality starting with single vehicle test  
**Test Subject**: Mykiel James in Truck 77

---

## 🚨 CRITICAL ISSUES IDENTIFIED

### **Issue 1: Vehicle Cards Show No Job Information**
- ❌ No assigned job data displaying on vehicle cards
- ❌ Route assignments not appearing ("Route X, Stop Y of Z")  
- ❌ "Assigned/Unassigned" filter shows all vehicles as unassigned
- ❌ Dashboard shows "0 trucks have assigned jobs"

### **Issue 2: GPS Data Missing from Vehicle Cards**
- ❌ Vehicle location coordinates not displaying
- ❌ Real-time GPS tracking not working
- ❌ Samsara API integration may be broken
- ❌ Vehicle status and movement data missing

### **Issue 3: Route Correlation System Not Functioning**
- ❌ Despite field mapping fixes, correlation algorithm not working
- ❌ Vehicle-to-job matching failing
- ❌ Route progress tracking non-functional

---

## 🎯 METHODICAL MVP APPROACH

### **FOCUS: Single Vehicle Success First**
- **Test Driver**: Mykiel James
- **Test Vehicle**: Truck 77  
- **Success Goal**: Complete working example before scaling
- **Target Display**: "Truck 77 - Mykiel James - Route 2, Stop 3 of 7"

---

## 🔍 IMMEDIATE DIAGNOSTIC TASKS

### **1. Samsara GPS API Health Check**
```javascript
// Priority 1: Verify Samsara API is working for Truck 77
const samsaraTest = await fetch("https://api.samsara.com/fleet/vehicles/stats?types=gps,engineStates", {
  headers: { 'Authorization': 'Bearer samsara_api_VXKWxiewMU9DvBoEH1ttkHmHHOT1q8' }
});

const vehicles = await samsaraTest.json();
const truck77 = vehicles.data.find(v => v.name.includes('77') || v.id === '77');

console.log('🚛 Truck 77 Samsara Data:', truck77);
console.log('GPS:', truck77?.gps);
console.log('Engine:', truck77?.engineStates);
```

### **2. FileMaker Job Data Verification** 
```javascript
// Priority 2: Check if Truck 77 has job assignments in FileMaker
const jobs = await fetch("https://www.pepmovetracker.info/api/jobs?limit=50");
const jobsData = await jobs.json();

const truck77Jobs = jobsData.data.filter(job => job.truckId === 77);
console.log('🚛 Truck 77 Job Assignments:', truck77Jobs.length);
truck77Jobs.forEach(job => {
  console.log(`Job ${job.id}: Route ${job.routeId}, Stop ${job.stopOrder}, Customer: ${job.customer}`);
});
```

### **3. Tracking API Integration Test**
```javascript
// Priority 3: Check tracking API for Truck 77 correlation
const tracking = await fetch("https://www.pepmovetracker.info/api/tracking");
const trackingData = await tracking.json();

const truck77Tracking = trackingData.data.find(v => 
  v.vehicleName.includes('77') || v.vehicleId === '77'
);

console.log('🚛 Truck 77 Tracking Data:', truck77Tracking);
console.log('Assigned Job:', truck77Tracking?.assignedJob);
console.log('Route Info:', truck77Tracking?.routeInfo);
console.log('GPS Location:', truck77Tracking?.vehicleLocation);
```

---

## 🔧 SYSTEMATIC DEBUG WORKFLOW

### **Phase 1: Data Pipeline Verification (30 minutes)**

#### **Step 1: Samsara API Connection**
- ✅ Verify API token is valid and active
- ✅ Test GPS data retrieval for all vehicles
- ✅ Check Truck 77 specifically exists in Samsara response
- ✅ Validate GPS coordinates and timestamps

#### **Step 2: FileMaker Integration** 
- ✅ Test jobs API with routing fields
- ✅ Verify Truck 77 has job assignments with truckId: 77
- ✅ Check route data (routeId, stopOrder) is populated
- ✅ Validate field mapping corrections are working

#### **Step 3: Route Correlation Algorithm**
- ✅ Test correlateVehiclesWithRouteAssignments() function
- ✅ Debug vehicle ID matching logic (Truck 77 recognition)
- ✅ Verify route assignment creation for Truck 77
- ✅ Check proximity calculation if job locations exist

### **Phase 2: Component-Level Debugging (45 minutes)**

#### **Step 4: API Response Analysis**
```bash
# Check tracking API response structure
curl "https://www.pepmovetracker.info/api/tracking" | jq '.summary'
curl "https://www.pepmovetracker.info/api/tracking" | jq '.data[0]'

# Verify job assignment data structure  
curl "https://www.pepmovetracker.info/api/jobs?limit=5" | jq '.data[0]'
```

#### **Step 5: Vehicle Card Rendering**
- Debug VehicleCard component props
- Check if assignedJob data is being passed correctly
- Verify routeInfo object structure matches interface
- Test GPS location display logic

#### **Step 6: Dashboard State Management**
- Check if tracking data is being fetched properly
- Debug state updates and re-rendering
- Verify filter logic for assigned/unassigned vehicles

### **Phase 3: End-to-End Integration Fix (45 minutes)**

#### **Step 7: Complete Truck 77 Solution**
- Fix GPS data flow from Samsara → Tracking API → Vehicle Card
- Fix job assignment from FileMaker → Route Correlation → Vehicle Card  
- Fix route information display formatting
- Test real-time updates and refresh functionality

#### **Step 8: Validation & Scaling**
- Verify Truck 77 shows complete information
- Test with additional vehicles to ensure solution scales
- Performance check with full 51-vehicle dataset

---

## 🎯 SUCCESS CRITERIA

### **Truck 77 Complete Functionality:**

#### **GPS & Location Data** ✓
```
Location: 39.7392° N, 104.9903° W
Address: Aurora, CO
Last Updated: 2 minutes ago
Speed: 25 mph
Engine: On/Driving
```

#### **Job Assignment** ✓
```
Assigned Job: #64479
Customer: COMPASS GROUP  
Address: 11095 E 45TH AVE, DENVER
Status: En Route
Distance: 2.3 miles away
```

#### **Route Information** ✓
```
Driver: Mykiel James
Route: Route 2
Progress: Stop 3 of 7 (43% complete)
Next Stop: COMPASS GROUP
ETA: 8 minutes
```

#### **Dashboard Integration** ✓
```
Summary: "1 vehicles with route assignments"
Filter: Shows Truck 77 in "Assigned Only"
Real-time: Updates every 30 seconds
Status: All systems operational
```

---

## 📋 CRITICAL FILES FOR INVESTIGATION

### **Backend APIs**
```
app/api/tracking/route.ts     # Main vehicle-job correlation
app/api/jobs/route.ts         # FileMaker job data integration  
lib/route-correlation.ts      # Route assignment algorithm
lib/gps-utils.ts             # GPS calculation functions
```

### **Frontend Components**
```
components/VehicleCard.tsx    # Individual vehicle display
app/cards/page.tsx           # Main dashboard page
lib/types.ts                 # TypeScript interfaces
```

### **Configuration**
```
.env.local                   # API credentials and endpoints
next.config.js              # Build configuration
```

---

## 🚀 EXPECTED DEBUGGING OUTCOMES

### **Root Cause Categories:**
1. **API Integration Issues** - Samsara/FileMaker connection problems
2. **Data Transformation Errors** - Field mapping or type conversion issues  
3. **Component Rendering Bugs** - Frontend display logic problems
4. **State Management Issues** - Data flow or update cycle problems

### **Solution Implementation:**
1. **Fix data pipeline** from APIs → Backend → Frontend
2. **Correct component props** and rendering logic
3. **Verify real-time updates** and refresh cycles
4. **Test complete user workflow** with Truck 77

---

## 🆘 FOR THE NEXT DEVELOPER/CHAT SESSION

### **Start Here - Use These MCP Tools Immediately:**

1. **Analysis Tool** - Test API endpoints and data flow
2. **Filesystem Tools** - Read and debug component code  
3. **Web Research** - Find solutions for specific technical issues

### **Debugging Priority Order:**
1. **GPS Data** - Why is Samsara location data not displaying?
2. **Job Assignments** - Why are vehicle cards showing no job info?
3. **Route Correlation** - Why is the algorithm not creating assignments?
4. **Component Display** - Why are vehicle cards not rendering data?

### **Success Measurement:**
**When Truck 77 displays complete GPS, job, and route information, the core issues are resolved and the solution can be applied to all 51 vehicles.**

---

## 🎯 CRITICAL SUCCESS GOAL

**Transform this broken state:**
```
Truck 77
├── GPS: No location data
├── Job: No assignment  
├── Route: No route info
└── Status: Unknown
```

**Into this working state:**
```
Truck 77 - Mykiel James  
├── GPS: 39.7392° N, 104.9903° W (Aurora, CO)
├── Job: #64479 - COMPASS GROUP
├── Route: Route 2, Stop 3 of 7 (43% complete)  
├── Distance: 2.3 miles to destination
└── Status: En Route (25 mph)
```

**Use methodical debugging with MCP tools to identify and fix each component until Truck 77 shows complete, accurate, real-time information. Then replicate the working solution across the entire fleet.**
