import {
  CircleDollarSign,
  TrendingUp,
  CalendarCheck,
  Users,
} from "lucide-react";

export const stats = [
  {
    label: "Total Earnings",
    value: "Rs.12,450",
    change: "+12.5%",
    trend: "up",
    icon: CircleDollarSign,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    label: "Occupancy Rate",
    value: "84%",
    change: "+4.2%",
    trend: "up",
    icon: TrendingUp,
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    label: "Active Bookings",
    value: "24",
    change: "-2.1%",
    trend: "down",
    icon: CalendarCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    label: "Arrivals Today",
    value: "12",
    change: "+8%",
    trend: "up",
    icon: Users,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
];
