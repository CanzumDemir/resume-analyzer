// src/components/dashboard/SideNav.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import AppLogo from "@/components/AppLogo";
import SideNavLinks from "@/components/dashboard/SideNavLinks";
import SideNavAnalyses from "@/components/dashboard/SideNavAnalyses";

export default function SideNav() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      router.replace("/login");
    }
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-800 bg-gray-900/60 p-6 backdrop-blur-xl">
      <div className="mb-10">
        <AppLogo />
      </div>

      <SideNavLinks />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <SideNavAnalyses />
      </div>

      <div className="border-t border-gray-800 pt-6">
        <button
          disabled={loading}
          onClick={handleLogout}
          className="cursor-pointer text-sm text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}
