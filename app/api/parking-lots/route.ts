import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 🔥 Default Bhopal
    const userLat = parseFloat(searchParams.get("lat") || "23.2599");
    const userLng = parseFloat(searchParams.get("lng") || "77.4126");

    const parkingLots = await prisma.parkingLot.findMany({
      include: {
        slots: true, // ✅ get ALL slots
      },
    });

    // 🔥 Filter nearby parking AREAS
    const nearbyLots = parkingLots.filter((lot) => {
      if (!lot.lat || !lot.lng) return false;

      const distance = Math.sqrt(
        Math.pow(lot.lat - userLat, 2) +
        Math.pow(lot.lng - userLng, 2)
      );

      return distance < 2; // 🔥 good radius
    });

    const formatted = nearbyLots.map((lot) => {
      const freeSlots = lot.slots.filter(
        (slot) => slot.status === "FREE"
      ).length;

      return {
        id: lot.id,
        name: lot.name,
        address: lot.address,
        baseRate: lot.baseRate,
        lat: lot.lat,
        lng: lot.lng,
        availableSlots: freeSlots,
        totalSlots: lot.slots.length,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("API ERROR:", error);

    // 🔥 always return array (VERY IMPORTANT)
    return NextResponse.json([]);
  }
}