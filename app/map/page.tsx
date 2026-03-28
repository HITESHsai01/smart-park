"use client";

import dynamic from "next/dynamic";
import MapNavbar from "../components/MapNavbar";
import ParkingPanel from "../components/ParkingPanel";
import { useMapPageData } from "../hooks/useMapPageData";
import { useDestination } from "../hooks/useDestination";

const Map = dynamic(() => import("@/app/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#111111] text-white">
      Loading map...
    </div>
  ),
});

export default function MapPage() {
  const { properties, loading, userBookings, handleCancelBooking } = useMapPageData();
  const {
    destinationCoords,
    searchInput,
    setSearchInput,
    executeSearch,
    handleSearchKeyDown,
  } = useDestination();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] h-screen flex flex-col overflow-hidden">
      <MapNavbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onSearchKeyDown={handleSearchKeyDown}
        onSearchClick={executeSearch}
      />

      <div className="flex-1 relative w-full bg-[#111111]">
        <Map
          properties={properties}
          destinationCoords={destinationCoords}
          bookedPropertyIds={userBookings.map((b) => b.slot?.lotId).filter(Boolean)}
        />
      </div>

      <ParkingPanel
        properties={properties}
        userBookings={userBookings}
        onCancelBooking={handleCancelBooking}
      />
    </div>
  );
}