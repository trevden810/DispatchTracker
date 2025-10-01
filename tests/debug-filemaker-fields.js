// Check what fields FileMaker is actually returning
// Run: node tests/debug-filemaker-fields.js

async function debugFileMakerFields() {
  const baseUrl = 'https://www.pepmovetracker.info'
  
  console.log('🔍 Fetching raw job data from FileMaker...\n')
  const jobsRes = await fetch(`${baseUrl}/api/jobs?limit=10`)
  const jobsData = await jobsRes.json()
  const jobs = jobsData.data
  
  console.log('📊 First job - ALL fields:\n')
  console.log(JSON.stringify(jobs[0], null, 2))
  
  console.log('\n📊 Fields across all 10 jobs:')
  const allFields = new Set()
  jobs.forEach(job => {
    Object.keys(job).forEach(key => allFields.add(key))
  })
  
  console.log([...allFields].sort().join('\n'))
  
  console.log('\n🔍 Route-related fields in first 5 jobs:')
  jobs.slice(0, 5).forEach(j => {
    console.log(`\nJob ${j.id}:`)
    Object.keys(j)
      .filter(k => k.toLowerCase().includes('route') || k.toLowerCase().includes('truck') || k.toLowerCase().includes('driver'))
      .forEach(k => console.log(`  ${k}: ${j[k]}`))
  })
}

debugFileMakerFields().catch(console.error)
