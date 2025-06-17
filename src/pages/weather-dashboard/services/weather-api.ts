// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { WeatherData, GeocodingResponse, WeatherCodeDescription } from '../types';

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export async function searchCities(query: string): Promise<GeocodingResponse> {
  if (!query.trim()) {
    return { results: [], generationtime_ms: 0 };
  }

  const params = new URLSearchParams({
    name: query.trim(),
    count: '10',
    language: 'en',
    format: 'json',
  });

  const response = await fetch(`${GEOCODING_API_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`);
  }

  return response.json();
}

export async function getWeatherForecast(latitude: number, longitude: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'weather_code',
      'precipitation_sum',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  });

  const response = await fetch(`${WEATHER_API_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  return response.json();
}

// Weather code descriptions based on WMO Weather interpretation codes
export const WEATHER_CODES: Record<number, WeatherCodeDescription> = {
  0: { description: 'Clear sky', icon: 'external' },
  1: { description: 'Mainly clear', icon: 'external' },
  2: { description: 'Partly cloudy', icon: 'upload' },
  3: { description: 'Overcast', icon: 'upload' },
  45: { description: 'Fog', icon: 'upload' },
  48: { description: 'Depositing rime fog', icon: 'upload' },
  51: { description: 'Light drizzle', icon: 'refresh' },
  53: { description: 'Moderate drizzle', icon: 'refresh' },
  55: { description: 'Dense drizzle', icon: 'refresh' },
  56: { description: 'Light freezing drizzle', icon: 'refresh' },
  57: { description: 'Dense freezing drizzle', icon: 'refresh' },
  61: { description: 'Slight rain', icon: 'refresh' },
  63: { description: 'Moderate rain', icon: 'refresh' },
  65: { description: 'Heavy rain', icon: 'refresh' },
  66: { description: 'Light freezing rain', icon: 'refresh' },
  67: { description: 'Heavy freezing rain', icon: 'refresh' },
  71: { description: 'Slight snow fall', icon: 'send' },
  73: { description: 'Moderate snow fall', icon: 'send' },
  75: { description: 'Heavy snow fall', icon: 'send' },
  77: { description: 'Snow grains', icon: 'send' },
  80: { description: 'Slight rain showers', icon: 'refresh' },
  81: { description: 'Moderate rain showers', icon: 'refresh' },
  82: { description: 'Violent rain showers', icon: 'refresh' },
  85: { description: 'Slight snow showers', icon: 'send' },
  86: { description: 'Heavy snow showers', icon: 'send' },
  95: { description: 'Thunderstorm', icon: 'close' },
  96: { description: 'Thunderstorm with slight hail', icon: 'close' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'close' },
};

export function getWeatherDescription(code: number): WeatherCodeDescription {
  return WEATHER_CODES[code] || { description: 'Unknown', icon: 'help' };
}
