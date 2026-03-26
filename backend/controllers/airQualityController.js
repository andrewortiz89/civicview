// server/controllers/airQualityController.js
import { fetchWithRetry, logApiCall } from '../services/apiService.js'
import { cacheGet, cacheSet, cacheDel } from '../services/cacheService.js'
import 'dotenv/config'

const AQICN_KEY  = process.env.AQICN_API_KEY
const AQICN_BASE = 'https://api.waqi.info'
const CACHE_KEY  = 'air_quality:bogota'
const PROVIDER_ID = 3   // id en api_providers

// ── Categorías AQI ────────────────────────────────────────────────────────────
function getAQICategory(aqi) {
  if (aqi <= 50)  return { label: 'Bueno',                     color: '#00F5A0', icon: '😊', recommendation: 'Calidad del aire satisfactoria.' }
  if (aqi <= 100) return { label: 'Moderado',                  color: '#FFB800', icon: '😐', recommendation: 'Aceptable para la mayoría.' }
  if (aqi <= 150) return { label: 'Dañino para grupos sensibles', color: '#FF8C42', icon: '😷', recommendation: 'Grupos sensibles deben limitar actividad exterior.' }
  if (aqi <= 200) return { label: 'Dañino',                    color: '#FF4466', icon: '😨', recommendation: 'Evitar esfuerzos prolongados al aire libre.' }
  if (aqi <= 300) return { label: 'Muy dañino',                color: '#A855F7', icon: '😱', recommendation: 'Permanezca en interiores.' }
  return           { label: 'Peligroso',                       color: '#FF1744', icon: '☠️', recommendation: 'Emergencia. Permanezca en interiores.' }
}

// ── Procesar respuesta AQICN ──────────────────────────────────────────────────
function processAQI(data) {
  const aqi = data.aqi
  const cat = getAQICategory(aqi)

  const pollutants = {}
  const iaqi = data.iaqi || {}
  ;['pm25','pm10','o3','no2','so2','co'].forEach((k) => {
    if (iaqi[k] !== undefined) pollutants[k] = iaqi[k].v
  })

  // Contaminante dominante
  const dominant = data.dominentpol ||
    Object.entries(pollutants).sort(([,a],[,b]) => b - a)[0]?.[0] ||
    'pm25'

  return {
    aqi,
    category:          cat.label,
    color:             cat.color,
    icon:              cat.icon,
    recommendation:    cat.recommendation,
    pollutants,
    dominantPollutant: dominant,
    city:              data.city?.name || 'Bogotá',
    station:           data.city?.name || 'Estación principal',
    time:              data.time?.s   || new Date().toISOString(),
    timestamp:         Date.now(),
  }
}

// ── GET /api/air-quality ──────────────────────────────────────────────────────
export async function getAirQuality(req, res, next) {
  const t0 = Date.now()
  try {
    // 1. Caché
    const cached = await cacheGet(CACHE_KEY)
    if (cached) {
      await logApiCall({ providerId: PROVIDER_ID, endpoint: '/air-quality', statusCode: 200, responseTime: Date.now() - t0, cacheHit: true })
      return res.json({ ...cached, fromCache: true })
    }

    // 2. Validar API key
    if (!AQICN_KEY) {
      return res.status(503).json({ error: 'API key de calidad del aire no configurada', code: 'MISSING_API_KEY' })
    }

    // 3. Llamada a AQICN
    const raw = await fetchWithRetry(`${AQICN_BASE}/feed/bogota/`, { token: AQICN_KEY })

    if (raw.status !== 'ok') {
      throw new Error(`AQICN respondió con status: ${raw.status}`)
    }

    // 4. Procesar y cachear
    const airData = processAQI(raw.data)
    await cacheSet(CACHE_KEY, airData, 'air_quality')

    await logApiCall({ providerId: PROVIDER_ID, endpoint: '/air-quality', statusCode: 200, responseTime: Date.now() - t0 })
    return res.json({ ...airData, fromCache: false })

  } catch (err) {
    const status = err?.response?.status || 500
    await logApiCall({ providerId: PROVIDER_ID, endpoint: '/air-quality', statusCode: status, responseTime: Date.now() - t0, errorMessage: err.message })

    const stale = await cacheGet(`${CACHE_KEY}:stale`)
    if (stale) return res.json({ ...stale, fromCache: true, isStale: true })

    next(err)
  }
}

// ── DELETE /api/air-quality/cache ─────────────────────────────────────────────
export async function clearAirQualityCache(req, res) {
  await cacheDel(CACHE_KEY)
  res.json({ message: 'Caché de calidad del aire eliminado' })
}