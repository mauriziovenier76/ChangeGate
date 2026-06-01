"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ListChecks,
  Calendar,
  Settings,
  Users,
  FolderKanban,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Topbar() {
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openUser, setOpenUser] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        userRef.current &&
        !userRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(null);
        setOpenUser(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menu = [
    {
      name: "Dashboard",
      icon: <Home size={16} />,
      links: [
        { label: "Overview", href: "/dashboard" },
        { label: "Statistiche", href: "/dashboard/stats" },
      ],
    },
    {
      name: "Change Request",
      icon: <ListChecks size={16} />,
      links: [
        { label: "Lista", href: "/requests" },
        { label: "Nuova CR", href: "/requests/new" },
      ],
    },
    {
      name: "Planning",
      icon: <Calendar size={16} />,
      links: [
        { label: "Calendario", href: "/planning" },
        { label: "Timeline", href: "/planning/timeline" },
      ],
    },
    {
      name: "Configurazioni",
      icon: <Settings size={16} />,
      links: [
        { label: "Clienti", href: "/config/clienti" },
        { label: "Progetti", href: "/config/progetti" },
      ],
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">

      {/* LOGO */}
      <div className="text-lg font-bold tracking-tight text-slate-900">
        ChangeGate
      </div>

      {/* MENU */}
      <nav className="flex items-center gap-6 text-sm" ref={menuRef}>
        {menu.map((item) => {
          const isOpen = openMenu === item.name;

          return (
            <div key={item.name} className="relative">
              <button
                onClick={() =>
                  setOpenMenu(isOpen ? null : item.name)
                }
                className="flex items-center gap-1 text-slate-700 hover:text-slate-900 transition"
              >
                {item.icon}
                {item.name}
                <ChevronDown size={14} />
              </button>

              {isOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
                  {item.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* USER DROPDOWN */}
      <div className="relative" ref={userRef}>
        <div
          onClick={() => setOpenUser(!openUser)}
          className="w-9 h-9 rounded-full bg-slate-300 cursor-pointer hover:opacity-80 transition"
        />

        {openUser && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
            <Link
              href="/profile"
              className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Profilo
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Impostazioni
            </Link>
            <button className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
