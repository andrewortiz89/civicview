// src/pages/Home.jsx — Dashboard compacto Nebula v3
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import PicoPlaca from "../components/dashboard/PicoPlaca";
import Weather from "../components/dashboard/Weather";
import AirQuality from "../components/dashboard/AirQuality";
import Events from "../components/dashboard/Events";
import MapPreview from "../components/dashboard/MapPreview";

import useWeather from "../hooks/useWeather";
import useAirQuality from "../hooks/useAirQuality";
import useEvents from "../hooks/useEvents";
import usePicoPlaca from "../hooks/usePicoPlaca";

// ── Tokens ────────────────────────────────────────────────────
const T = {
  purpleL: "#38b6ff",
  cyanL: "#38dcc8",
  greenL: "#50dc64",
  redL: "#ff6680",
  amberL: "#f0b830",
  pinkL: "#d880ff",
  orangeL: "#ff7840",
  text: "#e8f4ff",
  text2: "rgba(220,235,248,0.72)",
  text3: "#8aaabb",
  border: "rgba(56,182,255,0.1)",
  border2: "rgba(56,182,255,0.2)",
  card: "rgba(56,182,255,0.05)",
  mono: "'DM Mono','JetBrains Mono',monospace",
  display: "'Syne',sans-serif",
  num: {
    fontFamily: "'Barlow Condensed','Syne',sans-serif",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1,
  },
  body: "'Inter','Plus Jakarta Sans','DM Sans',sans-serif",
};

// ── Helpers de estructura de restrictedDigits ─────────────────
function parseDigits(raw) {
  if (!raw) return "—";
  if (Array.isArray(raw)) return raw.join(" · ");
  if (typeof raw === "object") return Object.values(raw).join(" · ");
  return String(raw).split("").join(" · ");
}

// ── Modal ─────────────────────────────────────────────────────
function Modal({ color, onClose, children }) {
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(5,10,24,0.88)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        animation: "fadeIn 0.2s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 700,
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          borderRadius: 20,
          background: "#111c2d",
          border: `1px solid ${color}38`,
          boxShadow: `0 28px 80px rgba(0,0,0,0.75), 0 0 0 1px ${color}18`,
          position: "relative",
          animation: "modalIn 0.28s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div
          style={{
            height: 2,
            borderRadius: "20px 20px 0 0",
            background: `linear-gradient(90deg,transparent,${color}95,transparent)`,
          }}
        />
        <button
          onClick={onClose}
          style={{
            position: "sticky",
            top: 12,
            float: "right",
            marginRight: 14,
            width: 32,
            height: 32,
            borderRadius: "50%",
            cursor: "pointer",
            background: "rgba(56,182,255,0.08)",
            border: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: T.text2,
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(56,182,255,0.16)";
            e.currentTarget.style.color = T.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(56,182,255,0.08)";
            e.currentTarget.style.color = T.text2;
          }}
        >
          <X size={14} />
        </button>
        <div style={{ padding: "0 16px 18px", clear: "both" }}>{children}</div>
      </div>
    </div>
  );
}

