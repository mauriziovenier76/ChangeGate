"use client";

import { Plus, Users, FolderOpen, CheckCircle2, Circle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CRStatus = "In Attesa" | "In Approvazione" | "In Lavorazione" | "Completata" | "Bloccata";

type CR = {
  id: string;
  title: string;
  status: CRStatus;
};

type Project = {
  id: string;
  name: string;
  crs: CR[];
};

type Client = {
  id: string;
  name: string;
  projects: Project[];
};

type Fornitore = {
  id: number;
  nome: string;
  email: string;
  pm: number;
  specialisti: number;
  attivo: boolean;
  clients: Client[];
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const fornitori: Fornitore[] = [
  {
    id: 1,
    nome: "Tech Solutions Srl",
    email: "info@techsolutions.it",
    pm: 3,
    specialisti: 8,
    attivo: true,
    clients: [
      {
        id: "C-01", name: "ACME Srl",
        projects: [
          { id: "PRJ-001", name: "Gestionale 2.0", crs: [
            { id: "CR-001", title: "Aggiornamento fatturazione", status: "Completata" },
            { id: "CR-002", title: "Fix bug reportistica", status: "In Lavorazione" },
            { id: "CR-003", title: "Dashboard KPI", status: "Completata" },
          ]},
        ],
      },
      {
        id: "C-02", name: "BetaCorp",
        projects: [
          { id: "PRJ-002", name: "Portale Clienti", crs: [
            { id: "CR-004", title: "Migrazione cloud", status: "In Attesa" },
            { id: "CR-005", title: "Modulo pagamenti", status: "In Approvazione" },
          ]},
        ],
      },
    ],
  },
  {
    id: 2,
    nome: "Innova Consulting",
    email: "contact@innovaconsulting.it",
    pm: 2,
    specialisti: 5,
    attivo: true,
    clients: [
      {
        id: "C-03", name: "GammaTech",
        projects: [
          { id: "PRJ-003", name: "Analytics Suite", crs: [
            { id: "CR-006", title: "Integrazione GA4", status: "Completata" },
            { id: "CR-007", title: "Export CSV", status: "In Lavorazione" },
            { id: "CR-008", title: "Dashboard WebSocket", status: "Bloccata" },
          ]},
        ],
      },
    ],
  },
  {
    id: 3,
    nome: "Digital Factory",
    email: "hello@digitalfactory.it",
    pm: 1,
    specialisti: 3,
    attivo: false,
    clients: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStats(f: Fornitore) {
  const allCRs = f.clients.flatMap((c) => c.projects.flatMap((p) => p.crs));
  const total = allCRs.length;
  const closed = allCRs.filter((cr) => cr.status === "Completata").length;
  const open = total - closed;
  const clientCount = f.clients.length;
  const projectCount = f.clients.reduce((sum, c) => sum + c.projects.length, 0);
  const pct = total === 0 ? 0 : Math.round((closed / total) * 100);
  return { total, closed, open, clientCount, projectCount, pct };
}

// ─── Progress mini bar ────────────────────────────────────────────────────────

function MiniProgress({ pct, closed, total }: { pct: number; closed: number; total: number }) {
  if (total === 0) return <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 60, height: 5, backgroundColor: "#e2e8f0", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct === 100 ? "#10b981" : "#3b82f6", borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" as const }}>
        {closed}/{total}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FornitoriPage() {
  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Fornitori
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            {fornitori.filter((f) => f.attivo).length} attivi · {fornitori.length} totali
          </p>
        </div>
        <a
          href="/config/fornitori/new"
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}
        >
          <Plus size={15} />
          Nuovo Fornitore
        </a>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-soft)", backgroundColor: "#f8fafc" }}>
              {[
                "Fornitore",
                "Contatto",
                "Team",
                "Clienti",
                "Progetti",
                "CR chiuse / aperte",
                "Avanzamento",
                "Stato",
                "",
              ].map((h) => (
                <th
                  key={h}
                  style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fornitori.map((f, i) => {
              const { closed, open, clientCount, projectCount, pct, total } = getStats(f);
              return (
                <tr
                  key={f.id}
                  style={{ borderBottom: i < fornitori.length - 1 ? "1px solid var(--border-soft)" : "none", transition: "background 0.1s", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* Fornitore */}
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{f.nome}</div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-secondary)" }}>
                    {f.email}
                  </td>

                  {/* Team: PM + Specialisti */}
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Users size={12} color="#2563eb" />
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{f.pm}</span> PM
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Users size={12} color="#059669" />
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{f.specialisti}</span> Spec.
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Clienti */}
                  <td style={{ padding: "14px 18px" }}>
                    {clientCount > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{clientCount}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>client{clientCount !== 1 ? "i" : "e"}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>
                    )}
                  </td>

                  {/* Progetti */}
                  <td style={{ padding: "14px 18px" }}>
                    {projectCount > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{projectCount}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>progett{projectCount !== 1 ? "i" : "o"}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>
                    )}
                  </td>

                  {/* CR chiuse / aperte */}
                  <td style={{ padding: "14px 18px" }}>
                    {total > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={13} color="#059669" />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>{closed}</span>
                        </div>
                        <span style={{ fontSize: 12, color: "#cbd5e1" }}>/</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Circle size={13} color="#d97706" />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#d97706" }}>{open}</span>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>
                    )}
                  </td>

                  {/* Progress bar */}
                  <td style={{ padding: "14px 18px" }}>
                    <MiniProgress pct={pct} closed={closed} total={total} />
                  </td>

                  {/* Stato */}
                  <td style={{ padding: "14px 18px" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: f.attivo ? "#d1fae5" : "#f1f5f9", color: f.attivo ? "#065f46" : "#64748b" }}>
                      {f.attivo ? "Attivo" : "Inattivo"}
                    </span>
                  </td>

                  {/* Azioni */}
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    <button style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
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
