// server/middleware/errorHandler.js

// ── Mapa de errores conocidos → mensajes amigables en español ─────────────────
const ERROR_MESSAGES = {
  401: 'API key inválida o sin permisos.',
  403: 'Acceso denegado al recurso externo.',
  404: 'Recurso no encontrado.',
  429: 'Límite de solicitudes alcanzado. Intenta en unos minutos.',
  500: 'Error interno del servidor.',
  502: 'Servicio externo no disponible.',
  503: 'Servicio temporalmente fuera de línea.',
  504: 'Tiempo de espera agotado al contactar servicio externo.',
}

// ── Middleware de errores global ──────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isDev  = process.env.NODE_ENV === 'development'
  const status = err?.response?.status || err?.status || 500

  // Construir respuesta
  const response = {
    error:   ERROR_MESSAGES[status] || 'Ocurrió un error inesperado.',
    code:    err?.code   || 'INTERNAL_ERROR',
    path:    req.path,
    timestamp: new Date().toISOString(),
  }

  // Detalles solo en desarrollo
  if (isDev) {
    response.detail  = err.message
    response.stack   = err.stack?.split('\n').slice(0, 5)
  }

  // Log estructurado
  console.error(
    `[Error] ${status} ${req.method} ${req.path} —`,
    err.message,
  )

  res.status(status).json(response)
}

// ── Middleware 404 (ruta no encontrada) ───────────────────────────────────────
export function notFoundHandler(req, res) {
  res.status(404).json({
    error:     `Ruta ${req.method} ${req.path} no existe`,
    code:      'NOT_FOUND',
    timestamp: new Date().toISOString(),
  })
}

// ── Wrapper para controladores async (evita try/catch repetitivo) ─────────────
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}