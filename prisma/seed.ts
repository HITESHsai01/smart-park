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

  // 2. Parking lots with Bhopal coordinates
  const lot1 = await prisma.parkingLot.create({
    data: {
      name: "Main Parking - MP Nagar",
      address: "MP Nagar, Bhopal",
      baseRate: 50,
      lat: 23.2599,
      lng: 77.4126,
      ownerId: null,
    },
  });

  const lot2 = await prisma.parkingLot.create({
    data: {
      name: "Central Parking - Market",
      address: "New Market, Bhopal",
      baseRate: 60,
      lat: 23.2650,
      lng: 77.4180,
      ownerId: null,
    },
  });

  const lot3 = await prisma.parkingLot.create({
    data: {
      name: "Premium Garage - Downtown",
      address: "Downtown, Bhopal",
      baseRate: 80,
      lat: 23.2550,
      lng: 77.4080,
      ownerId: null,
    },
  });

  // 3. Slots for each parking lot
  for (let i = 1; i <= 20; i++) {
    await prisma.slot.create({
      data: {
        number: `A-${i}`,
        lotId: lot1.id,
        status: SlotStatus.FREE,
      },
    });
  }

  for (let i = 1; i <= 15; i++) {
    await prisma.slot.create({
      data: {
        number: `B-${i}`,
        lotId: lot2.id,
        status: SlotStatus.FREE,
      },
    });
  }

  for (let i = 1; i <= 10; i++) {
    await prisma.slot.create({
      data: {
        number: `C-${i}`,
        lotId: lot3.id,
        status: i <= 3 ? SlotStatus.FREE : SlotStatus.FREE, // Mix of statuses
      },
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());