// Live Data Switch Validator
// Tests the switch from demo mode to live FileMaker data

console.log('🔄 LIVE DATA SWITCH VALIDATOR')
console.log('=============================')

async function testLiveDataSwitch() {
  console.log('1️⃣ Testing API with live FileMaker data...')
  
  try {
    const response = await fetch('http://localhost:3002/api/tracking', {
      method: 'GET',
      headers: { 
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (!response.ok) {
      console.log('❌ API connection failed. Make sure dev server is running: npm run dev')
      return
    }
    
    const data = await response.json()
    
    console.log(`📊 API Response: ${response.status}`)
    console.log(`🚛 Total vehicles: ${data.summary?.totalVehicles || 0}`)
    console.log(`📋 Vehicles with jobs: ${data.summary?.vehiclesWithJobs || 0}`)
    console.log(`🎯 Match confidence: High:${data.summary?.intelligentMatching?.highConfidenceMatches || 0}, Medium:${data.summary?.intelligentMatching?.mediumConfidenceMatches || 0}`)
    
    // Check if we're getting live or demo data
    console.log('\\n2️⃣ Verifying data source...')
    
    const debugInfo = data.debug || {}
    console.log(`🔍 API Health:`, debugInfo.apiHealth || 'Unknown')
    console.log(`📡 Samsara endpoint:`, debugInfo.samsaraEndpoint || 'Unknown')
    console.log(`💾 FileMaker fields:`, debugInfo.filemakerFields || 'Unknown')
    console.log(`🎭 Fallback data used:`, debugInfo.fallbackDataUsed || 'Unknown')
    
    // Look for signs we're using live data vs demo
    if (debugInfo.fallbackDataUsed === false) {
      console.log('✅ SUCCESS: Using live FileMaker data!')
    } else if (debugInfo.fallbackDataUsed === true) {
      console.log('⚠️  FALLBACK: Still using demo data (FileMaker may be unavailable)')
    } else {
      console.log('❓ UNCLEAR: Cannot determine data source')
    }
    
    // Check for specific jobs that were in demo data
    console.log('\\n3️⃣ Analyzing job assignments...')
    
    const jobAssignments = []
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach(vehicle => {
        if (vehicle.assignedJob) {
          jobAssignments.push({
            vehicle: vehicle.vehicleName,
            jobId: vehicle.assignedJob.id,
            truckId: vehicle.assignedJob.truckId,
            customer: vehicle.assignedJob.customer,
            confidence: vehicle.matchInfo?.confidence,
            method: vehicle.matchInfo?.matchMethod
          })
        }
      })
    }
    
    console.log(`📋 Found ${jobAssignments.length} job assignments`)
    
    // Look for the specific jobs we corrected in demo mode
    const job896888 = jobAssignments.find(j => j.jobId === 896888)
    const job896891 = jobAssignments.find(j => j.jobId === 896891)
    
    console.log('\\n4️⃣ Key job verification...')
    
    if (job896888) {
      console.log(`✅ Job #896888: ${job896888.vehicle} (Truck ${job896888.truckId}) - ${job896888.customer}`)
      if (job896888.truckId === 72) {
        console.log('   ✅ CORRECT: Job #896888 assigned to Truck 72 (matches real FileMaker)')
      } else {
        console.log(`   ❓ UNEXPECTED: Job #896888 assigned to Truck ${job896888.truckId}`)
      }
    } else {
      console.log('⚠️  Job #896888 not found (may not exist in current live data)')
    }
    
    if (job896891) {
      console.log(`✅ Job #896891: ${job896891.vehicle} (Truck ${job896891.truckId}) - ${job896891.customer}`)
      if (job896891.truckId === 81) {
        console.log('   ✅ CORRECT: Job #896891 assigned to Truck 81')
      } else {
        console.log(`   ❓ UNEXPECTED: Job #896891 assigned to Truck ${job896891.truckId}`)
      }
    } else {
      console.log('ℹ️  Job #896891 not found (was demo-only job)')
    }
    
    // Overall health check
    console.log('\\n5️⃣ Overall system health...')
    
    if (jobAssignments.length > 0) {
      const exactMatches = jobAssignments.filter(j => {
        const vehicleNum = j.vehicle.match(/\\d+/)
        return vehicleNum && Number(vehicleNum[0]) === Number(j.truckId)
      }).length
      
      const accuracyPercent = Math.round((exactMatches / jobAssignments.length) * 100)
      
      console.log(`📊 Correlation accuracy: ${exactMatches}/${jobAssignments.length} (${accuracyPercent}%)`)
      
      if (accuracyPercent >= 70) {
        console.log('🎉 EXCELLENT: High correlation accuracy with live data!')
      } else if (accuracyPercent >= 50) {
        console.log('⚠️  MODERATE: Decent accuracy, may need tuning')
      } else {
        console.log('🚨 LOW: May need to investigate live data quality')
      }
    }
    
    // Show top 10 assignments
    console.log('\\n📋 Top 10 Live Data Assignments:')
    jobAssignments.slice(0, 10).forEach((job, index) => {
      const vehicleNum = job.vehicle.match(/\\d+/)
      const match = vehicleNum && Number(vehicleNum[0]) === Number(job.truckId) ? '✅' : '❓'
      console.log(`   ${index + 1}. ${match} ${job.vehicle} → Job ${job.jobId} (Truck ${job.truckId}) [${job.confidence}]`)
    })
    
    console.log('\\n🎯 LIVE DATA SWITCH RESULTS:')
    
    if (data.summary?.vehiclesWithJobs > 0 && !debugInfo.fallbackDataUsed) {
      console.log('✅ SUCCESS: Live FileMaker integration active!')
      console.log('✅ Vehicles are being matched with real FileMaker jobs')
      console.log('✅ Correlation accuracy system working with live data')
      
      console.log('\\n🚀 READY FOR PRODUCTION USE!')
    } else {
      console.log('⚠️  ISSUES DETECTED:')
      if (debugInfo.fallbackDataUsed) {
        console.log('   - Still using demo data fallback')
        console.log('   - FileMaker API may be timing out')
      }
      if (data.summary?.vehiclesWithJobs === 0) {
        console.log('   - No job assignments found')
        console.log('   - May indicate data connectivity issues')
      }
      
      console.log('\\n🔧 TROUBLESHOOTING:')
      console.log('   1. Check FileMaker server connectivity')
      console.log('   2. Verify API credentials are working')
      console.log('   3. Check for active jobs in FileMaker database')
      console.log('   4. Consider temporary demo mode if needed')
    }
    
  } catch (error) {
    console.log(`❌ Live data test failed: ${error.message}`)
    console.log('\\n🔧 TROUBLESHOOTING:')
    console.log('   1. Start development server: npm run dev')
    console.log('   2. Check network connectivity to FileMaker')
    console.log('   3. Verify API credentials in .env.local')
  }
}

testLiveDataSwitch().catch(console.error)

console.log('\\n📝 NOTES:')
console.log('- Demo mode has been disabled in lib/demo-jobs.ts')
console.log('- System will now attempt to use live FileMaker data')
console.log('- Falls back to demo mode only if FileMaker completely fails')
console.log('- Monitor correlation accuracy with live data')
