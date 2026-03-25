import { MapPin, Clock, DollarSign, ChevronRight } from "lucide-react";

interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  baseRate: number;
  availableSlots: number;
  distance?: string;
  rating?: number;
  capacity?: number;
}

interface ParkingSpotsCardProps {
  spot: ParkingSpot;
  isSelected: boolean;
  onSelect: (spotId: string) => void;
  onBook?: (spotId: string) => void;
}

export function ParkingSpotsCard({
  spot,
  isSelected,
  onSelect,
  onBook,
}: ParkingSpotsCardProps) {
  return (
    <div
      onClick={() => onSelect(spot.id)}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-blue-600 bg-[#1a1a1a] shadow-lg shadow-blue-600/20"
          : "border-[#1f1f1f] bg-[#0f0f0f] hover:border-[#2a2a2a]"
      }`}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm truncate">
            {spot.name}
          </h4>
          <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5 truncate">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{spot.address}</span>
          </p>
        </div>

        {/* Available Slots Badge */}
        <div className="ml-2 flex-shrink-0 flex items-center gap-2">
          <span className="text-green-500 text-xs font-semibold bg-green-500/10 px-2 py-1 rounded-full whitespace-nowrap">
            {spot.availableSlots} slots
          </span>
        </div>
      </div>

      {/* Details Row */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#1f1f1f] text-xs">
        {/* Price */}
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-cyan-600 flex-shrink-0" />
          <span className="text-white font-medium">₹{spot.baseRate}/hr</span>
        </div>

        {/* Distance */}
        {spot.distance && (
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-orange-600 flex-shrink-0" />
            <span className="text-gray-400">{spot.distance} km</span>
          </div>
        )}

        {/* Rating */}
        {spot.rating && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-yellow-500 font-semibold">{spot.rating}★</span>
          </div>
        )}
      </div>

      {/* Action Button - Shows when selected */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBook?.(spot.id);
          }}
          className="w-full mt-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2 px-3 rounded-lg font-medium text-sm hover:opacity-90 transition flex items-center justify-center gap-2 group"
        >
          Book This Spot
          <ChevronRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      )}
    </div>
  );
}

interface ParkingSpotsListProps {
  spots: ParkingSpot[];
  loading: boolean;
  selectedSpotId: string | null;
  onSelectSpot: (spotId: string) => void;
  onBookSpot?: (spotId: string) => void;
}

export function ParkingSpotsList({
  spots,
  loading,
  selectedSpotId,
  onSelectSpot,
  onBookSpot,
}: ParkingSpotsListProps) {
  const availableSpots = spots.filter((spot) => spot.availableSlots > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 text-sm">Loading parking spots...</div>
      </div>
    );
  }

  if (availableSpots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center mb-3">
          <span className="text-red-500 font-bold text-lg">!</span>
        </div>
        <p className="text-gray-400 text-sm font-medium">
          No parking spots available
        </p>
        <p className="text-gray-600 text-xs mt-1">
          Try searching in a different area or time
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {availableSpots.map((spot) => (
        <ParkingSpotsCard
          key={spot.id}
          spot={spot}
          isSelected={selectedSpotId === spot.id}
          onSelect={onSelectSpot}
          onBook={onBookSpot}
        />
      ))}
    </div>
  );
}