// src/services/picoPlacaService.js
// ── Norma vigente: Secretaría Distrital de Movilidad, marzo 2026 ──────────────
//
// LÓGICA ACTUAL (cambio respecto a versiones anteriores):
//   • La restricción YA NO rota por día de la semana (lunes=5-6, martes=7-8…)
//   • Ahora depende de la PARIDAD DEL DÍA DEL MES:
//       Días IMPARES → restringidos: 6, 7, 8, 9, 0
//       Días PARES   → restringidos: 1, 2, 3, 4, 5
//   • Horario: lunes a viernes 06:00–21:00 (bloque corrido, sin franjas)
//   • Sábado y domingo: NO aplica (para vehículos matriculados en Bogotá)
//   • Festivos: NO aplica la medida ordinaria
//     (puede aplicar Pico y Placa Regional en corredores de acceso)
//
// Fuente: bogota.gov.co / Secretaría Distrital de Movilidad (SDM)

import {
  PICO_PLACA_RULES,
  PICO_PLACA_SCHEDULE,
  PICO_PLACA_FREE_DAYS,
  STORAGE_KEYS,
  CACHE_DURATION,
} from '../utils/constants';
import {
  getCurrentTimestamp,
  isCacheExpired,
} from '../utils/dateHelpers';

// ── Helpers internos ──────────────────────────────────────────────────────────

/** Devuelve true si el día del mes (1–31) es impar */
function isDayOdd(date = new Date()) {
  return date.getDate() % 2 !== 0;
}

/** Convierte "HH:MM" a minutos desde medianoche */
function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Devuelve los dígitos RESTRINGIDOS para una fecha dada */
function getRestrictedDigits(date = new Date()) {
  // Fin de semana → sin restricción
  const dow = date.getDay(); // 0=Dom, 6=Sáb
  if (PICO_PLACA_FREE_DAYS.includes(dow)) return null;

  // Entre semana → depende de paridad del día del mes
  return isDayOdd(date)
    ? PICO_PLACA_RULES.ODD.digits   // '6-7-8-9-0'
    : PICO_PLACA_RULES.EVEN.digits; // '1-2-3-4-5'
}

/** Devuelve array con los dígitos restringidos como strings ['6','7','8','9','0'] */
function parseDigits(digitsStr) {
  if (!digitsStr) return [];
  return digitsStr.split('-').map((d) => d.trim());
}

// ── Clase principal ───────────────────────────────────────────────────────────

class PicoPlacaService {
  /**
   * Información de restricción para una fecha arbitraria.
   * @param {Date} date
   * @returns {{ day, dayOfMonth, dayName, restrictedDigits, isRestricted, schedule }}
   */
  static getRestrictionsForDate(date = new Date()) {
    const dow = date.getDay();
    const dayOfMonth = date.getDate();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    // Obtenemos el string original ('6-7-8-9-0' o null)[cite: 11]
    const rawDigits = getRestrictedDigits(date); 
    // Lo parseamos a un array (['6','7','8','9','0'] o [])[cite: 11]
    const restrictedDigitsArray = parseDigits(rawDigits);

    return {
      day:              dow,
      dayOfMonth,
      dayName:          dayNames[dow],
      restrictedDigits: restrictedDigitsArray, // Ahora la UI recibe un array seguro[cite: 11]
      isRestricted:     restrictedDigitsArray.length > 0, // Validamos por la longitud del array[cite: 11]
      parityLabel:      dayOfMonth % 2 !== 0 ? 'Día impar' : 'Día par',
      schedule:         PICO_PLACA_SCHEDULE, //[cite: 11]
      timestamp:        getCurrentTimestamp(), //[cite: 11]
    };
  }
  /** Restricciones para HOY */
  static getTodayRestrictions() {
    return this.getRestrictionsForDate(new Date());
  }

  /** Restricciones para MAÑANA */
  static getTomorrowRestrictions() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getRestrictionsForDate(tomorrow);
  }
/**
 * Genera el calendario para la semana laboral actual (Lunes a Viernes)
 */
