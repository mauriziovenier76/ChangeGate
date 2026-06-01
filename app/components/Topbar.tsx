"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, Calendar, Settings } from "lucide-react";

export default function Topbar() {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", href: "/dashboard", icon: <Home size={18} /> },
    { name: "Change Request", href: "/requests", icon: <ListChecks size={18} /> },
    { name: "Planning", href: "/planning", icon: <Calendar size={18} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={18} /> },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <nav className="flex items-center gap-6">
        {menu.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-2 text-sm font-medium transition " +
                (active
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900")
              }
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="w-8 h-8 rounded-full bg-slate-300" />
    </header>
  );
}
