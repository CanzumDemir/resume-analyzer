// AI assistance disclosure: AI tools assisted with frontend UI implementation,
// styling, Tailwind CSS, layout, and implementation details during development.
// Exact historical line-level provenance is unavailable; see AI_ASSISTANCE.md.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter()
    
    const handleLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if(!response.ok) {
                const err = await response.json();
                setError(err.detail || "Login failed");
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            setError("Failed to login. Please try again.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 via-gray-900 to-black">
            <form
                method="POST"
                onSubmit={handleLogin}
                className="w-full max-w-md bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl"
            >
                <h1 className="text-3xl font-bold text-white text-center mb-6">
                    Welcome Back
                </h1>

                <p className="text-gray-400 text-center mb-8 text-sm">
                    Login to continue your AI Resume Analyzer
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
                    <p className="text-red-500 text-sm mb-4">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold text-white shadow-lg"
                >
                    Login
                </button>
                
                <div className="text-center mt-6 text-xs text-gray-500">
                    Don’t have an account?{" "}
                    <a
                        href="/signup"
                        className="text-blue-500 hover:text-blue-400 transition"
                    >
                        Sign up
                    </a>
                </div>
            </form>
        </div>
    );
}
