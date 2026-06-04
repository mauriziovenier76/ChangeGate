"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus, Search, X, Calendar, Clock, User, AlignLeft, Filter, Check } from "lucide-react";

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
      { id: "CR-001", title: "Aggiornamento modulo fatturazione", status: "In Approvazione", priority: "Alta", estimate: 16, startDate: "2024-06-10", endDate: "2024-06-20", assignedTo: "Marco R.", description: "Aggiornare il modulo di fatturazione per supportare il nuovo formato XML." },
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

// ─── Drawer ───────────────────────────────────────────────────────────────────

function CRDrawer({ cr, project, onClose }: { cr: CR; project: Project; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.3)", zIndex: 40, backdropFilter: "blur(2px)" }} />
      <div className="animate-slideIn" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, backgroundColor: "white", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, fontFamily: "DM Mono, monospace", color: "#2563eb", fontWeight: 600, marginBottom: 4 }}>{cr.id} · {project.name}</div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>{cr.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)", marginLeft: 12, flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: statusStyle[cr.status].bg, color: statusStyle[cr.status].color }}>{cr.status}</span>
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: "#f8fafc", color: priorityStyle[cr.priority].color, border: "1px solid var(--border)" }}>Priorità {cr.priority}</span>
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
                <div style={{ fontSize: 14, fontWeight: 600, color: field.value ? "var(--text-primary)" : "#cbd5e1" }}>{field.value ?? "—"}</div>
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
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1.5px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Modifica</button>
          <button style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 13, fontWeight: 600, color: "white", cursor: "pointer", fontFamily: "inherit" }}>Cambia stato</button>
        </div>
      </div>
    </>
  );
}

// ─── CheckboxDropdown ─────────────────────────────────────────────────────────

function CheckboxDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const allSelected = selected.size === 0; // empty set = "tutti"

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const toggle = (val: string) => {
    const next = new Set(selected);
    next.has(val) ? next.delete(val) : next.add(val);
    onChange(next);
  };

  const toggleAll = () => onChange(new Set());

  const activeCount = selected.size;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "7px 12px", borderRadius: 8,
          border: activeCount > 0 ? "1.5px solid #2563eb" : "1.5px solid var(--border)",
          backgroundColor: activeCount > 0 ? "#eff6ff" : "white",
          cursor: "pointer", fontFamily: "inherit",
          fontSize: 13, fontWeight: 500,
          color: activeCount > 0 ? "#2563eb" : "var(--text-secondary)",
          whiteSpace: "nowrap" as const,
          transition: "all 0.15s",
        }}
      >
        <Filter size={13} />
        {label}
        {activeCount > 0 && (
          <span style={{ backgroundColor: "#2563eb", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "1px 6px", marginLeft: 2 }}>
            {activeCount}
          </span>
        )}
        <ChevronDown size={13} style={{ marginLeft: 2, opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>

      {open && (
        <div
          className="animate-fadeIn"
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0,
            minWidth: 210, backgroundColor: "white",
            border: "1px solid var(--border)", borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            zIndex: 100, overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
              {label}
            </span>
            <button
              onClick={toggleAll}
              style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, padding: 0 }}
            >
              {allSelected ? "Nessuno" : "Tutti"}
            </button>
          </div>

          {/* Options */}
          <div style={{ maxHeight: 240, overflowY: "auto", padding: "6px 0" }}>
            {options.map((opt) => {
              const checked = selected.size === 0 ? false : selected.has(opt);
              // "Tutti" row
              return (
                <div
                  key={opt}
                  onClick={() => toggle(opt)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 14px", cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* Custom checkbox */}
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: checked ? "none" : "1.5px solid #cbd5e1",
                    backgroundColor: checked ? "#2563eb" : "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.1s",
                  }}>
                    {checked && <Check size={10} color="white" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: checked ? 600 : 400 }}>
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer — reset */}
          {activeCount > 0 && (
            <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border-soft)" }}>
              <button
                onClick={() => { onChange(new Set()); setOpen(false); }}
                style={{ width: "100%", padding: "6px", borderRadius: 6, border: "none", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                Rimuovi filtro
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const [search, setSearch] = useState("");
  const [selectedCR, setSelectedCR] = useState<{ cr: CR; project: Project } | null>(null);
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const [clientFilter, setClientFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());

  const toggleProject = (id: string) => {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Unique clients from all projects
  const allClients = Array.from(new Set(mockProjects.map((p) => p.client))).sort();
  const allStatuses: CRStatus[] = ["In Attesa", "In Approvazione", "In Lavorazione", "Completata", "Bloccata"];

  const filtered = mockProjects
    .filter((p) => clientFilter.size === 0 || clientFilter.has(p.client))
    .map((p) => ({
      ...p,
      crs: p.crs.filter((cr) => {
        const matchSearch =
          !search ||
          cr.id.toLowerCase().includes(search.toLowerCase()) ||
          cr.title.toLowerCase().includes(search.toLowerCase()) ||
          p.client.toLowerCase().includes(search.toLowerCase()) ||
          p.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter.size === 0 || statusFilter.has(cr.status);
        return matchSearch && matchStatus;
      }),
    }))
    .filter((p) => p.crs.length > 0);

  const totalCRs = mockProjects.reduce((sum, p) => sum + p.crs.length, 0);

  const COL_WIDTHS = ["90px", "1fr", "150px", "100px", "80px", "100px", "100px", "130px"];
  const COLS = ["ID", "TITOLO", "STATO", "PRIORITÀ", "STIMA", "INIZIO", "FINE", "ASSEGNATO A"];

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Change Request</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>{mockProjects.length} progetti · {totalCRs} richieste totali</p>
        </div>
        <a href="/requests/new" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
          <Plus size={15} />Nuova CR
        </a>
      </div>

      {/* Search */}
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

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <CheckboxDropdown label="Clienti" options={allClients} selected={clientFilter} onChange={setClientFilter} />
        <CheckboxDropdown label="Stato" options={allStatuses} selected={statusFilter} onChange={setStatusFilter} />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>
          Nessun risultato per &ldquo;{search}&rdquo;
        </div>
      ) : (
        <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>

          {/* Fixed column header */}
          <div style={{ display: "grid", gridTemplateColumns: `28px ${COL_WIDTHS.join(" ")}`, borderBottom: "1px solid var(--border)", backgroundColor: "#f8fafc" }}>
            <div /> {/* chevron spacer */}
            {COLS.map((col) => (
              <div key={col} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>
                {col}
              </div>
            ))}
          </div>

          {/* Project groups */}
          {filtered.map((project, pi) => {
            const isCollapsed = collapsedProjects.has(project.id);
            const total = project.crs.length;
            const done = project.crs.filter((c) => c.status === "Completata").length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);

            return (
              <div key={project.id} style={{ borderBottom: pi < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>

                {/* Project row */}
                <div
                  onClick={() => toggleProject(project.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `28px ${COL_WIDTHS.join(" ")}`,
                    alignItems: "center",
                    backgroundColor: "#f0f4ff",
                    borderBottom: isCollapsed ? "none" : "1px solid var(--border-soft)",
                    cursor: "pointer",
                    userSelect: "none" as const,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8effe")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                >
                  {/* Chevron */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  </div>

                  {/* ID col → project ID */}
                  <div style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", fontFamily: "DM Mono, monospace" }}>{project.id}</span>
                  </div>

                  {/* Title col → project name + client */}
                  <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{project.name}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>·</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{project.client}</span>
                  </div>

                  {/* Stato col → progress bar */}
                  <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 5, backgroundColor: "#cbd5e1", borderRadius: 99, overflow: "hidden", minWidth: 40 }}>
                      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct === 100 ? "#10b981" : "#3b82f6", borderRadius: 99 }} />
                    </div>
                  </div>

                  {/* Priorità col → completate */}
                  <div style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" as const }}>{done}/{total} CR</span>
                  </div>

                  {/* Remaining cols → empty */}
                  <div /><div /><div />

                  {/* Last col → CR badge */}
                  <div style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", backgroundColor: "#dbeafe", padding: "2px 9px", borderRadius: 20 }}>
                      {total} completate: {done}
                    </span>
                  </div>
                </div>

                {/* CR rows */}
                {!isCollapsed && project.crs.map((cr, ci) => (
                  <div
                    key={cr.id}
                    onClick={() => setSelectedCR({ cr, project })}
                    style={{
                      display: "grid",
                      gridTemplateColumns: `28px ${COL_WIDTHS.join(" ")}`,
                      alignItems: "center",
                      borderBottom: ci < project.crs.length - 1 ? "1px solid var(--border-soft)" : "none",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div /> {/* chevron spacer */}

                    <div style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", fontFamily: "DM Mono, monospace" }}>{cr.id}</span>
                    </div>

                    <div style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{cr.title}</div>

                    <div style={{ padding: "11px 14px" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: statusStyle[cr.status].bg, color: statusStyle[cr.status].color, whiteSpace: "nowrap" as const }}>
                        {cr.status}
                      </span>
                    </div>

                    <div style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: priorityStyle[cr.priority].dot, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: priorityStyle[cr.priority].color, fontWeight: 600 }}>{cr.priority}</span>
                      </div>
                    </div>

                    <div style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
                      {cr.estimate ? `${cr.estimate}h` : <span style={{ color: "#cbd5e1" }}>—</span>}
                    </div>

                    <div style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-muted)" }}>
                      {formatDate(cr.startDate) ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                    </div>

                    <div style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-muted)" }}>
                      {formatDate(cr.endDate) ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                    </div>

                    <div style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
                      {cr.assignedTo ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      {selectedCR && (
        <CRDrawer cr={selectedCR.cr} project={selectedCR.project} onClose={() => setSelectedCR(null)} />
      )}
    </div>
  );
}
