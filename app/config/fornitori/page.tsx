"use client";

import { Plus, Users, CheckCircle2, Circle } from "lucide-react";

type CRStatus = "In Attesa" | "In Approvazione" | "In Lavorazione" | "Completata" | "Bloccata";
type CR = { id: string; title: string; status: CRStatus; };
type Project = { id: string; name: string; crs: CR[]; };
type Client = { id: string; name: string; projects: Project[]; };
type Fornitore = { id: number; nome: string; email: string; pm: number; specialisti: number; attivo: boolean; clients: Client[]; };

const fornitori: Fornitore[] = [
  {
    id: 1, nome: "Tech Solutions Srl", email: "info@techsolutions.it", pm: 3, specialisti: 8, attivo: true,
    clients: [
      { id: "C-01", name: "ACME Srl", projects: [
        { id: "PRJ-001", name: "Gestionale 2.0", crs: [
          { id: "CR-001", title: "Aggiornamento fatturazione", status: "Completata" },
          { id: "CR-002", title: "Fix bug reportistica", status: "In Lavorazione" },
          { id: "CR-003", title: "Dashboard KPI", status: "Completata" },
        ]},
      ]},
      { id: "C-02", name: "BetaCorp", projects: [
        { id: "PRJ-002", name: "Portale Clienti", crs: [
          { id: "CR-004", title: "Migrazione cloud", status: "In Attesa" },
          { id: "CR-005", title: "Modulo pagamenti", status: "In Approvazione" },
        ]},
      ]},
    ],
  },
  {
    id: 2, nome: "Innova Consulting", email: "contact@innovaconsulting.it", pm: 2, specialisti: 5, attivo: true,
    clients: [
      { id: "C-03", name: "GammaTech", projects: [
        { id: "PRJ-003", name: "Analytics Suite", crs: [
          { id: "CR-006", title: "Integrazione GA4", status: "Completata" },
          { id: "CR-007", title: "Export CSV", status: "In Lavorazione" },
          { id: "CR-008", title: "Dashboard WebSocket", status: "Bloccata" },
        ]},
      ]},
    ],
  },
  { id: 3, nome: "Digital Factory", email: "hello@digitalfactory.it", pm: 1, specialisti: 3, attivo: false, clients: [] },
];

function getStats(f: Fornitore) {
  const allCRs = f.clients.flatMap((c) => c.projects.flatMap((p) => p.crs));
  const total = allCRs.length;
  const closed = allCRs.filter((cr) => cr.status === "Completata").length;
  const open = total - closed;
  const pct = total === 0 ? 0 : Math.round((closed / total) * 100);
  return { total, closed, open, clientCount: f.clients.length, projectCount: f.clients.reduce((s, c) => s + c.projects.length, 0), pct };
}

function MiniProgress({ pct, closed, total }: { pct: number; closed: number; total: number }) {
  if (total === 0) return <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 80, height: 6, backgroundColor: "#e2e8f0", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct === 100 ? "#10b981" : "#3b82f6", borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap" as const, fontWeight: 500 }}>
        {closed}/{total} — {pct}%
      </span>
    </div>
  );
}

const STICKY: React.CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  boxShadow: "3px 0 8px -2px rgba(0,0,0,0.08)",
};

