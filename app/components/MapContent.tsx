"use client";

import { Marker, Popup, Polyline } from "react-leaflet";
import Link from "next/link";
import { useCallback } from "react";
import { Navigation, Crosshair, MapPin, Route, RotateCcw } from "lucide-react";
import { useMapState } from "../hooks/useMapState";
import {
  parkingIcon,
  parkingRouteIcon,
  parkingBookedIcon,
  destinationIcon,
  cameraIcon,
  liveLocationIcon,
} from "../constants/mapIcons";

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

interface MapContentProps {
  properties: Property[];
  destinationCoords?: { lat: number; lng: number } | null;
  onRouteUpdate?: (distance: number, duration: number) => void;
  bookedPropertyIds?: string[];
}

export default function MapContent({
  properties,
  destinationCoords,
  onRouteUpdate,
  bookedPropertyIds = [],
}: MapContentProps) {
  const {
    liveLocation,
    isLocating,
    routePath,
    leg1Path,
    leg2Path,
    speedCameras,
    selectedParking,
    routeDistance,
    routeDuration,
    calculateMultiLegRoute,
    clearSavedRoute,
  } = useMapState(destinationCoords, onRouteUpdate);

  const isRouteToParkingActive = selectedParking !== null;

  const handleBooking = useCallback((propertyId: string) => `/booking/${propertyId}`, []);

  return (
    <>
      {/* Live Location */}
      {liveLocation && (
        <Marker position={[liveLocation.lat, liveLocation.lng]} icon={liveLocationIcon}>
          <Popup>
            <div className="p-1">
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <Crosshair size={14} className="text-emerald-500" />
                Your Location
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Route Polylines */}
      {leg1Path.length > 0 && (
        <Polyline positions={leg1Path} color="#06b6d4" weight={5} opacity={0.9} />
      )}
      {leg2Path.length > 0 && (
        <Polyline positions={leg2Path} color="#3b82f6" weight={5} opacity={0.9} dashArray="10, 10" />
      )}
      {!isRouteToParkingActive && routePath.length > 0 && (
        <Polyline positions={routePath} color="#06b6d4" weight={5} opacity={0.9} />
      )}

      {/* Destination Marker */}
      {destinationCoords && (
        <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={destinationIcon}>
          <Popup>
            <div className="p-2">
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                Your Destination
              </p>
              {routeDistance > 0 && !isRouteToParkingActive && (
                <div className="mt-2 text-sm text-gray-600">
                  <p><span className="font-medium">Distance:</span> {routeDistance.toFixed(1)} km</p>
                  <p><span className="font-medium">Duration:</span> {Math.round(routeDuration)} min</p>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Speed Cameras */}
      {speedCameras.map((cam, i) => (
        <Marker key={`cam-${i}`} position={cam} icon={cameraIcon}>
          <Popup>
            <div className="text-center p-1">
              <span className="text-2xl">📸</span>
              <p className="font-bold text-red-600 mt-1">Speed Camera</p>
              <p className="text-xs text-gray-600">Max limit: 40 km/h</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Parking Markers */}
      {properties.map((property) => {
        const isSelected = selectedParking?.id === property.id;
        const isBooked = bookedPropertyIds?.includes(property.id);
        const icon = isBooked ? parkingBookedIcon : isSelected ? parkingRouteIcon : parkingIcon;

        return (
          <Marker
            key={property.id}
            position={[
              property.lat || 23.2599 + (Math.random() - 0.5) * 0.05,
              property.lng || 77.4126 + (Math.random() - 0.5) * 0.05,
            ]}
            icon={icon}
          >
            <Popup>
              <div className="p-2 space-y-2 min-w-[220px]">
                <div>
                  <h3 className="font-bold text-base text-gray-900">{property.name}</h3>
                  <p className="text-xs text-gray-600">{property.address}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-blue-600 text-lg">₹{property.baseRate}/hr</span>
                  <span className="text-xs text-gray-500">
                    {property.slots?.filter((s: any) => s.status === "FREE").length || 0} free
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={() => calculateMultiLegRoute(property)}
                    disabled={!liveLocation || !destinationCoords}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isSelected
                        ? "bg-yellow-500 text-white ring-2 ring-yellow-400 ring-offset-1"
                        : "bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    }`}
                  >
                    <Route size={16} />
                    {isSelected ? "Route Selected" : "Route Here"}
                  </button>
                  {(!liveLocation || !destinationCoords) && (
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {isLocating ? "Getting location..." : "Search destination first"}
                    </p>
                  )}
                </div>
                {isBooked ? (
                  <div className="block w-full text-center px-4 py-2 bg-emerald-100 border-2 border-emerald-500 text-emerald-700 text-sm font-bold rounded-lg cursor-default">
                    Successfully Booked!
                  </div>
                ) : (
                  <Link
                    href={handleBooking(property.id)}
                    className="block w-full text-center px-4 py-2 bg-white border-2 border-gray-900 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Book This Spot
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Route Info Box */}
      {routeDistance > 0 && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-200 dark:border-neutral-800 p-4 max-w-[300px]">
          <div className="flex items-center gap-2 mb-3">
            <Navigation size={18} className={isRouteToParkingActive ? "text-emerald-600" : "text-cyan-600"} />
            <span className="font-semibold text-gray-900 dark:text-white">
              {isRouteToParkingActive ? "3-Point Route Active" : "Route to Destination"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <p className="text-xs text-gray-500">Your Location → Destination</p>
            </div>
            {isRouteToParkingActive && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <p className="text-xs text-gray-500">Destination → Parking</p>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 dark:border-neutral-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Distance:</span>
                <span className="font-medium text-gray-900 dark:text-white">{routeDistance.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">Est. Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round(routeDuration)} min</span>
              </div>
            </div>
            {selectedParking && (
              <div className="pt-2 border-t border-gray-200 dark:border-neutral-700">
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <MapPin size={14} />
                  <span className="font-medium truncate">{selectedParking.name}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Route saved. Will persist after booking.</p>
              </div>
            )}
          </div>
          {selectedParking && (
            <button
              onClick={clearSavedRoute}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition border border-dashed border-gray-300 dark:border-neutral-700 rounded-lg hover:border-red-300"
            >
              <RotateCcw size={14} />
              Clear Route
            </button>
          )}
        </div>
      )}
    </>
  );
}