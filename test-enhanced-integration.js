// DispatchTracker - Enhanced FileMaker Integration Test Suite
// Comprehensive testing for all new field access capabilities

const BASE_URL = 'http://localhost:3002'

/**
 * Test enhanced FileMaker field access
 */
async function testEnhancedFieldAccess() {
  console.log('🧪 Testing Enhanced FileMaker Field Access...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testFieldAccess: true })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Enhanced field access test PASSED')
      console.log('\nField Status:')
      
      // Original fields
      console.log('\n📋 ORIGINAL FIELDS:')
      Object.entries(result.field_status.original_fields).forEach(([field, status]) => {
        console.log(`  ${field}: ${status}`)
      })
      
      // Enhanced fields
      console.log('\n🆕 ENHANCED FIELDS:')
      Object.entries(result.field_status.enhanced_fields).forEach(([field, status]) => {
        console.log(`  ${field}: ${status}`)
      })
      
      // Sample data
      console.log('\n📊 SAMPLE DATA:')
      Object.entries(result.field_status.sample_data).forEach(([field, value]) => {
        console.log(`  ${field}: ${value}`)
      })
      
      return true
    } else {
      console.log('❌ Enhanced field access test FAILED')
      console.log('Error:', result.error)
      return false
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message)
    return false
  }
}

/**
 * Test enhanced job data with all new fields
 */
async function testEnhancedJobData() {
  console.log('\n🔍 Testing Enhanced Job Data Retrieval...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/jobs?limit=5&geocode=true&hygiene=true`)
    const result = await response.json()
    
    if (result.success && result.data) {
      console.log(`✅ Retrieved ${result.count} enhanced jobs`)
      
      const sampleJob = result.data[0]
      if (sampleJob) {
        console.log('\n📋 SAMPLE ENHANCED JOB:')
        console.log(`  Job ID: ${sampleJob.id}`)
        console.log(`  Status: ${sampleJob.status}`)
        console.log(`  Customer: ${sampleJob.customer || 'N/A'}`)
        console.log(`  Address: ${sampleJob.address || 'N/A'}`)
        console.log(`  Arrival Time: ${sampleJob.arrivalTime || 'N/A'}`)
        console.log(`  Completion Time: ${sampleJob.completionTime || 'N/A'}`)
        console.log(`  Due Date: ${sampleJob.dueDate || 'N/A'}`)
        
        if (sampleJob.location) {
          console.log(`  Geocoded Location: ${sampleJob.location.lat}, ${sampleJob.location.lng}`)
          console.log(`  Location Source: ${sampleJob.location.source}`)
        }
      }
      
      // Test schedule hygiene analysis
      if (result.hygiene) {
        console.log('\n🔍 SCHEDULE HYGIENE ANALYSIS:')
        console.log(`  ${result.hygiene.summary}`)
        console.log(`  Critical Issues: ${result.hygiene.criticalIssues.length}`)
        console.log(`  Total Issues: ${result.hygiene.totalIssues}`)
      }
      
      return true
    } else {
      console.log('❌ Enhanced job data test FAILED')
      console.log('Error:', result.error)
      return false
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message)
    return false
  }
}

/**
 * Test geocoding functionality
 */
async function testGeocodingFunctionality() {
  console.log('\n🗺️ Testing Address Geocoding...\n')
  
  const testAddresses = [
    '1600 Amphitheatre Parkway, Mountain View, CA',
    '1 Infinite Loop, Cupertino, CA',
    '350 5th Ave, New York, NY'
  ]
  
  try {
    // Test individual geocoding by making job requests
    const response = await fetch(`${BASE_URL}/api/jobs?limit=10&geocode=true`)
    const result = await response.json()
    
    if (result.success) {
      const geocodedJobs = result.data.filter(job => job.location && job.location.source === 'geocoded')
      
      console.log(`✅ Geocoding test completed`)
      console.log(`  Jobs with addresses: ${result.data.filter(j => j.address).length}`)
      console.log(`  Successfully geocoded: ${geocodedJobs.length}`)
      
      if (geocodedJobs.length > 0) {
        const sample = geocodedJobs[0]
        console.log(`\n📍 SAMPLE GEOCODED JOB:`)
        console.log(`  Address: ${sample.address}`)
        console.log(`  Coordinates: ${sample.location.lat}, ${sample.location.lng}`)
        console.log(`  Confidence: ${sample.location.confidence || 'unknown'}`)
      }
      
      return geocodedJobs.length > 0
    }
    
    return false
    
  } catch (error) {
    console.log('❌ Geocoding test failed:', error.message)
    return false
  }
}

/**
 * Test enhanced tracking integration
 */
