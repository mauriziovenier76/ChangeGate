"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, Calendar, Settings, User, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Topbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menu = [
    { name: "Dashboard", href: "/dashboard", icon: <Home size={18} /> },
    { name: "Change Request", href: "/requests", icon: <ListChecks size={18} /> },
    { name: "Planning", href: "/planning", icon: <Calendar size={18} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={18} /> },
  ];

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      
      {/* LOGO */}
      <div className="text-lg font-bold tracking-tight text-slate-900">
        ChangeGate
      </div>

      {/* MENU */}
      <nav className="flex items-center gap-6">
        {menu.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-2 text-sm font-medium transition " +
                (active ? "text-blue-600" : "text-slate-600 hover:text-slate-900")
              }
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* AVATAR + DROPDOWN */}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full bg-slate-300 cursor-pointer hover:opacity-80 transition"
        />

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
            
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <User size={16} />
              Profilo
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Settings size={16} />
              Impostazioni
            </Link>

            <button
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>
        )}
      </div>
    </header>
  );
}
