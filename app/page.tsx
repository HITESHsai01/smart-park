"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Shield, Clock, XCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [destination, setDestination] = useState("");
  const [inputError, setInputError] = useState("");
  const { data: session, status } = useSession();
  
  // Profile Dropdown & Password UI state
  const [showProfile, setShowProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setInputError("Please enter both locations");
      return;
    }

    // Clear error
    setInputError("");

    // Navigate to map with query parameters
    // Navigate to map with query parameters
    router.push(
      `/map?to=${encodeURIComponent(destination)}`
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Auto close after 2s
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Get initial
  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U";

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

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white"
            >
              <XCircle size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Change Password</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              {passwordError && <p className="text-red-500 text-sm font-medium mt-2">{passwordError}</p>}
              {passwordSuccess && <p className="text-emerald-500 text-sm font-medium mt-2">{passwordSuccess}</p>}

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
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

          {status === "loading" ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse"></div>
          ) : session?.user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
              >
                {userInitial}
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-black/20">
                    <p className="text-sm text-gray-900 dark:text-white font-semibold truncate">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {session.user.email}
                    </p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => {
                        setShowProfile(false);
                        setShowPasswordModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      Change Password
                    </button>
                    <button 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          )}
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

export default function Home() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black" />}>
      <HomeContent />
    </Suspense>
  );
}