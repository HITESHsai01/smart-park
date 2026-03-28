import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { format, formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  User,
  IndianRupee,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Clock4,
  TrendingUp,
  Users,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OwnerBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const statusFilter = searchParams.status;
  const searchQuery = searchParams.search;

  // Get owner with their parking lots
  const owner = await prisma.owner.findUnique({
    where: { userId: session.user.id },
    include: {
      parkingLots: {
        select: { id: true }
      }
    }
  });

  if (!owner) {
    redirect("/owner/sign-up");
  }

  const lotIds = owner.parkingLots.map(lot => lot.id);

  // Build where clause
  const whereClause: any = {
    slot: {
      lotId: {
        in: lotIds
      }
    }
  };

  if (statusFilter && statusFilter !== "all") {
    whereClause.status = statusFilter.toUpperCase();
  }

  if (searchQuery) {
    whereClause.OR = [
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
      { vehicle: { plateNumber: { contains: searchQuery, mode: "insensitive" } } },
      { slot: { lot: { name: { contains: searchQuery, mode: "insensitive" } } } }
    ];
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      slot: {
        include: {
          lot: true
        }
      },
      vehicle: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      payment: true
    },
    orderBy: {
      startTime: "desc"
    }
  });

  // Calculate stats
  const totalEarnings = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const activeBookings = bookings.filter(b => b.status === "ACTIVE").length;
  const completedBookings = bookings.filter(b => b.status === "COMPLETED").length;
  const todayBookings = bookings.filter(b => {
    const bookingDate = new Date(b.startTime);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      label: "Total Earnings",
      value: `₹${totalEarnings.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      label: "Active Bookings",
      value: activeBookings.toString(),
      change: "+4.2%",
      trend: "up",
      icon: Clock4,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      label: "Completed",
      value: completedBookings.toString(),
      change: "+8%",
      trend: "up",
      icon: CheckCircle2,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    {
      label: "Today",
      value: todayBookings.toString(),
      change: "+2",
      trend: "up",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200",
      COMPLETED: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200",
      CANCELLED: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200",
      EXPIRED: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200"
    };
    const icons = {
      ACTIVE: Clock4,
      COMPLETED: CheckCircle2,
      CANCELLED: XCircle,
      EXPIRED: Clock4
    };
    const Icon = icons[status as keyof typeof icons] || Clock4;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.EXPIRED}`}>
        <Icon size={12} />
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const getPaymentStatus = (booking: typeof bookings[0]) => {
    if (!booking.payment) return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
        Pending
      </span>
    );
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        booking.payment.status === "COMPLETED"
          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
          : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
      }`}>
        {booking.payment.status === "COMPLETED" ? "Paid" : "Pending"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Bookings Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage all bookings across your parking properties.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/owner/properties"
            className="px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
          >
            View Properties
          </Link>
          <Link
            href="/map"
            className="px-4 py-2 bg-blue-600 text-sm font-medium text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
          >
            Preview Map
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs font-medium">
              <span className={`flex items-center gap-1 ${stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {stat.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </span>
              <span className="text-gray-400 ml-2">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <form className="flex-1 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search by customer, vehicle, or property..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                name="status"
                defaultValue={statusFilter || "all"}
                className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Apply
              </button>
              {(statusFilter || searchQuery) && (
                <Link
                  href="/owner/bookings"
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none overflow-hidden">
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-gray-400" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No bookings found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              {searchQuery || statusFilter
                ? "Try adjusting your filters to see more results."
                : "When customers book your parking spots, they'll appear here."}
            </p>
            {!searchQuery && !statusFilter && (
              <Link
                href="/owner/properties"
                className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin size={16} />
                Manage Properties
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                <tr>
                  <th className="px-4 py-3.5 font-medium">Customer</th>
                  <th className="px-4 py-3.5 font-medium">Property & Slot</th>
                  <th className="px-4 py-3.5 font-medium">Vehicle</th>
                  <th className="px-4 py-3.5 font-medium">Time</th>
                  <th className="px-4 py-3.5 font-medium">Status</th>
                  <th className="px-4 py-3.5 font-medium">Payment</th>
                  <th className="px-4 py-3.5 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="group hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-semibold text-xs">
                          {booking.user.name?.[0]?.toUpperCase() || booking.user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {booking.user.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{booking.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" />
                          {booking.slot.lot.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Slot #{booking.slot.number} • {booking.slot.size}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{booking.vehicle.plateNumber}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{booking.vehicle.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-gray-400" />
                          {format(new Date(booking.startTime), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock size={12} className="text-gray-400" />
                          {format(new Date(booking.startTime), "h:mm a")}
                          {booking.endTime && (
                            <> - {format(new Date(booking.endTime), "h:mm a")}</>
                          )}
                        </div>
                        <p className="text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(booking.startTime), { addSuffix: true })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-4 py-4">
                      {getPaymentStatus(booking)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="font-bold text-gray-900 dark:text-white flex items-center justify-end gap-1">
                        <IndianRupee size={14} />
                        {booking.amount?.toFixed(2) || "0.00"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {bookings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Showing <span className="font-medium text-gray-900 dark:text-white">{bookings.length}</span> bookings
          </p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Active: {activeBookings}
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Completed: {completedBookings}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
