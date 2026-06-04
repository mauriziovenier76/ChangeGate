"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitPullRequest,
  CalendarDays,
  Settings,
  Building2,
  FolderGit2,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
};

const nav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Change Request",
    href: "/requests",
    icon: <GitPullRequest size={18} />,
  },
  {
    label: "Planning",
    href: "/planning",
    icon: <CalendarDays size={18} />,
  },
  {
    label: "Configurazioni",
    icon: <Settings size={18} />,
    children: [
      { label: "Clienti", href: "/config/clienti" },
      { label: "Progetti", href: "/config/progetti" },
      { label: "Fornitori", href: "/config/fornitori" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(
    pathname.startsWith("/config") ? "Configurazioni" : null
  );

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: "100vh",
        backgroundColor: "var(--sidebar-bg)",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #1e293b",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FolderGit2 size={16} color="white" />
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.02em",
              }}
            >
              ChangeGate
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
              Change Management
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {nav.map((item) => {
          const isActive = item.href
            ? pathname === item.href || pathname.startsWith(item.href + "/")
            : item.children?.some((c) => pathname.startsWith(c.href));
          const isOpen = openGroup === item.label;

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setOpenGroup(isOpen ? null : item.label)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: isActive ? "var(--sidebar-hover)" : "transparent",
                    color: isActive ? "#e2e8f0" : "var(--sidebar-text)",
                    fontSize: 13.5,
                    fontWeight: 500,
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "background 0.15s, color 0.15s",
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sidebar-hover)";
                      (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)";
                    }
                  }}
                >
                  <span style={{ color: isActive ? "#93c5fd" : "#64748b" }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isOpen
                    ? <ChevronDown size={14} style={{ color: "#64748b" }} />
                    : <ChevronRight size={14} style={{ color: "#64748b" }} />}
                </button>
                {isOpen && (
                  <div style={{ paddingLeft: 36, marginBottom: 4 }} className="animate-slideIn">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          style={{
                            display: "block",
                            padding: "6px 10px",
                            borderRadius: 6,
                            fontSize: 13,
                            color: childActive ? "#93c5fd" : "#94a3b8",
                            fontWeight: childActive ? 600 : 400,
                            textDecoration: "none",
                            marginBottom: 1,
                            backgroundColor: childActive ? "rgba(37,99,235,0.15)" : "transparent",
                            transition: "background 0.15s, color 0.15s",
                          }}
                        >
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
            <Link
              key={item.href}
              href={item.href!}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 7,
                textDecoration: "none",
                color: isActive ? "#ffffff" : "var(--sidebar-text)",
                backgroundColor: isActive ? "var(--sidebar-active)" : "transparent",
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                marginBottom: 2,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span style={{ color: isActive ? "#93c5fd" : "#64748b" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Users size={15} color="white" />
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Admin
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Amministratore</div>
        </div>
      </div>
    </aside>
  );
}