export default function FornitoriPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Fornitori</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            {fornitori.filter((f) => f.attivo).length} attivi · {fornitori.length} totali
          </p>
        </div>
        <a href="/config/fornitori/new" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
          <Plus size={15} />Nuovo Fornitore
        </a>
      </div>

      {/* Scrollable table container */}
      <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", tableLayout: "fixed" as const, width: "max-content" }}>
          <colgroup>
            <col style={{ width: 220 }} />  {/* Fornitore — sticky */}
            <col style={{ width: 210 }} />  {/* Team */}
            <col style={{ width: 150 }} />  {/* Clienti */}
            <col style={{ width: 150 }} />  {/* Progetti */}
            <col style={{ width: 230 }} />  {/* CR chiuse/aperte */}
            <col style={{ width: 260 }} />  {/* Avanzamento */}
            <col style={{ width: 130 }} />  {/* Stato */}
            <col style={{ width: 110 }} />  {/* Azioni */}
          </colgroup>

          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-soft)", backgroundColor: "#f8fafc" }}>
              {[
                { label: "Fornitore", sticky: true },
                { label: "Team" },
                { label: "Clienti" },
                { label: "Progetti" },
                { label: "CR chiuse / aperte" },
                { label: "Avanzamento" },
                { label: "Stato" },
                { label: "" },
              ].map((h) => (
                <th key={h.label} style={{
                  padding: "11px 20px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap" as const,
                  backgroundColor: "#f8fafc",
                  ...(h.sticky ? { ...STICKY, zIndex: 3 } : {}),
                }}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {fornitori.map((f, i) => {
              const { closed, open, clientCount, projectCount, pct, total } = getStats(f);
              const isLast = i === fornitori.length - 1;
              return (
                <tr key={f.id} style={{ borderBottom: isLast ? "none" : "1px solid var(--border-soft)", transition: "background 0.1s", cursor: "pointer" }}
                  onMouseEnter={(e) => Array.from(e.currentTarget.cells).forEach((td) => { if (!(td as HTMLElement).style.position) (td as HTMLElement).style.backgroundColor = "#f8fafc"; })}
                  onMouseLeave={(e) => Array.from(e.currentTarget.cells).forEach((td) => { if (!(td as HTMLElement).style.position) (td as HTMLElement).style.backgroundColor = "transparent"; })}
                >
                  {/* Fornitore — sticky */}
                  <td style={{ padding: "16px 20px", backgroundColor: "white", ...STICKY }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" as const }}>{f.nome}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{f.email}</div>
                  </td>

                  {/* Team */}
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: 20 }}>
                      {[
                        { count: f.pm, label: "PM", bg: "#eff6ff", color: "#2563eb" },
                        { count: f.specialisti, label: "Specialisti", bg: "#f0fdf4", color: "#059669" },
                      ].map((t) => (
                        <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: t.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Users size={14} color={t.color} />
                          </div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{t.count}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1, whiteSpace: "nowrap" as const }}>{t.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Clienti */}
                  <td style={{ padding: "16px 20px" }}>
                    {clientCount > 0 ? (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                        <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{clientCount}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>client{clientCount !== 1 ? "i" : "e"}</span>
                      </div>
                    ) : <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>}
                  </td>

                  {/* Progetti */}
                  <td style={{ padding: "16px 20px" }}>
                    {projectCount > 0 ? (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                        <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{projectCount}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>progett{projectCount !== 1 ? "i" : "o"}</span>
                      </div>
                    ) : <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>}
                  </td>

                  {/* CR chiuse / aperte */}
                  <td style={{ padding: "16px 20px" }}>
                    {total > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle2 size={16} color="#059669" />
                          <span style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}>{closed}</span>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>chiuse</span>
                        </div>
                        <div style={{ width: 1, height: 22, backgroundColor: "var(--border)" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Circle size={16} color="#d97706" />
                          <span style={{ fontSize: 16, fontWeight: 700, color: "#d97706" }}>{open}</span>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>aperte</span>
                        </div>
                      </div>
                    ) : <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>}
                  </td>

                  {/* Avanzamento */}
                  <td style={{ padding: "16px 20px" }}>
                    <MiniProgress pct={pct} closed={closed} total={total} />
                  </td>

                  {/* Stato */}
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" as const, backgroundColor: f.attivo ? "#d1fae5" : "#f1f5f9", color: f.attivo ? "#065f46" : "#64748b" }}>
                      {f.attivo ? "Attivo" : "Inattivo"}
                    </span>
                  </td>

                  {/* Azioni */}
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <button style={{ fontSize: 13, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" as const }}>
                      Modifica
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
