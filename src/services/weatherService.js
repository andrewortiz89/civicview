// src/services/weatherService.js
import axios from 'axios'
import { STORAGE_KEYS, CACHE_DURATION } from '../utils/constants'
import { isCacheExpired, getCurrentTimestamp } from '../utils/dateHelpers'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'

class WeatherService {
  static async getWeather() {
    try {
      // Verificar caché local primero
      const cached = this.getFromCache()
      if (cached && !isCacheExpired(cached.timestamp, CACHE_DURATION.WEATHER)) {
        console.log('☁️ Clima desde caché local')
        return cached
      }

      console.log('☁️ Obteniendo clima desde backend...')
      const { data } = await axios.get(`${BACKEND_URL}/weather`, { timeout: 10_000 })

      // Guardar en caché local
      const result = { ...data, timestamp: getCurrentTimestamp() }
      this.saveToCache(result)
      return result

    } catch (error) {
      console.error('Error fetching weather:', error)

      // Fallback: caché local aunque esté expirado
      const cached = this.getFromCache()
      if (cached) {
        console.warn('⚠️ Usando caché expirado de clima')
        return { ...cached, isStale: true }
      }

      throw new Error(this.getErrorMessage(error))
    }
  }

  static getErrorMessage(error) {
    if (!error.response) return 'No hay conexión con el servidor.'
    if (error.response.status === 503) return 'API de clima no configurada en el servidor.'
    return 'Error al obtener datos del clima.'
  }

  static saveToCache(data) {
    try { localStorage.setItem(STORAGE_KEYS.WEATHER_CACHE, JSON.stringify(data)) } catch {}
  }

  static getFromCache() {
    try {
      const c = localStorage.getItem(STORAGE_KEYS.WEATHER_CACHE)
      return c ? JSON.parse(c) : null
    } catch { return null }
  }

  static clearCache() {
    try { localStorage.removeItem(STORAGE_KEYS.WEATHER_CACHE) } catch {}
  }
}

export default WeatherService