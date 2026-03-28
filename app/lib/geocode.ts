export async function getCoordinates(place: string) {
  try {
    const isServer = typeof window === 'undefined';
    
    // If on the client, use our own API to bypass CORS/User-Agent restrictions
    if (!isServer) {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(place)}`);
        if (!res.ok) return null;
        return await res.json();
    }

    // On the server, securely hit Nominatim with User-Agent
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`,
      {
        headers: {
          "User-Agent": "SmartPark/1.0 (contact@smartpark.local)"
        }
      }
    );

    const data = await res.json();

    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}