import { useState, useEffect } from "react";
import { getCoordinates } from "@/app/lib/geocode";

interface DestCoords {
  lat: number;
  lng: number;
}

const STORAGE_KEY_ROUTE = "smartpark_selected_route";
const STORAGE_KEY_CONTEXT = "smartpark_route_context";
const TTL = 24 * 60 * 60 * 1000; // 24 hours

export function useDestination() {
  const [destinationCoords, setDestinationCoords] = useState<DestCoords | null>(null);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Restore from URL param or localStorage on mount
  useEffect(() => {
    async function loadCoords() {
      const params = new URLSearchParams(window.location.search);
      const destination = params.get("to");

      if (destination) {
        const coords = await getCoordinates(destination);
        if (coords) {
          setDestinationCoords(coords);
          setDestinationAddress(destination);
          saveContext(coords, destination);
        }
        return;
      }

      const saved = localStorage.getItem(STORAGE_KEY_CONTEXT);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Date.now() - parsed.timestamp < TTL) {
            setDestinationCoords(parsed.destinationCoords);
            setDestinationAddress(parsed.destinationAddress);
          } else {
            localStorage.removeItem(STORAGE_KEY_CONTEXT);
            localStorage.removeItem(STORAGE_KEY_ROUTE);
          }
        } catch (e) {
          console.error("Failed to parse saved context:", e);
        }
      }
    }

    loadCoords();
  }, []);

  const saveContext = (coords: DestCoords, address: string) => {
    localStorage.setItem(
      STORAGE_KEY_CONTEXT,
      JSON.stringify({ destinationCoords: coords, destinationAddress: address, timestamp: Date.now() })
    );
  };

  const executeSearch = async () => {
    if (!searchInput.trim()) return;
    const coords = await getCoordinates(searchInput);
    if (coords) {
      setDestinationCoords(coords);
      setDestinationAddress(searchInput);
      localStorage.removeItem(STORAGE_KEY_ROUTE); // clear old 3-point route
      saveContext(coords, searchInput);
    } else {
      alert("Location not found. Please try another search.");
    }
  };

  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") await executeSearch();
  };

  return {
    destinationCoords,
    destinationAddress,
    searchInput,
    setSearchInput,
    executeSearch,
    handleSearchKeyDown,
  };
}