export const dynamic = 'force-dynamic';

import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const propertySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  baseRate: z.number().min(0),
  slots: z.number().min(1).max(500),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = propertySchema.safeParse(json);

    if (!body.success) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    const { name, address, baseRate, slots } = body.data;

    // Check if user has an Owner profile, if not create one
    let owner = await prisma.owner.findUnique({
      where: { userId: session.user.id },
    });

    if (!owner) {
      owner = await prisma.owner.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Create property and slots in a transaction
    const property = await prisma.$transaction(async (tx) => {
      // 1. Create Parking Lot
      const newLot = await tx.parkingLot.create({
        data: {
          name,
          address,
          baseRate,
          ownerId: owner.id,
        },
      });

      // 2. Generate Slots
      const slotsData = Array.from({ length: slots }).map((_, i) => ({
        number: `S-${i + 1}`,
        lotId: newLot.id,
      }));

      await tx.slot.createMany({
        data: slotsData,
      });

      return newLot;
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("[PROPERTIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
        const properties = await prisma.parkingLot.findMany({
            include: {
                slots: true
            }
        });
        return NextResponse.json(properties);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
