// src/services/api.js
// Instancia centralizada de Axios para CivicView
import axios from 'axios'

// ── Instancia base ────────────────────────────────────────────────────────────
const api = axios.create({
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request interceptor — logging en dev ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor — manejo global de errores ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (import.meta.env.DEV) {
      console.error(`[API Error] ${status ?? 'network'} —`, error.message)
    }

    // Mensajes amigables en español
    if (!error.response) {
      error.friendlyMessage = 'Sin conexión a internet. Verifica tu red.'
    } else if (status === 401 || status === 403) {
      error.friendlyMessage = 'API key inválida o sin permisos.'
    } else if (status === 404) {
      error.friendlyMessage = 'Recurso no encontrado.'
    } else if (status === 429) {
      error.friendlyMessage = 'Límite de solicitudes alcanzado. Intenta más tarde.'
    } else if (status >= 500) {
      error.friendlyMessage = 'Error en el servidor. Intenta de nuevo.'
    } else {
      error.friendlyMessage = 'Error inesperado al obtener datos.'
    }

    return Promise.reject(error)
  },
)

export default api

// ── Instancias específicas por proveedor ──────────────────────────────────────

/** OpenWeatherMap */
export const weatherApi = axios.create({
  baseURL: import.meta.env.VITE_OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5',
  timeout: 8_000,
  params: {
    appid: import.meta.env.VITE_OPENWEATHER_API_KEY,
    units: 'metric',
    lang: 'es',
  },
})

/** AQICN — Calidad del aire */
export const aqiApi = axios.create({
  baseURL: import.meta.env.VITE_AQICN_BASE_URL || 'https://api.waqi.info',
  timeout: 8_000,
})

/** Datos Abiertos Bogotá — SOCRATA (sin API key) */
export const socrataApi = axios.create({
  baseURL: 'https://datosabiertos.bogota.gov.co/resource',
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

// Aplicar el mismo interceptor de errores a las instancias específicas
;[weatherApi, aqiApi, socrataApi].forEach((instance) => {
  instance.interceptors.response.use(
    (r) => r,
    (error) => {
      if (!error.response) {
        error.friendlyMessage = 'Sin conexión a internet.'
      } else {
        error.friendlyMessage = `Error ${error.response.status} al obtener datos.`
      }
      return Promise.reject(error)
    },
  )
})