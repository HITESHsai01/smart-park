import Link from "next/link";
import { Building2 } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OwnerSignUpForm } from "./signup-form";
import { OwnerUpgradeForm } from "./upgrade-form";

export default async function OwnerSignUpPage() {
  const session = await auth();

  // If already an owner, redirect to dashboard
  if (session?.user?.role === "OWNER") {
    redirect("/owner");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-between text-white">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
              <Building2 size={24} />
            </div>
            <span>SmartPark</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Turn your parking space into passive income
          </h1>
          <p className="text-lg text-blue-100">
            Join thousands of property owners earning money from their unused parking spots.
          </p>
          
          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                ✓
              </div>
              <div>
                <h3 className="font-semibold">Easy Setup</h3>
                <p className="text-sm text-blue-100">List your space in minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                ✓
              </div>
              <div>
                <h3 className="font-semibold">Flexible Pricing</h3>
                <p className="text-sm text-blue-100">Set your own rates and availability</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                ✓
              </div>
              <div>
                <h3 className="font-semibold">Secure Payments</h3>
                <p className="text-sm text-blue-100">Get paid directly to your account</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-blue-200">
          © 2024 SmartPark Inc. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        {session ? (
          <OwnerUpgradeForm />
        ) : (
          <OwnerSignUpForm />
        )}
      </div>
    </div>
  );
}
