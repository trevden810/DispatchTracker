// Test route-based correlation locally
const BASE_URL = 'http://localhost:3002'

async function testRouteCorrelation() {
  console.log('\n🧪 Testing Route-Based Correlation\n')
  
  try {
    // Test tracking endpoint
    const response = await fetch(`${BASE_URL}/api/tracking`)
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Tracking API responding')
      console.log(`\n📊 Results:`)
      console.log(`   Total vehicles: ${data.correlationMetrics.totalVehicles}`)
      console.log(`   Total jobs: ${data.correlationMetrics.totalJobs}`)
      console.log(`   Vehicles with jobs: ${data.correlationMetrics.correlatedVehicles}`)
      console.log(`   Route assigned: ${data.correlationMetrics.routeAssigned}`)
      console.log(`\n   Match breakdown:`)
      console.log(`   - Truck ID matches: ${data.correlationMetrics.matchTypes.truck}`)
      console.log(`   - Route ID matches: ${data.correlationMetrics.matchTypes.route}`)
      console.log(`   - Driver matches: ${data.correlationMetrics.matchTypes.driver}`)
      
      // Show sample correlations
      const withJobs = data.data.filter(v => v.assignedJob)
      if (withJobs.length > 0) {
        console.log(`\n🚛 Sample Assignments:`)
        withJobs.slice(0, 5).forEach(v => {
          console.log(`   ${v.vehicleId}: Job ${v.assignedJob.id} - ${v.assignedJob.status}`)
          console.log(`      Match: ${v.proximity.matchingFactors.join(', ')}`)
        })
      } else {
        console.log(`\n⚠️  No vehicles matched to jobs`)
        console.log(`\n🔍 Debug info:`)
        console.log(`   Sample vehicle names:`, data.data.slice(0, 3).map(v => v.vehicleId))
        
        // Check if jobs have route data
        const jobResponse = await fetch(`${BASE_URL}/api/jobs?limit=10&active=true`)
        const jobData = await jobResponse.json()
        if (jobData.success) {
          console.log(`\n   Sample job route data:`)
          jobData.data.slice(0, 5).forEach(j => {
            console.log(`   Job ${j.id}: truck=${j.truckId}, route=${j.routeId}, driver=${j.driverId}`)
          })
        }
      }
      
    } else {
      console.log('❌ Tracking API failed:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testRouteCorrelation()
