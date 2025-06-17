// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export interface WeatherData {
  latitude: number;
  longitude: number;
  daily: DailyWeather;
  daily_units: DailyUnits;
  current: CurrentWeather;
  current_units: CurrentUnits;
}

export interface DailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_sum: number[];
  wind_speed_10m_max: number[];
  wind_direction_10m_dominant: number[];
}

export interface DailyUnits {
  time: string;
  temperature_2m_max: string;
  temperature_2m_min: string;
  weather_code: string;
  precipitation_sum: string;
  wind_speed_10m_max: string;
  wind_direction_10m_dominant: string;
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  cloud_cover: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
}

export interface CurrentUnits {
  time: string;
  temperature_2m: string;
  relative_humidity_2m: string;
  apparent_temperature: string;
  is_day: string;
  precipitation: string;
  weather_code: string;
  cloud_cover: string;
  wind_speed_10m: string;
  wind_direction_10m: string;
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country_code: string;
  admin1_id?: number;
  admin2_id?: number;
  admin3_id?: number;
  admin4_id?: number;
  timezone: string;
  population?: number;
  postcodes?: string[];
  country_id: number;
  country: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
  generationtime_ms: number;
}

export interface WeatherCodeDescription {
  description: string;
  icon: string;
}
