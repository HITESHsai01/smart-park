
import { PrismaClient } from "@prisma/client";

console.log("Starting test (JS)...");

try {
    console.log("Instantiating PrismaClient with log options...");
    const prisma = new PrismaClient({ log: ['info'] });
    console.log("PrismaClient initialized successfully.");
    console.log("Connecting...");
    await prisma.$connect();
    console.log("Connected successfully.");
    await prisma.$disconnect();
} catch (e) {
    console.error("Error Message:", e.message);
}
