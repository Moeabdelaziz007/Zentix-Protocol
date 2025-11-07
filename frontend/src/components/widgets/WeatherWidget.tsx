import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  city?: string;
  className?: string;
}

export function WeatherWidget({ city = 'San Francisco', className = '' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState({
    temp: 72,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: 'Mon', high: 75, low: 62, icon: 'sun' },
      { day: 'Tue', high: 73, low: 60, icon: 'cloud' },
      { day: 'Wed', high: 70, low: 58, icon: 'rain' },
      { day: 'Thu', high: 72, low: 59, icon: 'sun' },
      { day: 'Fri', high: 74, low: 61, icon: 'cloud' },
    ],
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sun':
      case 'sunny':
        return <Sun className="w-12 h-12 text-yellow-500" />;
      case 'cloud':
      case 'cloudy':
        return <Cloud className="w-12 h-12 text-gray-400" />;
      case 'rain':
      case 'rainy':
        return <CloudRain className="w-12 h-12 text-blue-500" />;
      default:
        return <Cloud className="w-12 h-12 text-gray-400" />;
    }
  };

  return (
    <div className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{weather.temp}°F</h3>
          <p className="text-sm text-muted-foreground">{city}</p>
        </div>
        {getWeatherIcon(weather.condition)}
      </div>

      <p className="text-lg font-medium text-foreground mb-6">{weather.condition}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="text-sm font-semibold text-foreground">{weather.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-muted-foreground">Wind</p>
            <p className="text-sm font-semibold text-foreground">{weather.windSpeed} mph</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">5-Day Forecast</p>
        <div className="flex justify-between">
          {weather.forecast.map((day) => (
            <div key={day.day} className="flex flex-col items-center gap-1">
              <p className="text-xs text-muted-foreground">{day.day}</p>
              <div className="my-1">{getWeatherIcon(day.icon)}</div>
              <p className="text-xs font-semibold text-foreground">{day.high}°</p>
              <p className="text-xs text-muted-foreground">{day.low}°</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}