// ── Card compacta base ────────────────────────────────────────
function CompactCard({ accentColor, onClick, children, style = {} }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 14,
        padding: "16px 16px 20px",
        // Gradiente sutil para dar profundidad
        background: hover
          ? `linear-gradient(145deg, rgba(56,182,255,0.1) 0%, rgba(17,28,45,0.95) 100%)`
          : `linear-gradient(145deg, rgba(56,182,255,0.06) 0%, rgba(13,21,32,0.9) 100%)`,
        border: `1px solid ${hover ? accentColor + "55" : "rgba(56,182,255,0.12)"}`,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s ease",
        // Glow en borde al hover (punto 3 del análisis)
        boxShadow: hover
          ? `0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px ${accentColor}22, inset 0 1px 0 rgba(255,255,255,0.06)`
          : `inset 0 1px 0 rgba(255,255,255,0.04)`,
        ...style,
      }}
    >
      {/* Línea acento superior */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg,transparent,${accentColor}90,transparent)`,
          opacity: hover ? 1 : 0.55,
          transition: "opacity 0.2s",
        }}
      />
      {/* Orb decorativo */}
      <div
        style={{
          position: "absolute",
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: `radial-gradient(circle,${accentColor}12 0%,transparent 70%)`,
          top: -35,
          right: -35,
          pointerEvents: "none",
          opacity: hover ? 1 : 0.5,
          transition: "opacity 0.25s",
        }}
      />
      {children}
      {/* Hint ver más */}
      <div
        style={{
          position: "absolute",
          bottom: 9,
          right: 12,
          fontSize: "0.5rem",
          color: hover ? accentColor : "rgba(56,182,255,0.18)",
          fontFamily: T.mono,
          letterSpacing: "0.08em",
          transition: "color 0.2s",
          fontWeight: 700,
        }}
      >
        ↗ VER MÁS
      </div>
    </div>
  );
}

// ── Sub-componentes reutilizables ─────────────────────────────
function CardIcon({ emoji }) {
  return (
    <div style={{ fontSize: 24, lineHeight: 1, marginBottom: 8, opacity: 0.9 }}>
      {emoji}
    </div>
  );
}
function CardTitle({ children }) {
  // Título más pequeño/medio — el número es el protagonista
  return (
    <p
      style={{
        fontFamily: T.display,
        fontWeight: 500,
        fontSize: "0.8125rem",
        color: T.text2,
        marginBottom: 6,
        lineHeight: 1.2,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </p>
  );
}
function CardBigNumber({ children, color }) {
  // Número más grande y dominante
  return (
    <p
      style={{
        ...T.num,
        fontSize: "2.625rem",
        color: color || T.text,
        marginBottom: 4,
        lineHeight: 0.95,
      }}
    >
      {children}
    </p>
  );
}
function CardSub({ children }) {
  return (
    <p
      style={{
        fontSize: "0.6875rem",
        color: "#8aaabb",
        fontFamily: T.mono,
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </p>
  );
}
function CardTag({ children, color }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "0.625rem",
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 6,
        background: `${color}16`,
        border: `1px solid ${color}32`,
        color,
        fontFamily: T.mono,
        letterSpacing: "0.05em",
        marginTop: 9,
      }}
    >
      {children}
    </span>
  );
}

// ── FILA 1: 4 cards ───────────────────────────────────────────

function CardCalidadAire({ onOpen }) {
  const { data, loading } = useAirQuality();
  const color = loading ? T.amberL : data?.color || T.amberL;
  const tagMap = {
    Bueno: "✅ Bueno",
    Moderado: "⚠️ Moderado",
    "Dañino para grupos sensibles": "🟠 Precaución",
    Dañino: "🔴 Dañino",
  };
  return (
    <CompactCard accentColor={color} onClick={onOpen}>
      <CardIcon emoji="💨" />
      <CardTitle>Calidad del Aire</CardTitle>
      <CardBigNumber color={color}>{loading ? "…" : data?.aqi}</CardBigNumber>
      <CardSub>ICA · {loading ? "Cargando" : data?.category}</CardSub>
      <CardTag color={color}>
        {loading ? "…" : tagMap[data?.category] || data?.category}
      </CardTag>
    </CompactCard>
  );
}

function CardPicoPlaca({ onOpen }) {
  const { data, loading } = usePicoPlaca();
  const digits = loading ? "…" : parseDigits(data?.today?.restrictedDigits);
  const active = data?.isActiveNow;
  const restricted = data?.today?.isRestricted;
  const color = restricted ? T.redL : T.greenL;
  return (
    <CompactCard accentColor={color} onClick={onOpen}>
      <CardIcon emoji="🚗" />
      <CardTitle>Pico y Placa</CardTitle>
      <CardBigNumber color={color}>{digits}</CardBigNumber>
      <CardSub>Dígitos restringidos hoy</CardSub>
      <CardTag color={color}>
        {loading
          ? "…"
          : restricted
            ? active
              ? "🔴 Activo ahora"
              : "⏰ Hoy con restricción"
            : "🟢 Sin restricción"}
      </CardTag>
    </CompactCard>
  );
}

function CardClima({ onOpen }) {
  const { data, loading } = useWeather();
  const temp = loading ? "…" : `${Math.round(data?.current?.temperature)}°C`;
  const getIcon = (code = "") => {
    const n = new Date().getHours();
    const night = n < 6 || n > 20;
    if (code.includes("01")) return night ? "🌙" : "☀️";
    if (code.includes("02")) return night ? "☁️" : "⛅";
    if (code.includes("09") || code.includes("10")) return "🌧️";
    if (code.includes("11")) return "⛈️";
    if (code.includes("13")) return "🌨️";
    return "🌤️";
  };
  const icon = loading ? "🌡️" : getIcon(data?.current?.conditionCode || "");
  return (
    <CompactCard accentColor={T.cyanL} onClick={onOpen}>
      <CardIcon emoji={icon} />
      <CardTitle>Clima · Bogotá</CardTitle>
      <CardBigNumber color={T.cyanL}>{temp}</CardBigNumber>
      <CardSub>{loading ? "Cargando" : data?.current?.condition}</CardSub>
      <CardTag color={T.cyanL}>
        {loading ? "…" : `💧 ${Math.round(data?.current?.humidity)}% humedad`}
      </CardTag>
    </CompactCard>
  );
}

function CardCiclorutas({ onOpen }) {
  return (
    <CompactCard accentColor={T.cyanL} onClick={onOpen}>
      <CardIcon emoji="🚲" />
      <CardTitle>Ciclorutas</CardTitle>
      <CardBigNumber color={T.cyanL}>392</CardBigNumber>
      <CardSub>KM HABILITADOS</CardSub>
      <CardTag color={T.cyanL}>🚴 Red activa</CardTag>
    </CompactCard>
  );
}

// ── FILA 2: 3 cards medianas ──────────────────────────────────

function CardContaminantes({ onOpen }) {
  const { data, loading } = useAirQuality();
  const p = data?.pollutants;
  // Colores semánticos: amarillo=PM (partículas), verde=NO₂ (gases), cian=O₃
  const bars = [
    {
      label: "PM2.5",
      value: p?.pm25,
      max: 150,
      color: "#f0b830",
      unit: "µg/m³",
    },
    {
      label: "PM10",
      value: p?.pm10,
      max: 250,
      color: "#ff7840",
      unit: "µg/m³",
    },
    { label: "NO₂", value: p?.no2, max: 200, color: "#50dc64", unit: "µg/m³" },
    { label: "O₃", value: p?.o3, max: 180, color: "#38dcc8", unit: "µg/m³" },
  ];
  const accentColor = p?.pm25 > 35 ? "#f0b830" : "#50dc64";
  return (
    <CompactCard
      accentColor={accentColor}
      onClick={onOpen}
      style={{ paddingBottom: 22 }}
    >
      <CardTitle>Contaminantes · Bogotá</CardTitle>
      {/* Tabla alineada — punto 5 análisis UX */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 9,
          marginTop: 8,
        }}
      >
        {bars.map((b) => (
          <div
            key={b.label}
            style={{
              display: "grid",
              gridTemplateColumns: "38px 1fr 32px",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                color: "#8aaabb",
                fontFamily: T.mono,
                letterSpacing: "0.03em",
              }}
            >
              {b.label}
            </span>
            <div
              style={{
                height: 4,
                background: "rgba(56,182,255,0.08)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width:
                    loading || !b.value
                      ? "0%"
                      : `${Math.min((b.value / b.max) * 100, 100)}%`,
                  height: "100%",
                  background: b.color,
                  borderRadius: 2,
                  transition: "width 1.1s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: `0 0 6px ${b.color}55`,
                }}
              />
            </div>
            {/* Número alineado perfectamente a la derecha en columna fija */}
            <span
              style={{
                fontSize: "0.8125rem",
                color: T.text,
                fontFamily: T.mono,
                fontWeight: 600,
                textAlign: "right",
              }}
            >
              {loading || !b.value ? "—" : Math.round(b.value)}
            </span>
          </div>
        ))}
      </div>
    </CompactCard>
  );
}

function CardAgendaCultural({ onOpen }) {
  const { data, loading } = useEvents();
  const events = data?.today?.slice(0, 3) || [];
  const catColor = {
    Cultura: "#38b6ff",
    Arte: "#d880ff",
    Literatura: "#38dcc8",
    Música: "#38dcc8",
    Deporte: "#50dc64",
    Ciencia: "#f0b830",
    Historia: "#ff7840",
  };
  return (
    <CompactCard
      accentColor={T.purpleL}
      onClick={onOpen}
      style={{ paddingBottom: 22 }}
    >
      <CardTitle>Agenda Cultural</CardTitle>
      {loading ? (
        <p style={{ fontSize: "0.875rem", color: T.text3, marginTop: 8 }}>
          Cargando…
        </p>
      ) : events.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: T.text3, marginTop: 8 }}>
          Sin eventos hoy
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 9,
            marginTop: 10,
          }}
        >
          {events.map((ev) => (
            <div
              key={ev.id}
              style={{ display: "flex", gap: 9, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 3,
                  flexShrink: 0,
                  alignSelf: "stretch",
                  minHeight: 32,
                  background: catColor[ev.category] || T.purpleL,
                  borderRadius: 2,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: T.text,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ev.title}
                </p>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: T.text3,
                    marginTop: 2,
                    fontFamily: T.mono,
                  }}
                >
                  {ev.location || ev.source}
                  {ev.time ? ` · ${ev.time}` : ""}
                </p>
              </div>
            </div>
          ))}
          {(data?.today?.length || 0) > 3 && (
            <p
              style={{
                fontSize: "0.6875rem",
                color: T.text3,
                fontFamily: T.mono,
                textAlign: "right",
              }}
            >
              +{data.today.length - 3} más hoy
            </p>
          )}
        </div>
      )}
    </CompactCard>
  );
}

function CardMapa({ onOpen }) {
  const cats = [
    { label: "Ciclorutas", color: T.cyanL },
    { label: "Parques", color: T.greenL },
    { label: "Bibliotecas", color: T.purpleL },
    { label: "Cultura", color: T.pinkL },
  ];
  const dots = [
    { top: 28, left: 55, c: T.cyanL },
    { top: 42, left: 36, c: T.purpleL },
    { top: 18, left: 65, c: T.cyanL },
    { top: 58, left: 60, c: T.greenL },
    { top: 35, left: 28, c: T.pinkL },
    { top: 52, left: 48, c: T.greenL },
    { top: 22, left: 44, c: T.purpleL },
    { top: 65, left: 38, c: T.cyanL },
  ];
  return (
    <CompactCard
      accentColor={T.cyanL}
      onClick={onOpen}
      style={{ paddingBottom: 22 }}
    >
      <CardTitle>Mapa Interactivo</CardTitle>
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          height: 100,
          position: "relative",
          overflow: "hidden",
          marginTop: 10,
          marginBottom: 10,
          border: "1px solid rgba(56,182,255,0.07)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${d.top}%`,
              left: `${d.left}%`,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: d.c,
              boxShadow: `0 0 10px ${d.c}90`,
              transform: "translate(-50%,-50%)",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            bottom: 6,
            right: 9,
            fontSize: "0.5625rem",
            color: "rgba(255,255,255,0.2)",
            fontFamily: T.mono,
          }}
        >
          Bogotá D.C.
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 12px" }}>
        {cats.map((c) => (
          <div
            key={c.label}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: c.color,
                boxShadow: `0 0 5px ${c.color}`,
              }}
            />
            <span style={{ fontSize: "0.6875rem", color: T.text3 }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </CompactCard>
  );
}

