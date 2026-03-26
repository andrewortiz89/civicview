// ============================================
// CONSTANTES DE LA APLICACIÓN CIVICVIEW
// ============================================

// Configuración de la ciudad
export const CITY_CONFIG = {
  name: 'Bogotá',
  country: 'Colombia',
  coordinates: {
    lat: 4.7110,
    lng: -74.0721,
  },
  timezone: 'America/Bogota',
};

// ── Reglas de Pico y Placa 2026 ───────────────────────────────────────────────
// NUEVA NORMA (vigente desde 2025, confirmada 2026):
// La restricción ya NO es por día de la semana sino por PARIDAD DEL DÍA DEL MES.
//   - Días IMPARES del mes  → restringidos dígitos 6, 7, 8, 9, 0
//   - Días PARES del mes    → restringidos dígitos 1, 2, 3, 4, 5
// Horario: lunes a viernes de 06:00 a 21:00 (9:00 p.m.)
// Fuente: Secretaría Distrital de Movilidad — bogota.gov.co (marzo 2026)
export const PICO_PLACA_RULES = {
  // Paridad del día del mes
  ODD:  { digits: '6-7-8-9-0', label: 'Días impares del mes' },
  EVEN: { digits: '1-2-3-4-5', label: 'Días pares del mes'   },
};

// Horario único de restricción (ya no hay dos franjas, es bloque corrido)
export const PICO_PLACA_SCHEDULE = {
  // Vehículos particulares
  particulares: { start: '06:00', end: '21:00' },
  // Taxis y transporte especial (empieza 30 min antes)
  taxis:        { start: '05:30', end: '21:00' },
  // Vehículos de carga (dos franjas cortas)
  carga: {
    morning: { start: '06:00', end: '08:00' },
    evening: { start: '17:00', end: '20:00' },
  },
};

// Días sin restricción (0=Dom, 6=Sáb)
export const PICO_PLACA_FREE_DAYS = [0, 6]; // Sábado y Domingo (para particulares matriculados en Bogotá)

// Vehículos exentos (referencia informativa)
export const PICO_PLACA_EXEMPTIONS = [
  'Vehículos eléctricos e híbridos',
  'Motocicletas',
  'Servicio diplomático',
  'Emergencias y seguridad',
  'Vehículos con 3 o más ocupantes (registrados)',
  'Personas con discapacidad',
  'Transporte escolar',
  'Funerarias',
];

// Categorías de Calidad del Aire
export const AQI_CATEGORIES = {
  GOOD: {
    range: [0, 50],
    label: 'Bueno',
    color: '#10B981',
    icon: '😊',
    recommendation: 'Calidad del aire satisfactoria. Disfruta de actividades al aire libre.',
  },
  MODERATE: {
    range: [51, 100],
    label: 'Moderado',
    color: '#F59E0B',
    icon: '😐',
    recommendation: 'Aceptable para la mayoría. Personas sensibles deben considerar limitar esfuerzos prolongados.',
  },
  UNHEALTHY_SENSITIVE: {
    range: [101, 150],
    label: 'Dañino para grupos sensibles',
    color: '#FB923C',
    icon: '😷',
    recommendation: 'Grupos sensibles deben limitar actividades prolongadas al aire libre.',
  },
  UNHEALTHY: {
    range: [151, 200],
    label: 'Dañino',
    color: '#EF4444',
    icon: '😨',
    recommendation: 'Todos deben evitar esfuerzos prolongados al aire libre.',
  },
  VERY_UNHEALTHY: {
    range: [201, 300],
    label: 'Muy dañino',
    color: '#9333EA',
    icon: '😱',
    recommendation: 'Alerta de salud. Permanezca en interiores.',
  },
  HAZARDOUS: {
    range: [301, 500],
    label: 'Peligroso',
    color: '#7C2D12',
    icon: '☠️',
    recommendation: 'Advertencia de salud de emergencia. Todos deben permanecer en interiores.',
  },
};

