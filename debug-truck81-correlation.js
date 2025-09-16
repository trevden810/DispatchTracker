// Diagnostic Tool: Debug TRUCK 81 vs Job #896888 Correlation Error
// This script will help us understand why the wrong job is being assigned

console.log('🔍 TRUCK 81 vs Job #896888 Correlation Debugging')
console.log('===============================================')

// Test the current matching logic to see what's happening
function extractAllNumbers(vehicleName) {
  if (!vehicleName) return []
  
  const numbers = []
  const numberMatches = vehicleName.match(/\d+/g)
  if (numberMatches) {
    numberMatches.forEach(match => {
      const num = parseInt(match, 10)
      if (!isNaN(num) && num > 0 && num < 10000) {
        numbers.push(num)
      }
    })
  }
  
  return [...new Set(numbers)]
}

// Test with TRUCK 81
const vehicleName = "TRUCK 81"
const extractedNumbers = extractAllNumbers(vehicleName)

console.log(`\n🚛 Vehicle: "${vehicleName}"`)
console.log(`📊 Extracted numbers: [${extractedNumbers.join(', ')}]`)

// Simulate the job data we're seeing
const jobData = [
  { id: "896888", truckId: "72", customer: "FCI CONSTRUCTOS INC", status: "Entered" },
  { id: "sample1", truckId: "81", customer: "Test Customer 1", status: "In Progress" },
  { id: "sample2", truckId: "80", customer: "Test Customer 2", status: "Complete" },
  { id: "sample3", truckId: "83", customer: "Test Customer 3", status: "Entered" }
]

console.log(`\n📋 Available Jobs:`)
jobData.forEach(job => {
  console.log(`   Job ${job.id}: Truck ${job.truckId} - ${job.customer}`)
})

// Test exact matching
console.log(`\n🎯 Testing Exact Matching:`)
extractedNumbers.forEach(num => {
  const exactMatch = jobData.find(job => Number(job.truckId) === num)
  if (exactMatch) {
    console.log(`   ✅ EXACT MATCH: Vehicle number ${num} → Job ${exactMatch.id} (Truck ${exactMatch.truckId})`)
  } else {
    console.log(`   ❌ No exact match for vehicle number ${num}`)
  }
})

// Test fuzzy matching (current algorithm)
console.log(`\n🔄 Testing Fuzzy Matching (±2 difference):`)
const allTruckIds = jobData.map(job => Number(job.truckId))

extractedNumbers.forEach(num => {
  const fuzzyMatches = allTruckIds.filter(truckId => {
    const diff = Math.abs(num - truckId)
    return diff <= 2 && diff > 0
  })
  
  console.log(`   Vehicle ${num} fuzzy matches: [${fuzzyMatches.join(', ')}]`)
  
  if (fuzzyMatches.length === 1) {
    const matchedTruckId = fuzzyMatches[0]
    const matchedJob = jobData.find(job => Number(job.truckId) === matchedTruckId)
    console.log(`   ✅ FUZZY MATCH: Vehicle ${num} → Truck ${matchedTruckId} (Job ${matchedJob.id}) - Difference: ${Math.abs(num - matchedTruckId)}`)
  } else if (fuzzyMatches.length > 1) {
    console.log(`   ⚠️  Multiple fuzzy matches found - ambiguous`)
  }
})

// Test the SPECIFIC case: TRUCK 81 vs Job #896888 (Truck 72)
console.log(`\n🚨 SPECIFIC CASE ANALYSIS: TRUCK 81 vs Job #896888`)
const vehicle81 = 81
const job896888TruckId = 72
const difference = Math.abs(vehicle81 - job896888TruckId)

console.log(`   Vehicle: TRUCK 81 (number: 81)`)
console.log(`   Job #896888: Truck ${job896888TruckId}`)
console.log(`   Difference: ${difference}`)
console.log(`   Should match with ±2 tolerance: ${difference <= 2 ? 'YES ❌ (WRONG!)' : 'NO ✅ (CORRECT)'}`)

// Show what's probably happening
console.log(`\n💡 LIKELY ISSUE:`)
if (difference > 2) {
  console.log(`   The fuzzy matching shouldn't match TRUCK 81 to Job #896888 (Truck 72)`)
  console.log(`   Difference of ${difference} exceeds the ±2 tolerance`)
  console.log(`   This suggests either:`)
  console.log(`   1. The job data in FileMaker is different than expected`)
  console.log(`   2. There's a bug in the live job fetching`)
  console.log(`   3. Demo mode is providing incorrect data`)
  console.log(`   4. There's a logic error in the matching algorithm`)
} else {
  console.log(`   The fuzzy matching WOULD match TRUCK 81 to Job #896888`)
  console.log(`   This is the source of the incorrect correlation!`)
}

// Recommendations
console.log(`\n🔧 RECOMMENDED FIXES:`)
console.log(`   1. Tighten fuzzy matching tolerance (±1 instead of ±2)`)
console.log(`   2. Prioritize exact matches over fuzzy matches`)
console.log(`   3. Add conflict resolution for multiple potential matches`)
console.log(`   4. Check live vs demo job data consistency`)
console.log(`   5. Add stricter validation in matching algorithm`)

console.log(`\n📝 NEXT STEPS:`)
console.log(`   1. Check what truck IDs are actually in the live/demo job data`)
console.log(`   2. Tighten the fuzzy matching tolerance`)
console.log(`   3. Add debugging output to track all matching decisions`)
console.log(`   4. Test with real FileMaker data to verify truck ID accuracy`)
