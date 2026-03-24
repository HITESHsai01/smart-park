"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Map = dynamic(() => import("@/app/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-zinc-900 text-white">
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
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen p-6">

      <div className="max-w-7xl mx-auto">

        {/* Top Bar */}
        <div className="flex items-center gap-4 mb-6 text-white">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 bg-zinc-800 rounded-full shadow-lg hover:bg-zinc-700"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold">Find Parking</h1>
            <p className="text-gray-400 text-sm">
              Choose your parking spot easily
            </p>
          </div>
        </div>

        {/* Map Box */}
        <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          <div className="h-[600px]">
            <Map properties={properties} />
          </div>
        </div>

      </div>
    </div>
  );
}