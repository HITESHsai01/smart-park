import Link from "next/link";
import {
  LayoutDashboard,
  MapPin,
  Car,
  CreditCard,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { auth, signOut } from "@/auth";
import { NavSidebar } from "./nav-sidebar";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-screen bg-[#f7f9fc] dark:bg-neutral-950 font-sans">
      {/* Sidebar */}
      <NavSidebar session={session} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
             <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
             </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">
                   {session?.user?.name || "Partner"}
                 </p>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                   Verified Partner
                 </p>
               </div>
               <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm border border-blue-200">
                 {session?.user?.name?.[0] || "P"}
               </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#f7f9fc] dark:bg-neutral-950 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function UserProfile({ session }: { session: any }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
         {/* User info moved to top bar mostly, but kept signOut here */}
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="w-full"
      >
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-100 dark:border-transparent">
          <LogOut size={16} />
          Sign Out
        </button>
      </form>
    </div>
  );
}
