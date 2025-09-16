// Fleet Inventory Tool - Check what vehicles exist
// Run this to see your actual Samsara vehicle names

console.log('🚛 FLEET INVENTORY ANALYSIS')
console.log('===========================')

async function analyzeFleet() {
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
    
    console.log(`📊 Total vehicles: ${data.summary?.totalVehicles || 0}`)
    console.log(`📋 Vehicles with jobs: ${data.summary?.vehiclesWithJobs || 0}`)
    
    // Extract all vehicle names and numbers
    const vehicles = data.data?.map(vehicle => {
      const numberMatch = vehicle.vehicleName.match(/\d+/)
      return {
        name: vehicle.vehicleName,
        number: numberMatch ? Number(numberMatch[0]) : null,
        hasJob: vehicle.assignedJob ? true : false,
        jobId: vehicle.assignedJob?.id || null
      }
    }) || []
    
    // Sort by vehicle number for easier analysis
    vehicles.sort((a, b) => (a.number || 999) - (b.number || 999))
    
    console.log('\n🚛 COMPLETE VEHICLE ROSTER:')
    vehicles.forEach((vehicle, index) => {
      const status = vehicle.hasJob ? `📋 Job ${vehicle.jobId}` : '⭕ No job'
      console.log(`   ${String(index + 1).padStart(2, '0')}. ${vehicle.name.padEnd(15)} (${vehicle.number || 'N/A'}) - ${status}`)
    })
    
    // Check for specific trucks mentioned in the issue
    console.log('\n🔍 SPECIFIC VEHICLE CHECK:')
    const truck81 = vehicles.find(v => v.name === 'TRUCK 81')
    const truck72 = vehicles.find(v => v.name === 'TRUCK 72')
    
    console.log(`   TRUCK 81: ${truck81 ? '✅ EXISTS' : '❌ NOT FOUND'} ${truck81?.hasJob ? `- Job ${truck81.jobId}` : ''}`)
    console.log(`   TRUCK 72: ${truck72 ? '✅ EXISTS' : '❌ NOT FOUND'} ${truck72?.hasJob ? `- Job ${truck72.jobId}` : ''}`)
    
    // Analyze number ranges
    const numbers = vehicles.map(v => v.number).filter(n => n !== null).sort((a, b) => a - b)
    const minNum = Math.min(...numbers)
    const maxNum = Math.max(...numbers)
    
    console.log('\n📊 FLEET ANALYSIS:')
    console.log(`   Vehicle numbers range: ${minNum} - ${maxNum}`)
    console.log(`   Total numbered vehicles: ${numbers.length}`)
    console.log(`   Vehicles with jobs: ${vehicles.filter(v => v.hasJob).length}`)
    
    // Look for gaps in numbering that might explain missing assignments
    console.log('\n🔍 NUMBERING GAPS ANALYSIS:')
    const gaps = []
    for (let i = minNum; i <= maxNum; i++) {
      if (!numbers.includes(i)) {
        gaps.push(i)
      }
    }
    
    if (gaps.length > 0) {
      console.log(`   Missing vehicle numbers: ${gaps.slice(0, 20).join(', ')}${gaps.length > 20 ? '...' : ''}`)
      console.log(`   Total gaps: ${gaps.length}`)
      
      // Check if 72 is in the gaps
      if (gaps.includes(72)) {
        console.log('   🎯 KEY FINDING: Vehicle number 72 is MISSING from fleet!')
        console.log('      This explains why Job #896888 (Truck 72) shows as unassigned')
      }
    } else {
      console.log('   No gaps in vehicle numbering')
    }
    
    // Summary
    console.log('\n📋 SUMMARY:')
    console.log(`✅ TRUCK 81 correlation: ${truck81 ? 'Vehicle exists' : 'Vehicle missing'}`)
    console.log(`${truck72 ? '✅' : '❌'} TRUCK 72 availability: ${truck72 ? 'Vehicle exists' : 'Vehicle missing from fleet'}`)
    
    if (!truck72) {
      console.log('\n💡 EXPLANATION:')
      console.log('   Job #896888 belongs to Truck 72, but TRUCK 72 does not exist in your Samsara fleet.')
      console.log('   This is why the job appears unassigned - which is actually CORRECT behavior!')
      console.log('   The system cannot assign jobs to vehicles that do not exist.')
    }
    
  } catch (error) {
    console.log(`❌ Fleet analysis failed: ${error.message}`)
  }
}

analyzeFleet().catch(console.error)
