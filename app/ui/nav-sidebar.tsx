"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Car,
  CreditCard,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/owner", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/owner/properties", icon: MapPin, label: "My Properties" },
  { href: "/owner/bookings", icon: Car, label: "Bookings" },
];

export function NavSidebar({ session }: { session: any }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 shadow-sm z-10">
      <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-neutral-800 gap-3">
        <Link
          href="/"
          className="flex items-center justify-center min-w-[32px] w-8 h-8 bg-gray-100 dark:bg-neutral-800 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
        >
          <ArrowLeft size={16} className="text-gray-600 dark:text-gray-300" />
        </Link>
        <Link href="/owner" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Smart<span className="text-blue-600">Park</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-4">Main Menu</div>
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={<item.icon size={18} />}
            label={item.label}
            active={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* User info moved to top bar mostly, but kept signOut here */}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-100 dark:border-transparent"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group
        ${active
          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-l-4 border-blue-600 pl-2"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white"
        }`}
    >
      <span
        className={`${
          active
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
        }`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
