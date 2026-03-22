"use server";

import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function createUser({
  name,
  email,
  password,
  role = "DRIVER",
}: {
  name: string;
  email: string;
  password: string;
  role?: "DRIVER" | "OWNER";
}) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with selected role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
      },
    });

    // Only create Owner record if user selected OWNER role
    if (role === "OWNER") {
      await prisma.owner.create({
        data: {
          userId: user.id,
          verified: false,
        },
      });
    }

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create user" };
  }
}