"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default markers in react-leaflet with Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

export default function Map({ properties }: any) {
  const center: [number, number] =
    properties.length > 0
      ? [properties[0].lat, properties[0].lng]
      : [23.2599, 77.4126];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="h-full w-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {properties.map((p: any) => {
        if (!p.lat || !p.lng) return null;

        return (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <div>
                <h3>{p.name}</h3>
                <p>{p.address}</p>
                <p>₹{p.baseRate}/hr</p>
                <p>
                  {p.availableSlots > 0
                    ? `${p.availableSlots} slots`
                    : "Full"}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}