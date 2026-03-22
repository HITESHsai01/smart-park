
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const bookingSchema = z.object({
  propertyId: z.string(),
  duration: z.number().min(1),
  vehicleType: z.string(),
  amount: z.number(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const json = await req.json();
    const body = bookingSchema.safeParse(json);

    if (!body.success) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    const { propertyId, duration, amount, vehicleType } = body.data;

    // 1. Find an available slot directly
    const availableSlot = await prisma.slot.findFirst({
      where: {
        lotId: propertyId,
        status: "FREE"
      }
    });

    if (!availableSlot) {
      return new NextResponse("No slots available", { status: 409 });
    }

    // 2. Create Vehicle if needed (simplified check)
    // For now we assume we just attach it to a dummy vehicle or create one on fly
    // In a real app we'd have a Vehicle selection flow.
    // Let's create a temporary vehicle for this booking
    let vehicle = await prisma.vehicle.findFirst({
        where: { userId: userId }
    });

    if (!vehicle) {
        vehicle = await prisma.vehicle.create({
            data: {
                plateNumber: "NEW-" + Math.floor(Math.random() * 1000),
                type: "CAR",
                userId: userId
            }
        })
    }
   

    // 3. Create Booking & Update Slot Status transaction
    const booking = await prisma.$transaction(async (tx) => {
        // Create booking
        const newBooking = await tx.booking.create({
            data: {
                userId: userId,
                slotId: availableSlot.id,
                startTime: new Date(),
                endTime: new Date(Date.now() + duration * 60 * 60 * 1000),
                amount: amount,
                vehicleId: vehicle.id, 
                status: "ACTIVE"
            }
        });

        // Update slot status
        await tx.slot.update({
            where: { id: availableSlot.id },
            data: { status: "RESERVED" }
        });

        return newBooking;
    });

    return NextResponse.json(booking);

  } catch (error) {
    console.error("[BOOKING_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
