import { useState, useEffect, useCallback } from "react";
import { useMap } from "react-leaflet";

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

interface DestCoords {
  lat: number;
  lng: number;
}

interface LiveLocation {
  lat: number;
  lng: number;
}

interface SavedRouteData {
  selectedParking: Property;
  routePath: [number, number][];
  routeDistance: number;
  routeDuration: number;
  speedCameras: [number, number][];
  timestamp: number;
}

/**
 * Single merged hook for all map state: live location + routing.
 * Must be called inside a component that is a child of <MapContainer>.
 */
export function useMapState(
  destinationCoords: DestCoords | null | undefined,
  onRouteUpdate?: (distance: number, duration: number) => void
) {
  const map = useMap();

  // --- Location state ---
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null);
  const [isLocating, setIsLocating] = useState(true);

  // --- Route state ---
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [leg1Path, setLeg1Path] = useState<[number, number][]>([]);
  const [leg2Path, setLeg2Path] = useState<[number, number][]>([]);
  const [speedCameras, setSpeedCameras] = useState<[number, number][]>([]);
  const [selectedParking, setSelectedParking] = useState<Property | null>(null);
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);
  const [isRestoringRoute, setIsRestoringRoute] = useState(false);

  // --- Helpers ---
  const buildCameras = (coords: [number, number][], distKm: number): [number, number][] => {
    const count = Math.max(Math.min(Math.floor(distKm / 20), 15), distKm > 3 ? 1 : 0);
    if (count === 0 || coords.length === 0) return [];
    const spacing = Math.floor(coords.length / (count + 1));
    return Array.from({ length: count }, (_, i) => coords[(i + 1) * spacing]);
  };

  const calculateLegPaths = useCallback(
    (fullPath: [number, number][], parking: Property) => {
      if (!destinationCoords || !parking.lat || !parking.lng) return;
      let minDist = Infinity;
      let splitIndex = 0;
      fullPath.forEach((coord, i) => {
        const dist = Math.sqrt(
          Math.pow(coord[0] - destinationCoords.lat, 2) +
          Math.pow(coord[1] - destinationCoords.lng, 2)
        );
        if (dist < minDist) { minDist = dist; splitIndex = i; }
      });
      setLeg1Path(fullPath.slice(0, splitIndex + 1));
      setLeg2Path(fullPath.slice(splitIndex));
    },
    [destinationCoords]
  );

  const saveRoute = useCallback(
    (parking: Property, path: [number, number][], distance: number, duration: number, cameras: [number, number][]) => {
      if (!destinationCoords) return;
      localStorage.setItem("smartpark_selected_route", JSON.stringify({
        selectedParking: parking, routePath: path, routeDistance: distance,
        routeDuration: duration, speedCameras: cameras, timestamp: Date.now(),
      }));
      localStorage.setItem("smartpark_route_context", JSON.stringify({
        destinationCoords, destinationAddress: "", timestamp: Date.now(),
      }));
    },
    [destinationCoords]
  );

  // --- Geolocation ---
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setIsLocating(false);
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLiveLocation(coords);
        setIsLocating(false);
        if (!isRestoringRoute) map.flyTo([coords.lat, coords.lng], 14, { duration: 1.5 });
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsLocating(false);
        setLiveLocation({ lat: 23.2599, lng: 77.4126 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLiveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Watch error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, isRestoringRoute]);

  // --- Restore saved route ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedRoute = localStorage.getItem("smartpark_selected_route");
    const savedContext = localStorage.getItem("smartpark_route_context");

    let effectiveDest = destinationCoords;
    if (!effectiveDest && savedContext) {
      try {
        const ctx = JSON.parse(savedContext);
        if (ctx.destinationCoords && Date.now() - ctx.timestamp < 86400000)
          effectiveDest = ctx.destinationCoords;
      } catch (e) { console.error(e); }
    }

    if (savedRoute && effectiveDest) {
      try {
        const parsed: SavedRouteData = JSON.parse(savedRoute);
        if (Date.now() - parsed.timestamp < 86400000) {
          setIsRestoringRoute(true);
          setSelectedParking(parsed.selectedParking);
          setRoutePath(parsed.routePath);
          setRouteDistance(parsed.routeDistance);
          setRouteDuration(parsed.routeDuration);
          setSpeedCameras(parsed.speedCameras);
          calculateLegPaths(parsed.routePath, parsed.selectedParking);
          if (onRouteUpdate) onRouteUpdate(parsed.routeDistance, parsed.routeDuration);
          setTimeout(() => {
            if (parsed.routePath.length > 0) map.fitBounds(parsed.routePath, { padding: [100, 100] });
            setIsRestoringRoute(false);
          }, 500);
        } else {
          localStorage.removeItem("smartpark_selected_route");
        }
      } catch (e) {
        console.error(e);
        localStorage.removeItem("smartpark_selected_route");
      }
    }
  }, [map, destinationCoords, onRouteUpdate, calculateLegPaths]);

  // --- Initial route: Live -> Destination ---
  useEffect(() => {
    async function go() {
      if (!liveLocation || !destinationCoords || isRestoringRoute || routePath.length > 0) return;
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${liveLocation.lng},${liveLocation.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          const distKm = data.routes[0].distance / 1000;
          const durMin = data.routes[0].duration / 60;
          setRoutePath(coords); setLeg1Path(coords); setLeg2Path([]);
          setRouteDistance(distKm); setRouteDuration(durMin);
          setSpeedCameras(buildCameras(coords, distKm));
          if (onRouteUpdate) onRouteUpdate(distKm, durMin);
          map.fitBounds([[liveLocation.lat, liveLocation.lng], [destinationCoords.lat, destinationCoords.lng]], { padding: [80, 80] });
        }
      } catch (e) { console.error("Route fetch failed:", e); }
    }
    go();
  }, [liveLocation, destinationCoords, map, onRouteUpdate, isRestoringRoute, routePath.length]);

  // --- Multi-leg route: Live -> Destination -> Parking ---
  const calculateMultiLegRoute = useCallback(async (parkingSpot: Property) => {
    if (!liveLocation || !destinationCoords || !parkingSpot.lat || !parkingSpot.lng) return;
    setSelectedParking(parkingSpot);
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${liveLocation.lng},${liveLocation.lat};${destinationCoords.lng},${destinationCoords.lat};${parkingSpot.lng},${parkingSpot.lat}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.routes?.[0]) {
        const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        const distKm = data.routes[0].distance / 1000;
        const durMin = data.routes[0].duration / 60;
        setRoutePath(coords); setRouteDistance(distKm); setRouteDuration(durMin);
        calculateLegPaths(coords, parkingSpot);
        const cameras = buildCameras(coords, distKm);
        setSpeedCameras(cameras);
        saveRoute(parkingSpot, coords, distKm, durMin, cameras);
        if (onRouteUpdate) onRouteUpdate(distKm, durMin);
        map.fitBounds([
          [liveLocation.lat, liveLocation.lng],
          [destinationCoords.lat, destinationCoords.lng],
          [parkingSpot.lat, parkingSpot.lng],
        ], { padding: [100, 100] });
      }
    } catch (e) { console.error("Multi-leg route failed:", e); }
  }, [liveLocation, destinationCoords, map, onRouteUpdate, calculateLegPaths, saveRoute]);

  // --- Clear route ---
  const clearSavedRoute = useCallback(() => {
    setSelectedParking(null); setLeg1Path([]); setLeg2Path([]);
    localStorage.removeItem("smartpark_selected_route");
    if (!liveLocation || !destinationCoords) return;
    fetch(`https://router.project-osrm.org/route/v1/driving/${liveLocation.lng},${liveLocation.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => {
        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          const distKm = data.routes[0].distance / 1000;
          const durMin = data.routes[0].duration / 60;
          setRoutePath(coords); setLeg1Path(coords);
          setRouteDistance(distKm); setRouteDuration(durMin);
          if (onRouteUpdate) onRouteUpdate(distKm, durMin);
          map.fitBounds([[liveLocation.lat, liveLocation.lng], [destinationCoords.lat, destinationCoords.lng]], { padding: [80, 80] });
        }
      });
  }, [liveLocation, destinationCoords, map, onRouteUpdate]);

  return {
    liveLocation, isLocating,
    routePath, leg1Path, leg2Path, speedCameras,
    selectedParking, routeDistance, routeDuration,
    calculateMultiLegRoute, clearSavedRoute,
  };
}