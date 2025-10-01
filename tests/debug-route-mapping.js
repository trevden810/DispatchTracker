// Enhanced debug - check route/truck patterns
// Run: node tests/debug-route-mapping.js

async function debugMapping() {
  const baseUrl = 'https://www.pepmovetracker.info'
  
  console.log('🔍 Fetching ALL vehicles...')
  const vehiclesRes = await fetch(`${baseUrl}/api/vehicles`)
  const vehiclesData = await vehiclesRes.json()
  const vehicles = vehiclesData.data
  
  const vehicleNumbers = vehicles.map(v => ({
    name: v.name,
    number: v.name?.match(/\d+/)?.[0]
  }))
  
  console.log(`\n📊 All Vehicle Numbers:`)
  const uniqueNumbers = [...new Set(vehicleNumbers.map(v => v.number))].sort((a, b) => parseInt(a) - parseInt(b))
  console.log(uniqueNumbers.join(', '))
  
  console.log('\n🔍 Fetching ALL jobs (not just today)...')
  const jobsRes = await fetch(`${baseUrl}/api/jobs?limit=500`)
  const jobsData = await jobsRes.json()
  const jobs = jobsData.data
  
  console.log(`\n📊 Total jobs fetched: ${jobs.length}`)
  
  // Find all unique route IDs
  const routeIds = jobs
    .filter(j => j.routeId !== null && j.routeId !== undefined)
    .map(j => j.routeId)
  const uniqueRoutes = [...new Set(routeIds)].sort((a, b) => a - b)
  
  console.log(`\n📊 Unique Route IDs in FileMaker:`)
  console.log(uniqueRoutes.join(', '))
  
  // Find all unique truck IDs
  const truckIds = jobs
    .filter(j => j.truckId !== null && j.truckId !== undefined)
    .map(j => j.truckId)
  const uniqueTrucks = [...new Set(truckIds)].sort((a, b) => parseInt(a) - parseInt(b))
  
  console.log(`\n📊 Unique Truck IDs in FileMaker:`)
  console.log(uniqueTrucks.length > 0 ? uniqueTrucks.join(', ') : 'NONE FOUND')
  
  // Check for matches
  console.log(`\n🎯 Checking for Vehicle ↔ Route matches:`)
  const matches = []
  uniqueRoutes.forEach(route => {
    const match = vehicleNumbers.find(v => v.number === route.toString())
    if (match) {
      console.log(`  ✅ Route ${route} matches ${match.name}`)
      matches.push({ route, vehicle: match.name })
    } else {
      console.log(`  ❌ Route ${route} - no matching vehicle`)
    }
  })
  
  console.log(`\n📊 Match Rate: ${matches.length}/${uniqueRoutes.length} routes have matching vehicles`)
  
  // Check active (non-completed) jobs
  const activeJobs = jobs.filter(j => 
    j.status !== 'Completed' && 
    j.status !== 'Complete' && 
    j.status !== 'Canceled'
  )
  
  console.log(`\n📊 Active Jobs (not Completed/Canceled): ${activeJobs.length}`)
  
  const activeWithRoutes = activeJobs.filter(j => j.routeId !== null && j.routeId !== undefined)
  console.log(`📊 Active Jobs with Route IDs: ${activeWithRoutes.length}`)
  
  if (activeWithRoutes.length > 0) {
    console.log(`\n📋 Active Jobs with Routes:`)
    const routeCounts = {}
    activeWithRoutes.forEach(j => {
      const route = j.routeId
      routeCounts[route] = (routeCounts[route] || 0) + 1
    })
    Object.entries(routeCounts).forEach(([route, count]) => {
      const hasVehicle = vehicleNumbers.find(v => v.number === route.toString())
      console.log(`  Route ${route}: ${count} jobs ${hasVehicle ? '✅ HAS VEHICLE' : '❌ NO VEHICLE'}`)
    })
  }
  
  console.log(`\n💡 Recommendation:`)
  if (matches.length === 0) {
    console.log(`  ⚠️  Vehicle numbers don't match any route IDs`)
    console.log(`  ⚠️  Need to use truck IDs or driver names for correlation`)
  } else {
    console.log(`  ✅ Some routes match - correlation should work`)
  }
}

debugMapping().catch(console.error)
