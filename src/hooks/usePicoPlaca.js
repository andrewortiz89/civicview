import { useState, useEffect } from 'react';
import PicoPlacaService from '../services/picoPlacaService';

/**
 * Hook personalizado para manejar Pico y Placa
 * @returns {object} Estado y funciones de Pico y Placa
 */
const usePicoPlaca = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDigit, setUserDigit] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadPicoPlacaData();
    loadUserDigit();
  }, []);

  /**
   * Carga los datos de Pico y Placa
   */
  const loadPicoPlacaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const picoPlacaData = await PicoPlacaService.getPicoPlacaInfo();
      setData(picoPlacaData);
    } catch (err) {
      setError('Error al cargar información de Pico y Placa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga el dígito guardado del usuario
   */
  const loadUserDigit = () => {
    const savedDigit = PicoPlacaService.getUserDigit();
    setUserDigit(savedDigit);
  };

  /**
   * Guarda el dígito del usuario
   * @param {string} digit - Dígito de la placa (0-9)
   */
  const saveDigit = (digit) => {
    PicoPlacaService.saveUserDigit(digit);
    setUserDigit(digit);
  };

  /**
   * Elimina el dígito guardado
   */
  const clearDigit = () => {
    PicoPlacaService.saveUserDigit(null);
    setUserDigit(null);
  };

  /**
   * Verifica si el usuario puede circular hoy
   * @returns {boolean|null} True si puede, false si no, null si no hay dígito
   */
  const canUserCirculateToday = () => {
    if (!userDigit) return null;
    return PicoPlacaService.canCirculateToday(userDigit);
  };

  /**
   * Verifica si el usuario puede circular mañana
   * @returns {boolean|null} True si puede, false si no, null si no hay dígito
   */
  const canUserCirculateTomorrow = () => {
    if (!userDigit) return null;
    return PicoPlacaService.canCirculateTomorrow(userDigit);
  };

  /**
   * Refresca los datos
   */
  const refresh = () => {
    PicoPlacaService.clearCache();
    loadPicoPlacaData();
  };

  return {
    // Estado
    data,
    loading,
    error,
    userDigit,
    
    // Funciones
    saveDigit,
    clearDigit,
    canUserCirculateToday,
    canUserCirculateTomorrow,
    refresh,
  };
};

export default usePicoPlaca;