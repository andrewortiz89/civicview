// server/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit'

// ── Opciones comunes ──────────────────────────────────────────────────────────
const commonOptions = {
  standardHeaders: true,   // Envía headers RateLimit-*
  legacyHeaders:   false,
  handler: (req, res) => {
    res.status(429).json({
      error:     'Demasiadas solicitudes. Espera un momento antes de reintentar.',
      code:      'RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('Retry-After'),
    })
  },
}

// ── Limitador general — aplicado a toda la API ────────────────────────────────
export const generalLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max:      200,              // 200 req / 15 min por IP
  message:  'Límite general de solicitudes alcanzado.',
})

// ── Limitador estricto para endpoints que consumen cuota de APIs pagas ─────────
export const apiLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 1000,       // 1 minuto
  max:      30,              // 30 req / min por IP
  skipSuccessfulRequests: false,
})

// ── Limitador muy estricto — solo para forzar refresh / invalidar caché ────────
export const cacheLimiter = rateLimit({
  ...commonOptions,
  windowMs: 5 * 60 * 1000,   // 5 minutos
  max:      5,               // 5 invalidaciones / 5 min
})