"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, divIcon } from "leaflet";
import Link from "next/link";
import { useEffect, useState } from "react";

// --- CUSTOM ICONS ---
const parkingIcon = divIcon({
  className: "custom-parking-icon",
  html: `
    <div style="background-color: #3b82f6; color: white; border: 2px solid white; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
      P
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const destinationIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const cameraIcon = divIcon({
  className: "custom-camera-icon",
  html: `
    <div style="background-color: #ef4444; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
      C
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

interface Property {
  id: string;
  name: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  baseRate: number;
  ownerId?: string; 
  slots?: any[];
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function MapContent({ properties, destinationCoords }: { properties: Property[]; destinationCoords?: { lat: number; lng: number } | null; }) {
  const map = useMap();
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [speedCameras, setSpeedCameras] = useState<[number, number][]>([]);

  useEffect(() => {
    async function getRouteAndCameras() {
      if (!destinationCoords || properties.length === 0) return;

      let closestSpot = properties[0];
      let shortestDistance = Infinity;

      properties.forEach((spot) => {
        const distance = getDistance(destinationCoords.lat, destinationCoords.lng, spot.lat || 23.2599, spot.lng || 77.4126);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          closestSpot = spot;
        }
      });

      const { lng: startLng, lat: startLat } = destinationCoords;
      const endLng = closestSpot.lng || 77.4126;
      const endLat = closestSpot.lat || 23.2599;

      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`);
        const data = await response.json();

        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          setRoutePath(coords);

          let numberOfCameras = Math.max(Math.min(Math.floor((data.routes[0].distance / 1000) / 20), 15), data.routes[0].distance / 1000 > 3 ? 1 : 0);
          
          if (numberOfCameras > 0 && coords.length > 0) {
            const spacing = Math.floor(coords.length / (numberOfCameras + 1));
            setSpeedCameras(Array.from({ length: numberOfCameras }, (_, i) => coords[(i + 1) * spacing]));
          } else {
            setSpeedCameras([]);
          }

          map.fitBounds([[startLat, startLng], [endLat, endLng]], { padding: [50, 50] });
        }
      } catch (error) {
        console.error("Route fetch failed:", error);
      }
    }

    getRouteAndCameras();
  }, [destinationCoords, properties, map]);

  return (
    <>
      {routePath.length > 0 && <Polyline positions={routePath} color="#06b6d4" weight={4} opacity={0.8} dashArray="10, 10" />}
      
      {destinationCoords && (
        <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={destinationIcon}>
          <Popup><div className="font-semibold text-gray-900">Your Destination</div></Popup>
        </Marker>
      )}

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

      {properties.map((property) => (
        <Marker key={property.id} position={[property.lat || 23.2599 + (Math.random() - 0.5) * 0.05, property.lng || 77.4126 + (Math.random() - 0.5) * 0.05]} icon={parkingIcon}>
          <Popup>
            <div className="p-1 space-y-1">
              <h3 className="font-bold text-base text-gray-900">{property.name}</h3>
              <p className="text-xs text-gray-600">{property.address}</p>
              <div className="flex justify-between items-center pt-2 gap-4">
                <span className="font-semibold text-blue-600">₹{property.baseRate}/hr</span>
                <Link href={`/booking/${property.id}`} className="px-3 py-1 bg-black text-white text-xs rounded-full hover:bg-gray-800 transition">Book</Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// --- MAP EXPORT WITH MULTIPLE THEMES ---
export default function Map({ properties, destinationCoords }: { properties: Property[]; destinationCoords?: { lat: number; lng: number } | null; }) {
  // 1. State now holds the active theme name
  const [mapStyle, setMapStyle] = useState("dark");

  // 2. Dictionary of map tile URLs and their respective attributions
  const tileSettings: Record<string, { url: string; attribution: string }> = {
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
    },
    
    light: {
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    },
  };

  return (
    <div className="relative h-full w-full">
      {/* 3. The Dropdown Select Menu */}
      <select
        value={mapStyle}
        onChange={(e) => setMapStyle(e.target.value)}
        style={{ zIndex: 9999 }}
        className="absolute top-4 right-4 bg-white text-gray-800 px-3 py-2 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.5)] font-bold text-sm border border-gray-200 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="dark"> Dark Mode</option>
        
        <option value="light"> Light Mode</option>
        <option value="satellite"> Satellite</option>
      </select>

      <MapContainer
        key={destinationCoords ? `${destinationCoords.lat}-${destinationCoords.lng}` : "default"}
        center={destinationCoords ? [destinationCoords.lat, destinationCoords.lng] : [23.2599, 77.4126]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        {/* 4. Dynamically pass the URL and Attribution based on selection */}
        {/* We use key={mapStyle} to force Leaflet to immediately re-draw the tiles when changed */}
        <TileLayer
          key={mapStyle} 
          attribution={tileSettings[mapStyle].attribution}
          url={tileSettings[mapStyle].url}
        />
        <MapContent properties={properties} destinationCoords={destinationCoords} />
      </MapContainer>
    </div>
  );
}