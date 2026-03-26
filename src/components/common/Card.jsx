// src/components/common/Card.jsx
// ── Migrado a sistema Nebula ──────────────────────────────────────────────
// Misma API pública: Card, Card.Header, Card.Body, Card.Footer,
// Card.Loading, Card.Error, Card.Empty — drop-in replacement.

import { AlertCircle, RefreshCw } from "lucide-react";
import clsx from "clsx";

const NB = {
  text2: "rgba(255,255,255,0.55)",
  text3: "rgba(255,255,255,0.28)",
  border: "rgba(255,255,255,0.08)",
  greenL: "#4ade80",
  purpleL: "#a78bfa",
};

const Card = ({
  children,
  className = "",
  variant = "elevated",
  padding = "normal",
  hover = true,
  ...props
}) => (
  <div
    className={clsx(
      "nb-card overflow-hidden",
      hover && "transition-transform",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px 10px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {Icon && (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            flexShrink: 0,
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} style={{ color: NB.purpleL }} />
        </div>
      )}
      <div>
        <h3
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "0.875rem",
            color: "#fff",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            style={{
              fontSize: "0.6875rem",
              color: NB.text3,
              marginTop: 1,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardBody = ({ children, className = "" }) => (
  <div className={clsx("px-5 pb-4", className)}>{children}</div>
);

export const CardFooter = ({ timestamp, action, className = "" }) => (
  <div
    className={clsx("flex items-center justify-between", className)}
    style={{
      padding: "9px 18px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(0,0,0,0.18)",
    }}
  >
    {timestamp && (
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span
          className="nb-live-dot"
          style={{ background: NB.greenL, boxShadow: `0 0 5px ${NB.greenL}` }}
        />
        <p
          style={{
            fontSize: "0.6875rem",
            color: NB.text3,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.06em",
          }}
        >
          {timestamp}
        </p>
      </div>
    )}
    {action && <div>{action}</div>}
  </div>
);

export const CardLoading = ({ lines = 3 }) => (
  <div
    style={{
      padding: "0 18px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}
  >
    <div
      className="nb-skeleton"
      style={{ height: 12, width: "70%", borderRadius: 6 }}
    />
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="nb-skeleton"
        style={{ height: 10, width: `${72 - i * 10}%`, borderRadius: 6 }}
      />
    ))}
  </div>
);

export const CardError = ({
  message = "Error al cargar los datos",
  onRetry,
}) => (
  <div
    style={{
      padding: "0 18px 18px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      paddingTop: 28,
      paddingBottom: 28,
      textAlign: "center",
    }}
  >
    <AlertCircle size={32} style={{ color: "#f87171", opacity: 0.85 }} />
    <p style={{ fontSize: "0.875rem", color: NB.text3 }}>{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          borderRadius: 10,
          cursor: "pointer",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: NB.text2,
          fontSize: "0.8125rem",
        }}
      >
        <RefreshCw size={12} /> Reintentar
      </button>
    )}
  </div>
);

export const CardEmpty = ({
  icon: Icon,
  message = "No hay datos disponibles",
}) => (
  <div
    style={{
      padding: "0 18px 28px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingTop: 28,
      textAlign: "center",
    }}
  >
    {Icon && <Icon size={32} style={{ color: NB.text3, opacity: 0.45 }} />}
    <p style={{ fontSize: "0.875rem", color: NB.text3 }}>{message}</p>
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Loading = CardLoading;
Card.Error = CardError;
Card.Empty = CardEmpty;

export default Card;
