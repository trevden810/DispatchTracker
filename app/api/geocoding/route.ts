// DispatchTracker - Geocoding MVP Test Endpoint
// Test real customer address geocoding with performance monitoring

import { NextResponse } from 'next/server'
import { geocodeAddress, batchGeocodeAddresses, getGeocodeStats, clearGeocodeCache } from '@/lib/geocoding'
import { ApiResponse } from '@/lib/types'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'test'
    const clearCache = searchParams.get('clearCache') === 'true'
    
    if (clearCache) {
      clearGeocodeCache()
      console.log('🧹 Geocoding cache cleared')
    }
    
    switch (action) {
      case 'test':
        return await testSampleAddresses()
      
      case 'batch':
        return await testBatchGeocode()
      
      case 'stats':
        return await getCacheStats()
      
      case 'verify':
        return await verifyRealAddresses()
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: test, batch, stats, verify',
          availableActions: ['test', 'batch', 'stats', 'verify'],
          timestamp: new Date().toISOString()
        }, { status: 400 })
    }
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ Geocoding test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Geocoding test failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      processingTime
    } as ApiResponse<never>, { status: 500 })
  }
}

/**
 * Test sample real addresses from your API output
 */
async function testSampleAddresses() {
  const startTime = Date.now()
  
  // Real addresses from your production data
  const testAddresses = [
    '1630 QUEEN ANN AVENUE',
    '4800 Telluride St\r01-E Office Workroom',
    '8930 W Portland Ave',
    '9425 N Nevada St. Suite 114'
  ]
  
  console.log(`🧪 Testing ${testAddresses.length} real customer addresses...`)
  
  const results = []
  
  for (const address of testAddresses) {
    const cleanAddress = address.replace(/\r/g, ' ').trim()
    console.log(`📍 Geocoding: ${cleanAddress}`)
    
    const geocoded = await geocodeAddress(cleanAddress)
    
    results.push({
      original: address,
      cleaned: cleanAddress,
      geocoded: geocoded ? {
        lat: geocoded.lat,
        lng: geocoded.lng,
        confidence: geocoded.confidence,
        source: geocoded.source,
        displayAddress: geocoded.address
      } : null,
      success: geocoded !== null
    })
    
    // Small delay to be respectful to geocoding service
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const processingTime = Date.now() - startTime
  const successCount = results.filter(r => r.success).length
  
  return NextResponse.json({
    success: true,
    message: `Geocoded ${successCount}/${testAddresses.length} real customer addresses`,
    results,
    performance: {
      processingTime,
      averageTimePerAddress: processingTime / testAddresses.length,
      successRate: (successCount / testAddresses.length) * 100
    },
    timestamp: new Date().toISOString()
  })
}

/**
 * Test batch geocoding performance
 */
async function testBatchGeocode() {
  const startTime = Date.now()
  
  const addresses = [
    '1630 QUEEN ANN AVENUE',
    '4800 Telluride St',
    '8930 W Portland Ave',
    '9425 N Nevada St. Suite 114',
    '123 Main St, Denver, CO'
  ]
  
  console.log(`🚀 Batch geocoding ${addresses.length} addresses...`)
  
  const results = await batchGeocodeAddresses(addresses)
  const processingTime = Date.now() - startTime
  
  const geocodedResults = Array.from(results.entries()).map(([address, result]) => ({
    address,
    geocoded: result ? {
      lat: result.lat,
      lng: result.lng,
      confidence: result.confidence,
      source: result.source
    } : null,
    success: result !== null
  }))
  
  const successCount = geocodedResults.filter(r => r.success).length
  
  return NextResponse.json({
    success: true,
    message: `Batch geocoded ${successCount}/${addresses.length} addresses`,
    results: geocodedResults,
    performance: {
      processingTime,
      averageTimePerAddress: processingTime / addresses.length,
      successRate: (successCount / addresses.length) * 100
    },
    timestamp: new Date().toISOString()
  })
}

/**
 * Get geocoding cache statistics
 */
async function getCacheStats() {
  const stats = getGeocodeStats()
  
  return NextResponse.json({
    success: true,
    cache: {
      size: stats.cacheSize,
      addresses: stats.addresses,
      sampleCachedAddresses: stats.addresses.slice(0, 5)
    },
    timestamp: new Date().toISOString()
  })
}

/**
 * Verify production addresses can be geocoded
 */
async function verifyRealAddresses() {
  // Test a few problematic address formats that might appear in FileMaker
  const problematicAddresses = [
    '4800 Telluride St\r01-E Office Workroom', // Contains \r
    '9425 N Nevada St. Suite  114',             // Double space
    '  1630 QUEEN ANN AVENUE  ',               // Leading/trailing spaces
    'BUILDING A, SUITE 100',                   // No street address
    ''
  ]
  
  console.log('🔍 Testing problematic address formats...')
  
  const results = []
  
  for (const address of problematicAddresses) {
    const geocoded = await geocodeAddress(address)
    
    results.push({
      original: address,
      cleaned: address.trim().replace(/\r/g, ' '),
      geocoded: geocoded !== null,
      confidence: geocoded?.confidence || 'none'
    })
  }
  
  return NextResponse.json({
    success: true,
    message: 'Verified problematic address handling',
    results,
    recommendations: [
      'Clean \\r characters from FileMaker addresses',
      'Trim whitespace before geocoding',
      'Handle incomplete addresses gracefully',
      'Cache results to avoid repeated API calls'
    ],
    timestamp: new Date().toISOString()
  })
}

/**
 * POST endpoint for custom address testing
 */
export async function POST(request: Request) {
  try {
    const { addresses } = await request.json()
    
    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json({
        success: false,
        error: 'Please provide an array of addresses to geocode',
        example: { addresses: ['123 Main St', '456 Oak Ave'] },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }
    
    const startTime = Date.now()
    console.log(`🎯 Custom geocoding test for ${addresses.length} addresses...`)
    
    const results = await batchGeocodeAddresses(addresses)
    const processingTime = Date.now() - startTime
    
    const geocodedResults = Array.from(results.entries()).map(([address, result]) => ({
      address,
      geocoded: result ? {
        lat: result.lat,
        lng: result.lng,
        confidence: result.confidence,
        source: result.source,
        displayAddress: result.address
      } : null,
      success: result !== null
    }))
    
    const successCount = geocodedResults.filter(r => r.success).length
    
    return NextResponse.json({
      success: true,
      message: `Custom geocoded ${successCount}/${addresses.length} addresses`,
      results: geocodedResults,
      performance: {
        processingTime,
        averageTimePerAddress: processingTime / addresses.length,
        successRate: (successCount / addresses.length) * 100
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Custom geocoding error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Custom geocoding failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
