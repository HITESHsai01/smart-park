import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Car } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      slot: {
        include: {
          lot: true
        }
      },
      vehicle: true
    },
    orderBy: {
      startTime: 'desc'
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Garage</h1>
          <Link 
            href="/map" 
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium text-sm hover:opacity-90"
          >
            Find Parking
          </Link>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active & Past Bookings</h2>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
              <Car className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No bookings yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Book your first parking spot to see it here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{booking.slot.lot.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{booking.slot.lot.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{format(new Date(booking.startTime), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{format(new Date(booking.startTime), "h:mm a")} - {booking.endTime ? format(new Date(booking.endTime), "h:mm a") : 'Ongoing'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car size={16} />
                        <span>{booking.vehicle.plateNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                      booking.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {booking.status}
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-4">
                      ₹{booking.amount?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
