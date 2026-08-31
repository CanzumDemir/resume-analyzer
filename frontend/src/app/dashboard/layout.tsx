// AI assistance disclosure: AI tools assisted with frontend UI implementation,
// styling, Tailwind CSS, layout, and implementation details during development.
// Exact historical line-level provenance is unavailable; see AI_ASSISTANCE.md.

import { ReactNode } from "react";

import SideNav from "@/components/dashboard/SideNav";
import { AnalysisStreamProvider } from "@/components/analysis/AnalysisStreamProvider";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AnalysisStreamProvider>
      <div className="flex h-screen overflow-hidden bg-black">
        <SideNav />

        <main className="flex-1 overflow-y-auto text-white">
          {children}
        </main>
      </div>
    </AnalysisStreamProvider>
  );
}
