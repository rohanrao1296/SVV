/**
 * Calculates the distance between two GPS coordinates using the Haversine formula.
 * Returns the distance in meters.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Parses user agent to extract browser name and device type.
 */
export function getDeviceAndBrowserInfo(): { browser: string; deviceName: string } {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let deviceName = 'Desktop / Unknown Device';

  // Simple browser detection
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Safari') > -1 && ua.indexOf('Edge') === -1) {
    browser = 'Google Chrome';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browser = 'Apple Safari';
  } else if (ua.indexOf('Firefox') > -1) {
    browser = 'Mozilla Firefox';
  } else if (ua.indexOf('Edg') > -1) {
    browser = 'Microsoft Edge';
  }

  // Simple mobile/OS detection
  if (/Android/i.test(ua)) {
    deviceName = 'Android Mobile';
    const match = ua.match(/Android\s+([^\s;]+)/);
    if (match) deviceName += ` (OS ${match[1]})`;
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    deviceName = 'Apple iOS Device';
  } else if (/Windows/i.test(ua)) {
    deviceName = 'Windows PC';
  } else if (/Macintosh/i.test(ua)) {
    deviceName = 'Mac PC';
  } else if (/Linux/i.test(ua)) {
    deviceName = 'Linux PC';
  }

  return { browser, deviceName };
}

/**
 * Formats distance for display.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
}
