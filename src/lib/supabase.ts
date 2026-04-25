import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const openWeatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'dummy-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export async function getWeatherData(latitude: number, longitude: number) {
  try {
    if (!openWeatherApiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    // Get current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${openWeatherApiKey}`
    );

    if (!currentResponse.ok) {
      throw new Error(`Failed to fetch current weather: ${currentResponse.statusText}`);
    }

    const currentData = await currentResponse.json();

    // Get forecast data
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${openWeatherApiKey}`
    );

    if (!forecastResponse.ok) {
      throw new Error(`Failed to fetch forecast data: ${forecastResponse.statusText}`);
    }

    const forecastData = await forecastResponse.json();

    // Process forecast data to get daily forecasts
    const dailyForecasts = forecastData.list
      .filter((_item: any, index: number) => index % 8 === 0) // Get one forecast per day
      .slice(0, 3); // Get next 3 days

    return {
      current: {
        temp: currentData.main.temp,
        description: currentData.weather[0].description,
        windSpeed: currentData.wind.speed,
        humidity: currentData.main.humidity,
        icon: currentData.weather[0].icon,
      },
      forecast: dailyForecasts.map((day: any) => ({
        date: new Date(day.dt * 1000).toISOString(),
        temp: day.main.temp,
        description: day.weather[0].description,
        icon: day.weather[0].icon,
      })),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}