// ── FILA 3: 2 cards ───────────────────────────────────────────

function CardEventosHoy({ onOpen }) {
  const { data, loading } = useEvents();
  const events = data?.today?.slice(0, 4) || [];
  return (
    <CompactCard
      accentColor={T.pinkL}
      onClick={onOpen}
      style={{ paddingBottom: 22 }}
    >
      <CardTitle>Eventos Hoy</CardTitle>
      {loading ? (
        <p style={{ fontSize: "0.875rem", color: T.text3, marginTop: 8 }}>
          Cargando…
        </p>
      ) : events.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: T.text3, marginTop: 8 }}>
          Sin eventos hoy
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 10,
          }}
        >
          {events.map((ev) => (
            <div
              key={ev.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(56,182,255,0.05)",
                border: "1px solid rgba(56,182,255,0.1)",
                transition: "all 0.18s",
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  color: T.text,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "78%",
                }}
              >
                {ev.title}
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: T.greenL,
                  fontFamily: T.mono,
                  flexShrink: 0,
                  marginLeft: 8,
                }}
              >
                {ev.time || "—"}
              </span>
            </div>
          ))}
          {(data?.today?.length || 0) > 4 && (
            <p
              style={{
                fontSize: "0.6875rem",
                color: T.text3,
                fontFamily: T.mono,
                textAlign: "right",
                marginTop: 2,
              }}
            >
              +{data.today.length - 4} eventos más
            </p>
          )}
        </div>
      )}
    </CompactCard>
  );
}

