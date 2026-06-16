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
import { useUser } from "@/lib/user-context";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon: React.ReactNode }[];
  hideForAdmin?: boolean;
};

export default function Topbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, isAdmin } = useUser();
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

  const allNav: NavItem[] = [
    { label: "Dashboard",      href: "/dashboard", icon: <LayoutDashboard size={15} /> },
    { label: "Change Request", href: "/requests",  icon: <GitPullRequest size={15} />, hideForAdmin: true },
    { label: "Planning",       href: "/planning",  icon: <CalendarDays size={15} />,   hideForAdmin: true },
    {
      label: "Configurazioni",
      icon: <Settings size={15} />,
      children: [
        { label: "Clienti",   href: "/config/clienti",   icon: <Building2 size={14} />,  hideForAdmin: true },
        { label: "Progetti",  href: "/config/progetti",  icon: <FolderOpen size={14} />, hideForAdmin: true },
        { label: "Fornitori", href: "/config/fornitori", icon: <Users size={14} /> },
        { label: "Utenti",    href: "/config/utenti",    icon: <UserCircle size={14} /> },
      ],
    },
  ];

  const nav = allNav.filter((item) => !(isAdmin && item.hideForAdmin));

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
                    {item.children.filter((child) => !(isAdmin && (child as NavItem).hideForAdmin)).map((child) => {
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
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", borderRadius: 8, border: "1px solid #334155", backgroundColor: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}
        >
          {/* Avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            backgroundColor: user?.avatar_bg ?? "#3b82f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: user?.avatar_colore ?? "white",
            letterSpacing: "0.02em",
          }}>
            {user ? user.avatar_iniziali.slice(0, 2).toUpperCase() : <User size={13} color="white" />}
          </div>
          {user?.nome.split(" ")[0] ?? "Profilo"}
          <ChevronDown size={12} style={{ color: "#64748b", transform: openUser ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </button>

        {openUser && (
          <div className="animate-fadeIn" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200, backgroundColor: "white", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", zIndex: 50 }}>
            {/* User info header */}
            {user && (
              <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: user.avatar_bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: user.avatar_colore, flexShrink: 0 }}>
                  {user.avatar_iniziali.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.nome}</div>
                </div>
              </div>
            )}
            <Link href="/profile" onClick={() => setOpenUser(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", fontSize: 13, color: "#374151", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <User size={14} />Profilo
            </Link>
            <div style={{ borderTop: "1px solid #f1f5f9", margin: "4px 0" }} />
            <button onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", width: "100%", border: "none", backgroundColor: "transparent", cursor: "pointer", fontSize: 13, color: "#ef4444", fontFamily: "inherit", textAlign: "left" }}
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
