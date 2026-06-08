"use client";

import { useState, useEffect } from "react";
import { Plus, X, Search, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Ruolo = "pm" | "specialista" | "admin";

type Utente = {
  id: string;
  nome: string;
  email: string | null;
  ruolo: Ruolo;
  attivo: boolean;
  fornitore_id: string | null;
  cliente_id: string | null;
  fornitore_nome: string | null;
  cliente_nome: string | null;
  avatar_iniziali: string;
  avatar_bg: string;
  avatar_colore: string;
};

type OptionRow = { id: string; nome: string };

// ─── Avatar component ─────────────────────────────────────────────────────────

function Avatar({ iniziali, bg, colore, size = 36 }: { iniziali: string; bg: string; colore: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      backgroundColor: bg, color: colore,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
      letterSpacing: "0.02em", userSelect: "none",
      border: "2px solid rgba(255,255,255,0.8)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
    }}>
      {(iniziali || "??").toUpperCase().slice(0, 2)}
    </div>
  );
}

// ─── Ruolo badge ──────────────────────────────────────────────────────────────

const ruoloStyle: Record<Ruolo, { bg: string; color: string; label: string }> = {
  pm:          { bg: "#eff6ff", color: "#2563eb", label: "PM" },
  specialista: { bg: "#f0fdf4", color: "#059669", label: "Specialista" },
  admin:       { bg: "#fdf4ff", color: "#9333ea", label: "Admin" },
};

// ─── Color picker palette ─────────────────────────────────────────────────────

const PALETTE = [
  "#0f172a","#1e293b","#2563eb","#1d4ed8","#7c3aed","#9333ea",
  "#db2777","#e11d48","#ea580c","#d97706","#65a30d","#059669",
  "#0891b2","#0284c7","#6366f1","#ec4899","#f43f5e","#64748b",
];

function ColorPicker({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
        {PALETTE.map((c) => (
          <button key={c} onClick={() => onChange(c)}
            style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: c, border: value === c ? "3px solid #2563eb" : "2px solid transparent", cursor: "pointer", outline: "none", padding: 0, boxShadow: value === c ? "0 0 0 2px white, 0 0 0 4px #2563eb" : "none", transition: "all 0.1s" }}
          />
        ))}
        {/* Custom hex input */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
            style={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid var(--border)", cursor: "pointer", padding: 0 }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "DM Mono, monospace" }}>{value}</span>
        </div>
      </div>
    </div>
  );
}

// ─── New / Edit Utente Modal ──────────────────────────────────────────────────

function UtenteModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [fornitori, setFornitori] = useState<OptionRow[]>([]);
  const [clienti, setClienti]     = useState<OptionRow[]>([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [assocType, setAssocType] = useState<"fornitore" | "cliente" | "nessuno">("nessuno");

  const [form, setForm] = useState({
    nome: "", email: "", ruolo: "pm" as Ruolo, attivo: true,
    fornitore_id: "", cliente_id: "",
    avatar_iniziali: "", avatar_bg: "#2563eb", avatar_colore: "#ffffff",
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-generate iniziali from nome
  useEffect(() => {
    if (form.nome.trim()) {
      const words = form.nome.trim().split(/\s+/);
      const iniziali = words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : form.nome.slice(0, 2).toUpperCase();
      setForm((f) => ({ ...f, avatar_iniziali: iniziali }));
    }
  }, [form.nome]);

  useEffect(() => {
    supabase.from("cg_fornitori").select("id, nome").eq("attivo", true).order("nome").then(({ data }) => setFornitori(data ?? []));
    supabase.from("cg_clienti").select("id, nome").eq("attivo", true).order("nome").then(({ data }) => setClienti(data ?? []));
  }, []);

  const handleSave = async () => {
    if (!form.nome.trim()) { setError("Il nome è obbligatorio."); return; }
    if (!form.avatar_iniziali.trim()) { setError("Le iniziali sono obbligatorie."); return; }
    if (assocType === "fornitore" && !form.fornitore_id) { setError("Seleziona un fornitore."); return; }
    if (assocType === "cliente"   && !form.cliente_id)   { setError("Seleziona un cliente."); return; }
    setSaving(true); setError(null);
    const { error: err } = await supabase.from("cg_utenti").insert({
      nome:             form.nome.trim(),
      email:            form.email || null,
      ruolo:            form.ruolo,
      attivo:           form.attivo,
      fornitore_id:     assocType === "fornitore" ? form.fornitore_id || null : null,
      cliente_id:       assocType === "cliente"   ? form.cliente_id   || null : null,
      avatar_iniziali:  form.avatar_iniziali.slice(0, 2).toUpperCase(),
      avatar_bg:        form.avatar_bg,
      avatar_colore:    form.avatar_colore,
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved(); onClose();
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" };
  const sectionTitle = (t: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--border-soft)" }}>{t}</div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", zIndex: 60, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(640px, 95vw)", maxHeight: "92vh", backgroundColor: "white", borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", zIndex: 70, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Nuovo Utente</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "3px 0 0" }}>Configura l&apos;account e l&apos;avatar</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)" }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          {/* 1 — Anagrafica */}
          {sectionTitle("1 · Anagrafica")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Nome completo <span style={{ color: "#dc2626" }}>*</span></label>
              <input type="text" placeholder="Es. Marco Rossi" value={form.nome} onChange={(e) => set("nome", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" placeholder="marco@azienda.it" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
            <div>
              <label style={labelStyle}>Ruolo</label>
              <select value={form.ruolo} onChange={(e) => set("ruolo", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="pm">PM</option>
                <option value="specialista">Specialista</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Stato</label>
              <div onClick={() => set("attivo", !form.attivo)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)", cursor: "pointer", backgroundColor: form.attivo ? "#f0fdf4" : "#f8fafc" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{form.attivo ? "Attivo" : "Disattivo"}</span>
                <div style={{ width: 36, height: 20, borderRadius: 99, backgroundColor: form.attivo ? "#22c55e" : "#cbd5e1", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: form.attivo ? 18 : 2, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
                </div>
              </div>
            </div>
          </div>

          {/* 2 — Avatar */}
          {sectionTitle("2 · Avatar")}
          <div style={{ display: "flex", gap: 24, marginBottom: 28, alignItems: "flex-start" }}>
            {/* Preview */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <Avatar iniziali={form.avatar_iniziali || "??"} bg={form.avatar_bg} colore={form.avatar_colore} size={64} />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Anteprima</span>
            </div>
            {/* Controls */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Iniziali (max 2 caratteri)</label>
                <input type="text" maxLength={2} placeholder="Es. MR" value={form.avatar_iniziali}
                  onChange={(e) => set("avatar_iniziali", e.target.value.toUpperCase().slice(0, 2))}
                  style={{ ...inputStyle, width: 80, fontFamily: "DM Mono, monospace", fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", textAlign: "center" }} />
              </div>
              <ColorPicker value={form.avatar_bg} onChange={(c) => set("avatar_bg", c)} label="Colore sfondo" />
              <ColorPicker value={form.avatar_colore} onChange={(c) => set("avatar_colore", c)} label="Colore lettere" />
            </div>
          </div>

          {/* 3 — Associazione */}
          {sectionTitle("3 · Associazione")}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {(["nessuno", "fornitore", "cliente"] as const).map((t) => (
              <button key={t} onClick={() => setAssocType(t)}
                style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, fontWeight: assocType === t ? 700 : 500, backgroundColor: assocType === t ? "#eff6ff" : "white", color: assocType === t ? "#2563eb" : "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit", borderColor: assocType === t ? "#2563eb" : "var(--border)" }}>
                {t === "nessuno" ? "Nessuna" : t === "fornitore" ? "Fornitore" : "Cliente"}
              </button>
            ))}
          </div>

          {assocType === "fornitore" && (
            <div style={{ border: "1.5px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ backgroundColor: "#f8fafc", padding: "8px 12px", borderBottom: "1px solid var(--border-soft)", fontSize: 12, color: "var(--text-muted)" }}>Seleziona il fornitore</div>
              {fornitori.map((f) => {
                const sel = form.fornitore_id === f.id;
                return (
                  <div key={f.id} onClick={() => set("fornitore_id", f.id)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer", backgroundColor: sel ? "#eff6ff" : "transparent", borderBottom: "1px solid var(--border-soft)" }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.backgroundColor = "transparent"; }}>
                    <span style={{ fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? "#1e40af" : "var(--text-primary)" }}>{f.nome}</span>
                    {sel && <Check size={14} color="#2563eb" strokeWidth={3} />}
                  </div>
                );
              })}
            </div>
          )}

          {assocType === "cliente" && (
            <div style={{ border: "1.5px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ backgroundColor: "#f8fafc", padding: "8px 12px", borderBottom: "1px solid var(--border-soft)", fontSize: 12, color: "var(--text-muted)" }}>Seleziona il cliente</div>
              {clienti.map((c) => {
                const sel = form.cliente_id === c.id;
                return (
                  <div key={c.id} onClick={() => set("cliente_id", c.id)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer", backgroundColor: sel ? "#eff6ff" : "transparent", borderBottom: "1px solid var(--border-soft)" }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.backgroundColor = "transparent"; }}>
                    <span style={{ fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? "#1e40af" : "var(--text-primary)" }}>{c.nome}</span>
                    {sel && <Check size={14} color="#2563eb" strokeWidth={3} />}
                  </div>
                );
              })}
            </div>
          )}

          {error && <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</div>}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Annulla</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 13, fontWeight: 600, color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
            {saving ? "Salvataggio..." : "Crea utente"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UtentiPage() {
  const [utenti, setUtenti]     = useState<Utente[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showNew, setShowNew]   = useState(false);
  const [filterRuolo, setFilterRuolo]   = useState<Ruolo | "tutti">("tutti");
  const [filterAttivo, setFilterAttivo] = useState<"tutti" | "attivi" | "inattivi">("tutti");

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cg_utenti")
      .select("*, cg_fornitori(nome), cg_clienti(nome)")
      .order("nome");
    if (error) { console.error(error); setLoading(false); return; }
    setUtenti((data ?? []).map((u) => ({
      ...u,
      fornitore_nome: (u.cg_fornitori as unknown as { nome: string } | null)?.nome ?? null,
      cliente_nome:   (u.cg_clienti   as unknown as { nome: string } | null)?.nome ?? null,
    })));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = utenti.filter((u) => {
    const matchSearch = !search ||
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.fornitore_nome ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.cliente_nome ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRuolo  = filterRuolo === "tutti" || u.ruolo === filterRuolo;
    const matchAttivo = filterAttivo === "tutti" ? true : filterAttivo === "attivi" ? u.attivo : !u.attivo;
    return matchSearch && matchRuolo && matchAttivo;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Utenti</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            {loading ? "Caricamento..." : `${utenti.filter((u) => u.attivo).length} attivi · ${utenti.length} totali`}
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
          <Plus size={15} />Nuovo Utente
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" as const }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 240, backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input type="text" placeholder="Cerca per nome, email o associazione..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit", backgroundColor: "transparent" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}><X size={14} /></button>}
        </div>
        {/* Ruolo tabs */}
        <div style={{ display: "flex", backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {([["tutti", "Tutti"], ["pm", "PM"], ["specialista", "Specialista"], ["admin", "Admin"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilterRuolo(val as Ruolo | "tutti")}
              style={{ padding: "8px 14px", border: "none", borderRight: val !== "admin" ? "1px solid var(--border)" : "none", fontSize: 13, fontWeight: filterRuolo === val ? 700 : 500, color: filterRuolo === val ? "#2563eb" : "var(--text-secondary)", backgroundColor: filterRuolo === val ? "#eff6ff" : "transparent", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const }}>
              {label}
            </button>
          ))}
        </div>
        {/* Stato tabs */}
        <div style={{ display: "flex", backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {([["tutti", "Tutti"], ["attivi", "Attivi"], ["inattivi", "Inattivi"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilterAttivo(val)}
              style={{ padding: "8px 14px", border: "none", borderRight: val !== "inattivi" ? "1px solid var(--border)" : "none", fontSize: 13, fontWeight: filterAttivo === val ? 700 : 500, color: filterAttivo === val ? "#2563eb" : "var(--text-secondary)", backgroundColor: filterAttivo === val ? "#eff6ff" : "transparent", cursor: "pointer", fontFamily: "inherit" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>Caricamento...</div>
      ) : (
        <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-soft)" }}>
                {["Utente", "Email", "Ruolo", "Associazione", "Stato", ""].map((h) => (
                  <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>Nessun utente trovato</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border-soft)" : "none", transition: "background 0.1s", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                  {/* Utente */}
                  <td style={{ padding: "12px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar iniziali={u.avatar_iniziali} bg={u.avatar_bg} colore={u.avatar_colore} size={36} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{u.nome}</span>
                    </div>
                  </td>
                  {/* Email */}
                  <td style={{ padding: "12px 18px", fontSize: 13, color: "var(--text-secondary)" }}>
                    {u.email ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  {/* Ruolo */}
                  <td style={{ padding: "12px 18px" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: ruoloStyle[u.ruolo].bg, color: ruoloStyle[u.ruolo].color }}>
                      {ruoloStyle[u.ruolo].label}
                    </span>
                  </td>
                  {/* Associazione */}
                  <td style={{ padding: "12px 18px" }}>
                    {u.fornitore_nome ? (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Fornitore</div>
                        <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{u.fornitore_nome}</div>
                      </div>
                    ) : u.cliente_nome ? (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Cliente</div>
                        <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{u.cliente_nome}</div>
                      </div>
                    ) : <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>}
                  </td>
                  {/* Stato */}
                  <td style={{ padding: "12px 18px" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: u.attivo ? "#d1fae5" : "#f1f5f9", color: u.attivo ? "#065f46" : "#64748b" }}>
                      {u.attivo ? "Attivo" : "Inattivo"}
                    </span>
                  </td>
                  {/* Azioni */}
                  <td style={{ padding: "12px 18px", textAlign: "right" }}>
                    <button style={{ fontSize: 13, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Modifica</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && <UtenteModal onClose={() => setShowNew(false)} onSaved={loadData} />}
    </div>
  );
}
