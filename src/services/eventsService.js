// src/services/eventsService.js
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'
const CACHE_KEY   = 'civicview_events'
const CACHE_TTL   = 6 * 60 * 60 * 1000  // 6 horas máximo

// ── Caché local con invalidación por día ──────────────────────────────────────
function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, timestamp, cachedDate } = JSON.parse(raw)

    // Invalidar si cambió el día (aunque no hayan pasado 6 horas)
    const today = new Date().toDateString()
    if (cachedDate && cachedDate !== today) {
      console.log('🗓️ Nuevo día — invalidando caché de eventos')
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    // Invalidar si pasaron más de 6 horas
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return data
  } catch {
    return null
  }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
      cachedDate: new Date().toDateString(),  // ← guardar el día
    }))
  } catch {}
}

// ── Obtener eventos desde backend ─────────────────────────────────────────────
export async function getEvents(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCache()
    if (cached) {
      console.log('🎭 Eventos desde caché local')
      return cached
    }
  }

  console.log('🎭 Obteniendo eventos desde backend...')
  const { data } = await axios.get(`${BACKEND_URL}/events`, { timeout: 15_000 })
  const events = data.events || []

  // Log de fuentes para debug
  if (data.sources) {
    console.log(`📊 Fuentes: TM=${data.sources.ticketmaster} Socrata=${data.sources.socrata} Fallback=${data.sources.fallback}`)
  }

  setCache(events)
  return events
}

// ── Helpers de filtrado ───────────────────────────────────────────────────────
export function filterEventsByDate(events, dateStr) {
  if (!dateStr) return events
  return events.filter((e) => e.date === dateStr)
}

export function filterFreeEvents(events) {
  return events.filter((e) => e.isFree)
}

export function groupEventsByDate(events) {
  return events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = []
    acc[event.date].push(event)
    return acc
  }, {})
}

export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
    console.log('🗑️ Caché de eventos limpiado')
  } catch {}
}

export function formatEventDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch { return dateStr }
}

// ── Default export ────────────────────────────────────────────────────────────
const EventsService = {
  getEvents,
  filterEventsByDate,
  filterFreeEvents,
  groupEventsByDate,
  clearCache,
  formatEventDate,
}

export default EventsService