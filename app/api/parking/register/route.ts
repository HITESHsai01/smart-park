import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // Adjust this path to your prisma.ts file

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, address, baseRate, slotCount, ownerId } = body;

    // We use a Transaction to ensure if slot creation fails, the Lot isn't created either.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Parking Lot
      const newLot = await tx.parkingLot.create({
        data: {
          name,
          address,
          // If you updated your schema to include baseRate:
          // baseRate: parseFloat(baseRate),
          ownerId,
        },
      });

      // 2. Auto-generate the Slots
      const slotsData = Array.from({ length: slotCount }).map((_, i) => ({
        number: `S-${i + 1}`,
        lotId: newLot.id,
        status: "FREE" as const, // Using your enum
      }));

      await tx.slot.createMany({
        data: slotsData,
      });

      return newLot;
    });

    return NextResponse.json(
      { message: "Land registered successfully", lot: result },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to register land" },
      { status: 500 },
    );
  }
}
