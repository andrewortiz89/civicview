// src/components/common/Button.jsx
// Misma API pública — drop-in replacement.

import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

const VARIANTS = {
  primary: {
    base:  { background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.45)', color: '#a78bfa', boxShadow: '0 4px 14px rgba(124,58,237,0.2)' },
    hover: { background: 'rgba(124,58,237,0.32)', boxShadow: '0 8px 24px rgba(124,58,237,0.35)', transform: 'translateY(-1px)' },
  },
  ghost: {
    base:  { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' },
    hover: { background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.16)' },
  },
  danger: {
    base:  { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' },
    hover: { background: 'rgba(239,68,68,0.18)', borderColor: 'rgba(239,68,68,0.4)' },
  },
  success: {
    base:  { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#4ade80' },
    hover: { background: 'rgba(16,185,129,0.18)', borderColor: 'rgba(16,185,129,0.4)' },
  },
}

const SIZES = {
  sm: { fontSize: '0.75rem',   padding: '0.375rem 0.75rem', gap: 5,  iconSize: 12, borderRadius: 9  },
  md: { fontSize: '0.8125rem', padding: '0.5rem 1.125rem',  gap: 7,  iconSize: 14, borderRadius: 10 },
  lg: { fontSize: '0.9375rem', padding: '0.6875rem 1.5rem', gap: 8,  iconSize: 16, borderRadius: 12 },
}

function Button({
  variant = 'primary', size = 'md', loading = false,
  icon: Icon, iconRight: IconRight,
  fullWidth = false, disabled = false,
  children, className = '', style = {},
  onClick, type = 'button', ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary
  const s = SIZES[size] || SIZES.md
  const isDisabled = disabled || loading

  const handleMouseEnter = (e) => { if (!isDisabled) Object.assign(e.currentTarget.style, v.hover || {}) }
  const handleMouseLeave = (e) => { if (!isDisabled) Object.assign(e.currentTarget.style, { ...v.base, transform: 'translateY(0)' }) }

  return (
    <button
      type={type} disabled={isDisabled} onClick={onClick}
      onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
      className={clsx(className)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, fontSize: s.fontSize, fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
        padding: s.padding, borderRadius: s.borderRadius,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
        whiteSpace: 'nowrap',
        width: fullWidth ? '100%' : 'auto',
        outline: 'none',
        ...v.base, ...style,
      }}
      {...rest}
    >
      {loading ? (
        <Loader2 size={s.iconSize} style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
      ) : (
        Icon && <Icon size={s.iconSize} style={{ flexShrink: 0 }} />
      )}
      {children}
      {!loading && IconRight && <IconRight size={s.iconSize} style={{ flexShrink: 0 }} />}
    </button>
  )
}

export default Button