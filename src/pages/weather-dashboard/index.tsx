// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Grid from '@cloudscape-design/components/grid';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';
import Alert from '@cloudscape-design/components/alert';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Badge from '@cloudscape-design/components/badge';
import Button from '@cloudscape-design/components/button';
import Icon from '@cloudscape-design/components/icon';
import { Link } from 'react-router-dom';

interface WeatherData {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
  };
}

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
}

// Weather code mappings for Open Meteo API
const weatherCodeMap: {
  [key: number]: { description: string; icon: string; status: 'success' | 'warning' | 'error' | 'info' };
} = {
  0: { description: 'Clear sky', icon: 'status-positive', status: 'success' },
  1: { description: 'Mainly clear', icon: 'status-positive', status: 'success' },
  2: { description: 'Partly cloudy', icon: 'status-info', status: 'info' },
  3: { description: 'Overcast', icon: 'status-warning', status: 'warning' },
  45: { description: 'Fog', icon: 'status-warning', status: 'warning' },
  48: { description: 'Depositing rime fog', icon: 'status-warning', status: 'warning' },
  51: { description: 'Light drizzle', icon: 'status-info', status: 'info' },
  53: { description: 'Moderate drizzle', icon: 'status-info', status: 'info' },
  55: { description: 'Dense drizzle', icon: 'status-warning', status: 'warning' },
  61: { description: 'Slight rain', icon: 'status-info', status: 'info' },
  63: { description: 'Moderate rain', icon: 'status-warning', status: 'warning' },
  65: { description: 'Heavy rain', icon: 'status-error', status: 'error' },
  71: { description: 'Slight snow fall', icon: 'status-info', status: 'info' },
  73: { description: 'Moderate snow fall', icon: 'status-warning', status: 'warning' },
  75: { description: 'Heavy snow fall', icon: 'status-error', status: 'error' },
  80: { description: 'Slight rain showers', icon: 'status-info', status: 'info' },
  81: { description: 'Moderate rain showers', icon: 'status-warning', status: 'warning' },
  82: { description: 'Violent rain showers', icon: 'status-error', status: 'error' },
  95: { description: 'Thunderstorm', icon: 'status-error', status: 'error' },
  96: { description: 'Thunderstorm with slight hail', icon: 'status-error', status: 'error' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'status-error', status: 'error' },
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const getWeatherInfo = (code: number) => {
  return weatherCodeMap[code] || { description: 'Unknown', icon: 'status-info', status: 'info' as const };
};

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      // Default to San Francisco if geolocation is not available
      const defaultLocation = { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco' };
      setLocation(defaultLocation);
      fetchWeatherData(defaultLocation.latitude, defaultLocation.longitude);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;

        // Reverse geocoding to get city name (using a simple approach)
        try {
          const geoResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`,
          );

          if (geoResponse.ok) {
            setLocation({ latitude, longitude, city: 'Current Location' });
            fetchWeatherData(latitude, longitude);
          }
        } catch {
          setLocation({ latitude, longitude, city: 'Current Location' });
          fetchWeatherData(latitude, longitude);
        }
      },
      () => {
        // Default to San Francisco if user denies location
        const defaultLocation = { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco' };
        setLocation(defaultLocation);
        fetchWeatherData(defaultLocation.latitude, defaultLocation.longitude);
      },
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (weatherData && location) {
      setLoading(false);
    }
  }, [weatherData, location]);

  if (loading) {
    return (
      <AppLayout
        navigationHide
        toolsHide
        content={
          <ContentLayout>
            <Container>
              <Box textAlign="center" padding="xl">
                <Spinner size="large" />
                <Box variant="p" padding={{ top: 'm' }}>
                  Loading weather data...
                </Box>
              </Box>
            </Container>
          </ContentLayout>
        }
      />
    );
  }

  if (error || !weatherData || !location) {
    return (
      <AppLayout
        navigationHide
        toolsHide
        content={
          <ContentLayout>
            <Container>
              <Alert type="error" header="Unable to load weather data">
                {error || 'Failed to fetch weather information. Please try again later.'}
                <Box padding={{ top: 'm' }}>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </Box>
              </Alert>
            </Container>
          </ContentLayout>
        }
      />
    );
  }

  const currentWeather = getWeatherInfo(weatherData.current.weather_code);

  return (
    <AppLayout
      navigationHide
      toolsHide
      content={
        <ContentLayout
          header={
            <Header
              variant="h1"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button onClick={() => window.location.reload()} iconName="refresh">
                    Refresh
                  </Button>
                  <Button variant="primary" iconName="external" href="/">
                    Back to Demos
                  </Button>
                </SpaceBetween>
              }
            >
              Weather Dashboard
            </Header>
          }
        >
          <SpaceBetween size="l">
            {/* Current Weather */}
            <Container header={<Header variant="h2">Current Weather - {location.city}</Header>}>
              <ColumnLayout columns={4} variant="text-grid">
                <SpaceBetween size="s">
                  <Box variant="awsui-key-label">Temperature</Box>
                  <Box fontSize="display-l" fontWeight="bold">
                    {Math.round(weatherData.current.temperature_2m)}°C
                  </Box>
                </SpaceBetween>

                <SpaceBetween size="s">
                  <Box variant="awsui-key-label">Conditions</Box>
                  <StatusIndicator type={currentWeather.status}>{currentWeather.description}</StatusIndicator>
                </SpaceBetween>

                <SpaceBetween size="s">
                  <Box variant="awsui-key-label">Humidity</Box>
                  <Box fontSize="heading-m">{weatherData.current.relative_humidity_2m}%</Box>
                </SpaceBetween>

                <SpaceBetween size="s">
                  <Box variant="awsui-key-label">Wind Speed</Box>
                  <Box fontSize="heading-m">{Math.round(weatherData.current.wind_speed_10m)} km/h</Box>
                </SpaceBetween>
              </ColumnLayout>

              <Box padding={{ top: 'm' }} color="text-body-secondary">
                Last updated: {formatTime(weatherData.current.time)}
              </Box>
            </Container>

            {/* 7-Day Forecast */}
            <Container header={<Header variant="h2">7-Day Forecast</Header>}>
              <Grid
                gridDefinition={[
                  { colspan: { default: 12, xs: 6, s: 4, m: 3, l: 2, xl: 2 } },
                  { colspan: { default: 12, xs: 6, s: 4, m: 3, l: 2, xl: 2 } },
                  { colspan: { default: 12, xs: 6, s: 4, m: 3, l: 2, xl: 2 } },
                  { colspan: { default: 12, xs: 6, s: 4, m: 3, l: 2, xl: 2 } },
                  { colspan: { default: 12, xs: 6, s: 4, m: 3, l: 2, xl: 2 } },
                  { colspan: { default: 12, xs: 6, s: 4, m: 3, l: 2, xl: 2 } },
                  { colspan: { default: 12, xs: 6, s: 4, m: 3, l: 2, xl: 2 } },
                ]}
              >
                {weatherData.daily.time.map((date, index) => {
                  const dayWeather = getWeatherInfo(weatherData.daily.weather_code[index]);
                  const isToday = index === 0;

                  return (
                    <Container key={date}>
                      <SpaceBetween size="s">
                        <Box variant="awsui-key-label" textAlign="center">
                          {isToday ? 'Today' : formatDate(date)}
                        </Box>

                        <Box textAlign="center">
                          <StatusIndicator type={dayWeather.status}>{dayWeather.description}</StatusIndicator>
                        </Box>

                        <ColumnLayout columns={2} variant="text-grid">
                          <SpaceBetween size="xs">
                            <Box variant="small" color="text-body-secondary">
                              High
                            </Box>
                            <Box fontSize="heading-s" fontWeight="bold">
                              {Math.round(weatherData.daily.temperature_2m_max[index])}°
                            </Box>
                          </SpaceBetween>

                          <SpaceBetween size="xs">
                            <Box variant="small" color="text-body-secondary">
                              Low
                            </Box>
                            <Box fontSize="heading-s">{Math.round(weatherData.daily.temperature_2m_min[index])}°</Box>
                          </SpaceBetween>
                        </ColumnLayout>

                        {weatherData.daily.precipitation_sum[index] > 0 && (
                          <Box textAlign="center">
                            <Badge color="blue">{weatherData.daily.precipitation_sum[index]}mm rain</Badge>
                          </Box>
                        )}

                        <Box textAlign="center" variant="small" color="text-body-secondary">
                          Wind: {Math.round(weatherData.daily.wind_speed_10m_max[index])} km/h
                        </Box>
                      </SpaceBetween>
                    </Container>
                  );
                })}
              </Grid>
            </Container>

            {/* Weather Details */}
            <Container header={<Header variant="h2">Weather Details</Header>}>
              <ColumnLayout columns={3} variant="text-grid">
                <SpaceBetween size="s">
                  <Box variant="awsui-key-label">Coordinates</Box>
                  <Box>
                    {location.latitude.toFixed(4)}°N, {Math.abs(location.longitude).toFixed(4)}°
                    {location.longitude < 0 ? 'W' : 'E'}
                  </Box>
                </SpaceBetween>

                <SpaceBetween size="s">
                  <Box variant="awsui-key-label">Wind Direction</Box>
                  <Box>{weatherData.current.wind_direction_10m}°</Box>
                </SpaceBetween>

                <SpaceBetween size="s">
                  <Box variant="awsui-key-label">Data Source</Box>
                  <Box>
                    <Button
                      variant="link"
                      iconName="external"
                      iconAlign="right"
                      href="https://open-meteo.com/"
                      target="_blank"
                    >
                      Open Meteo API
                    </Button>
                  </Box>
                </SpaceBetween>
              </ColumnLayout>
            </Container>
          </SpaceBetween>
        </ContentLayout>
      }
    />
  );
}
