"use server";

import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function upgradeToOwner() {
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

    if (user.role === "OWNER") {
      return { success: true, message: "Already an owner" };
    }

    // Transaction to ensure both update and create happen
    await prisma.$transaction(async (tx) => {
      // 1. Update User Role
      await tx.user.update({
        where: { id: user.id },
        data: { role: "OWNER" }
      });

      // 2. Create Owner Record if it doesn't exist
      if (!user.owner) {
        await tx.owner.create({
          data: {
            userId: user.id,
            verified: false,
          }
        });
      }
    });

    revalidatePath("/owner");
    return { success: true };
  } catch (error) {
    console.error("Upgrade error:", error);
    return { error: "Failed to upgrade account" };
  }
}
