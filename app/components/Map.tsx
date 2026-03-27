"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import Link from "next/link";

const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Property {
  id: string;
  name: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  baseRate: number;
  slots: any[];
}

function MapContent({
  properties,
  destinationCoords,
}: {
  properties: Property[];
  destinationCoords?: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  return (
    <>
      {/* ✅ ADD THIS BLOCK HERE */}
      {destinationCoords && (
        <Marker
          position={[destinationCoords.lat, destinationCoords.lng]}
          icon={customIcon}
        >
          <Popup>Destination</Popup>
        </Marker>
      )}
      {properties.map((property) => {
        // Mock coordinates if missing (focusing around Bhopal, MP)
        const lat = property.lat || 23.2599 + (Math.random() - 0.5) * 0.1;
        const lng = property.lng || 77.4126 + (Math.random() - 0.5) * 0.1;

        return (
          <Marker key={property.id} position={[lat, lng]} icon={customIcon}>
            <Popup>
              <div className="p-3 space-y-2 bg-zinc-900 text-white rounded-lg">
                <h3 className="font-bold text-lg">{property.name}</h3>
                <p className="text-sm text-gray-600">{property.address}</p>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-blue-600">
                    ₹{property.baseRate}/hr
                  </span>

                  <Link
                    href={`/booking/${property.id}`}
                    className="px-3 py-1 bg-black text-white text-xs rounded-full hover:bg-gray-800"
                  >
                    Book Now
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

export default function Map({
  properties,
  destinationCoords,
}: {
  properties: Property[];
  destinationCoords?: { lat: number; lng: number } | null;
}) {
  // Default to a central location (e.g., New York or generic) if no properties
  // Default to Madhya Pradesh, India (centered around Bhopal)
  const defaultCenter: [number, number] = [23.2599, 77.4126];

  return (
    <MapContainer
      key={
        destinationCoords
          ? `${destinationCoords.lat}-${destinationCoords.lng}`
          : "default"
      }
      center={
        destinationCoords
          ? [destinationCoords.lat, destinationCoords.lng]
          : [23.2599, 77.4126]
      }
      zoom={13}
      scrollWheelZoom={true}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapContent
        properties={properties}
        destinationCoords={destinationCoords}
      />
    </MapContainer>
  );
}
