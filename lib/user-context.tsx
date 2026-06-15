"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type Ruolo = "admin" | "pm_fornitore" | "ps_fornitore" | "pm_cliente" | "ku_cliente";

export type UserProfile = {
  id: string;
  nome: string;
  email: string | null;
  ruolo: Ruolo;
  attivo: boolean;
  fornitore_id: string | null;
  cliente_id: string | null;
  avatar_iniziali: string;
  avatar_bg: string;
  avatar_colore: string;
};

type UserContextType = {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isPmFornitore: boolean;
  isPsFornitore: boolean;
  isPmCliente: boolean;
  isKuCliente: boolean;
  isFornitore: boolean; // admin | pm_fornitore | ps_fornitore
  isCliente: boolean;  // pm_cliente | ku_cliente
  canManageProjects: boolean;
  canCreateCR: boolean;
  canEditCR: (crPmId?: string | null, crSpecialistaId?: string | null) => boolean;
  canViewCR: boolean;
  canCreateFornitore: boolean;
  canCreateCliente: boolean;
  canCreatePmFornitore: boolean;
  canCreatePsFornitore: boolean;
  canCreatePmCliente: boolean;
  canCreateKuCliente: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) { setLoading(false); return; }

      const authUser = session.session.user;

      let { data } = await supabase.from("cg_utenti")
        .select("id, nome, email, ruolo, attivo, fornitore_id, cliente_id, avatar_iniziali, avatar_bg, avatar_colore")
        .eq("auth_user_id", authUser.id).single();

      if (!data && authUser.email) {
        const { data: byEmail } = await supabase.from("cg_utenti")
          .select("id, nome, email, ruolo, attivo, fornitore_id, cliente_id, avatar_iniziali, avatar_bg, avatar_colore")
          .eq("email", authUser.email).single();
        if (byEmail) {
          await supabase.from("cg_utenti").update({ auth_user_id: authUser.id }).eq("id", byEmail.id);
          data = byEmail;
        }
      }

      if (data) setUser(data as UserProfile);
      setLoading(false);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => loadUser());
    return () => listener.subscription.unsubscribe();
  }, []);

  const ruolo = user?.ruolo;
  const isAdmin        = ruolo === "admin";
  const isPmFornitore  = ruolo === "pm_fornitore";
  const isPsFornitore  = ruolo === "ps_fornitore";
  const isPmCliente    = ruolo === "pm_cliente";
  const isKuCliente    = ruolo === "ku_cliente";
  const isFornitore    = isAdmin || isPmFornitore || isPsFornitore;
  const isCliente      = isPmCliente || isKuCliente;

  const ctx: UserContextType = {
    user, loading,
    isAdmin, isPmFornitore, isPsFornitore, isPmCliente, isKuCliente,
    isFornitore, isCliente,
    canManageProjects:   isPmFornitore,
    canCreateCR:         isPmFornitore,
    canEditCR: (crPmId, crSpecialistaId) => {
      if (isPmFornitore) return true;
      if (isPsFornitore) return crSpecialistaId === user?.id || crPmId === user?.id;
      return false;
    },
    canViewCR:           isAdmin === false, // tutti tranne admin vedono CR
    canCreateFornitore:  isAdmin,
    canCreateCliente:    isAdmin || isPmFornitore,
    canCreatePmFornitore: isAdmin || isPmFornitore,
    canCreatePsFornitore: isPmFornitore,
    canCreatePmCliente:  isPmFornitore,
    canCreateKuCliente:  isPmCliente,
  };

  return <UserContext.Provider value={ctx}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
