/**
 * Distance and ETA calculation utilities using Haversine formula
 */

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371 // Earth's radius in kilometers

    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
}

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @returns Formatted string (e.g., "0.8 km", "350 m")
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        const meters = Math.round(distanceKm * 1000)
        return `${meters} m`
    }
    return `${distanceKm.toFixed(1)} km`
}

/**
 * Calculate ETA based on distance
 * Assumes average urban speed of 20 km/h including traffic
 * @param distanceKm Distance in kilometers
 * @returns Formatted ETA string (e.g., "5 mins", "1 hour 20 mins")
 */
export function calculateETA(distanceKm: number): string {
    const avgSpeedKmh = 20 // Average urban speed
    const timeHours = distanceKm / avgSpeedKmh
    const timeMinutes = Math.ceil(timeHours * 60)

    if (timeMinutes < 60) {
        return `${timeMinutes} mins`
    }

    const hours = Math.floor(timeMinutes / 60)
    const mins = timeMinutes % 60
    return mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`
}

/**
 * Get time elapsed since a timestamp
 * Maximum display is 20 seconds as per requirements
 * @param timestamp ISO timestamp string or Date object
 * @returns Formatted time string (e.g., "Just now", "15s ago")
 */
export function getTimeAgo(timestamp: string | Date): string {
    const now = Date.now()
    const past = new Date(timestamp).getTime()
    const secondsAgo = Math.floor((now - past) / 1000)

    if (secondsAgo < 5) {
        return 'Just now'
    }

    if (secondsAgo <= 20) {
        return `${secondsAgo}s ago`
    }


    return 'Immediate'
}
