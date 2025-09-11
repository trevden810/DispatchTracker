# DispatchTracker - MVP Debug & Rebuild

**Status**: CRITICAL ISSUES DETECTED - Methodical rebuild required starting with single vehicle test

## 🚨 CURRENT PROBLEMS IDENTIFIED

### **Issue 1: No Job Information on Vehicle Cards**
- Vehicle cards are not displaying assigned job information
- Route assignments are not appearing in the dashboard
- "Assigned/Unassigned" filter shows no assignments

### **Issue 2: GPS Data Not Showing**
- Vehicle location data missing from cards
- Real-time GPS tracking not displaying
- Samsara API integration issues suspected

### **Issue 3: Route Correlation Not Working**
- Despite field mapping fixes, route assignments not functioning
- Vehicle-to-job correlation failing
- Dashboard shows "0 trucks have assigned jobs"

---

## 🎯 METHODICAL MVP APPROACH

### **Test Subject: Mykiel James in Truck 77**
- **Driver**: Mykiel James  
- **Vehicle**: Truck 77
- **Goal**: Single working vehicle with complete GPS and job data
- **Success Criteria**: "Truck 77 - Mykiel James - Route X, Stop Y of Z"

---

## 🔧 SYSTEMATIC DEBUG STRATEGY

### **Phase 1: Data Source Verification (1 hour)**

#### **1.1 Samsara GPS Integration**
```bash
# Test Samsara API directly for Truck 77
curl -H "Authorization: Bearer samsara_api_VXKWxiewMU9DvBoEH1ttkHmHHOT1q8" \
"https://api.samsara.com/fleet/vehicles/stats?types=gps,engineStates"

# Look specifically for Truck 77 data
# Verify: GPS coordinates, engine status, timestamp
```

#### **1.2 FileMaker Job Data**
```bash
# Test enhanced jobs API for Truck 77 assignments  
curl "https://www.pepmovetracker.info/api/jobs?limit=20" | \
jq '.data[] | select(.truckId == 77) | {id, customer, routeId, stopOrder, truckId}'

# Expected: Jobs assigned to truckId: 77 with route information
```

#### **1.3 Route Correlation Test**
```bash
# Test tracking API for Truck 77 correlation
curl "https://www.pepmovetracker.info/api/tracking" | \
jq '.data[] | select(.vehicleName | contains("77")) | {vehicleName, assignedJob, routeInfo}'

# Expected: Truck 77 with assigned job and route information
```

### **Phase 2: Component-by-Component Fix (2 hours)**

#### **2.1 GPS Data Flow**
- Verify Samsara API token validity
- Test vehicle ID matching between Samsara and FileMaker
- Fix GPS coordinate display in vehicle cards
- Ensure real-time location updates

#### **2.2 Job Assignment Logic**
- Debug transformJobRecord() function field mapping
- Test route correlation algorithm with Truck 77 data
- Verify vehicle-to-job matching logic
- Fix assigned job display in vehicle cards

#### **2.3 Route Information Display**
- Test route progress calculation for Truck 77
- Debug vehicle card route information display
- Verify "Route X, Stop Y of Z" formatting
- Fix dashboard assignment counts

### **Phase 3: End-to-End Integration (1 hour)**

#### **3.1 Complete Truck 77 Test**
- GPS location showing on vehicle card ✓
- Assigned job information displaying ✓  
- Route progress visible (Route X, Stop Y of Z) ✓
- Driver name (Mykiel James) showing ✓
- Real-time status updates working ✓

#### **3.2 Expand to Additional Vehicles**
- Apply working solution to other trucks
- Verify scalability with full 51-vehicle fleet
- Test performance with complete data set

---

## 🛠️ SPECIFIC DEBUG COMMANDS

### **For Next Developer Session:**

