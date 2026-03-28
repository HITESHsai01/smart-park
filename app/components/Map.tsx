"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, divIcon } from "leaflet";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Navigation, Crosshair, MapPin, Route, RotateCcw } from "lucide-react";

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

const parkingRouteIcon = divIcon({
  className: "custom-parking-icon-route",
  html: `
    <div style="background-color: #eab308; color: white; border: 3px solid white; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif; font-size: 16px; box-shadow: 0 4px 12px rgba(234,179,8,0.5);">
      P
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const parkingBookedIcon = divIcon({
  className: "custom-parking-icon-booked",
  html: `
    <div style="background-color: #10b981; color: white; border: 3px solid white; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif; font-size: 16px; box-shadow: 0 0 15px rgba(16,185,129,0.8); animation: blink 1s infinite;">
      P
    </div>
    <style>
      @keyframes blink {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); box-shadow: 0 0 25px rgba(16,185,129,1); }
      }
    </style>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const destinationIcon = divIcon({
  className: "custom-dest-icon",
  html: `
    <div style="background-color: #ef4444; color: white; border: 3px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(239,68,68,0.5);">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
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

const liveLocationIcon = divIcon({
  className: "custom-live-location",
  html: `
    <div style="position: relative;">
      <div style="background-color: #10b981; color: white; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(16,185,129,0.6);"></div>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; border: 2px solid rgba(16,185,129,0.4); border-radius: 50%; animation: pulse 2s infinite;"></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
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

interface SavedRouteData {
  selectedParking: Property;
  routePath: [number, number][];
  routeDistance: number;
  routeDuration: number;
  speedCameras: [number, number][];
  timestamp: number;
}

interface MapContentProps {
  properties: Property[];
  destinationCoords?: { lat: number; lng: number } | null;
  onRouteUpdate?: (distance: number, duration: number) => void;
  bookedPropertyIds?: string[];
}

function MapContent({ properties, destinationCoords, onRouteUpdate, bookedPropertyIds = [] }: MapContentProps) {
  const map = useMap();
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [leg1Path, setLeg1Path] = useState<[number, number][]>([]); // Live -> Destination
  const [leg2Path, setLeg2Path] = useState<[number, number][]>([]);  // Destination -> Parking
  const [speedCameras, setSpeedCameras] = useState<[number, number][]>([]);
  const [selectedParking, setSelectedParking] = useState<Property | null>(null);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routeDuration, setRouteDuration] = useState<number>(0);
  const [isLocating, setIsLocating] = useState(true);
  const [isRestoringRoute, setIsRestoringRoute] = useState(false);

  // Calculate leg paths for visual distinction
  const calculateLegPaths = useCallback((fullPath: [number, number][], parking: Property) => {
    if (!destinationCoords || !parking.lat || !parking.lng) return;

    // Find the point closest to destination to split the path
    let minDist = Infinity;
    let splitIndex = 0;

    fullPath.forEach((coord, index) => {
      const dist = Math.sqrt(
        Math.pow(coord[0] - destinationCoords.lat, 2) +
        Math.pow(coord[1] - destinationCoords.lng, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        splitIndex = index;
      }
    });

    setLeg1Path(fullPath.slice(0, splitIndex + 1));
    setLeg2Path(fullPath.slice(splitIndex));
    console.log("destination: ", destinationCoords);
  }, [destinationCoords]);

  // Load saved route from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedRoute = localStorage.getItem('smartpark_selected_route');
    const savedContext = localStorage.getItem('smartpark_route_context');

    // Need destination to restore route - check if available in props or localStorage
    let effectiveDestCoords = destinationCoords;
    if (!effectiveDestCoords && savedContext) {
      try {
        const context = JSON.parse(savedContext);
        if (context.destinationCoords && Date.now() - context.timestamp < 24 * 60 * 60 * 1000) {
          effectiveDestCoords = context.destinationCoords;
          console.log("Using destination from localStorage:", effectiveDestCoords);
        }
      } catch (e) {
        console.error("Failed to parse context:", e);
      }
    }

    if (savedRoute && effectiveDestCoords) {
      try {
        const parsed: SavedRouteData = JSON.parse(savedRoute);
        // Restore if less than 24 hours old
        const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;

        if (isRecent) {
          setIsRestoringRoute(true);
          setSelectedParking(parsed.selectedParking);
          setRoutePath(parsed.routePath);
          setRouteDistance(parsed.routeDistance);
          setRouteDuration(parsed.routeDuration);
          setSpeedCameras(parsed.speedCameras);

          // Recalculate leg paths
          calculateLegPaths(parsed.routePath, parsed.selectedParking);

          // Notify parent
          if (onRouteUpdate) {
            onRouteUpdate(parsed.routeDistance, parsed.routeDuration);
          }

          // Fit bounds after a short delay
          setTimeout(() => {
            if (parsed.routePath.length > 0) {
              const bounds = parsed.routePath.map(coord => [coord[0], coord[1]] as [number, number]);
              map.fitBounds(bounds, { padding: [100, 100] });
            }
            setIsRestoringRoute(false);
          }, 500);
        } else {
          // Clear old route
          localStorage.removeItem('smartpark_selected_route');
        }
      } catch (e) {
        console.error("Failed to restore route:", e);
        localStorage.removeItem('smartpark_selected_route');
      }
    }
  }, [map, destinationCoords, onRouteUpdate, calculateLegPaths]);

  // Get live location on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLiveLocation(coords);
        setIsLocating(false);

        // Only fly to location if not restoring a route
        if (!isRestoringRoute) {
          map.flyTo([coords.lat, coords.lng], 14, { duration: 1.5 });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        setLiveLocation({ lat: 23.2599, lng: 77.4126 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );

    // Watch position for live updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLiveLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error("Watch position error:", error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, isRestoringRoute]);

  // Calculate initial route: Live Location -> Destination
  useEffect(() => {
    async function calculateInitialRoute() {
      if (!liveLocation || !destinationCoords) return;

      // Don't calculate if we have a saved route being restored
      if (isRestoringRoute) return;

      // Avoid recalculating and recentering the map constantly on GPS updates
      if (routePath.length > 0) return;

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${liveLocation.lng},${liveLocation.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          setRoutePath(coords);
          setLeg1Path(coords);
          setLeg2Path([]);
          setRouteDistance(data.routes[0].distance / 1000);
          setRouteDuration(data.routes[0].duration / 60);

          if (onRouteUpdate) {
            onRouteUpdate(data.routes[0].distance / 1000, data.routes[0].duration / 60);
          }

          // Generate speed cameras
          let numberOfCameras = Math.max(Math.min(Math.floor((data.routes[0].distance / 1000) / 20), 15), data.routes[0].distance / 1000 > 3 ? 1 : 0);
          if (numberOfCameras > 0 && coords.length > 0) {
            const spacing = Math.floor(coords.length / (numberOfCameras + 1));
            setSpeedCameras(Array.from({ length: numberOfCameras }, (_, i) => coords[(i + 1) * spacing]));
          } else {
            setSpeedCameras([]);
          }

          map.fitBounds([[liveLocation.lat, liveLocation.lng], [destinationCoords.lat, destinationCoords.lng]], { padding: [80, 80] });
        }
      } catch (error) {
        console.error("Route fetch failed:", error);
      }
    }

    calculateInitialRoute();
  }, [liveLocation, destinationCoords, map, onRouteUpdate, isRestoringRoute, routePath.length]);

  // Save route to localStorage
  const saveRoute = useCallback((parking: Property, path: [number, number][], distance: number, duration: number, cameras: [number, number][]) => {
    if (!destinationCoords) return;

    const routeData: SavedRouteData = {
      selectedParking: parking,
      routePath: path,
      routeDistance: distance,
      routeDuration: duration,
      speedCameras: cameras,
      timestamp: Date.now()
    };
    localStorage.setItem('smartpark_selected_route', JSON.stringify(routeData));

    // Also save destination context separately
    localStorage.setItem('smartpark_route_context', JSON.stringify({
      destinationCoords: destinationCoords,
      destinationAddress: '', // Will be set by map page
      timestamp: Date.now()
    }));
  }, [destinationCoords]);

  // Calculate 3-point route: Live Location -> Destination -> Parking
  const calculateMultiLegRoute = useCallback(async (parkingSpot: Property) => {
    if (!liveLocation || !destinationCoords || !parkingSpot.lat || !parkingSpot.lng) return;

    setSelectedParking(parkingSpot);

    try {
      // Fetch route: Live -> Destination -> Parking
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${liveLocation.lng},${liveLocation.lat};${destinationCoords.lng},${destinationCoords.lat};${parkingSpot.lng},${parkingSpot.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes?.[0]) {
        const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        const distance = data.routes[0].distance / 1000;
        const duration = data.routes[0].duration / 60;

        setRoutePath(coords);
        setRouteDistance(distance);
        setRouteDuration(duration);

        // Calculate visual leg paths
        calculateLegPaths(coords, parkingSpot);

        if (onRouteUpdate) {
          onRouteUpdate(distance, duration);
        }

        // Generate speed cameras
        let numberOfCameras = Math.max(Math.min(Math.floor((data.routes[0].distance / 1000) / 20), 15), data.routes[0].distance / 1000 > 3 ? 1 : 0);
        const cameras: [number, number][] = [];
        if (numberOfCameras > 0 && coords.length > 0) {
          const spacing = Math.floor(coords.length / (numberOfCameras + 1));
          for (let i = 0; i < numberOfCameras; i++) {
            cameras.push(coords[(i + 1) * spacing]);
          }
        }
        setSpeedCameras(cameras);

        // Save to localStorage for persistence
        saveRoute(parkingSpot, coords, distance, duration, cameras);

        // Fit bounds
        const bounds: [number, number][] = [
          [liveLocation.lat, liveLocation.lng],
          [destinationCoords.lat, destinationCoords.lng],
          [parkingSpot.lat, parkingSpot.lng],
        ];
        map.fitBounds(bounds, { padding: [100, 100] });
      }
    } catch (error) {
      console.error("Multi-leg route fetch failed:", error);
    }
  }, [liveLocation, destinationCoords, map, onRouteUpdate, calculateLegPaths, saveRoute]);

  const clearSavedRoute = useCallback(() => {
    setSelectedParking(null);
    setLeg1Path([]);
    setLeg2Path([]);
    localStorage.removeItem('smartpark_selected_route');

    // Reset to initial route
    if (liveLocation && destinationCoords) {
      fetch(`https://router.project-osrm.org/route/v1/driving/${liveLocation.lng},${liveLocation.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes?.[0]) {
            const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
            setRoutePath(coords);
            setLeg1Path(coords);
            setRouteDistance(data.routes[0].distance / 1000);
            setRouteDuration(data.routes[0].duration / 60);
            if (onRouteUpdate) {
              onRouteUpdate(data.routes[0].distance / 1000, data.routes[0].duration / 60);
            }
            map.fitBounds([[liveLocation.lat, liveLocation.lng], [destinationCoords.lat, destinationCoords.lng]], { padding: [80, 80] });
          }
        });
    }
  }, [liveLocation, destinationCoords, map, onRouteUpdate]);

  const isRouteToParkingActive = selectedParking !== null;

  // Notify booking page of selected parking
  const handleBooking = useCallback((propertyId: string) => {
    // The route remains saved in localStorage
    // It will be available when user returns to map
    return `/booking/${propertyId}`;
  }, []);

  return (
    <>
      {/* Live Location Marker */}
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
        <Polyline
          positions={leg1Path}
          color="#06b6d4"
          weight={5}
          opacity={0.9}
        />
      )}
      {leg2Path.length > 0 && (
        <Polyline
          positions={leg2Path}
          color="#3b82f6"
          weight={5}
          opacity={0.9}
          dashArray="10, 10"
        />
      )}
      {/* Fallback full route when no parking selected */}
      {!isRouteToParkingActive && routePath.length > 0 && (
        <Polyline
          positions={routePath}
          color="#06b6d4"
          weight={5}
          opacity={0.9}
        />
      )}

      {/* Destination Marker */}
      {destinationCoords && (
        <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={destinationIcon}>
          <Popup>
            <div className="p-2">
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin size={16} className="text-red-500"/>
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

      {/* Parking Lot Markers */}
      {properties.map((property) => {
        const isSelected = selectedParking?.id === property.id;
        const isBooked = bookedPropertyIds?.includes(property.id);
        
        let iconToUse = parkingIcon;
        if (isBooked) iconToUse = parkingBookedIcon;
        else if (isSelected) iconToUse = parkingRouteIcon;

        return (
          <Marker
            key={property.id}
            position={[
              property.lat || 23.2599 + (Math.random() - 0.5) * 0.05,
              property.lng || 77.4126 + (Math.random() - 0.5) * 0.05
            ]}
            icon={iconToUse}
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
            {/* Leg 1 */}
            <div className="flex items-center gap-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Your Location → Destination</p>
              </div>
            </div>

            {/* Leg 2 (only when parking selected) */}
            {isRouteToParkingActive && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Destination → Parking</p>
                </div>
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
                <p className="text-xs text-gray-500 mt-1">
                  Route saved. Will persist after booking.
                </p>
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

// --- MAP EXPORT WITH MULTIPLE THEMES ---
export default function Map({ properties, destinationCoords, bookedPropertyIds }: { properties: Property[]; destinationCoords?: { lat: number; lng: number } | null; bookedPropertyIds?: string[] }) {
  const [mapStyle, setMapStyle] = useState("dark");

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
      {/* Map Style Dropdown */}
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
          attribution={tileSettings[mapStyle].attribution}
          url={tileSettings[mapStyle].url}
        />
        <MapContent properties={properties} destinationCoords={destinationCoords} bookedPropertyIds={bookedPropertyIds} />
      </MapContainer>
    </div>
  );
}
