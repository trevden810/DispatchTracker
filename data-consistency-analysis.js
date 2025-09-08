// Data Consistency Fix for DispatchTracker
// Addresses TRUCK 84 inconsistency: "Off" status but 57mph speed

console.log('🔧 Analyzing TRUCK 84 data inconsistency...')

// PROBLEM IDENTIFIED:
// - Front card shows "Off" engine status 
// - Back card shows "Status: Off" but "Speed: 57.779 mph"
// - Vehicle can't be moving 57mph with engine off!

// ROOT CAUSES:
// 1. Real GPS speed (57mph) vs Missing engine data ("off" default)
// 2. Status logic prioritizing engine state over GPS movement
// 3. Mock data mixed with real data causing confusion

// SOLUTION: Enhanced data validation and labeling

function analyzeDataConsistency(vehicle) {
  const speed = vehicle.diagnostics?.speed || 0
  const engineStatus = vehicle.diagnostics?.engineStatus || 'unknown'
  const hasEngineData = engineStatus !== 'unknown'
  
  console.log(`Vehicle: ${vehicle.name}`)
  console.log(`Engine Status: ${engineStatus} (${hasEngineData ? 'Real' : 'No data'})`)
  console.log(`Speed: ${speed}mph (Real GPS)`)
  
  // INCONSISTENCY CHECK
  if (!hasEngineData && speed > 5) {
    console.log(`⚠️ INCONSISTENCY: No engine data but vehicle moving at ${speed}mph`)
    console.log(`✅ SOLUTION: Use GPS-based status with clear labeling`)
    return {
      status: 'moving-gps',
      label: `Moving (GPS) ${speed}mph`,
      explanation: 'Engine data unavailable, using GPS speed',
      dataSource: 'GPS only'
    }
  }
  
  if (hasEngineData && engineStatus === 'off' && speed > 5) {
    console.log(`🚨 MAJOR INCONSISTENCY: Engine off but ${speed}mph!`)
    console.log(`✅ SOLUTION: GPS speed takes priority - engine data may be stale`)
    return {
      status: 'data-conflict',
      label: `Moving ${speed}mph (Engine: ${engineStatus})`,
      explanation: 'GPS and engine data conflict - using GPS',
      dataSource: 'GPS priority'
    }
  }
  
  return {
    status: 'consistent',
    label: `Engine: ${engineStatus}, Speed: ${speed}mph`,
    explanation: 'Data sources align',
    dataSource: hasEngineData ? 'Engine + GPS' : 'GPS only'
  }
}

// Test with TRUCK 84 data
const truck84 = {
  name: 'TRUCK 84',
  diagnostics: {
    engineStatus: 'off',    // No real engine data available
    speed: 57.779,         // Real GPS speed
    fuelLevel: 0           // No real fuel data
  }
}

const analysis = analyzeDataConsistency(truck84)
console.log('\n📊 ANALYSIS RESULT:', analysis)

console.log('\n🎯 RECOMMENDATIONS:')
console.log('1. Label data sources clearly: "Moving (GPS)" vs "Engine On"')
console.log('2. GPS speed takes priority when engine data unavailable')
console.log('3. Show data freshness/timestamp for transparency')
console.log('4. Remove mock data that conflicts with real data')
