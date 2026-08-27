// src/components/dashboard/SideNavLinks.tsx

"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
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