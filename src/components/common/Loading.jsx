// src/components/common/Loading.jsx
// Misma API pública: Loading, Loading.Spinner, Loading.Skeleton,
// Loading.Card, Loading.Overlay — drop-in replacement.

const NB = {
  purpleL: "#a78bfa",
  cyanL:   "#22d3ee",
  greenL:  "#4ade80",
  text2:   "rgba(255,255,255,0.55)",
  text3:   "rgba(255,255,255,0.28)",
};

// ── Spinner ───────────────────────────────────────────────────────────────
function Spinner({ size = 28, color = NB.purpleL, style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2.5px solid rgba(255,255,255,0.07)`,
      borderTopColor: color,
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
      ...style,
    }} />
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton({ width = "100%", height = 14, borderRadius = 8, className = "", style = {} }) {
  return (
    <div
      className={`nb-skeleton ${className}`}
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

// ── Card skeleton ─────────────────────────────────────────────────────────
function CardSkeleton({ lines = 4, height = "auto" }) {
  return (
    <div className="nb-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, height }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Skeleton width={28} height={28} borderRadius={9} />
          <Skeleton width={80} height={12} />
        </div>
        <Skeleton width={55} height={10} />
      </div>
      {/* Body */}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === 0 ? "100%" : `${88 - i * 11}%`} height={i === 0 ? 52 : 11} borderRadius={i === 0 ? 10 : 6} />
      ))}
      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Skeleton width={6} height={6} borderRadius={999} />
        <Skeleton width={110} height={9} />
      </div>
    </div>
  );
}

// ── Overlay ───────────────────────────────────────────────────────────────
function Overlay({ message = "Cargando…" }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(5,10,24,0.8)",
      backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 14, zIndex: 10, borderRadius: "inherit",
    }}>
      <Spinner size={30} color={NB.purpleL} />
      {message && (
        <p style={{ fontSize: "0.8125rem", color: NB.text2, fontWeight: 500, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
          {message}
        </p>
      )}
    </div>
  );
}

// ── Pantalla completa ─────────────────────────────────────────────────────
function Loading({ message = "Cargando CivicView…" }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 24,
      background: "#050a18", position: "relative", overflow: "hidden",
    }}>
      {/* Orbs de fondo */}
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)", top: "20%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)", bottom: "20%", left: "30%", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 20px",
          background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(6,182,212,0.3))",
          border: "1px solid rgba(124,58,237,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, boxShadow: "0 0 30px rgba(124,58,237,0.3)",
          animation: "float 3s ease-in-out infinite",
        }}>
          🏙️
        </div>

        <Spinner size={34} color={NB.purpleL} style={{ margin: "0 auto 20px" }} />

        <p style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#fff",
          marginBottom: 6,
          background: `linear-gradient(135deg, ${NB.purpleL}, ${NB.cyanL})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          CivicView
        </p>
        <p style={{ fontSize: "0.8125rem", color: NB.text3, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
          {message}
        </p>
      </div>
    </div>
  );
}

Loading.Spinner  = Spinner;
Loading.Skeleton = Skeleton;
Loading.Card     = CardSkeleton;
Loading.Overlay  = Overlay;

export { Spinner, Skeleton, CardSkeleton, Overlay };
export default Loading;