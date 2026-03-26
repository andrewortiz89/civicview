// src/hooks/useTheme.js
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'civicview_theme'

/**
 * Hook para manejar el tema claro/oscuro
 * - Persiste en localStorage
 * - Aplica data-theme al elemento <html>
 * - Default: 'light'
 */
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Leer preferencia guardada o usar 'light' como default
    try {
      return localStorage.getItem(STORAGE_KEY) || 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    // Aplicar al elemento html
    document.documentElement.setAttribute('data-theme', theme)
    // Persistir
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {}
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const setLight = () => setTheme('light')
  const setDark  = () => setTheme('dark')

  return { theme, toggleTheme, setLight, setDark, isDark: theme === 'dark' }
}

export default useTheme