function CardSedesBibliotecas({ onOpen }) {
  const sedes = [
    { name: "El Tintal", status: "abierta" },
    { name: "Virgilio Barco", status: "abierta" },
    { name: "El Tunal", status: "abierta" },
    { name: "Pública Piloto", status: "abierta" },
    { name: "Luis Ángel Arango", status: "abierta" },
  ];
  const sc = { abierta: T.greenL, cerrada: T.redL, ocupada: T.amberL };
  return (
    <CompactCard
      accentColor={T.purpleL}
      onClick={onOpen}
      style={{ paddingBottom: 22 }}
    >
      <CardTitle>Sedes · Bibliotecas</CardTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 10,
        }}
      >
        {sedes.map((s) => {
          const c = sc[s.status] || T.greenL;
          return (
            <div
              key={s.name}
              style={{
                padding: "9px 12px",
                background: `${c}0A`,
                borderRadius: 10,
                border: `1px solid ${c}28`,
              }}
            >
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: T.text,
                  fontWeight: 600,
                  lineHeight: 1.25,
                  marginBottom: 3,
                }}
              >
                {s.name}
              </p>
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: c,
                  fontFamily: T.mono,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {s.status}
              </p>
            </div>
          );
        })}
      </div>
    </CompactCard>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const close = useCallback(() => setModal(null), []);

  const modalColor = {
    aire: T.amberL,
    pico: T.redL,
    clima: T.cyanL,
    eventos: T.purpleL,
    mapa: T.cyanL,
    biblio: T.purpleL,
    ciclo: T.cyanL,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1520",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Orbs atmosféricos — Neo-Táctil */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(56,182,255,0.14) 0%,transparent 65%)",
            top: -200,
            right: -150,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(56,220,200,0.09) 0%,transparent 65%)",
            bottom: -100,
            left: -90,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(200,100,255,0.05) 0%,transparent 65%)",
            top: "44%",
            left: "40%",
          }}
        />
      </div>

      {/* Header (sin cambios) */}
      <div style={{ position: "relative", zIndex: 50 }}>
        <Header
          onRefresh={() => window.location.reload()}
          lastUpdate={new Date()}
        />
      </div>

      <main
        className="nb-main"
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "1.5rem 1.5rem 3rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Fila 1 — 4 cards — gap 16px consistente */}
        <div
          className="nb-r4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <CardCalidadAire onOpen={() => setModal("aire")} />
          <CardPicoPlaca onOpen={() => setModal("pico")} />
          <CardClima onOpen={() => setModal("clima")} />
          <CardCiclorutas onOpen={() => setModal("ciclo")} />
        </div>

        {/* Fila 2 — 3 cards — gap 16px consistente */}
        <div
          className="nb-r3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <CardContaminantes onOpen={() => setModal("aire")} />
          <CardAgendaCultural onOpen={() => setModal("eventos")} />
          <CardMapa onOpen={() => setModal("mapa")} />
        </div>

        {/* Fila 3 — Eventos (ancho completo) + Sedes — gap 16px consistente
            Punto 5 análisis: Agenda Cultural y Eventos Hoy eran redundantes.
            Ahora CardEventosHoy ocupa 2/3 del ancho para diferenciarse como
            "lista accionable del día" vs la agenda cultural que es "vista previa editorial" */}
        <div
          className="nb-r2"
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}
        >
          <CardEventosHoy onOpen={() => setModal("eventos")} />
          <CardSedesBibliotecas onOpen={() => setModal("biblio")} />
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <Modal color={modalColor[modal]} onClose={close}>
          {modal === "aire" && <AirQuality />}
          {modal === "pico" && <PicoPlaca />}
          {modal === "clima" && <Weather />}
          {modal === "eventos" && <Events />}
          {modal === "mapa" && (
            <MapPreview
              onExpandClick={() => {
                close();
                navigate("/mapa");
              }}
            />
          )}
          {modal === "biblio" && (
            <MapPreview
              onExpandClick={() => {
                close();
                navigate("/mapa");
              }}
            />
          )}
          {modal === "ciclo" && (
            <MapPreview
              onExpandClick={() => {
                close();
                navigate("/mapa");
              }}
            />
          )}
        </Modal>
      )}

      {/* Footer */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Footer />
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes modalIn { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes livePing{ 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
        /* ── Tablet (≤1024px): 4→2 cols, 3→2 cols ── */
        @media(max-width:1024px){
          .nb-r4{grid-template-columns:repeat(2,1fr)!important}
          .nb-r3{grid-template-columns:repeat(2,1fr)!important}
          .nb-r2{grid-template-columns:1fr!important}
        }
        /* ── Móvil grande (≤768px) ── */
        @media(max-width:768px){
          .nb-r4{grid-template-columns:repeat(2,1fr)!important}
          .nb-r3{grid-template-columns:1fr!important}
          .nb-r2{grid-template-columns:1fr!important}
          .nb-main{padding:1rem 1rem 3rem!important}
        }
        /* ── Móvil pequeño (≤480px): todo 1 col ── */
        @media(max-width:480px){
          .nb-r4{grid-template-columns:repeat(2,1fr)!important}
          .nb-r3,.nb-r2{grid-template-columns:1fr!important}
          .nb-main{padding:0.75rem 0.75rem 3rem!important}
        }
        /* ── Muy pequeño (≤380px): todo 1 col ── */
        @media(max-width:380px){
          .nb-r4,.nb-r3,.nb-r2{grid-template-columns:1fr!important}
          .nb-main{padding:0.5rem 0.5rem 3rem!important}
        }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(167,139,250,0.2);border-radius:2px}
      `}</style>
    </div>
  );
}
