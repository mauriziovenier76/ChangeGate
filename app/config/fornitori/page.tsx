"use client";

import { Plus } from "lucide-react";

const fornitori = [
  { id: 1, nome: "Tech Solutions Srl", pm: 3, specialisti: 8, email: "info@techsolutions.it", attivo: true },
  { id: 2, nome: "Innova Consulting", pm: 2, specialisti: 5, email: "contact@innovaconsulting.it", attivo: true },
  { id: 3, nome: "Digital Factory", pm: 1, specialisti: 3, email: "hello@digitalfactory.it", attivo: false },
];

export default function FornitoriPage() {
  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Fornitori
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Gestisci i fornitori e i loro team
          </p>
        </div>
        <a
          href="/config/fornitori/new"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 16px",
            borderRadius: 8,
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
          }}
        >
          <Plus size={15} />
          Nuovo Fornitore
        </a>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "var(--surface-card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-soft)", backgroundColor: "#f8fafc" }}>
              {["Nome", "Email", "PM", "Specialisti", "Stato", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "11px 18px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fornitori.map((f, i) => (
              <tr
                key={f.id}
                style={{
                  borderBottom: i < fornitori.length - 1 ? "1px solid var(--border-soft)" : "none",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    {f.nome}
                  </div>
                </td>
                <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-secondary)" }}>
                  {f.email}
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {f.pm}
                  </span>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: "#f0fdf4",
                      color: "#059669",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {f.specialisti}
                  </span>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: f.attivo ? "#d1fae5" : "#f1f5f9",
                      color: f.attivo ? "#065f46" : "#64748b",
                    }}
                  >
                    {f.attivo ? "Attivo" : "Inattivo"}
                  </span>
                </td>
                <td style={{ padding: "14px 18px", textAlign: "right" }}>
                  <button
                    style={{
                      fontSize: 12,
                      color: "#2563eb",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    Modifica
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
