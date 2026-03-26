import { RefreshCw, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

const T = {
  purpleL: "#a78bfa",
  cyanL: "#22d3ee",
  greenL: "#4ade80",
  text: "#ffffff",
  text2: "rgba(255,255,255,0.55)",
  text3: "rgba(255,255,255,0.28)",
  border: "rgba(255,255,255,0.08)",
  mono: "'DM Mono','JetBrains Mono',monospace",
  display: "'Syne',sans-serif",
  body: "'Plus Jakarta Sans','DM Sans',sans-serif",
};

const CivicIsotype = ({ size = 34 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: `drop-shadow(0 0 8px ${T.purpleL}40)`, flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={T.purpleL} />
        <stop offset="100%" stopColor={T.cyanL} />
      </linearGradient>
    </defs>
    <rect
      x="4"
      y="4"
      width="32"
      height="32"
      rx="10"
      stroke="url(#logoGrad)"
      strokeWidth="1.5"
      strokeOpacity="0.3"
    />
    <path
      d="M10 28 L18 14 L24 22 L30 10 L30 28 H10Z"
      fill="url(#logoGrad)"
      fillOpacity="0.9"
    />
    <rect x="12" y="30" width="4" height="2" rx="1" fill={T.cyanL} />
    <rect
      x="18"
      y="30"
      width="10"
      height="2"
      rx="1"
      fill={T.cyanL}
      opacity="0.5"
    />
  </svg>
);

function Header({ onRefresh, lastUpdate }) {
  const [time, setTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const timeStr = time.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateStr = time.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(5,10,24,0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <style>{`
        .header-container { max-width: 80rem; margin: 0 auto; padding: 0 1.5rem; }
        @media (max-width: 640px) {
          .header-container { padding: 0 0.75rem; }
          .system-text { font-size: 0.55rem !important; }
          .sync-label { display: none; }
          .logo-view { font-size: 1.1rem !important; }
        }
      `}</style>

      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg,transparent,${T.purpleL}60,${T.cyanL}60,transparent)`,
        }}
      />

      {/* Franja superior */}
      <div
        className="header-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 32,
          borderBottom: `1px solid ${T.border}`,
          gap: 10,
        }}
      >
        <span
          className="system-text"
          style={{
            fontFamily: T.mono,
            fontSize: "0.625rem",
            color: T.text3,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
            minWidth: 0,
          }}
        >
          Sistema de información ciudadana·Bogotá D.C.
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(74,222,128,0.06)",
              border: "1px solid rgba(74,222,128,0.15)",
            }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: T.greenL,
                boxShadow: `0 0 8px ${T.greenL}`,
              }}
            />
            <span
              style={{
                fontSize: "0.55rem",
                color: T.greenL,
                fontFamily: T.mono,
                fontWeight: 700,
              }}
            >
              LIVE
            </span>
          </div>
          <button
            onClick={handleRefresh}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 8px",
              borderRadius: 999,
              cursor: "pointer",
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: T.text3,
              fontSize: "0.6rem",
              fontFamily: T.mono,
            }}
          >
            <RefreshCw
              size={10}
              style={{
                transition: "transform 0.7s",
                transform: isRefreshing ? "rotate(360deg)" : "rotate(0deg)",
                color: isRefreshing ? T.cyanL : "inherit",
              }}
            />
            <span className="sync-label">Sincronizar</span>
          </button>
        </div>
      </div>

      {/* Franja de Logo y Reloj */}
      <div
        className="header-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
            flex: 1,
          }}
        >
          <CivicIsotype size={30} />
          <div style={{ minWidth: 0 }}>
            <div
              className="logo-view"
              style={{
                fontFamily: T.display,
                fontWeight: 800,
                fontSize: "1.25rem",
                color: T.text,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              Civic
              <span
                style={{
                  background: `linear-gradient(90deg, ${T.cyanL}, ${T.greenL})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                View
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                color: T.text3,
                fontSize: "0.55rem",
                marginTop: 2,
              }}
            >
              <MapPin size={10} color={T.cyanL} />
              <span style={{ fontFamily: T.mono, letterSpacing: "0.05em" }}>
                BOGOTÁ D.C.
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: T.mono,
              fontWeight: 500,
              fontSize: "1.125rem",
              color: T.text,
              lineHeight: 1,
            }}
          >
            {timeStr}
          </div>
          <div
            style={{
              fontSize: "0.6rem",
              color: T.text3,
              textTransform: "uppercase",
              marginTop: 2,
              fontFamily: T.mono,
            }}
          >
            {dateStr}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
