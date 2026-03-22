import Link from "next/link";
import { CheckCircle, Home } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-6">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto text-green-600 animate-in zoom-in duration-300">
          <CheckCircle size={48} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Booking Confirmed!</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Your spot has been reserved. You can view your active bookings in the dashboard.
          </p>
        </div>

        <div className="pt-8 space-y-3">
          <Link 
            href="/map"
            className="block w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Map
          </Link>
          <Link 
            href="/"
            className="block w-full py-3 px-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
