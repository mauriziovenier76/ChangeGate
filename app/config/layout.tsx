"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/lib/user-context";

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isPmCliente, isKuCliente } = useUser();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // pm_cliente e ku_cliente non possono accedere a nessuna pagina di config
    if (isPmCliente || isKuCliente) {
      router.replace("/dashboard");
      return;
    }

    // ps_fornitore non può accedere a /config/utenti
    if (user?.ruolo === "ps_fornitore" && pathname.startsWith("/config/utenti")) {
      router.replace("/dashboard");
      return;
    }

    // pm_fornitore non può accedere a /config/fornitori
    if (user?.ruolo === "pm_fornitore" && pathname.startsWith("/config/fornitori")) {
      router.replace("/dashboard");
      return;
    }
  }, [loading, user, isPmCliente, isKuCliente, pathname, router]);

  // Blocca il render finché il profilo non è caricato
  if (loading) return null;

  // Blocca il render se il ruolo non è autorizzato (evita flash prima del redirect)
  if (isPmCliente || isKuCliente) return null;
  if (user?.ruolo === "ps_fornitore" && pathname.startsWith("/config/utenti")) return null;
  if (user?.ruolo === "pm_fornitore" && pathname.startsWith("/config/fornitori")) return null;

  return <>{children}</>;
}
