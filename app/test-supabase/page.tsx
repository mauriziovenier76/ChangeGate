"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function TestSupabasePage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");
  const [fornitori, setFornitori] = useState<{ id: string; nome: string }[]>([]);
  const [clienti, setClienti] = useState<{ id: string; nome: string }[]>([]);
  const [envCheck, setEnvCheck] = useState({ url: false, key: false });

  useEffect(() => {
    async function test() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      setEnvCheck({ url: !!url, key: !!key });

      if (!url || !key) {
        setStatus("error");
        setMessage("Variabili d'ambiente mancanti. Controlla NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        return;
      }

      try {
        const supabase = createClient(url, key);

        const { data: fData, error: fError } = await supabase
          .from("cg_fornitori")
          .select("id, nome");

        if (fError) throw new Error(`cg_fornitori: ${fError.message}`);

        const { data: cData, error: cError } = await supabase
          .from("cg_clienti")
          .select("id, nome");

        if (cError) throw new Error(`cg_clienti: ${cError.message}`);

        setFornitori(fData ?? []);
        setClienti(cData ?? []);
        setStatus("ok");
        setMessage("Connessione riuscita!");
      } catch (err: unknown) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Errore sconosciuto");
      }
    }

    test();
  }, []);

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>
        Test connessione Supabase
      </h1>

      {/* Env vars check */}
      <div style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Variabili d&apos;ambiente
        </div>
        {[
          { label: "NEXT_PUBLIC_SUPABASE_URL", ok: envCheck.url },
          { label: "NEXT_PUBLIC_SUPABASE_ANON_KEY", ok: envCheck.key },
        ].map((v) => (
          <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontFamily: "DM Mono, monospace", color: "var(--text-secondary)", flex: 1 }}>{v.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20, backgroundColor: v.ok ? "#d1fae5" : "#fee2e2", color: v.ok ? "#065f46" : "#991b1b" }}>
              {v.ok ? "✓ Trovata" : "✗ Mancante"}
            </span>
          </div>
        ))}
      </div>

      {/* Connection status */}
      <div style={{
        backgroundColor: status === "loading" ? "#f8fafc" : status === "ok" ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${status === "loading" ? "var(--border)" : status === "ok" ? "#bbf7d0" : "#fecaca"}`,
        borderRadius: 12, padding: "16px 20px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>
          {status === "loading" ? "⏳" : status === "ok" ? "✅" : "❌"}
        </span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: status === "ok" ? "#065f46" : status === "error" ? "#991b1b" : "var(--text-primary)" }}>
            {status === "loading" ? "Connessione in corso..." : message}
          </div>
        </div>
      </div>

      {/* Results */}
      {status === "ok" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "cg_fornitori", data: fornitori },
            { label: "cg_clienti", data: clienti },
          ].map((table) => (
            <div key={table.label} style={{ backgroundColor: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-soft)", backgroundColor: "#f8fafc" }}>
                <span style={{ fontSize: 12, fontFamily: "DM Mono, monospace", fontWeight: 600, color: "#2563eb" }}>{table.label}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>{table.data.length} righe</span>
              </div>
              {table.data.map((row) => (
                <div key={row.id} style={{ padding: "8px 14px", borderBottom: "1px solid var(--border-soft)", fontSize: 13, color: "var(--text-primary)" }}>
                  {row.nome}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Remove this page note */}
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 24, padding: "10px 14px", backgroundColor: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a" }}>
        ⚠️ Ricorda di eliminare questa pagina prima di andare in produzione.
      </p>
    </div>
  );
}
