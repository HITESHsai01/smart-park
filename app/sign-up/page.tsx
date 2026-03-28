"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { createUser } from "./action";

interface FormState {
  name: string;
  email: string;
  password: string;
}

const FIELDS = [
  { name: "name", type: "text", label: "Name", placeholder: "John Doe", autoComplete: "name" },
  { name: "email", type: "email", label: "Email", placeholder: "you@example.com", autoComplete: "email" },
  { name: "password", type: "password", label: "Password", placeholder: "••••••••", autoComplete: "new-password" },
] as const;

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ name: "", email: "", password: "" });
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
      const result = await createUser(form);
      if (result.error) throw new Error(result.error);

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but login failed. Please sign in manually.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 font-sans">
      <div className="bg-[#111111] p-10 rounded-[2rem] border border-white/5 w-full max-w-md shadow-2xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Create Account
          </h1>
          <p className="text-gray-400 text-lg">Join SmartPark today</p>
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
          {FIELDS.map(({ name, type, label, placeholder, autoComplete }) => (
            <div key={name}>
              <label
                htmlFor={name}
                className="block text-sm font-semibold mb-2 text-gray-300 ml-1"
              >
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                autoComplete={autoComplete}
                placeholder={placeholder}
                minLength={name === "password" ? 6 : undefined}
                required
                disabled={isLoading}
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-2xl px-5 py-4 text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all
                           placeholder:text-gray-600 disabled:opacity-50"
              />
              {name === "password" && (
                <p className="mt-1.5 text-xs text-gray-600 ml-1">At least 6 characters</p>
              )}
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
            {isLoading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="mt-10 space-y-3 text-center">
          <p className="text-gray-500 font-medium text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-[#3b82f6] hover:text-blue-400 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}