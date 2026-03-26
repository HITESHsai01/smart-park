"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Shield, Clock, XCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [destination, setDestination] = useState("");
  const [inputError, setInputError] = useState("");

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setShowError(true);
      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleBooking = () => {
    if (!destination.trim()) {
      setInputError("Please enter correct location");
      return;
    }

    // Clear error
    setInputError("");

    // Navigate to map with query parameters
    router.push(
      `/map?to=${encodeURIComponent(destination)}`
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Error Notification */}
      {showError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <XCircle size={20} />
            <p className="font-medium">
              Access Denied: You must be an owner to access that page.
            </p>
            <button
              onClick={() => setShowError(false)}
              className="ml-2 text-red-600 hover:text-red-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <MapPin size={20} />
          </div>
          <span className="text-gray-900 dark:text-white">SmartPark</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/owner/sign-up"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
          >
            Become a Partner
          </Link>
          <Link
            href="/sign-in"
            className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white">
            Find parking in <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              seconds, not minutes.
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The smartest way to park. Book spots instantly, manage your
            listings, and save time with SmartPark.
          </p>
          <div className="w-full max-w-2xl mx-auto space-y-4 pt-6">
            {/* Drop Location */}
            <div className="flex items-center gap-4 bg-gray-100 dark:bg-zinc-800 px-5 py-4 rounded-xl border border-gray-200 dark:border-zinc-700 focus-within:border-blue-500 transition-colors">
              <MapPin className="text-gray-600 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Enter Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleBooking()}
                className="w-full bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-500"
              />
            </div>

            {/* Input Error Message */}
            {inputError && (
              <div className="text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in">
                {inputError}
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBooking}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg cursor-pointer transition-opacity duration-200"
            >
              <div className="flex items-center justify-center gap-2">
                Book Parking Slot
                <ArrowRight size={20} />
              </div>
            </button>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gray-50 dark:bg-zinc-900/50">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-blue-600" />}
              title="Real-time Availability"
              description="See exactly which spots are open right now. No more driving in circles."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-purple-600" />}
              title="Secure Booking"
              description="Reserve your spot in advance. Your space is guaranteed when you arrive."
            />
            <FeatureCard
              icon={<MapPin className="w-8 h-8 text-orange-600" />}
              title="Wide Coverage"
              description="From downtown garages to private driveways, find parking anywhere."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}