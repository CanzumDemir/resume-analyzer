// AI assistance disclosure: AI tools assisted with frontend UI implementation,
// styling, Tailwind CSS, layout, and implementation details during development.
// Exact historical line-level provenance is unavailable; see AI_ASSISTANCE.md.
//
// AI assistance (2026-08-30): OpenAI Codex helped remove the unfinished
// settings link during CS50 submission cleanup.

"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
];

export default function SideNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition",
              "hover:bg-gray-800/60 hover:text-white",
              {
                "border border-blue-500/30 bg-blue-600/20 text-blue-400":
                  isActive,
                "text-gray-400": !isActive,
              }
            )}
          >
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
