"use client";

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
  Car
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

export default function MapPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        setProperties(data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] h-screen flex flex-col overflow-hidden">
      
      {/* 🔥 NAVBAR */}
      <div className="shrink-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1f1f1f] py-4">
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
                placeholder="Search location..."
                className="w-full bg-[#111111] text-white placeholder-gray-500 px-5 py-2.5 rounded-full border border-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </span>
            </div>
          </div>
          <div className="w-30" />
        </div>
      </div>

      {/* 🔥 MAP AREA */}
      <div className="flex-1 relative w-full bg-[#111111]">
        <Map properties={properties} />
      </div>

      {/* 🔥 PARKING SPOTS AVAILABLE SECTION */}
      <div 
        className={`w-full bg-[#0a0a0a] border-t border-[#1f1f1f] flex flex-col transition-all duration-300 ease-in-out ${
          isPanelExpanded ? 'h-[40vh] min-h-75' : 'h-18.25'
        }`}
      >
        {/* Header Bar */}
        <div 
          className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f] cursor-pointer hover:bg-[#111111] transition-colors"
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        >
          <div>
            <h2 className="text-white text-sm font-semibold">Parking Spots Available</h2>
            {/* 🔥 Update the count dynamically based on the fetched data */}
            <p className="text-[#888888] text-xs mt-0.5">{properties.length} spots found</p>
          </div>
          <button className="text-[#888888] hover:text-white transition-colors">
            {isPanelExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {/* 🔥 Conditional Rendering: Show empty state OR the list of properties */}
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <AlertCircle size={32} className="text-red-500 mb-3" />
              <h3 className="text-white text-sm font-medium">No parking spots available</h3>
              <p className="text-[#888888] text-sm mt-1">Try searching in a different area</p>
            </div>
          ) : (
            properties.map((property) => (
              <div 
                key={property.id} 
                className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 hover:border-blue-600/50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium text-base">{property.name}</h3>
                  <div className="bg-blue-600/20 text-blue-500 px-2 py-1 rounded text-xs font-bold">
                    ₹{property.baseRate}/hr
                  </div>
                </div>
                
                <div className="flex items-center text-[#888888] text-sm mb-3">
                  <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                  <span className="truncate">{property.address}</span>
                </div>

                <div className="flex items-center text-sm">
                  <div className="flex items-center text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full">
                    <Car size={14} className="mr-1.5" />
                    <span>{property.slots?.length || 0} Total Slots</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}