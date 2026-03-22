import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { Plus, MapPin, Car } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PropertiesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const properties = await prisma.parkingLot.findMany({
    where: {
      owner: {
        userId: session.user.id
      }
    },
    include: {
      _count: {
        select: { slots: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">My Properties</h2>
          <p className="text-muted-foreground text-gray-500 dark:text-gray-400">
            Manage your parking lots and view their status.
          </p>
        </div>
        <Link
          href="/owner/properties/new"
          className="inline-flex items-center gap-2 rounded-md bg-black dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-black shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <Plus size={16} />
          Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No properties</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new parking lot listing.</p>
          <div className="mt-6">
            <Link
              href="/owner/properties/new"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Plus size={16} />
              Add Property
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property: (typeof properties)[number]) => (
            <div key={property.id} className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
              <div className="aspect-video w-full bg-gray-100 dark:bg-zinc-800 rounded-t-xl overflow-hidden flex items-center justify-center">
                  <MapPin size={48} className="text-gray-300 dark:text-zinc-700" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {property.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{property.address}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <Car size={16} />
                    <span>{property._count.slots} slots</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{property.baseRate}/hr
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
