"use client";

import { useState, useEffect } from "react";
import { Plus, Users, CheckCircle2, Circle, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Fornitore = {
  id: string;
  nome: string;
  email: string | null;
  attivo: boolean;
  created_at: string | null;
  pm: number;
  specialisti: number;
  clientCount: number;
  projectCount: number;
  crTotal: number;
  crClosed: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  position: "sticky", left: 0, zIndex: 1,
  boxShadow: "3px 0 8px -2px rgba(0,0,0,0.08)",
};

// ─── New Fornitore Modal ──────────────────────────────────────────────────────

function NewFornitoreModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "", email: "", attivo: true,
  });
  // Team members to add
  const [teamMembers, setTeamMembers] = useState<{ nome: string; email: string; ruolo: "pm" | "specialista" }[]>([]);
  const [newMember, setNewMember] = useState({ nome: "", email: "", ruolo: "pm" as "pm" | "specialista" });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const addMember = () => {
    if (!newMember.nome.trim()) return;
    setTeamMembers((prev) => [...prev, { ...newMember, nome: newMember.nome.trim() }]);
    setNewMember({ nome: "", email: "", ruolo: "pm" });
  };

  const removeMember = (i: number) => setTeamMembers((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.nome.trim()) { setError("Il nome è obbligatorio."); return; }
    setSaving(true); setError(null);

    const { data: fData, error: fErr } = await supabase
      .from("cg_fornitori")
      .insert({ nome: form.nome.trim(), email: form.email || null, attivo: form.attivo })
      .select("id")
      .single();

    if (fErr || !fData) { setError(fErr?.message ?? "Errore creazione fornitore."); setSaving(false); return; }

    if (teamMembers.length > 0) {
      const { error: tErr } = await supabase.from("cg_team").insert(
        teamMembers.map((m) => ({ fornitore_id: fData.id, nome: m.nome, email: m.email || null, ruolo: m.ruolo }))
      );
      if (tErr) { setError(tErr.message); setSaving(false); return; }

      // Crea anche i record in cg_utenti per ogni membro del team
      // ruolo team "pm" → pm_fornitore, "specialista" → ps_fornitore
      const utentiDaCreare = teamMembers
        .filter((m) => m.nome.trim()) // solo se hanno un nome
        .map((m) => ({
          nome:            m.nome.trim(),
          email:           m.email || null,
          ruolo:           m.ruolo === "pm" ? "pm_fornitore" : "ps_fornitore",
          fornitore_id:    fData.id,
          attivo:          true,
          avatar_iniziali: m.nome.trim().split(/\s+/).length >= 2
            ? (m.nome.trim().split(/\s+/)[0][0] + m.nome.trim().split(/\s+/)[1][0]).toUpperCase()
            : m.nome.trim().slice(0, 2).toUpperCase(),
          avatar_bg:    "#2563eb",
          avatar_colore: "#ffffff",
        }));

      if (utentiDaCreare.length > 0) {
        const { error: uErr } = await supabase.from("cg_utenti").insert(utentiDaCreare);
        if (uErr) { setError(uErr.message); setSaving(false); return; }
      }
    }

    setSaving(false);
    onCreated(); onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)",
    fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600, color: "#374151",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em",
  };
  const sectionTitle = (t: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--border-soft)" }}>
      {t}
    </div>
  );

  const pmCount   = teamMembers.filter((m) => m.ruolo === "pm").length;
  const specCount = teamMembers.filter((m) => m.ruolo === "specialista").length;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", zIndex: 60, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(620px, 95vw)", maxHeight: "92vh", backgroundColor: "white", borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", zIndex: 70, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Nuovo Fornitore</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "3px 0 0" }}>Crea l&apos;anagrafica e aggiungi il team</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)" }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          {/* Anagrafica */}
          {sectionTitle("1 · Anagrafica")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
            <div>
              <label style={labelStyle}>Nome <span style={{ color: "#dc2626" }}>*</span></label>
              <input type="text" placeholder="Es. Tech Solutions Srl" value={form.nome} onChange={(e) => set("nome", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" placeholder="info@fornitore.it" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Team */}
          {sectionTitle("2 · Team")}

          {/* Add member row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 10, marginBottom: 12, alignItems: "flex-end" }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Nome</label>
              <input type="text" placeholder="Es. Marco Rossi" value={newMember.nome} onChange={(e) => setNewMember((m) => ({ ...m, nome: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addMember()}
                style={inputStyle} />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Email</label>
              <input type="email" placeholder="marco@fornitore.it" value={newMember.email} onChange={(e) => setNewMember((m) => ({ ...m, email: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addMember()}
                style={inputStyle} />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Ruolo</label>
              <select value={newMember.ruolo} onChange={(e) => setNewMember((m) => ({ ...m, ruolo: e.target.value as "pm" | "specialista" }))}
                style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
                <option value="pm">PM</option>
                <option value="specialista">Specialista</option>
              </select>
            </div>
            <button onClick={addMember}
              style={{ padding: "9px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const }}>
              + Aggiungi
            </button>
          </div>

          {/* Team list */}
          {teamMembers.length > 0 && (
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-soft)" }}>
                {["Nome", "Email", "Ruolo", ""].map((h) => (
                  <div key={h} style={{ padding: "7px 12px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{h}</div>
                ))}
              </div>
              {teamMembers.map((m, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", alignItems: "center", borderBottom: i < teamMembers.length - 1 ? "1px solid var(--border-soft)" : "none", backgroundColor: "white" }}>
                  <div style={{ padding: "9px 12px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{m.nome}</div>
                  <div style={{ padding: "9px 12px", fontSize: 13, color: "var(--text-secondary)" }}>{m.email || <span style={{ color: "#cbd5e1" }}>—</span>}</div>
                  <div style={{ padding: "9px 12px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, backgroundColor: m.ruolo === "pm" ? "#eff6ff" : "#f0fdf4", color: m.ruolo === "pm" ? "#2563eb" : "#059669" }}>
                      {m.ruolo === "pm" ? "PM" : "Specialista"}
                    </span>
                  </div>
                  <div style={{ padding: "9px 12px" }}>
                    <button onClick={() => removeMember(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 0, display: "flex" }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Team summary */}
          {teamMembers.length > 0 && (
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 12, color: "#2563eb", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{pmCount} PM</span>
              <span style={{ fontSize: 12, color: "#059669", backgroundColor: "#f0fdf4", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{specCount} Specialisti</span>
            </div>
          )}

          {/* Stato */}
          {sectionTitle("3 · Stato")}
          <div onClick={() => set("attivo", !form.attivo)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, border: "1.5px solid var(--border)", cursor: "pointer", backgroundColor: form.attivo ? "#f0fdf4" : "#f8fafc" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Fornitore attivo</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>I fornitori attivi compaiono nelle liste di selezione</div>
            </div>
            <div style={{ width: 44, height: 24, borderRadius: 99, backgroundColor: form.attivo ? "#22c55e" : "#cbd5e1", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: form.attivo ? 23 : 3, width: 18, height: 18, borderRadius: "50%", backgroundColor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>
            Annulla
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 13, fontWeight: 600, color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
            {saving ? "Salvataggio..." : "Crea fornitore"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Edit Fornitore Drawer ────────────────────────────────────────────────────

function EditFornitoreDrawer({ fornitore, onClose, onSaved }: {
  fornitore: Fornitore; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nome:   fornitore.nome,
    email:  fornitore.email ?? "",
    attivo: fornitore.attivo,
  });
  const [teamMembers, setTeamMembers] = useState<{ id?: string; nome: string; email: string; ruolo: "pm" | "specialista"; isNew?: boolean }[]>([]);
  const [newMember, setNewMember] = useState({ nome: "", email: "", ruolo: "pm" as "pm" | "specialista" });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  // Carica team esistente
  useEffect(() => {
    supabase.from("cg_team").select("id, nome, email, ruolo").eq("fornitore_id", fornitore.id).order("nome").limit(100)
      .then(({ data, error }) => { console.log("cg_team data:", data, "error:", error); setTeamMembers((data ?? []).map((m) => ({ id: m.id, nome: m.nome, email: m.email ?? "", ruolo: m.ruolo as "pm" | "specialista" }))) });
  }, [fornitore.id]);

  const set = (k: string, v: string | boolean) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false); };

  const addMember = () => {
    if (!newMember.nome.trim()) return;
    setTeamMembers((t) => [...t, { ...newMember, isNew: true }]);
    setNewMember({ nome: "", email: "", ruolo: "pm" });
  };

  const removeMember = (idx: number) => setTeamMembers((t) => t.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!form.nome.trim()) { setError("Il nome è obbligatorio."); return; }
    setSaving(true); setError(null);

    // 1. Aggiorna anagrafica fornitore
    const { error: err } = await supabase.from("cg_fornitori").update({
      nome:   form.nome.trim(),
      email:  form.email || null,
      attivo: form.attivo,
    }).eq("id", fornitore.id);
    if (err) { setError(err.message); setSaving(false); return; }

    // 2. Inserisci nuovi membri team
    const nuovi = teamMembers.filter((m) => m.isNew);
    if (nuovi.length > 0) {
      const { error: tErr } = await supabase.from("cg_team").insert(
        nuovi.map((m) => ({ fornitore_id: fornitore.id, nome: m.nome.trim(), email: m.email || null, ruolo: m.ruolo }))
      );
      if (tErr) { setError(tErr.message); setSaving(false); return; }

      // 3. Crea anche record in cg_utenti per i nuovi
      const utentiDaCreare = nuovi.map((m) => ({
        nome:            m.nome.trim(),
        email:           m.email || null,
        ruolo:           m.ruolo === "pm" ? "pm_fornitore" : "ps_fornitore",
        fornitore_id:    fornitore.id,
        attivo:          true,
        avatar_iniziali: m.nome.trim().split(/\s+/).length >= 2
          ? (m.nome.trim().split(/\s+/)[0][0] + m.nome.trim().split(/\s+/)[1][0]).toUpperCase()
          : m.nome.trim().slice(0, 2).toUpperCase(),
        avatar_bg:    "#2563eb",
        avatar_colore: "#ffffff",
      }));
      const { error: uErr } = await supabase.from("cg_utenti").insert(utentiDaCreare);
      if (uErr) { setError(uErr.message); setSaving(false); return; }
    }

    setSaving(false);
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
  const sectionLabel = (t: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--border-soft)" }}>{t}</div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.3)", zIndex: 40, backdropFilter: "blur(2px)" }} />
      <div className="animate-slideIn" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 500, backgroundColor: "white", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", marginBottom: 4 }}>Modifica fornitore</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{fornitore.nome}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)" }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Anagrafica */}
          {sectionLabel("Anagrafica")}
          <div>
            <label style={labelStyle}>Nome *</label>
            <input type="text" value={form.nome} onChange={(e) => set("nome", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@fornitore.it" style={inputStyle} />
          </div>

          {/* Stats */}
          <div style={{ backgroundColor: "#eff6ff", borderRadius: 10, padding: "12px 14px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "PM",          value: teamMembers.filter((m) => m.ruolo === "pm").length },
              { label: "Specialisti", value: teamMembers.filter((m) => m.ruolo === "specialista").length },
              { label: "Clienti",     value: fornitore.clientCount },
              { label: "Progetti",    value: fornitore.projectCount },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1e40af", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#93c5fd", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Team */}
          {sectionLabel("Team")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 8, alignItems: "flex-end", marginBottom: 4 }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Nome</label>
              <input type="text" placeholder="Es. Marco Rossi" value={newMember.nome}
                onChange={(e) => setNewMember((m) => ({ ...m, nome: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addMember()}
                style={inputStyle} />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Email</label>
              <input type="email" placeholder="marco@fornitore.it" value={newMember.email}
                onChange={(e) => setNewMember((m) => ({ ...m, email: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addMember()}
                style={inputStyle} />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Ruolo</label>
              <select value={newMember.ruolo} onChange={(e) => setNewMember((m) => ({ ...m, ruolo: e.target.value as "pm" | "specialista" }))}
                style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
                <option value="pm">PM</option>
                <option value="specialista">Specialista</option>
              </select>
            </div>
            <button onClick={addMember}
              style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const }}>
              + Aggiungi
            </button>
          </div>

          {teamMembers.length > 0 && (
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-soft)" }}>
                {["Nome", "Email", "Ruolo", ""].map((h) => (
                  <div key={h} style={{ padding: "7px 12px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{h}</div>
                ))}
              </div>
              {teamMembers.map((m, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", alignItems: "center", borderBottom: i < teamMembers.length - 1 ? "1px solid var(--border-soft)" : "none", backgroundColor: m.isNew ? "#f0fdf4" : "white" }}>
                  <div style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {m.nome}
                    {m.isNew && <span style={{ marginLeft: 6, fontSize: 10, color: "#059669", fontWeight: 700 }}>NUOVO</span>}
                  </div>
                  <div style={{ padding: "8px 12px", fontSize: 13, color: "var(--text-secondary)" }}>{m.email || <span style={{ color: "#cbd5e1" }}>—</span>}</div>
                  <div style={{ padding: "8px 12px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, backgroundColor: m.ruolo === "pm" ? "#eff6ff" : "#f0fdf4", color: m.ruolo === "pm" ? "#2563eb" : "#059669" }}>
                      {m.ruolo === "pm" ? "PM" : "Specialista"}
                    </span>
                  </div>
                  <div style={{ padding: "8px 12px" }}>
                    {m.isNew && (
                      <button onClick={() => removeMember(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                        Rimuovi
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stato */}
          {sectionLabel("Stato")}
          <div onClick={() => set("attivo", !form.attivo)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 9, border: "1.5px solid var(--border)", cursor: "pointer", backgroundColor: form.attivo ? "#f0fdf4" : "#f8fafc" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Fornitore attivo</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>Visibile nelle liste di selezione</div>
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

export default function FornitoriPage() {
  const { isAdmin, isPsFornitore, user, loading: userLoading } = useUser();
  const [fornitori, setFornitori] = useState<Fornitore[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showNew, setShowNew]     = useState(false);
  const [editing, setEditing]     = useState<Fornitore | null>(null);

  const loadData = async () => {
    setLoading(true);

    let query = supabase
      .from("cg_fornitori")
      .select(`
        id, nome, email, attivo, created_at,
        cg_team ( id, ruolo ),
        cg_clienti (
          id,
          cg_progetti (
            id,
            cg_change_requests ( id, stato )
          )
        )
      `)
      .order("nome");
    if (isPsFornitore && user?.fornitore_id) {
      query = query.eq("id", user.fornitore_id);
    }
    const { data, error } = await query;

    if (error) { console.error(error); setLoading(false); return; }

    setFornitori((data ?? []).map((f) => {
      const team     = f.cg_team as unknown as { id: string; ruolo: string }[];
      const clienti  = f.cg_clienti as unknown as { id: string; cg_progetti: { id: string; cg_change_requests: { id: string; stato: string }[] }[] }[];
      const allCRs   = clienti.flatMap((c) => c.cg_progetti.flatMap((p) => p.cg_change_requests));
      const projects = clienti.flatMap((c) => c.cg_progetti);

      return {
        id:           f.id,
        nome:         f.nome,
        email:        f.email,
        attivo:       f.attivo,
        created_at:   f.created_at ?? null,
        pm:           team.filter((t) => t.ruolo === "pm").length,
        specialisti:  team.filter((t) => t.ruolo === "specialista").length,
        clientCount:  clienti.length,
        projectCount: projects.length,
        crTotal:      allCRs.length,
        crClosed:     allCRs.filter((cr) => cr.stato === "Completata").length,
      };
    }));
    setLoading(false);
  };

  useEffect(() => {
    if (userLoading) return;
    if (isPsFornitore && !user?.fornitore_id) return;
    setFornitori([]);
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, user?.fornitore_id, isPsFornitore]);

  if (userLoading) return null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Fornitori</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            {loading ? "Caricamento..." : `${fornitori.filter((f) => f.attivo).length} attivi · ${fornitori.length} totali`}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowNew(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
            <Plus size={15} />Nuovo Fornitore
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>Caricamento...</div>
      ) : (
        <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", tableLayout: "fixed" as const, width: "max-content" }}>
            <colgroup>
              <col style={{ width: 220 }} />
              <col style={{ width: 210 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 230 }} />
              <col style={{ width: 260 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 110 }} />
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
                  { label: "Creato il" },
                  { label: "Stato" },
                  { label: "" },
                ].map((h) => (
                  <th key={h.label} style={{ padding: "11px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const, backgroundColor: "#f8fafc", ...(h.sticky ? { ...STICKY, zIndex: 3 } : {}) }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fornitori.map((f, i) => {
                const pct  = f.crTotal === 0 ? 0 : Math.round((f.crClosed / f.crTotal) * 100);
                const open = f.crTotal - f.crClosed;
                return (
                  <tr key={f.id} style={{ borderBottom: i < fornitori.length - 1 ? "1px solid var(--border-soft)" : "none", cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={(e) => Array.from(e.currentTarget.cells).forEach((td) => { if (!(td as HTMLElement).dataset.sticky) (td as HTMLElement).style.backgroundColor = "#f8fafc"; })}
                    onMouseLeave={(e) => Array.from(e.currentTarget.cells).forEach((td) => { if (!(td as HTMLElement).dataset.sticky) (td as HTMLElement).style.backgroundColor = "transparent"; })}
                  >
                    {/* Fornitore — sticky */}
                    <td data-sticky="true" style={{ padding: "16px 20px", backgroundColor: "white", ...STICKY }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" as const }}>{f.nome}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{f.email ?? <span style={{ color: "#cbd5e1" }}>—</span>}</div>
                    </td>

                    {/* Team */}
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: 20 }}>
                        {[{ count: f.pm, label: "PM", bg: "#eff6ff", color: "#2563eb" }, { count: f.specialisti, label: "Specialisti", bg: "#f0fdf4", color: "#059669" }].map((t) => (
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
                      {f.clientCount > 0
                        ? <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}><span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{f.clientCount}</span><span style={{ fontSize: 12, color: "var(--text-muted)" }}>client{f.clientCount !== 1 ? "i" : "e"}</span></div>
                        : <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>}
                    </td>

                    {/* Progetti */}
                    <td style={{ padding: "16px 20px" }}>
                      {f.projectCount > 0
                        ? <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}><span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{f.projectCount}</span><span style={{ fontSize: 12, color: "var(--text-muted)" }}>progett{f.projectCount !== 1 ? "i" : "o"}</span></div>
                        : <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>}
                    </td>

                    {/* CR chiuse / aperte */}
                    <td style={{ padding: "16px 20px" }}>
                      {f.crTotal > 0
                        ? <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={16} color="#059669" /><span style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}>{f.crClosed}</span><span style={{ fontSize: 12, color: "var(--text-muted)" }}>chiuse</span></div>
                            <div style={{ width: 1, height: 22, backgroundColor: "var(--border)" }} />
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Circle size={16} color="#d97706" /><span style={{ fontSize: 16, fontWeight: 700, color: "#d97706" }}>{open}</span><span style={{ fontSize: 12, color: "var(--text-muted)" }}>aperte</span></div>
                          </div>
                        : <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>}
                    </td>

                    {/* Avanzamento */}
                    <td style={{ padding: "16px 20px" }}>
                      <MiniProgress pct={pct} closed={f.crClosed} total={f.crTotal} />
                    </td>

                    {/* Creato il */}
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" as const }}>
                      {f.created_at ? new Date(f.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" }) : <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>

                    {/* Stato */}
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" as const, backgroundColor: f.attivo ? "#d1fae5" : "#f1f5f9", color: f.attivo ? "#065f46" : "#64748b" }}>
                        {f.attivo ? "Attivo" : "Inattivo"}
                      </span>
                    </td>

                    {/* Azioni */}
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      {isAdmin && (
                        <button onClick={() => setEditing(f)} style={{ fontSize: 13, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" as const }}>
                          Modifica
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showNew  && <NewFornitoreModal onClose={() => setShowNew(false)} onCreated={loadData} />}
      {editing  && <EditFornitoreDrawer key={editing.id} fornitore={editing} onClose={() => setEditing(null)} onSaved={loadData} />}
    </div>
  );
}
