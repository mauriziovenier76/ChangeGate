"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ConfirmPage() {
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [ready, setReady]         = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase gestisce il token dall'URL automaticamente
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (password.length < 8) { setError("La password deve essere di almeno 8 caratteri."); return; }
    if (password !== confirm) { setError("Le password non coincidono."); return; }
    setSaving(true); setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (err) { setError(err.message); return; }
    router.push("/dashboard");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111827",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" }}>
      <div style={{ width: "min(420px, 95vw)", backgroundColor: "white", borderRadius: 16, padding: "40px", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⬡</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>ChangeGate</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Imposta la tua password</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px" }}>
          Scegli una password sicura per accedere al portale.
        </p>

        {!ready ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b", fontSize: 14 }}>
            Verifica del link in corso...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Nuova password
              </label>
              <input type="password" placeholder="Minimo 8 caratteri" value={password}
                onChange={(e) => setPassword(e.target.value)} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Conferma password
              </label>
              <input type="password" placeholder="Ripeti la password" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={saving}
              style={{ width: "100%", padding: "11px", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 4, boxShadow: "0 2px 8px rgba(37,99,235,0.35)" }}>
              {saving ? "Salvataggio..." : "Accedi a ChangeGate"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
