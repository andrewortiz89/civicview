import { useState, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
} from "lucide-react";
import useEvents from "../../hooks/useEvents";
import EventsService from "../../services/eventsService";

// ── Tokens ────────────────────────────────────────────────────
const T = {
  border: "rgba(56,182,255,0.1)",
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
  mono: "'DM Mono','JetBrains Mono',monospace",
  display: "'Syne',sans-serif",
  num: {
    fontFamily: "'Barlow Condensed','Syne',sans-serif",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1,
  },
};

const CAT = {
  Cultura: {
    c: "#38b6ff",
    bg: "rgba(124,58,237,0.14)",
    b: "rgba(124,58,237,0.32)",
  },
  Arte: {
    c: "#d880ff",
    bg: "rgba(236,72,153,0.14)",
    b: "rgba(236,72,153,0.3)",
  },
  Literatura: {
    c: "#38dcc8",
    bg: "rgba(6,182,212,0.14)",
    b: "rgba(6,182,212,0.3)",
  },
  Música: {
    c: "#38dcc8",
    bg: "rgba(6,182,212,0.14)",
    b: "rgba(6,182,212,0.3)",
  },
  Deporte: {
    c: "#50dc64",
    bg: "rgba(16,185,129,0.14)",
    b: "rgba(16,185,129,0.3)",
  },
  Ciencia: {
    c: "#f0b830",
    bg: "rgba(245,158,11,0.14)",
    b: "rgba(245,158,11,0.3)",
  },
  Historia: {
    c: "#ff7840",
    bg: "rgba(251,146,60,0.14)",
    b: "rgba(251,146,60,0.3)",
  },
  Teatro: {
    c: "#38b6ff",
    bg: "rgba(124,58,237,0.14)",
    b: "rgba(124,58,237,0.32)",
  },
  Cine: {
    c: "#f0b830",
    bg: "rgba(245,158,11,0.14)",
    b: "rgba(245,158,11,0.3)",
  },
  default: {
    c: "#38b6ff",
    bg: "rgba(124,58,237,0.1)",
    b: "rgba(124,58,237,0.25)",
  },
};
const getCat = (cat) => CAT[cat] || CAT.default;

const DAYS_SHORT = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// ── Helpers ───────────────────────────────────────────────────
function NbLabel({ children, style = {} }) {
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: T.text3,
        display: "block",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
function LiveDot({ color }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        flexShrink: 0,
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animation: "livePing 2s ease-in-out infinite",
      }}
    />
  );
}
function Sk({ w = "100%", h = 12, r = 6 }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "rgba(56,182,255,0.08)",
        animation: "livePing 1.6s ease-in-out infinite",
      }}
    />
  );
}

