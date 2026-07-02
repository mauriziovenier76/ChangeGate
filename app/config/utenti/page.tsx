"use client";

import { useState, useEffect } from "react";
import { Plus, X, Search, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Ruolo = "admin" | "pm_fornitore" | "ps_fornitore" | "pm_cliente" | "ku_cliente";

type Utente = {
  id: string;
  nome: string;
  email: string | null;
  ruolo: Ruolo;
  attivo: boolean;
  fornitore_id: string | null;
  cliente_id: string | null;
  fornitore_nome: string | null;
  fornitore_created_at: string | null;
  cliente_nome: string | null;
  avatar_iniziali: string;
  avatar_bg: string;
  avatar_colore: string;
  auth_user_id: string | null;
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
  admin:        { bg: "#fdf4ff", color: "#9333ea", label: "Admin" },
  pm_fornitore: { bg: "#eff6ff", color: "#2563eb", label: "PM Fornitore" },
  ps_fornitore: { bg: "#f0fdf4", color: "#059669", label: "PS Fornitore" },
  pm_cliente:   { bg: "#fff7ed", color: "#ea580c", label: "PM Cliente" },
  ku_cliente:   { bg: "#fef3c7", color: "#92400e", label: "KU Cliente" },
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

function UtenteModal({ onClose, onSaved, utente }: { onClose: () => void; onSaved: () => void; utente?: Utente }) {
  const isEdit = !!utente;
  const { user, loading: userLoading } = useUser();

  const [fornitori, setFornitori] = useState<OptionRow[]>([]);
  const [clienti, setClienti]     = useState<OptionRow[]>([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // pm_fornitore: fornitore fisso al proprio
  const forcedFornitoreId = user?.fornitore_id ?? null;
  const [forcedFornitoreNome, setForcedFornitoreNome] = useState<string | null>(null);

  // Tipo associazione iniziale
  const [assocType, setAssocType] = useState<"fornitore" | "cliente" | "nessuno">(
    !isEdit ? "fornitore"
    : utente?.fornitore_id ? "fornitore"
    : utente?.cliente_id   ? "cliente"
    : "nessuno"
  );

  const [form, setForm] = useState({
    nome:            utente?.nome            ?? "",
    email:           utente?.email           ?? "",
    ruolo:           (utente?.ruolo ?? "pm_fornitore") as Ruolo,
    attivo:          utente?.attivo          ?? true,
    fornitore_id:    utente?.fornitore_id    ?? forcedFornitoreId ?? "",
    cliente_id:      utente?.cliente_id      ?? "",
    avatar_iniziali: utente?.avatar_iniziali ?? "",
    avatar_bg:       utente?.avatar_bg       ?? "#2563eb",
    avatar_colore:   utente?.avatar_colore   ?? "#ffffff",
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  // Ruoli disponibili per ruolo dell'utente loggato
  // Admin: solo PM Fornitore
  // PM Fornitore: tutti tranne Admin
  const ruoliFornitore: { value: Ruolo; label: string }[] = false
    ? [{ value: "pm_fornitore", label: "PM Fornitore" }]
    : [
        { value: "pm_fornitore", label: "PM Fornitore" },
        { value: "ps_fornitore", label: "PS Fornitore" },
      ];

  const ruoliCliente: { value: Ruolo; label: string }[] = [
    { value: "pm_cliente", label: "PM Cliente" },
  ];

  const ruoliDisponibili = assocType === "fornitore" ? ruoliFornitore
    : assocType === "cliente" ? ruoliCliente
    : [...ruoliFornitore, ...ruoliCliente];

  const handleAssocType = (t: "fornitore" | "cliente" | "nessuno") => {
    setAssocType(t);
    if (t === "fornitore" && !ruoliFornitore.find((r: {value: string}) => r.value === form.ruolo)) {
      setForm((f) => ({ ...f, ruolo: "pm_fornitore", fornitore_id: forcedFornitoreId ?? "", cliente_id: "" }));
    } else if (t === "cliente" && !ruoliCliente.find(r => r.value === form.ruolo)) {
      setForm((f) => ({ ...f, ruolo: "pm_cliente", fornitore_id: forcedFornitoreId ?? "", cliente_id: "" }));
    }
  };

  // Auto-generate iniziali from nome only when creating
  useEffect(() => {
    if (!isEdit && form.nome.trim()) {
      const words = form.nome.trim().split(/\s+/);
      const iniziali = words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : form.nome.slice(0, 2).toUpperCase();
      setForm((f) => ({ ...f, avatar_iniziali: iniziali }));
    }
  }, [form.nome]);

  useEffect(() => {
    // Fornitori: admin vede tutti; pm_fornitore carica solo il proprio per mostrarne il nome
    if (true) {
      supabase.from("cg_fornitori").select("id, nome").eq("attivo", true).order("nome")
        .then(({ data }) => setFornitori(data ?? []));
    }
    if (true && forcedFornitoreId) {
      supabase.from("cg_fornitori").select("nome").eq("id", forcedFornitoreId).single()
        .then(({ data }) => setForcedFornitoreNome(data?.nome ?? null));
    }
    // Clienti: pm_fornitore vede solo i clienti del proprio fornitore
    if (true && user?.fornitore_id) {
      supabase.from("cg_clienti").select("id, nome").eq("attivo", true).eq("fornitore_id", user.fornitore_id).order("nome")
        .then(({ data }) => setClienti(data ?? []));
    } else if (true) {
      supabase.from("cg_clienti").select("id, nome").eq("attivo", true).order("nome")
        .then(({ data }) => setClienti(data ?? []));
    }
  }, [false, true, user?.fornitore_id]);

  const handleSave = async () => {
    if (!form.nome.trim()) { setError("Il nome è obbligatorio."); return; }
    if (!form.avatar_iniziali.trim()) { setError("Le iniziali sono obbligatorie."); return; }
    if (false && !form.fornitore_id) { setError("Seleziona un fornitore — obbligatorio per gli utenti Admin."); return; }
    if (true && assocType === "fornitore" && !forcedFornitoreId) { setError("Fornitore non trovato nel profilo."); return; }
    if (!false && assocType === "cliente" && !form.cliente_id) { setError("Seleziona un cliente."); return; }
    if (!false && assocType === "fornitore" && !ruoliFornitore.find(r => r.value === form.ruolo)) {
      setError("Il ruolo selezionato non è compatibile con un utente Fornitore."); return;
    }
    if (!false && assocType === "cliente" && !ruoliCliente.find(r => r.value === form.ruolo)) {
      setError("Il ruolo selezionato non è compatibile con un utente Cliente."); return;
    }
    setSaving(true); setError(null);

    const effectiveAssoc = (false || true) ? assocType : assocType;
    const payload = {
      nome:             form.nome.trim(),
      email:            form.email || null,
      ruolo:            form.ruolo,
      attivo:           form.attivo,
      // pm_fornitore: se assocType è fornitore usa forcedFornitoreId, se cliente lascia null
      fornitore_id:     effectiveAssoc === "fornitore"
                          ? ((forcedFornitoreId ?? form.fornitore_id) || null)
                          : null,
      cliente_id:       effectiveAssoc === "cliente" ? form.cliente_id || null : null,
      avatar_iniziali:  form.avatar_iniziali.slice(0, 2).toUpperCase(),
      avatar_bg:        form.avatar_bg,
      avatar_colore:    form.avatar_colore,
    };

    const { error: err } = isEdit
      ? await supabase.from("cg_utenti").update(payload).eq("id", utente!.id)
      : await supabase.from("cg_utenti").insert(payload);

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
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{isEdit ? "Modifica Utente" : "Nuovo Utente"}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "3px 0 0" }}>{isEdit ? `Stai modificando ${utente!.nome}` : "Configura l'account e l'avatar"}</p>
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
                {ruoliDisponibili.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {assocType === "fornitore" && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Solo ruoli compatibili con utenti Fornitore</div>}
              {assocType === "cliente"   && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Solo ruoli compatibili con utenti Cliente</div>}
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <Avatar iniziali={form.avatar_iniziali || "??"} bg={form.avatar_bg} colore={form.avatar_colore} size={64} />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Anteprima</span>
            </div>
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

          {/* Questo blocco non è più usato — solo pm_fornitore accede */}
          {false && (
            <>
              <div style={{ padding: "10px 14px", backgroundColor: "#eff6ff", borderRadius: 8, fontSize: 13, color: "#1e40af", fontWeight: 500, marginBottom: 16 }}>
                🏢 Utente associato obbligatoriamente a un Fornitore
              </div>
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
            </>
          )}

          {/* PM Fornitore: può scegliere fornitore (fisso) o cliente */}
          {true && (
            <>
              {/* Tab selezione tipo associazione */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {(["fornitore", "cliente"] as const).map((t) => (
                  <button key={t} onClick={() => handleAssocType(t)}
                    style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, fontWeight: assocType === t ? 700 : 500, backgroundColor: assocType === t ? "#eff6ff" : "white", color: assocType === t ? "#2563eb" : "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit", borderColor: assocType === t ? "#2563eb" : "var(--border)" }}>
                    {t === "fornitore" ? "🏢 Fornitore" : "👤 Cliente"}
                  </button>
                ))}
              </div>

              {/* Fornitore fisso — non modificabile */}
              {assocType === "fornitore" && (
                <div style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border)", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {forcedFornitoreNome ?? forcedFornitoreId ?? "—"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Assegnato automaticamente</span>
                </div>
              )}

              {/* Lista clienti filtrata per il proprio fornitore */}
              {assocType === "cliente" && (
                <div style={{ border: "1.5px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ backgroundColor: "#f8fafc", padding: "8px 12px", borderBottom: "1px solid var(--border-soft)", fontSize: 12, color: "var(--text-muted)" }}>
                    Seleziona il cliente (solo clienti del tuo fornitore)
                  </div>
                  {clienti.length === 0 ? (
                    <div style={{ padding: "16px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Nessun cliente disponibile</div>
                  ) : clienti.map((c) => {
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
            </>
          )}

          {error && <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</div>}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Annulla</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 13, fontWeight: 600, color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
            {saving ? "Salvataggio..." : isEdit ? "Salva modifiche" : "Crea utente"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UtentiPage() {
  const { user, loading: userLoading } = useUser();

  const [utenti, setUtenti]     = useState<Utente[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showNew, setShowNew]       = useState(false);
  const [editing, setEditing]       = useState<Utente | null>(null);
  const [filterRuolo, setFilterRuolo]   = useState<Ruolo | "tutti">("tutti");
  const [filterAttivo, setFilterAttivo] = useState<"tutti" | "attivi" | "inattivi">("tutti");
  const [inviting, setInviting] = useState<string | null>(null);

  const handleInvite = async (u: Utente) => {
    if (!u.email) { alert("Questo utente non ha un'email associata."); return; }
    setInviting(u.id);
    const res = await fetch("/api/invite-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: u.email, nome: u.nome, utente_id: u.id }),
    });
    const json = await res.json();
    setInviting(null);
    if (json.error) { alert(`Errore: ${json.error}`); return; }
    alert(`Invito inviato a ${u.email}`);
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    let query = supabase
      .from("cg_utenti")
      .select("*, cg_fornitori(nome, created_at), cg_clienti(nome)")
      .order("nome");

    // pm_fornitore vede solo utenti del proprio fornitore o dei propri clienti
    if (true && user?.fornitore_id) {
      query = query.or(`fornitore_id.eq.${user.fornitore_id},cliente_id.in.(${
        // subquery inline non supportata — carichiamo tutti e filtriamo client-side
        // il filtro viene applicato dopo sotto
        ""
      })`);
      // Nota: il filtro cliente viene applicato client-side dopo aver caricato i clienti
    }

    const { data, error } = await supabase
      .from("cg_utenti")
      .select("*, cg_fornitori(nome, created_at), cg_clienti(nome)")
      .order("nome");

    if (error) { console.error(error); setLoading(false); return; }

    let rows = (data ?? []).map((u) => ({
      ...u,
      fornitore_nome:       (u.cg_fornitori as unknown as { nome: string; created_at: string } | null)?.nome ?? null,
      fornitore_created_at: (u.cg_fornitori as unknown as { nome: string; created_at: string } | null)?.created_at ?? null,
      cliente_nome:         (u.cg_clienti   as unknown as { nome: string } | null)?.nome ?? null,
      auth_user_id:         u.auth_user_id ?? null,
    }));

    // pm_fornitore: filtra client-side — vede solo utenti del proprio fornitore
    // o utenti (pm_cliente/ku_cliente) associati a clienti del proprio fornitore.
    // Per i clienti non abbiamo fornitore_id sull'utente, quindi carichiamo i clienti del fornitore
    // e filtriamo per cliente_id.
    if (true && user?.fornitore_id) {
      const { data: clientiFornitore } = await supabase
        .from("cg_clienti")
        .select("id")
        .eq("fornitore_id", user.fornitore_id);
      const clientiIds = new Set((clientiFornitore ?? []).map((c: { id: string }) => c.id));

      rows = rows.filter((u) =>
        u.fornitore_id === user.fornitore_id ||
        (u.cliente_id && clientiIds.has(u.cliente_id))
      );
    }

    setUtenti(rows);
    setLoading(false);
  };

  useEffect(() => {
    if (userLoading) return;
    if (true && !user?.fornitore_id) return;
    setUtenti([]);
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, user?.fornitore_id, true]);

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

  // Tab ruoli: pm_fornitore non vede "Admin"
  const ruoloTabs: [string, string][] = true
    ? [["tutti", "Tutti"], ["pm_fornitore", "PM For."], ["ps_fornitore", "PS For."], ["pm_cliente", "PM Cli."], ["ku_cliente", "KU Cli."]]
    : [["tutti", "Tutti"], ["admin", "Admin"], ["pm_fornitore", "PM For."], ["ps_fornitore", "PS For."], ["pm_cliente", "PM Cli."], ["ku_cliente", "KU Cli."]];

  if (userLoading) return null;

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
        <div style={{ flex: 1, minWidth: 240, backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input type="text" placeholder="Cerca per nome, email o associazione..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit", backgroundColor: "transparent" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}><X size={14} /></button>}
        </div>
        <div style={{ display: "flex", backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {ruoloTabs.map(([val, label], i) => (
            <button key={val} onClick={() => setFilterRuolo(val as Ruolo | "tutti")}
              style={{ padding: "8px 12px", border: "none", borderRight: i < ruoloTabs.length - 1 ? "1px solid var(--border)" : "none", fontSize: 12, fontWeight: filterRuolo === val ? 700 : 500, color: filterRuolo === val ? "#2563eb" : "var(--text-secondary)", backgroundColor: filterRuolo === val ? "#eff6ff" : "transparent", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const }}>
              {label}
            </button>
          ))}
        </div>
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
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>Nessun utente trovato</div>
      ) : (() => {
        const groups = new Map<string, { label: string; createdAt: string | null; utenti: Utente[] }>();
        filtered.forEach((u) => {
          const key = u.fornitore_nome ?? (u.cliente_nome ? `__cliente__${u.cliente_nome}` : "__nessuno__");
          if (!groups.has(key)) {
            groups.set(key, {
              label: u.fornitore_nome ?? u.cliente_nome ?? "Nessuna associazione",
              createdAt: u.fornitore_created_at ?? null,
              utenti: [],
            });
          }
          groups.get(key)!.utenti.push(u);
        });

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Array.from(groups.entries()).map(([key, group]) => (
              <div key={key} style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", backgroundColor: key.startsWith("__") ? "#f8fafc" : "#f0f4ff", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                      {key.startsWith("__cliente__") ? "👤 " : key === "__nessuno__" ? "" : "🏢 "}
                      {group.label}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", backgroundColor: "white", padding: "2px 8px", borderRadius: 20, border: "1px solid var(--border)" }}>
                      {group.utenti.length} {group.utenti.length === 1 ? "utente" : "utenti"}
                    </span>
                  </div>
                  {group.createdAt && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Fornitore creato il {new Date(group.createdAt).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                  )}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-soft)" }}>
                      {["Utente", "Email", "Ruolo", "Stato", ""].map((h) => (
                        <th key={h} style={{ padding: "9px 18px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.utenti.map((u, i) => (
                      <tr key={u.id}
                        style={{ borderBottom: i < group.utenti.length - 1 ? "1px solid var(--border-soft)" : "none", transition: "background 0.1s", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <td style={{ padding: "11px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar iniziali={u.avatar_iniziali} bg={u.avatar_bg} colore={u.avatar_colore} size={32} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{u.nome}</span>
                          </div>
                        </td>
                        <td style={{ padding: "11px 18px", fontSize: 13, color: "var(--text-secondary)" }}>
                          {u.email ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                        </td>
                        <td style={{ padding: "11px 18px" }}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: ruoloStyle[u.ruolo].bg, color: ruoloStyle[u.ruolo].color }}>
                            {ruoloStyle[u.ruolo].label}
                          </span>
                        </td>
                        <td style={{ padding: "11px 18px" }}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: u.attivo ? "#d1fae5" : "#f1f5f9", color: u.attivo ? "#065f46" : "#64748b" }}>
                            {u.attivo ? "Attivo" : "Inattivo"}
                          </span>
                        </td>
                        <td style={{ padding: "11px 18px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
                            {!u.auth_user_id && u.email && (
                              <button onClick={() => handleInvite(u)} disabled={inviting === u.id}
                                style={{ fontSize: 12, color: "#059669", background: "none", border: "1px solid #059669", borderRadius: 6, cursor: inviting === u.id ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 600, padding: "3px 10px", opacity: inviting === u.id ? 0.6 : 1 }}>
                                {inviting === u.id ? "Invio..." : "✉ Invita"}
                              </button>
                            )}
                            {u.auth_user_id && <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>✓ Attivo</span>}
                            <button onClick={() => setEditing(u)} style={{ fontSize: 13, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Modifica</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        );
      })()}

      {showNew  && <UtenteModal onClose={() => setShowNew(false)}    onSaved={loadData} />}
      {editing  && <UtenteModal onClose={() => setEditing(null)}     onSaved={loadData} utente={editing} />}
    </div>
  );
}
