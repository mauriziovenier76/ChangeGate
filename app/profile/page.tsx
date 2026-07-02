"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";

const PALETTE = [
  "#0f172a","#1e293b","#2563eb","#1d4ed8","#7c3aed","#9333ea",
  "#db2777","#e11d48","#ea580c","#d97706","#65a30d","#059669",
  "#0891b2","#0284c7","#6366f1","#ec4899","#f43f5e","#64748b",
];

function Avatar({ iniziali, bg, colore, size = 64 }: { iniziali: string; bg: string; colore: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", backgroundColor: bg, color: colore, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 700, flexShrink: 0, letterSpacing: "0.02em", border: "3px solid rgba(255,255,255,0.8)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
      {(iniziali || "??").toUpperCase().slice(0, 2)}
    </div>
  );
}

function ColorPicker({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, alignItems: "center" }}>
        {PALETTE.map((c) => (
          <button key={c} onClick={() => onChange(c)} style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: c, border: value === c ? "3px solid #2563eb" : "2px solid transparent", cursor: "pointer", outline: "none", padding: 0, boxShadow: value === c ? "0 0 0 2px white, 0 0 0 4px #2563eb" : "none", transition: "all 0.1s" }} />
        ))}
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--border)", cursor: "pointer", padding: 0 }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "DM Mono, monospace" }}>{value}</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading } = useUser();

  const [form, setForm] = useState<{ nome: string; avatar_iniziali: string; avatar_bg: string; avatar_colore: string } | null>(null);
  const [pwForm, setPwForm] = useState({ newPw: "", confirm: "" });
  const [saving, setSaving]     = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [pwError, setPwError]   = useState<string | null>(null);
  const [pwSaved, setPwSaved]   = useState(false);

  // Inizializza form dai dati utente al primo render
  if (user && !form) {
    setForm({
      nome:            user.nome,
      avatar_iniziali: user.avatar_iniziali,
      avatar_bg:       user.avatar_bg,
      avatar_colore:   user.avatar_colore,
    });
  }

  const set = (k: string, v: string) => { setForm((f) => f ? { ...f, [k]: v } : f); setSaved(false); };

  const handleSave = async () => {
    if (!user || !form) return;
    setSaving(true); setError(null);
    const { error: err } = await supabase.from("cg_utenti").update({
      nome:            form.nome.trim(),
      avatar_iniziali: form.avatar_iniziali.slice(0, 2).toUpperCase(),
      avatar_bg:       form.avatar_bg,
      avatar_colore:   form.avatar_colore,
    }).eq("id", user.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
  };

  const handleChangePassword = async () => {
    if (pwForm.newPw.length < 8) { setPwError("La password deve essere di almeno 8 caratteri."); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("Le password non coincidono."); return; }
    setSavingPw(true); setPwError(null);
    const { error: err } = await supabase.auth.updateUser({ password: pwForm.newPw });
    setSavingPw(false);
    if (err) { setPwError(err.message); return; }
    setPwSaved(true);
    setPwForm({ newPw: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 3000);
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" };

  if (loading || !user || !form) return null;

  const ruoloLabel: Record<string, string> = {
    admin: "Admin", pm_fornitore: "PM Fornitore", ps_fornitore: "PS Fornitore",
    pm_cliente: "PM Cliente", ku_cliente: "KU Cliente",
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Il mio profilo</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>Gestisci i tuoi dati e la tua password</p>
      </div>

      {/* Dati personali */}
      <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "28px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Dati personali</div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, padding: "16px", backgroundColor: "#f8fafc", borderRadius: 10 }}>
          <Avatar iniziali={form.avatar_iniziali || "??"} bg={form.avatar_bg} colore={form.avatar_colore} size={64} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{form.nome || user.nome}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{user.email}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20, backgroundColor: "#eff6ff", color: "#2563eb" }}>
                {ruoloLabel[user.ruolo] ?? user.ruolo}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={labelStyle}>Nome completo</label>
            <input type="text" value={form.nome} onChange={(e) => set("nome", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Iniziali avatar (max 2)</label>
            <input type="text" maxLength={2} value={form.avatar_iniziali}
              onChange={(e) => set("avatar_iniziali", e.target.value.toUpperCase().slice(0, 2))}
              style={{ ...inputStyle, width: 80, fontFamily: "DM Mono, monospace", fontSize: 16, fontWeight: 700, textAlign: "center" }} />
          </div>
          <ColorPicker value={form.avatar_bg} onChange={(c) => set("avatar_bg", c)} label="Colore sfondo" />
          <ColorPicker value={form.avatar_colore} onChange={(c) => set("avatar_colore", c)} label="Colore lettere" />
        </div>

        {error && <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626", marginBottom: 14 }}>{error}</div>}

        <button onClick={handleSave} disabled={saving}
          style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: saved ? "#10b981" : saving ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 13, fontWeight: 600, color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
          {saving ? "Salvataggio..." : saved ? "✓ Salvato" : "Salva modifiche"}
        </button>
      </div>

      {/* Password */}
      <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "28px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Cambia password</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Nuova password</label>
            <input type="password" placeholder="Minimo 8 caratteri" value={pwForm.newPw}
              onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Conferma password</label>
            <input type="password" placeholder="Ripeti la password" value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} style={inputStyle} />
          </div>
        </div>
        {pwError && <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626", marginBottom: 14 }}>{pwError}</div>}
        {pwSaved && <div style={{ padding: "10px 14px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 13, color: "#065f46", marginBottom: 14 }}>✓ Password aggiornata</div>}
        <button onClick={handleChangePassword} disabled={savingPw}
          style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: savingPw ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 13, fontWeight: 600, color: "white", cursor: savingPw ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {savingPw ? "Aggiornamento..." : "Aggiorna password"}
        </button>
      </div>
    </div>
  );
}
