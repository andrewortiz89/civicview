import { useState, useEffect, useCallback } from "react";
import WeatherService from "../services/weatherService";

/**
 * Hook personalizado para manejar datos del clima
 * @returns {object} Estado y funciones del clima
 */
const useWeather = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWeatherData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const weatherData = await WeatherService.getWeather();
      setData(weatherData);
    } catch (err) {
      setError(err.message || "Error al cargar datos del clima");
      console.error("Error in useWeather:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  /**
   * Refresca los datos del clima
   */
  const refresh = useCallback(() => {
    WeatherService.clearCache();
    loadWeatherData();
  }, [loadWeatherData]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

export default useWeather;
