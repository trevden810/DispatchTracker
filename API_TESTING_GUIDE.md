# DispatchTracker API Testing Guide

## 🧪 COMPREHENSIVE API TESTING SUITE

**Status**: Production deployment successful, investigating job information issue  
**Priority**: Validate all API integrations and diagnose data flow  

---

## 📋 POSTMAN SETUP INSTRUCTIONS

### 1. Import Test Collection
1. Open Postman
2. Click "Import" 
3. Select `DispatchTracker_API_Tests.postman_collection.json`
4. Import the environment files:
   - `DispatchTracker_Production.postman_environment.json`
   - `DispatchTracker_Local.postman_environment.json`

### 2. Configure Environment
1. Select appropriate environment (Production or Local)
2. Update `BASE_URL` variable:
   - **Production**: `https://your-deployment-url.vercel.app`
   - **Local**: `http://localhost:3002`

---

## 🎯 CRITICAL TESTS TO RUN

### **Test 1: Health Check** ✅
**Endpoint**: `GET /api/health`  
**Purpose**: Verify deployment and configuration  
**Expected**: 200 response with system status

### **Test 2: Samsara Vehicles** 🚗
**Endpoint**: `GET /api/vehicles`  
**Purpose**: Validate vehicle tracking with GPS coordinates  
**Expected**: 50+ vehicles with valid lat/lng coordinates

### **Test 3: FileMaker Jobs - CRITICAL** 📋
**Endpoint**: `GET /api/jobs`  
**Purpose**: Diagnose job information issue  
**Expected**: Job data with addresses and customer info

### **Test 4: Geographic Correlation** 🎯
**Endpoint**: `GET /api/tracking`  
**Purpose**: Test complete vehicle-job matching system  
**Expected**: Correlation metrics and vehicle assignments

---

## 🔍 DIAGNOSTIC CHECKLIST

### **If Jobs API Fails:**
1. **Check FileMaker Authentication**:
   ```
   POST /api/jobs
   Body: {"testQuery": {"query": [{"_kp_job_id": "*"}], "limit": 3}}
   ```

2. **Verify Environment Variables**:
   - `FILEMAKER_USERNAME=trevor_api`
   - `FILEMAKER_PASSWORD=XcScS2yRoTtMo7`
   - `FILEMAKER_BASE_URL=https://modd.mainspringhost.com`

3. **Test Direct FileMaker Connection**:
   ```bash
   curl -X POST \
   https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/sessions \
   -H "Authorization: Basic dHJldm9yX2FwaTpYY1NjUzJ5Um9UdE1vNw==" \
   -H "Content-Type: application/json"
   ```

### **If Vehicles API Fails:**
1. **Check Samsara Token**: Verify `SAMSARA_API_TOKEN` in environment
2. **Test Direct Samsara Connection**:
   ```bash
   curl -H "Authorization: Bearer samsara_api_VXKWxiewMU9DvBoEH1ttkHmHHOT1q8" \
   https://api.samsara.com/fleet/vehicles/stats?types=gps
   ```

---

## 📊 EXPECTED RESULTS

### **Healthy System Response:**
```json
{
  "correlationMetrics": {
    "totalVehicles": 50,
    "totalJobs": 20,
    "correlatedVehicles": 0-10,
    "systemType": "geographic_correlation"
  },
  "processingTime": 300-800
}
```

### **Common Issues & Solutions:**

| Issue | Symptom | Solution |
|-------|---------|----------|
| **No job data** | `jobs: 0` | Check FileMaker credentials/connection |
| **No GPS coordinates** | `[undefined, undefined]` | Fixed - should show real coordinates |
| **500 errors** | API failures | Check environment variables |
| **Slow response** | >2000ms | Normal for first request, cache warming |

---

## 🚀 QUICK COMMAND LINE TESTS

### **Test 1: Health Check**
```bash
curl https://your-deployment-url.vercel.app/api/health
```

### **Test 2: Vehicles**
```bash
curl https://your-deployment-url.vercel.app/api/vehicles
```

### **Test 3: Jobs**
```bash
curl https://your-deployment-url.vercel.app/api/jobs?limit=5
```

### **Test 4: Full System**
```bash
curl https://your-deployment-url.vercel.app/api/tracking
```

---

## 🔧 TROUBLESHOOTING FLOWCHART

### **Step 1: Verify Deployment**
1. Health check returns 200 → Continue to Step 2
2. Health check fails → Check deployment logs