// Iconos de clima (códigos de OpenWeatherMap)
export const WEATHER_ICONS = {
  '01d': { icon: '☀️', label: 'Despejado' },
  '01n': { icon: '🌙', label: 'Despejado' },
  '02d': { icon: '⛅', label: 'Parcialmente nublado' },
  '02n': { icon: '☁️', label: 'Parcialmente nublado' },
  '03d': { icon: '☁️', label: 'Nublado' },
  '03n': { icon: '☁️', label: 'Nublado' },
  '04d': { icon: '☁️', label: 'Muy nublado' },
  '04n': { icon: '☁️', label: 'Muy nublado' },
  '09d': { icon: '🌧️', label: 'Lluvia ligera' },
  '09n': { icon: '🌧️', label: 'Lluvia ligera' },
  '10d': { icon: '🌦️', label: 'Lluvia' },
  '10n': { icon: '🌧️', label: 'Lluvia' },
  '11d': { icon: '⛈️', label: 'Tormenta' },
  '11n': { icon: '⛈️', label: 'Tormenta' },
  '13d': { icon: '🌨️', label: 'Nieve' },
  '13n': { icon: '🌨️', label: 'Nieve' },
  '50d': { icon: '🌫️', label: 'Neblina' },
  '50n': { icon: '🌫️', label: 'Neblina' },
};

// Categorías de Puntos de Interés
export const POI_CATEGORIES = {
  ciclovia: { label: 'Ciclovías',         icon: '🚴', color: '#10B981' },
  parque:   { label: 'Parques',           icon: '🌳', color: '#22C55E' },
  biblioteca:{ label: 'Bibliotecas',      icon: '📚', color: '#3B82F6' },
  cultura:  { label: 'Centros Culturales',icon: '🎭', color: '#8B5CF6' },
  museo:    { label: 'Museos',            icon: '🏛️', color: '#F59E0B' },
};

// Configuración de caché (en milisegundos)
export const CACHE_DURATION = {
  WEATHER:     60 * 60 * 1000,          // 1 hora
  AIR_QUALITY: 60 * 60 * 1000,          // 1 hora
  EVENTS:      24 * 60 * 60 * 1000,     // 24 horas
  PICO_PLACA:  24 * 60 * 60 * 1000,     // 24 horas
  MAP_DATA:     7 * 24 * 60 * 60 * 1000,// 7 días
};

// Textos de la aplicación
export const APP_TEXT = {
  appName:      'CivicView',
  appTagline:   'Tu ciudad en un vistazo',
  errorGeneric: 'Algo salió mal. Por favor intenta de nuevo.',
  errorNetwork: 'Error de conexión. Verifica tu internet.',
  errorNotFound:'No se encontraron datos.',
  loading:      'Cargando...',
  retry:        'Reintentar',
};

// Breakpoints responsive (en píxeles)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Límites de APIs (requests por día)
export const API_LIMITS = {
  OPENWEATHER: 1000,
  AQICN:       1000,
  EVENTBRITE:  1000,
};

// LocalStorage keys
export const STORAGE_KEYS = {
  WEATHER_CACHE:     'civicview_weather',
  AIR_QUALITY_CACHE: 'civicview_air_quality',
  EVENTS_CACHE:      'civicview_events',
  PICO_PLACA_CACHE:  'civicview_pico_placa',
  USER_DIGITS:       'civicview_user_digits',
  LAST_UPDATE:       'civicview_last_update',
};

// Configuración del mapa
export const MAP_CONFIG = {
  defaultZoom: 11,
  minZoom:     10,
  maxZoom:     18,
  tileLayer:   'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
};

export default {
  CITY_CONFIG,
  PICO_PLACA_RULES,
  PICO_PLACA_SCHEDULE,
  PICO_PLACA_FREE_DAYS,
  PICO_PLACA_EXEMPTIONS,
  AQI_CATEGORIES,
  WEATHER_ICONS,
  POI_CATEGORIES,
  CACHE_DURATION,
  APP_TEXT,
  BREAKPOINTS,
  API_LIMITS,
  STORAGE_KEYS,
  MAP_CONFIG,
};