"use client";

import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapContent from "@/app/components/MapContent";

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

const TILE_SETTINGS: Record<string, { url: string; attribution: string }> = {
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

interface MapProps {
  properties: Property[];
  destinationCoords?: { lat: number; lng: number } | null;
  bookedPropertyIds?: string[];
}

export default function Map({ properties, destinationCoords, bookedPropertyIds }: MapProps) {
  const [mapStyle, setMapStyle] = useState("dark");

  return (
    <div className="relative h-full w-full">
      <select
        value={mapStyle}
        onChange={(e) => setMapStyle(e.target.value)}
        style={{ zIndex: 9999 }}
        className="absolute top-4 right-4 bg-white text-gray-800 px-3 py-2 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.5)] font-bold text-sm border border-gray-200 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="dark">Dark Mode</option>
        <option value="light">Light Mode</option>
        <option value="satellite">Satellite</option>
      </select>

      <MapContainer
        key={destinationCoords ? `${destinationCoords.lat}-${destinationCoords.lng}` : "default"}
        center={destinationCoords ? [destinationCoords.lat, destinationCoords.lng] : [23.2599, 77.4126]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          key={mapStyle}
          attribution={TILE_SETTINGS[mapStyle].attribution}
          url={TILE_SETTINGS[mapStyle].url}
        />
        <MapContent
          properties={properties}
          destinationCoords={destinationCoords}
          bookedPropertyIds={bookedPropertyIds}
        />
      </MapContainer>
    </div>
  );
}