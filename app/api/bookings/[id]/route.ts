import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: bookingId } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true }
    });

    if (!booking) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete booking and update slot status in a transaction
    await prisma.$transaction(async (tx) => {
      // Free up the slot
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { status: "FREE" }
      });
      
      // Delete the booking
      await tx.booking.delete({
        where: { id: bookingId }
      });
    });

    return new NextResponse("Booking Cancelled", { status: 200 });
  } catch (error) {
    console.error("[BOOKING_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
