"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, divIcon } from "leaflet";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

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

// Glowing Live Location Dot
const liveLocationIcon = divIcon({
  className: "live-location-icon",
  html: `
    <style>
      @keyframes pulse-ring {
        0% { transform: scale(0.8); opacity: 0.8; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    </style>
    <div style="position: relative; display: flex; justify-content: center; align-items: center; width: 24px; height: 24px;">
      <div style="position: absolute; width: 24px; height: 24px; background-color: #06b6d4; border-radius: 50%; animation: pulse-ring 2s infinite;"></div>
      <div style="position: relative; width: 14px; height: 14px; background-color: #0891b2; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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

function MapContent({ 
  properties, 
  destinationCoords, 
  liveLocation, 
  setRouteDistance 
}: { 
  properties: Property[]; 
  destinationCoords?: { lat: number; lng: number } | null; 
  liveLocation: [number, number] | null;
  setRouteDistance: (dist: string | null) => void;
}) {
  const map = useMap();
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [speedCameras, setSpeedCameras] = useState<[number, number][]>([]);
  const lastDestStr = useRef<string>("init");

  useEffect(() => {
    async function getRouteAndCameras() {
      // 1. Target Location is the Searched Destination (or Live Location if they haven't searched yet)
      const targetLocation = destinationCoords || (liveLocation ? { lat: liveLocation[0], lng: liveLocation[1] } : null);

      if (!targetLocation || properties.length === 0) return;

      // 2. Find the closest parking spot specifically to the TARGET LOCATION
      let closestSpot = properties[0];
      let shortestDistance = Infinity;

      properties.forEach((spot) => {
        const distance = getDistance(targetLocation.lat, targetLocation.lng, spot.lat || 23.2599, spot.lng || 77.4126);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          closestSpot = spot;
        }
      });

      const parkingLng = closestSpot.lng || 77.4126;
      const parkingLat = closestSpot.lat || 23.2599;

      // 3. Build the Multi-Stop Route String (A -> B -> C)
      let osrmCoords = "";

      if (liveLocation && destinationCoords) {
        // EXACT LOGIC YOU ASKED FOR: Live Location -> Typed Destination -> Nearest Parking
        osrmCoords = `${liveLocation[1]},${liveLocation[0]};${destinationCoords.lng},${destinationCoords.lat};${parkingLng},${parkingLat}`;
      } else if (liveLocation && !destinationCoords) {
        // Fallback 1: GPS is ON, but no search yet (Live Location -> Nearest Parking)
        osrmCoords = `${liveLocation[1]},${liveLocation[0]};${parkingLng},${parkingLat}`;
      } else if (!liveLocation && destinationCoords) {
        // Fallback 2: GPS is OFF, but user searched (Typed Destination -> Nearest Parking)
        osrmCoords = `${destinationCoords.lng},${destinationCoords.lat};${parkingLng},${parkingLat}`;
      } else {
        return; 
      }

      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${osrmCoords}?overview=full&geometries=geojson`);
        const data = await response.json();

        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          setRoutePath(coords);

          // Calculate and push TOTAL combined distance
          const distKm = data.routes[0].distance / 1000;
          setRouteDistance(distKm.toFixed(2));

          let numberOfCameras = Math.max(Math.min(Math.floor(distKm / 20), 15), distKm > 3 ? 1 : 0);
          
          if (numberOfCameras > 0 && coords.length > 0) {
            const spacing = Math.floor(coords.length / (numberOfCameras + 1));
            setSpeedCameras(Array.from({ length: numberOfCameras }, (_, i) => coords[(i + 1) * spacing]));
          } else {
            setSpeedCameras([]);
          }

          // Adjust map bounds to fit the whole route if the destination changed
          const currentDestStr = destinationCoords ? `${destinationCoords.lat}-${destinationCoords.lng}` : "default";
          if (lastDestStr.current !== currentDestStr) {
             // Smoothly pan to show the entire A->B->C route
             setTimeout(() => {
               map.fitBounds(coords, { padding: [50, 50], animate: true, duration: 1.5 });
             }, 300);
             lastDestStr.current = currentDestStr;
          }
        }
      } catch (error) {
        console.error("Route fetch failed:", error);
      }
    }

    getRouteAndCameras();
  }, [destinationCoords, properties, map, liveLocation, setRouteDistance]);

  return (
    <>
      {routePath.length > 0 && <Polyline positions={routePath} color="#06b6d4" weight={4} opacity={0.8} dashArray="10, 10" />}
      
      {/* Show Searched Destination (Red Pin) */}
      {destinationCoords && (
        <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={destinationIcon}>
          <Popup><div className="font-semibold text-gray-900">1. Stop here first (Destination)</div></Popup>
        </Marker>
      )}

      {/* Show Live Location Marker (Cyan Glowing Dot) */}
      {liveLocation && (
        <Marker position={liveLocation} icon={liveLocationIcon}>
          <Popup><div className="font-bold text-cyan-600">Start (Your Location)</div></Popup>
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
              <p className="text-xs text-gray-600">2. Park here afterwards</p>
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

// --- MAP EXPORT ---
export default function Map({ properties, destinationCoords }: { properties: Property[]; destinationCoords?: { lat: number; lng: number } | null; }) {
  const [mapStyle, setMapStyle] = useState("dark");
  const [mapInstance, setMapInstance] = useState<any>(null); 
  
  // States for Tracking
  const [liveLocation, setLiveLocation] = useState<[number, number] | null>(null);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);

  const tileSettings: Record<string, { url: string; attribution: string }> = {
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    },
  };

  // Turn on GPS Tracking
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLiveLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("User denied location or error occurred:", error.message);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div className="relative h-full w-full bg-black">
      
      {/* --- TOP LEFT: ZOOM CONTROLS --- */}
      <div style={{ zIndex: 9999 }} className="absolute top-4 left-4 flex flex-col gap-3">
        <button
          onClick={() => mapInstance?.zoomIn()}
          className="w-10 h-10 flex items-center justify-center bg-[#0a0f1c] text-cyan-400 border border-cyan-500 rounded-full text-2xl font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:bg-[#0f172a] hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all active:scale-95"
        >
          +
        </button>
        <button
          onClick={() => mapInstance?.zoomOut()}
          className="w-10 h-10 flex items-center justify-center bg-[#0a0f1c] text-cyan-400 border border-cyan-500 rounded-full text-3xl font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:bg-[#0f172a] hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all active:scale-95 pb-1"
        >
          -
        </button>
      </div>

      {/* --- TOP RIGHT: DISTANCE & THEME DROPDOWN --- */}
      <div style={{ zIndex: 9999 }} className="absolute top-4 right-4 flex flex-col gap-3 items-end">
        {/* Distance Box */}
        {routeDistance && (
          <div className="bg-[#0a0f1c] border border-cyan-500 rounded-lg px-6 py-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex flex-col items-center justify-center w-full animate-fade-in">
            <span className="text-[10px] text-cyan-500 uppercase tracking-widest font-bold">Total Route Distance</span>
            <span className="text-white font-black text-lg whitespace-nowrap">{routeDistance} <span className="text-xs text-gray-400 font-medium">km</span></span>
          </div>
        )}

        {/* Theme Dropdown */}
        <select
          value={mapStyle}
          onChange={(e) => setMapStyle(e.target.value)}
          className="bg-black text-cyan-400 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] font-bold text-sm border border-cyan-500 cursor-pointer outline-none focus:ring-2 focus:ring-cyan-300 transition-all hover:bg-[#0f172a] w-full"
        >
          <option value="dark"> Dark Mode</option>
          <option value="satellite">Satellite</option>
        </select>
      </div>

      <MapContainer
        ref={setMapInstance}
        key={destinationCoords ? `${destinationCoords.lat}-${destinationCoords.lng}` : "default"}
        center={destinationCoords ? [destinationCoords.lat, destinationCoords.lng] : [23.2599, 77.4126]}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false} 
        className="h-full w-full z-0"
      >
        <TileLayer
          key={mapStyle} 
          attribution={tileSettings[mapStyle].attribution}
          url={tileSettings[mapStyle].url}
        />
        <MapContent 
          properties={properties} 
          destinationCoords={destinationCoords} 
          liveLocation={liveLocation}
          setRouteDistance={setRouteDistance}
        />
      </MapContainer>
    </div>
  );
}