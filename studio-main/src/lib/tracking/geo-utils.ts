// Haversine distance in km
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Avg city bike speed: 22 km/h, overhead per stop: 3 min
export function estimateETA(
  volunteerLat: number,
  volunteerLng: number,
  destLat: number,
  destLng: number,
  trafficFactor = 1.2 // 1.0 = clear, 1.5 = heavy traffic
): { minutes: number; label: string } {
  const distKm = haversineKm(volunteerLat, volunteerLng, destLat, destLng);
  const speedKmh = 22;
  const rawMins = (distKm / speedKmh) * 60;
  const minutes = Math.max(1, Math.round(rawMins * trafficFactor + 3));
  const label =
    minutes < 2
      ? 'Arriving now'
      : minutes < 60
      ? `${minutes} min`
      : `${Math.round(minutes / 60)}h ${minutes % 60}m`;
  return { minutes, label };
}

// Sanity check: reject jumps > 150 km (impossible in < 5s)
export function isSaneMovement(
  prevLat: number,
  prevLng: number,
  newLat: number,
  newLng: number,
  elapsedSeconds: number
): boolean {
  const dist = haversineKm(prevLat, prevLng, newLat, newLng);
  const maxReasonableKmps = 0.1; // ~360 km/h, absolute max for bike
  return dist / elapsedSeconds < maxReasonableKmps;
}

// Interpolate between two positions (t = 0..1)
export function lerpPosition(
  from: [number, number],
  to: [number, number],
  t: number
): [number, number] {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

// Build Google Maps direction URL
export function buildGoogleMapsUrl(
  destLat: number,
  destLng: number,
  originLat?: number,
  originLng?: number
): string {
  const base = 'https://www.google.com/maps/dir/?api=1';
  const dest = `&destination=${destLat},${destLng}`;
  const origin =
    originLat && originLng ? `&origin=${originLat},${originLng}` : '';
  return `${base}${origin}${dest}&travelmode=driving`;
}

// Decode Google Maps polyline into [lat,lng] array
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0,
    lat = 0,
    lng = 0;
  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}
