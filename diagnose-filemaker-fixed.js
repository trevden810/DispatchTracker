// FileMaker Data Diagnostics - Direct API Investigation (FIXED)
console.log('🔍 FILEMAKER DATA DIAGNOSTICS')
console.log('=============================')

async function diagnoseFileMakerData() {
  try {
    console.log('1️⃣ Testing direct FileMaker jobs API...')
    
    // Test the jobs API endpoint directly
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
    const response = await fetch(`${baseUrl}/api/jobs?active=true&geocode=false&limit=50`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
    
    console.log(`📊 Jobs API Response: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Jobs API failed:')
      console.log(errorText)
      return
    }
    
    const jobsData = await response.json()
    console.log('✅ Jobs API responded successfully')
    
    console.log('\\n2️⃣ Analyzing jobs data structure...')
    console.log('Response keys:', Object.keys(jobsData))
    console.log('Success:', jobsData.success)
    console.log('Data array length:', jobsData.data?.length || 0)
    
    if (jobsData.data && jobsData.data.length > 0) {
      console.log('\\n3️⃣ Sample job data:')
      jobsData.data.slice(0, 3).forEach((job, index) => {
        console.log(`\\nJob ${index + 1}:`)
        console.log('  Keys:', Object.keys(job))
        console.log('  ID:', job.id)
        console.log('  Status:', job.status)
        console.log('  Type:', job.type)
        console.log('  TruckID:', job.truckId)
        console.log('  Customer:', job.customer)
        console.log('  Date:', job.date)
      })
      
      console.log('\\n4️⃣ Job statistics:')
      const statuses = {}
      const types = {}
      const truckIds = {}
      
      jobsData.data.forEach(job => {
        statuses[job.status] = (statuses[job.status] || 0) + 1
        types[job.type] = (types[job.type] || 0) + 1
        if (job.truckId) {
          truckIds[job.truckId] = (truckIds[job.truckId] || 0) + 1
        }
      })
      
      console.log('  Job statuses:', statuses)
      console.log('  Job types:', types)
      console.log('  Truck IDs (first 10):', Object.keys(truckIds).slice(0, 10).join(', '))
      
      // Look for specific jobs
      console.log('\\n5️⃣ Searching for specific jobs...')
      const job896888 = jobsData.data.find(j => j.id === 896888 || j.id === '896888')
      const job896891 = jobsData.data.find(j => j.id === 896891 || j.id === '896891')
      
      if (job896888) {
        console.log('✅ Job #896888 found in FileMaker:')
        console.log('   Status:', job896888.status)
        console.log('   TruckID:', job896888.truckId)
        console.log('   Customer:', job896888.customer)
      } else {
        console.log('❌ Job #896888 not found in current FileMaker data')
      }
      
      if (job896891) {
        console.log('✅ Job #896891 found in FileMaker:')
        console.log('   Status:', job896891.status)
        console.log('   TruckID:', job896891.truckId)  
        console.log('   Customer:', job896891.customer)
      } else {
        console.log('❌ Job #896891 not found in current FileMaker data (expected - was demo only)')
      }
      
    } else {
      console.log('\\n❌ NO JOBS RETURNED FROM FILEMAKER')
      
      console.log('\\n🔧 POSSIBLE CAUSES:')
      console.log('1. No jobs in database for current date filter')
      console.log('2. All jobs have statuses that are filtered out')
      console.log('3. Date format issues in query')
      console.log('4. Field access permissions changed')
      console.log('5. Database layout issues')
    }
    
    // Test without filters to see raw data
    console.log('\\n6️⃣ Testing without date filters...')
    try {
      const rawResponse = await fetch(`${baseUrl}/api/jobs?limit=10`, {
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (rawResponse.ok) {
        const rawData = await rawResponse.json()
        console.log(`📋 Raw jobs (no filters): ${rawData.data?.length || 0} found`)
        
        if (rawData.data?.length > 0) {
          console.log('\\n📅 Date range analysis:')
          const dates = rawData.data.map(j => j.date).filter(d => d)
          const uniqueDates = [...new Set(dates)].sort()
          console.log(`   Job dates found: ${uniqueDates.slice(0, 5).join(', ')}${uniqueDates.length > 5 ? '...' : ''}`)
          console.log(`   Total unique dates: ${uniqueDates.length}`)
          
          console.log('\\n📊 Status distribution:')
          const statusDist = {}
          rawData.data.forEach(job => {
            statusDist[job.status] = (statusDist[job.status] || 0) + 1
          })
          console.log('   ', statusDist)
        }
      }
    } catch (error) {
      console.log('⚠️  Raw data test failed:', error.message)
    }
    
    console.log('\\n🎯 DIAGNOSIS RESULTS:')
    if (jobsData.data && jobsData.data.length > 0) {
      console.log('✅ FileMaker connection working')
      console.log('✅ Jobs exist in database')  
      console.log('❓ But jobs may be filtered out by active/date criteria')
      console.log('\\n💡 RECOMMENDATIONS:')
      console.log('   1. Check if jobs have current date')
      console.log('   2. Verify job statuses are considered active')
      console.log('   3. Review date filtering logic in jobs API')
    } else {
      console.log('❌ No jobs returned - investigation needed')
      console.log('\\n💡 IMMEDIATE ACTIONS:')
      console.log('   1. Check FileMaker database has current jobs')
      console.log('   2. Verify date/time formats match')
      console.log('   3. Test with broader date ranges')
      console.log('   4. Consider temporarily removing filters')
    }
    
  } catch (error) {
    console.log(`❌ FileMaker diagnostics failed: ${error.message}`)
    console.log('\\n🔧 CHECK:')
    console.log('   1. Development server running: npm run dev')
    console.log('   2. FileMaker server accessible')
    console.log('   3. API credentials valid')
  }
}

diagnoseFileMakerData().catch(console.error)
