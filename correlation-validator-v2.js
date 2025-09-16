// Fixed Correlation Validation Tool - v2.0
// Tests the accuracy of vehicle-job matching with improved logic

console.log('🔍 CORRELATION VALIDATION TOOL v2.0 (FIXED)')
console.log('=============================================')

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
    
    // List all vehicle names for debugging
    console.log('\n🚛 VEHICLE FLEET OVERVIEW:')
    const allVehicleNames = data.data?.map(v => v.vehicleName).slice(0, 10) || []
    console.log(`   Sample vehicles: ${allVehicleNames.join(', ')}...`)
    
    // Check if TRUCK 72 exists
    const truck72Exists = data.data?.some(v => v.vehicleName === 'TRUCK 72')
    console.log(`   TRUCK 72 exists in fleet: ${truck72Exists ? '✅ YES' : '❌ NO'}`)
    
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
        
        // Check if this is the old wrong assignment
        if (truck81Data.assignedJob.id === 896888) {
          console.log('   🚨 OLD ISSUE: TRUCK 81 still showing Job #896888 (should be fixed)')
        } else if (truck81Data.assignedJob.id === 896891) {
          console.log('   ✅ FIX CONFIRMED: TRUCK 81 now correctly shows Job #896891')
        }
      } else {
        console.log('   ⚠️  No job assigned to TRUCK 81')
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
      console.log(`   Job truck ID in data: ${job896888Assignment.assignedJob.truckId}`)
      console.log(`   Match confidence: ${job896888Assignment.matchInfo?.confidence || 'N/A'}`)
      
      // Check if assignment makes sense
      const vehicleNumber = job896888Assignment.vehicleName.match(/\\d+/)
      const jobTruckId = Number(job896888Assignment.assignedJob.truckId)
      
      if (vehicleNumber && Number(vehicleNumber[0]) === jobTruckId) {
        console.log('   ✅ LOGICAL: Vehicle number matches job truck ID')
      } else {
        console.log('   ❓ QUESTIONABLE: Vehicle number does not match job truck ID')
        console.log(`      Vehicle: ${vehicleNumber ? vehicleNumber[0] : 'unknown'}, Job Truck: ${jobTruckId}`)
      }
    } else {
      console.log('   ✅ EXPECTED: Job #896888 is unassigned')
      console.log('   This is correct if no vehicle "TRUCK 72" exists in the fleet')
      console.log(`   TRUCK 72 exists: ${truck72Exists ? 'Yes - should be assigned' : 'No - correctly unassigned'}`)
    }
    
    // Improved overall correlation accuracy check
    console.log('\\n📊 OVERALL CORRELATION ACCURACY ANALYSIS:')
    let exactMatches = 0
    let logicalMatches = 0
    let questionableMatches = 0
    let totalWithJobs = 0
    
    const analysisDetails = []
    
    data.data?.forEach(vehicle => {
      if (vehicle.assignedJob && vehicle.matchInfo?.confidence !== 'none') {
        totalWithJobs++
        
        // Extract number from vehicle name
        const vehicleNumberMatch = vehicle.vehicleName.match(/\\d+/)
        if (vehicleNumberMatch) {
          const vehicleNumber = Number(vehicleNumberMatch[0])
          const jobTruckId = Number(vehicle.assignedJob.truckId)
          const matchType = vehicle.matchInfo?.matchMethod || 'unknown'
          
          let status = ''
          if (vehicleNumber === jobTruckId) {
            exactMatches++
            status = '✅ EXACT'
          } else if (Math.abs(vehicleNumber - jobTruckId) === 1 && matchType === 'fuzzy_number') {
            logicalMatches++
            status = '⚠️  FUZZY'
          } else {
            questionableMatches++
            status = '❓ QUESTIONABLE'
          }
          
          analysisDetails.push({
            vehicle: vehicle.vehicleName,
            job: vehicle.assignedJob.id,
            vehicleNum: vehicleNumber,
            jobTruck: jobTruckId,
            status: status,
            method: matchType
          })
        }
      }
    })
    
    // Show detailed analysis
    console.log('\\n📋 DETAILED CORRELATION ANALYSIS:')
    analysisDetails.slice(0, 10).forEach(detail => {
      console.log(`   ${detail.status} ${detail.vehicle} → Job ${detail.job} (Truck ${detail.jobTruck}) [${detail.method}]`)
    })
    
    if (analysisDetails.length > 10) {
      console.log(`   ... and ${analysisDetails.length - 10} more`)
    }
    
    const totalLogical = exactMatches + logicalMatches
    const accuracyPercent = totalWithJobs > 0 ? Math.round((totalLogical / totalWithJobs) * 100) : 0
    
    console.log(`\\n📈 CORRELATION SUMMARY:`)
    console.log(`   Exact matches: ${exactMatches}/${totalWithJobs}`)
    console.log(`   Logical fuzzy matches: ${logicalMatches}/${totalWithJobs}`)
    console.log(`   Questionable matches: ${questionableMatches}/${totalWithJobs}`)
    console.log(`   Overall accuracy: ${accuracyPercent}% (${totalLogical}/${totalWithJobs} logical)`)
    
    if (accuracyPercent >= 80) {
      console.log('✅ ACCURACY: Good correlation accuracy!')
    } else if (accuracyPercent >= 60) {
      console.log('⚠️  ACCURACY: Moderate accuracy - some fine-tuning needed')
    } else {
      console.log('🚨 ACCURACY: Low accuracy detected!')
    }
    
    console.log('\\n🎯 KEY FINDINGS:')
    if (exactMatches > 0) {
      console.log(`✅ ${exactMatches} vehicles have perfect number-to-truck ID matches`)
    }
    if (logicalMatches > 0) {
      console.log(`⚠️  ${logicalMatches} vehicles have fuzzy matches (±1 difference) - verify these`)
    }
    if (questionableMatches > 0) {
      console.log(`❓ ${questionableMatches} vehicles have questionable assignments - investigate`)
    }
    
  } catch (error) {
    console.log(`❌ Validation failed: ${error.message}`)
    console.log('Make sure the development server is running: npm run dev')
  }
}

// Run the validation
validateCorrelations().catch(console.error)

console.log('\\n🛠️  USAGE NOTES:')
console.log('This improved validator distinguishes between:')
console.log('- ✅ Exact matches (vehicle 81 → truck 81)')
console.log('- ⚠️  Logical fuzzy matches (vehicle 80 → truck 81, ±1 diff)')
console.log('- ❓ Questionable matches (needs investigation)')
console.log('- Unassigned jobs (correct if no matching vehicle exists)')
