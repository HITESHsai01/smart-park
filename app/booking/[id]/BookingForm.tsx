"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";

export default function BookingForm({ property, userId }: { property: any, userId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(2);
  const [vehicle, setVehicle] = useState("Compact Car"); // Placeholder for now

  // Calculate total
  const total = property.baseRate * duration;

  async function handleBooking() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          duration,
          vehicleType: vehicle, // Simplified for MVP
          amount: total,
        }),
      });

      if (!response.ok) throw new Error("Booking failed");

      router.push("/booking/success");
    } catch (error) {
      alert("Booking failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Duration</h3>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDuration(Math.max(1, duration - 1))}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
          >
            -
          </button>
          <span className="text-xl font-bold w-12 text-center">{duration}h</span>
          <button 
             onClick={() => setDuration(duration + 1)}
             className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

       <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Vehicle</h3>
        <select 
          className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
        >
          <option>Compact Car (ABC-123)</option>
          <option>SUV (XYZ-789)</option>
          <option>Add new vehicle...</option>
        </select>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex justify-between text-sm text-gray-500">
           <span>Rate</span>
           <span>₹{property.baseRate} x {duration} hrs</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
           <span>Total</span>
           <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleBooking}
        disabled={isLoading || property._count.slots.length === 0}
        className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            <CreditCard size={20} />
            Pay & Book
          </>
        )}
      </button>
    </div>
  );
}
