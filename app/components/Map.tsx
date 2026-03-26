"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import Link from "next/link";

const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
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

export default function Map({ properties }: { properties: Property[] }) {
  // Default to a central location (e.g., New York or generic) if no properties
  // Default to Madhya Pradesh, India (centered around Bhopal)
  const defaultCenter: [number, number] = [23.2599, 77.4126]; 

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={13} 
      scrollWheelZoom={true} 
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
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
    </MapContainer>
  );
}
