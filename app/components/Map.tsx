"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import Link from "next/link";
import { useEffect, useState } from "react";

// --- CUSTOM ICONS ---
// Standard blue marker for parking spots
const parkingIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Red marker for the user's destination
const destinationIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// --- TYPES ---
interface Property {
  id: string;
  name: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  baseRate: number;
  slots: any[];
}

// --- HELPER: CALCULATE DISTANCE (Haversine Formula) ---
// Finds the straight-line distance between two coordinates to find the closest parking spot
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// --- MAP CONTENT COMPONENT (Handles Routes & Markers) ---
function MapContent({
  properties,
  destinationCoords,
}: {
  properties: Property[];
  destinationCoords?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  useEffect(() => {
    async function getRoute() {
      if (!destinationCoords || properties.length === 0) return;

      // 1. Find the closest parking spot to the destination
      let closestSpot = properties[0];
      let shortestDistance = Infinity;

      properties.forEach((spot) => {
        // Fallback coordinates if Neon DB is missing them
        const spotLat = spot.lat || 23.2599; 
        const spotLng = spot.lng || 77.4126;

        const distance = getDistance(
          destinationCoords.lat,
          destinationCoords.lng,
          spotLat,
          spotLng
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;
          closestSpot = spot;
        }
      });

      // 2. Fetch the driving route from OSRM
      const startLng = destinationCoords.lng;
      const startLat = destinationCoords.lat;
      const endLng = closestSpot.lng || 77.4126;
      const endLat = closestSpot.lat || 23.2599;

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

      try {
        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          // OSRM returns [lng, lat], Leaflet needs [lat, lng]
          const coords = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          setRoutePath(coords);
          
          // Automatically zoom the map to fit both the destination and the parking spot
          map.fitBounds([
            [startLat, startLng],
            [endLat, endLng]
          ], { padding: [50, 50] });
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
      }
    }

    getRoute();
  }, [destinationCoords, properties, map]);

  return (
    <>
      {/* Draw the Route Line (Cyan to match your theme) */}
      {routePath.length > 0 && (
        <Polyline
          positions={routePath}
          color="#06b6d4"
          weight={4}
          opacity={0.8}
          dashArray="10, 10"
        />
      )}

      {/* Draw Destination Marker */}
      {destinationCoords && (
        <Marker
          position={[destinationCoords.lat, destinationCoords.lng]}
          icon={destinationIcon}
        >
          <Popup>
            <div className="font-semibold text-gray-900">Your Destination</div>
          </Popup>
        </Marker>
      )}

      {/* Draw All Parking Spot Markers */}
      {properties.map((property) => {
        const lat = property.lat || 23.2599 + (Math.random() - 0.5) * 0.05;
        const lng = property.lng || 77.4126 + (Math.random() - 0.5) * 0.05;

        return (
          <Marker key={property.id} position={[lat, lng]} icon={parkingIcon}>
            <Popup>
              <div className="p-1 space-y-1">
                <h3 className="font-bold text-base text-gray-900">{property.name}</h3>
                <p className="text-xs text-gray-600">{property.address}</p>
                <div className="flex justify-between items-center pt-2 gap-4">
                  <span className="font-semibold text-blue-600">
                    ₹{property.baseRate}/hr
                  </span>
                  <Link
                    href={`/booking/${property.id}`}
                    className="px-3 py-1 bg-black text-white text-xs rounded-full hover:bg-gray-800 transition"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

// --- MAIN MAP EXPORT ---
export default function Map({
  properties,
  destinationCoords,
}: {
  properties: Property[];
  destinationCoords?: { lat: number; lng: number } | null;
}) {
  return (
    <MapContainer
      key={destinationCoords ? `${destinationCoords.lat}-${destinationCoords.lng}` : "default"}
      center={destinationCoords ? [destinationCoords.lat, destinationCoords.lng] : [23.2599, 77.4126]}
      zoom={13}
      scrollWheelZoom={true}
      className="h-full w-full z-0"
    >
      {/* Using CartoDB Dark Matter for an instant Black/Dark UI map without API keys */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* If you want to try Jawg Maps again later, uncomment the line below and replace YOUR_TOKEN.
        Ensure there are NO curly brackets {} around your actual token string!
      */}
      {/* <TileLayer url="https://{s}.tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=YOUR_TOKEN" /> */}

      <MapContent properties={properties} destinationCoords={destinationCoords} />
    </MapContainer>
  );
}