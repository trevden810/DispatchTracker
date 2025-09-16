// Correlation Validation Tool
// Tests the accuracy of vehicle-job matching and identifies mismatches

console.log('🔍 CORRELATION VALIDATION TOOL')
console.log('===============================')

async function validateCorrelations() {
  try {
    // Test the local API to see current correlations
    const response = await fetch('http://localhost:3002/api/tracking', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    })
    
    if (!response.ok) {
      console.log('❌ Could not connect to local API. Start server with: npm run dev')
      return
    }
    
    const data = await response.json()
    
    console.log(`📊 API Response Status: ${response.status}`)
    console.log(`🚛 Total vehicles tracked: ${data.summary?.totalVehicles || 0}`)
    console.log(`📋 Vehicles with jobs: ${data.summary?.vehiclesWithJobs || 0}`)
    
    // Check specific TRUCK 81 correlation
    console.log('\\n🔍 TRUCK 81 CORRELATION ANALYSIS:')
    const truck81Data = data.data?.find(vehicle => vehicle.vehicleName === 'TRUCK 81')
    
    if (truck81Data) {
      console.log(`   Vehicle: ${truck81Data.vehicleName}`)
      console.log(`   Assigned Job: ${truck81Data.assignedJob?.id || 'None'}`)
      console.log(`   Job Customer: ${truck81Data.assignedJob?.customer || 'N/A'}`)
      console.log(`   Job Truck ID: ${truck81Data.assignedJob?.truckId || 'N/A'}`)
      console.log(`   Match Confidence: ${truck81Data.matchInfo?.confidence || 'N/A'}`)
      console.log(`   Match Method: ${truck81Data.matchInfo?.matchMethod || 'N/A'}`)
      console.log(`   Match Details: ${truck81Data.matchInfo?.matchDetails || 'N/A'}`)
      
      // Validate the correlation
      if (truck81Data.assignedJob) {
        const expectedTruckId = 81
        const actualTruckId = Number(truck81Data.assignedJob.truckId)
        
        if (actualTruckId === expectedTruckId) {
          console.log('   ✅ CORRELATION CORRECT: Truck ID matches vehicle number')
        } else {
          console.log('   ❌ CORRELATION ERROR: Truck ID does not match vehicle number')
          console.log(`      Expected: ${expectedTruckId}, Got: ${actualTruckId}`)
        }
        
        // Check if this is Job #896888 specifically
        if (truck81Data.assignedJob.id === 896888) {
          console.log('   🚨 SPECIFIC ISSUE: TRUCK 81 assigned to Job #896888')
          console.log('      This job should be on TRUCK 72 according to FileMaker')
        }
      }
    } else {
      console.log('   ❌ TRUCK 81 not found in API response')
    }
    
    // Check for Job #896888 specifically
    console.log('\\n🔍 JOB #896888 ANALYSIS:')
    const job896888Assignment = data.data?.find(vehicle => 
      vehicle.assignedJob?.id === 896888
    )
    
    if (job896888Assignment) {
      console.log(`   Job #896888 assigned to: ${job896888Assignment.vehicleName}`)
      console.log(`   Expected assignment: TRUCK 72`)
      console.log(`   Actual truck ID in job: ${job896888Assignment.assignedJob.truckId}`)
      
      if (job896888Assignment.vehicleName === 'TRUCK 72') {
        console.log('   ✅ CORRECT: Job #896888 assigned to TRUCK 72')
      } else {
        console.log('   ❌ INCORRECT: Job #896888 assigned to wrong vehicle')
      }
    } else {
      console.log('   ⚠️  Job #896888 not found in any vehicle assignments')
    }
    
    // Overall correlation accuracy check
    console.log('\\n📊 OVERALL CORRELATION ACCURACY:')
    let correctCorrelations = 0
    let totalCorrelations = 0
    
    data.data?.forEach(vehicle => {
      if (vehicle.assignedJob && vehicle.matchInfo?.confidence !== 'none') {
        totalCorrelations++
        
        // Extract number from vehicle name
        const vehicleNumber = vehicle.vehicleName.match(/\\d+/)
        if (vehicleNumber) {
          const expectedTruckId = Number(vehicleNumber[0])
          const actualTruckId = Number(vehicle.assignedJob.truckId)
          
          if (expectedTruckId === actualTruckId) {
            correctCorrelations++
            console.log(`   ✅ ${vehicle.vehicleName} → Job ${vehicle.assignedJob.id} (Truck ${actualTruckId}) - CORRECT`)
          } else {
            console.log(`   ❌ ${vehicle.vehicleName} → Job ${vehicle.assignedJob.id} (Truck ${actualTruckId}) - WRONG (expected ${expectedTruckId})`)
          }
        }
      }
    })
    
    const accuracyPercent = totalCorrelations > 0 ? Math.round((correctCorrelations / totalCorrelations) * 100) : 0
    
    console.log(`\\n📈 CORRELATION ACCURACY: ${correctCorrelations}/${totalCorrelations} (${accuracyPercent}%)`)
    
    if (accuracyPercent < 80) {
      console.log('🚨 LOW ACCURACY DETECTED!')
      console.log('Recommended actions:')
      console.log('1. Check if using demo mode vs real FileMaker data')
      console.log('2. Verify truck IDs in job data match actual assignments')
      console.log('3. Tighten fuzzy matching tolerance')
      console.log('4. Add manual override capabilities')
    } else {
      console.log('✅ Correlation accuracy within acceptable range')
    }
    
  } catch (error) {
    console.log(`❌ Validation failed: ${error.message}`)
    console.log('Make sure the development server is running: npm run dev')
  }
}

// Run the validation
validateCorrelations().catch(console.error)

// Also provide manual testing capability
console.log('\\n🛠️  MANUAL TESTING:')
console.log('To test specific correlations:')
console.log('1. Start dev server: npm run dev')
console.log('2. Check dashboard: http://localhost:3002')
console.log('3. Run this script: node correlation-validator.js')
console.log('4. Check API directly: curl http://localhost:3002/api/tracking')
