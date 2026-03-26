// server/services/apiService.js
// Capa de abstracción para llamadas a APIs externas con retry y fallback
import axios from 'axios'
import { query, isDBAvailable } from '../config/database.js'

// ── Instancia Axios compartida ────────────────────────────────────────────────
const http = axios.create({ timeout: 8_000 })

http.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status
    const msg    = err?.message || 'Unknown error'
    console.error(`[API] ${status ?? 'NET'} — ${msg}`)
    return Promise.reject(err)
  },
)

// ── Llamada con reintentos ────────────────────────────────────────────────────
/**
 * Realiza una petición GET con hasta `retries` reintentos.
 * @param {string} url
 * @param {object} params
 * @param {number} retries
 * @returns {Promise<*>} response.data
 */
export async function fetchWithRetry(url, params = {}, retries = 2) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data } = await http.get(url, { params })
      return data
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        const delay = (attempt + 1) * 800
        console.warn(`[API] Reintentando (${attempt + 1}/${retries}) en ${delay}ms…`)
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastError
}

// ── Registrar llamada en api_logs ─────────────────────────────────────────────
export async function logApiCall({ providerId, cityId = 1, endpoint, method = 'GET', statusCode, responseTime, cacheHit = false, errorMessage = null }) {
  if (!(await isDBAvailable())) return
  try {
    await query(
      `INSERT INTO api_logs
         (api_provider_id, city_id, endpoint, method, status_code, response_time, cache_hit, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [providerId, cityId, endpoint, method, statusCode, responseTime, cacheHit, errorMessage],
    )
    // Actualizar contador de uso del proveedor (solo si no fue caché)
    if (!cacheHit && statusCode < 400) {
      await query(
        `UPDATE api_providers
         SET current_usage_day  = current_usage_day  + 1,
             current_usage_hour = current_usage_hour + 1
         WHERE id = ?`,
        [providerId],
      )
    }
  } catch (err) {
    console.warn('[Log API] Error guardando log:', err.message)
  }
}

// ── Obtener proveedor activo por tipo ─────────────────────────────────────────
export async function getActiveProvider(serviceType) {
  if (!(await isDBAvailable())) return null
  try {
    return await query(
      `SELECT * FROM api_providers
       WHERE service_type = ?
         AND is_active = TRUE
         AND current_usage_day  < rate_limit_day
         AND current_usage_hour < rate_limit_hour
       ORDER BY priority ASC
       LIMIT 1`,
      [serviceType],
    )
  } catch {
    return null
  }
}

// ── Resetear contadores horarios (llamar con cron o al iniciar) ───────────────
export async function resetHourlyCounters() {
  if (!(await isDBAvailable())) return
  try {
    await query(
      `UPDATE api_providers
       SET current_usage_hour = 0,
           last_reset = NOW()
       WHERE last_reset < DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
    )
  } catch (err) {
    console.warn('[API] Error reseteando contadores:', err.message)
  }
}

export default http