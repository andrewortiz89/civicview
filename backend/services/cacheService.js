// backend/services/cacheService.js
import NodeCache from 'node-cache'
import 'dotenv/config'

const TTL = {
  weather:     parseInt(process.env.CACHE_WEATHER_TTL     || '3600'),
  air_quality: parseInt(process.env.CACHE_AIR_QUALITY_TTL || '3600'),
  events:      parseInt(process.env.CACHE_EVENTS_TTL      || '86400'),
  pico_placa:  parseInt(process.env.CACHE_PICO_PLACA_TTL  || '86400'),
}

const memCache = new NodeCache({ stdTTL: TTL.weather, checkperiod: 120, useClones: false })

export async function cacheGet(key) {
  const mem = memCache.get(key)
  if (mem !== undefined) { console.log(`[Cache HIT] ${key}`); return mem }
  console.log(`[Cache MISS] ${key}`)
  return null
}

export async function cacheSet(key, value, type = 'weather') {
  const ttl = TTL[type] || TTL.weather
  memCache.set(key, value, ttl)
}

export async function cacheDel(key) {
  memCache.del(key)
}

export function cacheFlush() {
  memCache.flushAll()
  console.log('[Cache] Limpiado')
}

export function cacheStats() {
  return memCache.getStats()
}

export { TTL as CACHE_TTL }