import prisma from "@/app/lib/prisma";
import Link from "next/link";

export default async function OwnerDashboard() {
  // Replace this with the actual logged-in user ID later
  const currentOwnerId = "cm6xxxx..."; 

  const lands = await prisma.parkingLot.findMany({
    where: { ownerId: currentOwnerId },
    include: { slots: true }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Partner Dashboard</h1>
        <Link href="/owner/lands/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          + Register New Land
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Total Lands</p>
          <p className="text-2xl font-bold">{lands.length}</p>
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Active Parkings</p>
          <p className="text-2xl font-bold text-green-600">
            {lands.reduce((acc, lot) => acc + lot.slots.filter(s => s.status === 'OCCUPIED').length, 0)}
          </p>
        </div>
      </div>

      {/* Lands List */}
      <div className="grid gap-4">
        {lands.map((lot) => (
          <div key={lot.id} className="p-5 bg-white border rounded-xl flex justify-between items-center hover:shadow-md transition">
            <div>
              <h3 className="text-xl font-semibold">{lot.name}</h3>
              <p className="text-gray-500">{lot.address}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{lot.slots.length} Total Slots</p>
              <Link href={`/owner/lands/${lot.id}`} className="text-blue-600 hover:underline text-sm">
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}