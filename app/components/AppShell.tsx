"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Topbar from "./Topbar";
import { supabase } from "@/lib/supabase";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const isAuth   = pathname === "/login" || pathname.startsWith("/auth/") || pathname === "/setup";
  const [checking, setChecking] = useState(!isAuth);

  useEffect(() => {
    if (isAuth) return;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login");
      else setChecking(false);
    });
  }, [isAuth]);

  if (isAuth) return <>{children}</>;
  if (checking) return null; // evita flash di contenuto non autorizzato

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Topbar />
      <main style={{ flex: 1, overflowY: "auto", backgroundColor: "var(--surface)", padding: "32px" }}>
        {children}
      </main>
    </div>
  );
}
