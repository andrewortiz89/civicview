/**
 * Utilidades de formato para la aplicación CivicView
 */

/**
 * Formatea temperatura con símbolo de grados
 * @param {number} temp - Temperatura
 * @param {string} unit - Unidad (C o F)
 * @returns {string} Temperatura formateada
 */
export const formatTemperature = (temp, unit = 'C') => {
  return `${Math.round(temp)}°${unit}`;
};

/**
 * Formatea porcentaje
 * @param {number} value - Valor del porcentaje
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value) => {
  return `${Math.round(value)}%`;
};

/**
 * Formatea los dígitos de Pico y Placa
 * @param {string} digits - Dígitos (ej: "5-6")
 * @returns {Array} Array de dígitos individuales
 */
export const formatPicoPlacaDigits = (digits) => {
  if (!digits) return [];
  return digits.split('-').map(d => d.trim());
};

/**
 * Obtiene el color según el valor de AQI
 * @param {number} aqi - Valor del índice de calidad del aire
 * @returns {string} Color en formato hex
 */
export const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#10B981';        // Verde - Bueno
  if (aqi <= 100) return '#F59E0B';       // Amarillo - Moderado
  if (aqi <= 150) return '#FB923C';       // Naranja - Dañino para sensibles
  if (aqi <= 200) return '#EF4444';       // Rojo - Dañino
  if (aqi <= 300) return '#9333EA';       // Morado - Muy dañino
  return '#7C2D12';                       // Marrón - Peligroso
};

/**
 * Obtiene la categoría de AQI según el valor
 * @param {number} aqi - Valor del índice
 * @returns {object} Objeto con label, color, icon, recommendation
 */
export const getAQICategory = (aqi) => {
  if (aqi <= 50) {
    return {
      label: 'Bueno',
      color: '#10B981',
      icon: '😊',
      recommendation: 'Calidad del aire satisfactoria.',
    };
  }
  if (aqi <= 100) {
    return {
      label: 'Moderado',
      color: '#F59E0B',
      icon: '😐',
      recommendation: 'Aceptable para la mayoría.',
    };
  }
  if (aqi <= 150) {
    return {
      label: 'Dañino para grupos sensibles',
      color: '#FB923C',
      icon: '😷',
      recommendation: 'Grupos sensibles deben limitar actividades prolongadas.',
    };
  }
  if (aqi <= 200) {
    return {
      label: 'Dañino',
      color: '#EF4444',
      icon: '😨',
      recommendation: 'Evitar esfuerzos prolongados al aire libre.',
    };
  }
  if (aqi <= 300) {
    return {
      label: 'Muy dañino',
      color: '#9333EA',
      icon: '😱',
      recommendation: 'Permanezca en interiores.',
    };
  }
  return {
    label: 'Peligroso',
    color: '#7C2D12',
    icon: '☠️',
    recommendation: 'Emergencia de salud. Permanezca en interiores.',
  };
};

/**
 * Trunca texto a cierta longitud
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitaliza la primera letra
 * @param {string} text - Texto
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formatea número con separadores de miles
 * @param {number} num - Número
 * @returns {string} Número formateado
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('es-CO').format(num);
};

export default {
  formatTemperature,
  formatPercentage,
  formatPicoPlacaDigits,
  getAQIColor,
  getAQICategory,
  truncateText,
  capitalize,
  formatNumber,
};