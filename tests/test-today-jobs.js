// Test today's job assignments
const BASE_URL = 'http://localhost:3002'

async function testTodayJobs() {
  console.log('\n🔍 Testing Today\'s Jobs\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/jobs?limit=100&today=true`)
    const data = await response.json()
    
    if (data.success) {
      console.log(`✅ Got ${data.data.length} jobs for today\n`)
      
      const withAssignments = data.data.filter(j => j.truckId || j.routeId || j.driverId)
      console.log(`📊 Jobs with assignments: ${withAssignments.length}/${data.data.length}`)
      
      if (withAssignments.length > 0) {
        console.log('\n🚛 Sample Assignments:')
        withAssignments.slice(0, 10).forEach(j => {
          console.log(`  Job ${j.id}: truck=${j.truckId || 'N/A'}, route="${j.routeId || 'N/A'}", driver="${j.driverId || 'N/A'}", status=${j.status}`)
        })
        
        // Show unique values
        const uniqueTrucks = [...new Set(withAssignments.map(j => j.truckId).filter(Boolean))]
        const uniqueRoutes = [...new Set(withAssignments.map(j => j.routeId).filter(Boolean))]
        const uniqueDrivers = [...new Set(withAssignments.map(j => j.driverId).filter(Boolean))]
        
        console.log(`\n🎯 Unique Assignment Values:`)
        if (uniqueTrucks.length > 0) console.log(`  Truck IDs: ${uniqueTrucks}`)
        if (uniqueRoutes.length > 0) console.log(`  Route IDs: ${uniqueRoutes}`)
        if (uniqueDrivers.length > 0) console.log(`  Drivers: ${uniqueDrivers.slice(0, 5).join(', ')}${uniqueDrivers.length > 5 ? '...' : ''}`)
      } else {
        console.log('\n⚠️ No jobs have truck/route/driver assignments today')
      }
      
    } else {
      console.log('❌ Failed to get jobs:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testTodayJobs()
