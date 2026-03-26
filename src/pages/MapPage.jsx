// src/pages/MapPage.jsx 
import { useNavigate } from "react-router-dom";
import InteractiveMap from "../components/map/InteractiveMap";

const T = {
  purpleL: "#a78bfa",
  cyanL: "#22d3ee",
  text2: "rgba(255,255,255,0.55)",
  text3: "rgba(255,255,255,0.28)",
  border: "rgba(255,255,255,0.08)",
  mono: "'DM Mono','JetBrains Mono',monospace",
  display: "'Syne',sans-serif",
};

function MapPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#050a18",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          flexShrink: 0,
          background: "rgba(5,10,24,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: `1px solid ${T.border}`,
          position: "relative",
        }}
      >
        {/* Línea acento superior */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${T.purpleL}60, ${T.cyanL}60, transparent)`,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              flexShrink: 0,
              background:
                "linear-gradient(135deg, rgba(34,211,238,0.25), rgba(124,58,237,0.2))",
              border: "1px solid rgba(34,211,238,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🗺️
          </div>
          <div>
            <p
              style={{
                fontFamily: T.display,
                fontWeight: 800,
                fontSize: "0.9375rem",
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              Mapa Interactivo
            </p>
            <p
              style={{
                fontSize: "0.6875rem",
                color: T.text3,
                fontFamily: T.mono,
                letterSpacing: "0.06em",
              }}
            >
              PUNTOS DE INTERÉS · BOGOTÁ D.C.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 10,
            cursor: "pointer",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${T.border}`,
            color: T.text2,
            fontSize: "0.8125rem",
            fontFamily: "'Plus Jakarta Sans','DM Sans',sans-serif",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = T.text2;
          }}
        >
          ← Volver al Dashboard
        </button>
      </div>

      {/* Mapa */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <InteractiveMap isWidget={false} />
      </div>
    </div>
  );
}

export default MapPage;
