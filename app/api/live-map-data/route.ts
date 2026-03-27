import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  // Overpass QL Query:
  // 1. Searches for parking (nodes, ways, relations) within 2000 meters
  // 2. Searches for speed cameras within 5000 meters
  // 3. 'out center' ensures we get a single lat/lng point even for large parking polygons
  const overpassQuery = `
    [out:json][timeout:25];
    (
      nwr["amenity"="parking"](around:2000, ${lat}, ${lng});
      node["highway"="speed_camera"](around:5000, ${lat}, ${lng});
    );
    out center;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery,
    });

    const data = await response.json();

    // Arrays to hold our separated data
    const parkingLots: any[] = [];
    const speedCameras: [number, number][] = [];

    // Parse the OpenStreetMap response
    data.elements.forEach((element: any) => {
      // Determine coordinates (polygons use 'center', nodes use 'lat'/'lon')
      const elementLat = element.center?.lat || element.lat;
      const elementLng = element.center?.lon || element.lon;

      if (element.tags?.amenity === "parking") {
        parkingLots.push({
          id: `osm_${element.id}`,
          name: element.tags.name || "Public Parking",
          address: "Live OSM Data",
          baseRate: 50, // Default mock price since OSM doesn't always have live pricing
          lat: elementLat,
          lng: elementLng,
        });
      }

      if (element.tags?.highway === "speed_camera") {
        speedCameras.push([elementLat, elementLng]);
      }
    });

    return NextResponse.json({ parkingLots, speedCameras });

  } catch (error) {
    console.error("Overpass API Error:", error);
    return NextResponse.json({ error: "Failed to fetch map data" }, { status: 500 });
  }
}