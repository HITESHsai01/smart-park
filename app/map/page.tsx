"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ChevronDown,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

const Map = dynamic(() => import("@/app/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-[#111111] text-white">
      Loading map...
    </div>
  ),
});

export default function MapPage() {
  const searchParams = useSearchParams();
  const [currentLocation, setCurrentLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [expandedPanel, setExpandedPanel] = useState(true);

  useEffect(() => {
    // Get locations from query params
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (from) setCurrentLocation(decodeURIComponent(from));
    if (to) setDestination(decodeURIComponent(to));

    // Fetch parking spots
    fetchParkingSpots();
  }, [searchParams]);

  async function fetchParkingSpots() {
    try {
      setLoading(true);

      // 🔥 Bhopal default
      const res = await fetch(`/api/parking-lots?lat=23.2599&lng=77.4126`);

      const data = await res.json();

      console.log("Parking data:", data); // DEBUG

      setParkingSpots(data);
    } catch (error) {
      console.error("Failed:", error);
      setParkingSpots([]);
    } finally {
      setLoading(false);
    }
  }

  const availableSpots = parkingSpots;
  return (
    <div className="bg-[#0a0a0a] min-h-screen flex flex-col">
      {/* 🔥 NAVBAR */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1f1f1f] py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 bg-[#1a1a1a] rounded-full hover:bg-[#2a2a2a] transition"
            >
              <ArrowLeft size={20} className="text-white" />
            </Link>

            <div>
              <h1 className="text-lg font-semibold text-white">Find Parking</h1>
              <p className="text-gray-500 text-xs">
                Choose your parking spot easily
              </p>
            </div>
          </div>

          {/* Location Input Fields */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4">
            {/* From Location */}
            <div className="flex items-center gap-3 bg-[#111111] px-4 py-2.5 rounded-lg border border-[#1f1f1f] focus-within:border-blue-600 transition">
              <MapPin size={18} className="text-blue-600 flex-shrink-0" />
              <input
                type="text"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="Current Location"
                className="w-full bg-transparent outline-none text-white placeholder-gray-500 text-sm"
              />
            </div>

            {/* To Location */}
            <div className="flex items-center gap-3 bg-[#111111] px-4 py-2.5 rounded-lg border border-[#1f1f1f] focus-within:border-cyan-600 transition">
              <MapPin size={18} className="text-cyan-600 flex-shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination"
                className="w-full bg-transparent outline-none text-white placeholder-gray-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 MAP */}
      <div className="flex-1 relative px-4 pt-4 pb-80 md:pb-4 min-h-[500px]">
        <div className="rounded-2xl overflow-hidden border border-[#1f1f1f] shadow-2xl h-full w-full max-w-7xl mx-auto">
          <div className="h-full w-full">
            <Map properties={parkingSpots} />
          </div>
        </div>
      </div>

      {/* 🔥 PARKING SPOTS PANEL (Bottom Sheet Style) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-[#0a0a0a]/80 backdrop-blur-sm">
        {/* Panel Header with Toggle */}
        <div
          onClick={() => setExpandedPanel(!expandedPanel)}
          className="cursor-pointer px-4 py-3 border-t border-[#1f1f1f] bg-[#0a0a0a]/95 flex items-center justify-between"
        >
          <div>
            <h3 className="text-white font-semibold text-sm">
              Parking Spots Available
            </h3>
            <p className="text-gray-500 text-xs">
              {availableSpots.length} spots found
            </p>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform ${
              expandedPanel ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Panel Content */}
        {expandedPanel && (
          <div className="max-h-[400px] overflow-y-auto bg-[#0a0a0a]/95 px-4 py-4 border-t border-[#1f1f1f]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500 text-sm">
                  Loading parking spots...
                </div>
              </div>
            ) : availableSpots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle size={32} className="text-red-500 mb-3" />
                <p className="text-gray-400 text-sm font-medium">
                  No parking spots available
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Try searching in a different area
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableSpots.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot.id)}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                      selectedSpot === spot.id
                        ? "border-blue-600 bg-[#111111]"
                        : "border-[#1f1f1f] bg-[#0f0f0f] hover:border-[#2a2a2a]"
                    }`}
                  >
                    {/* Spot Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm">
                          {spot.name}
                        </h4>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                          <MapPin size={12} />
                          {spot.address}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          spot.availableSlots > 0
                            ? "text-green-500 bg-green-500/10"
                            : "text-red-500 bg-red-500/10"
                        }`}
                      >
                        {spot.availableSlots > 0
                          ? `${spot.availableSlots} slots`
                          : "Full"}
                      </span>
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1f1f1f]">
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={14} className="text-cyan-600" />
                        <span className="text-white text-xs font-medium">
                          ₹{spot.baseRate}/hr
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-orange-600" />
                        <span className="text-gray-400 text-xs">
                          {spot.distance || "2.4"} km away
                        </span>
                      </div>
                    </div>

                    {/* Select Button */}
                    {selectedSpot === spot.id && (
                      <button className="w-full mt-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2 rounded-lg font-medium text-sm hover:opacity-90 transition">
                        Select This Spot
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
