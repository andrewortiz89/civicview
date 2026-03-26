// src/services/airQualityService.js
import axios from 'axios'
import { STORAGE_KEYS, CACHE_DURATION } from '../utils/constants'
import { isCacheExpired, getCurrentTimestamp } from '../utils/dateHelpers'
import { getAQICategory } from '../utils/format'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'

class AirQualityService {
  static async getAirQuality() {
    try {
      const cached = this.getFromCache()
      if (cached && !isCacheExpired(cached.timestamp, CACHE_DURATION.AIR_QUALITY)) {
        console.log('💨 Calidad del aire desde caché local')
        return cached
      }

      console.log('💨 Obteniendo calidad del aire desde backend...')
      const { data } = await axios.get(`${BACKEND_URL}/air-quality`, { timeout: 10_000 })

      const result = { ...data, timestamp: getCurrentTimestamp() }
      this.saveToCache(result)
      return result

    } catch (error) {
      console.error('Error fetching air quality:', error)

      const cached = this.getFromCache()
      if (cached) {
        console.warn('⚠️ Usando caché expirado de calidad del aire')
        return { ...cached, isStale: true }
      }

      throw new Error(this.getErrorMessage(error))
    }
  }

  static getPollutantName(code) {
    const names = {
      pm25: 'PM2.5', pm10: 'PM10',
      o3: 'Ozono (O₃)', no2: 'Dióxido de Nitrógeno (NO₂)',
      so2: 'Dióxido de Azufre (SO₂)', co: 'Monóxido de Carbono (CO)',
    }
    return names[code] || code.toUpperCase()
  }

  static getErrorMessage(error) {
    if (!error.response) return 'No hay conexión con el servidor.'
    if (error.response.status === 503) return 'API de calidad del aire no configurada.'
    return 'Error al obtener datos de calidad del aire.'
  }

  static saveToCache(data) {
    try { localStorage.setItem(STORAGE_KEYS.AIR_QUALITY_CACHE, JSON.stringify(data)) } catch {}
  }

  static getFromCache() {
    try {
      const c = localStorage.getItem(STORAGE_KEYS.AIR_QUALITY_CACHE)
      return c ? JSON.parse(c) : null
    } catch { return null }
  }

  static clearCache() {
    try { localStorage.removeItem(STORAGE_KEYS.AIR_QUALITY_CACHE) } catch {}
  }
}

export default AirQualityService