// Quick test to see what's happening with FileMaker jobs
const testJobs = async () => {
  console.log('🧪 Testing FileMaker jobs API...')
  
  try {
    // Test local jobs endpoint
    const response = await fetch('http://localhost:3002/api/jobs?limit=5', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    
    if (!response.ok) {
      console.log(`❌ Jobs API failed: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.log('Error details:', text)
      return
    }
    
    const data = await response.json()
    console.log(`✅ Jobs API Response: ${data.success ? 'SUCCESS' : 'FAILED'}`)
    console.log(`📊 Jobs count: ${data.count || 0}`)
    
    if (data.data && data.data.length > 0) {
      console.log('📋 Sample jobs:')
      data.data.slice(0, 3).forEach(job => {
        console.log(`   Job ${job.id}: truckId=${job.truckId}, customer='${job.customer}'`)
      })
      
      // Check truck IDs
      const truckIds = data.data
        .map(job => job.truckId)
        .filter(id => id !== null && id !== undefined)
      
      console.log(`🚛 Truck IDs found: [${truckIds.join(', ')}]`)
      console.log(`📈 Jobs with truck IDs: ${truckIds.length}/${data.data.length}`)
    } else {
      console.log('❌ No job data returned')
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message)
  }
}

testJobs()
