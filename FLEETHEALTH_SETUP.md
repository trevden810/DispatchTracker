# FleetHealth Monitor - Quick Setup & Testing Guide

## 🚀 **IMMEDIATE TESTING**

### **1. Test the API First**
```bash
# Check health monitoring API
curl https://www.pepmovetracker.info/api/health/status

# Expected response: JSON with vehicle health data
```

### **2. View the Dashboard**
```
URL: https://www.pepmovetracker.info/health
```

### **3. What You Should See**
- **Status Summary**: Count of healthy/warning/critical vehicles
- **Vehicle Cards**: Color-coded health status for each truck
- **Real-time Updates**: Data refreshes every 30 seconds
- **Health Alerts**: Clear messages for any issues

---

## 🔧 **TROUBLESHOOTING**

### **If Dashboard Shows "Loading..."**
1. Check API endpoint: `/api/health/status`
2. Verify vehicles API is working: `/api/vehicles`
3. Check browser console for errors

### **If No Health Data**
1. Ensure Samsara vehicle API is returning diagnostic data
2. Check health threshold logic in `route.ts`
3. Verify data transformation from vehicles to health format

### **If Cards Look Wrong**
1. Check vehicle diagnostic data structure
2. Verify color-coding logic in React component
3. Test with different vehicle statuses

---

## 📊 **EXPECTED RESULTS**

### **Healthy Fleet Scenario**
- Most cards **GREEN** with "All Systems Normal"
- Diagnostic values within normal ranges
- No critical alerts

### **Mixed Health Scenario**
- Some **YELLOW** cards with specific warnings
- Some **RED** cards with critical alerts
- Clear action items for each issue

### **Data Validation**
```json
{
  "success": true,
  "vehicles": [
    {
      "vehicleId": "12345",
      "name": "Truck 96", 
      "status": "critical",
      "alerts": [
        {
          "type": "coolant",
          "severity": "critical",
          "message": "COOLANT CRITICAL: 220°F",
          "value": 220
        }
      ],
      "diagnostics": {
        "coolantTemp": 220,
        "oilPressure": 40,
        "batteryVoltage": 12.5,
        "fuelLevel": 65
      }
    }
  ],
  "summary": {
    "total": 50,
    "healthy": 42,
    "warning": 6, 
    "critical": 2
  }
}
```

---

## ⚡ **FOR NEW CLAUDE PROJECT**

### **Context to Provide**
"FleetHealth Monitor is a real-time vehicle health dashboard built on DispatchTracker's existing APIs. It analyzes Samsara diagnostic data (coolant temp, oil pressure, battery voltage, fuel levels) and provides traffic light status indicators for fleet managers. The foundation files are created and working - now I need to enhance the system with better error handling, vehicle detail views, and alert notifications."

### **Key Files to Copy**
1. `app/health/page.tsx` - Main dashboard React component
2. `app/api/health/status/route.ts` - Health monitoring API endpoint  
3. `FLEETHEALTH_README.md` - Complete documentation

### **Immediate Priorities for Enhancement**
1. **Error handling** - Graceful failures and retry logic
2. **Vehicle details** - Expandable cards with full diagnostic history
3. **Alert system** - Email/SMS notifications for critical issues
4. **Customization** - Adjustable health thresholds
5. **Performance** - Optimize for 50+ vehicle real-time updates

---

## 🎯 **SUCCESS VALIDATION**

### **Test Scenarios**
1. **Dashboard loads** showing vehicle health cards
2. **Status colors work** (red for critical, yellow for warning, green for healthy)
3. **Auto-refresh works** (data updates every 30 seconds)
4. **Filtering works** (can filter by status type)
5. **Mobile responsive** (works on phone/tablet)

### **Business Value Confirmation**
- ✅ Fleet managers can instantly see which trucks need attention
- ✅ Critical vehicle issues are immediately visible
- ✅ Preventive maintenance can be scheduled based on warnings
- ✅ Real-time monitoring prevents unexpected breakdowns

---

**🚛 Ready to revolutionize PepMove's fleet management with real-time vehicle health monitoring!**