// Real geocoding implementation using Google Maps API

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Geocode address using Google Maps Geocoding API
 * Add GOOGLE_MAPS_API_KEY to your .env.local
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    console.warn('⚠️ GOOGLE_MAPS_API_KEY not set, geocoding disabled')
    return null
  }
  
  try {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return {
        lat: location.lat,
        lng: location.lng
      }
    }
    
    console.warn(`⚠️ Geocoding failed for "${address}": ${data.status}`)
    return null
    
  } catch (error) {
    console.error(`❌ Geocoding error for "${address}":`, error)
    return null
  }
}

/**
 * Batch geocode multiple addresses with rate limiting
 */
export async function batchGeocodeAddresses(
  addresses: string[],
  delayMs: number = 200 // Google allows 50 req/sec
): Promise<Map<string, Coordinates>> {
  const results = new Map<string, Coordinates>()
  
  for (const address of addresses) {
    const coords = await geocodeAddress(address)
    if (coords) {
      results.set(address, coords)
    }
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
  
  return results
}
