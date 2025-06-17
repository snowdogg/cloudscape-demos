// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Cards from '@cloudscape-design/components/cards';
import Container from '@cloudscape-design/components/container';
import Grid from '@cloudscape-design/components/grid';
import Header from '@cloudscape-design/components/header';
import Icon from '@cloudscape-design/components/icon';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Toggle from '@cloudscape-design/components/toggle';

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
        <Cards
          ariaLabels={{
            itemSelectionLabel: (e, n) => `Select day ${n.dayName}`,
            selectionGroupLabel: 'Day selection',
          }}
          cardDefinition={{
            header: item => (
              <SpaceBetween size="xs">
                <Box variant="h4">{item.dayName}</Box>
                <Box variant="small" color="text-label">
                  {item.date}
                </Box>
              </SpaceBetween>
            ),
            sections: [
              {
                id: 'weather',
                content: item => (
                  <SpaceBetween size="s" alignItems="center">
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="external" size="large" />
                      <Box variant="small" color="text-label" display="block" margin={{ top: 'xxs' }}>
                        {getWeatherDescription(item.weatherCode).description}
                      </Box>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Box variant="h3">
                        {item.maxTemp}
                        {getTempUnit()}
                      </Box>
                      <Box variant="small" color="text-label">
                        {item.minTemp}
                        {getTempUnit()}
                      </Box>
                    </div>
                  </SpaceBetween>
                ),
              },
              {
                id: 'details',
                content: item => (
                  <KeyValuePairs
                    columns={1}
                    items={[
                      {
                        label: 'Precipitation',
                        value: `${item.precipitation} ${item.precipitationUnit}`,
                      },
                      {
                        label: 'Wind',
                        value: `${item.windSpeed} ${item.windUnit} ${getWindDirection(item.windDirection)}`,
                      },
                    ]}
                  />
                ),
              },
            ],
          }}
          cardsPerRow={[
            { cards: 1, minWidth: 0 },
            { cards: 2, minWidth: 500 },
            { cards: 3, minWidth: 750 },
            { cards: 4, minWidth: 1000 },
            { cards: 7, minWidth: 1400 },
          ]}
          items={dailyForecast}
          trackBy="date"
          visibleSections={['weather', 'details']}
        />
      </Container>
    </SpaceBetween>
  );
}
