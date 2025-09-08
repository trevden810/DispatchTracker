# 🔧 DispatchTracker Samsara Integration Debugging Guide

## 🎯 **Issue Identified: Engine Status Not Updating**

The animated border states depend on real-time engine status from Samsara, but the data isn't flowing through properly.

## 🧪 **Testing Steps**

### **Step 1: Verify Samsara API Access**

Run this test in your project directory:

```bash
cd C:\Projects\DispatchTracker
node test-samsara-integration.js
```

**Expected Output:**
```
🧪 Testing Samsara API Integration...
📊 Testing Samsara /fleet/vehicles/stats endpoint...
✅ Successfully retrieved data for X vehicles
🚛 First Vehicle Analysis:
- Engine State: On/Off/Idle
- Speed: X mph
- Fuel Level: X%
```

### **Step 2: Test Local API Endpoints**

```bash
# Start the development server
npm run dev

# In a new terminal, test the endpoints:
curl http://localhost:3002/api/vehicles
curl http://localhost:3002/api/tracking
```

### **Step 3: Check Browser Network Tab**

1. Open http://localhost:3002/cards
2. Open Browser Dev Tools → Network tab
3. Look for `/api/tracking` requests
4. Check the response data structure

## 🔍 **Key Data Points to Verify**

### **Samsara API Response Structure (Expected):**
```json
{
  "data": [
    {
      "id": "vehicle_id",
      "name": "Vehicle Name",
      "engineStates": {
        "time": "2025-01-XX...",
        "value": "On" | "Off" | "Idle"
      },
      "gps": {
        "latitude": 39.xxxx,
        "longitude": -104.xxxx,
        "speedMilesPerHour": 35,
        "reverseGeo": {
          "formattedLocation": "Address"
        }
      },
      "fuelPercents": {
        "value": 75
      }
    }
  ]
}
```

### **DispatchTracker API Response (Expected):**
```json
{
  "success": true,
  "data": [
    {
      "vehicleId": "12345",
      "vehicleName": "Truck 1",
      "diagnostics": {
        "engineStatus": "on" | "off" | "idle",
        "speed": 35,
        "fuelLevel": 75
      }
    }
  ]
}
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Samsara API Returns Empty Data**
**Symptoms:** No engine states, GPS, or fuel data
**Solutions:**
- Verify API token has correct scopes: "Read Vehicle Stats"
- Check if vehicles have active gateways
- Ensure vehicles have recent activity

### **Issue 2: Engine Status Shows as "Unknown"**
**Symptoms:** All vehicles show gray "offline" borders
**Solutions:**
- Check if `vehicle.engineStates?.value` exists in API response
- Verify the stats endpoint includes `engineStates` in types parameter
- Check gateway connectivity

### **Issue 3: Cards Show Old/Mock Data**
**Symptoms:** Animated borders not changing, mock data displayed
**Solutions:**
- Clear browser cache
- Check API response in Network tab
- Verify 30-second auto-refresh is working

## 🛠 **Debugging Commands**

### **Check Environment Variables:**
```bash
echo $SAMSARA_API_TOKEN
# Should show: YOUR_SAMSARA_API_TOKEN
```

### **Manual API Test:**
```bash
curl -H "Authorization: Bearer YOUR_SAMSARA_API_TOKEN" \
     "https://api.samsara.com/fleet/vehicles/stats?types=gps,engineStates,fuelPercents,speeds"
```

### **Check Application Logs:**
```bash
# In the terminal running npm run dev, look for:
🚗 Fetching enhanced vehicle data from Samsara Stats API...
📊 Retrieved real-time stats for X vehicles
🚛 Vehicle Name: Engine=On, Speed=35mph, Fuel=75%
```

## 🎯 **Expected Behavior After Fix**

### **Engine States Should Drive Border Colors:**
- **🟢 Driving**: `engineStatus: "on"` + `speed > 5` → Lime green pulsing
- **💚 On Job**: `engineStatus: "on"` + `isAtJob: true` → Emerald green glowing  
- **🔴 Idle Alert**: `engineStatus: "on"` + `speed ≤ 5` + not at job → Red flashing
- **🟡 Stopped**: `engineStatus: "idle"` → Amber steady
- **🔵 Available**: No job assigned → Blue breathing
- **⚫ Offline**: `engineStatus: "off"` → Gray static

### **Status Badge Updates:**
- Top-left corner of each card should show current driver behavior
- Labels should update: "En Route to Job", "On Job Site", "Idle 45m", etc.
- Colors should match border animations

### **Diagnostics Accuracy:**
- Flip cards should show real Samsara data
- Speed, fuel, engine status from live API
- Odometer converted from meters to miles

## 📊 **Performance Monitoring**

### **API Response Times:**
- Samsara Stats API: Should be < 2 seconds
- DispatchTracker /api/tracking: Should be < 500ms
- Auto-refresh every 30 seconds

### **Data Freshness:**
- GPS timestamps should be within last 5 minutes
- Engine state changes should appear within 1 refresh cycle
- Fuel levels should update based on vehicle activity

## 🔄 **Next Steps After Testing**

1. **If Samsara API works**: Focus on data transformation in tracking route
2. **If API fails**: Check token scopes and vehicle gateway connectivity  
3. **If cards don't update**: Debug React state management and auto-refresh
4. **If borders don't animate**: Verify CSS classes and driver behavior logic

## 🚀 **Deploy After Verification**

Once local testing confirms real engine states are flowing through:

```bash
git add .
git commit -m "Fix: Enhanced Samsara integration with real-time engine states"
git push origin master
```

**Production URL**: https://www.pepmovetracker.info/cards

---

**This debugging guide should help identify exactly where the Samsara engine status data is getting lost in the pipeline! 🔧**
