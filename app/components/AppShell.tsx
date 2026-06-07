"use client";

import { usePathname } from "next/navigation";
import Topbar from "./Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/login";

  if (isAuth) return <>{children}</>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Topbar />
      <main style={{ flex: 1, overflowY: "auto", backgroundColor: "var(--surface)", padding: "32px" }}>
        {children}
      </main>
    </div>
  );
}
