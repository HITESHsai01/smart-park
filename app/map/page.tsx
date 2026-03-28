"use client";
import { getCoordinates } from "@/app/lib/geocode";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  MapPin,
  Car,
} from "lucide-react";

// Make sure your Map component is configured to fill its parent container
const Map = dynamic(() => import("@/app/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#111111] text-white">
      Loading map...
    </div>
  ),
});

interface SavedRouteData {
  selectedParking: any;
  destinationCoords: { lat: number; lng: number };
  destinationAddress: string;
  routePath: [number, number][];
  routeDistance: number;
  routeDuration: number;
  speedCameras: [number, number][];
  timestamp: number;
}

export default function MapPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [destinationCoords, setDestinationCoords] = useState<any>(null);
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [userBookings, setUserBookings] = useState<any[]>([]);

  const executeSearch = async () => {
    if (!searchInput.trim()) return;
    const coords = await getCoordinates(searchInput);
    if (coords) {
      setDestinationCoords(coords);
      setDestinationAddress(searchInput);
      
      // Clear old 3-point route because destination changed
      localStorage.removeItem('smartpark_selected_route');
      
      // Save new destination context
      localStorage.setItem('smartpark_route_context', JSON.stringify({
        destinationCoords: coords,
        destinationAddress: searchInput,
        timestamp: Date.now()
      }));
    } else {
      alert("Location not found. Please try another search.");
    }
  };

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      await executeSearch();
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [resProps, resBookings] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/bookings").catch(() => null)
        ]);

        const dataProps = await resProps.json();
        setProperties(dataProps);

        if (resBookings && resBookings.ok) {
          const dataBookings = await resBookings.json();
          setUserBookings(dataBookings);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCancelBooking = async (e: React.MouseEvent, bookingId: string, propertyId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setUserBookings(prev => prev.filter(b => b.id !== bookingId));
        
        // Update local property slots to reflect the freed slot immediately
        setProperties(prevProps => prevProps.map(p => {
          if (p.id === propertyId) {
            const updatedSlots = p.slots.map((s: any) => {
               const booking = userBookings.find(b => b.id === bookingId);
               if (booking && s.id === booking.slotId) {
                 return { ...s, status: "FREE" };
               }
               return s;
            });
            return { ...p, slots: updatedSlots };
          }
          return p;
        }));
        
        alert("Booking cancelled successfully!");
      } else {
        alert("Failed to cancel booking.");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("An error occurred.");
    }
  };

  useEffect(() => {
    async function loadCoords() {
      const params = new URLSearchParams(window.location.search);
      const destination = params.get("to");

      // First check URL params
      if (destination) {
        const coords = await getCoordinates(destination);
        if (coords) {
          setDestinationCoords(coords);
          setDestinationAddress(destination);

          // Save to localStorage for persistence
          const savedRoute = localStorage.getItem('smartpark_route_context');
          const existingData = savedRoute ? JSON.parse(savedRoute) : {};
          localStorage.setItem('smartpark_route_context', JSON.stringify({
            ...existingData,
            destinationCoords: coords,
            destinationAddress: destination,
            timestamp: Date.now()
          }));
        }
        return;
      }

      // If no URL param, check localStorage
      const savedContext = localStorage.getItem('smartpark_route_context');
      if (savedContext) {
        try {
          const parsed: SavedRouteData = JSON.parse(savedContext);
          // Check if less than 24 hours old
          if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            setDestinationCoords(parsed.destinationCoords);
            setDestinationAddress(parsed.destinationAddress);
            console.log("Restored destination from storage:", parsed.destinationAddress);
          } else {
            localStorage.removeItem('smartpark_route_context');
            localStorage.removeItem('smartpark_selected_route');
          }
        } catch (e) {
          console.error("Failed to parse saved context:", e);
        }
      }
    }

    loadCoords();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white">
        Loading...
      </div>
    );
  }

  // console.log("DESTINATION COORDS:", destinationCoords);
  return (
    <div className="bg-[#0a0a0a] h-screen flex flex-col overflow-hidden">
      {/* 🔥 NAVBAR */}
      <div className="flex-shrink-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1f1f1f] py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white pl-2">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 bg-[#1a1a1a] rounded-full hover:bg-[#2a2a2a] transition"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="pl-2">
              <h1 className="text-lg font-semibold ">Find Parking</h1>
              <p className="text-gray-500 text-xs">
                Choose your parking spot easily
              </p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 justify-center pr-6">
            <div className="w-full max-w-md relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search location..."
                className="w-full bg-[#111111] text-white placeholder-gray-500 px-5 py-2.5 rounded-full border border-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
              <button 
                onClick={executeSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="w-[120px]" />
        </div>
      </div>

      {/* 🔥 MAP AREA */}
      <div className="flex-1 relative w-full bg-[#111111]">
        <Map properties={properties} destinationCoords={destinationCoords} bookedPropertyIds={userBookings.map(b => b.slot?.lotId).filter(Boolean)} />
      </div>

      {/* 🔥 PARKING SPOTS AVAILABLE SECTION */}
      <div
        className={`w-full bg-[#0a0a0a] border-t border-[#1f1f1f] flex flex-col transition-all duration-300 ease-in-out ${
          isPanelExpanded ? "h-[40vh] min-h-[300px]" : "h-[73px]"
        }`}
      >
        {/* Header Bar */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f] cursor-pointer hover:bg-[#111111] transition-colors"
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        >
          <div>
            <h2 className="text-white text-sm font-semibold">
              Parking Spots Available
            </h2>
            {/* 🔥 Update the count dynamically based on the fetched data */}
            <p className="text-[#888888] text-xs mt-0.5">
              {properties.length} spots found
            </p>
          </div>
          <button className="text-[#888888] hover:text-white transition-colors">
            {isPanelExpanded ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronUp size={20} />
            )}
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {/* 🔥 Conditional Rendering: Show empty state OR the list of properties */}
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <AlertCircle size={32} className="text-red-500 mb-3" />
              <h3 className="text-white text-sm font-medium">
                No parking spots available
              </h3>
              <p className="text-[#888888] text-sm mt-1">
                Try searching in a different area
              </p>
            </div>
          ) : (
            properties.map((property) => {
              const userBooking = userBookings.find((b: any) => b.slot?.lotId === property.id);

              return (
              <div
                key={property.id}
                className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 hover:border-blue-600/50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium text-base">
                    {property.name}
                  </h3>
                  <div className="bg-blue-600/20 text-blue-500 px-2 py-1 rounded text-xs font-bold">
                    ₹{property.baseRate}/hr
                  </div>
                </div>

                <div className="flex items-center text-[#888888] text-sm mb-3">
                  <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                  <span className="truncate">{property.address}</span>
                </div>

                <div className="flex items-center justify-between text-sm mt-1">
                  <div className="flex items-center text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full font-medium">
                    <Car size={14} className="mr-1.5" />
                    <span>{property.slots?.filter((s: any) => s.status === "FREE").length || 0} free / {property.slots?.length || 0} total slots</span>
                  </div>
                  
                  {userBooking ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-md">
                        Booked
                      </span>
                      <button 
                        onClick={(e) => handleCancelBooking(e, userBooking.id, property.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <Link 
                      href={`/booking/${property.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Book Now
                    </Link>
                  )}
                </div>
              </div>
            )})
          )}
        </div>
      </div>
    </div>
  );
}
