import Link from "next/link";
import { 
  LayoutDashboard, 
  MapPin, 
  Car, 
  CreditCard, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu
} from "lucide-react";
import { auth, signOut } from "@/auth";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-screen bg-[#f7f9fc] dark:bg-neutral-950 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-neutral-800">
           <Link href="/owner" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Partner<span className="text-blue-600">Hub</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-4">Main Menu</div>
          <NavItem href="/owner" icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <NavItem href="/owner/properties" icon={<MapPin size={18} />} label="My Properties" />
          <NavItem href="/owner/bookings" icon={<Car size={18} />} label="Bookings" />
          <NavItem href="/owner/earnings" icon={<CreditCard size={18} />} label="Financials" />
          
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-6">System</div>
          <NavItem href="/owner/settings" icon={<Settings size={18} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-neutral-800">
          <UserProfile session={session} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
             <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg">
               <Menu size={20} />
             </button>
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 rounded-lg w-64">
               <Search size={16} className="text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search bookings..." 
                 className="bg-transparent border-none text-sm focus:outline-none w-full text-gray-700 dark:text-gray-200"
               />
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 dark:bg-neutral-800 mx-1 hidden sm:block"></div>
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

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  // In a real app, usePathname hook to determine active state
  // For this static version, we'll pass active prop or just style generally
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group
        ${active 
          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-l-4 border-blue-600 pl-2" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white"
        }`}
    >
      <span className={`${active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"}`}>
        {icon}
      </span>
      {label}
    </Link>
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
