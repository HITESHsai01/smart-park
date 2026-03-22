"use server";

import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

interface CreateListingData {
  address: string;
  country: string;
  squareFeet: number;
  capacity: number;
}

export async function createListingAndUpgrade(data: CreateListingData) {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: "Not authenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { owner: true }
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Transaction to ensure atomic update
    await prisma.$transaction(async (tx) => {
      // 1. Update User Role and Create Owner Record (if not exists)
      if (user.role !== "OWNER") {
        await tx.user.update({
          where: { id: user.id },
          data: { role: "OWNER" }
        });
      }

      let ownerId = user.owner?.id;

      if (!user.owner) {
        const newOwner = await tx.owner.create({
          data: {
            userId: user.id,
            verified: false,
          }
        });
        ownerId = newOwner.id;
      }

      // 2. Create ParkingLot Listing
      if (ownerId) {
        await tx.parkingLot.create({
          data: {
            name: `${user.name}'s Parking Spot`, // Default name, user can change later
            address: data.address,
            country: data.country,
            squareFeet: data.squareFeet,
            capacity: data.capacity,
            ownerId: ownerId,
            baseRate: 50.0, // Default rate
            // Auto-generate slots based on capacity
            slots: {
                create: Array.from({ length: data.capacity }).map((_, i) => ({
                    number: `A-${i + 1}`,
                    size: "MEDIUM",
                    status: "FREE"
                }))
            }
          }
        });
      }
    });

    revalidatePath("/owner");
    return { success: true };
  } catch (error) {
    console.error("Listing creation error:", error);
    return { error: "Failed to create listing" };
  }
}
