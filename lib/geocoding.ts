// DispatchTracker - Address Geocoding Utilities
// Convert FileMaker customer addresses to GPS coordinates

import { GeocodingResult } from './types'

// In-memory cache for geocoded addresses to avoid redundant API calls
const geocodeCache = new Map<string, GeocodingResult>()

/**
 * Geocode a customer address to GPS coordinates
 * Uses Nominatim (free) as primary geocoding service
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim().length === 0) {
    return null
  }

  const cleanAddress = address.trim()
  
  // Check cache first
  if (geocodeCache.has(cleanAddress)) {
    const cached = geocodeCache.get(cleanAddress)!
    console.log(`📍 Using cached coordinates for: ${cleanAddress}`)
    return cached
  }

  try {
    // Use Nominatim (OpenStreetMap) geocoding - free and reliable
    const encodedAddress = encodeURIComponent(cleanAddress)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=us`,
      {
        headers: {
          'User-Agent': 'DispatchTracker-PepMove/1.0 (dispatch@pepmove.com)'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }

    const results = await response.json()
    
    if (results && results.length > 0) {
      const result = results[0]
      const geocoded: GeocodingResult = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.display_name,
        confidence: determineConfidence(result),
        source: 'nominatim'
      }
      
      // Cache the result
      geocodeCache.set(cleanAddress, geocoded)
      console.log(`🗺️ Geocoded: ${cleanAddress} → ${geocoded.lat}, ${geocoded.lng}`)
      
      return geocoded
    }

    console.warn(`⚠️ No geocoding results for: ${cleanAddress}`)
    return null

  } catch (error) {
    console.error(`❌ Geocoding error for "${cleanAddress}":`, error)
    return null
  }
}

/**
 * Determine geocoding confidence based on result properties
 */
function determineConfidence(result: any): 'high' | 'medium' | 'low' {
  const importance = parseFloat(result.importance || 0)
  const type = result.type || ''
  
  // High confidence for specific addresses
  if (importance > 0.5 && (type === 'house' || type === 'building')) {
    return 'high'
  }
  
  // Medium confidence for streets and areas
  if (importance > 0.3) {
    return 'medium'
  }
  
  return 'low'
}

/**
 * Batch geocode multiple addresses efficiently
 */
export async function batchGeocodeAddresses(
  addresses: string[]
): Promise<Map<string, GeocodingResult | null>> {
  const results = new Map<string, GeocodingResult | null>()
  
  // Process in small batches to respect rate limits
  const batchSize = 5
  const delay = 1000 // 1 second between batches
  
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize)
    
    const batchPromises = batch.map(async (address) => {
      const result = await geocodeAddress(address)
      results.set(address, result)
      return { address, result }
    })
    
    await Promise.all(batchPromises)
    
    // Delay between batches to be respectful to the geocoding service
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return results
}

/**
 * Get cached geocoding result without making API calls
 */
export function getCachedGeocode(address: string): GeocodingResult | null {
  return geocodeCache.get(address.trim()) || null
}

/**
 * Clear geocoding cache (useful for testing)
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear()
  console.log('🧹 Geocoding cache cleared')
}

/**
 * Get cache statistics
 */
export function getGeocodeStats(): { cacheSize: number; addresses: string[] } {
  return {
    cacheSize: geocodeCache.size,
    addresses: Array.from(geocodeCache.keys())
  }
}
