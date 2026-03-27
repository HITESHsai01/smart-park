"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, divIcon } from "leaflet";
import Link from "next/link";
import { useEffect, useState } from "react";

// --- CUSTOM ICONS ---
const parkingIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const destinationIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom "C" Icon for Speed Cameras
const cameraIcon = divIcon({
  className: "custom-camera-icon",
  html: `
    <div style="
      background-color: #ef4444; 
      color: white; 
      border: 2px solid white; 
      border-radius: 50%; 
      width: 28px; 
      height: 28px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: bold; 
      font-family: sans-serif;
      font-size: 16px; 
      box-shadow: 0 2px 5px rgba(0,0,0,0.5);
    ">
      C
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
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

// --- HELPER: CALCULATE DISTANCE ---
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- MAP CONTENT (Handles Routes, Cameras, & Markers) ---
function MapContent({
  properties,
  destinationCoords,
}: {
  properties: Property[];
  destinationCoords?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [speedCameras, setSpeedCameras] = useState<[number, number][]>([]);

  useEffect(() => {
    async function getRouteAndCameras() {
      if (!destinationCoords || properties.length === 0) return;

      // 1. Find closest parking spot
      let closestSpot = properties[0];
      let shortestDistance = Infinity;

      properties.forEach((spot) => {
        const spotLat = spot.lat || 23.2599;
        const spotLng = spot.lng || 77.4126;
        const distance = getDistance(destinationCoords.lat, destinationCoords.lng, spotLat, spotLng);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          closestSpot = spot;
        }
      });

      // 2. Fetch driving route from OSRM
      const startLng = destinationCoords.lng;
      const startLat = destinationCoords.lat;
      const endLng = closestSpot.lng || 77.4126;
      const endLat = closestSpot.lat || 23.2599;

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

      try {
        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          setRoutePath(coords);

          // 3. Place Speed Cameras along the route
          if (coords.length > 20) {
            const cam1 = coords[Math.floor(coords.length * 0.3)]; // 30% of the way
            const cam2 = coords[Math.floor(coords.length * 0.7)]; // 70% of the way
            setSpeedCameras([cam1, cam2]);
          } else if (coords.length > 5) {
            const cam1 = coords[Math.floor(coords.length * 0.5)]; // 50% of the way
            setSpeedCameras([cam1]);
          }

          // Auto-zoom map to fit route
          map.fitBounds([
            [startLat, startLng],
            [endLat, endLng]
          ], { padding: [50, 50] });
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
      }
    }

    getRouteAndCameras();
  }, [destinationCoords, properties, map]);

  return (
    <>
      {/* 1. Draw Route Line (Cyan) */}
      {routePath.length > 0 && (
        <Polyline positions={routePath} color="#06b6d4" weight={4} opacity={0.8} dashArray="10, 10" />
      )}

      {/* 2. Draw Destination Marker */}
      {destinationCoords && (
        <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={destinationIcon}>
          <Popup><div className="font-semibold text-gray-900">Your Destination</div></Popup>
        </Marker>
      )}

      {/* 3. Draw Speed Cameras */}
      {speedCameras.map((cam, index) => (
        <Marker key={`cam-${index}`} position={cam} icon={cameraIcon}>
          <Popup>
            <div className="text-center p-1">
              <span className="text-2xl">📸</span>
              <p className="font-bold text-red-600 mt-1">Speed Camera</p>
              <p className="text-xs text-gray-600">Max limit: 40 km/h</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* 4. Draw Parking Lots (Using your exact provided popup layout) */}
      {properties.map((property) => {
        const lat = property.lat || 23.2599 + (Math.random() - 0.5) * 0.05;
        const lng = property.lng || 77.4126 + (Math.random() - 0.5) * 0.05;

        return (
          <Marker key={property.id} position={[lat, lng]} icon={parkingIcon}>
            <Popup>
              <div className="p-1 space-y-1">
                <h3 className="font-bold text-base text-gray-900">
                  {property.name}
                </h3>
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
      {/* Dark Theme Base Map */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <MapContent
        properties={properties}
        destinationCoords={destinationCoords}
      />
    </MapContainer>
  );
}