// Quick FileMaker connectivity test
// Run this from your local machine to test external access

const testFileMakerAccess = async () => {
  console.log('🧪 Testing FileMaker external access...')
  
  const authUrl = 'https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/sessions'
  const credentials = Buffer.from('trevor_api:XcScS2yRoTtMo7').toString('base64')
  
  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`Response status: ${response.status}`)
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ SUCCESS: FileMaker authentication working')
      console.log('Token received:', data.response?.token ? 'Yes' : 'No')
      return true
    } else {
      const errorText = await response.text()
      console.log('❌ FAILED: FileMaker authentication failed')
      console.log('Error details:', errorText)
      return false
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message)
    return false
  }
}

testFileMakerAccess()
