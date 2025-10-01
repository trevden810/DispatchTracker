// Debug vehicle data structure
const BASE_URL = 'http://localhost:3002'

async function debugVehicleData() {
  console.log('\n🔍 Debugging Vehicle Data Structure\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/vehicles`)
    const data = await response.json()
    
    if (data.success && data.data.length > 0) {
      console.log(`✅ Got ${data.data.length} vehicles\n`)
      
      // Show first 3 vehicles with all relevant fields
      console.log('📊 Sample Vehicle Data:')
      data.data.slice(0, 3).forEach(v => {
        console.log(`\n  Vehicle:`)
        console.log(`    id: ${v.id}`)
        console.log(`    name: ${v.name}`)
        console.log(`    externalIds: ${JSON.stringify(v.externalIds)}`)
        console.log(`    diagnostics.driverName: ${v.diagnostics?.driverName}`)
      })
      
      // Extract patterns
      console.log('\n\n🎯 Vehicle Name Patterns:')
      const names = data.data.map(v => v.name).slice(0, 10)
      names.forEach(n => console.log(`  - ${n}`))
      
    } else {
      console.log('❌ No vehicle data')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

debugVehicleData()
