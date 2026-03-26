import { useState, useEffect, useCallback } from "react";
import AirQualityService from "../services/airQualityService";

/**
 * Hook personalizado para manejar datos de calidad del aire
 * @returns {object} Estado y funciones de calidad del aire
 */
const useAirQuality = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAirQualityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const airQualityData = await AirQualityService.getAirQuality();
      setData(airQualityData);
    } catch (err) {
      setError(err.message || "Error al cargar datos de calidad del aire");
      console.error("Error in useAirQuality:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAirQualityData();
  }, [loadAirQualityData]);

  /**
   * Refresca los datos
   */
  const refresh = useCallback(() => {
    AirQualityService.clearCache();
    loadAirQualityData();
  }, [loadAirQualityData]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

export default useAirQuality;
