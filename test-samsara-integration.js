// Samsara API Testing and Debugging
// Use: node test-samsara-integration.js

console.log('🧪 Testing Samsara API Integration...')

const SAMSARA_TOKEN = process.env.SAMSARA_API_TOKEN

async function testSamsaraEndpoints() {
  console.log('\n📊 Testing Samsara /fleet/vehicles/stats endpoint...')
  
  try {
    // Test the enhanced stats endpoint
    const statsUrl = 'https://api.samsara.com/fleet/vehicles/stats'
    const params = new URLSearchParams({
      types: 'gps,engineStates,fuelPercents,obdOdometerMeters'
    })
    
    console.log(`🔗 Making request to: ${statsUrl}?${params}`)
    console.log(`🔑 Using token: ${SAMSARA_TOKEN.substring(0, 20)}...`)
    
    const response = await fetch(`${statsUrl}?${params}`, {
      headers: {
        'Authorization': `Bearer ${SAMSARA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📡 Response status: ${response.status}`)
    console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error: ${response.status}`)
      console.error(`❌ Error details:`, errorText)
      return
    }
    
    const data = await response.json()
    console.log(`✅ Successfully retrieved data for ${data.data?.length || 0} vehicles`)
    
    // Analyze first vehicle in detail
    if (data.data && data.data.length > 0) {
      const firstVehicle = data.data[0]
      console.log('\n🚛 First Vehicle Analysis:')
      console.log(`- ID: ${firstVehicle.id}`)
      console.log(`- Name: ${firstVehicle.name}`)
      console.log(`- Available data keys:`, Object.keys(firstVehicle))
      
      // Check GPS data
      if (firstVehicle.gps) {
        console.log(`- GPS: Lat ${firstVehicle.gps.latitude}, Lng ${firstVehicle.gps.longitude}`)
        console.log(`- Speed: ${firstVehicle.gps.speedMilesPerHour} mph`)
        console.log(`- Address: ${firstVehicle.gps.reverseGeo?.formattedLocation || 'Not available'}`)
        console.log(`- GPS Time: ${firstVehicle.gps.time}`)
      } else {
        console.log(`- GPS: No data available`)
      }
      
      // Check engine states
      if (firstVehicle.engineStates) {
        console.log(`- Engine State: ${firstVehicle.engineStates.value}`)
        console.log(`- Engine Time: ${firstVehicle.engineStates.time}`)
      } else {
        console.log(`- Engine States: No data available`)
      }
      
      // Check fuel data
      if (firstVehicle.fuelPercents) {
        console.log(`- Fuel Level: ${firstVehicle.fuelPercents.value}%`)
        console.log(`- Fuel Time: ${firstVehicle.fuelPercents.time}`)
      } else {
        console.log(`- Fuel Percents: No data available`)
      }
      
      // Check speeds from GPS data
      if (firstVehicle.gps?.speedMilesPerHour !== undefined) {
        console.log(`- Speed Reading: ${firstVehicle.gps.speedMilesPerHour} mph`)
        console.log(`- Speed Time: ${firstVehicle.gps.time}`)
      } else {
        console.log(`- Speeds: No data available (speed comes from GPS)`)
      }
      
      // Check odometer
      if (firstVehicle.obdOdometerMeters) {
        console.log(`- Odometer: ${firstVehicle.obdOdometerMeters.value} meters (${Math.round(firstVehicle.obdOdometerMeters.value * 0.000621371)} miles)`)
        console.log(`- Odometer Time: ${firstVehicle.obdOdometerMeters.time}`)
      } else {
        console.log(`- OBD Odometer: No data available`)
      }
    }
    
    // Show sample of raw response
    console.log('\n📄 Raw Response Sample:')
    console.log(JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

async function testBasicVehiclesEndpoint() {
  console.log('\n🚗 Testing basic /fleet/vehicles endpoint...')
  
  try {
    const response = await fetch('https://api.samsara.com/fleet/vehicles', {
      headers: {
        'Authorization': `Bearer ${SAMSARA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📡 Response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Basic API Error: ${response.status}`)
      console.error(`❌ Error details:`, errorText)
      return
    }
    
    const data = await response.json()
    console.log(`✅ Basic endpoint: Retrieved ${data.data?.length || 0} vehicles`)
    
    if (data.data && data.data.length > 0) {
      const firstVehicle = data.data[0]
      console.log('\n🚛 Basic Vehicle Structure:')
      console.log(`- ID: ${firstVehicle.id}`)
      console.log(`- Name: ${firstVehicle.name}`)
      console.log(`- Available keys:`, Object.keys(firstVehicle))
    }
    
  } catch (error) {
    console.error('❌ Basic test failed:', error)
  }
}

// Run tests
testBasicVehiclesEndpoint()
  .then(() => testSamsaraEndpoints())
  .then(() => {
    console.log('\n🏁 Testing complete!')
  })
  .catch(error => {
    console.error('❌ Test suite failed:', error)
  })
