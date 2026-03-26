import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Obtiene el día de la semana actual (0 = Domingo, 1 = Lunes, etc.)
 * @returns {number} Número del día
 */
export const getCurrentDayOfWeek = () => {
  return new Date().getDay();
};

/**
 * Obtiene el día de la semana para mañana
 * @returns {number} Número del día
 */
export const getTomorrowDayOfWeek = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getDay();
};

/**
 * Formatea una fecha a formato legible en español
 * @param {Date|string} date - Fecha a formatear
 * @param {string} formatString - Formato deseado
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, formatString = 'PPP') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: es });
};

/**
 * Formatea hora a formato 12 horas
 * @param {string} time24 - Hora en formato 24h (HH:MM)
 * @returns {string} Hora en formato 12h (h:MM AM/PM)
 */
export const formatTime12Hour = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Obtiene un texto relativo al tiempo transcurrido
 * @param {Date|string} date - Fecha
 * @returns {string} Texto relativo (ej: "hace 5 minutos")
 */
export const getRelativeTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { 
    addSuffix: true, 
    locale: es 
  });
};

/**
 * Verifica si una fecha es hoy
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean}
 */
export const isDateToday = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isToday(dateObj);
};

/**
 * Verifica si una fecha es mañana
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean}
 */
export const isDateTomorrow = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isTomorrow(dateObj);
};

/**
 * Obtiene el nombre del día en español
 * @param {number} dayNumber - Número del día (0-6)
 * @returns {string} Nombre del día
 */
export const getDayName = (dayNumber) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayNumber];
};

/**
 * Obtiene el nombre del día corto en español
 * @param {number} dayNumber - Número del día (0-6)
 * @returns {string} Nombre corto del día
 */
export const getDayNameShort = (dayNumber) => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[dayNumber];
};

/**
 * Obtiene fecha formateada para hoy
 * @returns {string} "Hoy, 15 Oct 2025"
 */
export const getTodayFormatted = () => {
  return `Hoy, ${format(new Date(), 'd MMM yyyy', { locale: es })}`;
};

/**
 * Verifica si el caché está expirado
 * @param {string|number} timestamp - Timestamp del caché
 * @param {number} maxAge - Edad máxima en milisegundos
 * @returns {boolean} True si está expirado
 */
export const isCacheExpired = (timestamp, maxAge) => {
  if (!timestamp) return true;
  const now = Date.now();
  const cacheTime = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  return (now - cacheTime) > maxAge;
};

/**
 * Obtiene timestamp actual
 * @returns {number}
 */
export const getCurrentTimestamp = () => {
  return Date.now();
};

/**
 * Convierte timestamp a objeto Date
 * @param {number|string} timestamp
 * @returns {Date}
 */
export const timestampToDate = (timestamp) => {
  return new Date(timestamp);
};

/**
 * Formatea duración en minutos a texto legible
 * @param {number} minutes - Minutos
 * @returns {string} "1 hora 30 minutos"
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export default {
  getCurrentDayOfWeek,
  getTomorrowDayOfWeek,
  formatDate,
  formatTime12Hour,
  getRelativeTime,
  isDateToday,
  isDateTomorrow,
  getDayName,
  getDayNameShort,
  getTodayFormatted,
  isCacheExpired,
  getCurrentTimestamp,
  timestampToDate,
  formatDuration,
};