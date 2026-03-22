"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";

export default function NewPropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name"),
      address: formData.get("address"),
      baseRate: parseFloat(formData.get("baseRate") as string),
      slots: parseInt(formData.get("slots") as string),
    };

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create property");
      }

      router.refresh(); // Refresh server components
      router.push("/owner/properties");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Add New Property</h2>
        <p className="text-muted-foreground text-gray-500 dark:text-gray-400">
          Register a new parking lot and set your rates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Property Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              placeholder="e.g. Downtown Secure Garage"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                name="address"
                id="address"
                required
                placeholder="123 Main St, City, Country"
                className="block w-full rounded-md border border-gray-300 pl-10 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="baseRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hourly Rate (₹)
              </label>
              <input
                type="number"
                name="baseRate"
                id="baseRate"
                min="0"
                step="0.5"
                required
                defaultValue="5.0"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="slots" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Slots
              </label>
              <input
                type="number"
                name="slots"
                id="slots"
                min="1"
                max="500"
                required
                defaultValue="10"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">Slots will be auto-generated</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-black dark:bg-white px-6 py-2.5 text-sm font-semibold text-white dark:text-black shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {isLoading ? "Creating..." : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  );
}
