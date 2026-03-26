import React from 'react';
import { Cloud, Droplets, Wind, Eye, Gauge } from 'lucide-react';
import Card from '../common/Card';
import useWeather from '../../hooks/useWeather';
import { formatTemperature, formatPercentage } from '../../utils/format';
import { getRelativeTime } from '../../utils/dateHelpers';


// Mapeo de iconos de clima
const getWeatherIcon = (code) => {
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 20;

  if (code.includes('01')) return isNight ? '🌙' : '☀️'; // Despejado
  if (code.includes('02')) return isNight ? '☁️' : '⛅'; // Parcialmente nublado
  if (code.includes('03') || code.includes('04')) return '☁️'; // Nublado
  if (code.includes('09') || code.includes('10')) return '🌧️'; // Lluvia
  if (code.includes('11')) return '⛈️'; // Tormenta
  if (code.includes('13')) return '🌨️'; // Nieve
  if (code.includes('50')) return '🌫️'; // Neblina
  return '🌤️'; // Default
};

const Weather = () => {
  const { data, loading, error, refresh } = useWeather();

  if (loading) {
    return (
      <Card>
        <Card.Header icon={Cloud} title="Clima" />
        <Card.Loading lines={5} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Header icon={Cloud} title="Clima" />
        <Card.Error message={error} onRetry={refresh} />
      </Card>
    );
  }

  const { current, forecast, city, timestamp, isStale } = data;

  return (
    <Card className="relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50 pointer-events-none" />

      <Card.Header 
        icon={Cloud} 
        title="Clima"
        subtitle={city}
      />

      <Card.Body>
        {/* Alerta si los datos están desactualizados */}
        {isStale && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
            ⚠️ Datos desactualizados. Verifica tu conexión.
          </div>
        )}

        {/* Clima actual - GRANDE */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-2">
            {getWeatherIcon(current.conditionCode)}
          </div>
          <div className="text-5xl font-bold text-gray-900 mb-1">
            {formatTemperature(current.temperature)}
          </div>
          <p className="text-lg text-gray-600 capitalize mb-1">
            {current.condition}
          </p>
          <p className="text-sm text-gray-500">
            Sensación: {formatTemperature(current.feelsLike)}
          </p>
        </div>

        {/* Detalles adicionales */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white/80 p-3 rounded-lg">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Humedad</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatPercentage(current.humidity)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/80 p-3 rounded-lg">
            <Wind className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Viento</p>
              <p className="text-sm font-semibold text-gray-900">
                {current.windSpeed} m/s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/80 p-3 rounded-lg">
            <Eye className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Visibilidad</p>
              <p className="text-sm font-semibold text-gray-900">
                {current.visibility} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/80 p-3 rounded-lg">
            <Gauge className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Presión</p>
              <p className="text-sm font-semibold text-gray-900">
                {current.pressure} hPa
              </p>
            </div>
          </div>
        </div>

        {/* Pronóstico extendido */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Pronóstico próximos días:
          </p>
          <div className="space-y-2">
            {forecast.slice(0, 3).map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white/80 p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getWeatherIcon(day.conditionCode)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {index === 0 ? 'Hoy' : index === 1 ? 'Mañana' : new Date(day.date).toLocaleDateString('es-CO', { weekday: 'short' })}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {day.condition}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatTemperature(day.tempMax)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTemperature(day.tempMin)}
                  </p>
                  {day.pop > 0 && (
                    <p className="text-xs text-blue-600">
                      💧 {formatPercentage(day.pop)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card.Body>

      <Card.Footer 
        timestamp={`Actualizado ${getRelativeTime(new Date(timestamp))}`}
      />
    </Card>
  );
};

export default Weather;