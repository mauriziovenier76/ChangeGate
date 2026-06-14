"use client";

import { useState } from "react";

export default function SetupPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome]         = useState("");
  const [result, setResult]     = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [mode, setMode]         = useState<"create" | "reset">("create");

  const handleSubmit = async () => {
    setLoading(true); setResult(null);
    const body = mode === "reset"
      ? { email, password, action: "reset" }
      : { email, password, nome };
    const res = await fetch("/api/setup-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setLoading(false);
    setResult(json.error ? `❌ ${json.error}` : `✅ ${json.message ?? "Operazione completata! Ora puoi fare il login."}`);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1.5px solid #e5e7eb", fontSize: 14,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" }}>
      <div style={{ width: 400, backgroundColor: "white", borderRadius: 16, padding: 36, boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>Setup Admin</h1>

        {/* Mode tabs */}
        <div style={{ display: "flex", marginBottom: 24, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          {(["create", "reset"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setResult(null); }}
              style={{ flex: 1, padding: "8px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: mode === m ? 700 : 400, backgroundColor: mode === m ? "#eff6ff" : "white", color: mode === m ? "#2563eb" : "#64748b" }}>
              {m === "create" ? "Crea utente" : "Reset password"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "create" && (
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Nome</label>
              <input type="text" value={nome} placeholder="Mario Rossi" onChange={(e) => setNome(e.target.value)} style={inputStyle} />
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Email</label>
            <input type="email" value={email} placeholder="admin@esempio.it" onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Nuova password</label>
            <input type="password" value={password} placeholder="Minimo 6 caratteri" onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: "10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {loading ? "In corso..." : mode === "create" ? "Crea utente admin" : "Aggiorna password"}
          </button>
          {result && (
            <div style={{ fontSize: 13, padding: "10px 14px", borderRadius: 8, backgroundColor: result.startsWith("✅") ? "#f0fdf4" : "#fef2f2", color: result.startsWith("✅") ? "#065f46" : "#dc2626" }}>
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
