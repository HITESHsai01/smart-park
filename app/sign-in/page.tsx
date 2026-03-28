"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormState {
  email: string;
  password: string;
}

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        ...form,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/owner");
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 font-sans">
      <div className="bg-[#111111] p-10 rounded-[2rem] border border-white/5 w-full max-w-md shadow-2xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-lg">Sign in to manage your listings</p>
        </header>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {(["email", "password"] as const).map((field) => (
            <div key={field}>
              <label
                htmlFor={field}
                className="block text-sm font-semibold mb-2 text-gray-300 ml-1 capitalize"
              >
                {field}
              </label>
              <input
                id={field}
                name={field}
                type={field}
                value={form[field]}
                onChange={handleChange}
                autoComplete={field === "email" ? "email" : "current-password"}
                placeholder={field === "email" ? "you@example.com" : "••••••••"}
                required
                disabled={isLoading}
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-2xl px-5 py-4 text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all
                           placeholder:text-gray-600 disabled:opacity-50"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl font-bold text-white transition-all mt-4
                       bg-gradient-to-r from-[#1d4ed8] to-[#06b6d4]
                       hover:brightness-110 active:scale-[0.98]
                       shadow-[0_0_20px_rgba(29,78,216,0.3)]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-10 text-center text-gray-500 font-medium">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-[#3b82f6] hover:text-blue-400 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}