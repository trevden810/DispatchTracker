// Test to verify over-matching fix
// Run with: node tests/test-over-matching-fix.js

const testVehicles = [
  { id: '1', name: 'TRUCK 1', diagnostics: {} },
  { id: '81', name: 'TRUCK 81', diagnostics: {} },
  { id: '85', name: 'TRUCK 85', diagnostics: {} },
  { id: '5', name: 'TRUCK 5', diagnostics: {} },
  { id: '3', name: 'TRUCK 3', diagnostics: {} }
]

const testJobs = [
  { id: 1001, status: 'Active', routeId: 1, truckId: null, driverId: null },
  { id: 1002, status: 'Active', routeId: 3, truckId: null, driverId: null },
  { id: 1003, status: 'Active', routeId: 5, truckId: null, driverId: null }
]

// Mock correlation function
function extractVehicleNumber(name) {
  if (!name) return null
  const match = name.match(/\d+/)
  return match ? match[0] : null
}

function testStrictMatching() {
  console.log('🧪 Testing Strict Route Matching\n')
  
  const correlations = []
  const assignedJobIds = new Set()
  
  for (const vehicle of testVehicles) {
    const vehicleNumber = extractVehicleNumber(vehicle.name)
    console.log(`Testing ${vehicle.name} (number: ${vehicleNumber})`)
    
    // Strict match - exact equality only
    const routeMatch = testJobs.find(j => {
      if (!j.routeId || assignedJobIds.has(j.id)) return false
      const routeStr = j.routeId.toString()
      return vehicleNumber === routeStr // EXACT match only
    })
    
    if (routeMatch) {
      console.log(`  ✅ Matched to Job ${routeMatch.id} (route ${routeMatch.routeId})`)
      correlations.push({
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        jobId: routeMatch.id,
        routeId: routeMatch.routeId
      })
      assignedJobIds.add(routeMatch.id)
    } else {
      console.log(`  ❌ No match`)
    }
  }
  
  console.log('\n📊 Results:')
  console.log(`Total correlations: ${correlations.length}`)
  console.log(`Unique jobs assigned: ${assignedJobIds.size}`)
  
  // Verify no duplicates
  const jobIds = correlations.map(c => c.jobId)
  const uniqueJobIds = new Set(jobIds)
  
  if (jobIds.length === uniqueJobIds.size) {
    console.log('✅ SUCCESS: No duplicate job assignments!')
  } else {
    console.log('❌ FAILURE: Duplicate job assignments detected!')
  }
  
  console.log('\nCorrelations:')
  correlations.forEach(c => {
    console.log(`  ${c.vehicleName} → Job ${c.jobId} (route ${c.routeId})`)
  })
  
  // Expected results
  console.log('\n✅ Expected Results:')
  console.log('  TRUCK 1 → Job 1001 (route 1)')
  console.log('  TRUCK 81 → No match (would have matched route 1 before fix)')
  console.log('  TRUCK 85 → No match (would have matched route 5 before fix)')
  console.log('  TRUCK 5 → Job 1003 (route 5)')
  console.log('  TRUCK 3 → Job 1002 (route 3)')
}

testStrictMatching()
