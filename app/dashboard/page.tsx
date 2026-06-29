"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Clock, CheckCircle2, AlertCircle, Building2, Users, FolderOpen, GitPullRequest } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type CRStatus = "In Attesa" | "In Approvazione" | "In Lavorazione" | "Completata" | "Bloccata";

type RecentCR = { codice: string; titolo: string; cliente: string; created_at: string; stato: CRStatus; };
type Deadline  = { codice: string; titolo: string; data_fine: string; daysLeft: number; };

type FornitoreStats = {
  id: string;
  nome: string;
  attivo: boolean;
  num_clienti: number;
  cr_aperte: number;
  cr_totali: number;
};

const statusStyle: Record<string, { bg: string; color: string }> = {
  "In Attesa":       { bg: "#fef3c7", color: "#92400e" },
  "In Approvazione": { bg: "#ede9fe", color: "#5b21b6" },
  "In Lavorazione":  { bg: "#dbeafe", color: "#1e40af" },
  Completata:        { bg: "#d1fae5", color: "#065f46" },
  Bloccata:          { bg: "#fee2e2", color: "#991b1b" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function deadlineLabel(daysLeft: number): { label: string; color: string; bg: string } {
  if (daysLeft < 0)   return { label: "Scaduta", color: "#dc2626", bg: "#fef2f2" };
  if (daysLeft === 0) return { label: "Oggi",    color: "#dc2626", bg: "#fef2f2" };
  if (daysLeft === 1) return { label: "Domani",  color: "#d97706", bg: "#fffbeb" };
  return { label: `${daysLeft}gg`, color: "#64748b", bg: "#f8fafc" };
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard() {
  const [fornitori, setFornitori] = useState<FornitoreStats[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const { data: fData } = await supabase
        .from("cg_fornitori")
        .select(`id, nome, attivo, cg_clienti ( id, cg_progetti ( id, cg_change_requests ( id, stato ) ) )`)
        .order("nome");

      setFornitori((fData ?? []).map((f) => {
        const clienti = f.cg_clienti as unknown as { id: string; cg_progetti: { id: string; cg_change_requests: { id: string; stato: string }[] }[] }[];
        const allCRs  = clienti.flatMap((c) => c.cg_progetti.flatMap((p) => p.cg_change_requests));
        return {
          id:          f.id,
          nome:        f.nome,
          attivo:      f.attivo,
          num_clienti: clienti.length,
          cr_aperte:   allCRs.filter((cr) => cr.stato !== "Completata").length,
          cr_totali:   allCRs.length,
        };
      }));
      setLoading(false);
    }
    load();
  }, []);

  const totFornitori = fornitori.length;
  const totAttivi    = fornitori.filter((f) => f.attivo).length;
  const totClienti   = fornitori.reduce((s, f) => s + f.num_clienti, 0);
  const totCRAperte  = fornitori.reduce((s, f) => s + f.cr_aperte, 0);

  const statCards = [
    { label: "Fornitori attivi",  value: totAttivi,   icon: <Building2 size={18} color="#2563eb" />,  accent: "#eff6ff" },
    { label: "Clienti totali",    value: totClienti,  icon: <Users size={18} color="#059669" />,       accent: "#f0fdf4" },
    { label: "CR aperte totali",  value: totCRAperte, icon: <GitPullRequest size={18} color="#d97706" />, accent: "#fffbeb" },
    { label: "Fornitori totali",  value: totFornitori,icon: <FolderOpen size={18} color="#9333ea" />,  accent: "#fdf4ff" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>Panoramica generale del portale</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "var(--text-primary)", marginTop: 6, letterSpacing: "-0.02em" }}>
                  {loading ? "—" : s.value}
                </div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: s.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabella fornitori */}
      <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-soft)" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Dettaglio per fornitore</span>
        </div>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>Caricamento...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-soft)" }}>
                {["Fornitore", "Clienti attivati", "CR aperte", "CR totali", "Stato"].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fornitori.map((f, i) => (
                <tr key={f.id} style={{ borderBottom: i < fornitori.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                  <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{f.nome}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{f.num_clienti}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>client{f.num_clienti !== 1 ? "i" : "e"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: f.cr_aperte > 0 ? "#d97706" : "var(--text-muted)" }}>{f.cr_aperte}</span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 60, height: 5, backgroundColor: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: f.cr_totali === 0 ? "0%" : `${Math.round(((f.cr_totali - f.cr_aperte) / f.cr_totali) * 100)}%`, backgroundColor: "#10b981", borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{f.cr_totali}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: f.attivo ? "#d1fae5" : "#f1f5f9", color: f.attivo ? "#065f46" : "#64748b" }}>
                      {f.attivo ? "Attivo" : "Inattivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Standard Dashboard (PM Fornitore, PS, PM Cliente, KU) ───────────────────

function StandardDashboard({ fornitoreId }: { fornitoreId?: string | null }) {
  const [stats, setStats]       = useState({ aperte: 0, approvazione: 0, completateMese: 0, scadute: 0 });
  const [recent, setRecent]     = useState<RecentCR[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      let q = supabase
        .from("cg_change_requests")
        .select(`id, codice, titolo, stato, created_at, data_fine, cg_progetti!inner ( cg_clienti!inner ( nome, fornitore_id ) )`)
        .order("created_at", { ascending: false });
      if (fornitoreId) q = (q as typeof q).eq("cg_progetti.cg_clienti.fornitore_id", fornitoreId);
      const { data } = await q;

      const rows = data ?? [];
      const aperte         = rows.filter((r) => r.stato !== "Completata").length;
      const approvazione   = rows.filter((r) => r.stato === "In Approvazione").length;
      const completateMese = rows.filter((r) => r.stato === "Completata" && r.created_at >= firstOfMonth).length;
      const scadute        = rows.filter((r) => { if (!r.data_fine || r.stato === "Completata") return false; return new Date(r.data_fine) < today; }).length;
      setStats({ aperte, approvazione, completateMese, scadute });

      setRecent(rows.slice(0, 5).map((r) => {
        const proj = r.cg_progetti as unknown as { cg_clienti: { nome: string } } | null;
        return { codice: r.codice, titolo: r.titolo, cliente: proj?.cg_clienti?.nome ?? "—", created_at: r.created_at, stato: r.stato as CRStatus };
      }));

      setDeadlines(rows
        .filter((r) => r.data_fine && r.stato !== "Completata")
        .map((r) => ({ codice: r.codice, titolo: r.titolo, data_fine: r.data_fine!, daysLeft: Math.ceil((new Date(r.data_fine!).getTime() - today.setHours(0,0,0,0)) / 86400000) }))
        .sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5));

      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: "CR Aperte",         value: stats.aperte,         delta: "Totale non completate", deltaColor: "#059669", icon: <TrendingUp size={18} color="#2563eb" />,   accent: "#eff6ff" },
    { label: "In Approvazione",   value: stats.approvazione,   delta: "In attesa di ok",        deltaColor: "#d97706", icon: <Clock size={18} color="#d97706" />,         accent: "#fffbeb" },
    { label: "Completate (mese)", value: stats.completateMese, delta: "Questo mese",            deltaColor: "#64748b", icon: <CheckCircle2 size={18} color="#059669" />,  accent: "#f0fdf4" },
    { label: "Scadute",           value: stats.scadute,        delta: "Da gestire",             deltaColor: "#dc2626", icon: <AlertCircle size={18} color="#dc2626" />,   accent: "#fef2f2" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>Panoramica attività e change request</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "var(--text-primary)", marginTop: 6, letterSpacing: "-0.02em" }}>{loading ? "—" : s.value}</div>
                <div style={{ fontSize: 12, color: s.deltaColor, marginTop: 4 }}>{s.delta}</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: s.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-soft)" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Ultime 5 CR inserite</span>
            <a href="/requests" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>Vedi tutte →</a>
          </div>
          {loading ? <div style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Caricamento...</div> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-soft)" }}>
                  {["ID", "Titolo", "Cliente", "Inserita", "Stato"].map((h) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Nessuna CR</td></tr>
                : recent.map((cr, i) => (
                  <tr key={cr.codice} style={{ borderBottom: i < recent.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                    <td style={{ padding: "12px 20px" }}><span style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", fontFamily: "DM Mono, monospace" }}>{cr.codice}</span></td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text-primary)", maxWidth: 200 }}>{cr.titolo}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text-secondary)" }}>{cr.cliente}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" as const }}>{formatDate(cr.created_at)}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: statusStyle[cr.stato]?.bg, color: statusStyle[cr.stato]?.color, whiteSpace: "nowrap" as const }}>{cr.stato}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-soft)" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Prossime scadenze</span>
          </div>
          {loading ? <div style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Caricamento...</div>
          : deadlines.length === 0 ? <div style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Nessuna scadenza</div>
          : <div style={{ padding: "8px 0" }}>
              {deadlines.map((d, i) => {
                const { label, color, bg } = deadlineLabel(d.daysLeft);
                return (
                  <div key={d.codice} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: i < deadlines.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{d.titolo}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, fontFamily: "DM Mono, monospace" }}>{d.codice}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color, backgroundColor: bg, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" as const, marginLeft: 8 }}>{label}</span>
                  </div>
                );
              })}
            </div>}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { isAdmin, isPmFornitore, isPsFornitore, user, loading } = useUser();
  if (loading) return null;
  return isAdmin ? <AdminDashboard /> : <StandardDashboard fornitoreId={(isPmFornitore || isPsFornitore) ? (user?.fornitore_id ?? null) : null} />;
}
