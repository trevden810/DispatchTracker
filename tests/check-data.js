// Quick diagnostic - check actual Samsara vehicle names and FileMaker truck IDs

async function checkVehicleNames() {
  console.log('\n🔍 Checking actual Samsara vehicle data...\n')
  
  const vehiclesRes = await fetch('http://localhost:3002/api/vehicles')
  const vehicles = await vehiclesRes.json()
  
  if (vehicles.success) {
    console.log(`Found ${vehicles.data.length} vehicles:\n`)
    vehicles.data.slice(0, 10).forEach(v => {
      console.log(`ID: ${v.id}`)
      console.log(`Name: ${v.name}`)
      console.log(`ExternalIds:`, JSON.stringify(v.externalIds, null, 2))
      console.log('---')
    })
  }
}

async function checkJobTruckIds() {
  console.log('\n🔍 Checking FileMaker job data for truck IDs...\n')
  
  const jobsRes = await fetch('http://localhost:3002/api/jobs?limit=10&active=true')
  const jobs = await jobsRes.json()
  
  if (jobs.success) {
    console.log(`Found ${jobs.data.length} jobs:\n`)
    jobs.data.forEach(j => {
      console.log(`Job ${j.id}:`)
      console.log(`  truckId: ${j.truckId}`)
      console.log(`  routeId: ${j.routeId}`)
      console.log(`  driverId: ${j.driverId}`)
      console.log(`  leadId: ${j.leadId}`)
      console.log('---')
    })
  }
  
  // Also test specific job 871707
  console.log('\n🔍 Testing specific job 871707...\n')
  const specificJobRes = await fetch('http://localhost:3002/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ specificJobId: '871707' })
  })
  const specificJob = await specificJobRes.json()
  console.log('Job 871707 data:', JSON.stringify(specificJob, null, 2))
}

async function run() {
  await checkVehicleNames()
  await checkJobTruckIds()
}

run()
