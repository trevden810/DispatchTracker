// Detailed Samsara Data Analysis
// Use: node analyze-samsara-data.js

const SAMSARA_TOKEN = process.env.SAMSARA_API_TOKEN

async function analyzeSamsaraData() {
  console.log('🔍 DETAILED Samsara Data Analysis...')
  
  try {
    const statsUrl = 'https://api.samsara.com/fleet/vehicles/stats'
    const params = new URLSearchParams({
      types: 'gps,engineStates,fuelPercents,obdOdometerMeters'
    })
    
    const response = await fetch(`${statsUrl}?${params}`, {
      headers: {
        'Authorization': `Bearer ${SAMSARA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log(`📊 Retrieved data for ${data.data?.length || 0} vehicles`)
    
    // Analyze data availability across all vehicles
    const analysis = {
      totalVehicles: data.data?.length || 0,
      withGPS: 0,
      withEngineStates: 0,
      withFuel: 0,
      withOdometer: 0,
      engineStatesBreakdown: {},
      speedDistribution: { stopped: 0, driving: 0 }
    }
    
    console.log('\n📋 ANALYZING ALL VEHICLES...')
    
    data.data?.forEach((vehicle, index) => {
      // Count data availability
      if (vehicle.gps) {
        analysis.withGPS++
        const speed = vehicle.gps.speedMilesPerHour || 0
        if (speed > 5) {
          analysis.speedDistribution.driving++
        } else {
          analysis.speedDistribution.stopped++
        }
      }
      
      if (vehicle.engineStates) {
        analysis.withEngineStates++
        const state = vehicle.engineStates.value
        analysis.engineStatesBreakdown[state] = (analysis.engineStatesBreakdown[state] || 0) + 1
      }
      
      if (vehicle.fuelPercents) analysis.withFuel++
      if (vehicle.obdOdometerMeters) analysis.withOdometer++
      
      // Show details for first few vehicles
      if (index < 5) {
        console.log(`\n🚛 ${vehicle.name || `Vehicle ${index + 1}`}:`)
        console.log(`   📍 GPS: ${vehicle.gps ? '✅' : '❌'} ${vehicle.gps ? `(${vehicle.gps.speedMilesPerHour}mph)` : ''}`)
        console.log(`   🔧 Engine: ${vehicle.engineStates ? '✅ ' + vehicle.engineStates.value : '❌ No data'}`)
        console.log(`   ⛽ Fuel: ${vehicle.fuelPercents ? '✅ ' + vehicle.fuelPercents.value + '%' : '❌ No data'}`)
        console.log(`   📏 Odometer: ${vehicle.obdOdometerMeters ? '✅' : '❌'}`)
      }
    })
    
    // Summary analysis
    console.log('\n📊 FLEET-WIDE ANALYSIS:')
    console.log(`   Total Vehicles: ${analysis.totalVehicles}`)
    console.log(`   🗺️  With GPS Data: ${analysis.withGPS}/${analysis.totalVehicles} (${Math.round(analysis.withGPS/analysis.totalVehicles*100)}%)`)
    console.log(`   🔧 With Engine States: ${analysis.withEngineStates}/${analysis.totalVehicles} (${Math.round(analysis.withEngineStates/analysis.totalVehicles*100)}%)`)
    console.log(`   ⛽ With Fuel Data: ${analysis.withFuel}/${analysis.totalVehicles} (${Math.round(analysis.withFuel/analysis.totalVehicles*100)}%)`)
    console.log(`   📏 With Odometer: ${analysis.withOdometer}/${analysis.totalVehicles} (${Math.round(analysis.withOdometer/analysis.totalVehicles*100)}%)`)
    
    console.log('\n🔧 ENGINE STATE BREAKDOWN:')
    Object.entries(analysis.engineStatesBreakdown).forEach(([state, count]) => {
      console.log(`   ${state}: ${count} vehicles`)
    })
    
    console.log('\n🏁 SPEED DISTRIBUTION:')
    console.log(`   Stopped (≤5mph): ${analysis.speedDistribution.stopped} vehicles`)
    console.log(`   Driving (>5mph): ${analysis.speedDistribution.driving} vehicles`)
    
    // Find a vehicle with engine data for testing
    const vehicleWithEngine = data.data?.find(v => v.engineStates)
    if (vehicleWithEngine) {
      console.log(`\n🎯 FOUND VEHICLE WITH ENGINE DATA: ${vehicleWithEngine.name}`)
      console.log(`   Engine: ${vehicleWithEngine.engineStates.value}`)
      console.log(`   Speed: ${vehicleWithEngine.gps?.speedMilesPerHour || 0}mph`)
      
      const engineState = vehicleWithEngine.engineStates.value
      const speed = vehicleWithEngine.gps?.speedMilesPerHour || 0
      
      let expectedStatus = 'offline'
      let expectedColor = '⚫ GRAY'
      
      if (engineState === 'On') {
        if (speed > 5) {
          expectedStatus = 'driving'
          expectedColor = '🟢 LIME (pulsing)'
        } else {
          expectedStatus = 'idle'
          expectedColor = '🟡 AMBER (steady)'
        }
      } else if (engineState === 'Idle') {
        expectedStatus = 'idle'
        expectedColor = '🟡 AMBER (steady)'
      } else if (engineState === 'Off') {
        expectedStatus = 'offline'
        expectedColor = '⚫ GRAY (static)'
      }
      
      console.log(`   🎯 Expected Status: ${expectedStatus}`)
      console.log(`   🚦 Expected Border: ${expectedColor}`)
    } else {
      console.log('\n⚠️  NO VEHICLES WITH ENGINE DATA FOUND')
      console.log('   This could mean:')
      console.log('   - All vehicles are currently offline')
      console.log('   - Gateways are not reporting engine status')
      console.log('   - API token needs "Read Vehicle Statistics" scope')
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error)
  }
}

// Run the analysis
analyzeSamsaraData().then(() => {
  console.log('\n🏁 Analysis complete!')
})
