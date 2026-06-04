"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  requests: "Change Request",
  planning: "Planning",
  config: "Configurazioni",
  clienti: "Clienti",
  progetti: "Progetti",
  fornitori: "Fornitori",
  new: "Nuova",
};

export default function Topbar() {
  const pathname = usePathname();
  const [openUser, setOpenUser] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  // Build breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: breadcrumbMap[seg] ?? seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setOpenUser(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <header
      style={{
        height: 60,
        backgroundColor: "var(--surface-card)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
          Home
        </Link>
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--border)", fontSize: 16 }}>/</span>
            {i === crumbs.length - 1 ? (
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{crumb.label}</span>
            ) : (
              <Link href={crumb.href} style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Notifications */}
        <button
          style={{
            position: "relative",
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "1px solid var(--border)",
            backgroundColor: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              border: "1.5px solid white",
            }}
          />
        </button>

        {/* User */}
        <div ref={userRef} style={{ position: "relative" }}>
          <button
            onClick={() => setOpenUser(!openUser)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              color: "var(--text-primary)",
              fontWeight: 500,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={13} color="white" />
            </div>
            Admin
            <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
          </button>

          {openUser && (
            <div
              className="animate-fadeIn"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 180,
                backgroundColor: "var(--surface-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                overflow: "hidden",
                zIndex: 50,
              }}
            >
              {[
                { label: "Profilo", icon: <User size={14} />, href: "/profile" },
                { label: "Impostazioni", icon: <Settings size={14} />, href: "/settings" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 14px",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                  onClick={() => setOpenUser(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <div style={{ borderTop: "1px solid var(--border-soft)", margin: "4px 0" }} />
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 14px",
                  width: "100%",
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#ef4444",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
