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
  0: { description: 'Clear sky', icon: 'sun' },
  1: { description: 'Mainly clear', icon: 'sun' },
  2: { description: 'Partly cloudy', icon: 'cloud-sun' },
  3: { description: 'Overcast', icon: 'cloud' },
  45: { description: 'Fog', icon: 'cloud' },
  48: { description: 'Depositing rime fog', icon: 'cloud' },
  51: { description: 'Light drizzle', icon: 'cloud-drizzle' },
  53: { description: 'Moderate drizzle', icon: 'cloud-drizzle' },
  55: { description: 'Dense drizzle', icon: 'cloud-drizzle' },
  56: { description: 'Light freezing drizzle', icon: 'cloud-snow' },
  57: { description: 'Dense freezing drizzle', icon: 'cloud-snow' },
  61: { description: 'Slight rain', icon: 'cloud-rain' },
  63: { description: 'Moderate rain', icon: 'cloud-rain' },
  65: { description: 'Heavy rain', icon: 'cloud-rain' },
  66: { description: 'Light freezing rain', icon: 'cloud-snow' },
  67: { description: 'Heavy freezing rain', icon: 'cloud-snow' },
  71: { description: 'Slight snow fall', icon: 'cloud-snow' },
  73: { description: 'Moderate snow fall', icon: 'cloud-snow' },
  75: { description: 'Heavy snow fall', icon: 'cloud-snow' },
  77: { description: 'Snow grains', icon: 'cloud-snow' },
  80: { description: 'Slight rain showers', icon: 'cloud-rain' },
  81: { description: 'Moderate rain showers', icon: 'cloud-rain' },
  82: { description: 'Violent rain showers', icon: 'cloud-rain' },
  85: { description: 'Slight snow showers', icon: 'cloud-snow' },
  86: { description: 'Heavy snow showers', icon: 'cloud-snow' },
  95: { description: 'Thunderstorm', icon: 'cloud-lightning' },
  96: { description: 'Thunderstorm with slight hail', icon: 'cloud-lightning' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'cloud-lightning' },
};

export function getWeatherDescription(code: number): WeatherCodeDescription {
  return WEATHER_CODES[code] || { description: 'Unknown', icon: 'help' };
}
