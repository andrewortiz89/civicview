// server/controllers/weatherController.js
import { fetchWithRetry, logApiCall } from '../services/apiService.js'
import { cacheGet, cacheSet }         from '../services/cacheService.js'
import 'dotenv/config'

const OW_KEY     = process.env.OPENWEATHER_API_KEY
const OW_BASE    = 'https://api.openweathermap.org/data/2.5'
const CITY       = 'Bogota'
const CACHE_KEY  = 'weather:bogota'
const PROVIDER_ID = 1   // id en api_providers

// ── Procesar respuesta de OpenWeatherMap ──────────────────────────────────────
function processWeather(current, forecast) {
  const curr = {
    temperature:   Math.round(current.main.temp),
    feelsLike:     Math.round(current.main.feels_like),
    condition:     current.weather[0].description,
    conditionCode: current.weather[0].icon,
    humidity:      current.main.humidity,
    windSpeed:     current.wind.speed,
    pressure:      current.main.pressure,
    visibility:    +(current.visibility / 1000).toFixed(1),
  }

  // Un dato por día (el más cercano al mediodía)
  const daily = {}
  forecast.list.forEach((item) => {
    const date = new Date(item.dt * 1000)
    const key  = date.toISOString().split('T')[0]
    const hour = date.getHours()
    if (!daily[key] || Math.abs(hour - 12) < Math.abs(daily[key].hour - 12)) {
      daily[key] = {
        date,
        hour,
        temp:     Math.round(item.main.temp),
        tempMin:  Math.round(item.main.temp_min),
        tempMax:  Math.round(item.main.temp_max),
        condition:     item.weather[0].description,
        conditionCode: item.weather[0].icon,
        humidity: item.main.humidity,
        pop:      Math.round((item.pop || 0) * 100),
      }
    }
  })

  return {
    current:   curr,
    forecast:  Object.values(daily).slice(0, 5),
    city:      current.name,
    timestamp: Date.now(),
  }
}

// ── GET /api/weather ──────────────────────────────────────────────────────────
export async function getWeather(req, res, next) {
  const t0 = Date.now()
  try {
    // 1. Verificar caché
    const cached = await cacheGet(CACHE_KEY)
    if (cached) {
      await logApiCall({ providerId: PROVIDER_ID, endpoint: '/weather', statusCode: 200, responseTime: Date.now() - t0, cacheHit: true })
      return res.json({ ...cached, fromCache: true })
    }

    // 2. Validar API key
    if (!OW_KEY) {
      return res.status(503).json({
        error: 'API key de clima no configurada',
        code:  'MISSING_API_KEY',
      })
    }

    // 3. Llamadas paralelas a OpenWeatherMap
    const params = { q: CITY, appid: OW_KEY, units: 'metric', lang: 'es' }
    const [currentData, forecastData] = await Promise.all([
      fetchWithRetry(`${OW_BASE}/weather`,   params),
      fetchWithRetry(`${OW_BASE}/forecast`,  params),
    ])

    // 4. Procesar y cachear
    const weather = processWeather(currentData, forecastData)
    await cacheSet(CACHE_KEY, weather, 'weather')

    await logApiCall({ providerId: PROVIDER_ID, endpoint: '/weather', statusCode: 200, responseTime: Date.now() - t0 })
    return res.json({ ...weather, fromCache: false })

  } catch (err) {
    const status = err?.response?.status || 500
    await logApiCall({ providerId: PROVIDER_ID, endpoint: '/weather', statusCode: status, responseTime: Date.now() - t0, errorMessage: err.message })

    // Fallback: devolver caché expirado si existe
    const stale = await cacheGet(`${CACHE_KEY}:stale`)
    if (stale) return res.json({ ...stale, fromCache: true, isStale: true })

    next(err)
  }
}

// ── DELETE /api/weather/cache ─────────────────────────────────────────────────
export async function clearWeatherCache(req, res) {
  const { cacheDel } = await import('../services/cacheService.js')
  await cacheDel(CACHE_KEY)
  res.json({ message: 'Caché de clima eliminado' })
}