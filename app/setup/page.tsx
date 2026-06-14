"use client";

import { useState } from "react";

export default function SetupPage() {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome]       = useState("");
  const [result, setResult]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true); setResult(null);
    const res = await fetch("/api/setup-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nome }),
    });
    const json = await res.json();
    setLoading(false);
    setResult(json.error ? `❌ ${json.error}` : `✅ Utente creato! Ora puoi fare il login e cancellare questa pagina.`);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" }}>
      <div style={{ width: 400, backgroundColor: "white", borderRadius: 16, padding: 36, boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: "#0f172a" }}>Setup Admin</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Nome", value: nome, set: setNome, type: "text", placeholder: "Mario Rossi" },
            { label: "Email", value: email, set: setEmail, type: "email", placeholder: "admin@esempio.it" },
            { label: "Password", value: password, set: setPassword, type: "password", placeholder: "Minimo 6 caratteri" },
          ].map((f) => (
            <div key={f.label}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.label}</label>
              <input type={f.type} value={f.value} placeholder={f.placeholder}
                onChange={(e) => f.set(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const }} />
            </div>
          ))}
          <button onClick={handleCreate} disabled={loading}
            style={{ padding: "10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {loading ? "Creazione..." : "Crea utente admin"}
          </button>
          {result && <div style={{ fontSize: 13, padding: "10px 14px", borderRadius: 8, backgroundColor: result.startsWith("✅") ? "#f0fdf4" : "#fef2f2", color: result.startsWith("✅") ? "#065f46" : "#dc2626" }}>{result}</div>}
        </div>
      </div>
    </div>
  );
}
