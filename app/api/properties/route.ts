export const dynamic = 'force-dynamic';

import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCoordinates } from "@/app/lib/geocode";
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

    let lat = null;
    let lng = null;
    try {
      const coords = await getCoordinates(address);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
    } catch (e) {
      console.error("Failed to geocode address:", e);
    }

    let owner = await prisma.owner.findUnique({
      where: { userId: session.user.id },
    });

    if (!owner) {
      owner = await prisma.owner.create({
        data: { userId: session.user.id },
      });
    }

    const property = await prisma.$transaction(async (tx) => {
      const newLot = await tx.parkingLot.create({
        data: { name, address, baseRate, ownerId: owner.id, lat, lng },
      });

      const slotsData = Array.from({ length: slots }).map((_, i) => ({
        number: `S-${i + 1}`,
        lotId: newLot.id,
      }));

      await tx.slot.createMany({ data: slotsData });
      return newLot;
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("[PROPERTIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// GET all properties from database
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const properties = await prisma.parkingLot.findMany({
      include: {
        owner: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        slots: {
          select: { id: true, number: true, status: true, size: true }
        }
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("[PROPERTIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}