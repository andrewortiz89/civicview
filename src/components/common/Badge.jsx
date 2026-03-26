// src/components/common/Badge.jsx


import clsx from 'clsx'

// Colores alineados con tokens Nebula
const VARIANTS = {
  default: { color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.06)',    border: 'rgba(255,255,255,0.1)'    },
  success: { color: '#4ade80',                bg: 'rgba(16,185,129,0.1)',       border: 'rgba(16,185,129,0.28)'    },
  warning: { color: '#fbbf24',                bg: 'rgba(245,158,11,0.1)',       border: 'rgba(245,158,11,0.28)'    },
  error:   { color: '#f87171',                bg: 'rgba(239,68,68,0.1)',        border: 'rgba(239,68,68,0.28)'     },
  info:    { color: '#22d3ee',                bg: 'rgba(6,182,212,0.1)',        border: 'rgba(6,182,212,0.28)'     },
  purple:  { color: '#a78bfa',                bg: 'rgba(124,58,237,0.12)',      border: 'rgba(124,58,237,0.32)'    },
  cyan:    { color: '#22d3ee',                bg: 'rgba(6,182,212,0.1)',        border: 'rgba(6,182,212,0.28)'     },
}

const SIZES = {
  sm: { fontSize: '0.625rem',  padding: '1px 7px',  gap: 4 },
  md: { fontSize: '0.6875rem', padding: '3px 10px', gap: 5 },
}

function Badge({ variant = 'default', size = 'md', dot = false, icon, children, className = '', style = {} }) {
  const v = VARIANTS[variant] || VARIANTS.default
  const s = SIZES[size] || SIZES.md

  return (
    <span
      className={clsx('inline-flex items-center', className)}
      style={{
        gap: s.gap, fontSize: s.fontSize, fontWeight: 700,
        padding: s.padding, borderRadius: 999,
        background: v.bg, border: `1px solid ${v.border}`,
        color: v.color, lineHeight: 1.4, whiteSpace: 'nowrap',
        letterSpacing: '0.04em',
        fontFamily: "'DM Mono', 'JetBrains Mono', monospace",
        ...style,
      }}
    >
      {dot && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: v.color, display: 'inline-block',
          boxShadow: `0 0 5px ${v.color}`,
          flexShrink: 0, animation: 'nbPulse 2s ease-in-out infinite',
        }} />
      )}
      {icon && <span style={{ lineHeight: 1 }}>{icon}</span>}
      {children}
    </span>
  )
}

export default Badge