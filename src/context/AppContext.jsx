// src/context/AppContext.jsx
import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [lastGlobalRefresh, setLastGlobalRefresh] = useState(Date.now())
  const [notifications, setNotifications] = useState([])

  /** Dispara un refresh global — los hooks que lo necesiten pueden escuchar lastGlobalRefresh */
  const triggerRefresh = useCallback(() => {
    setLastGlobalRefresh(Date.now())
  }, [])

  /** Agrega un toast (info | success | warning | error) */
  const addNotification = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, duration)
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <AppContext.Provider
      value={{ lastGlobalRefresh, triggerRefresh, notifications, addNotification, removeNotification }}
    >
      {children}

      {/* ── Toast portal ──────────────────────────────────────────────── */}
      {notifications.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            pointerEvents: 'none',
          }}
        >
          {notifications.map((n) => {
            const palette = {
              info:    { bg: 'rgba(44,142,255,0.15)',  border: 'rgba(44,142,255,0.35)',  accent: '#2C8EFF', icon: 'ℹ' },
              success: { bg: 'rgba(0,245,160,0.12)',   border: 'rgba(0,245,160,0.3)',    accent: '#00F5A0', icon: '✓' },
              warning: { bg: 'rgba(255,184,0,0.12)',   border: 'rgba(255,184,0,0.3)',    accent: '#FFB800', icon: '⚠' },
              error:   { bg: 'rgba(255,68,102,0.12)',  border: 'rgba(255,68,102,0.3)',   accent: '#FF4466', icon: '✕' },
            }
            const c = palette[n.type] || palette.info
            return (
              <div
                key={n.id}
                onClick={() => removeNotification(n.id)}
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
                  pointerEvents: 'auto',
                  maxWidth: 320,
                  cursor: 'pointer',
                }}
              >
                <span style={{ color: c.accent, fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>
                  {c.icon}
                </span>
                <span style={{ lineHeight: 1.4 }}>{n.message}</span>
              </div>
            )
          })}
        </div>
      )}
    </AppContext.Provider>
  )
}

/** Hook para consumir el contexto */
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

export default AppContext