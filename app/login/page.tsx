"use client";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#0f172a",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Left panel - branding */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "20%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              ⬡
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
              ChangeGate
            </span>
          </div>

          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#f1f5f9",
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            Gestisci le change request dei tuoi progetti
          </h1>
          <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
            Traccia, approva e pianifica le change request e le micro-evolutive con i tuoi clienti in un unico portale.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Workflow di approvazione strutturato",
              "Tracciamento clienti e fornitori",
              "Planning e scadenze integrate",
            ].map((feat) => (
              <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: "rgba(37,99,235,0.2)",
                    border: "1px solid rgba(37,99,235,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#60a5fa",
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <span style={{ fontSize: 14, color: "#94a3b8" }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div
        style={{
          width: 440,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 48px",
          backgroundColor: "#ffffff",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}
        >
          Benvenuto
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 36, marginTop: 0 }}>
          Accedi al tuo account ChangeGate
        </p>

        <form style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="nome@azienda.com"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1.5px solid #e5e7eb",
                fontSize: 14,
                color: "#111827",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Password
              </label>
              <button
                type="button"
                style={{
                  fontSize: 13,
                  color: "#2563eb",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: 0,
                }}
              >
                Password dimenticata?
              </button>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1.5px solid #e5e7eb",
                fontSize: 14,
                color: "#111827",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              marginTop: 4,
              boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
}
