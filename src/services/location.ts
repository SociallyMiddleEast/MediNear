import type { GeoPoint } from '../types';
import { COUNTRY_CENTER, countryFromTimezone } from '../data/countries';
import { distanceKm } from '../data/generator';

export interface DetectedLocation {
  country?: string;
  city?: string;
  point?: GeoPoint;
  source: 'gps' | 'timezone' | 'manual';
  accuracyM?: number;
  error?: string;
}

// Works in browsers today and inside Capacitor later: on iOS/Android swap to
// @capacitor/geolocation, which has the same shape (getCurrentPosition).
function getPosition(timeoutMs = 12000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Location is not supported on this device.'));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 });
  });
}

async function reverseGeocode(p: GeoPoint): Promise<{ country?: string; city?: string }> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${p.lat}&longitude=${p.lng}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const j = await res.json();
    return { country: j.countryCode || undefined, city: j.city || j.locality || undefined };
  } catch {
    // Offline fallback: nearest known capital.
    let best: string | undefined; let bestD = Infinity;
    for (const [code, [lat, lng]] of Object.entries(COUNTRY_CENTER)) {
      const d = distanceKm(p, { lat, lng });
      if (d < bestD) { bestD = d; best = code; }
    }
    return { country: bestD < 600 ? best : undefined };
  }
}

export async function detectLocation(): Promise<DetectedLocation> {
  try {
    const pos = await getPosition();
    const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    const { country, city } = await reverseGeocode(point);
    return { country, city, point, source: 'gps', accuracyM: Math.round(pos.coords.accuracy) };
  } catch (e) {
    const country = countryFromTimezone();
    const msg = e instanceof GeolocationPositionError
      ? e.code === e.PERMISSION_DENIED ? 'Location permission was denied.' : 'Could not get a GPS fix.'
      : (e as Error).message;
    return { country, point: country ? centerOf(country) : undefined, source: 'timezone', error: msg };
  }
}

export const centerOf = (country: string): GeoPoint | undefined => {
  const c = COUNTRY_CENTER[country];
  return c ? { lat: c[0], lng: c[1] } : undefined;
};
