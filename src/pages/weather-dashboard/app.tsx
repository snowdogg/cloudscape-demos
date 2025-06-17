// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';

import { Navigation } from '../commons';
import { CustomAppLayout } from '../commons/common-components';
import { WeatherData, GeocodingResult } from './types';
import { getWeatherForecast } from './services/weather-api';
import { CitySearch } from './components/city-search';
import { WeatherForecast } from './components/weather-forecast';

export function App() {
  const [selectedCity, setSelectedCity] = useState<GeocodingResult | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCitySelect = async (city: GeocodingResult) => {
    setSelectedCity(city);
    setError(null);
    setIsLoading(true);

    try {
      const forecast = await getWeatherForecast(city.latitude, city.longitude);
      setWeatherData(forecast);
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
      setError('Failed to fetch weather data. Please try again.');
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomAppLayout
      content={
        <ContentLayout
          header={
            <Header
              variant="h1"
              description="Search for any city worldwide and get a detailed 7-day weather forecast powered by Open-Meteo API"
            >
              Weather Dashboard
            </Header>
          }
        >
          <SpaceBetween size="l">
            {/* Search Section */}
            <Container>
              <CitySearch onCitySelect={handleCitySelect} isLoading={isLoading} />
            </Container>

            {/* Error State */}
            {error && (
              <Alert type="error" dismissible onDismiss={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Loading State */}
            {isLoading && (
              <Container>
                <Box textAlign="center" padding="l">
                  <SpaceBetween size="s" alignItems="center">
                    <Spinner size="large" />
                    <Box variant="p">Loading weather forecast...</Box>
                  </SpaceBetween>
                </Box>
              </Container>
            )}

            {/* Weather Forecast */}
            {!isLoading && weatherData && selectedCity && (
              <WeatherForecast weatherData={weatherData} selectedCity={selectedCity} />
            )}

            {/* Empty State */}
            {!isLoading && !weatherData && !error && (
              <Container>
                <Box textAlign="center" padding="l" color="text-body-secondary">
                  <SpaceBetween size="s">
                    <Box variant="h3">Get started</Box>
                    <Box variant="p">
                      Search for a city above to view its current weather conditions and 7-day forecast.
                    </Box>
                  </SpaceBetween>
                </Box>
              </Container>
            )}
          </SpaceBetween>
        </ContentLayout>
      }
      navigation={<Navigation activeHref="#" />}
      navigationOpen={false}
      toolsHide={true}
    />
  );
}
