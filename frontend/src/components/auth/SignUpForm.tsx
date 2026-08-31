// AI assistance disclosure: AI tools assisted with frontend UI implementation,
// styling, Tailwind CSS, layout, and implementation details during development.
// Exact historical line-level provenance is unavailable; see AI_ASSISTANCE.md.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignUp = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);

        const body = {
            first_name: formData.get("first_name"),
            last_name: formData.get("last_name"),
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const err = await response.json();
                setError(err.detail || "Sign up failed");
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            setError("Failed to sign up. Please try again.");
            console.error("Sign up error:", err);
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 via-gray-900 to-black">

      <form
        method="POST"
        onSubmit={handleSignUp}
        className="w-full max-w-md p-8 bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl"
      >

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Create Account
        </h1>

        <p className="text-gray-400 text-center mb-8 text-sm">
          Start your AI Resume Analyzer journey
        </p>

        <div className="mb-4">
          <label className="text-gray-300 text-sm">Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            required
            className="w-full mt-2 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-300 text-sm">First Name</label>
          <input
            type="text"
            name="first_name"
            placeholder="Enter your first name"
            required
            className="w-full mt-2 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-300 text-sm">Last Name</label>
          <input
            type="text"
            name="last_name"
            placeholder="Enter your last name"
            required
            className="w-full mt-2 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-300 text-sm">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            className="w-full mt-2 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="text-gray-300 text-sm">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            required
            className="w-full mt-2 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold text-white shadow-lg"
          disabled={loading}
        >
          Sign Up
        </button>

        <div className="text-center mt-6 text-xs text-gray-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-500 hover:text-blue-400 transition font-medium"
          >
            Log in
          </a>
        </div>

      </form>
    </div>
  );
}
