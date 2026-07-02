"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/lib/user-context";

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, isPmFornitore, isPsFornitore } = useUser();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // pm_cliente e ku_cliente: nessun accesso a /config
    if (user?.ruolo === "pm_cliente" || user?.ruolo === "ku_cliente") {
      router.replace("/dashboard");
      return;
    }

    // ps_fornitore: solo /config/fornitori (sola lettura), tutto il resto vietato
    if (isPsFornitore) {
      if (!pathname.startsWith("/config/fornitori")) {
        router.replace("/dashboard");
        return;
      }
    }

    // admin: solo /config/fornitori e /config/utenti
    if (isAdmin) {
      if (!pathname.startsWith("/config/fornitori") && !pathname.startsWith("/config/utenti")) {
        router.replace("/dashboard");
        return;
      }
    }

    // pm_fornitore: tutto /config tranne /config/fornitori
    if (isPmFornitore) {
      if (pathname.startsWith("/config/fornitori")) {
        router.replace("/dashboard");
        return;
      }
    }
  }, [loading, user, isAdmin, isPmFornitore, isPsFornitore, pathname, router]);

  if (loading) return null;

  const ruolo = user?.ruolo;
  if (ruolo === "pm_cliente" || ruolo === "ku_cliente") return null;
  if (isPsFornitore && !pathname.startsWith("/config/fornitori")) return null;
  if (isAdmin && !pathname.startsWith("/config/fornitori") && !pathname.startsWith("/config/utenti")) return null;
  if (isPmFornitore && pathname.startsWith("/config/fornitori")) return null;

  return <>{children}</>;
}
