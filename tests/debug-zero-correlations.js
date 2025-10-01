// Debug script to check why correlations are 0
// Run: node tests/debug-zero-correlations.js

async function debugCorrelations() {
  const baseUrl = 'https://www.pepmovetracker.info'
  
  console.log('🔍 Fetching vehicles...')
  const vehiclesRes = await fetch(`${baseUrl}/api/vehicles`)
  const vehiclesData = await vehiclesRes.json()
  const vehicles = vehiclesData.data
  
  console.log(`\n📊 Vehicles (first 10):`)
  vehicles.slice(0, 10).forEach(v => {
    const num = v.name?.match(/\d+/)?.[0]
    console.log(`  ${v.name} → extracted number: "${num}"`)
  })
  
  console.log('\n🔍 Fetching jobs...')
  const jobsRes = await fetch(`${baseUrl}/api/jobs?today=true&limit=100`)
  const jobsData = await jobsRes.json()
  const jobs = jobsData.data
  
  console.log(`\n📊 Total jobs: ${jobs.length}`)
  
  const activeJobs = jobs.filter(j => 
    j.status !== 'Complete' && 
    j.status !== 'Canceled' &&
    (j.routeId || j.driverId || j.truckId)
  )
  
  console.log(`📊 Active jobs with assignments: ${activeJobs.length}`)
  
  if (activeJobs.length > 0) {
    console.log(`\n📋 Active Jobs with Route/Truck/Driver:`)
    activeJobs.forEach(j => {
      console.log(`  Job ${j.id}: status="${j.status}", routeId=${j.routeId}, truckId=${j.truckId}, driverId=${j.driverId}`)
    })
  } else {
    console.log(`\n⚠️  No active jobs found with route/truck/driver assignments`)
    console.log(`\n📋 All jobs (first 10):`)
    jobs.slice(0, 10).forEach(j => {
      console.log(`  Job ${j.id}: status="${j.status}", routeId=${j.routeId}, truckId=${j.truckId}`)
    })
  }
  
  // Try manual correlation
  console.log(`\n🎯 Testing Manual Correlation:`)
  let matchCount = 0
  
  for (const vehicle of vehicles.slice(0, 5)) {
    const vehicleNumber = vehicle.name?.match(/\d+/)?.[0]
    const match = activeJobs.find(j => j.routeId?.toString() === vehicleNumber)
    if (match) {
      console.log(`  ✅ ${vehicle.name} (${vehicleNumber}) matches Job ${match.id} (route ${match.routeId})`)
      matchCount++
    }
  }
  
  console.log(`\n📊 Manual correlation result: ${matchCount} matches`)
  
  if (matchCount === 0) {
    console.log(`\n💡 Likely Issues:`)
    console.log(`  1. No jobs today have route assignments`)
    console.log(`  2. Vehicle numbers don't match route IDs`)
    console.log(`  3. All jobs are Complete/Canceled status`)
  }
}

debugCorrelations().catch(console.error)