async function testEnhancedTracking() {
  console.log('\n🎯 Testing Enhanced Vehicle-Job Tracking...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/tracking`)
    const result = await response.json()
    
    if (result.success && result.data) {
      console.log(`✅ Enhanced tracking test PASSED`)
      console.log(`\n📊 TRACKING SUMMARY:`)
      console.log(`  Total Vehicles: ${result.summary.totalVehicles}`)
      console.log(`  Vehicles with Jobs: ${result.summary.vehiclesWithJobs}`)
      console.log(`  Vehicles with Real Addresses: ${result.summary.vehiclesWithAddresses}`)
      console.log(`  Vehicles at Job Sites: ${result.summary.vehiclesAtJobs}`)
      
      if (result.summary.scheduleIssues) {
        console.log(`\n🚨 SCHEDULE ISSUES:`)
        console.log(`  Critical: ${result.summary.scheduleIssues.critical}`)
        console.log(`  Warnings: ${result.summary.scheduleIssues.warning}`)
        console.log(`  Action Needed: ${result.summary.scheduleIssues.actionNeeded}`)
      }
      
      // Sample vehicle with enhanced data
      const vehicleWithJob = result.data.find(v => v.assignedJob && v.assignedJob.location)
      if (vehicleWithJob) {
        console.log(`\n🚛 SAMPLE ENHANCED VEHICLE:`)
        console.log(`  Vehicle: ${vehicleWithJob.vehicleName}`)
        console.log(`  Customer: ${vehicleWithJob.assignedJob.customer || 'N/A'}`)
        console.log(`  Address: ${vehicleWithJob.assignedJob.address || 'N/A'}`)
        console.log(`  Distance to Job: ${vehicleWithJob.proximity.distance?.toFixed(2) || 'N/A'} miles`)
        console.log(`  Proximity Status: ${vehicleWithJob.proximity.status}`)
        console.log(`  Schedule Status: ${vehicleWithJob.scheduleStatus.message}`)
        console.log(`  Severity: ${vehicleWithJob.scheduleStatus.severity}`)
      }
      
      return true
    } else {
      console.log('❌ Enhanced tracking test FAILED')
      console.log('Error:', result.error)
      return false
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message)
    return false
  }
}

/**
 * Test schedule hygiene monitoring
 */
async function testScheduleHygiene() {
  console.log('\n🔍 Testing Schedule Hygiene Monitoring...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/schedule-hygiene`)
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Schedule hygiene monitoring ACTIVE`)
      console.log(`\n📊 HYGIENE SUMMARY:`)
      console.log(`  ${result.data.summary}`)
      
      console.log(`\n📈 STATISTICS:`)
      console.log(`  Total Jobs Analyzed: ${result.data.statistics.totalJobs}`)
      console.log(`  Total Issues Found: ${result.data.statistics.totalIssues}`)
      console.log(`  Critical Issues: ${result.data.statistics.criticalCount}`)
      console.log(`  Actionable Items: ${result.data.statistics.actionableCount}`)
      
      if (result.data.statistics.issuesByType) {
        console.log(`\n🏷️ ISSUES BY TYPE:`)
        Object.entries(result.data.statistics.issuesByType).forEach(([type, count]) => {
          console.log(`  ${type}: ${count}`)
        })
      }
      
      if (result.data.actionableItems.details) {
        const actionable = result.data.actionableItems.details
        console.log(`\n⚡ ACTIONABLE ITEMS:`)
        console.log(`  Urgent Updates: ${actionable.urgentUpdates.length}`)
        console.log(`  Overdue Jobs: ${actionable.overdueJobs.length}`)
        console.log(`  Long Idle Jobs: ${actionable.longIdleJobs.length}`)
        console.log(`  Missing Data: ${actionable.missingData.length}`)
      }
      
      return true
    } else {
      console.log('❌ Schedule hygiene test FAILED')
      console.log('Error:', result.error)
      return false
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message)
    return false
  }
}

/**
 * Run complete enhanced integration test suite
 */
async function runCompleteTestSuite() {
  console.log('🚀 DispatchTracker Enhanced Integration Test Suite')
  console.log('='.repeat(50))
  console.log('Testing all enhanced FileMaker field capabilities...\n')
  
  const results = {
    fieldAccess: await testEnhancedFieldAccess(),
    jobData: await testEnhancedJobData(), 
    geocoding: await testGeocodingFunctionality(),
    tracking: await testEnhancedTracking(),
    scheduleHygiene: await testScheduleHygiene()
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('🎯 TEST SUITE RESULTS:')
  console.log('='.repeat(50))
  
  const passed = Object.values(results).filter(r => r).length
  const total = Object.keys(results).length
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL'
    console.log(`  ${test}: ${status}`)
  })
  
  console.log(`\n📊 Overall: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! Enhanced FileMaker integration is working correctly.')
    console.log('\n🚀 Ready to deploy enhanced features:')
    console.log('  ✅ All FileMaker fields accessible')
    console.log('  ✅ Real customer addresses with geocoding')
    console.log('  ✅ Schedule hygiene automation active')
    console.log('  ✅ Enhanced vehicle tracking operational')
  } else {
    console.log('\n⚠️ Some tests failed. Please review the errors above.')
  }
  
  return passed === total
}

// Run the test suite
runCompleteTestSuite().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})
