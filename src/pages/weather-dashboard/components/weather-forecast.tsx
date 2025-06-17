// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Grid from '@cloudscape-design/components/grid';
import Header from '@cloudscape-design/components/header';
import Icon from '@cloudscape-design/components/icon';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Toggle from '@cloudscape-design/components/toggle';

import styles from './weather-forecast.module.scss';

import { WeatherData, GeocodingResult } from '../types';
import { getWeatherDescription } from '../services/weather-api';

interface WeatherForecastProps {
  weatherData: WeatherData;
  selectedCity: GeocodingResult;
}

interface DailyForecastItem {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  tempUnit: string;
  precipitationUnit: string;
  windUnit: string;
}

export function WeatherForecast({ weatherData, selectedCity }: WeatherForecastProps) {
  const [isFahrenheit, setIsFahrenheit] = useState(false);

  // Temperature conversion utilities
  const celsiusToFahrenheit = (celsius: number): number => Math.round((celsius * 9) / 5 + 32);
  const convertTemp = (celsius: number): number => (isFahrenheit ? celsiusToFahrenheit(celsius) : Math.round(celsius));
  const getTempUnit = (): string => (isFahrenheit ? '°F' : '°C');

  // Prepare daily forecast data
  const dailyForecast: DailyForecastItem[] = weatherData.daily.time.map((date, index) => {
    const dateObj = new Date(date);
    return {
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: index === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      maxTemp: convertTemp(weatherData.daily.temperature_2m_max[index]),
      minTemp: convertTemp(weatherData.daily.temperature_2m_min[index]),
      weatherCode: weatherData.daily.weather_code[index],
      precipitation: weatherData.daily.precipitation_sum[index],
      windSpeed: Math.round(weatherData.daily.wind_speed_10m_max[index]),
      windDirection: weatherData.daily.wind_direction_10m_dominant[index],
      tempUnit: weatherData.daily_units.temperature_2m_max,
      precipitationUnit: weatherData.daily_units.precipitation_sum,
      windUnit: weatherData.daily_units.wind_speed_10m_max,
    };
  });

  const getWindDirection = (degrees: number): string => {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getWeatherEmoji = (code: number): string => {
    const emojiMap: Record<number, string> = {
      0: '☀️', // Clear sky
      1: '🌤️', // Mainly clear
      2: '⛅', // Partly cloudy
      3: '☁️', // Overcast
      45: '🌫️', // Fog
      48: '🌫️', // Depositing rime fog
      51: '🌦️', // Light drizzle
      53: '🌦️', // Moderate drizzle
      55: '🌧️', // Dense drizzle
      56: '🌨️', // Light freezing drizzle
      57: '🌨️', // Dense freezing drizzle
      61: '🌧️', // Slight rain
      63: '🌧️', // Moderate rain
      65: '⛈️', // Heavy rain
      66: '🌨️', // Light freezing rain
      67: '🌨️', // Heavy freezing rain
      71: '❄️', // Slight snow fall
      73: '🌨️', // Moderate snow fall
      75: '❄️', // Heavy snow fall
      77: '❄️', // Snow grains
      80: '🌦️', // Slight rain showers
      81: '🌧️', // Moderate rain showers
      82: '⛈️', // Violent rain showers
      85: '🌨️', // Slight snow showers
      86: '❄️', // Heavy snow showers
      95: '⛈️', // Thunderstorm
      96: '⛈️', // Thunderstorm with slight hail
      99: '⛈️', // Thunderstorm with heavy hail
    };
    return emojiMap[code] || '🌤️';
  };

  return (
    <SpaceBetween size="l">
      {/* Current Weather */}
      <Container
        header={
          <Header
            variant="h2"
            actions={
              <Toggle
                onChange={({ detail }) => setIsFahrenheit(detail.checked)}
                checked={isFahrenheit}
                description="Switch between Celsius and Fahrenheit"
              >
                {isFahrenheit ? 'Fahrenheit' : 'Celsius'}
              </Toggle>
            }
          >
            Current Weather
          </Header>
        }
      >
        <SpaceBetween size="m">
          <Box variant="h3" color="text-label">
            {selectedCity.name}, {selectedCity.country}
            {selectedCity.admin1 && `, ${selectedCity.admin1}`}
          </Box>

          <Grid
            gridDefinition={[
              { colspan: { default: 12, xs: 12, s: 6, m: 6, l: 4 } },
              { colspan: { default: 12, xs: 12, s: 6, m: 6, l: 8 } },
            ]}
          >
            <div style={{ textAlign: 'center' }}>
              <Box variant="h1" fontSize="display-l">
                {convertTemp(weatherData.current.temperature_2m)}
                {getTempUnit()}
              </Box>
              <SpaceBetween size="xs" direction="horizontal" alignItems="center">
                <Icon name="external" size="medium" />
                <Box variant="p" color="text-label">
                  {getWeatherDescription(weatherData.current.weather_code).description}
                </Box>
              </SpaceBetween>
            </div>

            <KeyValuePairs
              columns={2}
              items={[
                {
                  label: 'Feels like',
                  value: `${convertTemp(weatherData.current.apparent_temperature)}${getTempUnit()}`,
                },
                {
                  label: 'Humidity',
                  value: `${weatherData.current.relative_humidity_2m}${weatherData.current_units.relative_humidity_2m}`,
                },
                {
                  label: 'Wind',
                  value: `${Math.round(weatherData.current.wind_speed_10m)} ${weatherData.current_units.wind_speed_10m} ${getWindDirection(weatherData.current.wind_direction_10m)}`,
                },
                {
                  label: 'Cloud cover',
                  value: `${weatherData.current.cloud_cover}${weatherData.current_units.cloud_cover}`,
                },
                {
                  label: 'Precipitation',
                  value: `${weatherData.current.precipitation} ${weatherData.current_units.precipitation}`,
                },
              ]}
            />
          </Grid>
        </SpaceBetween>
      </Container>

      {/* 7-Day Forecast */}
      <Container header={<Header variant="h2">7-Day Forecast</Header>}>
        <div className={styles['forecast-scroll-container']}>
          <div className={styles['forecast-cards-container']}>
            {dailyForecast.map((item, index) => (
              <div
                key={item.date}
                className={`${styles['weather-card']} ${index === 0 ? styles.today : styles['other-day']}`}
              >
                <div style={{ textAlign: 'center' }}>
                  {/* Day and Date */}
                  <div
                    style={{
                      marginBottom: '16px',
                      opacity: index === 0 ? 1 : 0.9,
                    }}
                  >
                    <Box variant="h4" color={index === 0 ? 'inherit' : 'text-label'}>
                      {item.dayName}
                    </Box>
                    <Box
                      variant="small"
                      color={index === 0 ? 'inherit' : 'text-label'}
                      style={{ opacity: index === 0 ? 0.9 : 0.7 }}
                    >
                      {item.date}
                    </Box>
                  </div>

                  {/* Weather Icon */}
                  <div className={styles['weather-icon']}>{getWeatherEmoji(item.weatherCode)}</div>

                  {/* Temperature */}
                  <div style={{ marginBottom: '12px' }}>
                    <div className={styles['temperature-main']}>
                      {item.maxTemp}
                      {getTempUnit()}
                    </div>
                    <div className={styles['temperature-low']} style={{ opacity: index === 0 ? 0.8 : 0.6 }}>
                      {item.minTemp}
                      {getTempUnit()}
                    </div>
                  </div>

                  {/* Weather Description */}
                  <div className={styles['weather-description']} style={{ opacity: index === 0 ? 0.9 : 0.7 }}>
                    {getWeatherDescription(item.weatherCode).description}
                  </div>

                  {/* Weather Details */}
                  <div className={styles['weather-details']} style={{ opacity: index === 0 ? 0.8 : 0.6 }}>
                    <div className={styles['detail-item']}>
                      💧 {item.precipitation} {item.precipitationUnit}
                    </div>
                    <div className={styles['detail-item']}>
                      💨 {item.windSpeed} {item.windUnit} {getWindDirection(item.windDirection)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </SpaceBetween>
  );
}
