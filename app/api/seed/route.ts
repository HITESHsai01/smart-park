import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma"; 
import parkingData from "@/app/data/parkingdata.json";

export async function GET() {
  try {
    // 1. Create a dummy owner to satisfy the Foreign Key constraint
    const owner = await prisma.owner.upsert({
      where: { id: "owner_1" },
      update: {},
      create: {
        id: "owner_1",
        // Note: If your Owner table requires other fields (like email or password), 
        // they need to go here. We use 'as any' to bypass strict TS checks for the seed.
      } as any, 
    });

    // 2. Insert all the parking lots from your JSON file
    const lots = await prisma.parkingLot.createMany({
      data: parkingData as any, // <-- This 'as any' fixes the red line under data
      skipDuplicates: true, 
    });

    return NextResponse.json({ 
      success: true,
      message: "Database seeded successfully!", 
      ownerCreated: owner.id, // <-- Changed to .id to fix the second red line
      parkingLotsAdded: lots.count 
    });

  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database", details: String(error) }, 
      { status: 500 }
    );
  }
}