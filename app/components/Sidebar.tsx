"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Change Request", href: "/requests" },
  { name: "Planning", href: "/planning" },
  { name: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800">
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="text-xl font-bold tracking-tight">ChangeGate</div>
        <div className="text-xs text-slate-400 mt-1">Change Management Portal</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition " +
                (active
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white")
              }
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