#### **1. Check Samsara API Health**
```javascript
// Use Analysis tool to test Samsara integration
const response = await fetch("https://api.samsara.com/fleet/vehicles/stats?types=gps,engineStates", {
  headers: {
    'Authorization': 'Bearer samsara_api_VXKWxiewMU9DvBoEH1ttkHmHHOT1q8'
  }
});

const vehicles = await response.json();
const truck77 = vehicles.data.find(v => v.name.includes('77'));
console.log('Truck 77 GPS data:', truck77);
```

#### **2. Verify FileMaker Job Assignments**
```javascript
// Test jobs API for Truck 77 assignments
const jobs = await fetch("https://www.pepmovetracker.info/api/jobs?limit=50");
const jobsData = await jobs.json();

const truck77Jobs = jobsData.data.filter(job => job.truckId === 77);
console.log('Truck 77 jobs:', truck77Jobs);
console.log('Route assignments:', truck77Jobs.map(j => ({id: j.id, routeId: j.routeId, stopOrder: j.stopOrder})));
```

#### **3. Debug Vehicle Card Data**
```javascript
// Test tracking API for complete vehicle data
const tracking = await fetch("https://www.pepmovetracker.info/api/tracking");
const trackingData = await tracking.json();

const truck77Vehicle = trackingData.data.find(v => v.vehicleName.includes('77'));
console.log('Truck 77 complete data:', truck77Vehicle);
```

---

## 📋 MVP SUCCESS CHECKLIST

### **Truck 77 - Mykiel James Verification:**

#### **GPS & Location** 
- [ ] Vehicle shows current GPS coordinates
- [ ] Location updates in real-time (every 30 seconds)
- [ ] Address reverse geocoding working
- [ ] Map integration functional

#### **Job Assignment**
- [ ] Vehicle shows assigned job information
- [ ] Customer name and address displaying
- [ ] Job status and type visible
- [ ] Proximity to job location calculated

#### **Route Information**
- [ ] Route ID displaying (Route 1, Route 2, etc.)
- [ ] Stop sequence showing (Stop 3 of 7)
- [ ] Route progress percentage visible
- [ ] Driver name (Mykiel James) showing

#### **Dashboard Integration**
- [ ] "Assigned" vehicles count > 0
- [ ] Vehicle appears in "Assigned Only" filter
- [ ] Route metrics displaying in summary
- [ ] Real-time updates working

---

## 🔧 CRITICAL FILES TO INVESTIGATE

### **API Endpoints**
```
app/api/tracking/route.ts     # Main correlation logic
app/api/jobs/route.ts         # FileMaker job data
lib/route-correlation.ts      # Route assignment algorithm
```

### **Frontend Components**  
```
components/VehicleCard.tsx    # Individual vehicle display
app/cards/page.tsx           # Main dashboard
lib/types.ts                 # Data interfaces
```

### **Utilities**
```
lib/gps-utils.ts             # GPS calculations
lib/geocoding.ts             # Address conversion
```

---

## 🎯 EXPECTED MVP OUTCOME

**Single Vehicle Success Model:**
```
Truck 77 - Mykiel James
├── GPS: 39.7392° N, 104.9903° W (Aurora, CO)
├── Status: Driving (25 mph)  
├── Job: #64479 - COMPASS GROUP
├── Route: Route 2, Stop 3 of 7 (43% complete)
├── Destination: 11095 E 45TH AVE, DENVER
├── Distance: 2.3 miles away
└── ETA: 8 minutes
```

**Once Truck 77 works perfectly, replicate the solution across all 51 vehicles for complete fleet management.**

---

## 📞 IMMEDIATE ACTION REQUIRED

1. **Start new Claude conversation** with this README context
2. **Focus exclusively on Truck 77** until fully functional  
3. **Use MCP tools systematically** to debug each component
4. **Document working solution** for replication across fleet
5. **Avoid complexity** - fix basics first before advanced features

**The foundation exists, but requires methodical debugging starting with a single vehicle to identify and resolve the core issues preventing job and GPS data from displaying properly.**
