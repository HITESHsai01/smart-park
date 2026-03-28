"use client";

import Link from "next/link";
import { ChevronUp, ChevronDown, AlertCircle, MapPin, Car } from "lucide-react";
import { useState } from "react";

interface Property {
  id: string;
  name: string;
  address: string;
  baseRate: number;
  slots?: any[];
}

interface ParkingPanelProps {
  properties: Property[];
  userBookings: any[];
  onCancelBooking: (e: React.MouseEvent, bookingId: string, propertyId: string) => void;
}

export default function ParkingPanel({ properties, userBookings, onCancelBooking }: ParkingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`w-full bg-[#0a0a0a] border-t border-[#1f1f1f] flex flex-col transition-all duration-300 ease-in-out ${
        isExpanded ? "h-[40vh] min-h-[300px]" : "h-[73px]"
      }`}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f] cursor-pointer hover:bg-[#111111] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h2 className="text-white text-sm font-semibold">Parking Spots Available</h2>
          <p className="text-[#888888] text-xs mt-0.5">{properties.length} spots found</p>
        </div>
        <button className="text-[#888888] hover:text-white transition-colors">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <AlertCircle size={32} className="text-red-500 mb-3" />
            <h3 className="text-white text-sm font-medium">No parking spots available</h3>
            <p className="text-[#888888] text-sm mt-1">Try searching in a different area</p>
          </div>
        ) : (
          properties.map((property) => {
            const userBooking = userBookings.find((b: any) => b.slot?.lotId === property.id);
            const freeSlots = property.slots?.filter((s: any) => s.status === "FREE").length || 0;
            const totalSlots = property.slots?.length || 0;

            return (
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

                <div className="flex items-center justify-between text-sm mt-1">
                  <div className="flex items-center text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full font-medium">
                    <Car size={14} className="mr-1.5" />
                    <span>{freeSlots} free / {totalSlots} total slots</span>
                  </div>

                  {userBooking ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-md">
                        Booked
                      </span>
                      <button
                        onClick={(e) => onCancelBooking(e, userBooking.id, property.id)}
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
            );
          })
        )}
      </div>
    </div>
  );
}