// ── Calendario ────────────────────────────────────────────────
function MonthCalendar({
  year,
  month,
  selectedDate,
  onSelectDate,
  eventDates,
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 2,
          marginBottom: 4,
        }}
      >
        {DAYS_SHORT.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontSize: "0.5625rem",
              fontFamily: T.mono,
              color: T.text3,
              padding: "4px 0",
              letterSpacing: "0.06em",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 2,
        }}
      >
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isToday = ds === today,
            isSel = ds === selectedDate;
          const hasEv = eventDates.has(ds);
          return (
            <button
              key={i}
              onClick={() => onSelectDate(ds)}
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: 8,
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                background: isSel
                  ? T.purpleL
                  : isToday
                    ? "rgba(124,58,237,0.3)"
                    : hasEv
                      ? "rgba(56,182,255,0.07)"
                      : "transparent",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isSel && !isToday)
                  e.currentTarget.style.background = "rgba(56,182,255,0.12)";
              }}
              onMouseLeave={(e) => {
                if (!isSel && !isToday)
                  e.currentTarget.style.background = hasEv
                    ? "rgba(56,182,255,0.07)"
                    : "transparent";
              }}
            >
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontFamily: T.mono,
                  fontWeight: isSel || isToday ? 700 : 400,
                  color: isSel ? "#fff" : isToday ? T.purpleL : T.text2,
                }}
              >
                {d}
              </span>
              {hasEv && !isSel && (
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: T.purpleL,
                    position: "absolute",
                    bottom: 3,
                    boxShadow: `0 0 4px ${T.purpleL}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Event card (MODIFICADA: Diseño Horizontal, Glow y Padding)
function EventListCard({ event, isSelected, onClick }) {
  const cat = getCat(event.category);
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        // Fondo y borde según selección, transición más lenta para el resplandor
        background: isSelected
          ? "rgba(124,58,237,0.12)"
          : "rgba(56,182,255,0.05)",
        border: `1px solid ${isSelected ? "rgba(124,58,237,0.4)" : "rgba(56,182,255,0.1)"}`,
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        boxShadow: isSelected ? `0 0 15px rgba(56,182,255,0.12)` : "none",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          // Efecto Glow Neón Cyan al pasar el mouse
          e.currentTarget.style.background = "rgba(56,182,255,0.09)";
          e.currentTarget.style.borderColor = "rgba(56,182,255,0.25)";
          e.currentTarget.style.boxShadow = `0 0 20px rgba(56,182,255,0.15)`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          // Restaurar estado base
          e.currentTarget.style.background = "rgba(56,182,255,0.05)";
          e.currentTarget.style.borderColor = "rgba(56,182,255,0.1)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg,transparent,${T.purpleL},transparent)`,
          }}
        />
      )}
      <div style={{ display: "flex" }}>
        {/* Línea lateral más gruesa para jerarquía visual */}
        <div style={{ width: 4, background: cat.c, flexShrink: 0 }} />
        {/* MODIFICADO: Aumentado el padding lateral e interno */}
        <div style={{ flex: 1, padding: "14px 18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: cat.bg,
                  border: `1px solid ${cat.b}`,
                  color: cat.c,
                  fontFamily: T.mono,
                }}
              >
                {event.category}
              </span>
              {event.isFree && (
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(74,222,128,0.12)",
                    border: "1px solid rgba(74,222,128,0.28)",
                    color: T.greenL,
                    fontFamily: T.mono,
                  }}
                >
                  GRATIS
                </span>
              )}
            </div>
            {event.source && (
              <span
                style={{
                  fontSize: "0.5625rem",
                  color: T.text3,
                  fontFamily: T.mono,
                }}
              >
                {event.source}
              </span>
            )}
          </div>
          {/* MODIFICADO: Título ligeramente más grande para jerarquía */}
          <p
            style={{
              fontFamily: T.display,
              fontWeight: 700,
              fontSize: "1rem",
              color: T.text,
              lineHeight: 1.2,
              marginBottom: 10,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {event.title}
          </p>
          {/* MODIFICADO: Aumentado gap entre iconos info */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
            {event.location && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={11} style={{ color: T.purpleL, flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", color: T.text2 }}>
                  {event.location}
                </span>
              </div>
            )}
            {event.time && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={11} style={{ color: T.cyanL, flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: T.text2,
                    fontFamily: T.mono,
                  }}
                >
                  {event.time}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Panel detalle ─────────────────────────────────────────────
function EventDetail({ event }) {
  const cat = getCat(event?.category);

  if (!event)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 16,
          padding: 32,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 54, opacity: 0.15, filter: "grayscale(1)" }}>
          🎭
        </div>
        <p
          style={{
            fontFamily: T.display,
            fontWeight: 600,
            fontSize: "0.9375rem",
            color: T.text3,
          }}
        >
          Selecciona un evento
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "rgba(138,170,187,0.5)",
            lineHeight: 1.4,
          }}
        >
          Explora la programación cultural
          <br />
          haciendo clic en la lista
        </p>
      </div>
    );

  return (
    <div
      style={{
        padding: "20px",
        overflowY: "auto",
        height: "100%",
        background: "rgba(56,182,255,0.02)", // Un fondo sutilmente distinto para separar secciones
      }}
    >
      {/* Categoría y Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: "0.625rem",
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 999,
            background: cat.bg,
            border: `1px solid ${cat.b}`,
            color: cat.c,
            fontFamily: T.mono,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Tag size={10} /> {event.category.toUpperCase()}
        </span>
      </div>

      {/* Título - Ajustado para mejor legibilidad en columna estrecha */}
      <p
        style={{
          fontFamily: T.display,
          fontWeight: 800,
          fontSize: "1.2rem",
          color: T.text,
          lineHeight: 1.2,
          marginBottom: 16,
          letterSpacing: "-0.01em",
        }}
      >
        {event.title}
      </p>

      <div
        style={{
          height: 1,
          background: "rgba(56,182,255,0.1)",
          marginBottom: 20,
        }}
      />

      {/* Bloques de Información */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Lugar",
            val: event.location,
            icon: <MapPin size={15} />,
            col: T.purpleL,
          },
          {
            label: "Fecha y hora",
            val: `${EventsService.formatEventDate(event.date)} ${event.time || ""}`,
            icon: <Clock size={15} />,
            col: T.cyanL,
          },
          {
            label: "Entrada",
            val: event.isFree ? "Entrada gratuita" : "Ver en sitio web",
            icon: <span>🎟️</span>,
            col: event.isFree ? T.greenL : T.amberL,
          },
          {
            label: "Organizador",
            val: event.source,
            icon: <span>📍</span>,
            col: T.text,
          },
        ].map(
          (item, idx) =>
            item.val && (
              <div
                key={idx}
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(56,182,255,0.05)",
                    border: "1px solid rgba(56,182,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyCenter: "center",
                    flexShrink: 0,
                    color: item.col,
                    paddingTop: typeof item.icon === "object" ? 0 : 2,
                  }}
                >
                  <div style={{ margin: "auto" }}>{item.icon}</div>
                </div>
                <div>
                  <NbLabel style={{ marginBottom: 2 }}>{item.label}</NbLabel>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: T.text,
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    {item.val}
                  </p>
                </div>
              </div>
            ),
        )}
      </div>

      {/* Descripción */}
      {event.description && (
        <div
          style={{
            marginBottom: 24,
            padding: "12px",
            borderRadius: 8,
            background: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(56,182,255,0.05)",
          }}
        >
          <NbLabel style={{ marginBottom: 8 }}>Descripción</NbLabel>
          <p style={{ fontSize: "0.8125rem", color: T.text2, lineHeight: 1.6 }}>
            {event.description}
          </p>
        </div>
      )}

      {/* Botón CTA - Más llamativo */}
      {event.url && (
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(56,182,255,0.2) 100%)",
            border: "1px solid rgba(124,58,237,0.4)",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.2s",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.border = "1px solid rgba(124,58,237,0.8)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.border = "1px solid rgba(124,58,237,0.4)")
          }
        >
          <ExternalLink size={16} /> Ver evento completo
        </a>
      )}
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div
      style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}
    >
      <Sk w="40%" h={14} />
      {/* Skeleton sincronizado con las nuevas proporciones del Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "210px 1.8fr 1.2fr",
          gap: 14,
        }}
      >
        <Sk h={260} r={12} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <Sk key={i} h={100} r={12} />
          ))}
        </div>
        <Sk h={260} r={12} />
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
const Events = () => {
  const { data, loading, error, refresh } = useEvents();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    if (!data?.all) return ["Todos"];
    const cats = [...new Set(data.all.map((e) => e.category).filter(Boolean))];
    return ["Todos", ...cats];
  }, [data]);

  const eventDates = useMemo(() => {
    if (!data?.all) return new Set();
    return new Set(data.all.map((e) => e.date));
  }, [data]);

  const dayEvents = useMemo(() => {
    if (!data?.all) return [];
    return data.all.filter((e) => {
      const matchDate = e.date === selectedDate;
      const matchCat = activeFilter === "Todos" || e.category === activeFilter;
      const matchSearch =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.location || "").toLowerCase().includes(search.toLowerCase());
      return matchDate && matchCat && matchSearch;
    });
  }, [data, selectedDate, activeFilter, search]);

  const todayCount = data?.today?.length || 0;
  const weekCount = data?.thisWeek?.length || 0;
  const freeCount = data?.all?.filter((e) => e.isFree).length || 0;
  const totalCount = data?.total || 0;

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  };

  const selectedDateLabel = (() => {
    if (!selectedDate) return "";
    const d = new Date(selectedDate + "T00:00:00");
    const dow = d.toLocaleDateString("es-CO", { weekday: "long" });
    return `${dow.charAt(0).toUpperCase() + dow.slice(1)} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
  })();

  if (loading) return <EventsSkeleton />;
  if (error)
    return (
      <div
        style={{
          padding: 24,
          minHeight: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 32 }}>🎭</span>
        <p
          style={{
            fontFamily: T.display,
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: T.text,
          }}
        >
          Sin eventos
        </p>
        <p style={{ fontSize: "0.8125rem", color: T.text2 }}>{error}</p>
        <button
          onClick={refresh}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 10,
            cursor: "pointer",
            background: "rgba(56,182,255,0.06)",
            border: "1px solid rgba(56,182,255,0.12)",
            color: T.text2,
            fontSize: "0.8125rem",
          }}
        >
          <RefreshCw size={13} /> Reintentar
        </button>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        style={{
          padding: "14px 18px 10px",
          borderBottom: "1px solid rgba(56,182,255,0.08)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={15} style={{ color: T.purpleL }} />
            </div>
            <div>
              <p
                style={{
                  fontFamily: T.display,
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: T.text,
                  lineHeight: 1.2,
                }}
              >
                Agenda Cultural
              </p>
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: T.text3,
                  fontFamily: T.mono,
                  marginTop: 1,
                }}
              >
                BOGOTÁ · {MONTHS[calMonth].toUpperCase()} {calYear}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={12}
                style={{
                  position: "absolute",
                  left: 9,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: T.text3,
                }}
              />
              <input
                type="text"
                placeholder="Buscar evento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "rgba(56,182,255,0.06)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 999,
                  color: T.text,
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "0.75rem",
                  padding: "6px 12px 6px 28px",
                  outline: "none",
                  width: 155,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 999,
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              <LiveDot color={T.purpleL} />
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: T.purpleL,
                  fontFamily: T.mono,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                {todayCount} HOY
              </span>
            </div>
          </div>
        </div>
        {/* Filtros categoría */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 2,
            scrollbarWidth: "none",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: 999,
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.18s",
                whiteSpace: "nowrap",
                flexShrink: 0,
                background:
                  activeFilter === cat
                    ? cat === "Todos"
                      ? "rgba(124,58,237,0.2)"
                      : getCat(cat).bg
                    : "rgba(56,182,255,0.05)",
                border: `1px solid ${
                  activeFilter === cat
                    ? cat === "Todos"
                      ? "rgba(124,58,237,0.45)"
                      : getCat(cat).b
                    : "rgba(56,182,255,0.1)"
                }`,
                color:
                  activeFilter === cat
                    ? cat === "Todos"
                      ? T.purpleL
                      : getCat(cat).c
                    : T.text3,
              }}
            >
              {cat !== "Todos" && (
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: getCat(cat).c,
                    flexShrink: 0,
                  }}
                />
              )}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3 columnas (MODIFICADO: Distribución Proporcional Pro-Centro) ─ */}
      <div
        style={{
          display: "grid",
          // MODIFICADO: ratio dinámico que favorece mucho más al centro y equilibra laterales
          gridTemplateColumns: "210px 1.6fr 1.4fr",
          minHeight: 380,
          overflow: "hidden",
        }}
      >
        {/* Calendario */}
        <div
          style={{
            borderRight: "1px solid rgba(56,182,255,0.08)",
            padding: "14px 12px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <button
              onClick={prevMonth}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.text3,
                padding: 4,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(56,182,255,0.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <ChevronLeft size={14} />
            </button>
            <p
              style={{
                fontFamily: T.display,
                fontWeight: 700,
                fontSize: "0.8125rem",
                color: T.text,
                textAlign: "center",
              }}
            >
              {MONTHS[calMonth]} {calYear}
            </p>
            <button
              onClick={nextMonth}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.text3,
                padding: 4,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(56,182,255,0.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <MonthCalendar
            year={calYear}
            month={calMonth}
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setSelectedEvent(null);
            }}
            eventDates={eventDates}
          />
          {/* Leyenda */}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {[
              {
                icon: (
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: "rgba(124,58,237,0.3)",
                      border: "1px solid rgba(124,58,237,0.5)",
                      display: "inline-block",
                    }}
                  />
                ),
                l: "Día seleccionado",
              },
              {
                icon: (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: T.purpleL,
                      boxShadow: `0 0 4px ${T.purpleL}`,
                      display: "inline-block",
                    }}
                  />
                ),
                l: "Día con eventos",
              },
              {
                icon: (
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: T.purpleL,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: T.mono,
                      fontSize: "0.5rem",
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {new Date().getDate()}
                  </span>
                ),
                l: "Hoy",
              },
            ].map((l, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 7 }}
              >
                {l.icon}
                <span style={{ fontSize: "0.625rem", color: T.text3 }}>
                  {l.l}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lista eventos (COLUMNA FLEXIBLE ANCHA) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid rgba(56,182,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 14px 10px",
              flexShrink: 0,
              borderBottom: "1px solid rgba(56,182,255,0.08)",
            }}
          >
            <p
              style={{
                fontFamily: T.display,
                fontWeight: 800,
                fontSize: "0.9375rem",
                color: T.text,
                lineHeight: 1.25,
                marginBottom: 2,
              }}
            >
              {selectedDateLabel}
            </p>
            <p
              style={{
                fontSize: "0.6875rem",
                color: T.text3,
                fontFamily: T.mono,
              }}
            >
              {dayEvents.length} {dayEvents.length === 1 ? "EVENTO" : "EVENTOS"}
            </p>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {dayEvents.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 10,
                  textAlign: "center",
                  padding: 24,
                }}
              >
                <div style={{ fontSize: 32, opacity: 0.2 }}>🎭</div>
                <p
                  style={{
                    fontFamily: T.display,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: T.text3,
                  }}
                >
                  Sin eventos este día
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: T.text3,
                    lineHeight: 1.5,
                  }}
                >
                  Selecciona otra fecha en el calendario
                </p>
              </div>
            ) : (
              dayEvents.map((ev) => (
                <EventListCard
                  key={ev.id}
                  event={ev}
                  isSelected={selectedEvent?.id === ev.id}
                  onClick={() =>
                    setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Detalle */}
        <div style={{ overflowY: "auto" }}>
          <EventDetail event={selectedEvent} />
        </div>
      </div>

      {/* ── Footer stats ──────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          borderTop: "1px solid rgba(56,182,255,0.08)",
          background: "rgba(0,0,0,0.2)",
          flexShrink: 0,
        }}
      >
        {[
          { val: String(todayCount), label: "EVENTOS HOY", color: T.purpleL },
          { val: String(weekCount), label: "ESTA SEMANA", color: T.pinkL },
          {
            val: String(freeCount),
            label: "EVENTOS GRATUITOS",
            color: T.greenL,
          },
          { val: String(totalCount), label: "TOTAL", color: T.cyanL },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              padding: "10px 16px",
              borderRight: i < 3 ? `1px solid ${T.border}` : "none",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: s.color,
                boxShadow: `0 0 5px ${s.color}`,
                flexShrink: 0,
              }}
            />
            <div>
              <p
                style={{
                  ...T.num,
                  fontSize: "1.125rem",
                  color: s.color,
                  marginBottom: 2,
                }}
              >
                {s.val}
              </p>
              <p
                style={{
                  fontSize: "0.5rem",
                  color: T.text3,
                  fontFamily: T.mono,
                  letterSpacing: "0.07em",
                }}
              >
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes livePing{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.85)}}
      `}</style>
    </div>
  );
};

export default Events;
