// API Response Debugger - Let's see the actual data structure
console.log('🔍 API RESPONSE STRUCTURE DEBUGGER')
console.log('==================================')

async function debugAPIResponse() {
  try {
    const response = await fetch('http://localhost:3002/api/tracking', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    })
    
    if (!response.ok) {
      console.log('❌ Could not connect to local API')
      return
    }
    
    const data = await response.json()
    
    console.log('📊 RAW API RESPONSE STRUCTURE:')
    console.log('Keys in response:', Object.keys(data))
    console.log('Summary:', data.summary)
    console.log('')
    
    console.log('🔍 FIRST 3 VEHICLES DATA STRUCTURE:')
    if (data.data && Array.isArray(data.data)) {
      data.data.slice(0, 3).forEach((vehicle, index) => {
        console.log(`\\nVehicle ${index + 1}:`)
        console.log('  Keys:', Object.keys(vehicle))
        console.log('  vehicleName:', vehicle.vehicleName)
        console.log('  vehicleId:', vehicle.vehicleId)  
        console.log('  assignedJob:', vehicle.assignedJob ? 'EXISTS' : 'NULL')
        
        if (vehicle.assignedJob) {
          console.log('  assignedJob keys:', Object.keys(vehicle.assignedJob))
          console.log('  assignedJob.id:', vehicle.assignedJob.id)
          console.log('  assignedJob.truckId:', vehicle.assignedJob.truckId)
          console.log('  assignedJob.customer:', vehicle.assignedJob.customer)
        }
        
        console.log('  matchInfo:', vehicle.matchInfo ? 'EXISTS' : 'NULL')
        if (vehicle.matchInfo) {
          console.log('  matchInfo keys:', Object.keys(vehicle.matchInfo))
          console.log('  confidence:', vehicle.matchInfo.confidence)
        }
      })
    }
    
    console.log('\\n🎯 SPECIFIC SEARCH FOR TRUCK 81 AND 72:')
    
    // Search for TRUCK 81
    const truck81Variants = [
      data.data?.find(v => v.vehicleName === 'TRUCK 81'),
      data.data?.find(v => v.vehicleName === 'Truck 81'),
      data.data?.find(v => v.vehicleName === 'truck 81'),
      data.data?.find(v => v.vehicleName.includes('81'))
    ]
    
    console.log('TRUCK 81 search results:')
    truck81Variants.forEach((result, i) => {
      if (result) {
        console.log(`  Variant ${i}: ${result.vehicleName} - Job: ${result.assignedJob?.id || 'None'}`)
      }
    })
    
    // Search for TRUCK 72
    const truck72Variants = [
      data.data?.find(v => v.vehicleName === 'TRUCK 72'),
      data.data?.find(v => v.vehicleName === 'Truck 72'), 
      data.data?.find(v => v.vehicleName === 'truck 72'),
      data.data?.find(v => v.vehicleName.includes('72'))
    ]
    
    console.log('\\nTRUCK 72 search results:')
    truck72Variants.forEach((result, i) => {
      if (result) {
        console.log(`  Variant ${i}: ${result.vehicleName} - Job: ${result.assignedJob?.id || 'None'}`)
      }
    })
    
    // Count vehicles with jobs
    let vehiclesWithJobs = 0
    let jobsList = []
    
    if (data.data) {
      data.data.forEach(vehicle => {
        if (vehicle.assignedJob) {
          vehiclesWithJobs++
          jobsList.push({
            vehicle: vehicle.vehicleName,
            job: vehicle.assignedJob.id,
            customer: vehicle.assignedJob.customer
          })
        }
      })
    }
    
    console.log(`\\n📋 VEHICLES WITH JOBS (${vehiclesWithJobs} total):`)
    jobsList.forEach(item => {
      console.log(`   ${item.vehicle} → Job ${item.job} (${item.customer?.substring(0, 30) || 'Unknown'})`)
    })
    
    // Check for Job #896888 and #896891 specifically
    console.log('\\n🎯 SPECIFIC JOB SEARCH:')
    const job896888 = jobsList.find(item => item.job === 896888)
    const job896891 = jobsList.find(item => item.job === 896891)
    
    if (job896888) {
      console.log(`✅ Job #896888 found: ${job896888.vehicle} (${job896888.customer})`)
    } else {
      console.log('❌ Job #896888 not found in assignments')
    }
    
    if (job896891) {
      console.log(`✅ Job #896891 found: ${job896891.vehicle} (${job896891.customer})`)  
    } else {
      console.log('❌ Job #896891 not found in assignments')
    }
    
  } catch (error) {
    console.log(`❌ Debug failed: ${error.message}`)
  }
}

debugAPIResponse().catch(console.error)
