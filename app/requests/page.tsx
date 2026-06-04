"use client";

import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";

const mockData = [
  { id: "CR-001", title: "Aggiornamento modulo fatturazione", client: "ACME Srl", project: "Gestionale 2.0", status: "In Attesa", priority: "Alta", createdAt: "10/01/2024" },
  { id: "CR-002", title: "Fix bug reportistica mensile", client: "BetaCorp", project: "Report Suite", status: "In Lavorazione", priority: "Media", createdAt: "12/01/2024" },
  { id: "CR-003", title: "Nuova dashboard KPI direzione", client: "GammaTech", project: "Dashboard Pro", status: "Completata", priority: "Bassa", createdAt: "15/01/2024" },
  { id: "CR-004", title: "Migrazione infrastruttura cloud", client: "ACME Srl", project: "Infra v3", status: "In Approvazione", priority: "Alta", createdAt: "18/01/2024" },
  { id: "CR-005", title: "Rollout modulo pagamenti", client: "DeltaSoft", project: "Payments", status: "In Attesa", priority: "Media", createdAt: "20/01/2024" },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  "In Attesa":       { bg: "#fef3c7", color: "#92400e" },
  "In Approvazione": { bg: "#ede9fe", color: "#5b21b6" },
  "In Lavorazione":  { bg: "#dbeafe", color: "#1e40af" },
  Completata:        { bg: "#d1fae5", color: "#065f46" },
};

const priorityStyle: Record<string, { color: string }> = {
  Alta:  { color: "#dc2626" },
  Media: { color: "#d97706" },
  Bassa: { color: "#64748b" },
};

export default function RequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = mockData.filter((cr) => {
    const matchSearch =
      cr.id.toLowerCase().includes(search.toLowerCase()) ||
      cr.title.toLowerCase().includes(search.toLowerCase()) ||
      cr.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || cr.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Change Request
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            {filtered.length} di {mockData.length} richieste
          </p>
        </div>
        <a
          href="/requests/new"
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
          Nuova CR
        </a>
      </div>

      {/* Filters */}
      <div
        style={{
          backgroundColor: "var(--surface-card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <Filter size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Cerca per ID, titolo o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: 32,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 8,
              border: "1.5px solid var(--border)",
              fontSize: 13,
              color: "var(--text-primary)",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1.5px solid var(--border)",
            fontSize: 13,
            color: "var(--text-primary)",
            fontFamily: "inherit",
            outline: "none",
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          <option value="">Tutti gli stati</option>
          <option value="In Attesa">In Attesa</option>
          <option value="In Approvazione">In Approvazione</option>
          <option value="In Lavorazione">In Lavorazione</option>
          <option value="Completata">Completata</option>
        </select>
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
              {["ID", "Titolo", "Cliente", "Progetto", "Priorità", "Stato", "Data"].map((h) => (
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
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    fontSize: 14,
                    color: "var(--text-muted)",
                  }}
                >
                  Nessuna change request trovata
                </td>
              </tr>
            ) : (
              filtered.map((cr, i) => (
                <tr
                  key={cr.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-soft)" : "none",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", fontFamily: "DM Mono, monospace" }}>
                      {cr.id}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                    {cr.title}
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: "var(--text-secondary)" }}>
                    {cr.client}
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: "var(--text-muted)" }}>
                    {cr.project}
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: priorityStyle[cr.priority]?.color,
                      }}
                    >
                      {cr.priority}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: statusStyle[cr.status]?.bg,
                        color: statusStyle[cr.status]?.color,
                      }}
                    >
                      {cr.status}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: "var(--text-muted)" }}>
                    {cr.createdAt}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
