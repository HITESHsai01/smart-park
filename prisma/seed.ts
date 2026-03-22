import { PrismaClient, Role, SlotStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Admin user (email REQUIRED)
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@smartpark.com",
      phone: "9999999999",
      role: Role.ADMIN,
    },
  });

  // 2. Parking lot
  const lot = await prisma.parkingLot.create({
    data: {
      name: "Main Parking",
      address: "Campus Block A",
      baseRate: 50,
      ownerId: null,
    },
  });

  // 3. Slots
  for (let i = 1; i <= 20; i++) {
    await prisma.slot.create({
      data: {
        number: `A-${i}`,
        lotId: lot.id,
        status: SlotStatus.FREE,
      },
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());