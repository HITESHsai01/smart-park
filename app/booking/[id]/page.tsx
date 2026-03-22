import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { ArrowLeft, Car, Clock, CreditCard, MapPin } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import BookingForm from "./BookingForm";

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/booking/${(await params).id}`);
  }

  const property = await prisma.parkingLot.findUnique({
    where: { id: (await params).id },
    include: {
      slots: {
        where: { status: "FREE" },
        take: 1
      },
      _count: {
        select: {
          slots: {
            where: { status: "FREE" }
          }
        }
      }
    }
  });

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/map" className="p-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Booking</h1>
        </div>

        {/* Property Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{property.name}</h2>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                <MapPin size={16} />
                <span className="text-sm">{property.address}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">${property.baseRate}</p>
              <p className="text-xs text-gray-500">per hour</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                <Car size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
                <p className="font-semibold text-gray-900 dark:text-white">{property._count.slots} spots</p>
              </div>
            </div>
             <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                <ShieldIcon />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Security</p>
                <p className="font-semibold text-gray-900 dark:text-white">24/7 Guard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Component */}
        <BookingForm property={property} userId={session.user.id} />
        
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  )
}
