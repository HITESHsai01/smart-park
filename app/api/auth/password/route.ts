import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = passwordSchema.safeParse(json);

    if (!body.success) {
      return new NextResponse("Invalid request format or lengths too short", { status: 400 });
    }

    const { currentPassword, newPassword } = body.data;

    // Fetch user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return new NextResponse("User not found or using OAuth", { status: 400 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return new NextResponse("Incorrect current password", { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("[PASSWORD_UPDATE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
