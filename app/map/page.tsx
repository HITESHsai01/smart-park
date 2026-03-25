"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

const Map = dynamic(() => import("@/app/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-[#111111] text-white">
      Loading map...
    </div>
  ),
});

export default function MapPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* 🔥 NAVBAR */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1f1f1f] py-4">
        <div className="flex items-center justify-between">
          {/* LEFT: push to edge */}
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

          {/* CENTER: Search */}
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

          {/* RIGHT spacer (important for center alignment) */}
          <div className="w-[120px]" />
        </div>
      </div>

      {/* 🔥 CONTENT */}
      <div className="max-w-7xl mx-auto p-6">
        {/* MAP BOX */}
        <div className="rounded-2xl overflow-hidden border border-[#1f1f1f] shadow-2xl">
          <div className="h-[600px]">
            <Map properties={properties} />
          </div>
        </div>
      </div>
    </div>
  );
}
