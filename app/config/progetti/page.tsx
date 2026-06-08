"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Search, Check, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Progetto = {
  id: string;
  nome: string;
  descrizione: string | null;
  attivo: boolean;
  cliente_id: string;
  cliente_nome: string;
  pm_nome: string | null;
  cr_total: number;
  cr_closed: number;
};

type ClienteRow   = { id: string; nome: string; fornitore_nome: string };
type TeamRow      = { id: string; nome: string; ruolo: string };

// ─── CheckboxDropdown ─────────────────────────────────────────────────────────

function CheckboxDropdown({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: Set<string>; onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handle); return () => document.removeEventListener("mousedown", handle);
  }, []);
  const toggle = (val: string) => { const n = new Set(selected); n.has(val) ? n.delete(val) : n.add(val); onChange(n); };
  const count = selected.size;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 8, border: count > 0 ? "1.5px solid #2563eb" : "1.5px solid var(--border)", backgroundColor: count > 0 ? "#eff6ff" : "white", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: count > 0 ? "#2563eb" : "var(--text-secondary)", whiteSpace: "nowrap" as const }}>
        <Filter size={13} />{label}
        {count > 0 && <span style={{ backgroundColor: "#2563eb", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "1px 6px" }}>{count}</span>}
        <ChevronDown size={13} style={{ opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div className="animate-fadeIn" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: 210, backgroundColor: "white", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{label}</span>
            <button onClick={() => onChange(new Set())} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, padding: 0 }}>Tutti</button>
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto", padding: "6px 0" }}>
            {options.map((opt) => {
              const checked = selected.has(opt);
              return (
                <div key={opt} onClick={() => toggle(opt)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: checked ? "none" : "1.5px solid #cbd5e1", backgroundColor: checked ? "#2563eb" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {checked && <Check size={10} color="white" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: checked ? 600 : 400 }}>{opt}</span>
                </div>
              );
            })}
          </div>
          {count > 0 && (
            <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border-soft)" }}>
              <button onClick={() => { onChange(new Set()); setOpen(false); }} style={{ width: "100%", padding: "6px", borderRadius: 6, border: "none", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Rimuovi filtro</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GridPicker ───────────────────────────────────────────────────────────────

function GridPicker({ label, columns, rows, selected, onSelect, placeholder, emptyText, disabled = false }: {
  label: string; columns: string[]; rows: { id: string; cells: string[] }[];
  selected: string; onSelect: (id: string) => void; placeholder: string; emptyText: string; disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = rows.filter((r) => r.cells.some((c) => c.toLowerCase().includes(query.toLowerCase())));
  const selectedItem = rows.find((r) => r.id === selected);
  return (
    <div style={{ opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
        {label}{selectedItem && <span style={{ marginLeft: 8, fontSize: 11, color: "#2563eb", fontWeight: 700, textTransform: "none" as const }}>✓ selezionato</span>}
      </div>
      <div style={{ border: "1.5px solid var(--border)", borderRadius: 10, overflow: "hidden", borderColor: selected ? "#bfdbfe" : "var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-soft)" }}>
          <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input type="text" placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", backgroundColor: "transparent", color: "var(--text-primary)" }} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text-muted)" }}><X size={12} /></button>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 1fr)`, backgroundColor: "#f1f5f9", borderBottom: "1px solid var(--border-soft)" }}>
          {columns.map((col) => <div key={col} style={{ padding: "6px 12px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{col}</div>)}
        </div>
        <div style={{ maxHeight: 180, overflowY: "auto" }}>
          {filtered.length === 0
            ? <div style={{ padding: "16px 12px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>{emptyText}</div>
            : filtered.map((row) => {
                const isSel = row.id === selected;
                return (
                  <div key={row.id} onClick={() => onSelect(isSel ? "" : row.id)}
                    style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 1fr)`, cursor: "pointer", backgroundColor: isSel ? "#eff6ff" : "transparent", borderBottom: "1px solid var(--border-soft)" }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.backgroundColor = isSel ? "#eff6ff" : "transparent"; }}>
                    {row.cells.map((cell, ci) => (
                      <div key={ci} style={{ padding: "9px 12px", fontSize: 13, color: isSel ? "#1e40af" : "var(--text-primary)", fontWeight: isSel && ci === 0 ? 700 : 400, display: "flex", alignItems: "center", gap: 6 }}>
                        {ci === 0 && isSel && <Check size={13} color="#2563eb" strokeWidth={3} style={{ flexShrink: 0 }} />}
                        {cell || <span style={{ color: "#cbd5e1" }}>—</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
        </div>
        <div style={{ padding: "5px 12px", backgroundColor: "#f8fafc", borderTop: "1px solid var(--border-soft)", fontSize: 11, color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
          <span>{filtered.length} di {rows.length} record</span>
          {selected && <button onClick={() => onSelect("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#dc2626", fontFamily: "inherit", padding: 0 }}>Deseleziona</button>}
        </div>
      </div>
    </div>
  );
}

// ─── New Progetto Modal ───────────────────────────────────────────────────────

function NewProgettoModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [clienti, setClienti]   = useState<ClienteRow[]>([]);
  const [team, setTeam]         = useState<TeamRow[]>([]);
  const [selectedCliente, setSelectedCliente] = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", descrizione: "", pm_id: "", attivo: true });

  useEffect(() => {
    supabase.from("cg_clienti").select("id, nome, cg_fornitori(nome)").eq("attivo", true).order("nome")
      .then(({ data }) => setClienti((data ?? []).map((c) => ({
        id: c.id, nome: c.nome,
        fornitore_nome: (c.cg_fornitori as unknown as { nome: string } | null)?.nome ?? "",
      }))));
  }, []);

  useEffect(() => {
    setForm((f) => ({ ...f, pm_id: "" }));
    if (!selectedCliente) { setTeam([]); return; }
    supabase.from("cg_clienti").select("fornitore_id").eq("id", selectedCliente).single()
      .then(({ data }) => {
        if (!data) return;
        supabase.from("cg_team").select("id, nome, ruolo").eq("fornitore_id", data.fornitore_id).eq("ruolo", "pm").order("nome")
          .then(({ data: t }) => setTeam(t ?? []));
      });
  }, [selectedCliente]);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!selectedCliente) { setError("Seleziona un cliente."); return; }
    if (!form.nome.trim()) { setError("Il nome del progetto è obbligatorio."); return; }
    setSaving(true); setError(null);
    const { error: err } = await supabase.from("cg_progetti").insert({
      cliente_id:  selectedCliente,
      nome:        form.nome.trim(),
      descrizione: form.descrizione || null,
      attivo:      form.attivo,
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    onCreated(); onClose();
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" };
  const sectionTitle = (t: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--border-soft)" }}>{t}</div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", zIndex: 60, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(860px, 97vw)", maxHeight: "92vh", backgroundColor: "white", borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", zIndex: 70, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Nuovo Progetto</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "3px 0 0" }}>Seleziona il cliente e compila i dettagli</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)" }}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          {/* Cliente */}
          {sectionTitle("1 · Cliente")}
          <div style={{ marginBottom: 28 }}>
            <GridPicker
              label="Cliente di riferimento"
              columns={["Nome", "Fornitore"]}
              rows={clienti.map((c) => ({ id: c.id, cells: [c.nome, c.fornitore_nome] }))}
              selected={selectedCliente}
              onSelect={setSelectedCliente}
              placeholder="Filtra clienti..."
              emptyText="Nessun cliente disponibile"
            />
          </div>

          {/* Dettagli */}
          {sectionTitle("2 · Dettagli progetto")}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Nome progetto <span style={{ color: "#dc2626" }}>*</span></label>
            <input type="text" placeholder="Es. Gestionale 2.0" value={form.nome} onChange={(e) => set("nome", e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Descrizione</label>
            <textarea placeholder="Descrizione del progetto..." value={form.descrizione} onChange={(e) => set("descrizione", e.target.value)}
              style={{ ...inputStyle, minHeight: 72, resize: "vertical" as const }} />
          </div>

          {/* Stato */}
          {sectionTitle("3 · Stato")}
          <div onClick={() => set("attivo", !form.attivo)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, border: "1.5px solid var(--border)", cursor: "pointer", backgroundColor: form.attivo ? "#f0fdf4" : "#f8fafc", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Progetto attivo</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>I progetti attivi compaiono nella selezione delle CR</div>
            </div>
            <div style={{ width: 44, height: 24, borderRadius: 99, backgroundColor: form.attivo ? "#22c55e" : "#cbd5e1", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: form.attivo ? 23 : 3, width: 18, height: 18, borderRadius: "50%", backgroundColor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
            </div>
          </div>

          {error && <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</div>}
        </div>

        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Annulla</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 13, fontWeight: 600, color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
            {saving ? "Salvataggio..." : "Crea progetto"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Client group row ─────────────────────────────────────────────────────────

function ClienteGroup({ cliente, progetti, defaultOpen, onEdit }: {
  cliente: string; progetti: Progetto[]; defaultOpen: boolean; onEdit: (p: Progetto) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const total  = progetti.length;
  const active = progetti.filter((p) => p.attivo).length;

  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Cliente header row */}
      <div onClick={() => setOpen(!open)}
        style={{ display: "grid", gridTemplateColumns: "28px 1fr 180px 130px 130px 110px", alignItems: "center", backgroundColor: "#f0f4ff", cursor: "pointer", userSelect: "none" as const, transition: "background 0.1s" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8effe")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        <div style={{ padding: "11px 14px" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{cliente}</span>
        </div>
        <div style={{ padding: "11px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 5, backgroundColor: "#cbd5e1", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: total === 0 ? "0%" : `${Math.round((active / total) * 100)}%`, backgroundColor: "#3b82f6", borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" as const }}>{active}/{total} attivi</span>
          </div>
        </div>
        <div /><div />
        <div style={{ padding: "11px 14px" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: 20 }}>{total} progetti</span>
        </div>
      </div>

      {/* Project rows */}
      {open && progetti.map((p) => {
        const pct = p.cr_total === 0 ? 0 : Math.round((p.cr_closed / p.cr_total) * 100);
        return (
          <div key={p.id}
            style={{ display: "grid", gridTemplateColumns: "28px 1fr 180px 130px 130px 110px", alignItems: "center", borderTop: "1px solid var(--border-soft)", transition: "background 0.1s", cursor: "default" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
            <div />
            {/* Nome */}
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{p.nome}</div>
              {p.descrizione && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{p.descrizione}</div>}
            </div>
            {/* CR progress */}
            <div style={{ padding: "12px 14px" }}>
              {p.cr_total > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 60, height: 5, backgroundColor: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct === 100 ? "#10b981" : "#3b82f6", borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" as const }}>{p.cr_closed}/{p.cr_total} CR</span>
                </div>
              ) : <span style={{ fontSize: 12, color: "#cbd5e1" }}>Nessuna CR</span>}
            </div>
            {/* PM */}
            <div style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
              {p.pm_nome ?? <span style={{ color: "#cbd5e1" }}>—</span>}
            </div>
            {/* Stato */}
            <div style={{ padding: "12px 14px" }}>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: p.attivo ? "#d1fae5" : "#f1f5f9", color: p.attivo ? "#065f46" : "#64748b" }}>
                {p.attivo ? "Attivo" : "Concluso"}
              </span>
            </div>
            {/* Azioni */}
            <div style={{ padding: "12px 14px", textAlign: "right" }}>
              <button onClick={() => onEdit(p)} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Modifica</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Edit Progetto Drawer ─────────────────────────────────────────────────────

function EditProgettoDrawer({ progetto, onClose, onSaved }: {
  progetto: Progetto; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nome:        progetto.nome,
    descrizione: progetto.descrizione ?? "",
    attivo:      progetto.attivo,
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const set = (k: string, v: string | boolean) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false); };

  const handleSave = async () => {
    if (!form.nome.trim()) { setError("Il nome è obbligatorio."); return; }
    setSaving(true); setError(null);
    const { error: err } = await supabase.from("cg_progetti").update({
      nome:        form.nome.trim(),
      descrizione: form.descrizione || null,
      attivo:      form.attivo,
    }).eq("id", progetto.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    onSaved();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: "1.5px solid var(--border)", fontSize: 13,
    color: "var(--text-primary)", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600,
    color: "var(--text-muted)", marginBottom: 5,
    textTransform: "uppercase", letterSpacing: "0.06em",
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.3)", zIndex: 40, backdropFilter: "blur(2px)" }} />
      <div className="animate-slideIn" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 440, backgroundColor: "white", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", marginBottom: 4 }}>Modifica progetto</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{progetto.nome}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{progetto.cliente_nome}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)" }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <label style={labelStyle}>Nome progetto *</label>
            <input type="text" value={form.nome} onChange={(e) => set("nome", e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Descrizione</label>
            <textarea value={form.descrizione} onChange={(e) => set("descrizione", e.target.value)}
              placeholder="Nessuna descrizione inserita."
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" as const }} />
          </div>

          {/* Info non modificabili */}
          <div style={{ backgroundColor: "#eff6ff", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#93c5fd", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 3 }}>Cliente</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af" }}>{progetto.cliente_nome}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#93c5fd", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 3 }}>CR totali</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af" }}>{progetto.cr_total}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#93c5fd", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 3 }}>Completate</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af" }}>{progetto.cr_closed}</div>
            </div>
          </div>

          <div onClick={() => set("attivo", !form.attivo)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 9, border: "1.5px solid var(--border)", cursor: "pointer", backgroundColor: form.attivo ? "#f0fdf4" : "#f8fafc" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Progetto attivo</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>I progetti attivi compaiono nella selezione delle CR</div>
            </div>
            <div style={{ width: 36, height: 20, borderRadius: 99, backgroundColor: form.attivo ? "#22c55e" : "#cbd5e1", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 2, left: form.attivo ? 18 : 2, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
            </div>
          </div>

          {error && <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</div>}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1.5px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>
            Chiudi
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: saved ? "#10b981" : saving ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 13, fontWeight: 600, color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
            {saving ? "Salvataggio..." : saved ? "✓ Salvato" : "Salva"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgettiPage() {
  const [progetti, setProgetti]   = useState<Progetto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [clientFilter, setClientFilter] = useState<Set<string>>(new Set());
  const [statoFilter, setStatoFilter]   = useState<Set<string>>(new Set());
  const [showNew, setShowNew]     = useState(false);
  const [editing, setEditing]     = useState<Progetto | null>(null);

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cg_progetti")
      .select(`
        id, nome, descrizione, attivo, cliente_id,
        cg_clienti ( nome ),
        cg_change_requests ( id, stato,
          pm:cg_team!cg_change_requests_pm_id_fkey ( nome )
        )
      `)
      .order("nome");

    if (error) { console.error(error); setLoading(false); return; }

    setProgetti((data ?? []).map((p) => {
      const cliente = p.cg_clienti as unknown as { nome: string } | null;
      const crs     = p.cg_change_requests as unknown as { id: string; stato: string; pm: { nome: string } | null }[];
      // PM: prendi il nome dal primo PM assegnato
      const pmNome  = crs.find((c) => c.pm?.nome)?.pm?.nome ?? null;
      return {
        id:           p.id,
        nome:         p.nome,
        descrizione:  p.descrizione,
        attivo:       p.attivo,
        cliente_id:   p.cliente_id,
        cliente_nome: cliente?.nome ?? "—",
        pm_nome:      pmNome,
        cr_total:     crs.length,
        cr_closed:    crs.filter((c) => c.stato === "Completata").length,
      };
    }));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const allClienti = Array.from(new Set(progetti.map((p) => p.cliente_nome))).sort();
  const allStati   = ["Attivo", "Concluso"];

  const filtered = progetti.filter((p) => {
    const matchSearch = !search ||
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.pm_nome ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCliente = clientFilter.size === 0 || clientFilter.has(p.cliente_nome);
    const matchStato   = statoFilter.size === 0 ||
      (statoFilter.has("Attivo") && p.attivo) ||
      (statoFilter.has("Concluso") && !p.attivo);
    return matchSearch && matchCliente && matchStato;
  });

  // Group by cliente
  const grouped = Array.from(new Set(filtered.map((p) => p.cliente_nome))).sort().map((cliente) => ({
    cliente,
    progetti: filtered.filter((p) => p.cliente_nome === cliente),
  }));

  const totalActive = progetti.filter((p) => p.attivo).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Progetti</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            {loading ? "Caricamento..." : `${totalActive} attivi · ${progetti.length - totalActive} conclusi · ${progetti.length} totali`}
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
          <Plus size={15} />Nuovo Progetto
        </button>
      </div>

      {/* Search */}
      <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input type="text" placeholder="Cerca per nome progetto, cliente o PM..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit", backgroundColor: "transparent" }} />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}><X size={14} /></button>}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <CheckboxDropdown label="Clienti" options={allClienti} selected={clientFilter} onChange={setClientFilter} />
        <CheckboxDropdown label="Stato" options={allStati} selected={statoFilter} onChange={setStatoFilter} />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>Caricamento...</div>
      ) : grouped.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>Nessun progetto trovato</div>
      ) : (
        <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 180px 130px 130px 110px", borderBottom: "1px solid var(--border)", backgroundColor: "#f8fafc" }}>
            <div />
            {["Progetto", "CR", "PM", "Stato", ""].map((h) => (
              <div key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>{h}</div>
            ))}
          </div>
          {grouped.map((g, i) => (
            <ClienteGroup key={g.cliente} cliente={g.cliente} progetti={g.progetti} defaultOpen={i === 0} onEdit={(p) => setEditing(p)} />
          ))}
        </div>
      )}

      {showNew  && <NewProgettoModal onClose={() => setShowNew(false)} onCreated={loadData} />}
      {editing  && <EditProgettoDrawer progetto={editing} onClose={() => setEditing(null)} onSaved={loadData} />}
    </div>
  );
}
