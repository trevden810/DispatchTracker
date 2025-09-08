// Samsara Data Freshness Investigation
// Addresses TRUCK 81 showing "on" when stopped since 11:18am

const SAMSARA_TOKEN = process.env.SAMSARA_API_TOKEN

async function investigateDataFreshness() {
  console.log('🕐 Investigating Samsara data freshness...')
  console.log(`Current time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })} MT`)
  
  try {
    const statsUrl = 'https://api.samsara.com/fleet/vehicles/stats'
    const params = new URLSearchParams({
      types: 'gps,engineStates,fuelPercents,obdOdometerMeters'
    })
    
    console.log('\n📡 Making fresh API request...')
    const response = await fetch(`${statsUrl}?${params}`, {
      headers: {
        'Authorization': `Bearer ${SAMSARA_TOKEN}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',  // Force fresh data
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
    const data = await response.json()
    console.log(`✅ Retrieved data for ${data.data?.length || 0} vehicles`)
    
    // Find TRUCK 81 specifically
    const truck81 = data.data?.find(v => 
      v.name?.includes('81') || v.name?.includes('TRUCK 81')
    )
    
    if (truck81) {
      console.log('\n🚛 TRUCK 81 RAW DATA ANALYSIS:')
      console.log('Vehicle Name:', truck81.name)
      
      // Engine States Analysis
      if (truck81.engineStates) {
        const engineTime = new Date(truck81.engineStates.time)
        const engineAge = (new Date() - engineTime) / (1000 * 60) // minutes ago
        console.log('🔧 ENGINE STATE:')
        console.log(`  Value: ${truck81.engineStates.value}`)
        console.log(`  Timestamp: ${engineTime.toLocaleString('en-US', { timeZone: 'America/Denver' })} MT`)
        console.log(`  Age: ${Math.round(engineAge)} minutes ago`)
        
        if (engineAge > 60) {
          console.log(`  ⚠️ ENGINE DATA IS STALE (${Math.round(engineAge)} minutes old)`)
        }
      } else {
        console.log('🔧 ENGINE STATE: No data available')
      }
      
      // GPS Analysis  
      if (truck81.gps) {
        const gpsTime = new Date(truck81.gps.time)
        const gpsAge = (new Date() - gpsTime) / (1000 * 60) // minutes ago
        console.log('📍 GPS DATA:')
        console.log(`  Speed: ${truck81.gps.speedMilesPerHour} mph`)
        console.log(`  Timestamp: ${gpsTime.toLocaleString('en-US', { timeZone: 'America/Denver' })} MT`)
        console.log(`  Age: ${Math.round(gpsAge)} minutes ago`)
        console.log(`  Location: ${truck81.gps.latitude}, ${truck81.gps.longitude}`)
        
        if (gpsAge > 30) {
          console.log(`  ⚠️ GPS DATA IS STALE (${Math.round(gpsAge)} minutes old)`)
        }
      } else {
        console.log('📍 GPS DATA: No data available')
      }
      
      // Data Consistency Check
      console.log('\n🔍 DATA CONSISTENCY CHECK:')
      const hasEngineData = !!truck81.engineStates
      const hasGpsData = !!truck81.gps
      const engineValue = truck81.engineStates?.value || 'Unknown'
      const currentSpeed = truck81.gps?.speedMilesPerHour || 0
      
      console.log(`Engine Status: ${engineValue}`)
      console.log(`Current Speed: ${currentSpeed} mph`)
      
      if (engineValue === 'On' && currentSpeed === 0) {
        console.log('🚨 INCONSISTENCY: Engine "On" but speed is 0 mph')
        console.log('   Likely cause: Stale engine data')
      }
      
      if (engineValue === 'On' && hasEngineData) {
        const engineAge = (new Date() - new Date(truck81.engineStates.time)) / (1000 * 60)
        if (engineAge > 120) { // More than 2 hours old
          console.log(`🚨 STALE ENGINE DATA: Last engine update ${Math.round(engineAge)} minutes ago`)
          console.log('   Recommendation: Use GPS data instead')
        }
      }
      
    } else {
      console.log('❌ TRUCK 81 not found in API response')
      console.log('Available vehicles:', data.data?.map(v => v.name).slice(0, 10))
    }
    
    // Check for other vehicles with potential stale data
    console.log('\n📊 FLEET-WIDE STALE DATA CHECK:')
    let staleEngineCount = 0
    let staleGpsCount = 0
    
    data.data?.forEach(vehicle => {
      if (vehicle.engineStates) {
        const engineAge = (new Date() - new Date(vehicle.engineStates.time)) / (1000 * 60)
        if (engineAge > 120) { // More than 2 hours
          staleEngineCount++
        }
      }
      
      if (vehicle.gps) {
        const gpsAge = (new Date() - new Date(vehicle.gps.time)) / (1000 * 60)
        if (gpsAge > 30) { // More than 30 minutes
          staleGpsCount++
        }
      }
    })
    
    console.log(`Vehicles with stale engine data (>2hrs): ${staleEngineCount}/${data.data?.length}`)
    console.log(`Vehicles with stale GPS data (>30min): ${staleGpsCount}/${data.data?.length}`)
    
  } catch (error) {
    console.error('❌ Investigation failed:', error)
  }
}

// Run the investigation
investigateDataFreshness().then(() => {
  console.log('\n🏁 Data freshness investigation complete!')
  console.log('\n💡 SOLUTIONS:')
  console.log('1. Check timestamp age before displaying engine status')
  console.log('2. Show "Last engine update: X hours ago" when stale')
  console.log('3. Fall back to GPS-only when engine data too old')
  console.log('4. Add cache-busting headers to API requests')
})
