import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { 
  CircleDollarSign, 
  ParkingSquare, 
  TrendingUp,
  Users, 
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MoreHorizontal,
  CheckCircle2
} from "lucide-react";

export default async function OwnerDashboard() {
  const session = await auth();
  
  // Mock data - would be real data in production
  const stats = [
    { 
      label: "Total Earnings", 
      value: "Rs.12,450", 
      change: "+12.5%", 
      trend: "up", 
      icon: CircleDollarSign, 
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    { 
      label: "Occupancy Rate", 
      value: "84%", 
      change: "+4.2%", 
      trend: "up", 
      icon: TrendingUp, 
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    { 
      label: "Active Bookings", 
      value: "24", 
      change: "-2.1%", 
      trend: "down", 
      icon: CalendarCheck, 
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    { 
      label: "Arrivals Today", 
      value: "12", 
      change: "+8%", 
      trend: "up", 
      icon: Users, 
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/20"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Performance summary for <span className="font-medium text-gray-900 dark:text-white">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-sm">
            Download Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-sm font-medium text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 dark:shadow-none">
            Add Property
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-2">
                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                </div>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium">
               <span className={`flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                 {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                 {stat.change}
               </span>
               <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Analytics</h3>
            <select className="bg-gray-50 dark:bg-neutral-800 border-none text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg px-3 py-1 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Last 7 days</option>
              <option>This Month</option>
              <option>Last Quarter</option>
            </select>
          </div>
          <div className="h-[300px] w-full bg-gray-50 dark:bg-neutral-800/50 rounded-lg border border-dashed border-gray-200 dark:border-neutral-700 flex flex-col items-center justify-center text-gray-400 gap-2">
            <TrendingUp size={32} className="opacity-20" />
            <span className="text-sm">Revenue chart visualization would go here</span>
          </div>
        </div>

        {/* Recent Bookings List */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none flex flex-col">
           <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Bookings</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">View All</button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-neutral-800/50 rounded-lg transition-colors group">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-100 dark:border-blue-900/30">
                  {['JD', 'AS', 'MR', 'TK', 'PL'][i-1]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Spot A-{i*12}</p>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                      Paid
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> 2 mins ago • {['John Doe', 'Sarah Smith', 'Mike Ross', 'Tom King', 'Paul Lee'][i-1]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Quick Actions / Property List Summary */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">My Properties Status</h3>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full text-gray-400">
             <MoreHorizontal size={20} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-neutral-800/50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Property Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Occupancy</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
              {[1, 2].map((i) => (
                <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                    Downtown Parking Complex {i}
                  </td>
                  <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                    New York, NY
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-16 h-2 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-600 rounded-full" style={{ width: `${80 - i*10}%` }}></div>
                       </div>
                       <span className="text-xs text-gray-600 dark:text-gray-400">{80 - i*10}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-xs">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
