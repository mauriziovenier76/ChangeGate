"use client";

import { useState, useEffect } from "react";
import { Plus, X, Search, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Fornitore = { id: string; nome: string };
type Cliente = {
  id: string;
  nome: string;
  email: string | null;
  telefono: string | null;
  indirizzo: string | null;
  attivo: boolean;
  fornitore_id: string;
  fornitore_nome: string;
  num_progetti: number;
};

// ─── New Cliente Modal ────────────────────────────────────────────────────────

function NewClienteModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [fornitori, setFornitori] = useState<Fornitore[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "", email: "", telefono: "", indirizzo: "",
    fornitore_id: "", attivo: true,
  });

  useEffect(() => {
    supabase.from("cg_fornitori").select("id, nome").eq("attivo", true).order("nome")
      .then(({ data }) => setFornitori(data ?? []));
  }, []);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nome.trim()) { setError("Il nome è obbligatorio."); return; }
    if (!form.fornitore_id) { setError("Seleziona un fornitore di riferimento."); return; }
    setSaving(true); setError(null);
    const { error: err } = await supabase.from("cg_clienti").insert({
      nome:         form.nome.trim(),
      email:        form.email || null,
      telefono:     form.telefono || null,
      indirizzo:    form.indirizzo || null,
      fornitore_id: form.fornitore_id,
      attivo:       form.attivo,
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    onCreated(); onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1.5px solid var(--border)", fontSize: 13,
    color: "var(--text-primary)", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "#374151", marginBottom: 6,
    textTransform: "uppercase", letterSpacing: "0.04em",
  };
  const sectionTitle = (t: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--border-soft)" }}>
      {t}
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", zIndex: 60, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(580px, 95vw)", maxHeight: "90vh", backgroundColor: "white", borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", zIndex: 70, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Nuovo Cliente</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "3px 0 0" }}>Inserisci i dati dell&apos;anagrafica</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)" }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          {/* Anagrafica */}
          {sectionTitle("1 · Anagrafica")}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Nome <span style={{ color: "#dc2626" }}>*</span></label>
            <input type="text" placeholder="Es. ACME Srl" value={form.nome} onChange={(e) => set("nome", e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" placeholder="info@cliente.it" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Telefono</label>
              <input type="tel" placeholder="+39 02 1234567" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Indirizzo</label>
            <input type="text" placeholder="Via Roma 1, 20100 Milano" value={form.indirizzo} onChange={(e) => set("indirizzo", e.target.value)} style={inputStyle} />
          </div>

          {/* Fornitore */}
          {sectionTitle("2 · Fornitore di riferimento")}
          <div style={{ border: "1.5px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 28 }}>
            <div style={{ backgroundColor: "#f8fafc", padding: "8px 12px", borderBottom: "1px solid var(--border-soft)", fontSize: 12, color: "var(--text-muted)" }}>
              Seleziona il fornitore che gestisce questo cliente
            </div>
            {fornitori.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Nessun fornitore disponibile</div>
            ) : (
              fornitori.map((f) => {
                const sel = form.fornitore_id === f.id;
                return (
                  <div key={f.id} onClick={() => set("fornitore_id", f.id)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer", backgroundColor: sel ? "#eff6ff" : "transparent", borderBottom: "1px solid var(--border-soft)" }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <span style={{ fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? "#1e40af" : "var(--text-primary)" }}>{f.nome}</span>
                    {sel && <Check size={14} color="#2563eb" strokeWidth={3} />}
                  </div>
                );
              })
            )}
          </div>

          {/* Stato */}
          {sectionTitle("3 · Stato")}
          <div onClick={() => set("attivo", !form.attivo)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, border: "1.5px solid var(--border)", cursor: "pointer", backgroundColor: form.attivo ? "#f0fdf4" : "#f8fafc" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Cliente attivo</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>I clienti attivi compaiono nelle liste di selezione</div>
            </div>
            {/* Toggle */}
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
            {saving ? "Salvataggio..." : "Crea cliente"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientiPage() {
  const [clienti, setClienti]     = useState<Cliente[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showNew, setShowNew]     = useState(false);
  const [filterAttivo, setFilterAttivo] = useState<"tutti" | "attivi" | "inattivi">("tutti");

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cg_clienti")
      .select(`
        id, nome, email, attivo, fornitore_id,
        cg_fornitori ( nome ),
        cg_progetti ( id )
      `)
      .order("nome");

    if (error) { console.error(error); setLoading(false); return; }

    setClienti((data ?? []).map((row) => {
      const forn = row.cg_fornitori as unknown as { nome: string } | null;
      const proj = row.cg_progetti as unknown as { id: string }[];
      return {
        id:             row.id,
        nome:           row.nome,
        email:          row.email,
        telefono:       null,
        indirizzo:      null,
        attivo:         row.attivo,
        fornitore_id:   row.fornitore_id,
        fornitore_nome: forn?.nome ?? "—",
        num_progetti:   proj?.length ?? 0,
      };
    }));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = clienti.filter((c) => {
    const matchSearch = !search ||
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      c.fornitore_nome.toLowerCase().includes(search.toLowerCase());
    const matchAttivo =
      filterAttivo === "tutti" ? true :
      filterAttivo === "attivi" ? c.attivo : !c.attivo;
    return matchSearch && matchAttivo;
  });

  const attivi   = clienti.filter((c) => c.attivo).length;
  const inattivi = clienti.filter((c) => !c.attivo).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Clienti</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            {loading ? "Caricamento..." : `${attivi} attivi · ${inattivi} inattivi · ${clienti.length} totali`}
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
          <Plus size={15} />Nuovo Cliente
        </button>
      </div>

      {/* Search + filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <div style={{ flex: 1, backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input type="text" placeholder="Cerca per nome, email o fornitore..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit", backgroundColor: "transparent" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}><X size={14} /></button>}
        </div>
        {/* Stato tabs */}
        <div style={{ display: "flex", backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {([["tutti", "Tutti"], ["attivi", "Attivi"], ["inattivi", "Inattivi"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilterAttivo(val)}
              style={{ padding: "8px 16px", border: "none", borderRight: val !== "inattivi" ? "1px solid var(--border)" : "none", fontSize: 13, fontWeight: filterAttivo === val ? 700 : 500, color: filterAttivo === val ? "#2563eb" : "var(--text-secondary)", backgroundColor: filterAttivo === val ? "#eff6ff" : "transparent", cursor: "pointer", fontFamily: "inherit" }}>
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
                {["Cliente", "Email", "Fornitore", "Progetti", "Stato", ""].map((h) => (
                  <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>Nessun cliente trovato</td></tr>
              ) : filtered.map((c, i) => (
                <tr key={c.id}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border-soft)" : "none", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{c.nome}</div>
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-secondary)" }}>
                    {c.email ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", backgroundColor: "#f1f5f9", padding: "3px 10px", borderRadius: 6, fontWeight: 500 }}>
                      {c.fornitore_nome}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    {c.num_progetti > 0 ? (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{c.num_progetti}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>progett{c.num_progetti !== 1 ? "i" : "o"}</span>
                      </div>
                    ) : <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: c.attivo ? "#d1fae5" : "#f1f5f9", color: c.attivo ? "#065f46" : "#64748b" }}>
                      {c.attivo ? "Attivo" : "Inattivo"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    <button style={{ fontSize: 13, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                      Modifica
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && <NewClienteModal onClose={() => setShowNew(false)} onCreated={loadData} />}
    </div>
  );
}
