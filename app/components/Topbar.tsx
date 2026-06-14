"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import {
  LayoutDashboard, GitPullRequest, CalendarDays,
  Settings, ChevronDown, LogOut, User, FolderGit2,
  Building2, FolderOpen, Users, UserCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon: React.ReactNode }[];
};

const nav: NavItem[] = [
  { label: "Dashboard",      href: "/dashboard",  icon: <LayoutDashboard size={15} /> },
  { label: "Change Request", href: "/requests",   icon: <GitPullRequest size={15} /> },
  { label: "Planning",       href: "/planning",   icon: <CalendarDays size={15} /> },
  {
    label: "Configurazioni",
    icon: <Settings size={15} />,
    children: [
      { label: "Clienti",    href: "/config/clienti",   icon: <Building2 size={14} /> },
      { label: "Progetti",   href: "/config/progetti",  icon: <FolderOpen size={14} /> },
      { label: "Fornitori",  href: "/config/fornitori", icon: <Users size={14} /> },
      { label: "Utenti",     href: "/config/utenti",    icon: <UserCircle size={14} /> },
    ],
  },
];

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openUser, setOpenUser]         = useState(false);
  const navRef  = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (navRef.current  && !navRef.current.contains(e.target as Node))  setOpenDropdown(null);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setOpenUser(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const isActive = (item: NavItem) => {
    if (item.href) return pathname === item.href || pathname.startsWith(item.href + "/");
    return item.children?.some((c) => pathname.startsWith(c.href)) ?? false;
  };

  return (
    <header style={{
      height: 56,
      backgroundColor: "#0f172a",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: 0,
      flexShrink: 0,
      borderBottom: "1px solid #1e293b",
    }}>

      {/* Logo */}
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", marginRight: 32, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FolderGit2 size={15} color="white" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>ChangeGate</span>
      </Link>

      {/* Nav items */}
      <nav ref={navRef} style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        {nav.map((item) => {
          const active = isActive(item);

          if (item.children) {
            const open = openDropdown === item.label;
            return (
              <div key={item.label} style={{ position: "relative" }}>
                <button
                  onClick={() => setOpenDropdown(open ? null : item.label)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "6px 12px", borderRadius: 7,
                    border: "none", background: active ? "rgba(255,255,255,0.1)" : "transparent",
                    cursor: "pointer", fontFamily: "inherit",
                    fontSize: 13, fontWeight: active ? 600 : 500,
                    color: active ? "#fff" : "#94a3b8",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#e2e8f0"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#94a3b8"; }}
                >
                  <span style={{ color: active ? "#93c5fd" : "#64748b" }}>{item.icon}</span>
                  {item.label}
                  <ChevronDown size={12} style={{ color: "#64748b", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                </button>

                {open && (
                  <div className="animate-fadeIn" style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0,
                    width: 200, backgroundColor: "white",
                    border: "1px solid var(--border)", borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    overflow: "hidden", zIndex: 50,
                  }}>
                    {item.children.map((child) => {
                      const childActive = pathname.startsWith(child.href);
                      return (
                        <Link key={child.href} href={child.href}
                          onClick={() => setOpenDropdown(null)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 14px", textDecoration: "none",
                            backgroundColor: childActive ? "#eff6ff" : "transparent",
                            fontSize: 13, fontWeight: childActive ? 600 : 400,
                            color: childActive ? "#2563eb" : "#374151",
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={(e) => { if (!childActive) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                          onMouseLeave={(e) => { if (!childActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                        >
                          <span style={{ color: childActive ? "#2563eb" : "#94a3b8" }}>{child.icon}</span>
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href!}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "6px 12px", borderRadius: 7, textDecoration: "none",
                backgroundColor: active ? "rgba(255,255,255,0.1)" : "transparent",
                fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? "#fff" : "#94a3b8",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "#e2e8f0"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
            >
              <span style={{ color: active ? "#93c5fd" : "#64748b" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User menu */}
      <div ref={userRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setOpenUser(!openUser)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 10px", borderRadius: 8,
            border: "1px solid #334155", backgroundColor: "transparent",
            cursor: "pointer", fontFamily: "inherit",
            fontSize: 13, color: "#e2e8f0", fontWeight: 500,
          }}
        >
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={13} color="white" />
          </div>
          Admin
          <ChevronDown size={12} style={{ color: "#64748b", transform: openUser ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </button>

        {openUser && (
          <div className="animate-fadeIn" style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)",
            width: 180, backgroundColor: "white",
            border: "1px solid var(--border)", borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            overflow: "hidden", zIndex: 50,
          }}>
            {[
              { label: "Profilo",       icon: <User size={14} />,     href: "/profile" },
              { label: "Impostazioni",  icon: <Settings size={14} />, href: "/settings" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                onClick={() => setOpenUser(false)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", fontSize: 13, color: "#374151", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {item.icon}{item.label}
              </Link>
            ))}
            <div style={{ borderTop: "1px solid #f1f5f9", margin: "4px 0" }} />
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", width: "100%", border: "none", backgroundColor: "transparent", cursor: "pointer", fontSize: 13, color: "#ef4444", fontFamily: "inherit", textAlign: "left" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogOut size={14} />Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
