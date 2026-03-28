import { useState, useEffect } from "react";

export function useMapPageData() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBookings, setUserBookings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resProps, resBookings] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/bookings").catch(() => null),
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

  const handleCancelBooking = async (
    e: React.MouseEvent,
    bookingId: string,
    propertyId: string
  ) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });

      if (res.ok) {
        setUserBookings((prev) => prev.filter((b) => b.id !== bookingId));

        setProperties((prevProps) =>
          prevProps.map((p) => {
            if (p.id === propertyId) {
              const updatedSlots = p.slots.map((s: any) => {
                const booking = userBookings.find((b) => b.id === bookingId);
                if (booking && s.id === booking.slotId) return { ...s, status: "FREE" };
                return s;
              });
              return { ...p, slots: updatedSlots };
            }
            return p;
          })
        );

        alert("Booking cancelled successfully!");
      } else {
        alert("Failed to cancel booking.");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("An error occurred.");
    }
  };

  return { properties, loading, userBookings, handleCancelBooking };
}