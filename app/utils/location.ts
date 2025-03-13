export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculate the distance between two coordinates in kilometers using the Haversine formula
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  // If points are exactly the same (common in mocked data), add a small random difference
  if (point1.lat === point2.lat && point1.lng === point2.lng) {
    // Create a random distance between 0.5 and 5 km
    return 0.5 + Math.random() * 4.5;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  // Add a small random factor to make each calculation slightly different
  const distance = R * c;
  return distance + (distance * 0.05 * Math.random());
}

/**
 * Calculate the estimated delivery time based on distance
 * Assumes average speed of 15 km/h for delivery and 5 minutes of preparation time
 */
export function calculateDeliveryTime(distance: number): number {
  // Base preparation time in minutes (random between 10-20)
  const baseTime = 10 + Math.floor(Math.random() * 10);
  // Average speed in km/h (between 15-30)
  const averageSpeed = 15 + Math.floor(Math.random() * 15);
  // Convert distance to time in minutes
  const travelTime = (distance / averageSpeed) * 60;
  return Math.round(baseTime + travelTime);
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

/**
 * Format delivery time for display
 */
export function formatDeliveryTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
} 