import prisma from "@/app/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function OwnerDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const lands = await prisma.parkingLot.findMany({
    where: { 
      owner: {
        userId: session.user.id
      }
    },
    include: { 
      slots: {
        include: {
          bookings: {
            where: {
              status: { not: 'CANCELLED' }
            }
          }
        }
      } 
    }
  });

  // Calculate total earnings
  const totalEarnings = lands.reduce((acc, lot) => {
    return acc + lot.slots.reduce((slotAcc, slot) => {
      return slotAcc + slot.bookings.reduce((bookingAcc, booking) => {
        return bookingAcc + (booking.amount || 0);
      }, 0);
    }, 0);
  }, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Partner Dashboard</h1>
        <Link href="/owner/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          + Register New Property
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Total Properties</p>
          <p className="text-2xl font-bold">{lands.length}</p>
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Active Parkings</p>
          <p className="text-2xl font-bold text-green-600">
            {lands.reduce((acc, lot) => acc + lot.slots.filter(s => s.status === 'OCCUPIED' || s.status === 'RESERVED').length, 0)}
          </p>
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm border-blue-100 bg-blue-50/30">
          <p className="text-blue-600/80 font-medium text-sm">Calculated Earnings</p>
          <p className="text-2xl font-bold text-blue-700">
            ₹{totalEarnings.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Lands List */}
      <div className="grid gap-4">
        {lands.map((lot) => {
          const lotEarnings = lot.slots.reduce((acc, slot) => 
            acc + slot.bookings.reduce((bAcc, b) => bAcc + (b.amount || 0), 0)
          , 0);

          return (
            <div key={lot.id} className="p-5 bg-white border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition gap-4">
              <div>
                <h3 className="text-xl font-semibold">{lot.name}</h3>
                <p className="text-gray-500">{lot.address}</p>
              </div>
              
              <div className="flex items-center gap-6 text-right w-full md:w-auto justify-between md:justify-end">
                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Earnings</p>
                  <p className="font-bold text-blue-600 text-lg">₹{lotEarnings.toFixed(2)}</p>
                </div>
                
                <div className="text-right border-l pl-6 border-gray-100">
                  <p className="font-bold whitespace-nowrap">{lot.slots.length} Total Slots</p>
                  <Link href={`/owner/properties`} className="text-blue-600 hover:underline text-sm font-medium inline-block mt-1">
                    Manage Properties →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        
        {lands.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">You haven't registered any properties yet.</p>
            <Link href="/owner/properties/new" className="text-blue-600 hover:underline font-medium mt-2 inline-block">
              Register your first property
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}