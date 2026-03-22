'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upgradeToOwner } from "@/app/owner/actions";
import { ArrowRight, CheckCircle2, MapPin, Ruler, LayoutGrid, Car, Globe } from "lucide-react";
import { useSession } from "next-auth/react";
import { createListingAndUpgrade } from "@/app/owner/create-listing-action";

export function OwnerUpgradeForm() {
  const router = useRouter();
  const { data: session, update } = useSession(); 
  const [step, setStep] = useState(0); // 0: Intro, 1: Address, 2: Details
  const [formData, setFormData] = useState({
    address: "",
    country: "US",
    squareFeet: "",
    capacity: "1",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleListingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await createListingAndUpgrade({
        address: formData.address,
        country: formData.country,
        squareFeet: parseFloat(formData.squareFeet) || 0,
        capacity: parseInt(formData.capacity) || 1,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      await update({ role: "OWNER" });
      router.push("/owner");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Failed to create listing");
      setIsLoading(false);
    }
  }

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Step 0: Welcome / Intro
  if (step === 0) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Car size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">List Your Place</h2>
          <p className="text-gray-600 mt-2 mb-6">
            Hi <span className="font-semibold text-gray-900">{session?.user?.name || "Driver"}</span>! Ready to earn from your empty space?
          </p>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-left space-y-3">
             <div className="flex gap-3">
               <CheckCircle2 size={20} className="text-blue-600 shrink-0" />
               <p className="text-sm text-blue-800">Earn monthly passive income</p>
             </div>
             <div className="flex gap-3">
               <CheckCircle2 size={20} className="text-blue-600 shrink-0" />
               <p className="text-sm text-blue-800">Guaranteed bookings from our driver network</p>
             </div>
             <div className="flex gap-3">
                <CheckCircle2 size={20} className="text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">Full control over availability</p>
             </div>
          </div>

          <button
            onClick={nextStep}
            className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
          >
            Get Started
            <ArrowRight size={18} />
          </button>
           <button 
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Location Info
  if (step === 1) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
           <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 font-medium">
             <button onClick={prevStep} className="hover:text-gray-900">Back</button>
             <span>/</span>
             <span className="text-gray-900">Step 1 of 2</span>
           </div>

           <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Location</h2>
           
           <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-5">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Property Address</label>
               <div className="relative">
                 <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                 <input
                   required
                   value={formData.address}
                   onChange={e => setFormData({...formData, address: e.target.value})}
                   className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="123 Main St, New York, NY"
                 />
               </div>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Country Code</label>
               <div className="relative">
                 <Globe className="absolute left-3 top-3.5 text-gray-400" size={18} />
                 <input
                   required
                   value={formData.country}
                   onChange={e => setFormData({...formData, country: e.target.value})}
                   className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="US"
                   maxLength={2}
                 />
                 <p className="mt-1 text-xs text-gray-500">2-letter ISO code (e.g. US, UK, IN)</p>
               </div>
             </div>

             <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors mt-8"
              >
                Next
                <ArrowRight size={18} />
              </button>
           </form>
        </div>
      </div>
    );
  }

  // Step 2: Property Details
  return (
    <div className="w-full max-w-md">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 font-medium">
             <button onClick={prevStep} className="hover:text-gray-900">Back</button>
             <span>/</span>
             <span className="text-gray-900">Step 2 of 2</span>
           </div>

           <h2 className="text-2xl font-bold text-gray-900 mb-6">Space Details</h2>

           {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
           
           <form onSubmit={handleListingSubmit} className="space-y-5">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Total Area (Square Feet)</label>
               <div className="relative">
                 <Ruler className="absolute left-3 top-3.5 text-gray-400" size={18} />
                 <input
                   type="number"
                   required
                   min="1"
                   value={formData.squareFeet}
                   onChange={e => setFormData({...formData, squareFeet: e.target.value})}
                   className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="e.g. 150"
                 />
               </div>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Number of Parking Slots</label>
               <div className="relative">
                 <LayoutGrid className="absolute left-3 top-3.5 text-gray-400" size={18} />
                 <input
                   type="number"
                   required
                   min="1"
                   max="100"
                   value={formData.capacity}
                   onChange={e => setFormData({...formData, capacity: e.target.value})}
                   className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="1"
                 />
                 <p className="mt-1 text-xs text-gray-500">We'll create these slots automatically for you.</p>
               </div>
             </div>

             <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors mt-8"
              >
                {isLoading ? "creating..." : "List My Property"}
                {!isLoading && <CheckCircle2 size={18} />}
              </button>
           </form>
      </div>
    </div>
  );
}
