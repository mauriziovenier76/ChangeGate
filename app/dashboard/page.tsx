import { TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const stats = [
  {
    label: "CR Aperte",
    value: "12",
    delta: "+3 questa settimana",
    deltaColor: "#059669",
    icon: <TrendingUp size={18} color="#2563eb" />,
    accent: "#eff6ff",
  },
  {
    label: "In Approvazione",
    value: "5",
    delta: "2 in ritardo",
    deltaColor: "#d97706",
    icon: <Clock size={18} color="#d97706" />,
    accent: "#fffbeb",
  },
  {
    label: "Completate (mese)",
    value: "18",
    delta: "Obiettivo: 25",
    deltaColor: "#64748b",
    icon: <CheckCircle2 size={18} color="#059669" />,
    accent: "#f0fdf4",
  },
  {
    label: "Scadute",
    value: "2",
    delta: "Da gestire",
    deltaColor: "#dc2626",
    icon: <AlertCircle size={18} color="#dc2626" />,
    accent: "#fef2f2",
  },
];

const recent = [
  { id: "CR-001", title: "Aggiornamento modulo fatturazione", client: "ACME Srl", date: "10/06/2024", status: "In Approvazione" },
  { id: "CR-002", title: "Fix bug reportistica mensile", client: "BetaCorp", date: "12/06/2024", status: "In Lavorazione" },
  { id: "CR-003", title: "Nuova dashboard KPI direzione", client: "GammaTech", date: "14/06/2024", status: "Completata" },
  { id: "CR-004", title: "Migrazione infrastruttura cloud", client: "ACME Srl", date: "15/06/2024", status: "In Attesa" },
];

const deadlines = [
  { id: "CR-005", title: "Rollout in produzione", when: "Oggi", whenColor: "#dc2626" },
  { id: "CR-006", title: "Test UAT cliente", when: "Domani", whenColor: "#d97706" },
  { id: "CR-007", title: "Review tecnica", when: "Ven 21/06", whenColor: "#64748b" },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  "In Attesa":       { bg: "#fef3c7", color: "#92400e" },
  "In Approvazione": { bg: "#ede9fe", color: "#5b21b6" },
  "In Lavorazione":  { bg: "#dbeafe", color: "#1e40af" },
  Completata:        { bg: "#d1fae5", color: "#065f46" },
};

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
          Panoramica attività e change request
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              backgroundColor: "var(--surface-card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "var(--text-primary)", marginTop: 6, letterSpacing: "-0.02em" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: s.deltaColor, marginTop: 4 }}>{s.delta}</div>
              </div>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: s.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        {/* Recent CRs */}
        <div
          style={{
            backgroundColor: "var(--surface-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              Change Request recenti
            </span>
            <a href="/requests" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
              Vedi tutte →
            </a>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-soft)" }}>
                {["ID", "Titolo", "Cliente", "Data", "Stato"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 20px",
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
              {recent.map((cr, i) => (
                <tr
                  key={cr.id}
                  style={{
                    borderBottom: i < recent.length - 1 ? "1px solid var(--border-soft)" : "none",
                  }}
                >
                  <td style={{ padding: "12px 20px" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", fontFamily: "DM Mono, monospace" }}>
                      {cr.id}
                    </span>
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text-primary)", maxWidth: 220 }}>
                    {cr.title}
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text-secondary)" }}>
                    {cr.client}
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text-muted)" }}>
                    {cr.date}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Deadlines */}
        <div
          style={{
            backgroundColor: "var(--surface-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              Prossime scadenze
            </span>
          </div>
          <div style={{ padding: "8px 0" }}>
            {deadlines.map((d, i) => (
              <div
                key={d.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 20px",
                  borderBottom: i < deadlines.length - 1 ? "1px solid var(--border-soft)" : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                    {d.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, fontFamily: "DM Mono, monospace" }}>
                    {d.id}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: d.whenColor,
                    backgroundColor: d.whenColor === "#dc2626" ? "#fef2f2" : d.whenColor === "#d97706" ? "#fffbeb" : "#f8fafc",
                    padding: "3px 8px",
                    borderRadius: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  {d.when}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
