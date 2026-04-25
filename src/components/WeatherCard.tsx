import { format } from 'date-fns';
import { useWeather } from '../hooks/useWeather';
import { LoadingSpinner } from './LoadingSpinner';

interface WeatherCardProps {
  latitude: number;
  longitude: number;
}

export function WeatherCard({ latitude, longitude }: WeatherCardProps) {
  const { data: weather, isLoading, error } = useWeather({ latitude, longitude });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm flex justify-center items-center h-48">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center text-gray-500">
          <p>Unable to load weather data</p>
          <p className="text-sm mt-1">Please check your internet connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
        <h3 className="text-xl font-semibold">Weather Conditions</h3>
      </div>
      
      <div className="p-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img
              src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
              alt={weather.current.description}
              className="w-16 h-16"
            />
            <div>
              <div className="text-3xl font-bold">{Math.round(weather.current.temp)}°C</div>
              <div className="text-gray-600 capitalize">{weather.current.description}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-600">Wind: {weather.current.windSpeed} m/s</div>
            <div className="text-gray-600">Humidity: {weather.current.humidity}%</div>
          </div>
        </div>

        {/* Forecast */}
        <div className="grid grid-cols-3 gap-4 border-t pt-4">
          {(weather.forecast as { date: string; temp: number; description: string; icon: string }[]).map((day) => (
            <div key={day.date} className="text-center">
              <div className="font-medium">{format(new Date(day.date), 'EEE')}</div>
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                alt={day.description}
                className="w-10 h-10 mx-auto"
              />
              <div className="text-2xl my-1">{Math.round(day.temp)}°C</div>
              <div className="text-sm text-gray-600 capitalize">{day.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}