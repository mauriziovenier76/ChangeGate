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
  noteCliente?: string;
  createdAt: string | null;
  // TEST - Previsione
  testPrevOre: number | null;
  testPrevDa: string | null;
  testPrevA: string | null;
  // TEST - Effettivo
  testEffOre: number | null;
  testEffDa: string | null;
  testEffA: string | null;
  // TEST - Validazione
  testValData: string | null;
  testValUtente: string | null;
  // PROD - Previsione
  prodPrevOre: number | null;
  prodPrevDa: string | null;
  prodPrevA: string | null;
  // PROD - Effettivo
  prodEffOre: number | null;
  prodEffDa: string | null;
  prodEffA: string | null;
  // PROD - Validazione
  prodValData: string | null;
  prodValUtente: string | null;
};

type Project = {
  id: string;
  codice: string;
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
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
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
  const MIN_CHARS = 3;
  const isSearching = query.length >= MIN_CHARS;
  const filtered = isSearching
    ? items.filter((i) =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        (i.sub ?? "").toLowerCase().includes(query.toLowerCase())
      ).slice(0, 50)
    : [];
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

      {/* List area */}
      <div style={{ maxHeight: 180, overflowY: "auto" }}>
        {!isSearching ? (
          // Hint state
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Search size={13} style={{ color: "#94a3b8" }} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                Scrivi almeno {MIN_CHARS} caratteri
              </div>
              <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 1 }}>
                {items.length} record disponibili
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "14px 16px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            Nessun risultato per &ldquo;{query}&rdquo;
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = item.id === selected;
            return (
              <div
                key={item.id}
                onClick={() => { onSelect(item.id); setQuery(""); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", cursor: "pointer", backgroundColor: isSelected ? "#eff6ff" : "transparent", borderBottom: "1px solid var(--border-soft)" }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = isSelected ? "#eff6ff" : "transparent"; }}
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
          <button onClick={() => { onSelect(""); setQuery(""); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#93c5fd" }}><X size={12} /></button>
        </div>
      )}
    </div>
  );
}

// ─── Drawer detail / edit ─────────────────────────────────────────────────────

function CRDrawer({ cr, project, onClose, onSaved }: { cr: CR; project: Project; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    titolo:      cr.title,
    descrizione: cr.description ?? "",
    note_cliente: cr.noteCliente ?? "",
    stato:       cr.status as string,
    priorita:    cr.priority as string,
    stima_ore:   cr.estimate ? String(cr.estimate) : "",
    data_inizio: cr.startDate ?? "",
    data_fine:   cr.endDate ?? "",
    // TEST
    test_prev_ore: cr.testPrevOre ? String(cr.testPrevOre) : "",
    test_prev_da:  cr.testPrevDa  ?? "",
    test_prev_a:   cr.testPrevA   ?? "",
    test_eff_ore:  cr.testEffOre  ? String(cr.testEffOre) : "",
    test_eff_da:   cr.testEffDa   ?? "",
    test_eff_a:    cr.testEffA    ?? "",
    test_val_data: cr.testValData ?? "",
    test_val_utente: cr.testValUtente ?? "",
    // PROD
    prod_prev_ore: cr.prodPrevOre ? String(cr.prodPrevOre) : "",
    prod_prev_da:  cr.prodPrevDa  ?? "",
    prod_prev_a:   cr.prodPrevA   ?? "",
    prod_eff_ore:  cr.prodEffOre  ? String(cr.prodEffOre) : "",
    prod_eff_da:   cr.prodEffDa   ?? "",
    prod_eff_a:    cr.prodEffA    ?? "",
    prod_val_data: cr.prodValData ?? "",
    prod_val_utente: cr.prodValUtente ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [saved, setSaved]   = useState(false);

  const set = (k: string, v: string) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false); };

  const handleSave = async () => {
    if (!form.titolo.trim()) { setError("Il titolo è obbligatorio."); return; }
    setSaving(true); setError(null);
    const n = (v: string) => v || null;
    const num = (v: string) => v ? parseFloat(v) : null;
    const { error: err } = await supabase.from("cg_change_requests").update({
      titolo: form.titolo.trim(), descrizione: n(form.descrizione),
      note_cliente: n(form.note_cliente), stato: form.stato, priorita: form.priorita,
      stima_ore: num(form.stima_ore), data_inizio: n(form.data_inizio), data_fine: n(form.data_fine),
      test_prev_ore: num(form.test_prev_ore), test_prev_da: n(form.test_prev_da), test_prev_a: n(form.test_prev_a),
      test_eff_ore: num(form.test_eff_ore), test_eff_da: n(form.test_eff_da), test_eff_a: n(form.test_eff_a),
      test_val_data: n(form.test_val_data), test_val_utente: n(form.test_val_utente),
      prod_prev_ore: num(form.prod_prev_ore), prod_prev_da: n(form.prod_prev_da), prod_prev_a: n(form.prod_prev_a),
      prod_eff_ore: num(form.prod_eff_ore), prod_eff_da: n(form.prod_eff_da), prod_eff_a: n(form.prod_eff_a),
      prod_val_data: n(form.prod_val_data), prod_val_utente: n(form.prod_val_utente),
    }).eq("id", cr.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true); onSaved();
  };

  const inp: React.CSSProperties = { width: "100%", padding: "7px 9px", borderRadius: 7, border: "1.5px solid var(--border)", fontSize: 12, color: "var(--text-primary)", fontFamily: "inherit", outline: "none", boxSizing: "border-box", backgroundColor: "white" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" };
  const sec = (title: string, color = "#0f172a") => (
    <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10, paddingBottom: 5, borderBottom: `2px solid ${color}22` }}>{title}</div>
  );
  const subsec = (title: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8, marginTop: 4 }}>{title}</div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.3)", zIndex: 40, backdropFilter: "blur(2px)" }} />
      <div className="animate-slideIn" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 520, backgroundColor: "white", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 12, fontFamily: "DM Mono, monospace", color: "#2563eb", fontWeight: 600, marginBottom: 3 }}>{cr.codice} · {project.name} · {project.client}</div>
            {cr.createdAt && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Inserita il {formatDate(cr.createdAt)}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)", flexShrink: 0 }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* ── Generale ── */}
          {sec("Generale")}
          <div>
            <label style={lbl}>Titolo *</label>
            <input type="text" value={form.titolo} onChange={(e) => set("titolo", e.target.value)} style={inp} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={lbl}>Stato</label>
              <select value={form.stato} onChange={(e) => set("stato", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {["In Attesa","In Approvazione","In Lavorazione","Completata","Bloccata"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Priorità</label>
              <select value={form.priorita} onChange={(e) => set("priorita", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {["Alta","Media","Bassa"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Dettaglio</label>
            <textarea value={form.descrizione} onChange={(e) => set("descrizione", e.target.value)} placeholder="Descrizione della richiesta..."
              style={{ ...inp, minHeight: 70, resize: "vertical" as const }} />
          </div>
          <div>
            <label style={lbl}>Note per il Cliente</label>
            <textarea value={form.note_cliente} onChange={(e) => set("note_cliente", e.target.value)} placeholder="Note visibili al cliente..."
              style={{ ...inp, minHeight: 60, resize: "vertical" as const }} />
          </div>

          {/* ── Ambiente di Test ── */}
          {sec("Ambiente di Test", "#0891b2")}

          {subsec("Previsione")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div><label style={lbl}>Ore stimate</label><input type="number" min="0" step="0.5" value={form.test_prev_ore} onChange={(e) => set("test_prev_ore", e.target.value)} style={inp} placeholder="—" /></div>
            <div><label style={lbl}>Da data</label><input type="date" value={form.test_prev_da} onChange={(e) => set("test_prev_da", e.target.value)} style={inp} /></div>
            <div><label style={lbl}>A data</label><input type="date" value={form.test_prev_a} onChange={(e) => set("test_prev_a", e.target.value)} style={inp} /></div>
          </div>

          {subsec("Effettivo")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div><label style={lbl}>Ore effettive</label><input type="number" min="0" step="0.5" value={form.test_eff_ore} onChange={(e) => set("test_eff_ore", e.target.value)} style={inp} placeholder="—" /></div>
            <div><label style={lbl}>Da data</label><input type="date" value={form.test_eff_da} onChange={(e) => set("test_eff_da", e.target.value)} style={inp} /></div>
            <div><label style={lbl}>A data</label><input type="date" value={form.test_eff_a} onChange={(e) => set("test_eff_a", e.target.value)} style={inp} /></div>
          </div>

          {subsec("Validazione")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={lbl}>Data validazione</label><input type="date" value={form.test_val_data} onChange={(e) => set("test_val_data", e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Utente validazione</label><input type="text" value={form.test_val_utente} onChange={(e) => set("test_val_utente", e.target.value)} style={inp} placeholder="Nome utente" /></div>
          </div>

          {/* ── Ambiente di Produzione ── */}
          {sec("Ambiente di Produzione", "#7c3aed")}

          {subsec("Previsione")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div><label style={lbl}>Ore stimate</label><input type="number" min="0" step="0.5" value={form.prod_prev_ore} onChange={(e) => set("prod_prev_ore", e.target.value)} style={inp} placeholder="—" /></div>
            <div><label style={lbl}>Da data</label><input type="date" value={form.prod_prev_da} onChange={(e) => set("prod_prev_da", e.target.value)} style={inp} /></div>
            <div><label style={lbl}>A data</label><input type="date" value={form.prod_prev_a} onChange={(e) => set("prod_prev_a", e.target.value)} style={inp} /></div>
          </div>

          {subsec("Effettivo")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div><label style={lbl}>Ore effettive</label><input type="number" min="0" step="0.5" value={form.prod_eff_ore} onChange={(e) => set("prod_eff_ore", e.target.value)} style={inp} placeholder="—" /></div>
            <div><label style={lbl}>Da data</label><input type="date" value={form.prod_eff_da} onChange={(e) => set("prod_eff_da", e.target.value)} style={inp} /></div>
            <div><label style={lbl}>A data</label><input type="date" value={form.prod_eff_a} onChange={(e) => set("prod_eff_a", e.target.value)} style={inp} /></div>
          </div>

          {subsec("Validazione")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={lbl}>Data validazione</label><input type="date" value={form.prod_val_data} onChange={(e) => set("prod_val_data", e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Utente validazione</label><input type="text" value={form.prod_val_utente} onChange={(e) => set("prod_val_utente", e.target.value)} style={inp} placeholder="Nome utente" /></div>
          </div>

          {error && <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</div>}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1.5px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Chiudi</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: "9px", borderRadius: 8, border: "none", background: saved ? "#10b981" : saving ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 13, fontWeight: 600, color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
            {saving ? "Salvataggio..." : saved ? "✓ Salvato" : "Salva"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── New CR Modal ─────────────────────────────────────────────────────────────

type ClientRow   = { id: string; nome: string; fornitore_nome?: string };
type ProjectRow  = { id: string; nome: string; cliente_id: string };
type TeamRow     = { id: string; nome: string; ruolo: string };

// ─── GridPicker ───────────────────────────────────────────────────────────────

function GridPicker({ label, columns, rows, selected, onSelect, placeholder, emptyText, disabled = false }: {
  label: string;
  columns: string[];
  rows: { id: string; cells: string[] }[];
  selected: string;
  onSelect: (id: string) => void;
  placeholder: string;
  emptyText: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = rows.filter((r) =>
    r.cells.some((c) => c.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div style={{ opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
        {label}
        {selected && <span style={{ marginLeft: 8, fontSize: 11, color: "#2563eb", fontWeight: 700, textTransform: "none" as const, letterSpacing: 0 }}>✓ selezionato</span>}
      </div>
      <div style={{ border: "1.5px solid selected ? #2563eb : var(--border)", borderRadius: 10, overflow: "hidden", borderColor: selected ? "#bfdbfe" : "var(--border)" }}>
        {/* Search bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-soft)" }}>
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
        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 1fr)`, backgroundColor: "#f1f5f9", borderBottom: "1px solid var(--border-soft)" }}>
          {columns.map((col) => (
            <div key={col} style={{ padding: "6px 12px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{col}</div>
          ))}
        </div>
        {/* Rows */}
        <div style={{ maxHeight: 180, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "16px 12px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>{emptyText}</div>
          ) : (
            filtered.map((row) => {
              const isSel = row.id === selected;
              return (
                <div
                  key={row.id}
                  onClick={() => onSelect(isSel ? "" : row.id)}
                  style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 1fr)`, cursor: "pointer", backgroundColor: isSel ? "#eff6ff" : "transparent", borderBottom: "1px solid var(--border-soft)", transition: "background 0.1s" }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.backgroundColor = isSel ? "#eff6ff" : "transparent"; }}
                >
                  {row.cells.map((cell, ci) => (
                    <div key={ci} style={{ padding: "9px 12px", fontSize: 13, color: isSel ? "#1e40af" : "var(--text-primary)", fontWeight: isSel && ci === 0 ? 700 : 400, display: "flex", alignItems: "center", gap: 6 }}>
                      {ci === 0 && isSel && <Check size={13} color="#2563eb" strokeWidth={3} style={{ flexShrink: 0 }} />}
                      {cell || <span style={{ color: "#cbd5e1" }}>—</span>}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
        {/* Count footer */}
        <div style={{ padding: "5px 12px", backgroundColor: "#f8fafc", borderTop: "1px solid var(--border-soft)", fontSize: 11, color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
          <span>{filtered.length} di {rows.length} record</span>
          {selected && <button onClick={() => onSelect("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#dc2626", fontFamily: "inherit", padding: 0 }}>Deseleziona</button>}
        </div>
      </div>
    </div>
  );
}

function NewCRModal({ onClose, onCreated, preClienteId, preProgettoId }: { onClose: () => void; onCreated: () => void; preClienteId?: string; preProgettoId?: string }) {
  const [clienti, setClienti]     = useState<ClientRow[]>([]);
  const [progetti, setProgetti]   = useState<ProjectRow[]>([]);
  const [team, setTeam]           = useState<TeamRow[]>([]);
  const [selectedCliente, setSelectedCliente]   = useState<string>(preClienteId ?? "");
  const [selectedProgetto, setSelectedProgetto] = useState<string>(preProgettoId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const [form, setForm] = useState({
    titolo: "", descrizione: "", note_cliente: "",
    priorita: "Media" as CRPriority, stato: "In Attesa" as CRStatus,
    stima_ore: "", data_inizio: "", data_fine: "",
    pm_id: "", specialista_id: "", note_tecniche: "",
    // TEST
    test_prev_ore: "", test_prev_da: "", test_prev_a: "",
    test_eff_ore: "",  test_eff_da: "",  test_eff_a: "",
    test_val_data: "", test_val_utente: "",
    // PROD
    prod_prev_ore: "", prod_prev_da: "", prod_prev_a: "",
    prod_eff_ore: "",  prod_eff_da: "",  prod_eff_a: "",
    prod_val_data: "", prod_val_utente: "",
  });

  // Load clienti on mount
  useEffect(() => {
    supabase.from("cg_clienti").select("id, nome, cg_fornitori(nome)").eq("attivo", true).order("nome")
      .then(({ data }) => setClienti((data ?? []).map((c) => ({
        id: c.id, nome: c.nome,
        fornitore_nome: (c.cg_fornitori as unknown as { nome: string } | null)?.nome ?? "",
      }))));
  }, []);

  // Load progetti when cliente changes
  useEffect(() => {
    if (!selectedCliente) { setProgetti([]); return; }
    supabase.from("cg_progetti").select("id, nome, cliente_id").eq("cliente_id", selectedCliente).eq("attivo", true).order("nome")
      .then(({ data }) => {
        setProgetti(data ?? []);
        // If a project was preselected, set it after the list is loaded
        if (preProgettoId && data?.some((p) => p.id === preProgettoId)) {
          setSelectedProgetto(preProgettoId);
        }
      });
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

  const resetForm = () => setForm({
    titolo: "", descrizione: "", note_cliente: "",
    priorita: "Media", stato: "In Attesa",
    stima_ore: "", data_inizio: "", data_fine: "",
    pm_id: "", specialista_id: "", note_tecniche: "",
    test_prev_ore: "", test_prev_da: "", test_prev_a: "",
    test_eff_ore: "",  test_eff_da: "",  test_eff_a: "",
    test_val_data: "", test_val_utente: "",
    prod_prev_ore: "", prod_prev_da: "", prod_prev_a: "",
    prod_eff_ore: "",  prod_eff_da: "",  prod_eff_a: "",
    prod_val_data: "", prod_val_utente: "",
  });

  const n   = (v: string) => v || null;
  const num = (v: string) => v ? parseFloat(v) : null;

  const doInsert = async () => {
    if (!selectedProgetto) { setError("Seleziona un progetto."); return false; }
    if (!form.titolo.trim()) { setError("Il titolo è obbligatorio."); return false; }
    const { error: err } = await supabase.from("cg_change_requests").insert({
      progetto_id: selectedProgetto, titolo: form.titolo.trim(),
      descrizione: n(form.descrizione), note_cliente: n(form.note_cliente),
      priorita: form.priorita, stato: form.stato,
      stima_ore: num(form.stima_ore), data_inizio: n(form.data_inizio), data_fine: n(form.data_fine),
      pm_id: n(form.pm_id), specialista_id: n(form.specialista_id),
      note_tecniche: n(form.note_tecniche), codice: "",
      test_prev_ore: num(form.test_prev_ore), test_prev_da: n(form.test_prev_da), test_prev_a: n(form.test_prev_a),
      test_eff_ore:  num(form.test_eff_ore),  test_eff_da:  n(form.test_eff_da),  test_eff_a:  n(form.test_eff_a),
      test_val_data: n(form.test_val_data), test_val_utente: n(form.test_val_utente),
      prod_prev_ore: num(form.prod_prev_ore), prod_prev_da: n(form.prod_prev_da), prod_prev_a: n(form.prod_prev_a),
      prod_eff_ore:  num(form.prod_eff_ore),  prod_eff_da:  n(form.prod_eff_da),  prod_eff_a:  n(form.prod_eff_a),
      prod_val_data: n(form.prod_val_data), prod_val_utente: n(form.prod_val_utente),
    });
    if (err) { setError(err.message); return false; }
    return true;
  };

  const handleSave = async () => {
    setSaving(true); setError(null);
    const ok = await doInsert();
    setSaving(false);
    if (ok) { onCreated(); onClose(); }
  };

  const handleSaveAndNew = async () => {
    setSaving(true); setError(null);
    const ok = await doInsert();
    setSaving(false);
    if (ok) { onCreated(); resetForm(); }
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
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(960px, 97vw)", maxHeight: "92vh", backgroundColor: "white", borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", zIndex: 70, display: "flex", flexDirection: "column", overflow: "hidden" }}>

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

            {/* ── Clienti grid ── */}
            <GridPicker
              label="Cliente"
              columns={["Nome", "Fornitore"]}
              rows={clienti.map((c) => ({ id: c.id, cells: [c.nome, (c as ClientRow & { fornitore_nome?: string }).fornitore_nome ?? ""] }))}
              selected={selectedCliente}
              onSelect={setSelectedCliente}
              placeholder="Filtra clienti..."
              emptyText="Nessun cliente disponibile"
            />

            {/* ── Progetti grid ── */}
            <GridPicker
              label="Progetto"
              columns={["Nome"]}
              rows={progetti.map((p) => ({ id: p.id, cells: [p.nome] }))}
              selected={selectedProgetto}
              onSelect={setSelectedProgetto}
              placeholder="Filtra progetti..."
              emptyText={selectedCliente ? "Nessun progetto per questo cliente" : "Seleziona prima un cliente"}
              disabled={!selectedCliente}
            />
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 10 }}>
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
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Note per il Cliente</label>
            <textarea placeholder="Note visibili al cliente..." value={form.note_cliente} onChange={(e) => setField("note_cliente", e.target.value)}
              style={{ ...inputStyle, minHeight: 56, resize: "vertical" as const }} />
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
              <SearchableListbox items={pm.map((t) => ({ id: t.id, label: t.nome, sub: "Project Manager" }))} selected={form.pm_id} onSelect={(id) => setField("pm_id", id)} placeholder="Cerca PM..." disabled={!selectedCliente} />
            </div>
            <div>
              <label style={labelStyle}>Specialista</label>
              <SearchableListbox items={specialisti.map((t) => ({ id: t.id, label: t.nome, sub: "Specialista" }))} selected={form.specialista_id} onSelect={(id) => setField("specialista_id", id)} placeholder="Cerca specialista..." disabled={!selectedCliente} />
            </div>
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Note tecniche</label>
            <textarea placeholder="Note interne per il team tecnico..." value={form.note_tecniche} onChange={(e) => setField("note_tecniche", e.target.value)}
              style={{ ...inputStyle, minHeight: 56, resize: "vertical" as const }} />
          </div>

          {/* ── Sezione 5: Ambiente di Test ── */}
          {sectionTitle("5 · Ambiente di Test")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 10 }}>
            <div><label style={labelStyle}>Ore stimate (prev.)</label><input type="number" min="0" step="0.5" value={form.test_prev_ore} onChange={(e) => setField("test_prev_ore", e.target.value)} style={inputStyle} placeholder="—" /></div>
            <div><label style={labelStyle}>Da data (prev.)</label><input type="date" value={form.test_prev_da} onChange={(e) => setField("test_prev_da", e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>A data (prev.)</label><input type="date" value={form.test_prev_a} onChange={(e) => setField("test_prev_a", e.target.value)} style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 10 }}>
            <div><label style={labelStyle}>Ore effettive</label><input type="number" min="0" step="0.5" value={form.test_eff_ore} onChange={(e) => setField("test_eff_ore", e.target.value)} style={inputStyle} placeholder="—" /></div>
            <div><label style={labelStyle}>Da data (eff.)</label><input type="date" value={form.test_eff_da} onChange={(e) => setField("test_eff_da", e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>A data (eff.)</label><input type="date" value={form.test_eff_a} onChange={(e) => setField("test_eff_a", e.target.value)} style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            <div><label style={labelStyle}>Data validazione</label><input type="date" value={form.test_val_data} onChange={(e) => setField("test_val_data", e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Utente validazione</label><input type="text" value={form.test_val_utente} onChange={(e) => setField("test_val_utente", e.target.value)} style={inputStyle} placeholder="Nome utente" /></div>
          </div>

          {/* ── Sezione 6: Ambiente di Produzione ── */}
          {sectionTitle("6 · Ambiente di Produzione")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 10 }}>
            <div><label style={labelStyle}>Ore stimate (prev.)</label><input type="number" min="0" step="0.5" value={form.prod_prev_ore} onChange={(e) => setField("prod_prev_ore", e.target.value)} style={inputStyle} placeholder="—" /></div>
            <div><label style={labelStyle}>Da data (prev.)</label><input type="date" value={form.prod_prev_da} onChange={(e) => setField("prod_prev_da", e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>A data (prev.)</label><input type="date" value={form.prod_prev_a} onChange={(e) => setField("prod_prev_a", e.target.value)} style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 10 }}>
            <div><label style={labelStyle}>Ore effettive</label><input type="number" min="0" step="0.5" value={form.prod_eff_ore} onChange={(e) => setField("prod_eff_ore", e.target.value)} style={inputStyle} placeholder="—" /></div>
            <div><label style={labelStyle}>Da data (eff.)</label><input type="date" value={form.prod_eff_da} onChange={(e) => setField("prod_eff_da", e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>A data (eff.)</label><input type="date" value={form.prod_eff_a} onChange={(e) => setField("prod_eff_a", e.target.value)} style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
            <div><label style={labelStyle}>Data validazione</label><input type="date" value={form.prod_val_data} onChange={(e) => setField("prod_val_data", e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Utente validazione</label><input type="text" value={form.prod_val_utente} onChange={(e) => setField("prod_val_utente", e.target.value)} style={inputStyle} placeholder="Nome utente" /></div>
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
          <button onClick={handleSaveAndNew} disabled={saving}
            style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #2563eb", background: "none", fontSize: 13, fontWeight: 600, color: "#2563eb", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "..." : "Crea CR e aggiungi nuova"}
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

function ProjectAccordion({ project, isOpen, onToggle, onSelectCR, onAddCR }: {
  project: Project; isOpen: boolean; onToggle: () => void;
  onSelectCR: (cr: CR, project: Project) => void; onAddCR: (project: Project) => void;
}) {
  const total = project.crs.length;
  const done  = project.crs.filter((c) => c.status === "Completata").length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);
  const open  = isOpen;

  const GRID = `28px 90px 260px 140px 80px 70px 90px 120px 90px 90px 90px 90px 90px 90px 90px 120px 90px 90px 90px 90px 90px 90px 90px 120px`;
  const P = "6px 10px";
  const sc = (left: number, bg: string): React.CSSProperties => ({ position: "sticky", left, zIndex: 2, backgroundColor: bg, boxShadow: "2px 0 4px -1px rgba(0,0,0,0.06)", borderRight: "1px solid #f0f8ff" });

  return (
    <div style={{ borderBottom: "1px solid var(--border)", minWidth: "max-content" }}>
      <div style={{ display: "grid", gridTemplateColumns: GRID, alignItems: "center", backgroundColor: "#f0f4ff", transition: "background 0.1s" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8effe")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
      >
        <div onClick={() => onToggle()} style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", cursor: "pointer", padding: P, ...sc(0, "#f0f4ff") }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        <div onClick={() => onToggle()} style={{ padding: P, cursor: "pointer", ...sc(28, "#f0f4ff") }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", fontFamily: "DM Mono, monospace" }}>{project.codice}</span>
        </div>
        <div onClick={() => onToggle()} style={{ padding: P, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", ...sc(118, "#f0f4ff") }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" as const }}>{project.name}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>·</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap" as const }}>{project.client}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onAddCR(project); }} title={`Nuova CR per ${project.name}`}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "0 4px", color: "#0f172a", fontSize: 20, fontWeight: 300, lineHeight: 1, display: "flex", alignItems: "center", flexShrink: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#0f172a")}>+</button>
        </div>
        <div onClick={() => onToggle()} style={{ padding: P, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{ flex: 1, height: 5, backgroundColor: "#cbd5e1", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct === 100 ? "#10b981" : "#3b82f6", borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" as const }}>{done}/{total} CR</span>
        </div>
        {Array(19).fill(null).map((_, i) => <div key={i} />)}
      </div>

      {open && project.crs.map((cr) => {
        const d = (v: string | null) => v ? formatDate(v) : <span style={{ color: "#cbd5e1" }}>—</span>;
        const h = (v: number | null) => v != null ? `${v}h` : <span style={{ color: "#cbd5e1" }}>—</span>;
        const t = (v: string | null) => v || <span style={{ color: "#cbd5e1" }}>—</span>;
        const rb = "white";
        const cell = (extra?: React.CSSProperties): React.CSSProperties => ({ padding: P, display: "flex", alignItems: "center", fontSize: 12, whiteSpace: "nowrap" as const, borderRight: "1px solid #f0f8ff", ...extra });
        return (
          <div key={cr.id} onClick={() => onSelectCR(cr, project)}
            style={{ display: "grid", gridTemplateColumns: GRID, alignItems: "center", borderTop: "1px solid var(--border-soft)", cursor: "pointer", transition: "background 0.1s", height: 36 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-s]")).forEach(el => el.style.backgroundColor = "#f8fafc"); }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-s]")).forEach(el => el.style.backgroundColor = rb); }}
          >
            <div data-s style={{ ...cell(), ...sc(0, rb) }} />
            <div data-s style={{ ...cell(), ...sc(28, rb) }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", fontFamily: "DM Mono, monospace" }}>{cr.codice}</span>
            </div>
            <div data-s style={{ ...cell({ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }), ...sc(118, rb) }}>
              {cr.title}
            </div>
            <div style={cell()}>
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, backgroundColor: statusStyle[cr.status].bg, color: statusStyle[cr.status].color, whiteSpace: "nowrap" as const }}>{cr.status}</span>
            </div>
            <div style={cell()}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: priorityStyle[cr.priority].dot, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: priorityStyle[cr.priority].color, fontWeight: 600 }}>{cr.priority}</span>
              </div>
            </div>
            <div style={cell({ color: "var(--text-secondary)" })}>{h(cr.estimate)}</div>
            <div style={cell({ color: "var(--text-muted)" })}>{d(cr.createdAt)}</div>
            <div style={cell({ color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis" })}>{t(cr.noteCliente ?? null)}</div>
            <div style={cell({ color: "var(--text-secondary)", backgroundColor: "#d8bfd8" })}>{h(cr.testPrevOre)}</div>
            <div style={cell({ color: "var(--text-muted)", backgroundColor: "#d8bfd8" })}>{d(cr.testPrevDa)}</div>
            <div style={cell({ color: "var(--text-muted)", backgroundColor: "#d8bfd8" })}>{d(cr.testPrevA)}</div>
            <div style={cell({ color: "var(--text-secondary)", backgroundColor: "#d8bfd8" })}>{h(cr.testEffOre)}</div>
            <div style={cell({ color: "var(--text-muted)", backgroundColor: "#d8bfd8" })}>{d(cr.testEffDa)}</div>
            <div style={cell({ color: "var(--text-muted)", backgroundColor: "#d8bfd8" })}>{d(cr.testEffA)}</div>
            <div style={cell({ color: "var(--text-muted)", backgroundColor: "#d8bfd8" })}>{d(cr.testValData)}</div>
            <div style={cell({ color: "var(--text-secondary)", backgroundColor: "#d8bfd8" })}>{t(cr.testValUtente)}</div>
            <div style={cell({ color: "var(--text-secondary)", backgroundColor: "#dbeafe" })}>{h(cr.prodPrevOre)}</div>
            <div style={cell({ color: "var(--text-muted)", backgroundColor: "#dbeafe" })}>{d(cr.prodPrevDa)}</div>
            <div style={cell({ color: "var(--text-muted)", backgroundColor: "#dbeafe" })}>{d(cr.prodPrevA)}</div>
            <div style={cell({ color: "var(--text-secondary)", backgroundColor: "#dbeafe" })}>{h(cr.prodEffOre)}</div>
            <div style={cell({ color: "var(--text-muted)", backgroundColor: "#dbeafe" })}>{d(cr.prodEffDa)}</div>
            <div style={cell({ color: "var(--text-muted)", backgroundColor: "#dbeafe" })}>{d(cr.prodEffA)}</div>
            <div style={cell({ color: "var(--text-muted)", backgroundColor: "#dbeafe" })}>{d(cr.prodValData)}</div>
            <div style={cell({ color: "var(--text-secondary)", backgroundColor: "#dbeafe" })}>{t(cr.prodValUtente)}</div>
          </div>
        );
      })}
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
  const [preSelected, setPreSelected] = useState<{ clienteId: string; progettoId: string } | null>(null);

  const openNewCR = (project?: Project) => {
    setPreSelected(project ? { clienteId: project.clientId, progettoId: project.id } : null);
    setShowNewCR(true);
  };

  const [openProjects, setOpenProjects] = useState<Set<string>>(new Set());

  const toggleProject = (id: string) => {
    setOpenProjects((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllProjects = () => {
    setOpenProjects((prev) =>
      prev.size === filtered.length
        ? new Set()
        : new Set(filtered.map((p) => p.id))
    );
  };

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cg_change_requests")
      .select(`
        id, codice, titolo, stato, priorita, stima_ore, data_inizio, data_fine, descrizione, note_cliente, created_at,
        test_prev_ore, test_prev_da, test_prev_a,
        test_eff_ore, test_eff_da, test_eff_a,
        test_val_data, test_val_utente,
        prod_prev_ore, prod_prev_da, prod_prev_a,
        prod_eff_ore, prod_eff_da, prod_eff_a,
        prod_val_data, prod_val_utente,
        cg_progetti ( id, nome, codice, cg_clienti ( id, nome ) ),
        pm:cg_team!cg_change_requests_pm_id_fkey ( nome )
      `)
      .order("created_at", { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    // Group by project
    const map = new Map<string, Project>();
    for (const row of data ?? []) {
      const proj = row.cg_progetti as unknown as { id: string; nome: string; codice: string; cg_clienti: { id: string; nome: string } } | null;
      if (!proj) continue;
      const projId = proj.id;
      if (!map.has(projId)) {
        map.set(projId, {
          id:       projId,
          codice:   proj.codice ?? "—",
          name:     proj.nome,
          client:   proj.cg_clienti?.nome ?? "—",
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
        noteCliente: row.note_cliente ?? undefined,
        createdAt:   row.created_at ?? null,
        testPrevOre: row.test_prev_ore, testPrevDa: row.test_prev_da, testPrevA: row.test_prev_a,
        testEffOre:  row.test_eff_ore,  testEffDa:  row.test_eff_da,  testEffA:  row.test_eff_a,
        testValData: row.test_val_data, testValUtente: row.test_val_utente,
        prodPrevOre: row.prod_prev_ore, prodPrevDa: row.prod_prev_da, prodPrevA: row.prod_prev_a,
        prodEffOre:  row.prod_eff_ore,  prodEffDa:  row.prod_eff_da,  prodEffA:  row.prod_eff_a,
        prodValData: row.prod_val_data, prodValUtente: row.prod_val_utente,
      });
    }
    const projectList = Array.from(map.values());
    setProjects(projectList);
    // Open first project only on initial load (openProjects is empty)
    setOpenProjects((prev) => {
      if (prev.size === 0 && projectList.length > 0) {
        return new Set([projectList[0].id]);
      }
      return prev;
    });
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
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Change Request</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            {loading ? "Caricamento..." : `${projects.length} progetti · ${totalCRs} richieste totali`}
          </p>
        </div>
        <button onClick={() => openNewCR()}
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
        <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflowX: "auto" }}>
          {/* Super-header row */}
          <div style={{ display: "grid", gridTemplateColumns: `28px 90px 260px 140px 80px 70px 90px 120px 810px 810px 120px`, borderBottom: "1px solid var(--border-soft)", backgroundColor: "#f8fafc", width: "max-content", minWidth: "100%" }}>
            {/* Sticky: chevron + ID + Titolo */}
            <div style={{ position: "sticky" as const, left: 0, backgroundColor: "#f8fafc", zIndex: 11 }} />
            <div style={{ position: "sticky" as const, left: 28, backgroundColor: "#f8fafc", zIndex: 11 }} />
            <div style={{ position: "sticky" as const, left: 118, backgroundColor: "#f8fafc", zIndex: 11, borderRight: "1px solid #f0f8ff" }} />
            {/* General cols — empty */}
            <div /><div /><div /><div />
            {/* Note cliente — empty */}
            <div style={{ borderRight: "1px solid #e2e8f0" }} />
            {/* AMBIENTE TEST label — spans 9 cols = 120+90+90+90+90+90+90+90+120 = 810px */}
            <div style={{ padding: "5px 12px", fontSize: 10, fontWeight: 800, color: "#6b21a8", textTransform: "uppercase" as const, letterSpacing: "0.08em", backgroundColor: "#d8bfd8", borderRight: "1px solid #c4a8c4", display: "flex", alignItems: "center", gap: 6 }}>
              Ambiente di Test
            </div>
            {/* AMBIENTE PROD label — spans 9 cols = same */}
            <div style={{ padding: "5px 12px", fontSize: 10, fontWeight: 800, color: "#1e40af", textTransform: "uppercase" as const, letterSpacing: "0.08em", backgroundColor: "#dbeafe", borderRight: "1px solid #bfdbfe", display: "flex", alignItems: "center", gap: 6 }}>
              Ambiente di Produzione
            </div>
            {/* Last col spacer */}
            <div />
          </div>

          {/* Column header */}
          <div style={{ display: "grid", gridTemplateColumns: `28px 90px 260px 140px 80px 70px 90px 120px 90px 90px 90px 90px 90px 90px 90px 120px 90px 90px 90px 90px 90px 90px 90px 120px`, borderBottom: "1px solid var(--border)", backgroundColor: "#f8fafc", width: "max-content", minWidth: "100%" }}>
            <div
              onClick={toggleAllProjects}
              title={openProjects.size === filtered.length ? "Collassa tutti" : "Espandi tutti"}
              style={{ position: "sticky" as const, left: 0, backgroundColor: "#f8fafc", zIndex: 11, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRight: "1px solid #f0f8ff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8effe")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
            >
              {openProjects.size === filtered.length
                ? <ChevronDown size={14} style={{ color: "#2563eb" }} />
                : <ChevronRight size={14} style={{ color: "#2563eb" }} />}
            </div>
            {[
              { label: "ID",           sticky: true,  left: 28,  test: false, prod: false },
              { label: "TITOLO",       sticky: true,  left: 118, test: false, prod: false },
              { label: "STATO",        sticky: false, test: false, prod: false },
              { label: "PRIORITÀ",     sticky: false, test: false, prod: false },
              { label: "STIMA",        sticky: false, test: false, prod: false },
              { label: "INSERITA",     sticky: false, test: false, prod: false },
              { label: "NOTE CLIENTE", sticky: false, test: false, prod: false },
              { label: "T.PREV.ORE",   sticky: false, test: true,  prod: false },
              { label: "T.PREV.DA",    sticky: false, test: true,  prod: false },
              { label: "T.PREV.A",     sticky: false, test: true,  prod: false },
              { label: "T.EFF.ORE",    sticky: false, test: true,  prod: false },
              { label: "T.EFF.DA",     sticky: false, test: true,  prod: false },
              { label: "T.EFF.A",      sticky: false, test: true,  prod: false },
              { label: "T.VAL.DATA",   sticky: false, test: true,  prod: false },
              { label: "T.VAL.UTENTE", sticky: false, test: true,  prod: false },
              { label: "P.PREV.ORE",   sticky: false, test: false, prod: true  },
              { label: "P.PREV.DA",    sticky: false, test: false, prod: true  },
              { label: "P.PREV.A",     sticky: false, test: false, prod: true  },
              { label: "P.EFF.ORE",    sticky: false, test: false, prod: true  },
              { label: "P.EFF.DA",     sticky: false, test: false, prod: true  },
              { label: "P.EFF.A",      sticky: false, test: false, prod: true  },
              { label: "P.VAL.DATA",   sticky: false, test: false, prod: true  },
              { label: "P.VAL.UTENTE", sticky: false, test: false, prod: true  },
            ].map((col) => (
              <div key={col.label} style={{
                padding: "8px 10px", fontSize: 10, fontWeight: 700,
                color: col.test ? "#6b21a8" : col.prod ? "#1e40af" : "var(--text-muted)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em", whiteSpace: "nowrap" as const,
                backgroundColor: col.test ? "#d8bfd8" : col.prod ? "#dbeafe" : "#f8fafc",
                borderRight: "1px solid #f0f8ff",
                ...(col.sticky ? { position: "sticky" as const, left: (col as {left?: number}).left, zIndex: 11, boxShadow: "2px 0 4px -1px rgba(0,0,0,0.06)" } : {}),
              }}>{col.label}</div>
            ))}
          </div>
          {filtered.map((project) => (
            <ProjectAccordion key={project.id} project={project} isOpen={openProjects.has(project.id)} onToggle={() => toggleProject(project.id)} onSelectCR={(cr, proj) => setSelectedCR({ cr, project: proj })} onAddCR={openNewCR} />
          ))}
        </div>
      )}

      {/* Drawer */}
      {selectedCR && <CRDrawer cr={selectedCR.cr} project={selectedCR.project} onClose={() => setSelectedCR(null)} onSaved={loadData} />}

      {/* New CR Modal */}
      {showNewCR && <NewCRModal onClose={() => { setShowNewCR(false); setPreSelected(null); }} onCreated={loadData} preClienteId={preSelected?.clienteId} preProgettoId={preSelected?.progettoId} />}
    </div>
  );
}
