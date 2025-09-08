// Quick Samsara API Fix Verification
// Use: node verify-samsara-fix.js

const SAMSARA_TOKEN = process.env.SAMSARA_API_TOKEN

async function testCorrectedAPI() {
  console.log('🔧 Testing CORRECTED Samsara API call...')
  
  try {
    const statsUrl = 'https://api.samsara.com/fleet/vehicles/stats'
    const params = new URLSearchParams({
      types: 'gps,engineStates,fuelPercents,obdOdometerMeters'  // REMOVED "speeds"
    })
    
    console.log(`🔗 Making request to: ${statsUrl}?${params}`)
    
    const response = await fetch(`${statsUrl}?${params}`, {
      headers: {
        'Authorization': `Bearer ${SAMSARA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📡 Response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error: ${response.status}`)
      console.error(`❌ Error details:`, errorText)
      return
    }
    
    const data = await response.json()
    console.log(`✅ SUCCESS! Retrieved data for ${data.data?.length || 0} vehicles`)
    
    if (data.data && data.data.length > 0) {
      const firstVehicle = data.data[0]
      console.log(`\n🚛 ${firstVehicle.name} Real-time Data:`)
      
      // Engine state
      if (firstVehicle.engineStates) {
        console.log(`🔧 Engine: ${firstVehicle.engineStates.value} (${firstVehicle.engineStates.time})`)
      }
      
      // GPS with speed
      if (firstVehicle.gps) {
        console.log(`🗺️  Location: ${firstVehicle.gps.latitude}, ${firstVehicle.gps.longitude}`)
        console.log(`🏁 Speed: ${firstVehicle.gps.speedMilesPerHour} mph`)
        console.log(`📍 Address: ${firstVehicle.gps.reverseGeo?.formattedLocation || 'Not available'}`)
      }
      
      // Fuel
      if (firstVehicle.fuelPercents) {
        console.log(`⛽ Fuel: ${firstVehicle.fuelPercents.value}%`)
      }
      
      // Determine status
      const engineState = firstVehicle.engineStates?.value || 'Unknown'
      const speed = firstVehicle.gps?.speedMilesPerHour || 0
      
      let status = 'offline'
      if (engineState === 'On') {
        status = speed > 5 ? 'driving' : 'idle'
      } else if (engineState === 'Idle') {
        status = 'idle'
      }
      
      console.log(`\n🎯 COMPUTED STATUS: ${status}`)
      console.log(`🚦 Border Color: ${
        status === 'driving' ? '🟢 LIME (pulsing)' :
        status === 'idle' ? '🟡 AMBER (steady)' :
        '⚫ GRAY (offline)'
      }`)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the verification
testCorrectedAPI().then(() => {
  console.log('\n🏁 Verification complete!')
})
