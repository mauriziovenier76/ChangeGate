"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Search, X, Calendar, Clock, User, AlignLeft } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CRStatus = "In Attesa" | "In Approvazione" | "In Lavorazione" | "Completata" | "Bloccata";
type CRPriority = "Alta" | "Media" | "Bassa";

type CR = {
  id: string;
  title: string;
  status: CRStatus;
  priority: CRPriority;
  estimate: number | null;
  startDate: string | null;
  endDate: string | null;
  assignedTo: string | null;
  description?: string;
};

type Project = {
  id: string;
  name: string;
  client: string;
  crs: CR[];
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockProjects: Project[] = [
  {
    id: "PRJ-001",
    name: "Gestionale 2.0",
    client: "ACME Srl",
    crs: [
      { id: "CR-001", title: "Aggiornamento modulo fatturazione", status: "In Approvazione", priority: "Alta", estimate: 16, startDate: "2024-06-10", endDate: "2024-06-20", assignedTo: "Marco R.", description: "Aggiornare il modulo di fatturazione per supportare il nuovo formato XML richiesto dall'Agenzia delle Entrate." },
      { id: "CR-002", title: "Fix bug reportistica mensile", status: "In Lavorazione", priority: "Media", estimate: 8, startDate: "2024-06-12", endDate: "2024-06-15", assignedTo: "Sara B." },
      { id: "CR-003", title: "Nuova dashboard KPI direzione", status: "Completata", priority: "Bassa", estimate: 24, startDate: "2024-05-01", endDate: "2024-05-20", assignedTo: "Marco R." },
    ],
  },
  {
    id: "PRJ-002",
    name: "Portale Clienti",
    client: "BetaCorp",
    crs: [
      { id: "CR-004", title: "Migrazione infrastruttura cloud", status: "In Attesa", priority: "Alta", estimate: null, startDate: null, endDate: null, assignedTo: null },
      { id: "CR-005", title: "Rollout modulo pagamenti online", status: "In Attesa", priority: "Alta", estimate: 32, startDate: "2024-07-01", endDate: "2024-07-15", assignedTo: null },
    ],
  },
  {
    id: "PRJ-003",
    name: "Analytics Suite",
    client: "GammaTech",
    crs: [
      { id: "CR-006", title: "Integrazione Google Analytics 4", status: "Completata", priority: "Media", estimate: 12, startDate: "2024-04-10", endDate: "2024-04-18", assignedTo: "Luca M." },
      { id: "CR-007", title: "Export dati in formato CSV", status: "In Lavorazione", priority: "Bassa", estimate: 6, startDate: "2024-06-14", endDate: "2024-06-17", assignedTo: "Sara B." },
      { id: "CR-008", title: "Dashboard real-time WebSocket", status: "Bloccata", priority: "Alta", estimate: 40, startDate: null, endDate: null, assignedTo: "Luca M." },
    ],
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const statusStyle: Record<CRStatus, { bg: string; color: string }> = {
  "In Attesa":       { bg: "#fef3c7", color: "#92400e" },
  "In Approvazione": { bg: "#ede9fe", color: "#5b21b6" },
  "In Lavorazione":  { bg: "#dbeafe", color: "#1e40af" },
  Completata:        { bg: "#d1fae5", color: "#065f46" },
  Bloccata:          { bg: "#fee2e2", color: "#991b1b" },
};

const priorityStyle: Record<CRPriority, { color: string; dot: string }> = {
  Alta:  { color: "#dc2626", dot: "#dc2626" },
  Media: { color: "#d97706", dot: "#d97706" },
  Bassa: { color: "#64748b", dot: "#94a3b8" },
};

function formatDate(d: string | null) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function progressForProject(project: Project) {
  const total = project.crs.length;
  const done = project.crs.filter((c) => c.status === "Completata").length;
  return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function CRDrawer({ cr, project, onClose }: { cr: CR; project: Project; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.3)", zIndex: 40, backdropFilter: "blur(2px)" }}
      />
      <div
        className="animate-slideIn"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, backgroundColor: "white", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, fontFamily: "DM Mono, monospace", color: "#2563eb", fontWeight: 600, marginBottom: 4 }}>
              {cr.id} · {project.name}
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>
              {cr.title}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)", marginLeft: 12, flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: statusStyle[cr.status].bg, color: statusStyle[cr.status].color }}>
              {cr.status}
            </span>
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: "#f8fafc", color: priorityStyle[cr.priority].color, border: "1px solid var(--border)" }}>
              Priorità {cr.priority}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { icon: <Clock size={14} />, label: "Stima", value: cr.estimate ? `${cr.estimate} ore` : null },
              { icon: <User size={14} />, label: "Assegnato a", value: cr.assignedTo },
              { icon: <Calendar size={14} />, label: "Data inizio", value: formatDate(cr.startDate) },
              { icon: <Calendar size={14} />, label: "Data fine", value: formatDate(cr.endDate) },
            ].map((field) => (
              <div key={field.label} style={{ backgroundColor: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", marginBottom: 6 }}>
                  {field.icon}
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{field.label}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: field.value ? "var(--text-primary)" : "#cbd5e1" }}>
                  {field.value ?? "—"}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", marginBottom: 8 }}>
              <AlignLeft size={14} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Descrizione</span>
            </div>
            <div style={{ fontSize: 14, color: cr.description ? "var(--text-secondary)" : "#cbd5e1", lineHeight: 1.6, backgroundColor: "#f8fafc", borderRadius: 10, padding: "12px 14px", minHeight: 80 }}>
              {cr.description ?? "Nessuna descrizione inserita."}
            </div>
          </div>

          <div style={{ backgroundColor: "#eff6ff", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#93c5fd", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 3 }}>Cliente</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af" }}>{project.client}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#93c5fd", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 3 }}>Progetto</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af" }}>{project.name}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1.5px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>
            Modifica
          </button>
          <button style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 13, fontWeight: 600, color: "white", cursor: "pointer", fontFamily: "inherit" }}>
            Cambia stato
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Project accordion ────────────────────────────────────────────────────────

function ProjectAccordion({ project, defaultOpen, onSelectCR }: { project: Project; defaultOpen: boolean; onSelectCR: (cr: CR, project: Project) => void }) {
  const [open, setOpen] = useState(defaultOpen);
  const { total, done, pct } = progressForProject(project);

  return (
    <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
      >
        <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{project.name}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>·</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{project.client}</span>
            <span style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#94a3b8" }}>{project.id}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 5, backgroundColor: "#e2e8f0", borderRadius: 99, overflow: "hidden", maxWidth: 200 }}>
              <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct === 100 ? "#10b981" : "#3b82f6", borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" as const }}>{done}/{total} completate</span>
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
          {total} CR
        </span>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid var(--border-soft)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["ID", "Titolo", "Stato", "Priorità", "Stima", "Inizio", "Fine", "Assegnato a"].map((h) => (
                  <th key={h} style={{ padding: "9px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {project.crs.map((cr) => (
                <tr
                  key={cr.id}
                  onClick={() => onSelectCR(cr, project)}
                  style={{ borderTop: "1px solid var(--border-soft)", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", fontFamily: "DM Mono, monospace" }}>{cr.id}</span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{cr.title}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: statusStyle[cr.status].bg, color: statusStyle[cr.status].color, whiteSpace: "nowrap" as const }}>
                      {cr.status}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: priorityStyle[cr.priority].dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: priorityStyle[cr.priority].color, fontWeight: 600 }}>{cr.priority}</span>
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap" as const }}>
                    {cr.estimate ? `${cr.estimate}h` : <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" as const }}>
                    {formatDate(cr.startDate) ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" as const }}>
                    {formatDate(cr.endDate) ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap" as const }}>
                    {cr.assignedTo ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const [search, setSearch] = useState("");
  const [selectedCR, setSelectedCR] = useState<{ cr: CR; project: Project } | null>(null);

  const filtered = mockProjects
    .map((p) => ({
      ...p,
      crs: p.crs.filter(
        (cr) =>
          !search ||
          cr.id.toLowerCase().includes(search.toLowerCase()) ||
          cr.title.toLowerCase().includes(search.toLowerCase()) ||
          p.client.toLowerCase().includes(search.toLowerCase()) ||
          p.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((p) => p.crs.length > 0);

  const totalCRs = mockProjects.reduce((sum, p) => sum + p.crs.length, 0);

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Change Request
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            {mockProjects.length} progetti · {totalCRs} richieste totali
          </p>
        </div>
        <a
          href="/requests/new"
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}
        >
          <Plus size={15} />
          Nuova CR
        </a>
      </div>

      <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Cerca per ID, titolo, cliente o progetto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit", backgroundColor: "transparent" }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}>
            <X size={14} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>
          Nessun risultato per &ldquo;{search}&rdquo;
        </div>
      ) : (
        filtered.map((project, i) => (
          <ProjectAccordion
            key={project.id}
            project={project}
            defaultOpen={i === 0}
            onSelectCR={(cr, proj) => setSelectedCR({ cr, project: proj })}
          />
        ))
      )}

      {selectedCR && (
        <CRDrawer
          cr={selectedCR.cr}
          project={selectedCR.project}
          onClose={() => setSelectedCR(null)}
        />
      )}
    </div>
  );
}
