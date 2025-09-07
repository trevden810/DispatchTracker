// GPS utility functions for distance calculation and job proximity detection

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3959 // Earth radius in miles
  const dLat = toRadians(coord2.lat - coord1.lat)
  const dLng = toRadians(coord2.lng - coord1.lng)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Check if vehicle is within proximity threshold of a location
 */
export function isVehicleAtLocation(
  vehicleCoords: Coordinates, 
  targetCoords: Coordinates, 
  thresholdMiles: number = 0.5
): boolean {
  const distance = calculateDistance(vehicleCoords, targetCoords)
  return distance <= thresholdMiles
}

/**
 * Get proximity status with distance
 */
export function getProximityStatus(
  vehicleCoords: Coordinates,
  targetCoords: Coordinates,
  thresholdMiles: number = 0.5
): {
  isAt: boolean
  distance: number
  status: 'at-location' | 'nearby' | 'en-route' | 'far'
} {
  const distance = calculateDistance(vehicleCoords, targetCoords)
  
  let status: 'at-location' | 'nearby' | 'en-route' | 'far'
  
  if (distance <= thresholdMiles) {
    status = 'at-location'
  } else if (distance <= thresholdMiles * 2) {
    status = 'nearby'
  } else if (distance <= 10) {
    status = 'en-route'
  } else {
    status = 'far'
  }
  
  return {
    isAt: distance <= thresholdMiles,
    distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
    status
  }
}

/**
 * Geocode an address to coordinates (mock implementation)
 * In production, integrate with Google Maps API or similar
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  // Mock geocoding for common Colorado addresses
  const mockAddresses: Record<string, Coordinates> = {
    'denver': { lat: 39.7392, lng: -104.9903 },
    'aurora': { lat: 39.7294, lng: -104.8319 },
    'boulder': { lat: 40.0150, lng: -105.2705 },
    'colorado springs': { lat: 38.8339, lng: -104.8214 }
  }
  
  const key = address.toLowerCase()
  return mockAddresses[key] || null
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return `${Math.round(miles * 5280)} ft`
  } else if (miles < 1) {
    return `${Math.round(miles * 10) / 10} mi`
  } else {
    return `${Math.round(miles * 10) / 10} mi`
  }
}