static getWeekCalendar() {
  const days = [];
  const startOfWeek = new Date();
  // Ajustar al lunes de la semana actual
  const dayNum = startOfWeek.getDay() || 7;
  startOfWeek.setDate(startOfWeek.getDate() - dayNum + 1);

  for (let i = 0; i < 5; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push(this.getRestrictionsForDate(date));
  }
  return days;
}
  /**
   * ¿Puede circular el vehículo con ese último dígito de placa hoy?
   * @param {string|number} lastDigit  – último dígito de la placa (0-9)
   * @returns {boolean}
   */
  static canCirculateToday(lastDigit) {
    const { restrictedDigits } = this.getTodayRestrictions(); //[cite: 11]
    // Ya es un array, no necesitamos parsearlo de nuevo[cite: 11]
    if (!restrictedDigits || restrictedDigits.length === 0) return true; //[cite: 11]
    return !restrictedDigits.includes(String(lastDigit)); //[cite: 11]
  }

  /**
   * ¿Puede circular el vehículo con ese último dígito de placa mañana?
   * @param {string|number} lastDigit
   * @returns {boolean}
   */
 static canCirculateTomorrow(lastDigit) {
    const { restrictedDigits } = this.getTomorrowRestrictions(); //[cite: 11]
    if (!restrictedDigits || restrictedDigits.length === 0) return true; //[cite: 11]
    return !restrictedDigits.includes(String(lastDigit)); //[cite: 11]
  }

  /**
   * ¿Estamos AHORA en horario de restricción?
   * Aplica solo si hoy es día restringido (lunes–viernes).
   * @returns {boolean}
   */
  static isCurrentlyRestricted() {
    const today = this.getTodayRestrictions();
    if (!today.isRestricted) return false;

    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const start   = timeToMinutes(PICO_PLACA_SCHEDULE.particulares.start); // 06:00
    const end     = timeToMinutes(PICO_PLACA_SCHEDULE.particulares.end);   // 21:00

    return current >= start && current < end;
  }

  /**
   * Devuelve la información completa de Pico y Placa con caché.
   * @returns {Promise<object>}
   */
  static async getPicoPlacaInfo() {
    // 1. Intentar caché
    const cached = this.getFromCache();
    if (cached && !isCacheExpired(cached.timestamp, CACHE_DURATION.PICO_PLACA)) {
      return cached;
    }

    // 2. Calcular (todo local, sin API)
    const today      = this.getTodayRestrictions();
    const tomorrow   = this.getTomorrowRestrictions();
    const isActiveNow = this.isCurrentlyRestricted();

    const data = {
      today,
      tomorrow,
      isActiveNow,
      // Texto de referencia para mostrar al usuario
      normaVigente: 'Secretaría Distrital de Movilidad · 2026',
      horario:      '06:00 – 21:00 (lunes a viernes)',
      timestamp:    getCurrentTimestamp(),
    };

    this.saveToCache(data);
    return data;
  }

  // ── Métodos de dígito del usuario ────────────────────────────────────────────

  static saveUserDigit(digit) {
    try { localStorage.setItem(STORAGE_KEYS.USER_DIGITS, String(digit)); } catch {}
  }

  static getUserDigit() {
    try { return localStorage.getItem(STORAGE_KEYS.USER_DIGITS); } catch { return null; }
  }

  // ── Caché en localStorage ────────────────────────────────────────────────────

  static saveToCache(data) {
    try { localStorage.setItem(STORAGE_KEYS.PICO_PLACA_CACHE, JSON.stringify(data)); } catch {}
  }

  static getFromCache() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PICO_PLACA_CACHE);
      if (!raw) return null;
      const data = JSON.parse(raw);

      // Invalidar si cambió el día del mes (la paridad puede cambiar)
      const cachedDate = new Date(data.timestamp).toDateString();
      if (cachedDate !== new Date().toDateString()) {
        localStorage.removeItem(STORAGE_KEYS.PICO_PLACA_CACHE);
        return null;
      }
      return data;
    } catch { return null; }
  }

  static clearCache() {
    try { localStorage.removeItem(STORAGE_KEYS.PICO_PLACA_CACHE); } catch {}
  }
}

export default PicoPlacaService;