### **Step 2: Test Vehicle Tracking**
1. Vehicles API returns 50+ vehicles → Continue to Step 3
2. Vehicles API fails → Check Samsara API token

### **Step 3: Diagnose Jobs Issue**
1. Jobs API returns data → Continue to Step 4
2. Jobs API fails → **CRITICAL**: FileMaker connection issue
   - Verify credentials in production environment
   - Check network connectivity to FileMaker server
   - Test direct FileMaker authentication

### **Step 4: Validate Correlation**
1. Tracking API processes successfully → System operational
2. Tracking API fails → Check error logs for specific issues

---

## 📊 PERFORMANCE BENCHMARKS

### **Target Metrics:**
- **Health Check**: <100ms
- **Vehicles API**: <500ms
- **Jobs API**: <800ms  
- **Tracking API**: <1000ms
- **Overall System**: <2000ms end-to-end

### **Production Thresholds:**
- ✅ **Excellent**: <500ms total
- ✅ **Good**: 500-1000ms
- ⚠️ **Acceptable**: 1000-2000ms
- ❌ **Poor**: >2000ms (investigate)

---

## 🔍 SPECIFIC JOB INFORMATION DIAGNOSIS

### **Most Likely Causes:**

1. **Environment Variables Missing in Production**
   - FileMaker credentials not configured in Vercel
   - Check Vercel dashboard → Project Settings → Environment Variables

2. **Network Connectivity Issues**
   - Vercel serverless functions can't reach FileMaker server
   - Firewall blocking connections

3. **API Endpoint Changes**
   - FileMaker server configuration changed
   - Layout permissions modified

4. **Rate Limiting**
   - FileMaker API being rate limited
   - Too many concurrent requests

### **Diagnostic Commands:**

**Test 1: Environment Check**
```bash
curl https://your-deployment-url.vercel.app/api/health
# Look for fileMaker.configured: true
```

**Test 2: Direct Job Test**
```bash
curl -X POST https://your-deployment-url.vercel.app/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"testQuery": {"query": [{"_kp_job_id": "*"}], "limit": 2}}'
```

**Test 3: Network Connectivity**
```bash
# Test if production can reach FileMaker
curl -v https://modd.mainspringhost.com
```

---

## 🎯 IMMEDIATE ACTION PLAN

### **Priority 1: Run Postman Collection**
1. Import collection and environment
2. Update BASE_URL to your production deployment
3. Run "System Status Summary" test
4. Identify which API is failing

### **Priority 2: Check Environment Variables**
1. Go to Vercel dashboard
2. Navigate to your project → Settings → Environment Variables
3. Verify all required variables are set:
   - `SAMSARA_API_TOKEN`
   - `FILEMAKER_USERNAME`
   - `FILEMAKER_PASSWORD`
   - `FILEMAKER_BASE_URL`
   - `FILEMAKER_JOBS_DB`
   - `FILEMAKER_JOBS_LAYOUT`

### **Priority 3: Test Individual Components**
1. Run vehicles test (should work)
2. Run jobs test (likely failing)
3. Focus debugging on the failing component

---

## 📧 RESULTS REPORTING

### **Success Criteria:**
- ✅ Health check: 200 response
- ✅ Vehicles: 50+ vehicles with GPS coordinates
- ✅ Jobs: >0 jobs with addresses
- ✅ Tracking: Correlation system operational
- ✅ Performance: <1000ms processing time

### **Failure Investigation:**
- ❌ Document exact error messages
- ❌ Note which APIs fail vs succeed
- ❌ Check response times and performance
- ❌ Verify data structure and field availability

### **Report Format:**
```
DISPATCHTRACKER API TEST RESULTS
================================
Date: [timestamp]
Environment: Production/Local
Base URL: [your-url]

API Status:
- Health Check: ✅/❌ [response time]
- Vehicles API: ✅/❌ [vehicle count] 
- Jobs API: ✅/❌ [job count]
- Tracking API: ✅/❌ [correlation rate]

Issues Found:
- [Specific error messages]
- [Performance concerns]
- [Missing data]

Next Steps:
- [Specific actions needed]
```

---

**🚀 GOAL**: Identify and resolve the job information issue to restore full system functionality for the logistics team.

**🔧 STRATEGY**: Systematic testing to isolate the problem, then targeted fixes to restore complete DispatchTracker operation.
