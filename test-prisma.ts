
import { PrismaClient } from "@prisma/client";

console.log("Starting test...");
try {
    const prisma = new PrismaClient();
    console.log("PrismaClient initialized successfully.");
    console.log("Connecting...");
    await prisma.$connect();
    console.log("Connected successfully.");
    await prisma.$disconnect();
} catch (e) {
    console.error("Error initializing PrismaClient:", e);
}
