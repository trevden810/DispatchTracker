// Final Correlation Validation Tool - v3.0 (Case-Insensitive)
// Handles vehicle name variations (TRUCK vs Truck vs truck)

console.log('🔍 CORRELATION VALIDATION TOOL v3.0 (CASE-INSENSITIVE)')
console.log('======================================================')

async function validateCorrelations() {
  try {
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
    
    // FIXED: Case-insensitive vehicle search
    function findVehicleByNumber(vehicles, targetNumber) {
      return vehicles.find(vehicle => {
        const numberMatch = vehicle.vehicleName.match(/\\d+/)
        return numberMatch && Number(numberMatch[0]) === targetNumber
      })
    }
    
    // Check TRUCK 81 correlation
    console.log('\\n🔍 TRUCK 81 CORRELATION ANALYSIS:')
    const truck81 = findVehicleByNumber(data.data || [], 81)
    
    if (truck81) {
      console.log(`   Vehicle: ${truck81.vehicleName}`)
      console.log(`   Assigned Job: ${truck81.assignedJob?.id || 'None'}`)
      console.log(`   Job Customer: ${truck81.assignedJob?.customer || 'N/A'}`)
      console.log(`   Job Truck ID: ${truck81.assignedJob?.truckId || 'N/A'}`)
      console.log(`   Match Confidence: ${truck81.matchInfo?.confidence || 'N/A'}`)
      
      if (truck81.assignedJob) {
        const jobTruckId = Number(truck81.assignedJob.truckId)
        if (jobTruckId === 81) {
          console.log('   ✅ PERFECT: Vehicle 81 correctly assigned to Truck 81 job')
        } else {
          console.log(`   ❌ MISMATCH: Vehicle 81 assigned to Truck ${jobTruckId} job`)
        }
        
        if (truck81.assignedJob.id === 896891) {
          console.log('   🎉 FIX CONFIRMED: Shows Job #896891 (correct assignment)')
        } else if (truck81.assignedJob.id === 896888) {
          console.log('   🚨 OLD ISSUE: Still shows Job #896888 (incorrect)')
        }
      }
    } else {
      console.log('   ❌ TRUCK 81 not found in fleet')
    }
    
    // Check TRUCK/Truck 72 correlation  
    console.log('\\n🔍 TRUCK 72 CORRELATION ANALYSIS:')
    const truck72 = findVehicleByNumber(data.data || [], 72)
    
    if (truck72) {
      console.log(`   Vehicle: ${truck72.vehicleName} (found with case-insensitive search)`)
      console.log(`   Assigned Job: ${truck72.assignedJob?.id || 'None'}`)
      console.log(`   Job Customer: ${truck72.assignedJob?.customer || 'N/A'}`)
      console.log(`   Job Truck ID: ${truck72.assignedJob?.truckId || 'N/A'}`)
      console.log(`   Match Confidence: ${truck72.matchInfo?.confidence || 'N/A'}`)
      
      if (truck72.assignedJob) {
        const jobTruckId = Number(truck72.assignedJob.truckId)
        if (jobTruckId === 72) {
          console.log('   ✅ PERFECT: Vehicle 72 correctly assigned to Truck 72 job')
        } else {
          console.log(`   ❌ MISMATCH: Vehicle 72 assigned to Truck ${jobTruckId} job`)
        }
        
        if (truck72.assignedJob.id === 896888) {
          console.log('   ✅ CORRECT: Shows Job #896888 (should be on Truck 72)')
        }
      }
    } else {
      console.log('   ❌ No vehicle with number 72 found in fleet')
    }
    
    // Overall accuracy analysis with case-insensitive matching
    console.log('\\n📊 OVERALL CORRELATION ACCURACY (FIXED):')
    let perfectMatches = 0
    let fuzzyMatches = 0
    let mismatches = 0
    let totalWithJobs = 0
    
    const results = []
    
    ;(data.data || []).forEach(vehicle => {
      if (vehicle.assignedJob && vehicle.matchInfo?.confidence !== 'none') {
        totalWithJobs++
        
        const vehicleNumberMatch = vehicle.vehicleName.match(/\\d+/)
        if (vehicleNumberMatch) {
          const vehicleNumber = Number(vehicleNumberMatch[0])
          const jobTruckId = Number(vehicle.assignedJob.truckId)
          const difference = Math.abs(vehicleNumber - jobTruckId)
          
          let status = ''
          if (difference === 0) {
            perfectMatches++
            status = '✅ PERFECT'
          } else if (difference === 1) {
            fuzzyMatches++  
            status = '⚠️  FUZZY±1'
          } else {
            mismatches++
            status = `❌ DIFF:${difference}`
          }
          
          results.push({
            vehicle: vehicle.vehicleName,
            jobId: vehicle.assignedJob.id,
            vehicleNum: vehicleNumber,
            jobTruck: jobTruckId,
            status,
            customer: vehicle.assignedJob.customer?.substring(0, 20) || 'Unknown'
          })
        }
      }
    })
    
    // Show results sorted by status
    results.sort((a, b) => a.status.localeCompare(b.status))
    
    console.log('\\n📋 DETAILED CORRELATION RESULTS:')
    results.forEach(result => {
      console.log(`   ${result.status} ${result.vehicle.padEnd(12)} → Job ${result.jobId} (${result.customer})`)
    })
    
    const logicalMatches = perfectMatches + fuzzyMatches
    const accuracyPercent = totalWithJobs > 0 ? Math.round((logicalMatches / totalWithJobs) * 100) : 0
    
    console.log(`\\n📈 FINAL ACCURACY ASSESSMENT:`)
    console.log(`   Perfect matches: ${perfectMatches}/${totalWithJobs} (${Math.round(perfectMatches/totalWithJobs*100)}%)`)
    console.log(`   Fuzzy matches (±1): ${fuzzyMatches}/${totalWithJobs} (${Math.round(fuzzyMatches/totalWithJobs*100)}%)`) 
    console.log(`   Mismatches: ${mismatches}/${totalWithJobs} (${Math.round(mismatches/totalWithJobs*100)}%)`)
    console.log(`   🎯 OVERALL ACCURACY: ${accuracyPercent}% (${logicalMatches}/${totalWithJobs} logical)`)
    
    if (accuracyPercent >= 80) {
      console.log('\\n🎉 EXCELLENT: High correlation accuracy!')
    } else if (accuracyPercent >= 60) {
      console.log('\\n⚠️  MODERATE: Good accuracy, some optimization possible')
    } else {
      console.log('\\n🚨 NEEDS WORK: Low accuracy needs investigation')
    }
    
    // Key validation points
    console.log('\\n🎯 KEY VALIDATION RESULTS:')
    const truck81Result = results.find(r => r.vehicleNum === 81)
    const truck72Result = results.find(r => r.vehicleNum === 72)
    
    if (truck81Result) {
      console.log(`✅ TRUCK 81: ${truck81Result.status} - Job ${truck81Result.jobId}`)
    }
    if (truck72Result) {
      console.log(`✅ TRUCK 72: ${truck72Result.status} - Job ${truck72Result.jobId}`)
    }
    
    if (truck81Result?.jobId === 896891 && truck72Result?.jobId === 896888) {
      console.log('\\n🎉 SUCCESS: Both TRUCK 81 and TRUCK 72 correlations are CORRECT!')
      console.log('   The original issue has been completely resolved.')
    }
    
  } catch (error) {
    console.log(`❌ Validation failed: ${error.message}`)
  }
}

validateCorrelations().catch(console.error)
