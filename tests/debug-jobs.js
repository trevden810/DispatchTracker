// Debug job assignments
const BASE_URL = 'http://localhost:3002'

async function debugJobAssignments() {
  console.log('\n🔍 Debugging Job Assignments\n')
  
  try {
    // Get more jobs to find assignments
    const response = await fetch(`${BASE_URL}/api/jobs?limit=50&active=true`)
    const data = await response.json()
    
    if (data.success) {
      console.log(`✅ Got ${data.data.length} jobs\n`)
      
      // Find jobs with any assignment data
      const withTruck = data.data.filter(j => j.truckId)
      const withRoute = data.data.filter(j => j.routeId)
      const withDriver = data.data.filter(j => j.driverId)
      
      console.log(`📊 Assignment Summary:`)
      console.log(`   Jobs with truck ID: ${withTruck.length}`)
      console.log(`   Jobs with route ID: ${withRoute.length}`)
      console.log(`   Jobs with driver ID: ${withDriver.length}`)
      
      if (withTruck.length > 0) {
        console.log(`\n🚛 Sample Truck Assignments:`)
        withTruck.slice(0, 5).forEach(j => {
          console.log(`   Job ${j.id}: truck=${j.truckId}, route=${j.routeId}, status=${j.status}`)
        })
      }
      
      if (withRoute.length > 0) {
        console.log(`\n📍 Sample Route Assignments:`)
        withRoute.slice(0, 10).forEach(j => {
          console.log(`   Job ${j.id}: route="${j.routeId}", truck=${j.truckId}, status=${j.status}`)
        })
      }
      
      if (withDriver.length > 0) {
        console.log(`\n👤 Sample Driver Assignments:`)
        withDriver.slice(0, 5).forEach(j => {
          console.log(`   Job ${j.id}: driver="${j.driverId}", truck=${j.truckId}, status=${j.status}`)
        })
      }
      
      // Show unique route values
      const uniqueRoutes = [...new Set(data.data.map(j => j.routeId).filter(Boolean))]
      console.log(`\n🎯 Unique Route IDs:`, uniqueRoutes)
      
    } else {
      console.log('❌ No job data')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

debugJobAssignments()
