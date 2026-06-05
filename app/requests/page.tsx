"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus, Search, X, Calendar, Clock, User, AlignLeft, Filter, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

type CRStatus = "In Attesa" | "In Approvazione" | "In Lavorazione" | "Completata" | "Bloccata";
type CRPriority = "Alta" | "Media" | "Bassa";

type CR = {
  id: string;
  codice: string;
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
  clientId: string;
  crs: CR[];
};

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

// ─── CheckboxDropdown ─────────────────────────────────────────────────────────

function CheckboxDropdown({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: Set<string>; onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const activeCount = selected.size;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 8, border: activeCount > 0 ? "1.5px solid #2563eb" : "1.5px solid var(--border)", backgroundColor: activeCount > 0 ? "#eff6ff" : "white", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: activeCount > 0 ? "#2563eb" : "var(--text-secondary)", whiteSpace: "nowrap" as const }}
      >
        <Filter size={13} />
        {label}
        {activeCount > 0 && <span style={{ backgroundColor: "#2563eb", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "1px 6px" }}>{activeCount}</span>}
        <ChevronDown size={13} style={{ opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div className="animate-fadeIn" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: 210, backgroundColor: "white", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{label}</span>
            <button onClick={() => onChange(new Set())} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, padding: 0 }}>Tutti</button>
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto", padding: "6px 0" }}>
            {options.map((opt) => {
              const checked = selected.has(opt);
              return (
                <div key={opt} onClick={() => toggle(opt)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: checked ? "none" : "1.5px solid #cbd5e1", backgroundColor: checked ? "#2563eb" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {checked && <Check size={10} color="white" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: checked ? 600 : 400 }}>{opt}</span>
                </div>
              );
            })}
          </div>
          {activeCount > 0 && (
            <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border-soft)" }}>
              <button onClick={() => { onChange(new Set()); setOpen(false); }} style={{ width: "100%", padding: "6px", borderRadius: 6, border: "none", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Rimuovi filtro</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SearchableListbox ────────────────────────────────────────────────────────

function SearchableListbox({ items, selected, onSelect, placeholder, disabled = false }: {
  items: { id: string; label: string; sub?: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase()) ||
    (i.sub ?? "").toLowerCase().includes(query.toLowerCase())
  );
  const selectedItem = items.find((i) => i.id === selected);

  return (
    <div style={{ border: "1.5px solid var(--border)", borderRadius: 8, overflow: "hidden", opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      {/* Search input */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid var(--border-soft)", backgroundColor: "#f8fafc" }}>
        <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", backgroundColor: "transparent", color: "var(--text-primary)" }}
        />
        {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text-muted)" }}><X size={12} /></button>}
      </div>
      {/* List */}
      <div style={{ maxHeight: 180, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "16px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Nessun risultato</div>
        ) : (
          filtered.map((item) => {
            const isSelected = item.id === selected;
            return (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", cursor: "pointer", backgroundColor: isSelected ? "#eff6ff" : "transparent", borderBottom: "1px solid var(--border-soft)" }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? "#1e40af" : "var(--text-primary)" }}>{item.label}</div>
                  {item.sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{item.sub}</div>}
                </div>
                {isSelected && <Check size={14} color="#2563eb" strokeWidth={3} />}
              </div>
            );
          })
        )}
      </div>
      {/* Selected summary */}
      {selectedItem && (
        <div style={{ padding: "7px 12px", backgroundColor: "#eff6ff", borderTop: "1px solid #bfdbfe", fontSize: 12, color: "#2563eb", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>✓ {selectedItem.label}</span>
          <button onClick={() => onSelect("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#93c5fd" }}><X size={12} /></button>
        </div>
      )}
    </div>
  );
}

// ─── Drawer detail ────────────────────────────────────────────────────────────

function CRDrawer({ cr, project, onClose }: { cr: CR; project: Project; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.3)", zIndex: 40, backdropFilter: "blur(2px)" }} />
      <div className="animate-slideIn" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, backgroundColor: "white", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, fontFamily: "DM Mono, monospace", color: "#2563eb", fontWeight: 600, marginBottom: 4 }}>{cr.codice} · {project.name}</div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>{cr.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)", marginLeft: 12, flexShrink: 0 }}><X size={18} /></button>
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

// ─── New CR Modal ─────────────────────────────────────────────────────────────

type ClientRow   = { id: string; nome: string };
type ProjectRow  = { id: string; nome: string; cliente_id: string };
type TeamRow     = { id: string; nome: string; ruolo: string };

function NewCRModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [clienti, setClienti]     = useState<ClientRow[]>([]);
  const [progetti, setProgetti]   = useState<ProjectRow[]>([]);
  const [team, setTeam]           = useState<TeamRow[]>([]);
  const [selectedCliente, setSelectedCliente]   = useState<string>("");
  const [selectedProgetto, setSelectedProgetto] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const [form, setForm] = useState({
    titolo: "",
    descrizione: "",
    priorita: "Media" as CRPriority,
    stato: "In Attesa" as CRStatus,
    stima_ore: "",
    data_inizio: "",
    data_fine: "",
    pm_id: "",
    specialista_id: "",
    note_tecniche: "",
  });

  // Load clienti on mount
  useEffect(() => {
    supabase.from("cg_clienti").select("id, nome").eq("attivo", true).order("nome")
      .then(({ data }) => setClienti(data ?? []));
  }, []);

  // Load progetti when cliente changes
  useEffect(() => {
    setSelectedProgetto("");
    if (!selectedCliente) { setProgetti([]); return; }
    supabase.from("cg_progetti").select("id, nome, cliente_id").eq("cliente_id", selectedCliente).eq("attivo", true).order("nome")
      .then(({ data }) => setProgetti(data ?? []));
  }, [selectedCliente]);

  // Load team (pm + specialisti) — from the fornitore of the selected cliente
  useEffect(() => {
    if (!selectedCliente) { setTeam([]); return; }
    // Get fornitore_id from the selected cliente
    supabase.from("cg_clienti").select("fornitore_id").eq("id", selectedCliente).single()
      .then(({ data }) => {
        if (!data) return;
        supabase.from("cg_team").select("id, nome, ruolo").eq("fornitore_id", data.fornitore_id).order("nome")
          .then(({ data: teamData }) => setTeam(teamData ?? []));
      });
  }, [selectedCliente]);

  const setField = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!selectedProgetto) { setError("Seleziona un progetto."); return; }
    if (!form.titolo.trim()) { setError("Il titolo è obbligatorio."); return; }
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("cg_change_requests").insert({
      progetto_id:    selectedProgetto,
      titolo:         form.titolo.trim(),
      descrizione:    form.descrizione || null,
      priorita:       form.priorita,
      stato:          form.stato,
      stima_ore:      form.stima_ore ? parseFloat(form.stima_ore) : null,
      data_inizio:    form.data_inizio || null,
      data_fine:      form.data_fine || null,
      pm_id:          form.pm_id || null,
      specialista_id: form.specialista_id || null,
      note_tecniche:  form.note_tecniche || null,
      codice:         "",
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    onCreated();
    onClose();
  };

  const pm          = team.filter((t) => t.ruolo === "pm");
  const specialisti = team.filter((t) => t.ruolo === "specialista");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)",
    fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em",
  };

  const sectionTitle = (t: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--border-soft)" }}>
      {t}
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", zIndex: 60, backdropFilter: "blur(3px)" }} />

      {/* Modal */}
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(780px, 95vw)", maxHeight: "90vh", backgroundColor: "white", borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", zIndex: 70, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Modal header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Nuova Change Request</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "3px 0 0" }}>Compila tutti i campi per creare la richiesta</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)" }}><X size={20} /></button>
        </div>

        {/* Modal body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          {/* ── Sezione 1: Cliente + Progetto ── */}
          {sectionTitle("1 · Seleziona cliente e progetto")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div>
              <label style={labelStyle}>Cliente</label>
              <SearchableListbox
                items={clienti.map((c) => ({ id: c.id, label: c.nome }))}
                selected={selectedCliente}
                onSelect={setSelectedCliente}
                placeholder="Cerca cliente..."
              />
            </div>
            <div>
              <label style={labelStyle}>Progetto</label>
              <SearchableListbox
                items={progetti.map((p) => ({ id: p.id, label: p.nome }))}
                selected={selectedProgetto}
                onSelect={setSelectedProgetto}
                placeholder="Cerca progetto..."
                disabled={!selectedCliente}
              />
            </div>
          </div>

          {/* ── Sezione 2: Dettagli CR ── */}
          {sectionTitle("2 · Dettagli della richiesta")}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Titolo <span style={{ color: "#dc2626" }}>*</span></label>
            <input type="text" placeholder="Es. Aggiornamento modulo fatturazione" value={form.titolo} onChange={(e) => setField("titolo", e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Descrizione</label>
            <textarea placeholder="Descrivi la richiesta in dettaglio..." value={form.descrizione} onChange={(e) => setField("descrizione", e.target.value)}
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" as const }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div>
              <label style={labelStyle}>Priorità</label>
              <select value={form.priorita} onChange={(e) => setField("priorita", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {["Alta", "Media", "Bassa"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Stato iniziale</label>
              <select value={form.stato} onChange={(e) => setField("stato", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {["In Attesa", "In Approvazione", "In Lavorazione", "Completata", "Bloccata"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* ── Sezione 3: Pianificazione ── */}
          {sectionTitle("3 · Pianificazione")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div>
              <label style={labelStyle}>Stima (ore)</label>
              <input type="number" min="0" step="0.5" placeholder="Es. 16" value={form.stima_ore} onChange={(e) => setField("stima_ore", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Data inizio</label>
              <input type="date" value={form.data_inizio} onChange={(e) => setField("data_inizio", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Data fine</label>
              <input type="date" value={form.data_fine} onChange={(e) => setField("data_fine", e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* ── Sezione 4: Team ── */}
          {sectionTitle("4 · Assegnazione team")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>PM responsabile</label>
              <SearchableListbox
                items={pm.map((t) => ({ id: t.id, label: t.nome, sub: "Project Manager" }))}
                selected={form.pm_id}
                onSelect={(id) => setField("pm_id", id)}
                placeholder="Cerca PM..."
                disabled={!selectedCliente}
              />
            </div>
            <div>
              <label style={labelStyle}>Specialista</label>
              <SearchableListbox
                items={specialisti.map((t) => ({ id: t.id, label: t.nome, sub: "Specialista" }))}
                selected={form.specialista_id}
                onSelect={(id) => setField("specialista_id", id)}
                placeholder="Cerca specialista..."
                disabled={!selectedCliente}
              />
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Note tecniche</label>
            <textarea placeholder="Note interne per il team tecnico..." value={form.note_tecniche} onChange={(e) => setField("note_tecniche", e.target.value)}
              style={{ ...inputStyle, minHeight: 64, resize: "vertical" as const }} />
          </div>

          {error && (
            <div style={{ marginTop: 12, padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>
            Annulla
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 13, fontWeight: 600, color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
            {saving ? "Salvataggio..." : "Crea CR"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Project accordion ────────────────────────────────────────────────────────

function ProjectAccordion({ project, defaultOpen, onSelectCR }: { project: Project; defaultOpen: boolean; onSelectCR: (cr: CR, project: Project) => void }) {
  const [open, setOpen] = useState(defaultOpen);
  const total = project.crs.length;
  const done  = project.crs.filter((c) => c.status === "Completata").length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "grid", gridTemplateColumns: `28px 90px 1fr 150px 100px 80px 100px 100px 130px`, alignItems: "center", backgroundColor: "#f0f4ff", cursor: "pointer", userSelect: "none" as const, transition: "background 0.1s" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8effe")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        <div style={{ padding: "11px 14px" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", fontFamily: "DM Mono, monospace" }}>{project.id.slice(0, 8)}</span>
        </div>
        <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{project.name}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>·</span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{project.client}</span>
        </div>
        <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 5, backgroundColor: "#cbd5e1", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct === 100 ? "#10b981" : "#3b82f6", borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" as const }}>{done}/{total} CR</span>
        </div>
        <div /><div /><div /><div /><div />
      </div>

      {open && project.crs.map((cr) => (
        <div key={cr.id} onClick={() => onSelectCR(cr, project)}
          style={{ display: "grid", gridTemplateColumns: `28px 90px 1fr 150px 100px 80px 100px 100px 130px`, alignItems: "center", borderTop: "1px solid var(--border-soft)", cursor: "pointer", transition: "background 0.1s" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <div />
          <div style={{ padding: "11px 14px" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", fontFamily: "DM Mono, monospace" }}>{cr.codice}</span>
          </div>
          <div style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{cr.title}</div>
          <div style={{ padding: "11px 14px" }}>
            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: statusStyle[cr.status].bg, color: statusStyle[cr.status].color, whiteSpace: "nowrap" as const }}>{cr.status}</span>
          </div>
          <div style={{ padding: "11px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: priorityStyle[cr.priority].dot }} />
              <span style={{ fontSize: 13, color: priorityStyle[cr.priority].color, fontWeight: 600 }}>{cr.priority}</span>
            </div>
          </div>
          <div style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
            {cr.estimate ? `${cr.estimate}h` : <span style={{ color: "#cbd5e1" }}>—</span>}
          </div>
          <div style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-muted)" }}>{formatDate(cr.startDate) ?? <span style={{ color: "#cbd5e1" }}>—</span>}</div>
          <div style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-muted)" }}>{formatDate(cr.endDate) ?? <span style={{ color: "#cbd5e1" }}>—</span>}</div>
          <div style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-secondary)" }}>{cr.assignedTo ?? <span style={{ color: "#cbd5e1" }}>—</span>}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [clientFilter, setClientFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [selectedCR, setSelectedCR] = useState<{ cr: CR; project: Project } | null>(null);
  const [showNewCR, setShowNewCR]   = useState(false);

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cg_change_requests")
      .select(`
        id, codice, titolo, stato, priorita, stima_ore, data_inizio, data_fine, descrizione,
        cg_progetti ( id, nome, cg_clienti ( id, nome ) ),
        pm:cg_team!cg_change_requests_pm_id_fkey ( nome )
      `)
      .order("codice");

    if (error) { console.error(error); setLoading(false); return; }

    // Group by project
    const map = new Map<string, Project>();
    for (const row of data ?? []) {
      const proj = row.cg_progetti as unknown as { id: string; nome: string; cg_clienti: { id: string; nome: string } } | null;
      if (!proj) continue;
      const projId = proj.id;
      if (!map.has(projId)) {
        map.set(projId, {
          id: projId,
          name: proj.nome,
          client: proj.cg_clienti?.nome ?? "—",
          clientId: proj.cg_clienti?.id ?? "",
          crs: [],
        });
      }
      const pm = row.pm as unknown as { nome: string } | null;
      map.get(projId)!.crs.push({
        id:          row.id,
        codice:      row.codice,
        title:       row.titolo,
        status:      row.stato as CRStatus,
        priority:    row.priorita as CRPriority,
        estimate:    row.stima_ore,
        startDate:   row.data_inizio,
        endDate:     row.data_fine,
        assignedTo:  pm?.nome ?? null,
        description: row.descrizione ?? undefined,
      });
    }
    setProjects(Array.from(map.values()));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const allClients  = Array.from(new Set(projects.map((p) => p.client))).sort();
  const allStatuses: CRStatus[] = ["In Attesa", "In Approvazione", "In Lavorazione", "Completata", "Bloccata"];

  const filtered = projects
    .filter((p) => clientFilter.size === 0 || clientFilter.has(p.client))
    .map((p) => ({
      ...p,
      crs: p.crs.filter((cr) => {
        const matchSearch = !search ||
          cr.codice.toLowerCase().includes(search.toLowerCase()) ||
          cr.title.toLowerCase().includes(search.toLowerCase()) ||
          p.client.toLowerCase().includes(search.toLowerCase()) ||
          p.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter.size === 0 || statusFilter.has(cr.status);
        return matchSearch && matchStatus;
      }),
    }))
    .filter((p) => p.crs.length > 0);

  const totalCRs = projects.reduce((s, p) => s + p.crs.length, 0);
  const COL_HEADERS = ["ID", "TITOLO", "STATO", "PRIORITÀ", "STIMA", "INIZIO", "FINE", "ASSEGNATO A"];

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Change Request</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            {loading ? "Caricamento..." : `${projects.length} progetti · ${totalCRs} richieste totali`}
          </p>
        </div>
        <button onClick={() => setShowNewCR(true)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
          <Plus size={15} />Nuova CR
        </button>
      </div>

      {/* Search */}
      <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input type="text" placeholder="Cerca per ID, titolo, cliente o progetto..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit", backgroundColor: "transparent" }} />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}><X size={14} /></button>}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <CheckboxDropdown label="Clienti" options={allClients} selected={clientFilter} onChange={setClientFilter} />
        <CheckboxDropdown label="Stato" options={allStatuses} selected={statusFilter} onChange={setStatusFilter} />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>Caricamento...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>Nessun risultato trovato</div>
      ) : (
        <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {/* Column header */}
          <div style={{ display: "grid", gridTemplateColumns: `28px 90px 1fr 150px 100px 80px 100px 100px 130px`, borderBottom: "1px solid var(--border)", backgroundColor: "#f8fafc" }}>
            <div />
            {COL_HEADERS.map((col) => (
              <div key={col} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>{col}</div>
            ))}
          </div>
          {filtered.map((project, i) => (
            <ProjectAccordion key={project.id} project={project} defaultOpen={i === 0} onSelectCR={(cr, proj) => setSelectedCR({ cr, project: proj })} />
          ))}
        </div>
      )}

      {/* Drawer */}
      {selectedCR && <CRDrawer cr={selectedCR.cr} project={selectedCR.project} onClose={() => setSelectedCR(null)} />}

      {/* New CR Modal */}
      {showNewCR && <NewCRModal onClose={() => setShowNewCR(false)} onCreated={loadData} />}
    </div>
  );
}
